"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { RecurrentTransactionCard } from "./recurrent-transaction-card";
import { RecurrentTransactionDrawer } from "./recurrent-transaction-drawer";
import { RecurrentTransactionRow } from "./recurrent-transaction-row";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecurrentTx = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  type: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
  nextOccurrence?: Date | string | null;
};

type RecurrentTransactionsManagerProps = {
  categories: CategoryOption[];
};

export function RecurrentTransactionsManager({
  categories,
}: RecurrentTransactionsManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<RecurrentTx | null>(null);

  const trpc = useTRPC();
  const {
    data: listData,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useQuery(trpc.recurrentTransaction.list.queryOptions());

  const toggleStatusMutation = useMutation(
    trpc.recurrentTransaction.toggleStatus.mutationOptions({
      onSuccess: () => {
        refetchList();
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.recurrentTransaction.delete.mutationOptions({
      onSuccess: () => {
        refetchList();
      },
    }),
  );

  const handleEdit = (rt: RecurrentTx) => {
    setEditingTx(rt);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    await toggleStatusMutation.mutateAsync({ id, status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  const rowProps = {
    onToggleStatus: handleToggleStatus,
    onEdit: handleEdit,
    onDelete: handleDelete,
    isDeletePending: deleteMutation.isPending,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold">Transazioni ricorrenti</h2>
          <p className="text-xs text-muted-foreground">
            Gestisci le tue entrate e spese ripetute nel tempo
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 shrink-0 gap-1.5 rounded-full px-4 active:scale-[0.97]"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus data-icon="inline-start" />
          Nuova ricorrente
        </Button>
      </div>

      <RecurrentTransactionDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTx(null);
        }}
        categories={categories}
        editingTx={editingTx}
        onSubmitSuccess={() => refetchList()}
      />

      {isListLoading ? (
        <div className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : listData && listData.length > 0 ? (
        <div className="elevation-1 overflow-hidden rounded-lg bg-card">
          <table className="hidden w-full border-collapse text-left text-sm md:table">
            <caption className="sr-only">Transazioni ricorrenti</caption>
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th scope="col" className="px-3 py-3">
                  Descrizione
                </th>
                <th scope="col" className="px-3 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-3">
                  Stato
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Importo
                </th>
                <th scope="col" className="px-3 py-3">
                  Frequenza
                </th>
                <th scope="col" className="px-3 py-3">
                  Scadenza
                </th>
                <th scope="col" className="px-3 py-3">
                  Prossima esecuzione
                </th>
                <th scope="col" className="w-14 px-3">
                  <span className="sr-only">Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listData.map((rt) => (
                <RecurrentTransactionRow
                  key={rt.id}
                  rt={rt}
                  category={categories.find((c) => c.id === rt.categoryId)}
                  {...rowProps}
                />
              ))}
            </tbody>
          </table>

          <ul className="divide-y md:hidden">
            {listData.map((rt) => (
              <RecurrentTransactionCard
                key={rt.id}
                rt={rt}
                category={categories.find((c) => c.id === rt.categoryId)}
                {...rowProps}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Empty className="border py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>Nessuna regola ricorrente attiva</EmptyTitle>
            <EmptyDescription>
              Crea una regola per automatizzare l'inserimento di stipendi,
              abbonamenti o affitto.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="h-11 gap-1.5 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus data-icon="inline-start" />
              Nuova ricorrente
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
