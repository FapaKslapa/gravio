"use client";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { SubmitButton } from "./transaction-modal-fields";
import { TransactionModalForm } from "./transaction-modal-form";
import type { TransactionModalProps } from "./transaction-modal-types";
import { useTransactionModal } from "./use-transaction-modal";

export function TransactionModal({
  categories,
  ...props
}: TransactionModalProps) {
  const { isOpen, onClose, editingTx } = props;
  const state = useTransactionModal(props);
  const { form, setSubmitted } = state;

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
      footer={
        <SubmitButton isSubmitting={form.isSubmitting} type={form.txType} />
      }
    >
      <TransactionModalForm {...state} categories={categories} />
    </ResponsiveSheet>
  );
}
