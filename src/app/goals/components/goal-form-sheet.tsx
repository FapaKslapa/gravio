"use client";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { GoalForm } from "./goal-form";
import type { GoalFormSheetProps } from "./goal-form-types";

export type { GoalFormValues } from "./goal-form-types";

export function GoalFormSheet({
  open,
  onOpenChange,
  goal,
  defaultCurrency,
  isPending,
  onSubmit,
}: GoalFormSheetProps) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={goal ? "Modifica obiettivo" : "Nuovo obiettivo"}
      description="Scegli quanto vuoi mettere da parte e, se vuoi, entro quando."
    >
      {open && (
        <GoalForm
          key={goal?.id ?? "new"}
          goal={goal}
          defaultCurrency={defaultCurrency}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      )}
    </ResponsiveSheet>
  );
}
