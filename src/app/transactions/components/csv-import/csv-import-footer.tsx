import { Button } from "@/components/ui/button";
import type { ColumnMapping } from "@/lib/import";
import { isMappingValid } from "./csv-mapping-valid";
import type { Step } from "./use-csv-import";

type Props = {
  step: Step;
  mapping: ColumnMapping | null;
  mappedCount: number;
  count: number;
  isImporting: boolean;
  onCancel: () => void;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
};

export function CsvImportFooter({
  step,
  mapping,
  mappedCount,
  count,
  isImporting,
  onCancel,
  onBack,
  onContinue,
  onSubmit,
}: Props) {
  return (
    <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
      <Button
        type="button"
        variant="outline"
        className="h-12 flex-1"
        onClick={() => (step === 0 ? onCancel() : onBack())}
      >
        {step === 0 ? "Annulla" : "Indietro"}
      </Button>
      {step === 1 && (
        <Button
          type="button"
          disabled={!mapping || !isMappingValid(mapping) || mappedCount === 0}
          className="h-12 flex-[2] bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={onContinue}
        >
          {mapping && isMappingValid(mapping)
            ? `Continua (${mappedCount} righe)`
            : "Continua"}
        </Button>
      )}
      {step === 2 && (
        <Button
          type="button"
          disabled={count === 0 || isImporting}
          className="h-12 flex-[2] bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={onSubmit}
        >
          {isImporting
            ? "Importazione..."
            : `Importa ${count} ${count === 1 ? "movimento" : "movimenti"}`}
        </Button>
      )}
    </div>
  );
}
