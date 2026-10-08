"use client";

import dayjs from "dayjs";
import { BudgetCardHeader, BudgetHeadline } from "./budget-card-parts";
import { buildDailySpend } from "./budget-daily";
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

  const daily = buildDailySpend(
    daysInMonth,
    monthExpenses,
    convertCurrency,
    displayCurrency,
  );

  return (
    <section
      aria-label="Budget del mese"
      className="flex h-full flex-col gap-6 rounded-xl bg-brand p-5 text-brand-foreground md:p-8"
    >
      <BudgetCardHeader
        hasBudget={hasBudget}
        isOverMax={isOverMax}
        isOverTarget={isOverTarget}
        onOpenSettings={onOpenSettings}
      />

      <BudgetHeadline
        hasBudget={hasBudget}
        isOverMax={isOverMax}
        totalExpense={totalExpense}
        remaining={remaining}
        daysLeft={daysLeft}
        limit={limit}
        perDay={perDay}
        displayCurrency={displayCurrency}
        onOpenSettings={onOpenSettings}
      />

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
