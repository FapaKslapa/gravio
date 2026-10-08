import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export function useExchangeRates() {
  const { data: ratesData } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!res.ok) throw new Error("Failed to fetch rates");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const rates = useMemo(
    () =>
      (ratesData?.rates || { EUR: 1, NOK: 11.85 }) as Record<string, number>,
    [ratesData?.rates],
  );
  const isRateFetched = !!ratesData?.rates;
  const exchangeRate = ratesData?.rates?.NOK ?? 11.85;

  const convertCurrency = useCallback(
    (amount: number, from: string, to: string) => {
      if (!rates?.[from] || !rates[to]) return amount;
      const amountInEur = from === "EUR" ? amount : amount / rates[from];
      return to === "EUR" ? amountInEur : amountInEur * rates[to];
    },
    [rates],
  );

  return { rates, isRateFetched, exchangeRate, convertCurrency };
}
