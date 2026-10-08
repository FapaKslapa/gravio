"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { APPLE_COLORS } from "@/lib/constants";
import { GOAL_ICONS } from "@/lib/schemas/savings-goal";
import { cn } from "@/lib/utils";
import { GOAL_ICON_MAP, type Goal } from "../goals-helpers";

const GOAL_COLORS = APPLE_COLORS.slice(0, 12);

export type GoalFormValues = {
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: string | null;
  color: string;
  icon: (typeof GOAL_ICONS)[number];
};

type GoalFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  defaultCurrency: string;
  isPending: boolean;
  onSubmit: (values: GoalFormValues) => void | Promise<void>;
};

export function GoalFormSheet({
  open,
  onOpenChange,
  goal,
  defaultCurrency,
  isPending,
  onSubmit,
}: GoalFormSheetProps) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={goal ? "Modifica obiettivo" : "Nuovo obiettivo"}
      description="Scegli quanto vuoi mettere da parte e, se vuoi, entro quando."
    >
      {open && (
        <GoalForm
          key={goal?.id ?? "new"}
          goal={goal}
          defaultCurrency={defaultCurrency}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      )}
    </ResponsiveSheet>
  );
}

function GoalForm({
  goal,
  defaultCurrency,
  isPending,
  onSubmit,
}: Omit<GoalFormSheetProps, "open" | "onOpenChange">) {
  const [name, setName] = useState(goal?.name ?? "");
  const [amount, setAmount] = useState(
    goal ? goal.targetAmount.toFixed(2) : "",
  );
  const [currency, setCurrency] = useState(goal?.currency ?? defaultCurrency);
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [color, setColor] = useState(goal?.color ?? GOAL_COLORS[8]);
  const [icon, setIcon] = useState<GoalFormValues["icon"]>(
    (goal?.icon as GoalFormValues["icon"]) ?? "target",
  );

  const parsed = Number.parseFloat(amount);
  const valid = name.trim().length > 0 && parsed > 0;

  return (
    <form
      className="flex flex-col gap-5 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          name: name.trim(),
          targetAmount: parsed,
          currency,
          targetDate: targetDate || null,
          color,
          icon,
        });
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="goal-name">Nome</FieldLabel>
          <Input
            id="goal-name"
            value={name}
            maxLength={60}
            placeholder="Es. Viaggio in Giappone"
            className="h-12"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Importo da raggiungere</FieldLabel>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            currency={currency}
            label="Importo da raggiungere"
          />
        </Field>
        <Field>
          <FieldLabel>Valuta</FieldLabel>
          <CurrencySelect value={currency} onChange={setCurrency} />
        </Field>
        <Field>
          <FieldLabel>Scadenza (facoltativa)</FieldLabel>
          <div className="flex items-center gap-2">
            <CustomDatePicker
              value={targetDate}
              onChange={setTargetDate}
              placeholder="Nessuna scadenza"
              className="flex-1"
            />
            {targetDate && (
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={() => setTargetDate("")}
              >
                Rimuovi
              </Button>
            )}
          </div>
        </Field>
        <Field>
          <FieldLabel>Icona</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map((key) => {
              const { Icon, label } = GOAL_ICON_MAP[key];
              const active = icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  aria-label={label}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-lg border outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-transparent bg-brand text-brand-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </button>
              );
            })}
          </div>
        </Field>
        <Field>
          <FieldLabel>Colore</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={color === c}
                aria-label={`Colore ${c}`}
                onClick={() => setColor(c)}
                className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check
                    className="size-5 text-white"
                    strokeWidth={3}
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
        </Field>
      </FieldGroup>
      <Button
        type="submit"
        disabled={!valid || isPending}
        className="h-12 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {goal ? "Salva modifiche" : "Crea obiettivo"}
      </Button>
    </form>
  );
}
