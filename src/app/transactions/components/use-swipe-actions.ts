import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import type { Transaction } from "./transaction-list-types";

const UNDO_MS = 5000;
export function useSwipeActions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { rates } = useDashboard();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, () => void>());

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: trpc.transaction.list.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.transaction.listPaginated.queryKey(),
    });
  }, [queryClient, trpc]);

  const createMutation = useMutation(
    trpc.transaction.create.mutationOptions({ onSuccess: invalidate }),
  );
  const deleteMutation = useMutation(
    trpc.transaction.delete.mutationOptions({ onSuccess: invalidate }),
  );
  const createAsync = createMutation.mutateAsync;
  const deleteAsync = deleteMutation.mutateAsync;

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const flush of pending.values()) flush();
      pending.clear();
    };
  }, []);

  const softDelete = useCallback(
    (tx: Transaction) => {
      setHiddenIds((prev) => new Set(prev).add(tx.id));
      const commit = () => {
        timers.current.delete(tx.id);
        deleteAsync({ id: tx.id }).catch(() => {
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(tx.id);
            return next;
          });
          toast.error("Eliminazione non riuscita");
        });
      };
      const timer = setTimeout(commit, UNDO_MS);
      timers.current.set(tx.id, () => {
        clearTimeout(timer);
        commit();
      });
      toast("Movimento eliminato", {
        duration: UNDO_MS,
        action: {
          label: "Annulla",
          onClick: () => {
            clearTimeout(timer);
            timers.current.delete(tx.id);
            setHiddenIds((prev) => {
              const next = new Set(prev);
              next.delete(tx.id);
              return next;
            });
          },
        },
      });
    },
    [deleteAsync],
  );

  const duplicate = useCallback(
    async (tx: Transaction) => {
      try {
        const copy = await createAsync({
          description: tx.description ?? "",
          type: tx.type,
          amount: parseFloat(tx.amount),
          currency: tx.currency,
          exchangeRate: rates[tx.currency] ?? 1,
          exchangeRateNok: rates.NOK ?? 11.85,
          categoryId: tx.categoryId,
          date: new Date().toISOString(),
          sharedWithUserId: null,
        });
        toast("Movimento duplicato", {
          duration: UNDO_MS,
          action: {
            label: "Annulla",
            onClick: () => {
              deleteAsync({ id: copy.id }).catch(() =>
                toast.error("Impossibile annullare"),
              );
            },
          },
        });
      } catch {
        toast.error("Duplicazione non riuscita");
      }
    },
    [createAsync, deleteAsync, rates],
  );

  return { hiddenIds, softDelete, duplicate };
}
