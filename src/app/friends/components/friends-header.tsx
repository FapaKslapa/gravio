"use client";

import { Plus } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

interface FriendsHeaderProps {
  hasFriends: boolean;
  onAddExpense: () => void;
}

export function FriendsHeader({
  hasFriends,
  onAddExpense,
}: FriendsHeaderProps) {
  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex w-full items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Amici e spese
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          Dividi le spese con singoli amici o gruppi e tieni i saldi in pari.
        </p>
      </div>
      <Button
        className="h-11 shrink-0 gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90"
        onClick={onAddExpense}
        disabled={!hasFriends}
      >
        <Plus />
        <span className="hidden sm:inline">Nuova spesa condivisa</span>
        <span className="sm:hidden">Nuova spesa</span>
      </Button>
    </m.div>
  );
}
