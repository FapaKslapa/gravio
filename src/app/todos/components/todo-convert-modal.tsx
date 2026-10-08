"use client";

import { useDashboard } from "@/components/dashboard-layout";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { TodoConvertForm } from "./todo-convert-form";
import type { TodoConvertModalProps } from "./todo-convert-types";

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
