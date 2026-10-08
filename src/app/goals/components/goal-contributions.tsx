"use client";

import dayjs from "dayjs";
import { PiggyBank, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { Goal } from "../goals-helpers";

type GoalContributionsProps = {
  goal: Goal;
  onDeleteContribution: (id: string) => void;
};

export function GoalContributions({
  goal,
  onDeleteContribution,
}: GoalContributionsProps) {
  return (
    <section aria-labelledby="goal-history" className="flex flex-col gap-2">
      <h3 id="goal-history" className="text-base font-semibold">
        Versamenti
      </h3>
      {goal.contributions.length === 0 && (
        <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <PiggyBank className="size-5 shrink-0" aria-hidden />
          Ancora nessun versamento. Il primo passo e&apos; il piu&apos;
          importante.
        </p>
      )}
      <ul
        className={cn(
          "flex flex-col divide-y rounded-lg border bg-card",
          goal.contributions.length === 0 && "hidden",
        )}
      >
        <AnimatePresence initial={false}>
          {goal.contributions.map((c) => (
            <m.li
              key={c.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springs.smooth}
              className="overflow-hidden"
            >
              <div className="flex min-h-14 items-center gap-3 px-4 py-2">
                <div className="min-w-0 flex-1">
                  <p className="tabular text-sm font-semibold text-income">
                    +{formatCurrency(c.amount, goal.currency)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dayjs(c.date).format("D MMM YYYY")}
                    {c.note ? ` · ${c.note}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Elimina versamento"
                  onClick={() => onDeleteContribution(c.id)}
                  className="size-11 rounded-full text-muted-foreground"
                >
                  <Trash2 />
                </Button>
              </div>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
