import { useMutation } from "@tanstack/react-query";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";

type Params = {
  refetchLists: () => unknown;
  refetchTodos: () => unknown;
  actualActiveListId: string;
  onListDeleted: () => void;
  onBulkConverted: () => void;
};

export function useTodoMutations({
  refetchLists,
  refetchTodos,
  actualActiveListId,
  onListDeleted,
  onBulkConverted,
}: Params) {
  const { exchangeRate } = useDashboard();
  const trpc = useTRPC();

  const createListMutation = useMutation(
    trpc.todo.createList.mutationOptions({
      onSuccess: () => refetchLists(),
    }),
  );
  const deleteListMutation = useMutation(
    trpc.todo.deleteList.mutationOptions({
      onSuccess: () => {
        refetchLists();
        onListDeleted();
      },
    }),
  );
  const createTodoMutation = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const toggleTodoMutation = useMutation(
    trpc.todo.toggle.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const deleteTodoMutation = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const convertTodoMutation = useMutation(
    trpc.todo.convertToTransaction.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const convertTodoBulkMutation = useMutation(
    trpc.todo.convertToTransactionBulk.mutationOptions({
      onSuccess: () => {
        refetchTodos();
        refetchLists();
        onBulkConverted();
      },
    }),
  );

  const handleCreateTodo = async (todo: {
    title: string;
    notes: string;
    categoryId: string | null;
    estimatedAmount?: number;
    estimatedCurrency?: string;
  }) => {
    if (!actualActiveListId) return;

    await createTodoMutation.mutateAsync({
      todoListId: actualActiveListId,
      title: todo.title,
      notes: todo.notes,
      categoryId: todo.categoryId,
      estimatedAmount: todo.estimatedAmount,
      estimatedCurrency: todo.estimatedCurrency,
    });
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await toggleTodoMutation.mutateAsync({ id, completed });
  };

  const handleImportTodo = async (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => {
    await convertTodoMutation.mutateAsync({
      todoId: data.todoId,
      amount: data.amount,
      currency: data.currency,
      exchangeRate,
      date: data.date,
    });
  };

  const handleImportTodoBulk = async (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => {
    await convertTodoBulkMutation.mutateAsync({
      todoIds: data.todoIds,
      amount: data.amount,
      currency: data.currency,
      exchangeRate,
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
    });
  };

  return {
    createListMutation,
    deleteListMutation,
    deleteTodoMutation,
    handleCreateTodo,
    handleToggleTodo,
    handleImportTodo,
    handleImportTodoBulk,
  };
}
