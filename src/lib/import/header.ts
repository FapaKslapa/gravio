import { DATE_LIKE_HEADER, type Field, KEYWORDS } from "./keywords";
import { dateToIso, stripAccents } from "./numbers-dates";
import type { Cell } from "./types";

export function normalizeHeader(h: Cell): string {
  return stripAccents(cellToString(h))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function cellToString(c: Cell): string {
  if (c === null || c === undefined) return "";
  if (c instanceof Date) return dateToIso(c) ?? "";
  return String(c).trim();
}

export function headerScore(field: Field, header: string): number {
  if (!header) return 0;
  const kw = KEYWORDS[field];
  if (
    field !== "date" &&
    field !== "currency" &&
    DATE_LIKE_HEADER.test(header)
  ) {
    return 0;
  }
  if (
    field === "date" &&
    /\b(valuta|value)\b/.test(header) &&
    header !== "data valuta"
  ) {
    return 0;
  }
  if (kw.exact.includes(header)) return 10;
  const tokens = new Set(header.split(" "));
  if (kw.words.some((w) => tokens.has(w))) return 5;
  return 0;
}

export function headerRowScore(row: Cell[]): number {
  let hits = 0;
  const fields = Object.keys(KEYWORDS) as Field[];
  for (const cell of row) {
    const h = normalizeHeader(cell);
    if (!h || h.length > 40) continue;
    if (fields.some((f) => headerScore(f, h) > 0)) hits++;
  }
  return hits;
}

export function findHeaderRow(table: Cell[][]): number {
  let best = -1;
  let bestScore = 1;
  const limit = Math.min(table.length, 40);
  for (let i = 0; i < limit; i++) {
    const score = headerRowScore(table[i]);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}
