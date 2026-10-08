"use client";

import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FriendDetailHeader } from "./friend-detail-header";
import type {
  BalanceInfo,
  FriendItem,
  TransactionInfo,
} from "./friend-detail-types";
import { FriendSharedTxRow } from "./friend-shared-tx-row";

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

  return (
    <Card className="gap-0 p-0 elevation-1">
      <FriendDetailHeader
        selectedFriend={selectedFriend}
        balVal={balVal}
        displayCurrency={displayCurrency}
        convertNokAmount={convertNokAmount}
        onClear={onClear}
        onOpenSharedExpense={onOpenSharedExpense}
        onOpenSettleDebt={onOpenSettleDebt}
        onOpenDeleteFriend={onOpenDeleteFriend}
      />

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
            {transactions.map((tx) => (
              <FriendSharedTxRow
                key={tx.id}
                tx={tx}
                friendName={selectedFriend.user.name}
                currentUserId={currentUserId}
                displayCurrency={displayCurrency}
                convertCurrency={convertCurrency}
              />
            ))}
          </ul>
        )}
      </section>
    </Card>
  );
}
