import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { AMOUNT_PRESETS, type SetField } from "./quick-add-types";

export function AmountSection({
  amount,
  currency,
  currencyOptions,
  parsedAmount,
  convertedAmount,
  displayCurrency,
  set,
}: {
  amount: string;
  currency: string;
  currencyOptions: string[];
  parsedAmount: number;
  convertedAmount: number | null;
  displayCurrency: string;
  set: SetField;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <MoneyInput
          value={amount}
          onChange={(v) => set("amount", v)}
          currency={currency}
          placeholder="0.00"
          className="h-auto min-h-16 flex-1 rounded-lg border-input bg-muted px-4"
          inputClassName="num-display tabular h-14 text-4xl font-bold"
        />
        <Select value={currency} onValueChange={(v) => set("currency", v)}>
          <SelectTrigger
            aria-label="Valuta"
            className="h-auto min-h-16 w-24 rounded-lg"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currencyOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {AMOUNT_PRESETS.map((n) => (
          <Button
            key={n}
            type="button"
            variant="outline"
            className="tabular h-11 min-w-14 rounded-full"
            onClick={() => {
              const current = parseFloat(amount) || 0;
              set("amount", (current + n).toFixed(2));
            }}
          >
            +{n}
          </Button>
        ))}
        {amount && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-full"
            onClick={() => set("amount", "")}
          >
            Azzera
          </Button>
        )}
      </div>
      {convertedAmount !== null && (
        <p className="tabular flex items-center gap-1.5 text-sm text-muted-foreground">
          {formatCurrency(parsedAmount, currency)}
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="font-semibold text-foreground">
            {formatCurrency(convertedAmount, displayCurrency)}
          </span>
        </p>
      )}
    </div>
  );
}
