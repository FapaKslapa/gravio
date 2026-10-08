"use client";

import {
  ChevronDown,
  ListChecks,
  ShoppingBasket,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { TodoItemRow } from "./todo-item-row";

export type TodoItem = {
  id: string;
  todoListId: string | null;
  title: string;
  notes: string | null;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
  completed: boolean;
  convertedToTransactionId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

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
  const [showCompleted, setShowCompleted] = useState(true);

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
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h2 className="font-display truncate text-xl font-bold tracking-tight">
            {listName}
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="tabular">{activeTodos.length}</span> da comprare
            {estimatedTotal > 0 && (
              <>
                {" · stima "}
                <span className="tabular font-semibold text-foreground">
                  {formatCurrency(estimatedTotal, displayCurrency)}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isSelectionMode ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full px-3.5"
                onClick={() => onToggleAllSelectTodos(!allSelected)}
              >
                {allSelected ? "Nessuno" : "Tutti"}
              </Button>
              <Button
                type="button"
                className="h-11 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
                disabled={selectedTodoIds.length === 0}
                onClick={onTriggerBulkImport}
              >
                <Sparkles />
                Importa{" "}
                <span className="tabular">({selectedTodoIds.length})</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full px-3.5"
                onClick={onCancelSelectionMode}
              >
                Annulla
              </Button>
            </>
          ) : (
            <>
              {activeTodos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full px-4"
                  onClick={onStartSelectionMode}
                >
                  <ListChecks />
                  Seleziona
                </Button>
              )}
              {canDeleteList && (
                <Button
                  type="button"
                  variant="ghost"
                  className="size-11 rounded-full text-muted-foreground hover:text-destructive"
                  aria-label={`Elimina lista ${listName}`}
                  onClick={onDeleteList}
                >
                  <Trash2 />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <LayoutGroup>
        {todos.length === 0 ? (
          <Empty className="border py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBasket />
              </EmptyMedia>
              <EmptyTitle>Lista vuota</EmptyTitle>
              <EmptyDescription>
                Scrivi qui sopra il primo articolo e premi invio.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {activeTodos.length === 0 ? (
              <Empty className="border py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListChecks />
                  </EmptyMedia>
                  <EmptyTitle>Tutto comprato</EmptyTitle>
                  <EmptyDescription>
                    Importa gli articoli completati come spesa, oppure
                    aggiungine di nuovi.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
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
            )}

            {completedTodos.length > 0 && (
              <section className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted((v) => !v)}
                  aria-expanded={showCompleted}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-lg px-1 text-left text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span>
                    Completate{" "}
                    <span className="tabular">({completedTodos.length})</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      !showCompleted && "-rotate-90",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {showCompleted && (
                    <m.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={springs.smooth}
                      className="-mx-1 -my-1 flex flex-col gap-2 overflow-hidden px-1 py-1"
                    >
                      <AnimatePresence initial={false}>
                        {completedTodos.map((todoItem) => (
                          <TodoItemRow
                            key={todoItem.id}
                            todoItem={todoItem}
                            categories={categories}
                            onToggleTodo={onToggleTodo}
                            onImportTodo={onImportTodo}
                          />
                        ))}
                      </AnimatePresence>
                    </m.ul>
                  )}
                </AnimatePresence>
              </section>
            )}
          </>
        )}
      </LayoutGroup>
    </div>
  );
}
