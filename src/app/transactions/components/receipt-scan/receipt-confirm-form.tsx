import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { TxCurrencySelect } from "@/components/ui/tx-form-parts";
import { springs } from "@/lib/motion";
import type { ReceiptData } from "@/lib/schemas/receipt";
import type { ReceiptCategory } from "./receipt-types";

type Props = {
  categories: ReceiptCategory[];
  desc: string;
  setDesc: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  suggestedId: string | null;
  items: ReceiptData["items"];
  submitted: boolean;
  validAmount: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onManual: () => void;
};

export function ReceiptConfirmForm(p: Props) {
  return (
    <m.form
      key="confirm"
      noValidate
      onSubmit={p.onSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: springs.gentle }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-muted-foreground">
        Controlla i dati letti e correggi se serve.
      </p>
      <FieldGroup>
        <Field data-invalid={(p.submitted && !p.desc.trim()) || undefined}>
          <FieldLabel htmlFor="rc-desc">Negozio</FieldLabel>
          <Input
            id="rc-desc"
            className="h-11"
            value={p.desc}
            aria-invalid={(p.submitted && !p.desc.trim()) || undefined}
            onChange={(e) => p.setDesc(e.target.value)}
          />
        </Field>
        <Field data-invalid={(p.submitted && !p.validAmount) || undefined}>
          <FieldLabel htmlFor="rc-amount">Importo</FieldLabel>
          <MoneyInput
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Data</FieldLabel>
            <CustomDatePicker
              value={p.date}
              onChange={p.setDate}
              triggerClassName="h-11 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rc-currency">Valuta</FieldLabel>
            <TxCurrencySelect
              id="rc-currency"
              value={p.currency}
              onChange={p.setCurrency}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <CategoryPicker
            categories={p.categories}
            value={p.categoryId}
            onChange={p.setCategoryId}
            suggestedId={p.suggestedId}
          />
        </Field>
        {p.items.length > 0 && <ReceiptItems items={p.items} />}
      </FieldGroup>
      <div className="sticky bottom-0 -mx-4 flex flex-col gap-1 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
        <Button
          type="submit"
          disabled={p.saving}
          className="h-12 w-full bg-expense text-white hover:bg-expense/90"
        >
          {p.saving ? "Salvataggio..." : "Salva spesa"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={p.onManual}
        >
          Inserisci a mano
        </Button>
      </div>
    </m.form>
  );
}

function ReceiptItems({ items }: { items: ReceiptData["items"] }) {
  return (
    <details className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
      <summary className="min-h-11 cursor-pointer content-center font-medium">
        {items.length} righe lette
      </summary>
      <ul className="flex flex-col gap-1 pb-2">
        {items.map((it, i) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={i}
            className="tabular flex justify-between gap-3 text-muted-foreground"
          >
            <span className="truncate">{it.description}</span>
            <span>{it.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
