"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { GoalColorField } from "./goal-color-field";
import { GOAL_COLORS } from "./goal-colors";
import type { GoalFormSheetProps, GoalFormValues } from "./goal-form-types";
import { GoalIconField } from "./goal-icon-field";

export function GoalForm({
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
        <GoalIconField value={icon} onChange={setIcon} />
        <GoalColorField value={color} onChange={setColor} />
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
