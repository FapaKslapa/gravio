"use client";

import { Receipt } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import type { TransactionInfo } from "./group-detail-types";
import { GroupExpenseRow } from "./group-expense-row";

type GroupExpenseListProps = {
  transactions: TransactionInfo[];
  allTransactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function GroupExpenseList({
  transactions,
  allTransactions,
  currentUserId,
  displayCurrency,
  convertCurrency,
}: GroupExpenseListProps) {
  return (
    <section aria-label="Spese del gruppo" className="border-t">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-base font-semibold">Spese del gruppo</h3>
        <span className="tabular text-xs text-muted-foreground">
          {transactions.length}
        </span>
      </div>

      {transactions.length === 0 ? (
        <Empty className="border-t py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>Nessuna spesa nel gruppo</EmptyTitle>
            <EmptyDescription>
              Aggiungi la prima spesa per iniziare a dividere.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col border-t">
          {transactions.map((tx) => (
            <GroupExpenseRow
              key={tx.id}
              tx={tx}
              allTransactions={allTransactions}
              currentUserId={currentUserId}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
