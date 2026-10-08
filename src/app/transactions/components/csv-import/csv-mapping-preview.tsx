"use client";

import { TriangleAlert } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping, StatementTable } from "@/lib/import";
import type { MappingField } from "./csv-import-types";

const FIELDS: { key: MappingField; label: string; hint?: string }[] = [
  { key: "date", label: "Data" },
  { key: "description", label: "Descrizione" },
  { key: "amount", label: "Importo", hint: "con segno" },
  { key: "debit", label: "Uscite", hint: "se separate" },
  { key: "credit", label: "Entrate", hint: "se separate" },
  { key: "currency", label: "Valuta" },
];

const NONE = "__none__";

type CsvMappingStepProps = {
  table: StatementTable;
  mapping: ColumnMapping;
  warnings: string[];
  onMappingChange: (field: MappingField, index: number | null) => void;
};

export function isMappingValid(m: ColumnMapping): boolean {
  return (
    m.date !== null &&
    (m.amount !== null || m.debit !== null || m.credit !== null)
  );
}

export function CsvMappingStep({
  table,
  mapping,
  warnings,
  onMappingChange,
}: CsvMappingStepProps) {
  const valid = isMappingValid(mapping);
  return (
    <div className="flex flex-col gap-4">
      {warnings.length > 0 && <Warnings warnings={warnings} />}
      <FieldGroup>
        {FIELDS.map(({ key, label, hint }) => {
          const missing = key === "date" && mapping.date === null;
          const value = mapping[key];
          return (
            <Field
              key={key}
              orientation="horizontal"
              data-invalid={missing || undefined}
            >
              <FieldLabel
                htmlFor={`csv-map-${key}`}
                className="w-28 shrink-0 flex-col items-start gap-0"
              >
                <span>
                  {label}
                  {(key === "date" || key === "amount") && (
                    <span className="text-destructive" aria-hidden>
                      {" "}
                      *
                    </span>
                  )}
                </span>
                {hint && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {hint}
                  </span>
                )}
              </FieldLabel>
              <Select
                value={value === null ? NONE : String(value)}
                onValueChange={(v) =>
                  onMappingChange(key, v === NONE ? null : Number(v))
                }
              >
                <SelectTrigger
                  id={`csv-map-${key}`}
                  aria-invalid={missing || undefined}
                  className="h-11 min-w-0 flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value={NONE}>Ignora</SelectItem>
                    {table.headers.map((header, i) => (
                      <SelectItem
                        // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                        key={i}
                        value={String(i)}
                      >
                        {header.trim() || `Colonna ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          );
        })}
      </FieldGroup>
      {!valid && (
        <p className="text-sm text-destructive" role="alert">
          Scegli la colonna della data e quella dell'importo (oppure entrate e
          uscite) per continuare.
        </p>
      )}
    </div>
  );
}

export function Warnings({ warnings }: { warnings: string[] }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/15 p-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <ul className="flex flex-col gap-1">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
