import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export type CategoryType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type RecentTx = {
  type: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  description: string | null;
  date: Date | string;
};

export type QuickAddTransaction = {
  description: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
};

export const CURRENCIES = [
  "EUR",
  "NOK",
  "USD",
  "GBP",
  "SEK",
  "DKK",
  "CHF",
  "CAD",
  "AUD",
  "JPY",
  "PLN",
  "CZK",
];

export const AMOUNT_PRESETS = [5, 10, 20, 50];

export type FormState = {
  desc: string;
  type: "expense" | "income";
  amount: string;
  currency: string;
  categoryId: string;
  date: string;
  isSaving: boolean;
};

export type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof FormState;
      value: FormState[keyof FormState];
    }
  | { type: "RESET"; payload: FormState };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

export const NO_RECENT: RecentTx[] = [];

export const TYPES = [
  { value: "expense", label: "Spesa", Icon: ArrowUpRight },
  { value: "income", label: "Entrata", Icon: ArrowDownLeft },
] as const;

export type SetField = <K extends keyof FormState>(
  field: K,
  value: FormState[K],
) => void;
