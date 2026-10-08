"use client";

import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { FriendItem } from "./friend-detail-types";
import { FriendListRow } from "./friend-list-row";

type BalanceEntry = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

interface FriendListPanelProps {
  friends: FriendItem[];
  balances: BalanceEntry[];
  selectedFriendId?: string;
  displayCurrency: string;
  convertNokAmount: (val: number) => number;
  onSelectFriend: (friend: FriendItem) => void;
  onAddFriend: () => void;
}

export function FriendListPanel({
  friends,
  balances,
  selectedFriendId,
  displayCurrency,
  convertNokAmount,
  onSelectFriend,
  onAddFriend,
}: FriendListPanelProps) {
  if (friends.length === 0) {
    return (
      <Card className="elevation-1">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Non hai ancora nessun amico</EmptyTitle>
            <EmptyDescription>
              Aggiungi un amico con la sua email per iniziare a dividere le
              spese.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={onAddFriend}
              className="h-11 gap-1.5 rounded-full bg-brand px-5 font-semibold text-brand-foreground hover:bg-brand/90"
            >
              <UserPlus data-icon="inline-start" />
              Aggiungi amico
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  }

  return (
    <Card className="gap-0 p-0 elevation-1">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-semibold">Amici</h2>
        <Button
          variant="ghost"
          className="h-11 gap-1.5 rounded-full px-3 font-semibold text-brand"
          onClick={onAddFriend}
        >
          <UserPlus data-icon="inline-start" />
          Aggiungi
        </Button>
      </div>
      <ul className="flex flex-col border-t">
        {friends.map((friend) => (
          <FriendListRow
            key={friend.user.id}
            friend={friend}
            balValue={
              balances.find((b) => b.user.id === friend.user.id)?.balanceNok ??
              0
            }
            isSelected={selectedFriendId === friend.user.id}
            displayCurrency={displayCurrency}
            convertNokAmount={convertNokAmount}
            onSelectFriend={onSelectFriend}
          />
        ))}
      </ul>
    </Card>
  );
}
