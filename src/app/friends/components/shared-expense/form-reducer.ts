import type { FormAction, FormState } from "./types";

export const initialFormState: FormState = {
  step: "form",
  shareType: "friend",
  desc: "",
  amount: "",
  currency: "EUR",
  date: "",
  friendId: "",
  splitMode: "half",
  percentage: "50",
  exactNok: "",
  n: "2",
  groupId: "",
  checkedMemberIds: [],
  groupSplitMode: "equal",
  customSplitsVal: {},
};

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...initialFormState, ...action.payload };
    default:
      return state;
  }
}
