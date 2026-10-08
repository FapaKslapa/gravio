"use client";

import { ChevronDown, PieChart } from "lucide-react";
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

type CategoryExpense = {
  id: string;
  amount: number;
  color: string;
  name: string;
  icon: string;
  percentage: number;
};

type CategoryBreakdownProps = {
  categoryExpenses: CategoryExpense[];
  totalExpense: number;
  displayCurrency: string;
};

const INITIAL_COUNT = 6;

export function CategoryBreakdown({
  categoryExpenses,
  totalExpense,
  displayCurrency,
}: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? categoryExpenses
    : categoryExpenses.slice(0, INITIAL_COUNT);
  const maxAmount = categoryExpenses[0]?.amount || 1;
  const hidden = categoryExpenses.length - INITIAL_COUNT;

  return (
    <section className="elevation-1 flex flex-col gap-4 rounded-lg bg-card p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-semibold">
          Spese per categoria
        </h2>
        <p className="text-sm text-muted-foreground">
          {categoryExpenses.length > 0 ? (
            <>
              Totale{" "}
              <span className="font-semibold text-foreground tabular">
                {formatCurrency(totalExpense, displayCurrency)}
              </span>
            </>
          ) : (
            "Ripartizione delle uscite del mese"
          )}
        </p>
      </div>

      {categoryExpenses.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PieChart />
            </EmptyMedia>
            <EmptyTitle>Nessuna spesa</EmptyTitle>
            <EmptyDescription>
              Le uscite di questo mese appariranno qui, ordinate per peso.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ol className="flex flex-col gap-4">
            {visible.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: `${cat.color}26`,
                    color: cat.color,
                  }}
                  aria-hidden
                >
                  <CategoryIcon name={cat.icon} size={18} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium">
                      {cat.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular">
                      {formatCurrency(cat.amount, displayCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max((cat.amount / maxAmount) * 100, 2)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-muted text-sm font-semibold outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            >
              {expanded ? "Mostra meno" : `Mostra altre ${hidden}`}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          )}
        </>
      )}
    </section>
  );
}
