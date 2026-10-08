"use client";

import { ArrowRight, Plus } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  TxAmountHero,
  TxCategoryChips,
  TxCurrencySelect,
  TxTypeSegment,
} from "@/components/ui/tx-form-parts";
import { fadeUp } from "@/lib/motion";
import { CategoryColorPicker, CategoryIconPicker } from "./category-form-panel";

type Category = { id: string; name: string; icon: string; color: string };

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
      <FieldLabel htmlFor="tx-date">Data</FieldLabel>
      <Input
        id="tx-date"
        type="date"
        className="h-11"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function ConversionBadge({
  parsedAmount,
  convertedAmount,
  sourceCurrency,
  targetCurrency,
}: {
  parsedAmount: number;
  convertedAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
}) {
  return (
    <m.p
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="tabular flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <span>
        {parsedAmount.toFixed(2)} {sourceCurrency}
      </span>
      <ArrowRight className="size-3.5" aria-hidden />
      <span className="font-semibold text-foreground">
        {convertedAmount.toFixed(2)} {targetCurrency}
      </span>
      <span className="sr-only">conversione stimata</span>
    </m.p>
  );
}

export function CategorySection({
  categoryId,
  categories,
  onCategoryChange,
  isInlineCatOpen,
  onToggleInlineCat,
  newCatName,
  onNewCatNameChange,
  newCatColor,
  onNewCatColorChange,
  newCatIcon,
  onNewCatIconChange,
  onCreateCategory,
}: {
  categoryId: string;
  categories: Category[];
  onCategoryChange: (id: string) => void;
  isInlineCatOpen: boolean;
  onToggleInlineCat: () => void;
  newCatName: string;
  onNewCatNameChange: (v: string) => void;
  newCatColor: string;
  onNewCatColorChange: (v: string) => void;
  newCatIcon: string;
  onNewCatIconChange: (v: string) => void;
  onCreateCategory: () => void;
}) {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel>Categoria</FieldLabel>
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-3 text-brand"
          onClick={onToggleInlineCat}
        >
          {!isInlineCatOpen && <Plus data-icon="inline-start" />}
          {isInlineCatOpen ? "Indietro" : "Nuova"}
        </Button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {isInlineCatOpen ? (
          <m.div
            key="creator"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-3"
          >
            <Field data-invalid={undefined}>
              <FieldLabel htmlFor="tx-new-cat">Nome categoria</FieldLabel>
              <Input
                id="tx-new-cat"
                className="h-11"
                placeholder="Es. Palestra"
                value={newCatName}
                onChange={(e) => onNewCatNameChange(e.target.value)}
              />
            </Field>
            <CategoryColorPicker
              value={newCatColor}
              onChange={onNewCatColorChange}
            />
            <CategoryIconPicker
              value={newCatIcon}
              color={newCatColor}
              onChange={onNewCatIconChange}
            />
            <Button
              type="button"
              disabled={!newCatName.trim()}
              className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={onCreateCategory}
            >
              Crea categoria
            </Button>
            <FieldDescription>
              La nuova categoria viene selezionata automaticamente.
            </FieldDescription>
          </m.div>
        ) : (
          <m.div
            key="chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TxCategoryChips
              categories={categories}
              value={categoryId}
              onChange={onCategoryChange}
            />
          </m.div>
        )}
      </AnimatePresence>
    </Field>
  );
}

export function SubmitButton({
  isSubmitting,
  type,
}: {
  isSubmitting: boolean;
  type: "expense" | "income";
}) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t bg-popover px-4 pb-1 pt-3 md:-mx-0 md:px-0">
      <Button
        type="submit"
        disabled={isSubmitting}
        className={
          type === "expense"
            ? "h-12 w-full bg-expense text-white hover:bg-expense/90"
            : "h-12 w-full bg-income text-white hover:bg-income/90"
        }
      >
        {isSubmitting ? "Salvataggio..." : "Salva transazione"}
      </Button>
    </div>
  );
}
