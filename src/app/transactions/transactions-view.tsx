"use client";

import { useReducer } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesModal } from "./components/categories-modal";
import { CsvImportModal } from "./components/csv-import-modal";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionModal } from "./components/transaction-modal";
import { TransactionsContentGrid } from "./components/transactions-content-grid";
import {
  type MobileTab,
  TransactionsMobileTabs,
} from "./components/transactions-mobile-tabs";
import { TransactionsPageHeader } from "./components/transactions-page-header";
import type {
  NormalizedTransaction,
  SortField,
  ViewMode,
} from "./components/transactions-utils";
import { TransactionsViewModeSwitcher } from "./components/transactions-view-mode-switcher";
import { useTransactionFilters } from "./components/use-transaction-filters";
import { useTransactionMutations } from "./components/use-transaction-mutations";
import { useTransactionQueries } from "./components/use-transaction-queries";

type UIState = {
  currentPage: number;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  activeMobileTab: MobileTab;
  isTxModalOpen: boolean;
  isCatManageOpen: boolean;
  isCsvModalOpen: boolean;
  txToDelete: string | null;
  catToDelete: string | null;
  editingTx: NormalizedTransaction | null;
};

type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Caricamento in corso</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
      <Skeleton className="h-13 w-full rounded-full md:max-w-md" />
      <Skeleton className="h-11 w-full rounded-full" />
      {["a", "b", "c", "d", "e"].map((k) => (
        <Skeleton key={k} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function TransactionsView() {
  const [uiState, dispatch] = useReducer(uiReducer, {
    currentPage: 1,
    viewMode: "timeline",
    sortField: "date",
    sortDirection: "desc",
    activeMobileTab: "list",
    isTxModalOpen: false,
    isCatManageOpen: false,
    isCsvModalOpen: false,
    txToDelete: null,
    catToDelete: null,
    editingTx: null,
  });

  const {
    currentPage,
    viewMode,
    sortField,
    sortDirection,
    activeMobileTab,
    isTxModalOpen,
    isCatManageOpen,
    isCsvModalOpen,
    txToDelete,
    catToDelete,
    editingTx,
  } = uiState;

  const setCurrentPage = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "currentPage",
        value: val(currentPage),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "currentPage", value: val });
    }
  };
  const setViewMode = (val: ViewMode) =>
    dispatch({ type: "SET_FIELD", field: "viewMode", value: val });
  const setSortField = (val: SortField) =>
    dispatch({ type: "SET_FIELD", field: "sortField", value: val });
  const setSortDirection = (
    val: "asc" | "desc" | ((prev: "asc" | "desc") => "asc" | "desc"),
  ) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "sortDirection",
        value: val(sortDirection),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "sortDirection", value: val });
    }
  };
  const setActiveMobileTab = (val: MobileTab) =>
    dispatch({ type: "SET_FIELD", field: "activeMobileTab", value: val });
  const setIsTxModalOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isTxModalOpen", value: val });
  const setIsCatManageOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isCatManageOpen", value: val });
  const setIsCsvModalOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isCsvModalOpen", value: val });
  const setTxToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "txToDelete", value: val });
  const setCatToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "catToDelete", value: val });
  const setEditingTx = (val: NormalizedTransaction | null) =>
    dispatch({ type: "SET_FIELD", field: "editingTx", value: val });

  const resetPage = () => setCurrentPage(1);

  const filters = useTransactionFilters(resetPage);

  const {
    isLoading,
    refetchCategories,
    categories,
    groupedTx,
    categoryTotals,
    paginatedTxList,
    totalItems,
    displayCurrency,
    convertCurrency,
  } = useTransactionQueries({
    filterInput: filters.filterInput,
    currentPage,
    viewMode,
    sortField,
    sortDirection,
  });

  const {
    handleSaveTx,
    handleCreateCategory,
    handleUpdateCategory,
    handleCsvImport,
    handleDeleteTransaction,
    handleDeleteCategory,
  } = useTransactionMutations(refetchCategories);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    resetPage();
  };

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <TransactionsPageHeader
        onNewTransaction={() => setIsTxModalOpen(true)}
        onImportCsv={() => setIsCsvModalOpen(true)}
        onManageCategories={() => setIsCatManageOpen(true)}
      />

      <TransactionsViewModeSwitcher
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode !== "recurrent" && (
        <>
          <TransactionFilters
            filterText={filters.filterText}
            setFilterText={filters.handleFilterText}
            filterCategoryId={filters.filterCategoryId}
            setFilterCategoryId={filters.handleFilterCategory}
            filterType={filters.filterType}
            setFilterType={filters.handleFilterType}
            filterStartDate={filters.filterStartDate}
            setFilterStartDate={filters.handleFilterStart}
            filterEndDate={filters.filterEndDate}
            setFilterEndDate={filters.handleFilterEnd}
            categories={categories}
          />

          <TransactionsMobileTabs
            activeTab={activeMobileTab}
            onTabChange={setActiveMobileTab}
          />
        </>
      )}

      <TransactionsContentGrid
        viewMode={viewMode}
        activeMobileTab={activeMobileTab}
        groupedTx={groupedTx}
        paginatedTxList={paginatedTxList}
        totalItems={totalItems}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        categories={categories}
        categoryTotals={categoryTotals}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onDeleteClick={setTxToDelete}
        onEditClick={(tx) => {
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        categories={categories}
        editingTx={editingTx}
        onSave={(tx) => handleSaveTx(tx, () => setEditingTx(null))}
        onCreateCategory={handleCreateCategory}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        categories={categories}
        onImport={handleCsvImport}
      />

      <CategoriesModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        categories={categories}
        onDeleteCategory={setCatToDelete}
        onCreateCategory={async (cat) => {
          await handleCreateCategory(cat);
        }}
        onUpdateCategory={handleUpdateCategory}
      />

      <ConfirmationDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={() =>
          handleDeleteTransaction(txToDelete!, () => setTxToDelete(null))
        }
        title="Elimina Transazione"
        message="Sei sicuro di voler eliminare questa transazione? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />

      <ConfirmationDialog
        isOpen={catToDelete !== null}
        onClose={() => setCatToDelete(null)}
        onConfirm={() =>
          handleDeleteCategory(catToDelete!, () => setCatToDelete(null))
        }
        title="Elimina Categoria"
        message="Sei sicuro di voler eliminare questa categoria? Le transazioni collegate rimarranno ma diventeranno senza categoria."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
    </div>
  );
}
