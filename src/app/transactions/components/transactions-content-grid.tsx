import { SwipeArea } from "@/components/ui/swipe-area";
import { CategoryTotalsCard } from "./category-totals-card";
import { RecurrentTransactionsManager } from "./recurrent-transactions-manager";
import { TransactionListTimeline } from "./transaction-list-timeline";
import { TransactionTable } from "./transaction-table";
import { ITEMS_PER_PAGE } from "./transaction-table-pagination";
import type { MobileTab } from "./transactions-mobile-tabs";
import type {
  NormalizedTransaction,
  SortField,
  ViewMode,
} from "./transactions-utils";

type Category = { id: string; name: string; icon: string; color: string };

type CategoryTotal = {
  amountEur: number;
  count: number;
  color: string;
  icon: string;
  name: string;
};

interface TransactionsContentGridProps {
  viewMode: ViewMode;
  activeMobileTab: MobileTab;
  onMobileTabChange: (tab: MobileTab) => void;
  onViewModeChange: (mode: ViewMode) => void;
  groupedTx: { date: string; list: NormalizedTransaction[] }[];
  paginatedTxList: NormalizedTransaction[];
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  categories: Category[];
  categoryTotals: CategoryTotal[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortField) => void;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: NormalizedTransaction) => void;
}

export function TransactionsContentGrid({
  viewMode,
  activeMobileTab,
  onMobileTabChange,
  onViewModeChange,
  groupedTx,
  paginatedTxList,
  totalItems,
  currentPage,
  onChangePage,
  categories,
  categoryTotals,
  displayCurrency,
  convertCurrency,
  sortField,
  sortDirection,
  onSortChange,
  onDeleteClick,
  onEditClick,
}: TransactionsContentGridProps) {
  if (viewMode === "recurrent") {
    return (
      <SwipeArea onPrev={() => onViewModeChange("table")}>
        <RecurrentTransactionsManager categories={categories} />
      </SwipeArea>
    );
  }

  const showList = activeMobileTab === "list";
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const isTable = viewMode === "table";
  const canPagePrev = showList && isTable && currentPage > 1;
  const canPageNext = showList && isTable && currentPage < totalPages;

  const onPrev = canPagePrev
    ? () => onChangePage(currentPage - 1)
    : showList
      ? undefined
      : () => onMobileTabChange("list");
  const onNext = canPageNext
    ? () => onChangePage(currentPage + 1)
    : showList
      ? () => onMobileTabChange("summary")
      : undefined;

  return (
    <SwipeArea
      onPrev={onPrev}
      onNext={onNext}
      className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className={showList ? "block" : "hidden xl:block"}>
        {viewMode === "timeline" ? (
          <TransactionListTimeline
            groupedTx={groupedTx}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
            onDeleteClick={onDeleteClick}
            onEditClick={(tx) => onEditClick(tx as NormalizedTransaction)}
          />
        ) : (
          <TransactionTable
            transactions={paginatedTxList}
            totalItems={totalItems}
            currentPage={currentPage}
            onChangePage={onChangePage}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onDeleteClick={onDeleteClick}
            onEditClick={(tx) => onEditClick(tx as NormalizedTransaction)}
          />
        )}
      </div>

      <aside
        className={
          showList
            ? "hidden xl:sticky xl:top-6 xl:block"
            : "block xl:sticky xl:top-6"
        }
      >
        <CategoryTotalsCard
          categoryTotals={categoryTotals}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
        />
      </aside>
    </SwipeArea>
  );
}
