"use client";

import { TransactionsEmpty } from "./transaction-list-parts";
import type {
  Category,
  ConvertCurrency,
  Transaction,
} from "./transaction-list-types";
import { type SortFieldType, SortHeader } from "./transaction-sort-header";
import { TransactionMobileList } from "./transaction-table-mobile-list";
import { TransactionTablePagination } from "./transaction-table-pagination";
import { TransactionTableRow } from "./transaction-table-parts";

type TransactionTableProps = {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  categories: Category[];
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortFieldType) => void;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

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

  const sortProps = { sortField, sortDirection, onSortChange };
  const rowProps = {
    displayCurrency,
    convertCurrency,
    onDeleteClick,
    onEditClick,
  };

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
            {transactions.map((tx) => (
              <TransactionTableRow
                key={tx.id}
                tx={tx}
                cat={categories.find((c) => c.id === tx.categoryId)}
                {...rowProps}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TransactionMobileList
        transactions={transactions}
        categories={categories}
        {...rowProps}
      />

      <TransactionTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        onChangePage={onChangePage}
      />
    </div>
  );
}
