import { CategoryIcon } from "@/components/icon-helper";

export { TransactionActionsMenu } from "./transaction-actions-menu";
export { TransactionsEmpty } from "./transactions-empty";

import { cn, formatCurrency } from "@/lib/utils";
import {
  type Category,
  type ConvertCurrency,
  FALLBACK_CATEGORY_COLOR,
  resolveDisplayAmount,
  type Transaction,
} from "./transaction-list-types";

export function CategoryTile({
  category,
  size = "md",
}: {
  category?: Category;
  size?: "sm" | "md";
}) {
  const color = category?.color ?? FALLBACK_CATEGORY_COLOR;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        size === "md" ? "size-10" : "size-8",
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      <CategoryIcon
        name={category?.icon ?? "Sparkles"}
        size={size === "md" ? 18 : 15}
      />
    </span>
  );
}

export function AmountBlock({
  tx,
  displayCurrency,
  convertCurrency,
  align = "end",
}: {
  tx: Transaction;
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  align?: "end" | "start";
}) {
  const isExpense = tx.type === "expense";
  const displayAmount = resolveDisplayAmount(
    tx,
    displayCurrency,
    convertCurrency,
  );

  let hint: string | null = null;
  if (tx.sharedInfo) {
    hint = tx.sharedInfo.isBorrowed
      ? "Tua quota"
      : `Totale ${formatCurrency(
          convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency),
          displayCurrency,
        )}`;
  } else if (tx.currency !== displayCurrency) {
    hint = `${tx.amount} ${tx.currency}`;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "end" ? "items-end text-right" : "items-start",
      )}
    >
      <span
        className={cn(
          "tabular whitespace-nowrap text-sm font-semibold",
          isExpense ? "text-foreground" : "text-income",
        )}
      >
        {isExpense ? "−" : "+"}
        {formatCurrency(displayAmount, displayCurrency)}
      </span>
      {hint && (
        <span className="tabular whitespace-nowrap text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}
