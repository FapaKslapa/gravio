"use client";

import { m } from "motion/react";
import { LoadingState } from "@/components/ui/loading-state";
import { SwipeArea } from "@/components/ui/swipe-area";
import { fadeUp } from "@/lib/motion";
import { AnalyticsHeader } from "./components/analytics-header";
import { AnalyticsSummaryCards } from "./components/analytics-summary-cards";
import { CategoryBreakdown } from "./components/category-breakdown";
import { RecentLogs } from "./components/recent-logs";
import { SpendingCalendarCard } from "./components/spending-calendar-card";
import { TrendCard } from "./components/trend-card";
import { useAnalyticsData } from "./hooks/use-analytics-data";
import { useMonthNavigation } from "./hooks/use-month-navigation";

export default function AnalyticsView() {
  const {
    currentYear,
    currentMonth,
    selectedDay,
    setSelectedDay,
    handlePrevMonth,
    handleNextMonth,
    handleSelectMonth,
  } = useMonthNavigation();
  const {
    isLoading,
    displayCurrency,
    convertCurrency,
    categories,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    dailyExpensesMap,
    maxDailyExpense,
    categoryExpenses,
    last6MonthsData,
    prevIncome,
    prevExpense,
    prevSavings,
    sortedTimeline,
  } = useAnalyticsData(currentMonth, currentYear, selectedDay);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <SwipeArea onPrev={handlePrevMonth} onNext={handleNextMonth}>
      <m.div
        initial="hidden"
        animate="show"
        className="flex w-full flex-col gap-4 text-foreground md:gap-6"
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
    </SwipeArea>
  );
}
