"use client";

import { AnimatePresence, m } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { fadeUp } from "@/lib/motion";
import { CsvImportFooter } from "./csv-import/csv-import-footer";
import type {
  ImportCategory,
  ImportRow,
  MappingField,
} from "./csv-import/csv-import-types";
import { CsvMappingStep } from "./csv-import/csv-mapping-preview";
import { CsvPreviewStep } from "./csv-import/csv-preview-step";
import { CsvUploadZone } from "./csv-import/csv-upload-zone";
import { useCsvImport } from "./csv-import/use-csv-import";

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: ImportCategory[];
  onImport: (rows: ImportRow[]) => Promise<void>;
};

const STEP_INFO = [
  {
    title: "Carica il file",
    hint: "CSV, Excel o PDF. Il file resta sul tuo dispositivo.",
  },
  {
    title: "Associa le colonne",
    hint: "Abbiamo già scelto le colonne più probabili: correggile se serve.",
  },
  {
    title: "Controlla e importa",
    hint: "Deseleziona i movimenti che non vuoi importare.",
  },
];

export function CsvImportModal({
  isOpen,
  onClose,
  categories,
  onImport,
}: CsvImportModalProps) {
  const c = useCsvImport({ isOpen, onClose, onImport });
  const { step, result, mapping } = c;
  const warnings = result?.warnings ?? [];
  const info = STEP_INFO[step];
  const totalSteps = result?.table || step === 0 ? 3 : 2;

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) c.close();
      }}
      title="Importa estratto conto"
      description={info.title}
      className="md:max-w-xl"
    >
      <div className="flex flex-col gap-5">
        <Progress
          value={((step === 2 ? totalSteps : step + 1) / totalSteps) * 100}
          aria-label={info.title}
        />
        <p className="-mt-2 text-sm text-muted-foreground">{info.hint}</p>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={step}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
          >
            {step === 0 && (
              <CsvUploadZone
                file={c.file}
                parsing={c.parsing}
                error={c.error}
                onFile={c.handleFile}
              />
            )}
            {step === 1 && result?.table && mapping && (
              <CsvMappingStep
                table={result.table}
                mapping={mapping}
                warnings={warnings}
                onMappingChange={(field: MappingField, index) =>
                  c.setMapping({ ...mapping, [field]: index })
                }
              />
            )}
            {step === 2 && (
              <CsvPreviewStep
                items={c.items}
                categories={categories}
                warnings={result?.table ? [] : warnings}
                onToggle={c.toggle}
                onToggleAll={c.toggleAll}
                onFlip={c.flip}
                onFlipAll={c.flipAll}
                onCategory={c.setCategory}
              />
            )}
          </m.div>
        </AnimatePresence>

        <CsvImportFooter
          step={step}
          mapping={mapping}
          mappedCount={c.mappedRows.length}
          count={c.count}
          isImporting={c.isImporting}
          onCancel={c.close}
          onBack={c.goBack}
          onContinue={c.goToPreview}
          onSubmit={c.handleSubmit}
        />
      </div>
    </ResponsiveSheet>
  );
}
