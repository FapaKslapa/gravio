"use client";

import { useDashboard } from "@/components/dashboard-layout";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { TodoBulkConvertForm } from "./todo-bulk-convert-form";
import type { TodoBulkConvertModalProps } from "./todo-bulk-convert-types";

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
