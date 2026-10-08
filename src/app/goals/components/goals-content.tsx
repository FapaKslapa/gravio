import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Goal } from "../goals-helpers";
import { GoalCard } from "./goal-card";
import { GoalsEmptyState } from "./goals-empty-state";
import { GoalsSummary } from "./goals-summary";

type GoalsContentProps = {
  isLoading: boolean;
  goals: Goal[];
  isXl: boolean;
  activeId: string | null;
  detail: ReactNode;
  onNew: () => void;
  onSelect: (id: string) => void;
};

export function GoalsContent({
  isLoading,
  goals,
  isXl,
  activeId,
  detail,
  onNew,
  onSelect,
}: GoalsContentProps) {
  return isLoading ? (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  ) : goals.length === 0 ? (
    <GoalsEmptyState onNew={onNew} />
  ) : (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="flex flex-col gap-3">
        <GoalsSummary goals={goals} />
        <ul className="flex flex-col gap-3">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              selected={isXl && goal.id === activeId}
              onSelect={() => onSelect(goal.id)}
            />
          ))}
        </ul>
      </div>
      {isXl && detail && (
        <aside
          aria-label="Dettaglio obiettivo"
          className="elevation-1 sticky top-8 h-fit rounded-xl bg-card p-5"
        >
          {detail}
        </aside>
      )}
    </div>
  );
}
