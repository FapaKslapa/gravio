"use client";

import type React from "react";
import { cn } from "@/lib/utils";

type MoneyInputProps = {
  value: string;
  onChange: (val: string) => void;
  currency?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
};

export function MoneyInput({
  value,
  onChange,
  currency = "EUR",
  placeholder = "0.00",
  label,
  required = false,
  className,
  inputClassName,
}: MoneyInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    rawVal = rawVal.replace(",", ".");
    rawVal = rawVal.replace(/[^0-9.]/g, "");

    const parts = rawVal.split(".");
    if (parts.length > 2) {
      rawVal = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    if (parts[1] && parts[1].length > 2) {
      rawVal = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    onChange(rawVal);
  };

  const handleBlur = () => {
    if (!value) return;

    const num = parseFloat(value);
    if (!Number.isNaN(num)) {
      onChange(num.toFixed(2));
    }
  };

  return (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-2 rounded-md border border-input bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40",
        className,
      )}
    >
      <input
        type="text"
        aria-label={label || "Importo"}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={required}
        className={cn(
          "num-display min-w-0 w-full flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/60",
          inputClassName,
        )}
      />
      <span className="tabular shrink-0 select-none text-sm font-semibold text-muted-foreground">
        {currency}
      </span>
    </div>
  );
}
