import { History, Repeat } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { CategoryType, RecentTx } from "./quick-add-types";

export function RecentsSection({
  recents,
  categories,
  onApply,
}: {
  recents: RecentTx[];
  categories: CategoryType[];
  onApply: (t: RecentTx) => void;
}) {
  if (recents.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <History className="size-4" aria-hidden="true" />
          Recenti
        </p>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-full px-3 text-brand"
          onClick={() => onApply(recents[0] as RecentTx)}
        >
          <Repeat data-icon="inline-start" />
          Ripeti ultima
        </Button>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {recents.map((t) => {
          const cat = categories.find((c) => c.id === t.categoryId);
          const label = t.description || cat?.name || "Senza nome";
          return (
            <button
              key={`${t.type}-${t.categoryId}-${t.amount}-${t.currency}-${t.description}`}
              type="button"
              onClick={() => onApply(t)}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border bg-card px-3.5 text-sm font-medium transition-colors active:scale-[0.97]"
            >
              {cat && (
                <span style={{ color: cat.color }}>
                  <CategoryIcon name={cat.icon} size={16} />
                </span>
              )}
              <span className="max-w-28 truncate">{label}</span>
              <span
                className={cn(
                  "tabular font-semibold",
                  t.type === "income" ? "text-income" : "text-expense",
                )}
              >
                {formatCurrency(parseFloat(t.amount), t.currency)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
