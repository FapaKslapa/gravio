"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";
import { useDashboard } from "@/components/dashboard-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

export function OverviewFriendBalancesCard({
  className,
}: {
  className?: string;
}) {
  const { displayCurrency, convertCurrency } = useDashboard();
  const trpc = useTRPC();
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery(
    trpc.friend.getBalanceSummary.queryOptions(),
  );

  if (isBalanceLoading) {
    return (
      <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
        <CardHeader>
          <CardTitle className="font-display text-base font-semibold">
            Saldi con gli amici
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = balanceData || [];
  const convertedItems = items.map((item) => {
    const val = convertCurrency(item.balanceNok, "NOK", displayCurrency);
    return {
      ...item,
      balance: val,
    };
  });

  const totalCredit = convertedItems
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  const totalDebit = Math.abs(
    convertedItems
      .filter((i) => i.balance < 0)
      .reduce((sum, i) => sum + i.balance, 0),
  );

  const netBalance = totalCredit - totalDebit;

  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Saldi con gli amici
        </CardTitle>
        <CardDescription>Debiti e crediti in sospeso</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-income-soft p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-income">
              <ArrowDownLeft className="size-4" aria-hidden="true" />
              Ti devono
            </dt>
            <dd className="num-display tabular truncate text-lg font-bold text-income">
              {formatCurrency(totalCredit, displayCurrency)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-expense-soft p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-expense">
              <ArrowUpRight className="size-4" aria-hidden="true" />
              Devi dare
            </dt>
            <dd className="num-display tabular truncate text-lg font-bold text-expense">
              {formatCurrency(totalDebit, displayCurrency)}
            </dd>
          </div>
        </dl>

        {convertedItems.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Check />
              </EmptyMedia>
              <EmptyTitle>Tutto in pari</EmptyTitle>
              <EmptyDescription>
                Non hai debiti o crediti in sospeso con i tuoi amici.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex max-h-60 flex-col overflow-y-auto">
            {convertedItems.map((item) => {
              const isCredit = item.balance > 0;
              const initials = item.user.name ? item.user.name[0] : "?";
              return (
                <li
                  key={item.user.id}
                  className="flex min-h-14 items-center justify-between gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-brand-soft font-semibold text-brand uppercase">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {item.user.name || "Amico"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {isCredit ? "Ti deve" : "Gli devi"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "num-display tabular shrink-0 text-sm font-bold",
                      isCredit ? "text-income" : "text-expense",
                    )}
                  >
                    {isCredit ? "+" : "−"}
                    {formatCurrency(Math.abs(item.balance), displayCurrency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <CardFooter className="justify-between border-t bg-transparent text-sm">
        <span className="text-muted-foreground">Saldo netto</span>
        <span
          className={cn(
            "num-display tabular font-bold",
            netBalance > 0
              ? "text-income"
              : netBalance < 0
                ? "text-expense"
                : "text-muted-foreground",
          )}
        >
          {netBalance > 0 ? "+" : ""}
          {formatCurrency(netBalance, displayCurrency)}
        </span>
      </CardFooter>
    </Card>
  );
}
