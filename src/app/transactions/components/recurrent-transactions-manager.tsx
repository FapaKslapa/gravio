"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";
import {
  RecurrentEmpty,
  RecurrentLoading,
} from "./recurrent/recurrent-list-states";
import { RecurrentTable } from "./recurrent/recurrent-table";
import type { CategoryOption, RecurrentTx } from "./recurrent/recurrent-types";
import { RecurrentTransactionDrawer } from "./recurrent-transaction-drawer";

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
        <RecurrentLoading />
      ) : listData && listData.length > 0 ? (
        <RecurrentTable
          items={listData}
          categories={categories}
          {...rowProps}
        />
      ) : (
        <RecurrentEmpty onCreate={() => setIsFormOpen(true)} />
      )}
    </div>
  );
}
