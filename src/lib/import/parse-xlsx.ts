import { tableToResult } from "./table";
import type { Cell, ParseResult } from "./types";

export async function parseXlsx(file: File | Blob): Promise<ParseResult> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  const sheet = sheets.find((s) =>
    s.data.some((r) => r.some((c) => c !== null && String(c).trim() !== "")),
  );
  if (!sheet)
    return {
      rows: [],
      warnings: ["Il foglio Excel e' vuoto."],
      source: "xlsx",
    };
  const result = tableToResult(sheet.data as Cell[][], "xlsx");
  if (sheets.length > 1)
    result.warnings.push(
      `Letto il foglio "${sheet.sheet}" (il file ne contiene ${sheets.length}).`,
    );
  return result;
}
