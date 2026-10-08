"use client";

import { Check } from "lucide-react";
import type React from "react";
import { useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

type TodoItem = {
  id: string;
  title: string;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TodoBulkConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTodos: TodoItem[];
  categories: Category[];
  onConvertBulk: (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => Promise<void>;
};

type FormState = {
  txAmount: string;
  txCurrency: string;
  txDate: string;
  txDescription: string;
  txCategoryId: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

type TodoBulkConvertFormProps = {
  selectedTodos: TodoItem[];
  categories: Category[];
  onClose: () => void;
  onConvertBulk: TodoBulkConvertModalProps["onConvertBulk"];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

function TodoBulkConvertForm({
  selectedTodos,
  categories,
  onClose,
  onConvertBulk,
  displayCurrency,
  convertCurrency,
}: TodoBulkConvertFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () => {
    let estTotal = 0;
    for (const item of selectedTodos) {
      if (item.estimatedAmount) {
        const amt = parseFloat(item.estimatedAmount);
        const cur = item.estimatedCurrency || "EUR";
        estTotal += convertCurrency(amt, cur, displayCurrency);
      }
    }

    const titles = selectedTodos.map((t) => t.title).join(", ");
    const firstCatId =
      selectedTodos.find((t) => t.categoryId)?.categoryId || "";

    return {
      txAmount: estTotal > 0 ? estTotal.toFixed(2) : "",
      txCurrency: displayCurrency,
      txDate: new Date().toISOString().substring(0, 10),
      txDescription: `Spesa: ${titles}`,
      txCategoryId: firstCatId,
      isSubmitting: false,
    };
  });

  const {
    txAmount,
    txCurrency,
    txDate,
    txDescription,
    txCategoryId,
    isSubmitting,
  } = state;

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
        <div className="flex max-h-28 flex-col gap-2 overflow-y-auto rounded-lg bg-muted px-3.5 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="tabular">{selectedTodos.length}</span> articoli
            selezionati
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedTodos.map((todo) => (
              <span
                key={todo.id}
                className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium"
              >
                <Check className="size-3 text-income" strokeWidth={3} />
                {todo.title}
              </span>
            ))}
          </div>
        </div>

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

        <div className="grid grid-cols-3 gap-2">
          <Field className="col-span-2">
            <FieldLabel>Prezzo totale</FieldLabel>
            <MoneyInput
              value={txAmount}
              onChange={(val) => setField("txAmount", val)}
              currency={txCurrency}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Valuta</FieldLabel>
            <CurrencySelect
              value={txCurrency}
              onChange={(val) => setField("txCurrency", val)}
            />
          </Field>
        </div>

        {showConverted && (
          <div className="flex justify-between rounded-lg bg-brand-soft px-3.5 py-2.5 text-sm font-semibold text-brand">
            <span>Totale convertito</span>
            <span className="tabular">
              {convertCurrency(
                parseFloat(txAmount),
                txCurrency,
                displayCurrency,
              ).toFixed(2)}{" "}
              {displayCurrency}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Categoria</FieldLabel>
            <CategorySelect
              value={txCategoryId}
              onChange={(val) => setField("txCategoryId", val)}
              categories={categories}
              triggerClassName="h-11 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel>Data della spesa</FieldLabel>
            <CustomDatePicker
              value={txDate}
              onChange={(val) => setField("txDate", val)}
            />
          </Field>
        </div>

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

export function TodoBulkConvertModal({
  isOpen,
  onClose,
  selectedTodos,
  categories,
  onConvertBulk,
}: TodoBulkConvertModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();

  return (
    <ResponsiveSheet
      open={isOpen && selectedTodos.length > 0}
      onOpenChange={(open) => !open && onClose()}
      title="Importazione di massa"
      description="Registra gli articoli selezionati come un'unica spesa."
    >
      <TodoBulkConvertForm
        selectedTodos={selectedTodos}
        categories={categories}
        onClose={onClose}
        onConvertBulk={onConvertBulk}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
      />
    </ResponsiveSheet>
  );
}
