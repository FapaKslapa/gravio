"use client";

import { MousePointerClick } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FriendDetailCard } from "./friend-detail-card";
import type {
  BalanceInfo,
  FriendItem,
  GroupItem,
  GroupSettlementProposal,
  TransactionInfo,
} from "./friends-right-column-types";
import { GroupDetailCard } from "./group-detail-card";

interface FriendsRightColumnProps {
  selectedFriend: FriendItem | null;
  selectedGroup: GroupItem | null;
  balances: BalanceInfo[];
  transactions: TransactionInfo[];
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onClearFriend: () => void;
  onClearGroup: () => void;
  onOpenSharedExpense: () => void;
  onOpenSettleDebt: (friend: FriendItem) => void;
  onOpenDeleteFriend: (friend: FriendItem) => void;
  onOpenDeleteGroup: (group: GroupItem) => void;
  onSettle: (friendId: string) => Promise<void>;
}

export function FriendsRightColumn({
  selectedFriend,
  selectedGroup,
  balances,
  transactions,
  proposals,
  isProposalsLoading,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
  onClearFriend,
  onClearGroup,
  onOpenSharedExpense,
  onOpenSettleDebt,
  onOpenDeleteFriend,
  onOpenDeleteGroup,
  onSettle,
}: FriendsRightColumnProps) {
  const friendTransactions = selectedFriend
    ? transactions.filter(
        (tx) =>
          tx.sharedInfo &&
          ((tx.userId === currentUserId &&
            tx.sharedInfo.borrowerId === selectedFriend.user.id) ||
            (tx.userId === selectedFriend.user.id &&
              tx.sharedInfo.borrowerId === currentUserId)),
      )
    : [];

  const groupTransactions = selectedGroup
    ? transactions.filter((tx) => tx.groupId === selectedGroup.id)
    : [];

  const slide = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    transition: springs.smooth,
  };

  return (
    <div
      className={cn(
        "min-w-0 flex-col gap-4",
        selectedFriend || selectedGroup ? "flex" : "hidden xl:flex",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {selectedFriend && (
          <m.div key={`friend-detail-${selectedFriend.user.id}`} {...slide}>
            <FriendDetailCard
              selectedFriend={selectedFriend}
              onClear={onClearFriend}
              onOpenSharedExpense={onOpenSharedExpense}
              onOpenSettleDebt={onOpenSettleDebt}
              onOpenDeleteFriend={onOpenDeleteFriend}
              balances={balances}
              transactions={friendTransactions}
              currentUserId={currentUserId}
              displayCurrency={displayCurrency}
              convertNokAmount={convertNokAmount}
              convertCurrency={convertCurrency}
            />
          </m.div>
        )}

        {selectedGroup && (
          <m.div key={`group-detail-${selectedGroup.id}`} {...slide}>
            <GroupDetailCard
              selectedGroup={selectedGroup}
              onClear={onClearGroup}
              onOpenSharedExpense={onOpenSharedExpense}
              onOpenDeleteGroup={onOpenDeleteGroup}
              proposals={proposals}
              isProposalsLoading={isProposalsLoading}
              onSettle={onSettle}
              transactions={groupTransactions}
              currentUserId={currentUserId}
              displayCurrency={displayCurrency}
              convertNokAmount={convertNokAmount}
              convertCurrency={convertCurrency}
              allTransactions={transactions}
            />
          </m.div>
        )}

        {!selectedFriend && !selectedGroup && (
          <m.div key="empty-detail" {...slide}>
            <Empty className="min-h-80 rounded-xl border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MousePointerClick />
                </EmptyMedia>
                <EmptyTitle>Seleziona un amico o un gruppo</EmptyTitle>
                <EmptyDescription>
                  Qui vedi il saldo e la cronologia delle spese in comune.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
