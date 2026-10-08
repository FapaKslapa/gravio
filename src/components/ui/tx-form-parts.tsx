"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { m } from "motion/react";
import { useId } from "react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TxType } from "./tx-types";

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
    // biome-ignore lint/a11y/useSemanticElements: fieldset cannot stretch grid rows to the pill height
    <div
      role="group"
      aria-label="Tipo di operazione"
      className="grid h-11 grid-cols-2 grid-rows-1 rounded-full bg-muted p-1"
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
              "relative flex h-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
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
    </div>
  );
}

export { sanitizeAmount } from "./sanitize-amount";
export { TxAmountHero } from "./tx-amount";
export { TX_CURRENCIES } from "./tx-currencies";
export { TxCategoryChips, TxCurrencySelect } from "./tx-form-pickers";
