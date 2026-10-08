import { cellToString } from "./header";
import { parseAmount, parseDate } from "./numbers-dates";
import { signOf } from "./sign";
import type { Cell, ColumnMapping, RawRow } from "./types";

export type ApplyMappingOptions = {
  dayFirst?: boolean;
  defaultCurrency?: string;
};

export function applyMapping(
  rows: Cell[][],
  mapping: ColumnMapping,
  opts: ApplyMappingOptions = {},
): RawRow[] {
  const out: RawRow[] = [];
  if (mapping.date === null) return out;
  const get = (r: Cell[], i: number | null): Cell => (i === null ? null : r[i]);

  for (const r of rows) {
    const date = parseDate(get(r, mapping.date) as string | number | Date, {
      dayFirst: opts.dayFirst,
    });
    if (!date) continue;

    let amount: number | null = null;
    if (mapping.amount !== null) {
      amount = parseAmount(get(r, mapping.amount) as string | number);
    }
    if (
      amount === null &&
      (mapping.debit !== null || mapping.credit !== null)
    ) {
      const debit = parseAmount(get(r, mapping.debit) as string | number);
      const credit = parseAmount(get(r, mapping.credit) as string | number);
      if (debit !== null || credit !== null) {
        amount =
          (credit ? Math.abs(credit) : 0) - (debit ? Math.abs(debit) : 0);
      }
    }
    if (amount === null || amount === 0) continue;
    if (mapping.sign !== null && mapping.amount !== null) {
      const dir = signOf(get(r, mapping.sign));
      if (dir !== 0) amount = dir * Math.abs(amount);
    }

    const description = cellToString(get(r, mapping.description))
      .replace(/\s+/g, " ")
      .trim();
    const row: RawRow = { date, description, amount: round2(amount) };
    const currency = cellToString(get(r, mapping.currency)).toUpperCase();
    if (/^[A-Z]{3}$/.test(currency)) row.currency = currency;
    else if (opts.defaultCurrency) row.currency = opts.defaultCurrency;
    const balance = parseAmount(get(r, mapping.balance) as string | number);
    if (balance !== null) row.balance = balance;
    out.push(row);
  }
  return out;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
