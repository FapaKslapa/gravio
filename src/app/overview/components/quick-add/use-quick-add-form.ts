import dayjs from "dayjs";
import { useMemo, useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import {
  useCategorySuggestion,
  useDebouncedValue,
} from "@/hooks/use-category-suggestion";
import {
  type CategoryType,
  CURRENCIES,
  type FormState,
  formReducer,
  type QuickAddTransaction,
  type RecentTx,
  type SetField,
} from "./quick-add-types";

type Params = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  recentTransactions: RecentTx[];
  onSave: (transaction: QuickAddTransaction) => Promise<void>;
};

export function useQuickAddForm({
  isOpen,
  onClose,
  categories,
  recentTransactions,
  onSave,
}: Params) {
  const { convertCurrency, displayCurrency } = useDashboard();

  const initial: FormState = {
    desc: "",
    type: "expense",
    amount: "",
    currency: displayCurrency,
    categoryId: "",
    date: "",
    isSaving: false,
  };

  const [state, dispatch] = useReducer(formReducer, initial);
  const { desc, type, amount, currency, categoryId, date } = state;

  const set: SetField = (field, value) =>
    dispatch({ type: "SET_FIELD", field, value });

  const recents = useMemo(() => {
    const seen = new Set<string>();
    const out: RecentTx[] = [];
    const sorted = [...recentTransactions].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    );
    for (const t of sorted) {
      if (t.type !== "expense" && t.type !== "income") continue;
      const key = `${t.type}|${t.categoryId ?? ""}|${parseFloat(t.amount)}|${t.currency}|${t.description ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
      if (out.length === 4) break;
    }
    return out;
  }, [recentTransactions]);

  const applyRecent = (t: RecentTx) =>
    dispatch({
      type: "RESET",
      payload: {
        ...state,
        type: t.type === "income" ? "income" : "expense",
        amount: parseFloat(t.amount).toFixed(2),
        currency: t.currency,
        categoryId: t.categoryId ?? "",
        desc: t.description ?? "",
        date: "",
        isSaving: false,
      },
    });

  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const showConversion = hasAmount && currency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, currency, displayCurrency)
    : null;

  const suggest = useCategorySuggestion(isOpen);
  const debouncedDesc = useDebouncedValue(desc, 200);
  const suggestedId = categoryId ? null : suggest(debouncedDesc);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const effectiveDate = date || today;
  const currencyOptions = CURRENCIES.includes(currency)
    ? CURRENCIES
    : [currency, ...CURRENCIES];

  const handleSave = async () => {
    if (!hasAmount) return;
    set("isSaving", true);
    try {
      await onSave({
        description:
          desc.trim() ||
          selectedCategory?.name ||
          (type === "expense" ? "Spesa" : "Entrata"),
        type,
        amount: parsedAmount,
        currency,
        categoryId: categoryId || null,
        date: date || new Date().toISOString(),
      });
      dispatch({ type: "RESET", payload: initial });
      onClose();
    } finally {
      set("isSaving", false);
    }
  };

  return {
    state,
    set,
    recents,
    applyRecent,
    parsedAmount,
    hasAmount,
    convertedAmount,
    displayCurrency,
    suggestedId,
    today,
    yesterday,
    effectiveDate,
    currencyOptions,
    handleSave,
  };
}
