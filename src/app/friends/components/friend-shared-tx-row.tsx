import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionInfo } from "./friend-detail-types";

type Props = {
  tx: TransactionInfo;
  friendName: string;
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function FriendSharedTxRow({
  tx,
  friendName,
  currentUserId,
  displayCurrency,
  convertCurrency,
}: Props) {
  const isPayer = tx.userId === currentUserId;

  const activeAmount = tx.sharedInfo
    ? tx.sharedInfo.isBorrowed
      ? convertCurrency(
          parseFloat(tx.sharedInfo.splitAmountNok),
          "NOK",
          displayCurrency,
        )
      : convertCurrency(
          parseFloat(tx.amountNok) - parseFloat(tx.sharedInfo.splitAmountNok),
          "NOK",
          displayCurrency,
        )
    : 0;

  const originalAmount = convertCurrency(
    parseFloat(tx.amountEur),
    "EUR",
    displayCurrency,
  );
  const settled = tx.sharedInfo?.settled;

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 not-last:border-b">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="line-clamp-2 break-words text-sm font-semibold">
          {tx.description || "Spesa condivisa"}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{new Date(tx.date).toLocaleDateString("it-IT")}</span>
          <span aria-hidden>·</span>
          <span>{isPayer ? "Hai pagato tu" : `Ha pagato ${friendName}`}</span>
          {settled && (
            <Badge className="bg-income-soft text-income">Saldata</Badge>
          )}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            "tabular text-sm font-bold",
            settled
              ? "text-muted-foreground line-through"
              : isPayer
                ? "text-income"
                : "text-expense",
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
