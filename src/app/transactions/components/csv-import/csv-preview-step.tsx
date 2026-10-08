"use client";

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ImportCategory, PreviewItem } from "./csv-import-types";
import { Warnings } from "./csv-mapping-preview";
import { CsvPreviewRow } from "./csv-preview-row";
import { CsvPreviewSummary } from "./csv-preview-summary";
import { summarize } from "./csv-summary";

type CsvPreviewStepProps = {
  items: PreviewItem[];
  categories: ImportCategory[];
  warnings: string[];
  onToggle: (id: number, selected: boolean) => void;
  onToggleAll: (selected: boolean) => void;
  onCategory: (id: number, categoryId: string | null) => void;
  onFlip: (id: number) => void;
  onFlipAll: () => void;
};

export function CsvPreviewStep({
  items,
  categories,
  warnings,
  onToggle,
  onToggleAll,
  onCategory,
  onFlip,
  onFlipAll,
}: CsvPreviewStepProps) {
  const { count, totals } = summarize(items);
  const duplicates = items.filter((i) => i.duplicate).length;
  const allChecked = count === items.length;
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const noExpenses =
    count > 0 && totals.every(([, t]) => t.expense === 0 && t.income > 0);
  const noIncome =
    count > 0 && totals.every(([, t]) => t.income === 0 && t.expense > 0);

  return (
    <div className="flex flex-col gap-3">
      {warnings.length > 0 && <Warnings warnings={warnings} />}

      <CsvPreviewSummary
        count={count}
        duplicates={duplicates}
        totals={totals}
      />

      {(noExpenses || noIncome) && (
        <p
          role="status"
          className="rounded-lg border border-warning bg-warning/10 p-3 text-sm"
        >
          {noExpenses
            ? "Nessuna uscita trovata: se la tua banca indica le spese come importi positivi, inverti entrate e uscite."
            : "Nessuna entrata trovata: se alcune righe sono accrediti, toccane il tipo per cambiarlo."}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="csv-select-all"
          className="flex min-h-11 items-center gap-3 px-1 text-sm font-medium"
        >
          <Checkbox
            id="csv-select-all"
            checked={allChecked ? true : count === 0 ? false : "indeterminate"}
            onCheckedChange={(v) => onToggleAll(v === true)}
          />
          Seleziona tutti
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 rounded-full px-4"
          onClick={onFlipAll}
        >
          <ArrowLeftRight data-icon="inline-start" />
          Inverti
        </Button>
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.map((row) => (
          <CsvPreviewRow
            key={row.id}
            row={row}
            category={row.categoryId ? catMap.get(row.categoryId) : undefined}
            categories={categories}
            onToggle={onToggle}
            onCategory={onCategory}
            onFlip={onFlip}
          />
        ))}
      </ul>
    </div>
  );
}
