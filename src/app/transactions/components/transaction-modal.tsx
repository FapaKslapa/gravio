"use client";

import type React from "react";
import { useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { FieldGroup } from "@/components/ui/field";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  useCategorySuggestion,
  useDebouncedValue,
} from "@/hooks/use-category-suggestion";
import {
  AmountField,
  CategorySection,
  ConversionBadge,
  CurrencyField,
  DateField,
  DescriptionField,
  SubmitButton,
  TransactionTypeToggle,
} from "./transaction-modal-fields";
import { todayISO, useTransactionForm } from "./use-transaction-form";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Category = { id: string; name: string; icon: string; color: string };

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingTx?: {
    id: string;
    description: string | null;
    type: "expense" | "income";
    amount: string;
    currency: string;
    categoryId: string | null;
    date: string | Date;
  } | null;
  onSave: (tx: {
    id?: string;
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => Promise<void>;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<{ id: string }>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TransactionModal({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSave,
  onCreateCategory,
}: TransactionModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();
  const [submitted, setSubmitted] = useState(false);
  const { form, set, reset } = useTransactionForm(displayCurrency);

  // Sync editingTx → form when the prop changes (derived-state-on-render)
  const [prevTx, dispatchPrev] = useReducer(
    (_: typeof editingTx, next: typeof editingTx) => next,
    editingTx,
  );
  if (editingTx !== prevTx) {
    dispatchPrev(editingTx);
    if (editingTx) {
      const parsedDate = new Date(editingTx.date);
      set({
        txDesc: editingTx.description ?? "",
        txType: editingTx.type,
        txAmount: parseFloat(editingTx.amount).toString(),
        txCurrency: editingTx.currency,
        txDate: !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().substring(0, 10)
          : todayISO(),
        txCategoryId: editingTx.categoryId ?? "",
      });
    } else {
      reset();
    }
  }

  // Derived
  const parsedAmount = parseFloat(form.txAmount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const showConversion = hasAmount && form.txCurrency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, form.txCurrency, displayCurrency)
    : null;

  const suggest = useCategorySuggestion(isOpen);
  const debouncedDesc = useDebouncedValue(form.txDesc, 200);
  const suggestedCategoryId = form.txCategoryId ? null : suggest(debouncedDesc);

  // Handlers
  const handleCreateCategoryInline = async () => {
    if (!form.newCatName) return;
    try {
      const cat = await onCreateCategory({
        name: form.newCatName,
        icon: form.newCatIcon,
        color: form.newCatColor,
      });
      set({ txCategoryId: cat.id, newCatName: "", isInlineCatOpen: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!hasAmount || !form.txDesc.trim() || form.isSubmitting) return;
    set({ isSubmitting: true });
    try {
      await onSave({
        id: editingTx?.id,
        description: form.txDesc,
        type: form.txType,
        amount: parsedAmount,
        currency: form.txCurrency,
        categoryId: form.txCategoryId || null,
        date: new Date(form.txDate).toISOString(),
      });
      reset();
      setSubmitted(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      set({ isSubmitting: false });
    }
  };

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSubmitted(false);
          onClose();
        }
      }}
      title={editingTx ? "Modifica transazione" : "Registra transazione"}
      description={
        editingTx
          ? "Modifica i dettagli della transazione"
          : "Nuova spesa o guadagno"
      }
      className="md:max-w-md"
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <AmountField
            amount={form.txAmount}
            currency={form.txCurrency}
            type={form.txType}
            invalid={submitted && !hasAmount}
            onChange={(v) => set({ txAmount: v })}
          />
          {convertedAmount !== null && (
            <ConversionBadge
              parsedAmount={parsedAmount}
              convertedAmount={convertedAmount}
              sourceCurrency={form.txCurrency}
              targetCurrency={displayCurrency}
            />
          )}
        </div>
        <TransactionTypeToggle
          value={form.txType}
          onChange={(v) => set({ txType: v })}
        />
        <FieldGroup className="gap-6">
          <CategorySection
            categoryId={form.txCategoryId}
            suggestedCategoryId={suggestedCategoryId}
            categories={categories}
            onCategoryChange={(v) => set({ txCategoryId: v })}
            isInlineCatOpen={form.isInlineCatOpen}
            onToggleInlineCat={() =>
              set({ isInlineCatOpen: !form.isInlineCatOpen })
            }
            newCatName={form.newCatName}
            onNewCatNameChange={(v) => set({ newCatName: v })}
            newCatColor={form.newCatColor}
            onNewCatColorChange={(v) => set({ newCatColor: v })}
            newCatIcon={form.newCatIcon}
            onNewCatIconChange={(v) => set({ newCatIcon: v })}
            onCreateCategory={handleCreateCategoryInline}
          />
          <div className="grid grid-cols-2 gap-3">
            <DateField
              value={form.txDate}
              onChange={(v) => set({ txDate: v })}
            />
            <CurrencyField
              currency={form.txCurrency}
              onChange={(v) => set({ txCurrency: v })}
            />
          </div>
          <DescriptionField
            value={form.txDesc}
            invalid={submitted && !form.txDesc.trim()}
            onChange={(v) => set({ txDesc: v })}
          />
        </FieldGroup>
        <SubmitButton isSubmitting={form.isSubmitting} type={form.txType} />
      </form>
    </ResponsiveSheet>
  );
}
