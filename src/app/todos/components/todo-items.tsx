"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useMemo } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { TodoCompletedSection } from "./todo-completed-section";
import { TodoAllDoneEmpty, TodoListEmpty } from "./todo-empty-states";
import { TodoItemRow } from "./todo-item-row";
import { TodoItemsHeader } from "./todo-items-header";
import type { Category, TodoItem } from "./todo-types";

export type { Category, TodoItem } from "./todo-types";

type TodoItemsProps = {
  listName: string;
  canDeleteList: boolean;
  onDeleteList: () => void;
  todos: TodoItem[];
  categories: Category[];
  onToggleTodo: (id: string, completed: boolean) => void | Promise<void>;
  onDeleteTodo: (id: string) => void;
  onImportTodo: (todo: TodoItem) => void;
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  onToggleSelectTodo: (id: string) => void;
  onToggleAllSelectTodos: (selected: boolean) => void;
  onStartSelectionMode: () => void;
  onCancelSelectionMode: () => void;
  onTriggerBulkImport: () => void;
};

export function TodoItems({
  listName,
  canDeleteList,
  onDeleteList,
  todos,
  categories,
  onToggleTodo,
  onDeleteTodo,
  onImportTodo,
  isSelectionMode,
  selectedTodoIds,
  onToggleSelectTodo,
  onToggleAllSelectTodos,
  onStartSelectionMode,
  onCancelSelectionMode,
  onTriggerBulkImport,
}: TodoItemsProps) {
  const { convertCurrency, displayCurrency } = useDashboard();

  const activeTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);
  const completedTodos = useMemo(
    () => todos.filter((t) => t.completed),
    [todos],
  );
  const selectedSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );

  const estimatedTotal = useMemo(() => {
    let total = 0;
    for (const t of activeTodos) {
      if (!t.estimatedAmount) continue;
      total += convertCurrency(
        parseFloat(t.estimatedAmount),
        t.estimatedCurrency || "EUR",
        displayCurrency,
      );
    }
    return total;
  }, [activeTodos, convertCurrency, displayCurrency]);

  const allSelected =
    activeTodos.length > 0 && activeTodos.every((t) => selectedSet.has(t.id));

  return (
    <div className="flex flex-col gap-4">
      <TodoItemsHeader
        listName={listName}
        activeCount={activeTodos.length}
        estimatedTotal={estimatedTotal}
        displayCurrency={displayCurrency}
        canDeleteList={canDeleteList}
        onDeleteList={onDeleteList}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedTodoIds.length}
        allSelected={allSelected}
        onToggleAllSelectTodos={onToggleAllSelectTodos}
        onStartSelectionMode={onStartSelectionMode}
        onCancelSelectionMode={onCancelSelectionMode}
        onTriggerBulkImport={onTriggerBulkImport}
      />

      <LayoutGroup>
        {todos.length === 0 ? (
          <TodoListEmpty />
        ) : (
          <>
            {activeTodos.length === 0 && <TodoAllDoneEmpty />}
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {activeTodos.map((todoItem) => (
                  <TodoItemRow
                    key={todoItem.id}
                    todoItem={todoItem}
                    categories={categories}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedSet.has(todoItem.id)}
                    onToggleTodo={onToggleTodo}
                    onDeleteTodo={onDeleteTodo}
                    onToggleSelectTodo={onToggleSelectTodo}
                  />
                ))}
              </AnimatePresence>
            </ul>

            {completedTodos.length > 0 && (
              <TodoCompletedSection
                todos={completedTodos}
                categories={categories}
                onToggleTodo={onToggleTodo}
                onImportTodo={onImportTodo}
              />
            )}
          </>
        )}
      </LayoutGroup>
    </div>
  );
}
