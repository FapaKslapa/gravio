import { convertAmounts } from "@/lib/utils";

type MoneyInput = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeRateNok?: number;
  description?: string;
  categoryId?: string | null;
  date: string;
};

export function moneyFields(input: MoneyInput) {
  const { amountEur, amountNok } = convertAmounts(
    input.amount,
    input.currency,
    input.exchangeRate,
    input.exchangeRateNok ?? 11.85,
  );
  return {
    amountNok,
    values: {
      categoryId: input.categoryId || null,
      type: input.type,
      amount: input.amount.toFixed(2),
      currency: input.currency,
      amountEur: amountEur.toFixed(2),
      amountNok: amountNok.toFixed(2),
      exchangeRate: input.exchangeRate.toFixed(4),
      description: input.description || "",
      date: new Date(input.date),
    },
  };
}
