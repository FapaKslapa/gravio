import { CurrencySelect } from "@/components/ui/currency-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const POPULAR_CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "NOK",
  "SEK",
  "DKK",
  "CHF",
  "JPY",
  "CAD",
  "AUD",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "TRY",
  "BRL",
  "MXN",
  "SGD",
  "HKD",
  "KRW",
  "INR",
];

export function CurrencyConverterField({
  id,
  label,
  amount,
  currency,
  currencies,
  onAmountChange,
  onCurrencyChange,
}: {
  id: string;
  label: string;
  amount: string;
  currency: string;
  currencies: { code: string; name: string }[];
  onAmountChange: (val: string) => void;
  onCurrencyChange: (val: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="tabular h-11 flex-1 text-base font-semibold"
        />
        <div className="w-24">
          <CurrencySelect
            value={currency}
            onChange={onCurrencyChange}
            triggerClassName="h-11 text-sm"
            currencies={currencies}
          />
        </div>
      </div>
    </Field>
  );
}
