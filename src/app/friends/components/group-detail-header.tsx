"use client";

import { ChevronLeft, Plus, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { GroupItem } from "./group-detail-types";

type Props = {
  selectedGroup: GroupItem;
  currentUserId: string;
  totalNok: number;
  expenseCount: number;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenDeleteGroup: (group: GroupItem) => void;
};

export function GroupDetailHeader({
  selectedGroup,
  currentUserId,
  totalNok,
  expenseCount,
  displayCurrency,
  convertNokAmount,
  onClear,
  onOpenSharedExpense,
  onOpenDeleteGroup,
}: Props) {
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
          <AvatarFallback className="bg-brand-soft text-brand">
            <Users className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="line-clamp-2 break-words font-display text-lg font-bold leading-tight">
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
            {expenseCount} spese · {totalNok.toFixed(0)} NOK
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
    </>
  );
}
