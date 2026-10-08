"use client";

import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
import {
  type RecentCategory,
  type RecentTransaction,
  RecentTransactionRow,
} from "./recent-transaction-row";

type RecentTransactionsCardProps = {
  transactions: RecentTransaction[];
  categories: RecentCategory[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  className?: string;
};

export function RecentTransactionsCard({
  transactions,
  categories,
  displayCurrency,
  convertCurrency,
  className,
}: RecentTransactionsCardProps) {
  const expenses = transactions
    .filter((tx) => tx.type === "expense")
    .slice(0, 20);

  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Spese recenti
        </CardTitle>
        <CardAction>
          <Link
            href="/transactions"
            className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
          >
            Vedi tutte <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col">
        {expenses.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>Nessuna spesa registrata</EmptyTitle>
              <EmptyDescription>
                Le tue spese più recenti appariranno qui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col xl:flex-1 xl:overflow-y-auto">
            {expenses.map((tx, index) => (
              <RecentTransactionRow
                key={tx.id}
                tx={tx}
                index={index}
                category={categories.find((c) => c.id === tx.categoryId)}
                displayCurrency={displayCurrency}
                convertCurrency={convertCurrency}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
