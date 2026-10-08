"use client";

import { Check, TrendingDown, TrendingUp } from "lucide-react";
import { m } from "motion/react";
import { useId } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const TX_CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "NOK", name: "Corona norvegese" },
  { code: "USD", name: "Dollaro USA" },
  { code: "GBP", name: "Sterlina" },
  { code: "SEK", name: "Corona svedese" },
  { code: "DKK", name: "Corona danese" },
  { code: "CHF", name: "Franco svizzero" },
  { code: "CAD", name: "Dollaro canadese" },
  { code: "AUD", name: "Dollaro australiano" },
  { code: "JPY", name: "Yen" },
  { code: "CNY", name: "Yuan" },
  { code: "INR", name: "Rupia indiana" },
  { code: "BRL", name: "Real" },
  { code: "MXN", name: "Peso messicano" },
  { code: "SGD", name: "Dollaro di Singapore" },
  { code: "HKD", name: "Dollaro di Hong Kong" },
  { code: "KRW", name: "Won" },
  { code: "PLN", name: "Zloty" },
  { code: "CZK", name: "Corona ceca" },
  { code: "HUF", name: "Fiorino" },
  { code: "RON", name: "Leu" },
  { code: "TRY", name: "Lira turca" },
  { code: "ZAR", name: "Rand" },
  { code: "RUB", name: "Rublo" },
  { code: "SAR", name: "Riyal" },
  { code: "AED", name: "Dirham" },
  { code: "NZD", name: "Dollaro neozelandese" },
  { code: "THB", name: "Baht" },
  { code: "MYR", name: "Ringgit" },
  { code: "IDR", name: "Rupia indonesiana" },
];

type TxType = "expense" | "income";

export function TxTypeSegment({
  value,
  onChange,
  incomeLabel = "Entrata",
  pillId,
}: {
  value: TxType;
  onChange: (v: TxType) => void;
  incomeLabel?: string;
  pillId?: string;
}) {
  const autoId = useId();
  const layoutId = pillId ?? `tx-type-${autoId}`;
  const options = [
    { id: "expense" as const, label: "Spesa", Icon: TrendingDown },
    { id: "income" as const, label: incomeLabel, Icon: TrendingUp },
  ];
  return (
    <fieldset
      aria-label="Tipo di operazione"
      className="m-0 grid min-w-0 border-0 h-11 grid-cols-2 rounded-full bg-muted p-1"
    >
      {options.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "text-white" : "text-muted-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={springs.snappy}
                className={cn(
                  "absolute inset-0 rounded-full",
                  id === "expense" ? "bg-expense" : "bg-income",
                )}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

export function sanitizeAmount(raw: string) {
  let v = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
  if (parts[1] && parts[1].length > 2)
    v = `${parts[0]}.${parts[1].slice(0, 2)}`;
  return v;
}

export function TxAmountHero({
  value,
  onChange,
  currency,
  type,
  invalid,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  currency: string;
  type: TxType;
  invalid?: boolean;
  id?: string;
}) {
  return (
    <div className="flex items-baseline justify-center gap-2 py-2">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        aria-label="Importo"
        aria-invalid={invalid || undefined}
        value={value}
        size={Math.max(value.length, 4)}
        onChange={(e) => onChange(sanitizeAmount(e.target.value))}
        onBlur={() => {
          const n = parseFloat(value);
          if (!Number.isNaN(n)) onChange(n.toFixed(2));
        }}
        className={cn(
          "num-display max-w-[70%] bg-transparent text-center font-display text-[clamp(2.5rem,13vw,3.75rem)] font-bold leading-none tracking-tight outline-none placeholder:text-muted-foreground/40",
          invalid
            ? "text-destructive"
            : type === "expense"
              ? "text-expense"
              : "text-income",
        )}
      />
      <span className="text-lg font-semibold text-muted-foreground">
        {currency}
      </span>
    </div>
  );
}

export function TxCurrencySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const list = TX_CURRENCIES.some((c) => c.code === value)
    ? TX_CURRENCIES
    : [...TX_CURRENCIES, { code: value, name: value }];
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-11 w-full rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectGroup>
          {list.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} · {c.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type ChipCategory = { id: string; name: string; icon: string; color: string };

export function TxCategoryChips({
  categories,
  value,
  onChange,
  generalLabel = "Generale",
  label = "Categoria",
}: {
  categories: ChipCategory[];
  value: string;
  onChange: (id: string) => void;
  generalLabel?: string;
  label?: string;
}) {
  const all: ChipCategory[] = [
    { id: "", name: generalLabel, icon: "Sparkles", color: "#8E8E93" },
    ...categories,
  ];
  return (
    <fieldset
      aria-label={label}
      className="m-0 grid min-w-0 border-0 grid-cols-3 gap-2 sm:grid-cols-4"
    >
      {all.map((cat) => {
        const active = cat.id === value;
        return (
          <button
            key={cat.id || "__general__"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(cat.id)}
            className={cn(
              "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-md border px-1.5 py-2 text-center outline-none transition-[transform,background-color] active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "border-transparent" : "border-border bg-card",
            )}
            style={
              active
                ? {
                    backgroundColor: `${cat.color}1f`,
                    boxShadow: `inset 0 0 0 2px ${cat.color}`,
                  }
                : undefined
            }
          >
            <span
              className="flex size-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
            >
              <CategoryIcon name={cat.icon} size={16} />
            </span>
            <span className="w-full truncate text-xs font-medium text-foreground">
              {cat.name}
            </span>
            {active && (
              <span
                className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: cat.color }}
              >
                <Check className="size-3" aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
