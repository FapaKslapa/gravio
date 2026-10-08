"use client";

import dayjs from "dayjs";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  History,
  Repeat,
} from "lucide-react";
import { useMemo, useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategorySuggestion,
  useDebouncedValue,
} from "@/hooks/use-category-suggestion";
import { cn, formatCurrency } from "@/lib/utils";

type CategoryType = { id: string; name: string; icon: string; color: string };

type RecentTx = {
  type: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  description: string | null;
  date: Date | string;
};

type QuickAddFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  recentTransactions?: RecentTx[];
  onSave: (transaction: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => Promise<void>;
};

const CURRENCIES = [
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

const AMOUNT_PRESETS = [5, 10, 20, 50];

type FormState = {
  desc: string;
  type: "expense" | "income";
  amount: string;
  currency: string;
  categoryId: string;
  date: string;
  isSaving: boolean;
};

type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof FormState;
      value: FormState[keyof FormState];
    }
  | { type: "RESET"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

const TYPES = [
  { value: "expense", label: "Spesa", Icon: ArrowUpRight },
  { value: "income", label: "Entrata", Icon: ArrowDownLeft },
] as const;

export function QuickAddForm({
  isOpen,
  onClose,
  categories,
  recentTransactions = [],
  onSave,
}: QuickAddFormProps) {
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
  const { desc, type, amount, currency, categoryId, date, isSaving } = state;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
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

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={type === "expense" ? "Nuova spesa" : "Nuova entrata"}
      description="Registra una transazione in pochi tocchi"
      className="sm:max-w-lg"
    >
      <div className="flex flex-col gap-5 pb-2">
        {recents.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <History className="size-4" aria-hidden="true" />
                Recenti
              </p>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full px-3 text-brand"
                onClick={() => applyRecent(recents[0] as RecentTx)}
              >
                <Repeat data-icon="inline-start" />
                Ripeti ultima
              </Button>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {recents.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const label = t.description || cat?.name || "Senza nome";
                return (
                  <button
                    key={`${t.type}-${t.categoryId}-${t.amount}-${t.currency}-${t.description}`}
                    type="button"
                    onClick={() => applyRecent(t)}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border bg-card px-3.5 text-sm font-medium transition-colors active:scale-[0.97]"
                  >
                    {cat && (
                      <span style={{ color: cat.color }}>
                        <CategoryIcon name={cat.icon} size={16} />
                      </span>
                    )}
                    <span className="max-w-28 truncate">{label}</span>
                    <span
                      className={cn(
                        "tabular font-semibold",
                        t.type === "income" ? "text-income" : "text-expense",
                      )}
                    >
                      {formatCurrency(parseFloat(t.amount), t.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          role="radiogroup"
          aria-label="Tipo di operazione"
          className="grid h-11 grid-cols-2 gap-1 rounded-full bg-muted p-1"
        >
          {TYPES.map(({ value, label, Icon }) => {
            const active = type === value;
            return (
              // biome-ignore lint/a11y/useSemanticElements: segmented radio
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("type", value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors active:scale-[0.97]",
                  active
                    ? value === "expense"
                      ? "bg-expense text-background"
                      : "bg-income text-background"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-stretch gap-2">
            <MoneyInput
              value={amount}
              onChange={(v) => set("amount", v)}
              currency={currency}
              placeholder="0.00"
              className="h-auto min-h-16 flex-1 rounded-lg border-input bg-muted px-4"
              inputClassName="num-display tabular h-14 text-4xl font-bold"
            />
            <Select value={currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger
                aria-label="Valuta"
                className="h-auto min-h-16 w-24 rounded-lg"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {AMOUNT_PRESETS.map((n) => (
              <Button
                key={n}
                type="button"
                variant="outline"
                className="tabular h-11 min-w-14 rounded-full"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  set("amount", (current + n).toFixed(2));
                }}
              >
                +{n}
              </Button>
            ))}
            {amount && (
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full"
                onClick={() => set("amount", "")}
              >
                Azzera
              </Button>
            )}
          </div>
          {convertedAmount !== null && (
            <p className="tabular flex items-center gap-1.5 text-sm text-muted-foreground">
              {formatCurrency(parsedAmount, currency)}
              <ArrowRight className="size-4" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {formatCurrency(convertedAmount, displayCurrency)}
              </span>
            </p>
          )}
        </div>

        <FieldGroup>
          {categories.length > 0 && (
            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <CategoryPicker
                categories={categories}
                value={categoryId}
                onChange={(id) => set("categoryId", id)}
                suggestedId={suggestedId}
              />
            </Field>
          )}

          <Field>
            <FieldLabel>Data</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={effectiveDate === today ? "secondary" : "outline"}
                aria-pressed={effectiveDate === today}
                className="h-11 rounded-full px-4"
                onClick={() => set("date", "")}
              >
                Oggi
              </Button>
              <Button
                type="button"
                variant={effectiveDate === yesterday ? "secondary" : "outline"}
                aria-pressed={effectiveDate === yesterday}
                className="h-11 rounded-full px-4"
                onClick={() => set("date", yesterday)}
              >
                Ieri
              </Button>
              <CustomDatePicker
                value={effectiveDate}
                max={dayjs().format("YYYY-MM-DD")}
                onChange={(v) => set("date", v)}
                className="min-w-40 flex-1"
                triggerClassName="h-11 text-sm"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="quick-add-desc">Descrizione</FieldLabel>
            <Input
              id="quick-add-desc"
              placeholder="Facoltativa, es. cena fuori"
              value={desc}
              onChange={(e) => set("desc", e.target.value)}
              className="h-11"
            />
          </Field>
        </FieldGroup>

        <Button
          type="button"
          size="lg"
          disabled={isSaving || !hasAmount}
          onClick={handleSave}
          className={cn(
            "h-12 w-full rounded-full text-base font-semibold text-background active:scale-[0.97]",
            type === "expense"
              ? "bg-expense hover:bg-expense/90"
              : "bg-income hover:bg-income/90",
          )}
        >
          {isSaving
            ? "Salvataggio..."
            : type === "expense"
              ? "Aggiungi spesa"
              : "Aggiungi entrata"}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
