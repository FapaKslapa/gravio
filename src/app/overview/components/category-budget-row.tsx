import { m } from "motion/react";
import { CategoryIcon } from "@/components/icon-helper";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

export type CategoryBudgetItem = {
  id: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetVal: number;
  spentVal: number;
  percentage: number;
  progressPercent: number;
  barColor: string;
  stateLabel: string | null;
};

type BudgetInput = { id: string; categoryId: string; amount: string };
type CategoryInfo = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type TransactionInfo = {
  type: string;
  categoryId: string | null;
  amountNok: string;
};

export function buildBudgetItems(
  budgets: BudgetInput[],
  categories: CategoryInfo[],
  transactions: TransactionInfo[],
  displayCurrency: string,
  convertCurrency: (val: number, from: string, to: string) => number,
): CategoryBudgetItem[] {
  return budgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);

    const spentInNok = transactions
      .filter((t) => t.type === "expense" && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + parseFloat(t.amountNok), 0);

    const budgetVal = convertCurrency(
      parseFloat(budget.amount),
      "NOK",
      displayCurrency,
    );
    const spentVal = convertCurrency(spentInNok, "NOK", displayCurrency);

    const percentage = budgetVal > 0 ? (spentVal / budgetVal) * 100 : 0;

    const isOver = spentVal > budgetVal;
    const isWarning = spentVal >= budgetVal * 0.8 && spentVal <= budgetVal;

    return {
      id: budget.id,
      categoryName: category?.name || "Sconosciuta",
      categoryIcon: category?.icon || "Sparkles",
      categoryColor: category?.color || "var(--brand)",
      budgetVal,
      spentVal,
      percentage,
      progressPercent: Math.min(percentage, 100),
      barColor: isOver ? "bg-expense" : isWarning ? "bg-warning" : "bg-income",
      stateLabel: isOver
        ? "Limite superato"
        : isWarning
          ? "Quasi al limite"
          : null,
    };
  });
}

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
