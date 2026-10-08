"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatsGridProps = {
  totalIncome: number;
  totalExpense: number;
  displayCurrency: string;
};

export function StatsGrid({
  totalIncome,
  totalExpense,
  displayCurrency,
}: StatsGridProps) {
  return (
    <dl className="grid grid-cols-2 gap-4 border-t border-brand-foreground/25 pt-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="flex items-center gap-1.5 text-sm">
          <ArrowDownLeft className="size-4 shrink-0" aria-hidden="true" />
          Entrate
        </dt>
        <dd className="num-display tabular text-xl font-bold md:text-2xl">
          {formatCurrency(totalIncome, displayCurrency)}
        </dd>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="flex items-center gap-1.5 text-sm">
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
          Uscite
        </dt>
        <dd className="num-display tabular text-xl font-bold md:text-2xl">
          {formatCurrency(totalExpense, displayCurrency)}
        </dd>
      </div>
    </dl>
  );
}
