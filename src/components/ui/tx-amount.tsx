"use client";

import { cn } from "@/lib/utils";
import type { TxType } from "./tx-types";

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
