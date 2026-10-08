"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { FilterSearchInput } from "./filter-search-input";
import { ActiveFilterChips } from "./transaction-filter-chips";
import {
  type FilterCategory,
  type FilterTypeValue,
  TransactionFiltersBody,
} from "./transaction-filters-body";

type TransactionFiltersProps = {
  filterText: string;
  setFilterText: (v: string) => void;
  filterCategoryId: string;
  setFilterCategoryId: (v: string) => void;
  filterType: FilterTypeValue;
  setFilterType: (v: FilterTypeValue) => void;
  filterStartDate: string;
  setFilterStartDate: (v: string) => void;
  filterEndDate: string;
  setFilterEndDate: (v: string) => void;
  categories: FilterCategory[];
};

export function TransactionFilters({
  filterText,
  setFilterText,
  filterCategoryId,
  setFilterCategoryId,
  filterType,
  setFilterType,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  categories,
}: TransactionFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCategory = categories.find((c) => c.id === filterCategoryId);
  const sheetFilterCount = [
    filterCategoryId,
    filterType,
    filterStartDate,
    filterEndDate,
  ].filter(Boolean).length;
  const hasAny = sheetFilterCount > 0 || !!filterText;

  const resetAll = () => {
    setFilterText("");
    setFilterCategoryId("");
    setFilterType("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FilterSearchInput value={filterText} onChange={setFilterText} />

        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          aria-label={
            sheetFilterCount > 0
              ? `Filtri, ${sheetFilterCount} attivi`
              : "Filtri"
          }
          className="elevation-1 relative h-11 shrink-0 gap-2 rounded-full bg-card px-4 active:scale-[0.97]"
        >
          <SlidersHorizontal />
          <span className="hidden sm:inline">Filtri</span>
          {sheetFilterCount > 0 && (
            <span className="tabular flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">
              {sheetFilterCount}
            </span>
          )}
        </Button>
      </div>

      {sheetFilterCount > 0 && (
        <ActiveFilterChips
          filterType={filterType}
          setFilterType={setFilterType}
          activeCategory={activeCategory}
          setFilterCategoryId={setFilterCategoryId}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          resetAll={resetAll}
        />
      )}

      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title="Filtri"
        description="Restringi l'elenco delle transazioni"
        className="sm:max-w-md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-full"
              disabled={!hasAny}
              onClick={resetAll}
            >
              Azzera
            </Button>
            <Button
              className="h-11 flex-1 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => setOpen(false)}
            >
              Mostra risultati
            </Button>
          </div>
        }
      >
        <TransactionFiltersBody
          filterCategoryId={filterCategoryId}
          setFilterCategoryId={setFilterCategoryId}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          categories={categories}
        />
      </ResponsiveSheet>
    </div>
  );
}
