"use client";

import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { RecurrentFormFields } from "./recurrent-form-fields";

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
};

type RecurrentTransactionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  editingTx: RecurrentTx | null;
  onSubmitSuccess: () => void;
};

type FormState = {
  description: string;
  amount: string;
  currency: string;
  categoryId: string;
  type: "expense" | "income";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
  validationError: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

type RecurrentTransactionFormProps = {
  editingTx: RecurrentTx | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSubmitSuccess: () => void;
};

function RecurrentTransactionForm({
  editingTx,
  categories,
  onClose,
  onSubmitSuccess,
}: RecurrentTransactionFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () => {
    if (editingTx) {
      return {
        description: editingTx.description,
        amount: editingTx.amount,
        currency: editingTx.currency,
        categoryId: editingTx.categoryId || "",
        type: editingTx.type as "expense" | "income",
        frequency: editingTx.frequency as
          | "daily"
          | "weekly"
          | "monthly"
          | "yearly",
        startDate: dayjs(editingTx.startDate).format("YYYY-MM-DD"),
        endDate: editingTx.endDate
          ? dayjs(editingTx.endDate).format("YYYY-MM-DD")
          : "",
        validationError: "",
        isSubmitting: false,
      };
    }
    return {
      description: "",
      amount: "",
      currency: "EUR",
      categoryId: "",
      type: "expense" as const,
      frequency: "monthly" as const,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      validationError: "",
      isSubmitting: false,
    };
  });

  const {
    description,
    amount,
    currency,
    categoryId,
    type,
    frequency,
    startDate,
    endDate,
    validationError,
    isSubmitting,
  } = state;

  const [showErrors, setShowErrors] = useState(false);
  const trpc = useTRPC();
  const createMutation = useMutation(
    trpc.recurrentTransaction.create.mutationOptions({
      onSuccess: () => {
        onSubmitSuccess();
        onClose();
      },
      onError: (err) => {
        dispatch({
          type: "SET_FIELD",
          field: "validationError",
          value: err.message || "Errore nella creazione.",
        });
        dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.recurrentTransaction.update.mutationOptions({
      onSuccess: () => {
        onSubmitSuccess();
        onClose();
      },
      onError: (err) => {
        dispatch({
          type: "SET_FIELD",
          field: "validationError",
          value: err.message || "Errore nell'aggiornamento.",
        });
        dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
      },
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setShowErrors(true);
    if (!description.trim()) return;

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      dispatch({
        type: "SET_FIELD",
        field: "validationError",
        value: "Inserisci un importo valido e maggiore di zero.",
      });
      return;
    }

    const payload = {
      description,
      amount: parsedAmount,
      currency,
      categoryId: categoryId || null,
      type,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: "active" as const,
    };

    const validation = recurrentTransactionSchema.safeParse(payload);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Input non valido.";
      dispatch({
        type: "SET_FIELD",
        field: "validationError",
        value: firstError,
      });
      return;
    }

    dispatch({ type: "SET_FIELD", field: "isSubmitting", value: true });
    try {
      if (editingTx) {
        await updateMutation.mutateAsync({
          id: editingTx.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <RecurrentFormFields
        showErrors={showErrors}
        description={description}
        setDescription={(val) =>
          dispatch({ type: "SET_FIELD", field: "description", value: val })
        }
        amount={amount}
        setAmount={(val) =>
          dispatch({ type: "SET_FIELD", field: "amount", value: val })
        }
        currency={currency}
        setCurrency={(val) =>
          dispatch({ type: "SET_FIELD", field: "currency", value: val })
        }
        categoryId={categoryId}
        setCategoryId={(val) =>
          dispatch({ type: "SET_FIELD", field: "categoryId", value: val })
        }
        type={type}
        setType={(val) =>
          dispatch({ type: "SET_FIELD", field: "type", value: val })
        }
        frequency={frequency}
        setFrequency={(val) =>
          dispatch({ type: "SET_FIELD", field: "frequency", value: val })
        }
        startDate={startDate}
        setStartDate={(val) =>
          dispatch({ type: "SET_FIELD", field: "startDate", value: val })
        }
        endDate={endDate}
        setEndDate={(val) =>
          dispatch({ type: "SET_FIELD", field: "endDate", value: val })
        }
        categories={categories}
      />

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
        {validationError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {validationError}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onClose}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-12 flex-[2] text-white",
              type === "expense"
                ? "bg-expense hover:bg-expense/90"
                : "bg-income hover:bg-income/90",
            )}
          >
            {isSubmitting
              ? "Salvataggio..."
              : editingTx
                ? "Salva regola"
                : "Crea regola"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function RecurrentTransactionDrawer({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSubmitSuccess,
}: RecurrentTransactionDrawerProps) {
  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={editingTx ? "Modifica regola" : "Nuova regola ricorrente"}
      description={
        editingTx
          ? "Aggiorna i dettagli della regola ricorrente"
          : "Imposta una spesa o entrata ripetitiva"
      }
      className="md:max-w-md"
    >
      <RecurrentTransactionForm
        editingTx={editingTx}
        categories={categories}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />
    </ResponsiveSheet>
  );
}
