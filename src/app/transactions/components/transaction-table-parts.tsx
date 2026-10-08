import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AmountBlock, TransactionActionsMenu } from "./transaction-list-parts";
import {
  type Category,
  type ConvertCurrency,
  FALLBACK_CATEGORY_COLOR,
  type Transaction,
} from "./transaction-list-types";

function TypeBadge({ type }: { type: "expense" | "income" }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        type === "expense"
          ? "bg-expense-soft text-expense"
          : "bg-income-soft text-income",
      )}
    >
      {type === "expense" ? "Spesa" : "Entrata"}
    </Badge>
  );
}

type TransactionTableRowProps = {
  tx: Transaction;
  cat: Category | undefined;
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

export function TransactionTableRow({
  tx,
  cat,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
  onEditClick,
}: TransactionTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="tabular whitespace-nowrap px-3 py-2.5 text-muted-foreground">
        {dayjs(tx.date).format("DD/MM/YYYY")}
      </td>
      <td className="max-w-64 px-3 py-2.5">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">
            {tx.description || "Transazione"}
          </span>
          {tx.sharedInfo && (
            <span className="truncate text-xs text-muted-foreground">
              {tx.sharedInfo.isBorrowed
                ? `Split da ${tx.payerName || "Amico"}`
                : `Split con ${tx.sharedInfo.borrowerName}`}
            </span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: cat?.color ?? FALLBACK_CATEGORY_COLOR,
            }}
          />
          {cat ? cat.name : "Generale"}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <TypeBadge type={tx.type} />
      </td>
      <td className="px-3 py-2.5">
        <AmountBlock
          tx={tx}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
        />
      </td>
      <td className="px-2 py-1 text-right">
        <TransactionActionsMenu
          tx={tx}
          onEdit={onEditClick}
          onDelete={onDeleteClick}
        />
      </td>
    </tr>
  );
}
