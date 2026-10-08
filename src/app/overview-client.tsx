"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { m } from "motion/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { fadeUp } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { AttentionStack } from "./overview/components/attention-stack";
import { BudgetProgressCard } from "./overview/components/budget-progress-card";
import { CategoryBudgetsCard } from "./overview/components/category-budgets-card";
import { CurrencyConverterCard } from "./overview/components/currency-converter-card";
import { GoalsSummaryCard } from "./overview/components/goals-summary-card";
import { OnboardingCard } from "./overview/components/onboarding-card";
import { OverviewAnalyticsCard } from "./overview/components/overview-analytics-card";
import { OverviewFriendBalancesCard } from "./overview/components/overview-friend-balances-card";
import { OverviewHeader } from "./overview/components/overview-header";
import { QuickAddForm } from "./overview/components/quick-add-form";
import { RecentTodoCard } from "./overview/components/recent-todo-card";
import { RecentTransactionsCard } from "./overview/components/recent-transactions-card";
import { SavingsInsightsCard } from "./overview/components/savings-insights-card";

export default function OverviewClient() {
  const router = useRouter();
  const { convertCurrency, displayCurrency, rates, settings, user } =
    useDashboard();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery(trpc.category.list.queryOptions());
  const { data: transactionsData } = useQuery(
    trpc.transaction.list.queryOptions(),
  );
  const { data: _friendsData } = useQuery(
    trpc.friend.listFriends.queryOptions(),
  );
  const { data: listsData } = useQuery(trpc.todo.listLists.queryOptions());
  const { data: categoryBudgetsData } = useQuery(
    trpc.categoryBudget.list.queryOptions(),
  );

  const activeListId = listsData?.[0]?.id;
  const { data: todosData } = useQuery(
    trpc.todo.list.queryOptions(
      { todoListId: activeListId ?? "" },
      { enabled: !!activeListId },
    ),
  );

  const createTransactionMutation = useMutation(
    trpc.transaction.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.list.queryKey(),
        });
        if (activeListId) {
          queryClient.invalidateQueries({
            queryKey: trpc.todo.list.queryKey({ todoListId: activeListId }),
          });
        }
      },
    }),
  );

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gravio_onboarding_dismissed") !== "true";
    }
    return true;
  });

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("gravio_onboarding_dismissed", "true");
  };

  const transactions = transactionsData || [];
  const categoryBudgets = categoryBudgetsData || [];
  const currentMonthTransactions = transactions.filter((t) =>
    dayjs(t.date).isSame(dayjs(), "month"),
  );

  const totalIncomeEur = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

  const totalExpenseEur = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

  const totalIncome = convertCurrency(totalIncomeEur, "EUR", displayCurrency);
  const totalExpense = convertCurrency(totalExpenseEur, "EUR", displayCurrency);

  const targetBudgetValNok = settings
    ? parseFloat(settings.targetMonthlyBudget)
    : 10000;
  const maxBudgetValNok = settings
    ? parseFloat(settings.maxMonthlyBudget)
    : 12000;

  const targetBudgetVal = convertCurrency(
    targetBudgetValNok,
    "NOK",
    displayCurrency,
  );
  const maxBudgetVal = convertCurrency(maxBudgetValNok, "NOK", displayCurrency);

  const handleSaveQuickAdd = async (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      exchangeRate: rates[tx.currency] ?? 1.0,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: tx.categoryId,
      date: tx.date,
      sharedWithUserId: null,
    });
  };

  const cards: { key: string; className: string; node: ReactNode }[] = [
    {
      key: "hero",
      className: "md:col-span-2 xl:col-span-8",
      node: (
        <BudgetProgressCard
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          targetBudgetVal={targetBudgetVal}
          maxBudgetVal={maxBudgetVal}
          displayCurrency={displayCurrency}
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
          categories={categoriesData || []}
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
          categories={categoriesData || []}
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
      node: (
        <RecentTodoCard
          todos={todosData || []}
          displayCurrency={displayCurrency}
        />
      ),
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
    <div className="flex flex-col gap-6">
      <OverviewHeader
        userName={user.name}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <OnboardingCard
        showOnboarding={showOnboarding}
        onDismiss={handleDismissOnboarding}
      />

      <AttentionStack
        categories={categoriesData || []}
        categoryBudgets={categoryBudgets}
        monthTransactions={currentMonthTransactions}
        todos={todosData || []}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
      />

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

      <QuickAddForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categoriesData || []}
        recentTransactions={transactions}
        onSave={handleSaveQuickAdd}
      />
    </div>
  );
}
