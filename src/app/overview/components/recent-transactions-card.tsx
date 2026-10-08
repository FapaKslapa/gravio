"use client";

import dayjs from "dayjs";
import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/icon-helper";
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

type TransactionType = {
  id: string;
  type: string;
  amount: string;
  currency: string;
  amountEur: string;
  amountNok: string;
  exchangeRate: string;
  description: string | null;
  date: Date;
  payerName?: string | null;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    borrowerName: string;
    borrowerEmail: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
    isPaidByMe: boolean;
  } | null;
  categoryId: string | null;
};

type CategoryType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecentTransactionsCardProps = {
  transactions: TransactionType[];
  categories: CategoryType[];
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
          <ul className="flex max-h-[26rem] flex-col overflow-y-auto xl:max-h-none xl:flex-1">
            {expenses.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const color = cat?.color ?? "var(--muted-foreground)";

              const displayAmount = tx.sharedInfo
                ? tx.sharedInfo.isBorrowed
                  ? convertCurrency(
                      parseFloat(tx.sharedInfo.splitAmountNok),
                      "NOK",
                      displayCurrency,
                    )
                  : convertCurrency(
                      parseFloat(tx.amountNok),
                      "NOK",
                      displayCurrency,
                    ) -
                    convertCurrency(
                      parseFloat(tx.sharedInfo.splitAmountNok),
                      "NOK",
                      displayCurrency,
                    )
                : convertCurrency(
                    parseFloat(tx.amountEur),
                    "EUR",
                    displayCurrency,
                  );

              return (
                <li
                  key={tx.id}
                  className="flex min-h-14 items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
                      color,
                    }}
                  >
                    <CategoryIcon
                      name={cat ? cat.icon : "Sparkles"}
                      size={18}
                    />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">
                        {tx.description || "Transazione"}
                      </span>
                      {tx.sharedInfo && (
                        <Badge
                          variant={
                            tx.sharedInfo.isBorrowed
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          Split
                        </Badge>
                      )}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {cat?.name ?? "Senza categoria"} ·{" "}
                      {dayjs(tx.date).format("D MMM")}
                      {tx.sharedInfo &&
                        ` · ${
                          tx.sharedInfo.isBorrowed
                            ? `quota da ${tx.payerName || "amico"}`
                            : `quota con ${tx.sharedInfo.borrowerName}`
                        }`}
                    </span>
                  </div>
                  <span className="num-display tabular shrink-0 text-sm font-bold">
                    −{formatCurrency(displayAmount, displayCurrency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
