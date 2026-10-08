export type RawRow = {
  date: string;
  description: string;
  amount: number;
  currency?: string;
  balance?: number;
};

export type ColumnMapping = {
  date: number | null;
  description: number | null;
  amount: number | null;
  debit: number | null;
  credit: number | null;
  sign: number | null;
  currency: number | null;
  balance: number | null;
};

export type StatementTable = {
  headers: string[];
  rows: string[][];
  mapping: ColumnMapping;
};

export type ParseResult = {
  rows: RawRow[];
  warnings: string[];
  source: "csv" | "xlsx" | "pdf";
  table?: StatementTable;
};

export type Cell = string | number | boolean | Date | null | undefined;
