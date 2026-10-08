"use client";

import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

const POPULAR_CURRENCIES = [
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

export function CurrencyConverterCard({ className }: { className?: string }) {
  const { rates, displayCurrency, convertCurrency } = useDashboard();

  const defaultFrom = displayCurrency === "EUR" ? "USD" : "EUR";
  const defaultTo = displayCurrency;

  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState("100");
  const [activeSide, setActiveSide] = useState<"from" | "to">("from");

  const fromAmount =
    activeSide === "from"
      ? amount
      : convertCurrency(
          parseFloat(amount) || 0,
          toCurrency,
          fromCurrency,
        ).toFixed(2);

  const toAmount =
    activeSide === "to"
      ? amount
      : convertCurrency(
          parseFloat(amount) || 0,
          fromCurrency,
          toCurrency,
        ).toFixed(2);

  const handleFromChange = (val: string) => {
    setAmount(val);
    setActiveSide("from");
  };

  const handleToChange = (val: string) => {
    setAmount(val);
    setActiveSide("to");
  };

  const handleSwap = () => {
    const nextFrom = toCurrency;
    const nextTo = fromCurrency;
    setFromCurrency(nextFrom);
    setToCurrency(nextTo);
    if (activeSide === "from") {
      setActiveSide("to");
    } else {
      setActiveSide("from");
    }
  };

  const availableCurrencies = [
    ...new Set([
      ...POPULAR_CURRENCIES,
      ...Object.keys(rates).filter((c) => c.length === 3),
    ]),
  ].toSorted();

  const rate =
    rates[fromCurrency] && rates[toCurrency]
      ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4)
      : "—";

  const currencyList = availableCurrencies.map((c) => ({ code: c, name: c }));

  return (
    <Card className={cn("elevation-1 h-full rounded-lg ring-0", className)}>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          Convertitore valute
        </CardTitle>
        <CardDescription className="tabular">
          1 {fromCurrency} = {rate} {toCurrency}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            onClick={handleSwap}
            aria-label="Inverti valute"
          >
            <ArrowRightLeft />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="conv-from">Da</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="conv-from"
                type="number"
                inputMode="decimal"
                value={fromAmount}
                onChange={(e) => handleFromChange(e.target.value)}
                className="tabular h-11 flex-1 text-base font-semibold"
              />
              <div className="w-24">
                <CurrencySelect
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  triggerClassName="h-11 text-sm"
                  currencies={currencyList}
                />
              </div>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="conv-to">A</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="conv-to"
                type="number"
                inputMode="decimal"
                value={toAmount}
                onChange={(e) => handleToChange(e.target.value)}
                className="tabular h-11 flex-1 text-base font-semibold"
              />
              <div className="w-24">
                <CurrencySelect
                  value={toCurrency}
                  onChange={setToCurrency}
                  triggerClassName="h-11 text-sm"
                  currencies={currencyList}
                />
              </div>
            </div>
          </Field>
        </div>

        {fromAmount && toAmount && (
          <p className="num-display tabular text-lg font-bold">
            {formatCurrency(parseFloat(fromAmount) || 0, fromCurrency)} ={" "}
            {formatCurrency(parseFloat(toAmount) || 0, toCurrency)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
