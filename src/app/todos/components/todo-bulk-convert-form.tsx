"use client";

import type React from "react";
import { useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BulkAmountRow } from "./bulk-amount-row";
import { BulkCategoryDate } from "./bulk-category-date";
import { BulkConvertedTotal } from "./bulk-converted-total";
import { BulkSelectedSummary } from "./bulk-selected-summary";
import {
  createInitialState,
  type FormState,
  formReducer,
} from "./todo-bulk-convert-state";
import type {
  BulkCategory,
  BulkTodoItem,
  TodoBulkConvertModalProps,
} from "./todo-bulk-convert-types";
import { useSuggestedCategory } from "./use-suggested-category";

type TodoBulkConvertFormProps = {
  selectedTodos: BulkTodoItem[];
  categories: BulkCategory[];
  onClose: () => void;
  onConvertBulk: TodoBulkConvertModalProps["onConvertBulk"];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function TodoBulkConvertForm({
  selectedTodos,
  categories,
  onClose,
  onConvertBulk,
  displayCurrency,
  convertCurrency,
}: TodoBulkConvertFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () =>
    createInitialState(selectedTodos, displayCurrency, convertCurrency),
  );

  const {
    txAmount,
    txCurrency,
    txDate,
    txDescription,
    txCategoryId,
    isSubmitting,
  } = state;

  const suggestedCategoryId = useSuggestedCategory(txCategoryId, selectedTodos);

  const setField = (field: keyof FormState, value: unknown) =>
    dispatch({ type: "SET_FIELD", field, value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTodos.length === 0 || !txAmount || isSubmitting) return;

    setField("isSubmitting", true);
    try {
      await onConvertBulk({
        todoIds: selectedTodos.map((t) => t.id),
        amount: parseFloat(txAmount),
        currency: txCurrency,
        date: new Date(txDate).toISOString(),
        description: txDescription.trim() || "Spesa cumulativa",
        categoryId: txCategoryId || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setField("isSubmitting", false);
    }
  };

  const showConverted =
    !!txAmount &&
    !Number.isNaN(parseFloat(txAmount)) &&
    txCurrency !== displayCurrency;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <BulkSelectedSummary todos={selectedTodos} />

        <Field>
          <FieldLabel htmlFor="bulk-description">
            Descrizione transazione
          </FieldLabel>
          <Input
            id="bulk-description"
            value={txDescription}
            onChange={(e) => setField("txDescription", e.target.value)}
            placeholder="Es. Spesa settimanale al supermercato"
            required
            className="h-11 text-base md:text-sm"
          />
        </Field>

        <BulkAmountRow
          amount={txAmount}
          currency={txCurrency}
          onAmount={(val) => setField("txAmount", val)}
          onCurrency={(val) => setField("txCurrency", val)}
        />

        {showConverted && (
          <BulkConvertedTotal
            converted={convertCurrency(
              parseFloat(txAmount),
              txCurrency,
              displayCurrency,
            )}
            currency={displayCurrency}
          />
        )}

        <BulkCategoryDate
          categories={categories}
          categoryId={txCategoryId}
          suggestedId={suggestedCategoryId}
          date={txDate}
          onCategory={(val) => setField("txCategoryId", val)}
          onDate={(val) => setField("txDate", val)}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !txAmount}
          className="h-12 w-full rounded-full text-sm font-semibold"
        >
          {isSubmitting ? "Importazione..." : "Conferma spesa cumulativa"}
        </Button>
      </FieldGroup>
    </form>
  );
}
