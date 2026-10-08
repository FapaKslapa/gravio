"use client";

import { Plus, Search } from "lucide-react";
import { useId, useRef, useState } from "react";
import { CategorySuggestionChip } from "@/components/category-suggestion-chip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PickerCategory } from "./category-picker-utils";
import { CategoryTile } from "./category-tile";

const SEARCH_THRESHOLD = 12;

type CategoryPickerProps = {
  categories: PickerCategory[];
  value: string;
  onChange: (id: string) => void;
  suggestedId?: string | null;
  onCreateNew?: () => void;
  noneLabel?: string;
  label?: string;
  className?: string;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  suggestedId = null,
  onCreateNew,
  noneLabel = "Nessuna categoria",
  label = "Categoria",
  className,
}: CategoryPickerProps) {
  const [query, setQuery] = useState("");
  const groupRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const searchable = categories.length > SEARCH_THRESHOLD;
  const q = query.trim().toLowerCase();
  const visible = q
    ? categories.filter((c) => c.name.toLowerCase().includes(q))
    : categories;
  const showNone = !q;
  const ids = showNone
    ? ["", ...visible.map((c) => c.id)]
    : visible.map((c) => c.id);
  const hasValue = ids.includes(value);
  const tabStop = hasValue ? value : ids[0];

  const move = (e: React.KeyboardEvent, current: string) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const step = keys[e.key];
    if (!step) return;
    e.preventDefault();
    const idx = ids.indexOf(current);
    const next = ids[(idx + step + ids.length) % ids.length];
    onChange(next);
    requestAnimationFrame(() => {
      groupRef.current
        ?.querySelector<HTMLElement>(`[data-cat-id="${CSS.escape(next)}"]`)
        ?.focus();
    });
  };

  const tiles: (PickerCategory | null)[] = showNone
    ? [null, ...visible]
    : visible;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <CategorySuggestionChip
        categoryId={suggestedId && !value ? suggestedId : null}
        categories={categories}
        onUse={onChange}
      />
      {searchable && (
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={searchId}
            type="search"
            aria-label="Cerca categoria"
            placeholder="Cerca categoria"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
      )}
      <div
        data-vaul-no-drag
        className={cn(
          "-m-1 p-1",
          searchable && "max-h-72 overflow-y-auto overscroll-contain",
        )}
      >
        <div
          ref={groupRef}
          role="radiogroup"
          aria-label={label}
          className="grid grid-cols-[repeat(auto-fill,minmax(6.25rem,1fr))] gap-2"
        >
          {tiles.map((cat) => {
            const id = cat?.id ?? "";
            return (
              <CategoryTile
                key={id || "__none__"}
                cat={cat}
                active={id === value}
                tabStop={id === tabStop}
                noneLabel={noneLabel}
                onSelect={onChange}
                onKeyDown={move}
              />
            );
          })}
        </div>
        {q && visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nessuna categoria trovata.
          </p>
        )}
      </div>
      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Plus className="size-4 text-brand" aria-hidden />
          Nuova categoria
        </button>
      )}
    </div>
  );
}

export { CategoryBadge } from "./category-badge";
export type { PickerCategory } from "./category-picker-utils";
export { readableInk } from "./category-picker-utils";
