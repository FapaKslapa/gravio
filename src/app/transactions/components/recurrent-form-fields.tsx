"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TxAmountHero,
  TxCategoryChips,
  TxCurrencySelect,
  TxTypeSegment,
} from "@/components/ui/tx-form-parts";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Frequency = "daily" | "weekly" | "monthly" | "yearly";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Giornaliero" },
  { value: "weekly", label: "Settimanale" },
  { value: "monthly", label: "Mensile" },
  { value: "yearly", label: "Annuale" },
];

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
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
  showErrors = false,
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

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="rec-frequency">Frequenza</FieldLabel>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as Frequency)}
            >
              <SelectTrigger id="rec-frequency" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rec-currency">Valuta</FieldLabel>
            <TxCurrencySelect
              id="rec-currency"
              value={currency}
              onChange={setCurrency}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="rec-start">Inizio</FieldLabel>
            <Input
              id="rec-start"
              type="date"
              className="h-11"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rec-end">Fine (opzionale)</FieldLabel>
            <Input
              id="rec-end"
              type="date"
              className="h-11"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>
      </FieldGroup>
    </div>
  );
}
