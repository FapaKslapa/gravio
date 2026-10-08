import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortFieldType =
  | "date"
  | "description"
  | "category"
  | "type"
  | "amount";

export function SortHeader({
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
