"use client";

import dayjs from "dayjs";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CustomDateRangePicker,
  type DateRangePreset,
} from "@/components/ui/custom-datepicker";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { FALLBACK_CATEGORY_COLOR } from "./transaction-list-timeline";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type FilterTypeValue = "" | "expense" | "income";

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
  categories: Category[];
};

function periodPresets(): DateRangePreset[] {
  const now = dayjs();
  const fmt = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
  const last = now.subtract(1, "month");
  return [
    {
      label: "Questo mese",
      from: fmt(now.startOf("month")),
      to: fmt(now.endOf("month")),
    },
    {
      label: "Mese scorso",
      from: fmt(last.startOf("month")),
      to: fmt(last.endOf("month")),
    },
    {
      label: "Ultimi 3 mesi",
      from: fmt(now.subtract(2, "month").startOf("month")),
      to: fmt(now.endOf("month")),
    },
    {
      label: "Quest'anno",
      from: fmt(now.startOf("year")),
      to: fmt(now.endOf("year")),
    },
  ];
}

const TYPE_OPTIONS: { value: FilterTypeValue; label: string }[] = [
  { value: "", label: "Tutte" },
  { value: "expense", label: "Spese" },
  { value: "income", label: "Entrate" },
];

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
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand-soft pl-3 pr-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-brand-soft/70 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
    >
      {label}
      <X aria-hidden="true" className="size-3.5" />
    </button>
  );
}

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

  const dateChip = (iso: string, prefix: string) =>
    `${prefix} ${dayjs(iso).format("D MMM YYYY")}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Cerca transazione"
            placeholder="Cerca descrizione o importo"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="h-11 rounded-full bg-card pl-10 pr-10 text-base"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText("")}
              aria-label="Cancella ricerca"
              className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

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
            className="h-9 shrink-0 rounded-full px-3 text-xs text-muted-foreground"
          >
            Azzera filtri
          </Button>
        </div>
      )}

      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title="Filtri"
        description="Restringi l'elenco delle transazioni"
        className="sm:max-w-md"
      >
        <div className="flex flex-col gap-6 pb-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Tipo</legend>
            <div className="flex gap-1 rounded-full bg-muted p-1">
              {TYPE_OPTIONS.map((opt) => {
                const active = filterType === opt.value;
                return (
                  <button
                    key={opt.value || "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilterType(opt.value)}
                    className={cn(
                      "h-11 flex-1 rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Categoria</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={filterCategoryId === ""}
                onClick={() => setFilterCategoryId("")}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  filterCategoryId === ""
                    ? "border-transparent bg-brand text-brand-foreground"
                    : "bg-card text-foreground hover:bg-muted",
                )}
              >
                Tutte
              </button>
              {categories.map((cat) => {
                const active = filterCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilterCategoryId(active ? "" : cat.id)}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "border-transparent bg-brand text-brand-foreground"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full ring-1 ring-background"
                      style={{
                        backgroundColor: cat.color || FALLBACK_CATEGORY_COLOR,
                      }}
                    />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Periodo</legend>
            <CustomDateRangePicker
              aria-label="Periodo"
              placeholder="Qualsiasi periodo"
              title="Periodo"
              presets={periodPresets()}
              value={{ from: filterStartDate, to: filterEndDate }}
              onChange={({ from, to }) => {
                setFilterStartDate(from);
                setFilterEndDate(to);
              }}
            />
          </fieldset>

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
        </div>
      </ResponsiveSheet>
    </div>
  );
}
