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
import { cn, formatCurrency } from "@/lib/utils";
import { CurrencyConverterField } from "./currency-converter-field";
import { POPULAR_CURRENCIES } from "./popular-currencies";

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
          <CurrencyConverterField
            id="conv-from"
            label="Da"
            amount={fromAmount}
            currency={fromCurrency}
            currencies={currencyList}
            onAmountChange={handleFromChange}
            onCurrencyChange={setFromCurrency}
          />
          <CurrencyConverterField
            id="conv-to"
            label="A"
            amount={toAmount}
            currency={toCurrency}
            currencies={currencyList}
            onAmountChange={handleToChange}
            onCurrencyChange={setToCurrency}
          />
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
