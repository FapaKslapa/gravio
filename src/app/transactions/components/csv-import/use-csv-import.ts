import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import {
  applyMapping,
  type ColumnMapping,
  type ParseResult,
  parseStatement,
} from "@/lib/import";
import { useTRPC } from "@/lib/trpc/client";
import { buildPreviewItems, toImportRows } from "./build-items";
import type { ImportRow } from "./csv-import-types";
import { summarize } from "./csv-summary";
import { usePreviewItems } from "./use-preview-items";

export type Step = 0 | 1 | 2;

type Args = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => Promise<void>;
};

export function useCsvImport({ isOpen, onClose, onImport }: Args) {
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
  const { items, setItems, ...itemActions } = usePreviewItems();
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
        setItems(buildPreviewItems(parsed.rows, history));
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
    setItems(buildPreviewItems(mappedRows, history));
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
      await onImport(toImportRows(items, rates));
      close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    step,
    file,
    parsing,
    error,
    result,
    mapping,
    setMapping,
    items,
    isImporting,
    mappedRows,
    count,
    close,
    handleFile,
    goToPreview,
    goBack,
    handleSubmit,
    ...itemActions,
  };
}
