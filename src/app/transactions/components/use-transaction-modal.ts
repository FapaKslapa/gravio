import type React from "react";
import { useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import {
  useCategorySuggestion,
  useDebouncedValue,
} from "@/hooks/use-category-suggestion";
import type { TransactionModalProps } from "./transaction-modal-types";
import { todayISO, useTransactionForm } from "./use-transaction-form";

export function useTransactionModal({
  isOpen,
  onClose,
  editingTx,
  onSave,
  onCreateCategory,
}: Omit<TransactionModalProps, "categories">) {
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

  return {
    form,
    set,
    submitted,
    setSubmitted,
    parsedAmount,
    hasAmount,
    convertedAmount,
    displayCurrency,
    suggestedCategoryId,
    handleCreateCategoryInline,
    handleSubmit,
  };
}
