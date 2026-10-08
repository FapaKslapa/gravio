"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Target } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import { ContributionSheet } from "./components/contribution-sheet";
import { GoalCard } from "./components/goal-card";
import { GoalDetail } from "./components/goal-detail";
import { GoalFormSheet } from "./components/goal-form-sheet";
import { type Goal, getGoalProgress } from "./goals-helpers";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1280px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsXl() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false,
  );
}

function GoalsSummary({ goals }: { goals: Goal[] }) {
  const currencies = new Set(goals.map((g) => g.currency));
  const currency = goals[0]?.currency ?? "EUR";
  const uniform = currencies.size === 1;
  const saved = goals.reduce((sum, g) => sum + g.saved, 0);
  const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const percent =
    target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const achievedCount = goals.filter((g) => getGoalProgress(g).achieved).length;
  const lateCount = goals.filter(
    (g) => getGoalProgress(g).status === "late",
  ).length;

  return (
    <section
      aria-label="Riepilogo obiettivi"
      className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4"
    >
      {uniform ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="tabular font-display text-2xl font-bold tracking-[-0.025em]">
              {formatCurrency(saved, currency)}
            </p>
            <p className="tabular text-sm text-muted-foreground">
              su {formatCurrency(target, currency)} ({percent}%)
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Risparmio complessivo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {goals.length} {goals.length === 1 ? "obiettivo" : "obiettivi"}
        {achievedCount > 0 && ` · ${achievedCount} raggiunti`}
        {lateCount > 0 && ` · ${lateCount} in ritardo`}
      </p>
    </section>
  );
}

export default function GoalsView() {
  const trpc = useTRPC();
  const { displayCurrency } = useDashboard();
  const isXl = useIsXl();
  const { data, isLoading, refetch } = useQuery(
    trpc.savingsGoal.list.queryOptions(),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteContributionId, setDeleteContributionId] = useState<
    string | null
  >(null);

  const onSuccess = () => refetch();
  const onError = () => toast.error("Operazione non riuscita");
  const createMutation = useMutation(
    trpc.savingsGoal.create.mutationOptions({ onSuccess, onError }),
  );
  const updateMutation = useMutation(
    trpc.savingsGoal.update.mutationOptions({ onSuccess, onError }),
  );
  const deleteMutation = useMutation(
    trpc.savingsGoal.delete.mutationOptions({ onSuccess, onError }),
  );
  const addContributionMutation = useMutation(
    trpc.savingsGoal.addContribution.mutationOptions({ onSuccess, onError }),
  );
  const deleteContributionMutation = useMutation(
    trpc.savingsGoal.deleteContribution.mutationOptions({ onSuccess, onError }),
  );

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
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-[-0.025em]">
            Obiettivi
          </h1>
          <p className="hidden text-sm text-muted-foreground md:block">
            Metti da parte un po&apos; alla volta e guarda il traguardo
            avvicinarsi.
          </p>
        </div>
        <Button
          type="button"
          onClick={openNew}
          className="h-11 shrink-0 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
        >
          <Plus />
          Nuovo obiettivo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : goals.length === 0 ? (
        <Empty className="border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyTitle>Il tuo primo obiettivo</EmptyTitle>
            <EmptyDescription>
              Un viaggio, un fondo emergenze, un regalo: dai un nome a quello
              che vuoi ottenere e versa quando puoi.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              onClick={openNew}
              className="h-11 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
            >
              <Plus />
              Crea obiettivo
            </Button>
          </EmptyContent>
        </Empty>
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
        <Drawer open={detailOpen && !!active} onOpenChange={setDetailOpen}>
          <DrawerContent className="max-h-[92dvh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{active?.name ?? "Obiettivo"}</DrawerTitle>
              <DrawerDescription>Dettaglio e versamenti</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {detail}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <GoalFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editing}
        defaultCurrency={displayCurrency}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, ...values });
          } else {
            const { id } = await createMutation.mutateAsync(values);
            setSelectedId(id);
          }
          setFormOpen(false);
        }}
      />

      <ContributionSheet
        goal={contributing}
        isPending={addContributionMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setContributeId(null);
        }}
        onSubmit={async (values) => {
          if (!contributing) return;
          await addContributionMutation.mutateAsync({
            goalId: contributing.id,
            ...values,
          });
          toast.success("Versamento registrato");
          setContributeId(null);
        }}
      />

      <ConfirmationDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Eliminare l'obiettivo?"
        message="L'obiettivo e tutti i suoi versamenti verranno eliminati."
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync({ id: deleteId });
          setDeleteId(null);
          setDetailOpen(false);
        }}
      />

      <ConfirmationDialog
        isOpen={deleteContributionId !== null}
        onClose={() => setDeleteContributionId(null)}
        title="Eliminare il versamento?"
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteContributionId) return;
          await deleteContributionMutation.mutateAsync({
            id: deleteContributionId,
          });
          setDeleteContributionId(null);
        }}
      />
    </div>
  );
}
