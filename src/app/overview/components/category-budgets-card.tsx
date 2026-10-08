"use client";

import { FolderHeart, Settings2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { buildBudgetItems } from "./category-budget-items";
import { CategoryBudgetRow } from "./category-budget-row";

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
  const budgetItems = buildBudgetItems(
    categoryBudgets.filter((b) => parseFloat(b.amount) > 0),
    categories,
    transactions,
    displayCurrency,
    convertCurrency,
  );

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
              <CategoryBudgetRow
                key={item.id}
                item={item}
                displayCurrency={displayCurrency}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
