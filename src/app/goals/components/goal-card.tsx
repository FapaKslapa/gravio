"use client";

import dayjs from "dayjs";
import { m } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { type Goal, getGoalIcon, getGoalProgress } from "../goals-helpers";
import { GoalRing } from "./goal-ring";
import { GoalStatusBadge } from "./goal-status-badge";

type GoalCardProps = {
  goal: Goal;
  index: number;
  selected: boolean;
  onSelect: () => void;
};

export function GoalCard({ goal, index, selected, onSelect }: GoalCardProps) {
  const Icon = getGoalIcon(goal.icon);
  const { achieved, status, monthly, remaining } = getGoalProgress(goal);

  return (
    <m.li
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      whileTap={{ scale: 0.97 }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "elevation-1 flex min-h-11 w-full items-center gap-4 rounded-lg bg-card p-4 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
          selected && "ring-2 ring-brand",
        )}
      >
        <GoalRing
          percent={goal.percent}
          color={goal.color}
          achieved={achieved}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${goal.color}22`, color: goal.color }}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="truncate text-base font-semibold">
              {goal.name}
            </span>
          </div>
          <p className="tabular text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatCurrency(goal.saved, goal.currency)}
            </span>{" "}
            / {formatCurrency(goal.targetAmount, goal.currency)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <GoalStatusBadge status={status} />
            {!achieved && goal.targetDate && (
              <span className="tabular text-xs text-muted-foreground">
                entro {dayjs(goal.targetDate).format("D MMM YYYY")}
              </span>
            )}
          </div>
          {!achieved && monthly !== null && (
            <p className="tabular text-xs text-muted-foreground">
              Servono {formatCurrency(monthly, goal.currency)} al mese
            </p>
          )}
          {!achieved && monthly === null && goal.targetDate && (
            <p className="tabular text-xs text-muted-foreground">
              Mancano {formatCurrency(remaining, goal.currency)}
            </p>
          )}
        </div>
      </button>
    </m.li>
  );
}
