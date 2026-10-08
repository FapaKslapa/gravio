"use client";

import dayjs from "dayjs";
import { ChevronDown, Receipt } from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn, formatCurrency } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Transaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: "expense" | "income";
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: string;
  date: string | Date;
};

type RecentLogsProps = {
  sortedTimeline: Transaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  selectedDay?: number | null;
};

const PAGE_SIZE = 12;

export function RecentLogs({
  sortedTimeline,
  categories,
  displayCurrency,
  convertCurrency,
  selectedDay,
}: RecentLogsProps) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));
  const visible = sortedTimeline.slice(0, shown);
  const remaining = sortedTimeline.length - visible.length;

  return (
    <section className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-semibold">
          Movimenti recenti
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedDay
            ? `Solo il giorno ${selectedDay} del mese selezionato`
            : "Tutti i movimenti del mese selezionato"}
        </p>
      </div>

      {sortedTimeline.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>Nessun movimento</EmptyTitle>
            <EmptyDescription>
              Non ci sono transazioni nel periodo scelto.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border">
            {visible.map((tx) => {
              const isExpense = tx.type === "expense";
              const cat = tx.categoryId
                ? categoriesMap.get(tx.categoryId)
                : undefined;
              const color = cat?.color || "#8e8e93";
              const amount = convertCurrency(
                parseFloat(tx.amountNok) || 0,
                "NOK",
                displayCurrency,
              );
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${color}26`, color }}
                    aria-hidden
                  >
                    <CategoryIcon name={cat?.icon || "HelpCircle"} size={18} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {tx.description || "Nessuna descrizione"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {cat?.name || "Altro"} · {dayjs(tx.date).format("D MMM")}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular",
                        isExpense ? "text-expense" : "text-income",
                      )}
                    >
                      {isExpense ? "−" : "+"}
                      {formatCurrency(amount, displayCurrency)}
                    </span>
                    {tx.currency !== displayCurrency && (
                      <span className="text-xs text-muted-foreground tabular">
                        {tx.amount} {tx.currency}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-muted text-sm font-semibold outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            >
              Mostra altri {Math.min(remaining, PAGE_SIZE)}
              <ChevronDown className="size-4" aria-hidden />
            </button>
          )}
        </>
      )}
    </section>
  );
}
