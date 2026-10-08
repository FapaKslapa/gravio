export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type SharedInfo = {
  id: string;
  payerId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  splitAmountNok: string;
  settled: boolean;
  isBorrowed: boolean;
  isPaidByMe: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: "expense" | "income";
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: string;
  date: string | Date;
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: SharedInfo | null;
};

export type GroupedTransaction = {
  date: string;
  list: Transaction[];
};

export type ConvertCurrency = (
  amount: number,
  from: string,
  to: string,
) => number;

export const FALLBACK_CATEGORY_COLOR = "#8E8E93";

export function resolveDisplayAmount(
  tx: Transaction,
  displayCurrency: string,
  convertCurrency: ConvertCurrency,
): number {
  if (tx.sharedInfo) {
    const splitNok = parseFloat(tx.sharedInfo.splitAmountNok);
    const totalNok = parseFloat(tx.amountNok);
    const myNok = tx.sharedInfo.isBorrowed ? splitNok : totalNok - splitNok;
    return convertCurrency(myNok, "NOK", displayCurrency);
  }
  return convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);
}
