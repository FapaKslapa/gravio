import type { PreviewItem } from "./csv-import-types";

export function summarize(items: PreviewItem[]) {
  const selected = items.filter((i) => i.selected);
  const totals = new Map<string, { income: number; expense: number }>();
  for (const i of selected) {
    const t = totals.get(i.currency) ?? { income: 0, expense: 0 };
    if (i.amount >= 0) t.income += i.amount;
    else t.expense += Math.abs(i.amount);
    totals.set(i.currency, t);
  }
  return { count: selected.length, totals: [...totals.entries()] };
}
