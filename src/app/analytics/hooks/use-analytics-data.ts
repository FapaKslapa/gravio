import { useQuery } from "@tanstack/react-query";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import { buildCategoryExpenses, buildLast6Months } from "./analytics-calc";

export function useAnalyticsData(
  currentMonth: number,
  currentYear: number,
  selectedDay: number | null,
) {
  const { displayCurrency, convertCurrency } = useDashboard();

  const trpc = useTRPC();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    trpc.transaction.list.queryOptions(),
  );

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

  const categoryExpenses = buildCategoryExpenses(
    monthTransactions,
    categories,
    totalExpense,
    convertNokAmount,
  );

  const last6MonthsData = buildLast6Months(
    transactions,
    currentMonth,
    currentYear,
    convertNokAmount,
  );

  const prevMonthData = last6MonthsData[last6MonthsData.length - 2];

  const timelineTransactions = selectedDay
    ? monthTransactions.filter(
        (t) => new Date(t.date).getDate() === selectedDay,
      )
    : monthTransactions;

  const sortedTimeline = timelineTransactions.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    isLoading: isCategoriesLoading || isTransactionsLoading,
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
    prevIncome: prevMonthData?.income ?? 0,
    prevExpense: prevMonthData?.expense ?? 0,
    prevSavings: prevMonthData?.savings ?? 0,
    sortedTimeline,
  };
}
