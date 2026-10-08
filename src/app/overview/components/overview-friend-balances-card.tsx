"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";
import { FriendBalanceList } from "./friend-balance-list";

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

        <FriendBalanceList
          items={convertedItems}
          displayCurrency={displayCurrency}
        />
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
