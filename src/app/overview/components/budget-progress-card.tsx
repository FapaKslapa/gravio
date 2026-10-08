"use client";

import dayjs from "dayjs";
import {
  AlertTriangle,
  CheckCircle2,
  OctagonAlert,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Counter } from "./counter";
import { MonthStrip } from "./month-strip";
import { StatsGrid } from "./stats-grid";

type BudgetProgressCardProps = {
  totalIncome: number;
  totalExpense: number;
  targetBudgetVal: number;
  maxBudgetVal: number;
  displayCurrency: string;
  monthExpenses: { date: Date | string; amountEur: string }[];
  convertCurrency: (val: number, from: string, to: string) => number;
  onOpenSettings: () => void;
};

export function BudgetProgressCard({
  totalIncome,
  totalExpense,
  targetBudgetVal,
  maxBudgetVal,
  displayCurrency,
  monthExpenses,
  convertCurrency,
  onOpenSettings,
}: BudgetProgressCardProps) {
  const now = dayjs();
  const daysInMonth = now.daysInMonth();
  const dayOfMonth = now.date();
  const daysLeft = daysInMonth - dayOfMonth + 1;

  const hasBudget = maxBudgetVal > 0 || targetBudgetVal > 0;
  const limit = maxBudgetVal > 0 ? maxBudgetVal : targetBudgetVal;
  const remaining = limit - totalExpense;
  const isOverMax = hasBudget && totalExpense > limit;
  const isOverTarget = targetBudgetVal > 0 && totalExpense > targetBudgetVal;
  const perDay = remaining > 0 ? remaining / daysLeft : 0;
  const allowed = hasBudget ? limit / daysInMonth : null;

  const daily = Array.from({ length: daysInMonth }, () => 0);
  for (const t of monthExpenses) {
    const d = dayjs(t.date).date();
    daily[d - 1] += convertCurrency(
      parseFloat(t.amountEur),
      "EUR",
      displayCurrency,
    );
  }

  const status = isOverMax
    ? { label: "Oltre budget", Icon: OctagonAlert }
    : isOverTarget
      ? { label: "Attenzione", Icon: AlertTriangle }
      : { label: "In linea", Icon: CheckCircle2 };

  return (
    <section
      aria-label="Budget del mese"
      className="flex h-full flex-col gap-6 rounded-xl bg-brand p-5 text-brand-foreground md:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        {hasBudget ? (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-foreground/15 px-3.5 text-sm font-semibold">
            <status.Icon className="size-4" aria-hidden="true" />
            {status.label}
          </span>
        ) : (
          <span className="text-sm font-semibold">Budget del mese</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full text-brand-foreground hover:bg-brand-foreground/15 hover:text-brand-foreground"
          onClick={onOpenSettings}
          aria-label="Imposta budget"
        >
          <Settings2 />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-balance text-[clamp(2.25rem,10.5vw,3.5rem)] leading-[1.02] font-light tracking-[-0.03em] md:text-6xl xl:text-7xl">
          {!hasBudget ? (
            <>
              Questo mese hai speso{" "}
              <Counter value={totalExpense} currency={displayCurrency} />
            </>
          ) : isOverMax ? (
            <>
              Hai sforato di{" "}
              <Counter value={-remaining} currency={displayCurrency} />
            </>
          ) : (
            <>
              Ti restano{" "}
              <Counter value={remaining} currency={displayCurrency} /> per{" "}
              <span className="tabular font-bold">{daysLeft}</span>{" "}
              {daysLeft === 1 ? "giorno" : "giorni"}
            </>
          )}
        </h2>
        {!hasBudget ? (
          <div>
            <Button
              className="h-11 rounded-full bg-brand-foreground px-5 text-brand hover:bg-brand-foreground/90"
              onClick={onOpenSettings}
            >
              <Settings2 data-icon="inline-start" />
              Imposta un budget
            </Button>
          </div>
        ) : (
          <p className="tabular text-lg font-medium md:text-xl">
            {isOverMax
              ? `su un limite di ${formatCurrency(limit, displayCurrency)}`
              : `cioè ${formatCurrency(perDay, displayCurrency)} al giorno`}
          </p>
        )}
      </div>

      <MonthStrip
        daily={daily}
        today={dayOfMonth}
        allowed={allowed}
        displayCurrency={displayCurrency}
      />

      <StatsGrid
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        displayCurrency={displayCurrency}
      />
    </section>
  );
}
