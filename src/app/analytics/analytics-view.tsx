"use client";

import { useQuery } from "@tanstack/react-query";
import { m } from "motion/react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { fadeUp } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";
import { AnalyticsHeader } from "./components/analytics-header";
import { AnalyticsSummaryCards } from "./components/analytics-summary-cards";
import { CategoryBreakdown } from "./components/category-breakdown";
import { MONTH_SHORT } from "./components/months";
import { RecentLogs } from "./components/recent-logs";
import { SpendingCalendarCard } from "./components/spending-calendar-card";
import { TrendCard } from "./components/trend-card";

export default function AnalyticsView() {
  const { displayCurrency, convertCurrency } = useDashboard();

  const trpc = useTRPC();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    trpc.transaction.list.queryOptions(),
  );

  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (isCategoriesLoading || isTransactionsLoading) {
    return <LoadingState />;
  }

  const rawTxs = transactionsData || [];
  const transactions = rawTxs.map((t) => ({
    ...t,
    type: t.type as "expense" | "income",
    currency: t.currency,
  }));
  const categories = categoriesData || [];

  const convertNokAmount = (nokVal: string | number) =>
    convertCurrency(
      typeof nokVal === "string" ? parseFloat(nokVal) || 0 : nokVal,
      "NOK",
      displayCurrency,
    );

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dailyExpensesMap: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyExpensesMap[d] = 0;
  }
  for (const t of monthTransactions) {
    if (t.type === "expense") {
      const day = new Date(t.date).getDate();
      dailyExpensesMap[day] =
        (dailyExpensesMap[day] || 0) + convertNokAmount(t.amountNok);
    }
  }

  const maxDailyExpense = Math.max(...Object.values(dailyExpensesMap), 1);

  const categoryExpensesMap: Record<
    string,
    { amount: number; color: string; name: string; icon: string }
  > = {};

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  for (const t of monthTransactions) {
    if (t.type === "expense") {
      const catId = t.categoryId || "uncategorized";
      const amount = convertNokAmount(t.amountNok);

      if (!categoryExpensesMap[catId]) {
        const dbCat = categoriesMap.get(catId);
        categoryExpensesMap[catId] = {
          amount: 0,
          color: dbCat?.color || "#8e8e93",
          name: dbCat?.name || "Altro/Senza Categoria",
          icon: dbCat?.icon || "HelpCircle",
        };
      }
      categoryExpensesMap[catId].amount += amount;
    }
  }

  const categoryExpenses = Object.entries(categoryExpensesMap)
    .map(([id, info]) => ({
      id,
      ...info,
      percentage: totalExpense > 0 ? (info.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const last6MonthsData = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }

    const mTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const inc = mTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    const exp = mTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    last6MonthsData.push({
      label: `${MONTH_SHORT[m]} ${y.toString().slice(-2)}`,
      income: inc,
      expense: exp,
      savings: inc - exp,
    });
  }

  const prevMonthData = last6MonthsData[last6MonthsData.length - 2];
  const prevIncome = prevMonthData?.income ?? 0;
  const prevExpense = prevMonthData?.expense ?? 0;
  const prevSavings = prevMonthData?.savings ?? 0;

  const timelineTransactions = selectedDay
    ? monthTransactions.filter(
        (t) => new Date(t.date).getDate() === selectedDay,
      )
    : monthTransactions;

  const sortedTimeline = timelineTransactions.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectMonth = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <m.div
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 pb-28 text-foreground md:gap-6 md:px-8 md:pb-12"
    >
      <m.div variants={fadeUp} custom={0}>
        <AnalyticsHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectMonth={handleSelectMonth}
        />
      </m.div>

      <m.div variants={fadeUp} custom={1}>
        <AnalyticsSummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netSavings={netSavings}
          savingsRate={savingsRate}
          prevIncome={prevIncome}
          prevExpense={prevExpense}
          prevSavings={prevSavings}
          displayCurrency={displayCurrency}
        />
      </m.div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-12">
        <m.div variants={fadeUp} custom={2} className="xl:col-span-7">
          <TrendCard
            trendData={last6MonthsData}
            displayCurrency={displayCurrency}
          />
        </m.div>
        <m.div variants={fadeUp} custom={3} className="xl:col-span-5">
          <CategoryBreakdown
            categoryExpenses={categoryExpenses}
            totalExpense={totalExpense}
            displayCurrency={displayCurrency}
          />
        </m.div>
        <m.div variants={fadeUp} custom={4} className="xl:col-span-5">
          <SpendingCalendarCard
            currentMonth={currentMonth}
            currentYear={currentYear}
            dailyExpensesMap={dailyExpensesMap}
            maxDailyExpense={maxDailyExpense}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            displayCurrency={displayCurrency}
          />
        </m.div>
        <m.div variants={fadeUp} custom={5} className="xl:col-span-7">
          <RecentLogs
            key={`${currentYear}-${currentMonth}-${selectedDay}`}
            sortedTimeline={sortedTimeline}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
            selectedDay={selectedDay}
          />
        </m.div>
      </div>
    </m.div>
  );
}
