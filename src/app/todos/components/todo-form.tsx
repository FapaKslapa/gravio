"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type React from "react";
import { useReducer, useRef } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

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

type FormState = {
  todoTitle: string;
  todoCategoryId: string;
  todoEstAmount: string;
  todoEstCurrency: string;
  isSubmitting: boolean;
  showDetails: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "RESET"; payload: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function TodoForm({
  activeListId,
  listName,
  categories,
  onAddTodo,
}: TodoFormProps) {
  const { displayCurrency } = useDashboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(formReducer, null, () => ({
    todoTitle: "",
    todoCategoryId: "",
    todoEstAmount: "",
    todoEstCurrency: displayCurrency,
    isSubmitting: false,
    showDetails: false,
  }));

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
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springs.smooth}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-1 pt-1 pb-1 sm:flex-row">
              <div className="sm:w-48">
                <CategorySelect
                  value={todoCategoryId}
                  onChange={(v) => setField("todoCategoryId", v)}
                  categories={categories}
                  triggerClassName="h-11 w-full text-sm"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <div className="min-w-0 flex-1">
                  <MoneyInput
                    value={todoEstAmount}
                    onChange={(v) => setField("todoEstAmount", v)}
                    currency={todoEstCurrency}
                    placeholder="Prezzo stimato"
                    inputClassName="tabular text-sm font-semibold"
                  />
                </div>
                <div className="w-20 shrink-0">
                  <CurrencySelect
                    value={todoEstCurrency}
                    onChange={(v) => setField("todoEstCurrency", v)}
                    triggerClassName="h-11 w-full text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </form>
  );
}
