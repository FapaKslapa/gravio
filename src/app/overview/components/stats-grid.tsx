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
    <dl className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1 rounded-lg bg-income-soft p-3.5">
        <dt className="flex items-center gap-1.5 text-xs font-semibold text-income">
          <ArrowDownLeft className="size-4" aria-hidden="true" />
          Entrate
        </dt>
        <dd className="num-display tabular truncate text-xl font-bold text-income md:text-2xl">
          {formatCurrency(totalIncome, displayCurrency)}
        </dd>
      </div>
      <div className="flex flex-col gap-1 rounded-lg bg-expense-soft p-3.5">
        <dt className="flex items-center gap-1.5 text-xs font-semibold text-expense">
          <ArrowUpRight className="size-4" aria-hidden="true" />
          Uscite
        </dt>
        <dd className="num-display tabular truncate text-xl font-bold text-expense md:text-2xl">
          {formatCurrency(totalExpense, displayCurrency)}
        </dd>
      </div>
    </dl>
  );
}
