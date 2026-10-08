import type { ParseResult } from "./types";

export { suggestCategory } from "./categorize";
export { markDuplicates } from "./dedupe";
export { applyMapping, suggestMapping } from "./detect-columns";
export { parseAmount, parseDate } from "./numbers-dates";
export type {
  Cell,
  ColumnMapping,
  ParseResult,
  RawRow,
  StatementTable,
} from "./types";

async function sniff(file: File): Promise<"pdf" | "xlsx" | "csv"> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46
  )
    return "pdf";
  if (head[0] === 0x50 && head[1] === 0x4b) return "xlsx";
  return "csv";
}

export async function parseStatement(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  let kind: "pdf" | "xlsx" | "csv";
  if (name.endsWith(".pdf") || type === "application/pdf") kind = "pdf";
  else if (name.endsWith(".xlsx") || type.includes("spreadsheetml"))
    kind = "xlsx";
  else if (
    name.endsWith(".xls") ||
    (type === "application/vnd.ms-excel" && !name.endsWith(".csv"))
  ) {
    throw new Error(
      "Il formato .xls non e' supportato: salva il file come .xlsx o CSV.",
    );
  } else if (
    name.endsWith(".csv") ||
    name.endsWith(".txt") ||
    type.startsWith("text/")
  )
    kind = "csv";
  else kind = await sniff(file);

  if (kind === "pdf") return (await import("./parse-pdf")).parsePdf(file);
  if (kind === "xlsx") return (await import("./parse-xlsx")).parseXlsx(file);
  return (await import("./parse-csv")).parseCsv(file);
}
