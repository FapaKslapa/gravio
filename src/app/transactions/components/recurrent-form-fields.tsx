"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  TxAmountHero,
  TxCategoryChips,
  TxTypeSegment,
} from "@/components/ui/tx-form-parts";
import { RecurrentScheduleFields } from "./recurrent/recurrent-schedule-fields";
import type { CategoryOption, Frequency } from "./recurrent/recurrent-types";

type RecurrentFormFieldsProps = {
  description: string;
  setDescription: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  type: "expense" | "income";
  setType: (v: "expense" | "income") => void;
  frequency: Frequency;
  setFrequency: (v: Frequency) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  categories: CategoryOption[];
  showErrors?: boolean;
};

export function RecurrentFormFields({
  description,
  setDescription,
  amount,
  setAmount,
  currency,
  setCurrency,
  categoryId,
  setCategoryId,
  type,
  setType,
  categories,
  showErrors = false,
  ...schedule
}: RecurrentFormFieldsProps) {
  const amountInvalid = showErrors && !(parseFloat(amount) > 0);
  const descInvalid = showErrors && !description.trim();

  return (
    <div className="flex flex-col gap-5">
      <TxTypeSegment value={type} onChange={setType} pillId="rec-type" />

      <Field data-invalid={amountInvalid || undefined}>
        <FieldLabel htmlFor="rec-amount" className="sr-only">
          Importo
        </FieldLabel>
        <TxAmountHero
          id="rec-amount"
          value={amount}
          onChange={setAmount}
          currency={currency}
          type={type}
          invalid={amountInvalid}
        />
        {amountInvalid && (
          <FieldError className="text-center">
            Inserisci un importo maggiore di zero.
          </FieldError>
        )}
      </Field>

      <FieldGroup>
        <Field data-invalid={descInvalid || undefined}>
          <FieldLabel htmlFor="rec-desc">Descrizione</FieldLabel>
          <Input
            id="rec-desc"
            className="h-11"
            placeholder="Es. Stipendio, Affitto, Netflix"
            value={description}
            aria-invalid={descInvalid || undefined}
            onChange={(e) => setDescription(e.target.value)}
          />
          {descInvalid && <FieldError>Aggiungi una descrizione.</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <TxCategoryChips
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </Field>

        <RecurrentScheduleFields
          currency={currency}
          setCurrency={setCurrency}
          {...schedule}
        />
      </FieldGroup>
    </div>
  );
}
