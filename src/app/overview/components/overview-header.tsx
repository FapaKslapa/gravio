"use client";

import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type OverviewHeaderProps = {
  userName: string;
  onOpenQuickAdd: () => void;
};

export function OverviewHeader({
  userName,
  onOpenQuickAdd,
}: OverviewHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-balance">
          Ciao{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {dayjs().format("MMMM YYYY")}
        </p>
      </div>

      <Button
        size="lg"
        className="h-12 w-full rounded-full bg-brand px-6 text-base font-semibold text-brand-foreground hover:bg-brand/90 active:scale-[0.97] sm:w-auto"
        onClick={onOpenQuickAdd}
      >
        <Plus data-icon="inline-start" />
        Aggiungi spesa
      </Button>
    </div>
  );
}
