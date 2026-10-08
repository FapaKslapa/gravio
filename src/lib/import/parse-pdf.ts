import {
  itemsToLines,
  type PdfItem,
  type PdfLine,
  parseStatementLines,
} from "./pdf-lines";
import type { ParseResult } from "./types";

export async function parsePdf(file: File | Blob): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  let doc: Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>;
  try {
    doc = await task.promise;
  } catch (e) {
    if (e instanceof Error && e.name === "PasswordException") {
      throw new Error("Il PDF e' protetto da password: rimuovila e riprova.");
    }
    throw new Error("Impossibile leggere il PDF.");
  }

  const lines: PdfLine[] = [];
  let chars = 0;
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items: PdfItem[] = [];
    for (const it of content.items) {
      if (!("str" in it) || !it.str) continue;
      chars += it.str.trim().length;
      items.push({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        width: it.width,
      });
    }
    lines.push(...itemsToLines(items));
  }
  await task.destroy();

  if (chars < 20) {
    return {
      rows: [],
      warnings: [
        "Il PDF non contiene testo (probabile scansione): non e' possibile leggerlo. Scarica dalla banca il PDF originale, il CSV o l'Excel.",
      ],
      source: "pdf",
    };
  }
  const { rows, warnings } = parseStatementLines(lines);
  return { rows, warnings, source: "pdf" };
}
