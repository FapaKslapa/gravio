import { type ColumnStats, columnStats } from "./column-stats";
import { cellToString, headerScore, normalizeHeader } from "./header";
import type { Field } from "./keywords";
import { signOf } from "./sign";
import type { Cell, ColumnMapping } from "./types";

const ORDER: Field[] = [
  "date",
  "amount",
  "debit",
  "credit",
  "balance",
  "currency",
  "sign",
  "description",
];

function mapByHeaders(
  normalized: string[],
  mapping: ColumnMapping,
  used: Set<number>,
) {
  for (const field of ORDER) {
    let bestCol = -1;
    let bestScore = 0;
    normalized.forEach((h, i) => {
      if (used.has(i)) return;
      const score = headerScore(field, h);
      if (score > bestScore) {
        bestScore = score;
        bestCol = i;
      }
    });
    if (bestCol >= 0) {
      mapping[field] = bestCol;
      used.add(bestCol);
    }
  }
}

function looksLikeSignColumn(sampleRows: Cell[][], i: number): boolean {
  const values = sampleRows
    .map((r) => r[i])
    .filter((c) => cellToString(c) !== "");
  if (values.length < 2) return false;
  const signs = values.map(signOf);
  return (
    signs.every((v) => v !== 0) &&
    new Set(signs).size >= 1 &&
    new Set(values.map((v) => cellToString(v).toLowerCase())).size <= 4
  );
}

export function suggestMapping(
  headers: Cell[],
  sampleRows: Cell[][],
): ColumnMapping {
  const mapping: ColumnMapping = {
    date: null,
    description: null,
    amount: null,
    debit: null,
    credit: null,
    sign: null,
    currency: null,
    balance: null,
  };
  const used = new Set<number>();
  mapByHeaders(headers.map(normalizeHeader), mapping, used);

  const stats = new Map<number, ColumnStats>();
  const stat = (i: number) => {
    let s = stats.get(i);
    if (!s) {
      s = columnStats(sampleRows, i);
      stats.set(i, s);
    }
    return s;
  };
  const cols = Math.max(headers.length, ...sampleRows.map((r) => r.length), 0);
  const free = () =>
    Array.from({ length: cols }, (_, i) => i).filter((i) => !used.has(i));

  if (mapping.date === null) {
    const c = free()
      .filter((i) => stat(i).dateRatio >= 0.6)
      .sort((a, b) => stat(b).dateRatio - stat(a).dateRatio)[0];
    if (c !== undefined) {
      mapping.date = c;
      used.add(c);
    }
  }
  if (
    mapping.amount === null &&
    mapping.debit === null &&
    mapping.credit === null
  ) {
    const numeric = free().filter(
      (i) => stat(i).amountRatio >= 0.6 && stat(i).filled > 0,
    );
    if (numeric.length > 0) {
      mapping.amount = numeric[0];
      used.add(numeric[0]);
      if (mapping.balance === null && numeric.length > 1) {
        mapping.balance = numeric[numeric.length - 1];
        used.add(numeric[numeric.length - 1]);
      }
    }
  }
  if (mapping.description === null) {
    const c = free()
      .filter((i) => stat(i).textRatio >= 0.5)
      .sort((a, b) => stat(b).avgLen - stat(a).avgLen)[0];
    if (c !== undefined) {
      mapping.description = c;
      used.add(c);
    }
  }
  if (mapping.sign === null) {
    const signCol = free().find((i) => looksLikeSignColumn(sampleRows, i));
    if (signCol !== undefined) {
      mapping.sign = signCol;
      used.add(signCol);
    }
  }
  if (
    mapping.amount !== null &&
    mapping.debit !== null &&
    mapping.credit !== null
  ) {
    mapping.amount = null;
  }
  return mapping;
}
