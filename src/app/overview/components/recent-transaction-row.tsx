import dayjs from "dayjs";
import { CategoryIcon } from "@/components/icon-helper";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

export type RecentTransaction = {
  id: string;
  type: string;
  amount: string;
  currency: string;
  amountEur: string;
  amountNok: string;
  exchangeRate: string;
  description: string | null;
  date: Date;
  payerName?: string | null;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    borrowerName: string;
    borrowerEmail: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
    isPaidByMe: boolean;
  } | null;
  categoryId: string | null;
};

export type RecentCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Convert = (amount: number, from: string, to: string) => number;

function displayAmountOf(
  tx: RecentTransaction,
  convertCurrency: Convert,
  displayCurrency: string,
) {
  if (!tx.sharedInfo) {
    return convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);
  }
  const split = convertCurrency(
    parseFloat(tx.sharedInfo.splitAmountNok),
    "NOK",
    displayCurrency,
  );
  if (tx.sharedInfo.isBorrowed) return split;
  return (
    convertCurrency(parseFloat(tx.amountNok), "NOK", displayCurrency) - split
  );
}

export function RecentTransactionRow({
  tx,
  index,
  category,
  displayCurrency,
  convertCurrency,
}: {
  tx: RecentTransaction;
  index: number;
  category: RecentCategory | undefined;
  displayCurrency: string;
  convertCurrency: Convert;
}) {
  const color = category?.color ?? "var(--muted-foreground)";
  const displayAmount = displayAmountOf(tx, convertCurrency, displayCurrency);

  return (
    <li
      className={cn(
        "flex min-h-16 items-center gap-3 border-b py-2.5 last:border-b-0",
        index >= 8 && "max-xl:hidden",
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-md"
        style={{
          backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
          color,
        }}
      >
        <CategoryIcon name={category ? category.icon : "Sparkles"} size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-1.5">
          <span className="line-clamp-2 min-w-0 text-sm leading-snug font-semibold">
            {tx.description || "Transazione"}
          </span>
          {tx.sharedInfo && (
            <Badge
              className="shrink-0"
              variant={tx.sharedInfo.isBorrowed ? "destructive" : "secondary"}
            >
              Split
            </Badge>
          )}
        </div>
        <span className="text-xs leading-snug text-muted-foreground">
          {category?.name ?? "Senza categoria"} ·{" "}
          {dayjs(tx.date).format("D MMM")}
          {tx.sharedInfo &&
            ` · ${
              tx.sharedInfo.isBorrowed
                ? `quota da ${tx.payerName || "amico"}`
                : `quota con ${tx.sharedInfo.borrowerName}`
            }`}
        </span>
      </div>
      <span className="num-display tabular shrink-0 text-sm font-bold">
        −{formatCurrency(displayAmount, displayCurrency)}
      </span>
    </li>
  );
}
