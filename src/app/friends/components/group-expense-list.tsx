"use client";

import { Receipt } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn, formatCurrency } from "@/lib/utils";

type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};

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
          {transactions.map((tx) => {
            const isPayer = tx.userId === currentUserId;

            let activeAmount = 0;
            if (isPayer) {
              const totalNok = parseFloat(tx.amountNok);
              const totalOthersSplitsNok = allTransactions
                .filter(
                  (t) =>
                    t.id === tx.id &&
                    t.sharedInfo &&
                    t.sharedInfo.payerId === currentUserId,
                )
                .reduce(
                  (sum, t) =>
                    sum + parseFloat(t.sharedInfo?.splitAmountNok ?? "0"),
                  0,
                );

              const myShareNok = totalNok - totalOthersSplitsNok;
              activeAmount = convertCurrency(
                myShareNok,
                "NOK",
                displayCurrency,
              );
            } else {
              const mySplit = allTransactions.find(
                (t) =>
                  t.id === tx.id &&
                  t.sharedInfo &&
                  t.sharedInfo.borrowerId === currentUserId,
              );

              const splitNok = mySplit?.sharedInfo
                ? parseFloat(mySplit.sharedInfo.splitAmountNok)
                : 0;
              activeAmount = convertCurrency(splitNok, "NOK", displayCurrency);
            }

            const originalAmount = convertCurrency(
              parseFloat(tx.amountEur),
              "EUR",
              displayCurrency,
            );

            return (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 px-4 py-3 not-last:border-b"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="line-clamp-2 break-words text-sm font-semibold">
                    {tx.description || "Spesa gruppo"}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{new Date(tx.date).toLocaleDateString("it-IT")}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {isPayer
                        ? "Hai pagato tu"
                        : `Ha pagato ${tx.payerName || "Membro"}`}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span
                    className={cn(
                      "tabular text-sm font-bold",
                      isPayer ? "text-income" : "text-expense",
                    )}
                  >
                    {isPayer ? "+" : "-"}
                    {formatCurrency(activeAmount, displayCurrency)}
                  </span>
                  <span className="tabular text-xs text-muted-foreground">
                    Totale {formatCurrency(originalAmount, displayCurrency)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
