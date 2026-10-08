export const MAX_BYTES = 4 * 1024 * 1024;
export const KIND = "receipt";
export const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export const PROMPT = `Sei un lettore di scontrini. Analizza la foto e rispondi SOLO con un oggetto JSON, senza testo aggiuntivo, con questa forma:
{"merchant": string (nome del negozio), "date": "YYYY-MM-DD" oppure null se non leggibile, "total": numero (totale pagato, punto decimale, senza simbolo di valuta), "currency": codice ISO a 3 lettere (EUR, NOK, USD...), "items": [{"description": string, "amount": numero}] (al massimo 30 righe principali), "categoryHint": una sola parola italiana che indica il tipo di spesa (es. spesa, ristorante, carburante, farmacia)}.
Se la foto non e' uno scontrino o il totale non e' leggibile, rispondi {"total": null}.`;

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

export async function readImage(
  req: Request,
): Promise<{ mime: string; b64: string }> {
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
