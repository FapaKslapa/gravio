"use client";

import { ChevronLeft, HandCoins, Plus, Receipt, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn, formatCurrency } from "@/lib/utils";

const nokFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

type FriendUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type FriendItem = {
  friendshipId: string;
  user: FriendUser;
  createdAt: Date | null;
};

type BalanceInfo = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

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

type FriendDetailCardProps = {
  selectedFriend: FriendItem;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenSettleDebt: (friend: FriendItem) => void;
  onOpenDeleteFriend: (friend: FriendItem) => void;
  balances: BalanceInfo[];
  transactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function FriendDetailCard({
  selectedFriend,
  onClear,
  onOpenSharedExpense,
  onOpenSettleDebt,
  onOpenDeleteFriend,
  balances,
  transactions,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
}: FriendDetailCardProps) {
  const balObj = balances.find((b) => b.user.id === selectedFriend.user.id);
  const balVal = balObj ? balObj.balanceNok : 0;
  const hasBal = Math.abs(balVal) >= 0.01;

  const label =
    balVal > 0 ? "Ti deve" : balVal < 0 ? "Gli devi" : "Siete in pari";
  const value = hasBal
    ? formatCurrency(convertNokAmount(Math.abs(balVal)), displayCurrency)
    : "In pari";
  const valColor = !hasBal
    ? "text-foreground"
    : balVal > 0
      ? "text-income"
      : "text-expense";

  return (
    <Card className="gap-0 p-0 elevation-1">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-full xl:hidden"
          aria-label="Torna alla lista"
          onClick={onClear}
        >
          <ChevronLeft />
        </Button>
        <Avatar size="lg" className="size-12">
          {selectedFriend.user.image ? (
            <AvatarImage
              src={selectedFriend.user.image}
              alt={selectedFriend.user.name}
            />
          ) : null}
          <AvatarFallback className="bg-brand-soft text-base font-semibold text-brand">
            {selectedFriend.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="line-clamp-2 break-words font-display text-lg font-bold leading-tight">
            {selectedFriend.user.name}
          </h2>
          <span className="truncate text-xs text-muted-foreground">
            {selectedFriend.user.email}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
          aria-label={`Rimuovi ${selectedFriend.user.name} dagli amici`}
          onClick={() => onOpenDeleteFriend(selectedFriend)}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span className={cn("num-display text-4xl font-bold", valColor)}>
            {value}
          </span>
          {hasBal && (
            <span className="tabular text-xs text-muted-foreground">
              {nokFormatter.format(Math.abs(balVal))} NOK
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-11 gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90"
            onClick={onOpenSharedExpense}
          >
            <Plus data-icon="inline-start" />
            Aggiungi spesa
          </Button>
          {hasBal && balVal < 0 && (
            <Button
              variant="outline"
              className="h-11 gap-1.5 rounded-full px-4 font-semibold"
              onClick={() => onOpenSettleDebt(selectedFriend)}
            >
              <HandCoins />
              Salda
            </Button>
          )}
        </div>
      </div>

      <section aria-label="Spese in comune" className="border-t">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-base font-semibold">Spese in comune</h3>
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
              <EmptyTitle>Nessuna spesa condivisa</EmptyTitle>
              <EmptyDescription>
                Le spese divise con {selectedFriend.user.name} compariranno qui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col border-t">
            {transactions.map((tx) => {
              const isPayer = tx.userId === currentUserId;

              const activeAmount = tx.sharedInfo
                ? tx.sharedInfo.isBorrowed
                  ? convertCurrency(
                      parseFloat(tx.sharedInfo.splitAmountNok),
                      "NOK",
                      displayCurrency,
                    )
                  : convertCurrency(
                      parseFloat(tx.amountNok) -
                        parseFloat(tx.sharedInfo.splitAmountNok),
                      "NOK",
                      displayCurrency,
                    )
                : 0;

              const originalAmount = convertCurrency(
                parseFloat(tx.amountEur),
                "EUR",
                displayCurrency,
              );
              const settled = tx.sharedInfo?.settled;

              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 not-last:border-b"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="line-clamp-2 break-words text-sm font-semibold">
                      {tx.description || "Spesa condivisa"}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(tx.date).toLocaleDateString("it-IT")}
                      </span>
                      <span aria-hidden>·</span>
                      <span>
                        {isPayer
                          ? "Hai pagato tu"
                          : `Ha pagato ${selectedFriend.user.name}`}
                      </span>
                      {settled && (
                        <Badge className="bg-income-soft text-income">
                          Saldata
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className={cn(
                        "tabular text-sm font-bold",
                        settled
                          ? "text-muted-foreground line-through"
                          : isPayer
                            ? "text-income"
                            : "text-expense",
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
    </Card>
  );
}
