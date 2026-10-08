import { CommandGroup, CommandItem } from "@/components/ui/command";
import { cn, formatCurrency } from "@/lib/utils";
import { Highlight } from "./highlight";
import { itemClass } from "./item-icon";
import type { PaletteSearch } from "./use-palette-search";

export function TransactionsGroup({
  transactions,
  categoryMap,
  go,
  query,
}: {
  transactions: PaletteSearch["transactions"];
  categoryMap: PaletteSearch["categoryMap"];
  go: (href: string) => void;
  query: string;
}) {
  if (transactions.length === 0) return null;
  return (
    <CommandGroup heading="Transazioni">
      {transactions.map((t) => {
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : null;
        const isIncome = t.type === "income";
        return (
          <CommandItem
            key={t.id}
            value={`tx-${t.id}`}
            onSelect={() =>
              go(`/transactions?q=${encodeURIComponent(t.description ?? "")}`)
            }
            className={itemClass}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: cat?.color ?? "currentColor" }}
                aria-hidden="true"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">
                <Highlight text={t.description ?? ""} query={query} />
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {cat ? (
                  <Highlight text={cat.name} query={query} />
                ) : (
                  "Senza categoria"
                )}
                {" · "}
                {new Date(t.date).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </span>
            <span
              className={cn(
                "tabular shrink-0 text-sm font-medium",
                isIncome ? "text-income" : "text-expense",
              )}
            >
              <span className="sr-only">
                {isIncome ? "Entrata " : "Spesa "}
              </span>
              {isIncome ? "+" : "-"}
              {formatCurrency(Number(t.amount), t.currency)}
            </span>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}
