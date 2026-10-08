export type FormState = {
  todoTitle: string;
  todoCategoryId: string;
  todoEstAmount: string;
  todoEstCurrency: string;
  isSubmitting: boolean;
  showDetails: boolean;
};

export type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "RESET"; payload: Partial<FormState> };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const createInitialFormState = (displayCurrency: string): FormState => ({
  todoTitle: "",
  todoCategoryId: "",
  todoEstAmount: "",
  todoEstCurrency: displayCurrency,
  isSubmitting: false,
  showDetails: false,
});
