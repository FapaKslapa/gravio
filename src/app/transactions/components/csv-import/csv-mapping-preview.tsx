"use client";

import { CategoryIcon } from "@/components/icon-helper";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

const CSV_FIELD_LABELS: Record<string, string> = {
  date: "Data",
  description: "Descrizione",
  amount: "Importo",
  currency: "Valuta",
  category: "Categoria",
};

const NONE = "__none__";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type PreviewRow = {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  currency: string;
  categoryId: string | null;
};

type CsvMappingStepProps = {
  csvHeaders: string[];
  csvMapping: Record<string, string>;
  onMappingChange: (field: string, val: string) => void;
};

export function CsvMappingStep({
  csvHeaders,
  csvMapping,
  onMappingChange,
}: CsvMappingStepProps) {
  return (
    <FieldGroup>
      {Object.keys(csvMapping).map((field) => {
        const missing = field === "amount" && !csvMapping.amount;
        return (
          <Field
            key={field}
            orientation="horizontal"
            data-invalid={missing || undefined}
          >
            <FieldLabel htmlFor={`csv-map-${field}`} className="w-28 shrink-0">
              {CSV_FIELD_LABELS[field] ?? field}
              {field === "amount" && (
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              )}
            </FieldLabel>
            <Select
              value={csvMapping[field] || NONE}
              onValueChange={(val) =>
                onMappingChange(field, val === NONE ? "" : val)
              }
            >
              <SelectTrigger
                id={`csv-map-${field}`}
                aria-invalid={missing || undefined}
                className="h-11 min-w-0 flex-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value={NONE}>Ignora</SelectItem>
                  {csvHeaders.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        );
      })}
      {!csvMapping.amount && (
        <p className="text-sm text-destructive">
          Scegli la colonna dell'importo per continuare.
        </p>
      )}
    </FieldGroup>
  );
}

type CsvPreviewStepProps = {
  csvPreviewRows: PreviewRow[];
  categories: Category[];
};

export function CsvPreviewStep({
  csvPreviewRows,
  categories,
}: CsvPreviewStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="tabular font-semibold text-foreground">
          {csvPreviewRows.length}
        </span>{" "}
        righe pronte. Prime {Math.min(5, csvPreviewRows.length)}:
      </p>
      <ul className="flex flex-col gap-1.5">
        {csvPreviewRows.slice(0, 5).map((row) => {
          const cat = categories.find((c) => c.id === row.categoryId);
          const color = cat?.color ?? "#8E8E93";
          return (
            <li
              key={`${row.date}-${row.amount}-${row.description}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-2.5"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}26`, color }}
              >
                <CategoryIcon name={cat?.icon ?? "Sparkles"} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {row.description}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(row.date).toLocaleDateString("it-IT")} ·{" "}
                  {cat?.name ?? "Generale"}
                </p>
              </div>
              <span
                className={cn(
                  "num-display text-sm font-semibold",
                  row.type === "expense" ? "text-expense" : "text-income",
                )}
              >
                {row.type === "expense" ? "-" : "+"}
                {formatCurrency(row.amount, row.currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
