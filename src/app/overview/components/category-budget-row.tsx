import { m } from "motion/react";
import { CategoryIcon } from "@/components/icon-helper";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

import type { CategoryBudgetItem } from "./category-budget-items";

export function CategoryBudgetRow({
  item,
  displayCurrency,
}: {
  item: CategoryBudgetItem;
  displayCurrency: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `color-mix(in oklch, ${item.categoryColor} 15%, transparent)`,
              color: item.categoryColor,
            }}
          >
            <CategoryIcon name={item.categoryIcon} size={16} />
          </span>
          <span className="truncate text-sm font-semibold">
            {item.categoryName}
          </span>
        </div>
        <span className="tabular shrink-0 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatCurrency(item.spentVal, displayCurrency)}
          </span>{" "}
          / {formatCurrency(item.budgetVal, displayCurrency)}
        </span>
      </div>
      <div
        className="h-2.5 w-full rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(item.progressPercent)}
        aria-label={`${item.categoryName}: ${item.percentage.toFixed(0)}% del budget`}
      >
        <m.div
          initial={{ width: 0 }}
          animate={{ width: `${item.progressPercent}%` }}
          transition={springs.gentle}
          className={cn("h-full rounded-full", item.barColor)}
        />
      </div>
      <div className="tabular flex justify-between text-xs text-muted-foreground">
        <span>{item.percentage.toFixed(0)}% del budget</span>
        {item.stateLabel && (
          <span
            className={cn(
              "font-semibold",
              item.stateLabel === "Limite superato" && "text-expense",
            )}
          >
            {item.stateLabel}
          </span>
        )}
      </div>
    </li>
  );
}
