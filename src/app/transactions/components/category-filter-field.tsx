import { cn } from "@/lib/utils";
import { FALLBACK_CATEGORY_COLOR } from "./transaction-list-types";

export type FilterCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export function CategoryFilterField({
  categories,
  filterCategoryId,
  setFilterCategoryId,
}: {
  categories: FilterCategory[];
  filterCategoryId: string;
  setFilterCategoryId: (v: string) => void;
}) {
  return (
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
  );
}
