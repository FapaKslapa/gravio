import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/lib/utils";
import type { MonthData } from "./line-chart-utils";

export function LineChartTooltip({
  month,
  index,
  pos,
  displayCurrency,
}: {
  month: MonthData;
  index: number;
  pos: { x: number; y: number };
  displayCurrency: string;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="elevation-2 pointer-events-none fixed z-[9999] flex min-w-44 flex-col gap-1.5 rounded-md bg-popover px-3 py-2.5 text-xs text-popover-foreground"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, calc(-100% - 12px))",
      }}
    >
      <span className="font-semibold capitalize">
        {dayjs()
          .subtract(11 - index, "month")
          .format("MMMM YYYY")}
      </span>
      <div className="tabular flex items-center justify-between gap-4 text-income">
        <span className="flex items-center gap-1">
          <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          Entrate
        </span>
        <span className="font-semibold">
          {formatCurrency(month.income, displayCurrency)}
        </span>
      </div>
      <div className="tabular flex items-center justify-between gap-4 text-expense">
        <span className="flex items-center gap-1">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          Spese
        </span>
        <span className="font-semibold">
          {formatCurrency(month.expense, displayCurrency)}
        </span>
      </div>
      <div className="tabular flex items-center justify-between gap-4 border-t pt-1.5">
        <span className="flex items-center gap-1">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          Risparmio
        </span>
        <span
          className={
            month.savings >= 0
              ? "font-semibold text-income"
              : "font-semibold text-expense"
          }
        >
          {formatCurrency(month.savings, displayCurrency)}
        </span>
      </div>
    </div>,
    document.body,
  );
}
