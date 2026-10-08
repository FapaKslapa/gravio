import type { InsightBudget, InsightTx } from "../insight-types";

export type DetectorContext = {
  txs: InsightTx[];
  budgets: InsightBudget[];
  now: Date;
  curM: number;
  lastM: number;
  firstM: number;
  byMonth: Map<number, number>;
  catMonth: Map<string, Map<number, number>>;
  monthsWithData: number;
  nameOf: (id: string | null) => string;
};

export const idOf = (key: string) => (key === "__none" ? null : key);
