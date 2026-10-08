"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

type CsvUploadZoneProps = {
  csvFile: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CsvUploadZone({ csvFile, onChange }: CsvUploadZoneProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:bg-muted/50",
        csvFile ? "border-income bg-income-soft" : "border-border bg-muted/30",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-card text-brand elevation-1">
        {csvFile ? (
          <FileSpreadsheet className="size-6" aria-hidden />
        ) : (
          <Upload className="size-6" aria-hidden />
        )}
      </span>
      {csvFile ? (
        <p className="max-w-full truncate text-sm font-semibold">
          {csvFile.name}
          <span className="tabular ml-2 font-normal text-muted-foreground">
            {(csvFile.size / 1024).toFixed(1)} KB
          </span>
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold">
            Trascina qui il file CSV o tocca per caricarlo
          </p>
          <p className="text-xs text-muted-foreground">
            Separatore virgola (,) o punto e virgola (;)
          </p>
        </>
      )}
      <input
        type="file"
        aria-label="Carica file CSV"
        accept=".csv"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={onChange}
      />
    </div>
  );
}
