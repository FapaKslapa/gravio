"use client";

import {
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CsvUploadZoneProps = {
  file: File | null;
  parsing: boolean;
  error: string | null;
  onFile: (file: File) => void;
};

const ACCEPT = ".csv,.xlsx,.pdf,.txt";

export function CsvUploadZone({
  file,
  parsing,
  error,
  onFile,
}: CsvUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isPdf = file?.name.toLowerCase().endsWith(".pdf");
  const FileIcon = isPdf ? FileText : FileSpreadsheet;

  const pick = (f: File | undefined) => {
    if (f && !parsing) onFile(f);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drop target, the button inside is the accessible control */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-brand bg-brand-soft" : "border-border bg-muted/30",
          error && "border-destructive/60",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-card text-brand elevation-1">
          {parsing ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : file ? (
            <FileIcon className="size-6" aria-hidden />
          ) : (
            <Upload className="size-6" aria-hidden />
          )}
        </span>

        {file ? (
          <div className="min-w-0 max-w-full" aria-live="polite">
            <p className="truncate text-sm font-semibold">{file.name}</p>
            <p className="tabular text-xs text-muted-foreground">
              {parsing
                ? "Lettura del file in corso..."
                : `${(file.size / 1024).toFixed(1)} KB`}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">
              Trascina qui l'estratto conto
            </p>
            <p className="text-xs text-muted-foreground">
              CSV, Excel (.xlsx) o PDF
            </p>
          </div>
        )}

        <Button
          type="button"
          variant={file ? "outline" : "default"}
          disabled={parsing}
          className={cn(
            "h-12 w-full max-w-xs",
            !file && "bg-brand text-brand-foreground hover:bg-brand/90",
          )}
          onClick={() => inputRef.current?.click()}
        >
          {file ? "Scegli un altro file" : "Scegli file"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          aria-label="Carica estratto conto"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-expense-soft p-3 text-sm text-foreground"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden
          />
          <p>{error}</p>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Il file resta sul tuo dispositivo: viene letto qui e non viene caricato
        su nessun server.
      </p>
    </div>
  );
}
