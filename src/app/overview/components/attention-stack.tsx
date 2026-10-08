"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { useTRPC } from "@/lib/trpc/client";
import {
  type AttentionInput,
  budgetItems,
  friendItems,
  todoItems,
} from "./attention-items";
import { recurrentItems } from "./attention-recurrent-items";

export function AttentionStack({
  categories,
  categoryBudgets,
  monthTransactions,
  todos,
  displayCurrency,
  convertCurrency,
}: AttentionInput) {
  const trpc = useTRPC();
  const { data: pending } = useQuery(
    trpc.friend.listPendingRequests.queryOptions(),
  );
  const { data: recurrents } = useQuery(
    trpc.recurrentTransaction.list.queryOptions(),
  );

  const items = useMemo<CardStackItem[]>(
    () => [
      ...friendItems(pending?.incoming ?? []),
      ...budgetItems({
        categories,
        categoryBudgets,
        monthTransactions,
        todos,
        displayCurrency,
        convertCurrency,
      }),
      ...recurrentItems(recurrents ?? []),
      ...todoItems(todos),
    ],
    [
      pending,
      recurrents,
      categories,
      categoryBudgets,
      monthTransactions,
      todos,
      displayCurrency,
      convertCurrency,
    ],
  );

  if (items.length === 0) return null;

  return (
    <section aria-label="Da sistemare" className="flex flex-col gap-2">
      <h2 className="font-display text-base font-semibold">Da sistemare</h2>
      <CardStack
        key={items.map((i) => i.id).join("|")}
        items={items}
        mode="dismiss"
        controls="visible"
        indicator="none"
        cardHeight="7.5rem"
        ariaLabel="Elementi da sistemare"
      />
    </section>
  );
}
