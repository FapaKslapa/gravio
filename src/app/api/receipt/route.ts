import { db } from "@/db";
import { auth } from "@/lib/auth";
import { type ReceiptData, receiptSchema } from "@/lib/schemas/receipt";
import {
  AiLimitError,
  AiParseError,
  AiQuotaError,
  AiTimeoutError,
  AiUnavailableError,
  consumeAiQuota,
  refundAiQuota,
  runModelJson,
} from "@/server/ai";

const MAX_BYTES = 4 * 1024 * 1024;
const KIND = "receipt";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const PROMPT = `Sei un lettore di scontrini. Analizza la foto e rispondi SOLO con un oggetto JSON, senza testo aggiuntivo, con questa forma:
{"merchant": string (nome del negozio), "date": "YYYY-MM-DD" oppure null se non leggibile, "total": numero (totale pagato, punto decimale, senza simbolo di valuta), "currency": codice ISO a 3 lettere (EUR, NOK, USD...), "items": [{"description": string, "amount": numero}] (al massimo 30 righe principali), "categoryHint": una sola parola italiana che indica il tipo di spesa (es. spesa, ristorante, carburante, farmacia)}.
Se la foto non e' uno scontrino o il totale non e' leggibile, rispondi {"total": null}.`;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function readImage(req: Request): Promise<{ mime: string; b64: string }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const file = (await req.formData()).get("image");
    if (!(file instanceof File)) throw new Error("missing");
    if (file.size > MAX_BYTES) throw new RangeError("size");
    return { mime: file.type, b64: toBase64(await file.arrayBuffer()) };
  }
  const body = (await req.json()) as { image?: unknown };
  const m =
    typeof body.image === "string"
      ? /^data:(image\/[a-z+]+);base64,([\s\S]+)$/.exec(body.image)
      : null;
  if (!m) throw new Error("missing");
  if ((m[2].length * 3) / 4 > MAX_BYTES) throw new RangeError("size");
  return { mime: m[1], b64: m[2] };
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return json(
      { error: "unauthorized", message: "Accedi per continuare." },
      401,
    );
  }

  let image: { mime: string; b64: string };
  try {
    image = await readImage(req);
  } catch (e) {
    if (e instanceof RangeError) {
      return json(
        {
          error: "too_large",
          message: "La foto supera i 4 MB. Riprova con una piu' piccola.",
        },
        413,
      );
    }
    return json(
      { error: "bad_request", message: "Nessuna immagine ricevuta." },
      400,
    );
  }
  if (!ALLOWED.has(image.mime)) {
    return json(
      {
        error: "bad_type",
        message: "Formato non supportato. Usa JPEG, PNG o WebP.",
      },
      415,
    );
  }

  const userId = session.user.id;
  try {
    await consumeAiQuota(db, userId, KIND);
  } catch (e) {
    if (e instanceof AiLimitError) {
      return json({ error: "limit", message: e.message }, 429);
    }
    throw e;
  }

  try {
    const raw = await runModelJson({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.mime};base64,${image.b64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      maxTokens: 1500,
    });
    const parsed = receiptSchema.safeParse(raw);
    if (!parsed.success) {
      await refundAiQuota(db, userId, KIND).catch(() => {});
      return json(
        {
          error: "unreadable",
          message:
            "Non riesco a leggere lo scontrino. Prova con una foto piu' nitida o inserisci a mano.",
        },
        422,
      );
    }
    const receipt: ReceiptData = parsed.data;
    return json({ receipt });
  } catch (e) {
    await refundAiQuota(db, userId, KIND).catch(() => {});
    if (e instanceof AiQuotaError) {
      return json({ error: "quota", message: e.message }, 429);
    }
    if (e instanceof AiParseError) {
      return json(
        {
          error: "unreadable",
          message:
            "Non riesco a leggere lo scontrino. Prova con una foto piu' nitida o inserisci a mano.",
        },
        422,
      );
    }
    if (e instanceof AiTimeoutError || e instanceof AiUnavailableError) {
      return json({ error: "unavailable", message: e.message }, 503);
    }
    return json(
      { error: "unknown", message: "Qualcosa e' andato storto. Riprova." },
      500,
    );
  }
}
