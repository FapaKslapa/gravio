import type { BulkTodoItem } from "./todo-bulk-convert-types";

export type FormState = {
  txAmount: string;
  txCurrency: string;
  txDate: string;
  txDescription: string;
  txCategoryId: string;
  isSubmitting: boolean;
};

type FormAction =
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

export function createInitialState(
  selectedTodos: BulkTodoItem[],
  displayCurrency: string,
  convertCurrency: (amount: number, from: string, to: string) => number,
): FormState {
  let estTotal = 0;
  for (const item of selectedTodos) {
    if (item.estimatedAmount) {
      const amt = parseFloat(item.estimatedAmount);
      const cur = item.estimatedCurrency || "EUR";
      estTotal += convertCurrency(amt, cur, displayCurrency);
    }
  }

  const titles = selectedTodos.map((t) => t.title).join(", ");
  const firstCatId = selectedTodos.find((t) => t.categoryId)?.categoryId || "";

  return {
    txAmount: estTotal > 0 ? estTotal.toFixed(2) : "",
    txCurrency: displayCurrency,
    txDate: new Date().toISOString().substring(0, 10),
    txDescription: `Spesa: ${titles}`,
    txCategoryId: firstCatId,
    isSubmitting: false,
  };
}
