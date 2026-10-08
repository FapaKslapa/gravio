import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecurrentFormFields } from "../recurrent-form-fields";
import type { CategoryOption, RecurrentTx } from "./recurrent-types";
import { useRecurrentForm } from "./use-recurrent-form";

type Props = {
  editingTx: RecurrentTx | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export function RecurrentTransactionForm({
  editingTx,
  categories,
  onClose,
  onSubmitSuccess,
}: Props) {
  const { state, setField, showErrors, handleSubmit } = useRecurrentForm({
    editingTx,
    onClose,
    onSubmitSuccess,
  });
  const { type, validationError, isSubmitting } = state;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <RecurrentFormFields
        showErrors={showErrors}
        description={state.description}
        setDescription={(v) => setField("description", v)}
        amount={state.amount}
        setAmount={(v) => setField("amount", v)}
        currency={state.currency}
        setCurrency={(v) => setField("currency", v)}
        categoryId={state.categoryId}
        setCategoryId={(v) => setField("categoryId", v)}
        type={type}
        setType={(v) => setField("type", v)}
        frequency={state.frequency}
        setFrequency={(v) => setField("frequency", v)}
        startDate={state.startDate}
        setStartDate={(v) => setField("startDate", v)}
        endDate={state.endDate}
        setEndDate={(v) => setField("endDate", v)}
        categories={categories}
      />

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
        {validationError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {validationError}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onClose}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-12 flex-[2] text-white",
              type === "expense"
                ? "bg-expense hover:bg-expense/90"
                : "bg-income hover:bg-income/90",
            )}
          >
            {isSubmitting
              ? "Salvataggio..."
              : editingTx
                ? "Salva regola"
                : "Crea regola"}
          </Button>
        </div>
      </div>
    </form>
  );
}
