"use client";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  applyMapping,
  type ColumnMapping,
  markDuplicates,
  type ParseResult,
  parseStatement,
  suggestCategory,
} from "@/lib/import";
import { fadeUp } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";
import type {
  ImportCategory,
  ImportRow,
  MappingField,
  PreviewItem,
} from "./csv-import/csv-import-types";
import {
  CsvMappingStep,
  isMappingValid,
} from "./csv-import/csv-mapping-preview";
import { CsvPreviewStep, summarize } from "./csv-import/csv-preview-step";
import { CsvUploadZone } from "./csv-import/csv-upload-zone";

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: ImportCategory[];
  onImport: (rows: ImportRow[]) => Promise<void>;
};

type Step = 0 | 1 | 2;

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
  const { rates } = useDashboard();
  const trpc = useTRPC();
  const { data: history } = useQuery(
    trpc.transaction.list.queryOptions(
      { limit: 3000, page: 1 },
      { enabled: isOpen },
    ),
  );

  const [step, setStep] = useState<Step>(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const reset = () => {
    setStep(0);
    setFile(null);
    setParsing(false);
    setError(null);
    setResult(null);
    setMapping(null);
    setItems([]);
    setIsImporting(false);
  };

  const close = () => {
    onClose();
    reset();
  };

  const buildItems = (rows: ParseResult["rows"]): PreviewItem[] => {
    const existing = (history ?? []).map((t) => ({
      date: dayjs(t.date).format("YYYY-MM-DD"),
      amount: Number(t.amount),
      description: t.description ?? "",
    }));
    const hist = (history ?? []).map((t) => ({
      description: t.description ?? "",
      categoryId: t.categoryId,
    }));
    return markDuplicates(rows, existing).map((r, id) => ({
      id,
      date: r.date,
      description: r.description,
      amount: r.amount,
      currency: r.currency ?? "EUR",
      duplicate: r.duplicate,
      categoryId: suggestCategory(r.description, hist),
      selected: !r.duplicate,
    }));
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setError(null);
    setParsing(true);
    try {
      const parsed = await parseStatement(f);
      if (parsed.table) {
        setResult(parsed);
        setMapping(parsed.table.mapping);
        setStep(1);
      } else if (parsed.rows.length === 0) {
        setError(
          parsed.warnings[0] ??
            "Non abbiamo trovato movimenti. Se il PDF è una scansione, prova a scaricare l'estratto in CSV.",
        );
      } else {
        setResult(parsed);
        setItems(buildItems(parsed.rows));
        setStep(2);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossibile leggere questo file.",
      );
    } finally {
      setParsing(false);
    }
  };

  const mappedRows = useMemo(
    () =>
      result?.table && mapping
        ? applyMapping(result.table.rows, mapping, { defaultCurrency: "EUR" })
        : [],
    [result, mapping],
  );

  const goToPreview = () => {
    setItems(buildItems(mappedRows));
    setStep(2);
  };

  const goBack = () => {
    if (step === 2 && !result?.table) {
      reset();
      return;
    }
    setStep((step - 1) as Step);
  };

  const { count } = summarize(items);

  const handleSubmit = async () => {
    if (count === 0 || isImporting) return;
    setIsImporting(true);
    try {
      const nokRate = rates.NOK ?? 11.85;
      await onImport(
        items
          .filter((i) => i.selected)
          .map((i) => ({
            type: i.amount < 0 ? "expense" : "income",
            amount: Math.abs(i.amount),
            currency: i.currency,
            exchangeRate: rates[i.currency] ?? 1,
            exchangeRateNok: nokRate,
            description: i.description || "Movimento importato",
            categoryId: i.categoryId,
            date: dayjs(i.date).toISOString(),
          })),
      );
      close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const warnings = result?.warnings ?? [];
  const info = STEP_INFO[step];
  const totalSteps = result?.table || step === 0 ? 3 : 2;

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
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
                file={file}
                parsing={parsing}
                error={error}
                onFile={handleFile}
              />
            )}
            {step === 1 && result?.table && mapping && (
              <CsvMappingStep
                table={result.table}
                mapping={mapping}
                warnings={warnings}
                onMappingChange={(field: MappingField, index) =>
                  setMapping({ ...mapping, [field]: index })
                }
              />
            )}
            {step === 2 && (
              <CsvPreviewStep
                items={items}
                categories={categories}
                warnings={result?.table ? [] : warnings}
                onToggle={(id, selected) =>
                  setItems((prev) =>
                    prev.map((i) => (i.id === id ? { ...i, selected } : i)),
                  )
                }
                onToggleAll={(selected) =>
                  setItems((prev) => prev.map((i) => ({ ...i, selected })))
                }
                onCategory={(id, categoryId) =>
                  setItems((prev) =>
                    prev.map((i) => (i.id === id ? { ...i, categoryId } : i)),
                  )
                }
              />
            )}
          </m.div>
        </AnimatePresence>

        <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={() => (step === 0 ? close() : goBack())}
          >
            {step === 0 ? "Annulla" : "Indietro"}
          </Button>
          {step === 1 && (
            <Button
              type="button"
              disabled={
                !mapping || !isMappingValid(mapping) || mappedRows.length === 0
              }
              className="h-12 flex-[2] bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={goToPreview}
            >
              {mapping && isMappingValid(mapping)
                ? `Continua (${mappedRows.length} righe)`
                : "Continua"}
            </Button>
          )}
          {step === 2 && (
            <Button
              type="button"
              disabled={count === 0 || isImporting}
              className="h-12 flex-[2] bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleSubmit}
            >
              {isImporting
                ? "Importazione..."
                : `Importa ${count} ${count === 1 ? "movimento" : "movimenti"}`}
            </Button>
          )}
        </div>
      </div>
    </ResponsiveSheet>
  );
}
