"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import type { Goal } from "../goals-helpers";

export type ContributionValues = {
  amount: number;
  date: string;
  note: string | null;
};

type ContributionSheetProps = {
  goal: Goal | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContributionValues) => void | Promise<void>;
};

export function ContributionSheet({
  goal,
  isPending,
  onOpenChange,
  onSubmit,
}: ContributionSheetProps) {
  return (
    <ResponsiveSheet
      open={goal !== null}
      onOpenChange={onOpenChange}
      title="Versa nell'obiettivo"
      description={goal ? goal.name : undefined}
    >
      {goal && (
        <ContributionForm
          key={goal.id}
          currency={goal.currency}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      )}
    </ResponsiveSheet>
  );
}

function ContributionForm({
  currency,
  isPending,
  onSubmit,
}: {
  currency: string;
  isPending: boolean;
  onSubmit: ContributionSheetProps["onSubmit"];
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [note, setNote] = useState("");
  const parsed = Number.parseFloat(amount);
  const valid = parsed > 0 && !!date;

  return (
    <form
      className="flex flex-col gap-5 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ amount: parsed, date, note: note.trim() || null });
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Importo</FieldLabel>
          <MoneyInput value={amount} onChange={setAmount} currency={currency} />
        </Field>
        <Field>
          <FieldLabel>Data</FieldLabel>
          <CustomDatePicker value={date} onChange={setDate} />
        </Field>
        <Field>
          <FieldLabel htmlFor="contribution-note">
            Nota (facoltativa)
          </FieldLabel>
          <Input
            id="contribution-note"
            value={note}
            maxLength={120}
            className="h-12"
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </FieldGroup>
      <Button
        type="submit"
        disabled={!valid || isPending}
        className="h-12 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        Versa
      </Button>
    </form>
  );
}
