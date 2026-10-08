import { cellToString } from "./header";
import { parseAmount, parseDate } from "./numbers-dates";
import type { Cell } from "./types";

export type ColumnStats = {
  dateRatio: number;
  amountRatio: number;
  filled: number;
  avgLen: number;
  textRatio: number;
};

export function columnStats(rows: Cell[][], col: number): ColumnStats {
  let filled = 0;
  let dates = 0;
  let amounts = 0;
  let text = 0;
  let len = 0;
  for (const r of rows) {
    const c = r[col];
    const s = cellToString(c);
    if (!s) continue;
    filled++;
    len += s.length;
    const isDate =
      c instanceof Date || parseDate(s, { defaultYear: 2000 }) !== null;
    if (isDate && !/^-?\d+([.,]\d+)?$/.test(s)) dates++;
    else if (parseAmount(c as string | number) !== null) amounts++;
    else text++;
  }
  const d = filled || 1;
  return {
    dateRatio: dates / d,
    amountRatio: amounts / d,
    filled,
    avgLen: len / d,
    textRatio: text / d,
  };
}
