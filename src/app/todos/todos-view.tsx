"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { FolderPlus, ShoppingBasket } from "lucide-react";
import { m } from "motion/react";
import { useMemo, useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";
import { TodoForm } from "./components/todo-form";
import { TodoHeader } from "./components/todo-header";
import { type TodoItem, TodoItems } from "./components/todo-items";
import { TodoLists } from "./components/todo-lists";
import { TodoModalsContainer } from "./components/todo-modals-container";

type UIState = {
  activeListId: string;
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  isBulkImportOpen: boolean;
  isNewListOpen: boolean;
  newListName: string;
  importingTodo: TodoItem | null;
  listToDelete: string | null;
  todoToDelete: string | null;
};

type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

function useTodoView() {
  const { exchangeRate } = useDashboard();
  const trpc = useTRPC();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const {
    data: listsData,
    isLoading: isListsLoading,
    refetch: refetchLists,
  } = useQuery(trpc.todo.listLists.queryOptions());

  const [uiState, dispatch] = useReducer(uiReducer, {
    activeListId: "",
    isSelectionMode: false,
    selectedTodoIds: [],
    isBulkImportOpen: false,
    isNewListOpen: false,
    newListName: "",
    importingTodo: null,
    listToDelete: null,
    todoToDelete: null,
  });

  const {
    activeListId,
    isSelectionMode,
    selectedTodoIds,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
  } = uiState;

  const setActiveListId = (val: string) =>
    dispatch({ type: "SET_FIELD", field: "activeListId", value: val });
  const setIsSelectionMode = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isSelectionMode", value: val });
  const setSelectedTodoIds = (
    val: string[] | ((prev: string[]) => string[]),
  ) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "selectedTodoIds",
        value: val(selectedTodoIds),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "selectedTodoIds", value: val });
    }
  };
  const setIsBulkImportOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isBulkImportOpen", value: val });
  const setIsNewListOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isNewListOpen", value: val });
  const setNewListName = (val: string) =>
    dispatch({ type: "SET_FIELD", field: "newListName", value: val });
  const setImportingTodo = (val: TodoItem | null) =>
    dispatch({ type: "SET_FIELD", field: "importingTodo", value: val });
  const setListToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "listToDelete", value: val });
  const setTodoToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "todoToDelete", value: val });

  const selectedTodoIdsSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );

  const actualActiveListId =
    activeListId || (listsData && listsData.length > 0 ? listsData[0].id : "");

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

  const createListMutation = useMutation(
    trpc.todo.createList.mutationOptions({
      onSuccess: () => refetchLists(),
    }),
  );
  const deleteListMutation = useMutation(
    trpc.todo.deleteList.mutationOptions({
      onSuccess: () => {
        refetchLists();
        handleSelectActiveList("");
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
        setIsSelectionMode(false);
        setSelectedTodoIds([]);
      },
    }),
  );

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const list = await createListMutation.mutateAsync({ name: newListName });
    handleSelectActiveList(list.id);
    setNewListName("");
    setIsNewListOpen(false);
  };

  const handleDeleteListConfirm = async () => {
    if (listToDelete) {
      await deleteListMutation.mutateAsync({ id: listToDelete });
      setListToDelete(null);
    }
  };

  const handleDeleteTodoConfirm = async () => {
    if (todoToDelete) {
      await deleteTodoMutation.mutateAsync({ id: todoToDelete });
      setTodoToDelete(null);
    }
  };

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
    isCategoriesLoading,
    isListsLoading,
    categoriesData,
    listsData,
    todosData,
    actualActiveListId,
    activeListName,
    isSelectionMode,
    selectedTodoIds,
    selectedTodoIdsSet,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
    setNewListName,
    setIsNewListOpen,
    setListToDelete,
    setTodoToDelete,
    setImportingTodo,
    setIsBulkImportOpen,
    setIsSelectionMode,
    setSelectedTodoIds,
    handleSelectActiveList,
    handleCreateList,
    handleDeleteListConfirm,
    handleDeleteTodoConfirm,
    handleCreateTodo,
    handleToggleTodo,
    handleImportTodo,
    handleImportTodoBulk,
    handleToggleSelectTodo,
    handleToggleAllSelectTodos,
  };
}

export default function TodosView() {
  const {
    isCategoriesLoading,
    isListsLoading,
    categoriesData,
    listsData,
    todosData,
    actualActiveListId,
    activeListName,
    isSelectionMode,
    selectedTodoIds,
    selectedTodoIdsSet,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
    setNewListName,
    setIsNewListOpen,
    setListToDelete,
    setTodoToDelete,
    setImportingTodo,
    setIsBulkImportOpen,
    setIsSelectionMode,
    setSelectedTodoIds,
    handleSelectActiveList,
    handleCreateList,
    handleDeleteListConfirm,
    handleDeleteTodoConfirm,
    handleCreateTodo,
    handleToggleTodo,
    handleImportTodo,
    handleImportTodoBulk,
    handleToggleSelectTodo,
    handleToggleAllSelectTodos,
  } = useTodoView();

  if (isCategoriesLoading || isListsLoading) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-3/4 rounded-full" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  const lists = listsData || [];

  return (
    <div className="flex flex-col gap-5">
      <TodoHeader onNewList={() => setIsNewListOpen(true)} />

      {lists.length === 0 ? (
        <Empty className="border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBasket />
            </EmptyMedia>
            <EmptyTitle>Nessuna lista</EmptyTitle>
            <EmptyDescription>
              Crea la prima lista per segnare cosa comprare e importarlo poi
              come spesa.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              onClick={() => setIsNewListOpen(true)}
              className="h-11 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
            >
              <FolderPlus />
              Crea lista
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 items-start gap-5 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-8 xl:grid-cols-[17rem_minmax(0,1fr)]"
        >
          <div className="md:sticky md:top-6">
            <TodoLists
              lists={lists}
              activeListId={actualActiveListId}
              onSelectActiveList={handleSelectActiveList}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <TodoForm
                key={actualActiveListId}
                activeListId={actualActiveListId}
                listName={activeListName}
                categories={categoriesData || []}
                onAddTodo={handleCreateTodo}
              />
            </div>

            <TodoItems
              listName={activeListName}
              canDeleteList={lists.length > 1}
              onDeleteList={() => setListToDelete(actualActiveListId)}
              todos={todosData || []}
              categories={categoriesData || []}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={setTodoToDelete}
              onImportTodo={setImportingTodo}
              isSelectionMode={isSelectionMode}
              selectedTodoIds={selectedTodoIds}
              onToggleSelectTodo={handleToggleSelectTodo}
              onToggleAllSelectTodos={handleToggleAllSelectTodos}
              onStartSelectionMode={() => setIsSelectionMode(true)}
              onCancelSelectionMode={() => {
                setIsSelectionMode(false);
                setSelectedTodoIds([]);
              }}
              onTriggerBulkImport={() => setIsBulkImportOpen(true)}
            />
          </div>
        </m.div>
      )}

      <TodoModalsContainer
        isNewListOpen={isNewListOpen}
        newListName={newListName}
        onNewListNameChange={setNewListName}
        onNewListClose={() => setIsNewListOpen(false)}
        onNewListSubmit={handleCreateList}
        importingTodo={importingTodo}
        onImportTodoClose={() => setImportingTodo(null)}
        onImportTodoConfirm={handleImportTodo}
        isBulkImportOpen={isBulkImportOpen}
        onBulkImportClose={() => setIsBulkImportOpen(false)}
        selectedTodos={(todosData || []).filter((t) =>
          selectedTodoIdsSet.has(t.id),
        )}
        categories={categoriesData || []}
        onBulkImportConfirm={handleImportTodoBulk}
        listToDelete={listToDelete}
        onDeleteListClose={() => setListToDelete(null)}
        onDeleteListConfirm={handleDeleteListConfirm}
        todoToDelete={todoToDelete}
        onDeleteTodoClose={() => setTodoToDelete(null)}
        onDeleteTodoConfirm={handleDeleteTodoConfirm}
      />
    </div>
  );
}
