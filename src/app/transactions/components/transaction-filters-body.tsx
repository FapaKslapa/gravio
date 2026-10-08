import dayjs from "dayjs";
import {
  CustomDateRangePicker,
  type DateRangePreset,
} from "@/components/ui/custom-datepicker";
import { cn } from "@/lib/utils";
import {
  CategoryFilterField,
  type FilterCategory,
} from "./category-filter-field";

export type { FilterCategory };

export type FilterTypeValue = "" | "expense" | "income";

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

type TransactionFiltersBodyProps = {
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

export function TransactionFiltersBody({
  filterCategoryId,
  setFilterCategoryId,
  filterType,
  setFilterType,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  categories,
}: TransactionFiltersBodyProps) {
  return (
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

      <CategoryFilterField
        categories={categories}
        filterCategoryId={filterCategoryId}
        setFilterCategoryId={setFilterCategoryId}
      />

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
    </div>
  );
}
