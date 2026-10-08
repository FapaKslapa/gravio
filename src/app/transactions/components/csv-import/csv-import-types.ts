import type { ColumnMapping } from "@/lib/import";

export type ImportCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type ImportRow = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeRateNok: number;
  description: string;
  categoryId: string | null;
  date: string;
};

export type ExistingTransaction = {
  date: Date | string;
  amount: string | number;
  description: string | null;
};

export type HistoryTransaction = {
  description: string | null;
  categoryId: string | null;
};

export type PreviewItem = {
  id: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  duplicate: boolean;
  categoryId: string | null;
  selected: boolean;
};

export type MappingField = Exclude<keyof ColumnMapping, "balance">;

export const KIND_LABEL = {
  csv: "CSV",
  xlsx: "Excel",
  pdf: "PDF",
} as const;
