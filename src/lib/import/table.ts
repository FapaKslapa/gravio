import {
  applyMapping,
  cellToString,
  findHeaderRow,
  suggestMapping,
} from "./detect-columns";
import type { Cell, ParseResult } from "./types";

export function tableToResult(
  table: Cell[][],
  source: "csv" | "xlsx",
): ParseResult {
  const warnings: string[] = [];
  const cleaned = table.filter((r) => r.some((c) => cellToString(c) !== ""));
  if (cleaned.length === 0) {
    return { rows: [], warnings: ["Il file e' vuoto."], source };
  }
  const headerIdx = findHeaderRow(cleaned);
  const headerRow = headerIdx >= 0 ? cleaned[headerIdx] : null;
  const body = cleaned.slice(headerIdx + 1);
  const width = Math.max(...cleaned.map((r) => r.length));
  const headers = headerRow
    ? Array.from(
        { length: width },
        (_, i) => cellToString(headerRow[i]) || `Colonna ${i + 1}`,
      )
    : Array.from({ length: width }, (_, i) => `Colonna ${i + 1}`);
  if (!headerRow)
    warnings.push(
      "Intestazione non riconosciuta: colonne dedotte dal contenuto.",
    );

  const mapping = suggestMapping(headers, body.slice(0, 50));
  if (mapping.date === null)
    warnings.push("Colonna data non trovata: scegli la mappatura manualmente.");
  if (
    mapping.amount === null &&
    mapping.debit === null &&
    mapping.credit === null
  ) {
    warnings.push(
      "Colonna importo non trovata: scegli la mappatura manualmente.",
    );
  }
  const rows = applyMapping(body, mapping);
  const skipped = body.length - rows.length;
  if (skipped > 0 && rows.length > 0) {
    warnings.push(`${skipped} righe ignorate (senza data o importo valido).`);
  }
  if (rows.length === 0 && body.length > 0 && warnings.length === 0) {
    warnings.push("Nessuna riga valida trovata.");
  }
  return {
    rows,
    warnings,
    source,
    table: {
      headers,
      rows: body.map((r) =>
        Array.from({ length: width }, (_, i) => cellToString(r[i])),
      ),
      mapping,
    },
  };
}
