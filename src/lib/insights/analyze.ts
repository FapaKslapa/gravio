import { detectBudgets } from "./detectors/budget";
import type { DetectorContext } from "./detectors/context";
import { detectDuplicates, detectFees } from "./detectors/fees-duplicates";
import { detectGrowth } from "./detectors/growth";
import { detectMicro } from "./detectors/micro";
import { detectRecurring } from "./detectors/recurring";
import { detectWeekday } from "./detectors/weekday";
import type {
  Analysis,
  InsightBudget,
  InsightCategory,
  InsightTx,
} from "./insight-types";
import { monthIndex, round2, sum } from "./insight-utils";

export type {
  Analysis,
  Finding,
  FindingKind,
  InsightBudget,
  InsightCategory,
  InsightTx,
} from "./insight-types";
export { isoWeekKey, normalizeDescription } from "./insight-utils";

export function analyzeSpending(input: {
  transactions: InsightTx[];
  budgets: InsightBudget[];
  categories: InsightCategory[];
  now?: Date;
}): Analysis {
  const now = input.now ?? new Date();
  const curM = monthIndex(now);
  const firstM = curM - 5;
  const catName = new Map(input.categories.map((c) => [c.id, c.name]));
  const nameOf = (id: string | null) =>
    (id && catName.get(id)) || "Senza categoria";

  const txs = input.transactions.filter(
    (t) =>
      t.amountEur > 0 &&
      monthIndex(t.date) >= firstM &&
      monthIndex(t.date) <= curM &&
      t.date.getTime() <= now.getTime() + 86_400_000,
  );

  const byMonth = new Map<number, number>();
  for (const t of txs) {
    const m = monthIndex(t.date);
    byMonth.set(m, (byMonth.get(m) ?? 0) + t.amountEur);
  }
  const monthsWithData = byMonth.size;
  const completeMonths = [...byMonth.keys()].filter((m) => m < curM);
  const avgMonthlyExpenseEur =
    completeMonths.length > 0
      ? sum(completeMonths.map((m) => byMonth.get(m) ?? 0)) /
        completeMonths.length
      : (byMonth.get(curM) ?? 0);

  const catMonth = new Map<string, Map<number, number>>();
  for (const t of txs) {
    const key = t.categoryId ?? "__none";
    const mm = catMonth.get(key) ?? new Map<number, number>();
    mm.set(monthIndex(t.date), (mm.get(monthIndex(t.date)) ?? 0) + t.amountEur);
    catMonth.set(key, mm);
  }

  const ctx: DetectorContext = {
    txs,
    budgets: input.budgets,
    now,
    curM,
    lastM: curM - 1,
    firstM,
    byMonth,
    catMonth,
    monthsWithData,
    nameOf,
  };
  const findings = [
    ...detectGrowth(ctx),
    ...detectRecurring(ctx),
    ...detectMicro(ctx),
    ...detectBudgets(ctx),
    ...detectWeekday(ctx),
    ...detectFees(ctx),
    ...detectDuplicates(ctx),
  ];
  findings.sort((a, b) => b.monthlySavingEur - a.monthlySavingEur);

  // Prudent total: best estimate per category, capped to 25% of monthly spend.
  const bestPerKey = new Map<string, number>();
  for (const f of findings) {
    const key = f.categoryId ?? `${f.kind}:${f.title}`;
    bestPerKey.set(key, Math.max(bestPerKey.get(key) ?? 0, f.monthlySavingEur));
  }
  const rawTotal = sum([...bestPerKey.values()]);
  const cap = avgMonthlyExpenseEur * 0.25;
  const totalMonthlySavingEur = round2(
    cap > 0 ? Math.min(rawTotal, cap) : rawTotal,
  );

  return {
    findings,
    monthsWithData,
    avgMonthlyExpenseEur: round2(avgMonthlyExpenseEur),
    totalMonthlySavingEur,
  };
}
