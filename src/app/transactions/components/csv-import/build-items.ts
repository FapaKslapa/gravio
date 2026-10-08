import dayjs from "dayjs";
import {
  markDuplicates,
  type ParseResult,
  suggestCategory,
} from "@/lib/import";
import type { ImportRow, PreviewItem } from "./csv-import-types";

type HistoryRow = {
  date: Date | string;
  amount: string | number;
  description: string | null;
  categoryId: string | null;
};

export function buildPreviewItems(
  rows: ParseResult["rows"],
  history: HistoryRow[] | undefined,
): PreviewItem[] {
  const existing = (history ?? []).map((t) => ({
    date: dayjs(t.date).format("YYYY-MM-DD"),
    amount: Number(t.amount),
    description: t.description ?? "",
  }));
  const hist = (history ?? []).map((t) => ({
    description: t.description ?? "",
    categoryId: t.categoryId,
  }));
  return markDuplicates(rows, existing).map((r, id) => ({
    id,
    date: r.date,
    description: r.description,
    amount: r.amount,
    currency: r.currency ?? "EUR",
    duplicate: r.duplicate,
    categoryId: suggestCategory(r.description, hist),
    selected: !r.duplicate,
  }));
}

export function toImportRows(
  items: PreviewItem[],
  rates: Record<string, number>,
): ImportRow[] {
  const nokRate = rates.NOK ?? 11.85;
  return items
    .filter((i) => i.selected)
    .map((i) => ({
      type: i.amount < 0 ? "expense" : "income",
      amount: Math.abs(i.amount),
      currency: i.currency,
      exchangeRate: rates[i.currency] ?? 1,
      exchangeRateNok: nokRate,
      description: i.description || "Movimento importato",
      categoryId: i.categoryId,
      date: dayjs(i.date).toISOString(),
    }));
}
