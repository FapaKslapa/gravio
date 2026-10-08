"use client";

import dayjs from "dayjs";
import { Plus, ScanLine } from "lucide-react";
import Link from "next/link";
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

      <div className="flex items-center gap-2">
        <Button
          size="lg"
          className="h-12 flex-1 rounded-full bg-brand px-6 text-base font-semibold text-brand-foreground hover:bg-brand/90 active:scale-[0.97] sm:flex-none"
          onClick={onOpenQuickAdd}
        >
          <Plus data-icon="inline-start" />
          Aggiungi spesa
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-full px-5 text-base font-semibold active:scale-[0.97]"
        >
          <Link href="/transactions?scan=1">
            <ScanLine data-icon="inline-start" />
            Scontrino
          </Link>
        </Button>
      </div>
    </div>
  );
}
