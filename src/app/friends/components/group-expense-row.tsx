import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionInfo } from "./group-detail-types";

type Props = {
  tx: TransactionInfo;
  allTransactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function GroupExpenseRow({
  tx,
  allTransactions,
  currentUserId,
  displayCurrency,
  convertCurrency,
}: Props) {
  const isPayer = tx.userId === currentUserId;

  let activeAmount = 0;
  if (isPayer) {
    const totalNok = parseFloat(tx.amountNok);
    const totalOthersSplitsNok = allTransactions
      .filter(
        (t) =>
          t.id === tx.id &&
          t.sharedInfo &&
          t.sharedInfo.payerId === currentUserId,
      )
      .reduce(
        (sum, t) => sum + parseFloat(t.sharedInfo?.splitAmountNok ?? "0"),
        0,
      );

    const myShareNok = totalNok - totalOthersSplitsNok;
    activeAmount = convertCurrency(myShareNok, "NOK", displayCurrency);
  } else {
    const mySplit = allTransactions.find(
      (t) =>
        t.id === tx.id &&
        t.sharedInfo &&
        t.sharedInfo.borrowerId === currentUserId,
    );

    const splitNok = mySplit?.sharedInfo
      ? parseFloat(mySplit.sharedInfo.splitAmountNok)
      : 0;
    activeAmount = convertCurrency(splitNok, "NOK", displayCurrency);
  }

  const originalAmount = convertCurrency(
    parseFloat(tx.amountEur),
    "EUR",
    displayCurrency,
  );

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 not-last:border-b">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="line-clamp-2 break-words text-sm font-semibold">
          {tx.description || "Spesa gruppo"}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{new Date(tx.date).toLocaleDateString("it-IT")}</span>
          <span aria-hidden>·</span>
          <span>
            {isPayer
              ? "Hai pagato tu"
              : `Ha pagato ${tx.payerName || "Membro"}`}
          </span>
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            "tabular text-sm font-bold",
            isPayer ? "text-income" : "text-expense",
          )}
        >
          {isPayer ? "+" : "-"}
          {formatCurrency(activeAmount, displayCurrency)}
        </span>
        <span className="tabular text-xs text-muted-foreground">
          Totale {formatCurrency(originalAmount, displayCurrency)}
        </span>
      </div>
    </li>
  );
}
