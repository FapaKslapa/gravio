import { formatCurrency } from "@/lib/utils";
import { type Goal, getGoalProgress } from "../goals-helpers";

export function GoalsSummary({ goals }: { goals: Goal[] }) {
  const currencies = new Set(goals.map((g) => g.currency));
  const currency = goals[0]?.currency ?? "EUR";
  const uniform = currencies.size === 1;
  const saved = goals.reduce((sum, g) => sum + g.saved, 0);
  const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const percent =
    target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const achievedCount = goals.filter((g) => getGoalProgress(g).achieved).length;
  const lateCount = goals.filter(
    (g) => getGoalProgress(g).status === "late",
  ).length;

  return (
    <section
      aria-label="Riepilogo obiettivi"
      className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4"
    >
      {uniform ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="tabular font-display text-2xl font-bold tracking-[-0.025em]">
              {formatCurrency(saved, currency)}
            </p>
            <p className="tabular text-sm text-muted-foreground">
              su {formatCurrency(target, currency)} ({percent}%)
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Risparmio complessivo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {goals.length} {goals.length === 1 ? "obiettivo" : "obiettivi"}
        {achievedCount > 0 && ` · ${achievedCount} raggiunti`}
        {lateCount > 0 && ` · ${lateCount} in ritardo`}
      </p>
    </section>
  );
}
