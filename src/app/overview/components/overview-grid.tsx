import { m } from "motion/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { OverviewData } from "../hooks/use-overview-data";
import { BudgetProgressCard } from "./budget-progress-card";
import { CategoryBudgetsCard } from "./category-budgets-card";
import { CurrencyConverterCard } from "./currency-converter-card";
import { GoalsSummaryCard } from "./goals-summary-card";
import { OverviewAnalyticsCard } from "./overview-analytics-card";
import { OverviewFriendBalancesCard } from "./overview-friend-balances-card";
import { RecentTodoCard } from "./recent-todo-card";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { SavingsInsightsCard } from "./savings-insights-card";

export function OverviewGrid({ data }: { data: OverviewData }) {
  const router = useRouter();
  const {
    displayCurrency,
    convertCurrency,
    categories,
    todos,
    transactions,
    categoryBudgets,
    currentMonthTransactions,
  } = data;

  const cards: { key: string; className: string; node: ReactNode }[] = [
    {
      key: "hero",
      className: "md:col-span-2 xl:col-span-8",
      node: (
        <BudgetProgressCard
          totalIncome={data.totalIncome}
          totalExpense={data.totalExpense}
          targetBudgetVal={data.targetBudgetVal}
          maxBudgetVal={data.maxBudgetVal}
          displayCurrency={displayCurrency}
          monthExpenses={currentMonthTransactions.filter(
            (t) => t.type === "expense",
          )}
          convertCurrency={convertCurrency}
          onOpenSettings={() => router.push("/settings?tab=budget")}
        />
      ),
    },
    {
      key: "recent",
      className:
        "relative md:col-span-2 xl:col-span-4 xl:row-span-2 xl:h-0 xl:min-h-full",
      node: (
        <RecentTransactionsCard
          transactions={transactions}
          categories={categories}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
          className="xl:absolute xl:inset-0"
        />
      ),
    },
    {
      key: "analytics",
      className: "md:col-span-2 xl:col-span-8",
      node: (
        <OverviewAnalyticsCard
          transactions={transactions}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
        />
      ),
    },
    {
      key: "categories",
      className: "xl:col-span-4",
      node: (
        <CategoryBudgetsCard
          transactions={currentMonthTransactions}
          categories={categories}
          categoryBudgets={categoryBudgets}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
          onOpenSettings={() => router.push("/settings?tab=budget")}
        />
      ),
    },
    {
      key: "todo",
      className: "xl:col-span-4",
      node: <RecentTodoCard todos={todos} displayCurrency={displayCurrency} />,
    },
    {
      key: "friends",
      className: "md:col-span-2 xl:col-span-4",
      node: <OverviewFriendBalancesCard />,
    },
    {
      key: "converter",
      className: "md:col-span-2 xl:col-span-12",
      node: <CurrencyConverterCard />,
    },
    {
      key: "insights",
      className: "md:col-span-2 xl:col-span-8",
      node: <SavingsInsightsCard />,
    },
    {
      key: "goals",
      className: "xl:col-span-4",
      node: <GoalsSummaryCard />,
    },
  ];

  return (
    <m.div
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-12"
    >
      {cards.map((card, i) => (
        <m.div
          key={card.key}
          variants={fadeUp}
          custom={i}
          className={cn("min-w-0", card.className)}
        >
          {card.node}
        </m.div>
      ))}
    </m.div>
  );
}
