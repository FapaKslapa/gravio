"use client";

import { ChevronLeft, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { GroupExpenseList } from "./group-expense-list";
import { GroupMemberList, GroupSettlementProposals } from "./group-member-list";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type GroupSettlementProposal = {
  fromUser: { id: string; name: string; email: string; image: string | null };
  toUser: { id: string; name: string; email: string; image: string | null };
  amountNok: number;
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
          <AvatarFallback className="bg-brand-soft text-brand">
            <Users className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate font-display text-lg font-bold leading-tight">
            {selectedGroup.name}
          </h2>
          <span className="text-xs text-muted-foreground">
            {selectedGroup.members.length} partecipanti
          </span>
        </div>
        {selectedGroup.creatorId === currentUserId && (
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
            aria-label={`Elimina il gruppo ${selectedGroup.name}`}
            onClick={() => onOpenDeleteGroup(selectedGroup)}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Speso nel gruppo
          </span>
          <span className="num-display text-4xl font-bold">
            {formatCurrency(convertNokAmount(totalNok), displayCurrency)}
          </span>
          <span className="tabular text-xs text-muted-foreground">
            {transactions.length} spese · {totalNok.toFixed(0)} NOK
          </span>
        </div>
        <div>
          <Button
            className="h-11 gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90"
            onClick={onOpenSharedExpense}
          >
            <Plus data-icon="inline-start" />
            Aggiungi spesa
          </Button>
        </div>
      </div>

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
