"use client";

import { ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn, formatCurrency } from "@/lib/utils";

type TodoType = {
  id: string;
  title: string;
  completed: boolean;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type RecentTodoCardProps = {
  todos: TodoType[];
  displayCurrency: string;
  className?: string;
};

export function RecentTodoCard({
  todos,
  displayCurrency,
  className,
}: RecentTodoCardProps) {
  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Da acquistare
        </CardTitle>
        <CardAction>
          <Link
            href="/todos"
            className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
          >
            Liste <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {todos.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBasket />
              </EmptyMedia>
              <EmptyTitle>Nessun articolo attivo</EmptyTitle>
              <EmptyDescription>
                Gli articoli delle tue liste appariranno qui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col">
            {todos.slice(0, 4).map((todoItem) => {
              const estAmountNum = todoItem.estimatedAmount
                ? parseFloat(todoItem.estimatedAmount)
                : null;
              return (
                <li
                  key={todoItem.id}
                  className="flex min-h-12 items-center justify-between gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        todoItem.completed &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {todoItem.title}
                    </span>
                    {!!estAmountNum && (
                      <span className="tabular text-xs text-muted-foreground">
                        Stima{" "}
                        {formatCurrency(
                          estAmountNum,
                          todoItem.estimatedCurrency || displayCurrency,
                        )}
                      </span>
                    )}
                  </div>
                  <Badge variant={todoItem.completed ? "secondary" : "outline"}>
                    {todoItem.completed ? "Pronto" : "Attivo"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
