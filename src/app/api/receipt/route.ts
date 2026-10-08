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
import { ALLOWED, json, KIND, PROMPT, readImage } from "./read-image";

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
