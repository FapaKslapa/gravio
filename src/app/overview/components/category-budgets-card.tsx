"use client";

import { FolderHeart, Settings2 } from "lucide-react";
import { m } from "motion/react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

type CategoryBudgetInfo = {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryInfo = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type TransactionInfo = {
  id: string;
  type: string;
  categoryId: string | null;
  amountNok: string;
};

type CategoryBudgetsCardProps = {
  transactions: TransactionInfo[];
  categories: CategoryInfo[];
  categoryBudgets: CategoryBudgetInfo[];
  displayCurrency: string;
  convertCurrency: (val: number, from: string, to: string) => number;
  onOpenSettings: () => void;
  className?: string;
};

export function CategoryBudgetsCard({
  transactions,
  categories,
  categoryBudgets,
  displayCurrency,
  convertCurrency,
  onOpenSettings,
  className,
}: CategoryBudgetsCardProps) {
  const activeBudgets = categoryBudgets.filter((b) => parseFloat(b.amount) > 0);

  const budgetItems = activeBudgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);
    const categoryName = category?.name || "Sconosciuta";
    const categoryIcon = category?.icon || "Sparkles";
    const categoryColor = category?.color || "var(--brand)";

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
    const progressPercent = Math.min(percentage, 100);

    const isOver = spentVal > budgetVal;
    const isWarning = spentVal >= budgetVal * 0.8 && spentVal <= budgetVal;

    const barColor = isOver
      ? "bg-expense"
      : isWarning
        ? "bg-warning"
        : "bg-income";
    const stateLabel = isOver
      ? "Limite superato"
      : isWarning
        ? "Quasi al limite"
        : null;

    return {
      id: budget.id,
      categoryName,
      categoryIcon,
      categoryColor,
      budgetVal,
      spentVal,
      percentage,
      progressPercent,
      barColor,
      stateLabel,
    };
  });

  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Budget per categoria
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            onClick={onOpenSettings}
            aria-label="Imposta budget per categoria"
          >
            <Settings2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {budgetItems.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderHeart />
              </EmptyMedia>
              <EmptyTitle>Nessun budget di categoria</EmptyTitle>
              <EmptyDescription>
                Imposta limiti per singole categorie per monitorare meglio le
                tue abitudini.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                className="h-11 rounded-full px-5"
                onClick={onOpenSettings}
              >
                <Settings2 data-icon="inline-start" />
                Imposta limiti
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="flex max-h-[22rem] flex-col gap-4 overflow-y-auto">
            {budgetItems.map((item) => (
              <li key={item.id} className="flex flex-col gap-2">
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
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
