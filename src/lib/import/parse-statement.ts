import { parseDate } from "./numbers-dates";
import { type Columns, detectColumns } from "./pdf-columns";
import type { PdfLine } from "./pdf-items";
import { NOISE, takeDate } from "./pdf-patterns";
import {
  appendContinuation,
  finalizeRow,
  type Pending,
  startPending,
} from "./pdf-row";
import { statementWarnings } from "./pdf-warnings";
import type { RawRow } from "./types";

function mostCommonYear(lines: PdfLine[]): number | undefined {
  const yearCounts = new Map<number, number>();
  for (const l of lines) {
    for (const m of l.text.matchAll(/\b(20\d{2}|19\d{2})\b/g)) {
      const y = +m[1];
      yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1);
    }
  }
  return [...yearCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function parseStatementLines(
  lines: PdfLine[],
  nowYear = new Date().getFullYear(),
): { rows: RawRow[]; warnings: string[] } {
  const topYear = mostCommonYear(lines);
  const defaultYear = topYear ?? nowYear;
  let yearGuessed = false;

  let columns: Columns = {};
  let hasBalance = false;
  const rows: RawRow[] = [];
  let cur: Pending | null = null;
  let estimatedSigns = 0;
  let dropped = 0;

  const flush = () => {
    if (!cur) return;
    const { row, estimated } = finalizeRow(cur, columns);
    if (row) {
      rows.push(row);
      if (estimated) estimatedSigns++;
    } else {
      dropped++;
    }
    cur = null;
  };

  for (const line of lines) {
    const text = line.text;
    if (!text) continue;

    const cols = detectColumns(line);
    if (cols) {
      columns = cols;
      if (cols.balance) hasBalance = true;
      flush();
      continue;
    }

    const d = takeDate(text);
    if (d && parseDate(d.raw, { defaultYear }) && !NOISE.test(text)) {
      flush();
      if (
        !/\d{4}|[a-z]{3}.*\d{4}/i.test(d.raw) &&
        !/\d[./-]\d{1,2}[./-]\d{2}$/.test(d.raw)
      ) {
        yearGuessed = yearGuessed || topYear === undefined;
      }
      cur = startPending(line, d, columns, hasBalance, defaultYear);
      continue;
    }

    if (!cur || NOISE.test(text)) {
      if (NOISE.test(text)) flush();
      continue;
    }
    appendContinuation(cur, text);
  }
  flush();

  return {
    rows,
    warnings: statementWarnings({
      dropped,
      estimatedSigns,
      rows,
      hasDebitColumn: columns.debit !== undefined,
      yearGuessed,
      defaultYear,
    }),
  };
}
