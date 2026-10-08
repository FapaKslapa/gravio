"use client";

import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnalyticsLineChart } from "./analytics-line-chart";

type Transaction = {
  date: Date | string;
  type: string;
  amountEur: string;
  amountNok: string;
};

type OverviewAnalyticsCardProps = {
  transactions: Transaction[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  className?: string;
};

export function OverviewAnalyticsCard({
  transactions,
  displayCurrency,
  convertCurrency,
  className,
}: OverviewAnalyticsCardProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = dayjs().subtract(11 - i, "month");
    const monthStart = m.startOf("month");
    const monthEnd = m.endOf("month");

    const monthTx = transactions.filter((t) => {
      const d = dayjs(t.date);
      return d.isAfter(monthStart) && d.isBefore(monthEnd);
    });

    let incomeEur = 0;
    let expenseEur = 0;
    for (const t of monthTx) {
      const val = parseFloat(t.amountEur);
      if (t.type === "income") {
        incomeEur += val;
      } else if (t.type === "expense") {
        expenseEur += val;
      }
    }

    const income = convertCurrency(incomeEur, "EUR", displayCurrency);
    const expense = convertCurrency(expenseEur, "EUR", displayCurrency);
    const savings = income - expense;

    return {
      label: m.format("MMM"),
      income,
      expense,
      savings,
    };
  });

  const maxVal = Math.max(
    ...months.map((m) => Math.max(m.income, m.expense)),
    1000,
  );

  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Andamento
        </CardTitle>
        <CardDescription>Entrate e spese degli ultimi 12 mesi</CardDescription>
        <ul className="flex items-center gap-4 pt-1 text-xs font-medium">
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-income" />
            Entrate
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full border-t-2 border-dashed border-expense" />
            Spese
          </li>
        </ul>
      </CardHeader>

      <CardContent className="min-h-52 flex-1">
        <AnalyticsLineChart
          months={months}
          maxVal={maxVal}
          displayCurrency={displayCurrency}
        />
      </CardContent>
    </Card>
  );
}
