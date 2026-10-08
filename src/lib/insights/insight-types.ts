export type InsightTx = {
  id: string;
  categoryId: string | null;
  /** Always a positive expense amount, already normalised to EUR. */
  amountEur: number;
  date: Date;
  description: string | null;
};

export type InsightBudget = { categoryId: string; amountEur: number };
export type InsightCategory = { id: string; name: string };

export type FindingKind =
  | "growth"
  | "recurring"
  | "micro"
  | "budget_over"
  | "budget_pace"
  | "weekday"
  | "fees"
  | "duplicate";

export type Finding = {
  kind: FindingKind;
  categoryId: string | null;
  title: string;
  detail: string;
  monthlySavingEur: number;
  evidence: Record<string, number | string>;
};

export type Analysis = {
  findings: Finding[];
  monthsWithData: number;
  avgMonthlyExpenseEur: number;
  totalMonthlySavingEur: number;
};
