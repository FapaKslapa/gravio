"use client";

import { ChevronLeft, HandCoins, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { FriendItem } from "./friend-detail-types";

const nokFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0,
});

type Props = {
  selectedFriend: FriendItem;
  balVal: number;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenSettleDebt: (friend: FriendItem) => void;
  onOpenDeleteFriend: (friend: FriendItem) => void;
};

export function FriendDetailHeader({
  selectedFriend,
  balVal,
  displayCurrency,
  convertNokAmount,
  onClear,
  onOpenSharedExpense,
  onOpenSettleDebt,
  onOpenDeleteFriend,
}: Props) {
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
    <>
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
    </>
  );
}
