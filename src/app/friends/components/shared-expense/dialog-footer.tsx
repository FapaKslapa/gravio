import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormState } from "./types";

type Props = {
  step: FormState["step"];
  splitBlocked: boolean;
  canSave: boolean;
  isSaving: boolean;
  onGoToSummary: () => void;
  onSave: () => void;
};

export function DialogFooter({
  step,
  splitBlocked,
  canSave,
  isSaving,
  onGoToSummary,
  onSave,
}: Props) {
  return step === "form" ? (
    <Button
      type="submit"
      form="shared-expense-form"
      className="h-12 w-full text-base"
    >
      Continua
      <ArrowRight data-icon="inline-end" />
    </Button>
  ) : step === "split" ? (
    <Button
      type="button"
      disabled={splitBlocked}
      onClick={() => onGoToSummary()}
      className="h-12 w-full text-base"
    >
      Vai al riepilogo
      <ArrowRight data-icon="inline-end" />
    </Button>
  ) : (
    <Button
      type="button"
      disabled={!canSave || isSaving}
      onClick={onSave}
      className="h-12 w-full text-base"
    >
      {isSaving ? (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      ) : (
        <Check data-icon="inline-start" />
      )}
      {isSaving ? "Salvataggio..." : "Aggiungi spesa"}
    </Button>
  );
}
