"use client";

import type React from "react";
import { useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

type TodoItem = {
  id: string;
  title: string;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type TodoConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  todoItem: TodoItem | null;
  onConvert: (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => Promise<void>;
};

type FormState = {
  txAmount: string;
  txCurrency: string;
  txDate: string;
  isSubmitting: boolean;
};

type FormAction = { type: "SET"; payload: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

type TodoConvertFormProps = {
  todoItem: TodoItem;
  onClose: () => void;
  onConvert: TodoConvertModalProps["onConvert"];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

function TodoConvertForm({
  todoItem,
  onClose,
  onConvert,
  displayCurrency,
  convertCurrency,
}: TodoConvertFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () => {
    const estAmountNum = todoItem.estimatedAmount
      ? parseFloat(todoItem.estimatedAmount)
      : null;
    return {
      txAmount: estAmountNum ? estAmountNum.toString() : "",
      txCurrency: todoItem.estimatedCurrency || displayCurrency,
      txDate: new Date().toISOString().substring(0, 10),
      isSubmitting: false,
    };
  });

  const { txAmount, txCurrency, txDate, isSubmitting } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isSubmitting) return;

    dispatch({ type: "SET", payload: { isSubmitting: true } });
    try {
      await onConvert({
        todoId: todoItem.id,
        amount: parseFloat(txAmount),
        currency: txCurrency,
        date: new Date(txDate).toISOString(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET", payload: { isSubmitting: false } });
    }
  };

  const showConverted =
    !!txAmount &&
    !Number.isNaN(parseFloat(txAmount)) &&
    txCurrency !== displayCurrency;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="rounded-lg bg-muted px-3.5 py-3">
          <p className="text-xs text-muted-foreground">Articolo</p>
          <p className="text-[15px] font-semibold">{todoItem.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Field className="col-span-2">
            <FieldLabel>Importo reale</FieldLabel>
            <MoneyInput
              value={txAmount}
              onChange={(val) =>
                dispatch({ type: "SET", payload: { txAmount: val } })
              }
              currency={txCurrency}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Valuta</FieldLabel>
            <CurrencySelect
              value={txCurrency}
              onChange={(val) =>
                dispatch({ type: "SET", payload: { txCurrency: val } })
              }
            />
          </Field>
        </div>

        {showConverted && (
          <div className="flex justify-between rounded-lg bg-brand-soft px-3.5 py-2.5 text-sm font-semibold text-brand">
            <span>Convertito</span>
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

        <Field>
          <FieldLabel>Data della spesa</FieldLabel>
          <CustomDatePicker
            value={txDate}
            onChange={(val) =>
              dispatch({ type: "SET", payload: { txDate: val } })
            }
          />
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting || !txAmount}
          className="h-12 w-full rounded-full text-sm font-semibold"
        >
          {isSubmitting ? "Importazione..." : "Conferma spesa"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function TodoConvertModal({
  isOpen,
  onClose,
  todoItem,
  onConvert,
}: TodoConvertModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();

  return (
    <ResponsiveSheet
      open={isOpen && todoItem !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Importa come spesa"
      description="Registra l'articolo acquistato come transazione."
    >
      {todoItem && (
        <TodoConvertForm
          key={todoItem.id}
          todoItem={todoItem}
          onClose={onClose}
          onConvert={onConvert}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
        />
      )}
    </ResponsiveSheet>
  );
}
