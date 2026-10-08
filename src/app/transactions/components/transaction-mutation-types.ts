export type SaveTxPayload = {
  id?: string;
  description: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
};

export type CsvImportRow = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeRateNok: number;
  description: string;
  categoryId: string | null;
  date: string;
};
