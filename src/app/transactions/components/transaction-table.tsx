"use client";

import dayjs from "dayjs";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AmountBlock,
  type Category,
  CategoryTile,
  FALLBACK_CATEGORY_COLOR,
  type Transaction,
  TransactionActionsMenu,
  TransactionsEmpty,
} from "./transaction-list-timeline";

type SortFieldType = "date" | "description" | "category" | "type" | "amount";

type TransactionTableProps = {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  categories: Category[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortFieldType) => void;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

const ITEMS_PER_PAGE = 10;

function SortHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSortChange,
  align = "start",
}: {
  field: SortFieldType;
  label: string;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (f: SortFieldType) => void;
  align?: "start" | "end";
}) {
  const isCurrent = sortField === field;
  const Icon = isCurrent
    ? sortDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;
  return (
    <th
      scope="col"
      aria-sort={
        isCurrent
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className={cn("px-3 py-1", align === "end" && "text-right")}
    >
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className={cn(
          "-mx-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2",
          isCurrent ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", !isCurrent && "opacity-50")}
        />
      </button>
    </th>
  );
}

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

export function TransactionTable({
  transactions,
  totalItems,
  currentPage,
  onChangePage,
  categories,
  displayCurrency,
  convertCurrency,
  sortField,
  sortDirection,
  onSortChange,
  onDeleteClick,
  onEditClick,
}: TransactionTableProps) {
  if (totalItems === 0 && transactions.length === 0) {
    return <TransactionsEmpty />;
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  const sortProps = { sortField, sortDirection, onSortChange };

  return (
    <div className="elevation-1 overflow-hidden rounded-lg bg-card">
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Elenco transazioni</caption>
          <thead>
            <tr className="border-b bg-muted/40">
              <SortHeader field="date" label="Data" {...sortProps} />
              <SortHeader
                field="description"
                label="Descrizione"
                {...sortProps}
              />
              <SortHeader field="category" label="Categoria" {...sortProps} />
              <SortHeader field="type" label="Tipo" {...sortProps} />
              <SortHeader
                field="amount"
                label="Importo"
                align="end"
                {...sortProps}
              />
              <th scope="col" className="w-14 px-3">
                <span className="sr-only">Azioni</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <tr key={tx.id} className="transition-colors hover:bg-muted/40">
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
                          backgroundColor:
                            cat?.color ?? FALLBACK_CATEGORY_COLOR,
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
            })}
          </tbody>
        </table>
      </div>

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

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <span className="tabular text-xs text-muted-foreground">
          {startItem}–{endItem} di {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-11 md:size-9"
            disabled={currentPage === 1}
            onClick={() => onChangePage(currentPage - 1)}
            aria-label="Pagina precedente"
          >
            <ChevronLeft />
          </Button>
          <span className="tabular min-w-12 text-center text-xs font-medium">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-11 md:size-9"
            disabled={currentPage === totalPages}
            onClick={() => onChangePage(currentPage + 1)}
            aria-label="Pagina successiva"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
