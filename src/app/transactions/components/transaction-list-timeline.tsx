"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionDayGroup } from "./transaction-day-group";
import { TransactionsEmpty } from "./transaction-list-parts";
import type {
  Category,
  ConvertCurrency,
  GroupedTransaction,
  Transaction,
} from "./transaction-list-types";
import { useSwipeActions } from "./use-swipe-actions";

const DAYS_PER_PAGE = 14;

type TransactionListTimelineProps = {
  groupedTx: GroupedTransaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

export function TransactionListTimeline({
  groupedTx,
  categories,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
  onEditClick,
}: TransactionListTimelineProps) {
  const { hiddenIds, softDelete, duplicate } = useSwipeActions();
  const [shownDays, setShownDays] = useState(DAYS_PER_PAGE);
  const visibleGroups = useMemo(
    () =>
      groupedTx
        .map((g) => ({
          ...g,
          list: g.list.filter((t) => !hiddenIds.has(t.id)),
        }))
        .filter((g) => g.list.length > 0),
    [groupedTx, hiddenIds],
  );

  if (visibleGroups.length === 0) return <TransactionsEmpty />;

  const shownGroups = visibleGroups.slice(0, shownDays);
  const remainingDays = visibleGroups.length - shownGroups.length;

  return (
    <div className="flex flex-col gap-6">
      {shownGroups.map((group, groupIndex) => (
        <TransactionDayGroup
          key={group.date}
          group={group}
          groupIndex={groupIndex}
          categories={categories}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          softDelete={softDelete}
          duplicate={duplicate}
        />
      ))}
      {remainingDays > 0 && (
        <Button
          variant="outline"
          onClick={() => setShownDays((n) => n + DAYS_PER_PAGE)}
          className="h-11 self-center rounded-full px-5"
        >
          Mostra altri giorni
          <span className="tabular text-muted-foreground">
            ({remainingDays})
          </span>
        </Button>
      )}
    </div>
  );
}
