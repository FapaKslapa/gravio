import { cn, formatCurrency } from "@/lib/utils";

export type MonthTrend = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: { payload: MonthTrend }[];
  displayCurrency: string;
};

export function TrendTooltip({
  active,
  payload,
  displayCurrency,
}: TooltipProps) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  const rows = [
    { label: "Entrate", value: d.income, dot: "bg-income" },
    { label: "Uscite", value: d.expense, dot: "bg-expense" },
    { label: "Risparmio", value: d.savings, dot: "bg-brand" },
  ];
  return (
    <div
      role="status"
      className="elevation-2 flex min-w-40 flex-col gap-1.5 rounded-md bg-popover p-3 text-popover-foreground"
    >
      <span className="text-xs font-semibold">{d.label}</span>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className={cn("size-2 rounded-full", r.dot)} aria-hidden />
            {r.label}
          </span>
          <span className="font-semibold tabular">
            {formatCurrency(r.value, displayCurrency)}
          </span>
        </div>
      ))}
    </div>
  );
}
