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

const NONE = "__none__";

type Props = {
  row: PreviewItem;
  category?: ImportCategory;
  categories: ImportCategory[];
  onToggle: (id: number, selected: boolean) => void;
  onCategory: (id: number, categoryId: string | null) => void;
  onFlip: (id: number) => void;
};

export function CsvPreviewRow({
  row,
  category: cat,
  categories,
  onToggle,
  onCategory,
  onFlip,
}: Props) {
  const color = cat?.color ?? "#8E8E93";
  const expense = row.amount < 0;
  return (
    <li
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
              {new Date(`${row.date}T00:00:00`).toLocaleDateString("it-IT")} ·{" "}
              {row.currency}
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
            onValueChange={(v) => onCategory(row.id, v === NONE ? null : v)}
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
                  <CategoryIcon name={cat?.icon ?? "Sparkles"} size={12} />
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
}
