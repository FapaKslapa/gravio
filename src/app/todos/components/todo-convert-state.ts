import type { TodoConvertItem } from "./todo-convert-types";

export type FormState = {
  txAmount: string;
  txCurrency: string;
  txDate: string;
  isSubmitting: boolean;
};

type FormAction = { type: "SET"; payload: Partial<FormState> };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function createInitialState(
  todoItem: TodoConvertItem,
  displayCurrency: string,
): FormState {
  const estAmountNum = todoItem.estimatedAmount
    ? parseFloat(todoItem.estimatedAmount)
    : null;
  return {
    txAmount: estAmountNum ? estAmountNum.toString() : "",
    txCurrency: todoItem.estimatedCurrency || displayCurrency,
    txDate: new Date().toISOString().substring(0, 10),
    isSubmitting: false,
  };
}
