import dayjs from "dayjs";
import type { Frequency, RecurrentTx } from "./recurrent-types";

export type FormState = {
  description: string;
  amount: string;
  currency: string;
  categoryId: string;
  type: "expense" | "income";
  frequency: Frequency;
  startDate: string;
  endDate: string;
  validationError: string;
  isSubmitting: boolean;
};

export type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<FormState> };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

export function initFormState(editingTx: RecurrentTx | null): FormState {
  if (editingTx) {
    return {
      description: editingTx.description,
      amount: editingTx.amount,
      currency: editingTx.currency,
      categoryId: editingTx.categoryId || "",
      type: editingTx.type as "expense" | "income",
      frequency: editingTx.frequency as Frequency,
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
    type: "expense",
    frequency: "monthly",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    validationError: "",
    isSubmitting: false,
  };
}
