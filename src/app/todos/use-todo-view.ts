import { useQuery } from "@tanstack/react-query";
import { useUrlActions } from "@/hooks/use-url-actions";
import { useTRPC } from "@/lib/trpc/client";
import { useTodoMutations } from "./use-todo-mutations";
import { useTodoUi } from "./use-todo-ui";

export function useTodoView() {
  const trpc = useTRPC();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const {
    data: listsData,
    isLoading: isListsLoading,
    refetch: refetchLists,
  } = useQuery(trpc.todo.listLists.queryOptions());

  const ui = useTodoUi();
  const {
    activeListId,
    newListName,
    listToDelete,
    todoToDelete,
    setActiveListId,
    setIsSelectionMode,
    setSelectedTodoIds,
    setIsNewListOpen,
    setNewListName,
    setListToDelete,
    setTodoToDelete,
  } = ui;

  const actualActiveListId =
    activeListId || (listsData && listsData.length > 0 ? listsData[0].id : "");

  useUrlActions(
    {
      newList: () => setIsNewListOpen(true),
      list: (id) => setActiveListId(id),
    },
    !!listsData,
  );

  const handleSelectActiveList = (id: string) => {
    setActiveListId(id);
    setSelectedTodoIds([]);
    setIsSelectionMode(false);
  };

  const { data: todosData, refetch: refetchTodos } = useQuery(
    trpc.todo.list.queryOptions(
      { todoListId: actualActiveListId },
      { enabled: !!actualActiveListId },
    ),
  );

  const mutations = useTodoMutations({
    refetchLists,
    refetchTodos,
    actualActiveListId,
    onListDeleted: () => handleSelectActiveList(""),
    onBulkConverted: () => {
      setIsSelectionMode(false);
      setSelectedTodoIds([]);
    },
  });

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const list = await mutations.createListMutation.mutateAsync({
      name: newListName,
    });
    handleSelectActiveList(list.id);
    setNewListName("");
    setIsNewListOpen(false);
  };

  const handleDeleteListConfirm = async () => {
    if (listToDelete) {
      await mutations.deleteListMutation.mutateAsync({ id: listToDelete });
      setListToDelete(null);
    }
  };

  const handleDeleteTodoConfirm = async () => {
    if (todoToDelete) {
      await mutations.deleteTodoMutation.mutateAsync({ id: todoToDelete });
      setTodoToDelete(null);
    }
  };

  const handleToggleSelectTodo = (id: string) => {
    setSelectedTodoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAllSelectTodos = (selected: boolean) => {
    if (selected) {
      const activeTodos = (todosData || []).filter((t) => !t.completed);
      setSelectedTodoIds(activeTodos.map((t) => t.id));
    } else {
      setSelectedTodoIds([]);
    }
  };

  const activeListName =
    (listsData || []).find((l) => l.id === actualActiveListId)?.name || "";

  return {
    ...ui,
    isCategoriesLoading,
    isListsLoading,
    categoriesData,
    listsData,
    todosData,
    actualActiveListId,
    activeListName,
    handleSelectActiveList,
    handleCreateList,
    handleDeleteListConfirm,
    handleDeleteTodoConfirm,
    handleCreateTodo: mutations.handleCreateTodo,
    handleToggleTodo: mutations.handleToggleTodo,
    handleImportTodo: mutations.handleImportTodo,
    handleImportTodoBulk: mutations.handleImportTodoBulk,
    handleToggleSelectTodo,
    handleToggleAllSelectTodos,
  };
}
