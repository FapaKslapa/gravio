import dayjs from "dayjs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  FilterCategory,
  FilterTypeValue,
} from "./transaction-filters-body";

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Rimuovi filtro ${label}`}
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-soft pl-4 pr-3.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-brand-soft/70 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
    >
      {label}
      <X aria-hidden="true" className="size-3.5" />
    </button>
  );
}

const dateChip = (iso: string, prefix: string) =>
  `${prefix} ${dayjs(iso).format("D MMM YYYY")}`;

type ActiveFilterChipsProps = {
  filterType: FilterTypeValue;
  setFilterType: (v: FilterTypeValue) => void;
  activeCategory: FilterCategory | undefined;
  setFilterCategoryId: (v: string) => void;
  filterStartDate: string;
  setFilterStartDate: (v: string) => void;
  filterEndDate: string;
  setFilterEndDate: (v: string) => void;
  resetAll: () => void;
};

export function ActiveFilterChips({
  filterType,
  setFilterType,
  activeCategory,
  setFilterCategoryId,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  resetAll,
}: ActiveFilterChipsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:px-0">
      {filterType && (
        <FilterChip
          label={filterType === "expense" ? "Spese" : "Entrate"}
          onRemove={() => setFilterType("")}
        />
      )}
      {activeCategory && (
        <FilterChip
          label={activeCategory.name}
          onRemove={() => setFilterCategoryId("")}
        />
      )}
      {filterStartDate && (
        <FilterChip
          label={dateChip(filterStartDate, "Dal")}
          onRemove={() => setFilterStartDate("")}
        />
      )}
      {filterEndDate && (
        <FilterChip
          label={dateChip(filterEndDate, "Al")}
          onRemove={() => setFilterEndDate("")}
        />
      )}
      <Button
        variant="ghost"
        onClick={resetAll}
        className="h-11 shrink-0 rounded-full px-4 text-xs text-muted-foreground"
      >
        Azzera filtri
      </Button>
    </div>
  );
}
