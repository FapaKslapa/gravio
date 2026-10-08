"use client";

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AmountWithTooltip } from "./amount-with-tooltip";
import type { FriendItem } from "./friend-detail-types";

type Props = {
  friend: FriendItem;
  balValue: number;
  isSelected: boolean;
  displayCurrency: string;
  convertNokAmount: (val: number) => number;
  onSelectFriend: (friend: FriendItem) => void;
};

export function FriendListRow({
  friend,
  balValue,
  isSelected,
  displayCurrency,
  convertNokAmount,
  onSelectFriend,
}: Props) {
  const isOwed = balValue > 0;
  const hasBalance = Math.abs(balValue) >= 0.01;

  return (
    <li className="not-last:border-b">
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
            <AvatarImage src={friend.user.image} alt={friend.user.name} />
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
}
