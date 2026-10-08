"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import { GoalDetail } from "./components/goal-detail";
import { GoalDetailDrawer } from "./components/goal-detail-drawer";
import { GoalsContent } from "./components/goals-content";
import { GoalsDialogs } from "./components/goals-dialogs";
import { GoalsHeader } from "./components/goals-header";
import { resolveActiveId } from "./goals-helpers";
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
  const activeId = resolveActiveId(goals, selectedId, isXl);
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

      <GoalsContent
        isLoading={isLoading}
        goals={goals}
        isXl={isXl}
        activeId={activeId}
        detail={detail}
        onNew={openNew}
        onSelect={(id) => {
          setSelectedId(id);
          setDetailOpen(true);
        }}
      />

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
