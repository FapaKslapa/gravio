"use client";

import { ChevronRight, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { AmountWithTooltip } from "./amount-with-tooltip";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

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
        {friends.map((friend) => {
          const balValue =
            balances.find((b) => b.user.id === friend.user.id)?.balanceNok ?? 0;
          const isOwed = balValue > 0;
          const hasBalance = Math.abs(balValue) >= 0.01;
          const isSelected = selectedFriendId === friend.user.id;

          return (
            <li key={friend.user.id} className="not-last:border-b">
              <button
                type="button"
                onClick={() => onSelectFriend(friend)}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  isSelected && "bg-brand-soft hover:bg-brand-soft",
                )}
              >
                <Avatar className="size-10">
                  {friend.user.image ? (
                    <AvatarImage
                      src={friend.user.image}
                      alt={friend.user.name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-brand-soft font-semibold text-brand">
                    {friend.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {friend.user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {friend.user.email}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  {hasBalance ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {isOwed ? "ti deve" : "devi"}
                      </span>
                      <AmountWithTooltip
                        amount={convertNokAmount(Math.abs(balValue))}
                        currency={displayCurrency}
                        prefix=""
                        className={cn(
                          "text-sm font-bold",
                          isOwed ? "text-income" : "text-expense",
                        )}
                      />
                    </>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      In pari
                    </span>
                  )}
                </div>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
