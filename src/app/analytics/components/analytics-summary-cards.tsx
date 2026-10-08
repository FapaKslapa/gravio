"use client";

import { ArrowDownLeft, ArrowUpRight, Minus, PiggyBank } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type AnalyticsSummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  prevIncome: number;
  prevExpense: number;
  prevSavings: number;
  displayCurrency: string;
};

function Delta({
  current,
  previous,
  goodWhenUp,
}: {
  current: number;
  previous: number;
  goodWhenUp: boolean;
}) {
  if (previous === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        Nessun confronto col mese scorso
      </span>
    );
  }
  const rounded = Math.round(((current - previous) / Math.abs(previous)) * 100);
  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" aria-hidden />
        Invariato vs mese scorso
      </span>
    );
  }
  const up = rounded > 0;
  const good = up === goodWhenUp;
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1 text-xs font-semibold tabular",
        good ? "text-income" : "text-expense",
      )}
    >
      {up ? (
        <ArrowUpRight className="size-3.5" aria-hidden />
      ) : (
        <ArrowDownLeft className="size-3.5" aria-hidden />
      )}
      {up ? "+" : ""}
      {rounded}%
      <span className="font-normal text-muted-foreground">vs mese scorso</span>
    </span>
  );
}

export function AnalyticsSummaryCards({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  prevIncome,
  prevExpense,
  prevSavings,
  displayCurrency,
}: AnalyticsSummaryCardsProps) {
  const positive = netSavings >= 0;

  return (
    <section
      aria-label="Riepilogo del mese"
      className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3"
    >
      <div className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4 md:p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-income-soft text-income">
            <ArrowDownLeft className="size-4" aria-hidden />
          </span>
          Entrate
        </div>
        <p className="num-display font-display text-xl font-bold tracking-tight md:text-2xl">
          {formatCurrency(totalIncome, displayCurrency)}
        </p>
        <Delta current={totalIncome} previous={prevIncome} goodWhenUp />
      </div>

      <div className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4 md:p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-expense-soft text-expense">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
          Uscite
        </div>
        <p className="num-display font-display text-xl font-bold tracking-tight md:text-2xl">
          {formatCurrency(totalExpense, displayCurrency)}
        </p>
        <Delta
          current={totalExpense}
          previous={prevExpense}
          goodWhenUp={false}
        />
      </div>

      <div className="elevation-1 col-span-2 flex flex-col gap-3 rounded-lg bg-card p-4 md:p-5 xl:col-span-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              positive
                ? "bg-income-soft text-income"
                : "bg-expense-soft text-expense",
            )}
          >
            <PiggyBank className="size-4" aria-hidden />
          </span>
          Risparmio
          <span
            className={cn(
              "ml-auto rounded-full px-2.5 py-1 text-xs font-semibold tabular",
              positive
                ? "bg-income-soft text-income"
                : "bg-expense-soft text-expense",
            )}
          >
            {positive ? `Tasso ${savingsRate.toFixed(0)}%` : "In perdita"}
          </span>
        </div>
        <p
          className={cn(
            "num-display font-display text-2xl font-bold tracking-tight md:text-3xl",
            positive ? "text-income" : "text-expense",
          )}
        >
          {positive ? "+" : ""}
          {formatCurrency(netSavings, displayCurrency)}
        </p>
        <Delta current={netSavings} previous={prevSavings} goodWhenUp />
      </div>
    </section>
  );
}
