"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type React from "react";
import { useReducer, useRef } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TodoFormDetails } from "./todo-form-details";
import {
  createInitialFormState,
  type FormState,
  formReducer,
} from "./todo-form-state";
import type { Category } from "./todo-types";

type TodoFormProps = {
  activeListId: string;
  listName: string;
  categories: Category[];
  onAddTodo: (todo: {
    title: string;
    notes: string;
    categoryId: string | null;
    estimatedAmount?: number;
    estimatedCurrency?: string;
  }) => Promise<void>;
};

export function TodoForm({
  activeListId,
  listName,
  categories,
  onAddTodo,
}: TodoFormProps) {
  const { displayCurrency } = useDashboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(
    formReducer,
    displayCurrency,
    createInitialFormState,
  );

  const {
    todoTitle,
    todoCategoryId,
    todoEstAmount,
    todoEstCurrency,
    isSubmitting,
    showDetails,
  } = state;

  const setField = (field: keyof FormState, value: unknown) =>
    dispatch({ type: "SET_FIELD", field, value });

  const hasDetails = !!todoCategoryId || !!todoEstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim() || !activeListId || isSubmitting) return;

    setField("isSubmitting", true);
    try {
      await onAddTodo({
        title: todoTitle.trim(),
        notes: "",
        categoryId: todoCategoryId || null,
        estimatedAmount: todoEstAmount ? parseFloat(todoEstAmount) : undefined,
        estimatedCurrency: todoEstAmount ? todoEstCurrency : undefined,
      });

      dispatch({
        type: "RESET",
        payload: {
          todoTitle: "",
          todoCategoryId: "",
          todoEstAmount: "",
          todoEstCurrency: displayCurrency,
        },
      });
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setField("isSubmitting", false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl bg-card p-2 elevation-2"
    >
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          type="text"
          enterKeyHint="send"
          autoComplete="off"
          aria-label={`Articolo da aggiungere a ${listName}`}
          placeholder="Aggiungi articolo"
          value={todoTitle}
          onChange={(e) => setField("todoTitle", e.target.value)}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base font-medium shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
        />
        <Button
          type="button"
          variant="ghost"
          aria-label="Categoria e prezzo stimato"
          aria-expanded={showDetails}
          onClick={() => setField("showDetails", !showDetails)}
          className={cn(
            "relative size-11 shrink-0 rounded-full text-muted-foreground",
            showDetails && "bg-muted text-foreground",
          )}
        >
          <SlidersHorizontal />
          {hasDetails && !showDetails && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-brand" />
          )}
        </Button>
        <Button
          type="submit"
          aria-label="Aggiungi articolo"
          disabled={isSubmitting || !todoTitle.trim()}
          className="size-11 shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showDetails && (
          <TodoFormDetails
            categories={categories}
            categoryId={todoCategoryId}
            amount={todoEstAmount}
            currency={todoEstCurrency}
            onField={setField}
          />
        )}
      </AnimatePresence>
    </form>
  );
}
