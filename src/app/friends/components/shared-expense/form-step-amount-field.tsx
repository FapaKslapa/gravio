"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { SHARED_CURRENCIES } from "./currencies";
import type { FormState } from "./types";

function sanitizeAmount(raw: string) {
  let v = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
  const dec = v.split(".")[1];
  if (dec && dec.length > 2) v = `${v.split(".")[0]}.${dec.slice(0, 2)}`;
  return v;
}

type AmountFieldProps = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  attempted: boolean;
  amountInvalid: boolean;
  converted: number | null;
  displayCurrency: string;
};

export function AmountField({
  state,
  set,
  attempted,
  amountInvalid,
  converted,
  displayCurrency,
}: AmountFieldProps) {
  const currencies = SHARED_CURRENCIES.includes(state.currency)
    ? SHARED_CURRENCIES
    : [state.currency, ...SHARED_CURRENCIES];

  return (
    <Field data-invalid={attempted && amountInvalid}>
      <FieldLabel htmlFor="shared-amount">Importo totale</FieldLabel>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
        <input
          id="shared-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={state.amount}
          aria-invalid={attempted && amountInvalid}
          onChange={(e) => set({ amount: sanitizeAmount(e.target.value) })}
          onBlur={() => {
            const n = parseFloat(state.amount);
            if (!Number.isNaN(n)) set({ amount: n.toFixed(2) });
          }}
          className={cn(
            "num-display min-w-0 flex-1 bg-transparent font-display font-bold tracking-tight outline-none placeholder:text-muted-foreground/50",
            "text-[clamp(2rem,11vw,3.25rem)] leading-none",
          )}
        />
        <Select
          value={state.currency}
          onValueChange={(v) => set({ currency: v })}
        >
          <SelectTrigger
            aria-label="Valuta"
            className="h-11 w-24 shrink-0 font-semibold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {converted !== null ? (
        <p className="tabular text-xs text-muted-foreground">
          Circa {formatCurrency(converted, displayCurrency)}
        </p>
      ) : null}
      {attempted && amountInvalid ? (
        <FieldError>Inserisci un importo maggiore di zero.</FieldError>
      ) : null}
    </Field>
  );
}
