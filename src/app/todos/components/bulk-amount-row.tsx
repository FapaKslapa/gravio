import { CurrencySelect } from "@/components/ui/currency-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";

type BulkAmountRowProps = {
  amount: string;
  currency: string;
  onAmount: (val: string) => void;
  onCurrency: (val: string) => void;
};

export function BulkAmountRow({
  amount,
  currency,
  onAmount,
  onCurrency,
}: BulkAmountRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Field className="col-span-2">
        <FieldLabel>Prezzo totale</FieldLabel>
        <MoneyInput
          value={amount}
          onChange={onAmount}
          currency={currency}
          required
        />
      </Field>
      <Field>
        <FieldLabel>Valuta</FieldLabel>
        <CurrencySelect value={currency} onChange={onCurrency} />
      </Field>
    </div>
  );
}
