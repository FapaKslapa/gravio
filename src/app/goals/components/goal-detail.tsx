"use client";

import dayjs from "dayjs";
import { Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { type Goal, getGoalIcon, getGoalProgress } from "../goals-helpers";
import { GoalRing } from "./goal-ring";
import { GoalStatusBadge } from "./goal-status-badge";

type GoalDetailProps = {
  goal: Goal;
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteContribution: (id: string) => void;
};

export function GoalDetail({
  goal,
  onContribute,
  onEdit,
  onDelete,
  onDeleteContribution,
}: GoalDetailProps) {
  const Icon = getGoalIcon(goal.icon);
  const { achieved, status, monthly, remaining, daysLeft } =
    getGoalProgress(goal);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <GoalRing
          percent={goal.percent}
          color={goal.color}
          achieved={achieved}
          size={96}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Icon
              className="size-5 shrink-0"
              style={{ color: goal.color }}
              aria-hidden
            />
            <h2 className="truncate font-display text-xl font-bold tracking-[-0.025em]">
              {goal.name}
            </h2>
          </div>
          <GoalStatusBadge status={status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Stat
          label="Versato"
          value={formatCurrency(goal.saved, goal.currency)}
        />
        <Stat
          label="Obiettivo"
          value={formatCurrency(goal.targetAmount, goal.currency)}
        />
        <Stat
          label="Mancano"
          value={formatCurrency(remaining, goal.currency)}
        />
        <Stat
          label={goal.targetDate ? "Scadenza" : "Scadenza"}
          value={
            goal.targetDate
              ? dayjs(goal.targetDate).format("D MMM YYYY")
              : "Nessuna"
          }
          hint={
            !achieved && daysLeft !== null
              ? daysLeft >= 0
                ? `${daysLeft} giorni`
                : "scaduta"
              : undefined
          }
        />
      </dl>

      {monthly !== null && (
        <p className="rounded-lg bg-brand-soft p-3 text-sm">
          Per arrivarci in tempo servono{" "}
          <span className="tabular font-semibold">
            {formatCurrency(monthly, goal.currency)}
          </span>{" "}
          al mese.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={onContribute}
          className="h-11 flex-1 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus />
          Versa
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          aria-label="Modifica obiettivo"
          className="size-11 rounded-full"
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          aria-label="Elimina obiettivo"
          className="size-11 rounded-full text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

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
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-base font-bold">
        {value}
        {hint && (
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">
            {hint}
          </span>
        )}
      </dd>
    </div>
  );
}
