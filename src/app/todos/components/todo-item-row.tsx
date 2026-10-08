"use client";

import { Check, Receipt, Trash2 } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { TodoCheckMark } from "./todo-check";
import type { Category, TodoItem } from "./todo-items";

type TodoItemRowProps = {
  todoItem: TodoItem;
  categories: Category[];
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleTodo: (id: string, completed: boolean) => void | Promise<void>;
  onDeleteTodo?: (id: string) => void;
  onToggleSelectTodo?: (id: string) => void;
  onImportTodo?: (todo: TodoItem) => void;
};

function TodoMeta({
  todoItem,
  category,
  completed,
}: {
  todoItem: TodoItem;
  category: Category | undefined;
  completed: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 py-2">
      <span
        className={cn(
          "block truncate text-[15px] font-medium leading-snug",
          completed && "text-muted-foreground line-through",
        )}
      >
        {todoItem.title}
      </span>
      {todoItem.notes && (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {todoItem.notes}
        </p>
      )}
      {category && !completed && (
        <span
          className="mt-1.5 inline-flex items-center gap-1 rounded-full py-0.5 pr-2 pl-1.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklab, ${category.color} 14%, transparent)`,
          }}
        >
          <span style={{ color: category.color }} className="flex">
            <CategoryIcon name={category.icon} size={12} />
          </span>
          {category.name}
        </span>
      )}
    </div>
  );
}

export function TodoItemRow({
  todoItem,
  categories,
  isSelectionMode = false,
  isSelected = false,
  onToggleTodo,
  onDeleteTodo,
  onToggleSelectTodo,
  onImportTodo,
}: TodoItemRowProps) {
  const [optimisticDone, setOptimisticDone] = useState(false);
  const category = categories.find((c) => c.id === todoItem.categoryId);
  const amount = todoItem.estimatedAmount
    ? parseFloat(todoItem.estimatedAmount)
    : null;
  const completed = todoItem.completed;

  const handleCheck = async () => {
    if (completed) {
      await onToggleTodo(todoItem.id, false);
      return;
    }
    setOptimisticDone(true);
    try {
      await onToggleTodo(todoItem.id, true);
    } catch {
      setOptimisticDone(false);
    }
  };

  const rowClass = cn(
    "flex min-h-14 items-center rounded-lg elevation-1 bg-card transition-colors",
    completed && "bg-muted/50 shadow-none",
    isSelectionMode && isSelected && "bg-brand-soft",
  );

  const amountNode = !!amount && (
    <span
      className={cn(
        "tabular shrink-0 pr-2 text-sm font-semibold",
        completed ? "text-muted-foreground" : "text-foreground",
      )}
    >
      {formatCurrency(amount, todoItem.estimatedCurrency || "EUR")}
    </span>
  );

  if (isSelectionMode && !completed) {
    return (
      <m.li
        layout
        transition={springs.snappy}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
      >
        <button
          type="button"
          aria-pressed={isSelected}
          onClick={() => onToggleSelectTodo?.(todoItem.id)}
          className={cn(
            rowClass,
            "w-full cursor-pointer pr-3 text-left outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]",
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center">
            <TodoCheckMark checked={isSelected} square />
          </span>
          <TodoMeta todoItem={todoItem} category={category} completed={false} />
          {amountNode}
        </button>
      </m.li>
    );
  }

  const checked = completed || optimisticDone;

  return (
    <m.li
      layout
      layoutId={`todo-${todoItem.id}`}
      transition={springs.snappy}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(rowClass, "group")}
    >
      <m.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={springs.snappy}
        onClick={handleCheck}
        aria-label={
          completed ? "Segna come da acquistare" : "Segna come acquistato"
        }
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <TodoCheckMark checked={checked} />
      </m.button>

      <TodoMeta todoItem={todoItem} category={category} completed={checked} />
      {amountNode}

      {completed ? (
        todoItem.convertedToTransactionId ? (
          <span className="mr-2 inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-income-soft px-2.5 text-xs font-semibold text-income">
            <Check className="size-3.5" strokeWidth={3} />
            Importato
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => onImportTodo?.(todoItem)}
            className="mr-1 h-11 shrink-0 rounded-full px-3.5 text-xs font-semibold"
          >
            <Receipt />
            Importa spesa
          </Button>
        )
      ) : (
        onDeleteTodo && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onDeleteTodo(todoItem.id)}
            aria-label={`Elimina ${todoItem.title}`}
            className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-destructive md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
          >
            <Trash2 />
          </Button>
        )
      )}
    </m.li>
  );
}
