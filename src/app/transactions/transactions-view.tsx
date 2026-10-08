"use client";

import { useUrlActions } from "@/hooks/use-url-actions";
import { ReceiptScanButton } from "./components/receipt-scan-button";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionsContentGrid } from "./components/transactions-content-grid";
import { TransactionsDialogs } from "./components/transactions-dialogs";
import { TransactionsMobileTabs } from "./components/transactions-mobile-tabs";
import { TransactionsPageHeader } from "./components/transactions-page-header";
import { TransactionsSkeleton } from "./components/transactions-skeleton";
import { TransactionsViewModeSwitcher } from "./components/transactions-view-mode-switcher";
import { useTransactionFilters } from "./components/use-transaction-filters";
import { useTransactionMutations } from "./components/use-transaction-mutations";
import { useTransactionQueries } from "./components/use-transaction-queries";
import { useTransactionsUiState } from "./components/use-transactions-ui-state";

export default function TransactionsView() {
  const ui = useTransactionsUiState();
  const {
    currentPage,
    viewMode,
    sortField,
    sortDirection,
    activeMobileTab,
    setCurrentPage,
    setViewMode,
    handleSortChange,
    setActiveMobileTab,
    setIsTxModalOpen,
    setIsCatManageOpen,
    setIsCsvModalOpen,
    setTxToDelete,
    setEditingTx,
  } = ui;

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

  const mutations = useTransactionMutations(refetchCategories);
  const { handleSaveTx, handleCreateCategory } = mutations;

  useUrlActions({
    new: () => setIsTxModalOpen(true),
    import: () => setIsCsvModalOpen(true),
    q: (value) => filters.handleFilterText(value),
  });

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <TransactionsPageHeader
        onNewTransaction={() => setIsTxModalOpen(true)}
        onImportCsv={() => setIsCsvModalOpen(true)}
        onManageCategories={() => setIsCatManageOpen(true)}
        extraActions={
          <ReceiptScanButton
            label="Scontrino"
            className="rounded-full px-4"
            categories={categories}
            onSave={(tx) => handleSaveTx(tx, () => setEditingTx(null))}
            onCreateCategory={handleCreateCategory}
          />
        }
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

      <TransactionsDialogs {...ui} {...mutations} categories={categories} />
    </div>
  );
}
