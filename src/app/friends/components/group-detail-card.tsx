"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GroupDetailHeader } from "./group-detail-header";
import type {
  GroupItem,
  GroupSettlementProposal,
  TransactionInfo,
} from "./group-detail-types";
import { GroupExpenseList } from "./group-expense-list";
import { GroupMemberList, GroupSettlementProposals } from "./group-member-list";

type GroupDetailCardProps = {
  selectedGroup: GroupItem;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenDeleteGroup: (group: GroupItem) => void;
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  onSettle: (friendId: string) => Promise<void>;
  transactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  allTransactions: TransactionInfo[];
};

export function GroupDetailCard({
  selectedGroup,
  onClear,
  onOpenSharedExpense,
  onOpenDeleteGroup,
  proposals,
  isProposalsLoading,
  onSettle,
  transactions,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
  allTransactions,
}: GroupDetailCardProps) {
  const [isSettlingId, setIsSettlingId] = useState<string | null>(null);

  const handleSettlePress = async (friendId: string) => {
    setIsSettlingId(friendId);
    try {
      await onSettle(friendId);
    } finally {
      setIsSettlingId(null);
    }
  };

  const totalNok = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amountNok),
    0,
  );

  return (
    <Card className="gap-0 p-0 elevation-1">
      <GroupDetailHeader
        selectedGroup={selectedGroup}
        currentUserId={currentUserId}
        totalNok={totalNok}
        expenseCount={transactions.length}
        displayCurrency={displayCurrency}
        convertNokAmount={convertNokAmount}
        onClear={onClear}
        onOpenSharedExpense={onOpenSharedExpense}
        onOpenDeleteGroup={onOpenDeleteGroup}
      />
      <GroupMemberList
        members={selectedGroup.members}
        currentUserId={currentUserId}
      />

      <GroupSettlementProposals
        proposals={proposals}
        isProposalsLoading={isProposalsLoading}
        currentUserId={currentUserId}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
        isSettlingId={isSettlingId}
        onSettle={handleSettlePress}
      />

      <GroupExpenseList
        transactions={transactions}
        allTransactions={allTransactions}
        currentUserId={currentUserId}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
      />
    </Card>
  );
}
