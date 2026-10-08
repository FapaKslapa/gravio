"use client";

import { PieChart } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatCurrency } from "@/lib/utils";

type CategoryTotal = {
  amountEur: number;
  count: number;
  color: string;
  icon: string;
  name: string;
};

type CategoryTotalsCardProps = {
  categoryTotals: CategoryTotal[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function CategoryTotalsCard({
  categoryTotals,
  displayCurrency,
  convertCurrency,
}: CategoryTotalsCardProps) {
  const totalEur = categoryTotals.reduce((sum, c) => sum + c.amountEur, 0);

  return (
    <section
      aria-labelledby="category-totals-title"
      className="elevation-1 flex flex-col gap-4 rounded-lg bg-card p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-col">
          <h2 id="category-totals-title" className="text-base font-semibold">
            Totali per categoria
          </h2>
          <p className="text-xs text-muted-foreground">
            Solo uscite, secondo i filtri attivi
          </p>
        </div>
        {totalEur > 0 && (
          <span className="tabular text-sm font-semibold">
            {formatCurrency(
              convertCurrency(totalEur, "EUR", displayCurrency),
              displayCurrency,
            )}
          </span>
        )}
      </div>

      {categoryTotals.length === 0 ? (
        <Empty className="border py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PieChart />
            </EmptyMedia>
            <EmptyTitle>Nessuna spesa</EmptyTitle>
            <EmptyDescription>
              Non ci sono spese per i criteri selezionati.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-4">
          {categoryTotals.map((tot) => {
            const displayAmount = convertCurrency(
              tot.amountEur,
              "EUR",
              displayCurrency,
            );
            const percentage =
              totalEur > 0 ? (tot.amountEur / totalEur) * 100 : 0;

            return (
              <li key={tot.name} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${tot.color} 14%, transparent)`,
                    color: tot.color,
                  }}
                >
                  <CategoryIcon name={tot.icon} size={16} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {tot.name}
                    </span>
                    <span className="tabular whitespace-nowrap text-sm font-semibold">
                      {formatCurrency(displayAmount, displayCurrency)}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${tot.name}: ${percentage.toFixed(0)}% del totale`}
                    aria-valuenow={Math.round(percentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        backgroundColor: tot.color,
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                  <div className="tabular flex justify-between text-[11px] text-muted-foreground">
                    <span>
                      {tot.count} transazion{tot.count === 1 ? "e" : "i"}
                    </span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
