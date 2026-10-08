"use client";

import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  TxAmountHero,
  TxCurrencySelect,
  TxTypeSegment,
} from "@/components/ui/tx-form-parts";

export { CategorySection } from "./transaction-category-section";
export { ConversionBadge, SubmitButton } from "./transaction-modal-extras";

export function TransactionTypeToggle({
  value,
  onChange,
}: {
  value: "expense" | "income";
  onChange: (v: "expense" | "income") => void;
}) {
  return (
    <TxTypeSegment
      value={value}
      onChange={onChange}
      incomeLabel="Guadagno"
      pillId="tx-modal-type"
    />
  );
}

export function AmountField({
  amount,
  currency,
  type,
  invalid,
  onChange,
}: {
  amount: string;
  currency: string;
  type: "expense" | "income";
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor="tx-amount" className="sr-only">
        Importo
      </FieldLabel>
      <TxAmountHero
        id="tx-amount"
        value={amount}
        onChange={onChange}
        currency={currency}
        type={type}
        invalid={invalid}
      />
      {invalid && (
        <FieldError className="text-center">
          Inserisci un importo maggiore di zero.
        </FieldError>
      )}
    </Field>
  );
}

export function CurrencyField({
  currency,
  onChange,
}: {
  currency: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="tx-currency">Valuta</FieldLabel>
      <TxCurrencySelect id="tx-currency" value={currency} onChange={onChange} />
    </Field>
  );
}

export function DescriptionField({
  value,
  invalid,
  onChange,
}: {
  value: string;
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor="tx-desc">Descrizione</FieldLabel>
      <Input
        id="tx-desc"
        className="h-11"
        placeholder="Es. Cena, Stipendio, Affitto"
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {invalid && <FieldError>Aggiungi una descrizione.</FieldError>}
    </Field>
  );
}

export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field>
      <FieldLabel>Data</FieldLabel>
      <CustomDatePicker
        value={value}
        onChange={onChange}
        triggerClassName="h-11 text-sm"
      />
    </Field>
  );
}
