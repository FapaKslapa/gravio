"use client";

import { ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import type { ImportCategory, PreviewItem } from "./csv-import-types";
import { Warnings } from "./csv-mapping-preview";

const NONE = "__none__";

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

export function summarize(items: PreviewItem[]) {
  const selected = items.filter((i) => i.selected);
  const totals = new Map<string, { income: number; expense: number }>();
  for (const i of selected) {
    const t = totals.get(i.currency) ?? { income: 0, expense: 0 };
    if (i.amount >= 0) t.income += i.amount;
    else t.expense += Math.abs(i.amount);
    totals.set(i.currency, t);
  }
  return { count: selected.length, totals: [...totals.entries()] };
}

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

      <div className="rounded-lg border bg-card p-3" aria-live="polite">
        <p className="text-sm font-semibold">
          <span className="tabular">{count}</span> movimenti
          {duplicates > 0 && (
            <span className="font-normal text-muted-foreground">
              {" "}
              ({duplicates} già presenti)
            </span>
          )}
        </p>
        {totals.map(([cur, t]) => (
          <p key={cur} className="num-display mt-1 text-sm">
            <span className="text-income">
              Entrate +{formatCurrency(t.income, cur)}
            </span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-expense">
              Uscite -{formatCurrency(t.expense, cur)}
            </span>
          </p>
        ))}
      </div>

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
        {items.map((row) => {
          const cat = row.categoryId ? catMap.get(row.categoryId) : undefined;
          const color = cat?.color ?? "#8E8E93";
          const expense = row.amount < 0;
          return (
            <li
              key={row.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-2.5 transition-opacity",
                !row.selected && "opacity-55",
              )}
            >
              <Checkbox
                className="mt-3"
                checked={row.selected}
                aria-label={`Importa ${row.description || "movimento"}`}
                onCheckedChange={(v) => onToggle(row.id, v === true)}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {row.description || "Movimento"}
                    </p>
                    <p className="tabular text-xs text-muted-foreground">
                      {new Date(`${row.date}T00:00:00`).toLocaleDateString(
                        "it-IT",
                      )}{" "}
                      · {row.currency}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "num-display shrink-0 text-sm font-semibold",
                      expense ? "text-expense" : "text-income",
                    )}
                  >
                    {expense ? "-" : "+"}
                    {formatCurrency(Math.abs(row.amount), row.currency)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-full px-3"
                    aria-label={`Tipo: ${expense ? "spesa" : "entrata"}. Tocca per cambiare`}
                    onClick={() => onFlip(row.id)}
                  >
                    <ArrowLeftRight data-icon="inline-start" />
                    {expense ? "Spesa" : "Entrata"}
                  </Button>
                  <Select
                    value={row.categoryId ?? NONE}
                    onValueChange={(v) =>
                      onCategory(row.id, v === NONE ? null : v)
                    }
                  >
                    <SelectTrigger
                      aria-label="Categoria"
                      className="h-10 w-full max-w-56 gap-2"
                      style={cat ? { borderColor: `${color}66` } : undefined}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="flex size-5 shrink-0 items-center justify-center rounded"
                          style={{ backgroundColor: `${color}26`, color }}
                        >
                          <CategoryIcon
                            name={cat?.icon ?? "Sparkles"}
                            size={12}
                          />
                        </span>
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value={NONE}>Generale</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {row.duplicate && (
                    <Badge variant="outline" className="border-warning">
                      Possibile duplicato
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
