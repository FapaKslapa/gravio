import { useMutation } from "@tanstack/react-query";
import { useReducer, useState } from "react";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { useTRPC } from "@/lib/trpc/client";
import { formReducer, initFormState } from "./recurrent-form-state";
import type { RecurrentTx } from "./recurrent-types";

type Args = {
  editingTx: RecurrentTx | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export function useRecurrentForm({
  editingTx,
  onClose,
  onSubmitSuccess,
}: Args) {
  const [state, dispatch] = useReducer(formReducer, editingTx, initFormState);
  const [showErrors, setShowErrors] = useState(false);
  const trpc = useTRPC();

  const setField = (field: keyof typeof state, value: unknown) =>
    dispatch({ type: "SET_FIELD", field, value });

  const fail = (fallback: string) => (err: { message: string }) => {
    setField("validationError", err.message || fallback);
    setField("isSubmitting", false);
  };

  const done = () => {
    onSubmitSuccess();
    onClose();
  };

  const createMutation = useMutation(
    trpc.recurrentTransaction.create.mutationOptions({
      onSuccess: done,
      onError: fail("Errore nella creazione."),
    }),
  );

  const updateMutation = useMutation(
    trpc.recurrentTransaction.update.mutationOptions({
      onSuccess: done,
      onError: fail("Errore nell'aggiornamento."),
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.isSubmitting) return;
    setShowErrors(true);
    if (!state.description.trim()) return;

    const parsedAmount = parseFloat(state.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setField(
        "validationError",
        "Inserisci un importo valido e maggiore di zero.",
      );
      return;
    }

    const payload = {
      description: state.description,
      amount: parsedAmount,
      currency: state.currency,
      categoryId: state.categoryId || null,
      type: state.type,
      frequency: state.frequency,
      startDate: new Date(state.startDate),
      endDate: state.endDate ? new Date(state.endDate) : null,
      status: "active" as const,
    };

    const validation = recurrentTransactionSchema.safeParse(payload);
    if (!validation.success) {
      setField(
        "validationError",
        validation.error.issues[0]?.message || "Input non valido.",
      );
      return;
    }

    setField("isSubmitting", true);
    try {
      if (editingTx) {
        await updateMutation.mutateAsync({ id: editingTx.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setField("isSubmitting", false);
    }
  };

  return { state, setField, showErrors, handleSubmit };
}
