"use client";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { RecurrentTransactionForm } from "./recurrent/recurrent-form";
import type { CategoryOption, RecurrentTx } from "./recurrent/recurrent-types";

type RecurrentTransactionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  editingTx: RecurrentTx | null;
  onSubmitSuccess: () => void;
};

export function RecurrentTransactionDrawer({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSubmitSuccess,
}: RecurrentTransactionDrawerProps) {
  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={editingTx ? "Modifica regola" : "Nuova regola ricorrente"}
      description={
        editingTx
          ? "Aggiorna i dettagli della regola ricorrente"
          : "Imposta una spesa o entrata ripetitiva"
      }
      className="md:max-w-md"
    >
      <RecurrentTransactionForm
        editingTx={editingTx}
        categories={categories}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />
    </ResponsiveSheet>
  );
}
