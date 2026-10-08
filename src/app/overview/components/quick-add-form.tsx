"use client";

import dayjs from "dayjs";
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
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
import { cn, formatCurrency } from "@/lib/utils";

type CategoryType = { id: string; name: string; icon: string; color: string };

type QuickAddFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
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

  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const showConversion = hasAmount && currency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, currency, displayCurrency)
    : null;

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
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set("categoryId", selected ? "" : cat.id)}
                      className={cn(
                        "inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors active:scale-[0.97]",
                        selected ? "font-semibold" : "bg-card",
                      )}
                      style={
                        selected
                          ? {
                              backgroundColor: `color-mix(in oklch, ${cat.color} 15%, transparent)`,
                              borderColor: cat.color,
                            }
                          : undefined
                      }
                    >
                      <span style={{ color: cat.color }}>
                        <CategoryIcon name={cat.icon} size={16} />
                      </span>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
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
              <Input
                type="date"
                aria-label="Altra data"
                value={effectiveDate}
                max={today}
                onChange={(e) => set("date", e.target.value)}
                className="tabular h-11 w-auto min-w-40 flex-1"
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
