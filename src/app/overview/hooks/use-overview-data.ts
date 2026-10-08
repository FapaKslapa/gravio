import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";

type QuickAddTransaction = {
  description: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
};

export function useOverviewData() {
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

  const handleSaveQuickAdd = async (tx: QuickAddTransaction) => {
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

  return {
    user,
    displayCurrency,
    convertCurrency,
    categories: categoriesData || [],
    todos: todosData || [],
    transactions,
    categoryBudgets,
    currentMonthTransactions,
    totalIncome,
    totalExpense,
    targetBudgetVal,
    maxBudgetVal,
    handleSaveQuickAdd,
  };
}

export type OverviewData = ReturnType<typeof useOverviewData>;
