import dayjs from "dayjs";

export function buildDailySpend(
  daysInMonth: number,
  monthExpenses: { date: Date | string; amountEur: string }[],
  convert: (val: number, from: string, to: string) => number,
  displayCurrency: string,
): number[] {
  const daily = Array.from({ length: daysInMonth }, () => 0);
  for (const t of monthExpenses) {
    const d = dayjs(t.date).date();
    daily[d - 1] += convert(parseFloat(t.amountEur), "EUR", displayCurrency);
  }
  return daily;
}
