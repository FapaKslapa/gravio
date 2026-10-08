"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { GoalCard } from "./components/goal-card";
import { GoalDetail } from "./components/goal-detail";
import { GoalDetailDrawer } from "./components/goal-detail-drawer";
import { GoalsDialogs } from "./components/goals-dialogs";
import { GoalsEmptyState } from "./components/goals-empty-state";
import { GoalsHeader } from "./components/goals-header";
import { GoalsSummary } from "./components/goals-summary";
import { useGoalsMutations } from "./use-goals-mutations";
import { useIsXl } from "./use-is-xl";

export default function GoalsView() {
  const trpc = useTRPC();
  const { displayCurrency } = useDashboard();
  const isXl = useIsXl();
  const { data, isLoading, refetch } = useQuery(
    trpc.savingsGoal.list.queryOptions(),
  );
  const mutations = useGoalsMutations(refetch);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteContributionId, setDeleteContributionId] = useState<
    string | null
  >(null);

  const goals = data ?? [];
  const activeId =
    selectedId && goals.some((g) => g.id === selectedId)
      ? selectedId
      : isXl
        ? (goals[0]?.id ?? null)
        : null;
  const active = goals.find((g) => g.id === activeId) ?? null;
  const editing = goals.find((g) => g.id === editingId) ?? null;
  const contributing = goals.find((g) => g.id === contributeId) ?? null;

  const openNew = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const detail = active && (
    <GoalDetail
      goal={active}
      onContribute={() => setContributeId(active.id)}
      onEdit={() => {
        setEditingId(active.id);
        setFormOpen(true);
      }}
      onDelete={() => setDeleteId(active.id)}
      onDeleteContribution={setDeleteContributionId}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <GoalsHeader onNew={openNew} />

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : goals.length === 0 ? (
        <GoalsEmptyState onNew={openNew} />
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
                  onSelect={() => {
                    setSelectedId(goal.id);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </ul>
          </div>
          {isXl && active && (
            <aside
              aria-label="Dettaglio obiettivo"
              className="elevation-1 sticky top-8 h-fit rounded-xl bg-card p-5"
            >
              {detail}
            </aside>
          )}
        </div>
      )}

      {!isXl && (
        <GoalDetailDrawer
          open={detailOpen && !!active}
          onOpenChange={setDetailOpen}
          title={active?.name ?? "Obiettivo"}
        >
          {detail}
        </GoalDetailDrawer>
      )}

      <GoalsDialogs
        mutations={mutations}
        displayCurrency={displayCurrency}
        formOpen={formOpen}
        onFormOpenChange={setFormOpen}
        editing={editing}
        onCreated={setSelectedId}
        contributing={contributing}
        onCloseContribute={() => setContributeId(null)}
        deleteId={deleteId}
        onCloseDelete={() => setDeleteId(null)}
        onDeleted={() => setDetailOpen(false)}
        deleteContributionId={deleteContributionId}
        onCloseDeleteContribution={() => setDeleteContributionId(null)}
      />
    </div>
  );
}
