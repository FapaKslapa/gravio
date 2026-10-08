import dayjs from "dayjs";
import {
  AmountBlock,
  CategoryTile,
  TransactionActionsMenu,
} from "./transaction-list-parts";
import type {
  Category,
  ConvertCurrency,
  Transaction,
} from "./transaction-list-types";

type TransactionMobileListProps = {
  transactions: Transaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

export function TransactionMobileList({
  transactions,
  categories,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
  onEditClick,
}: TransactionMobileListProps) {
  return (
    <ul className="divide-y md:hidden">
      {transactions.map((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        return (
          <li key={tx.id} className="flex items-center gap-1 pr-1">
            <button
              type="button"
              onClick={() => onEditClick(tx)}
              className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 pr-2 text-left outline-none focus-visible:bg-muted/60"
            >
              <CategoryTile category={cat} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {tx.description || "Transazione"}
                </span>
                <span className="tabular truncate text-xs text-muted-foreground">
                  {dayjs(tx.date).format("DD/MM/YYYY")} ·{" "}
                  {cat ? cat.name : "Generale"}
                </span>
              </span>
              <AmountBlock
                tx={tx}
                displayCurrency={displayCurrency}
                convertCurrency={convertCurrency}
              />
            </button>
            <TransactionActionsMenu
              tx={tx}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
            />
          </li>
        );
      })}
    </ul>
  );
}
