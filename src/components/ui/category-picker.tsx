"use client";

import { Ban, Check, Plus, Search } from "lucide-react";
import { m } from "motion/react";
import { useId, useRef, useState } from "react";
import { CategorySuggestionChip } from "@/components/category-suggestion-chip";
import { CategoryIcon } from "@/components/icon-helper";
import { Input } from "@/components/ui/input";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type PickerCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

const SEARCH_THRESHOLD = 12;

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function readableInk(hex: string): "#ffffff" | "#111113" {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return "#ffffff";
  const r = channel(Number.parseInt(h.slice(0, 2), 16));
  const g = channel(Number.parseInt(h.slice(2, 4), 16));
  const b = channel(Number.parseInt(h.slice(4, 6), 16));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const whiteContrast = 1.05 / (lum + 0.05);
  const darkContrast = (lum + 0.05) / (0.007 + 0.05);
  return whiteContrast >= darkContrast ? "#ffffff" : "#111113";
}

export function CategoryBadge({
  cat,
  size = 36,
  className,
}: {
  cat: PickerCategory;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: cat.color,
        color: readableInk(cat.color),
      }}
    >
      <CategoryIcon name={cat.icon} size={Math.round(size * 0.5)} />
    </span>
  );
}

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
        className="-m-1 max-h-72 overflow-y-auto overscroll-contain p-1"
      >
        <div
          ref={groupRef}
          role="radiogroup"
          aria-label={label}
          className="grid grid-cols-3 gap-2 md:grid-cols-4 xl:grid-cols-5"
        >
          {tiles.map((cat) => {
            const id = cat?.id ?? "";
            const active = id === value;
            return (
              // biome-ignore lint/a11y/useSemanticElements: tile button acts as radio
              <button
                key={id || "__none__"}
                type="button"
                role="radio"
                aria-checked={active}
                data-cat-id={id}
                tabIndex={id === tabStop ? 0 : -1}
                onClick={() => onChange(id)}
                onKeyDown={(e) => move(e, id)}
                className={cn(
                  "relative flex min-h-[4.5rem] min-w-0 cursor-pointer flex-col items-center justify-start gap-1.5 rounded-md border px-1.5 py-2.5 text-center outline-none transition-[transform,background-color] active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "border-transparent bg-brand-soft ring-2 ring-brand"
                    : "bg-card hover:bg-muted/60",
                )}
              >
                {cat ? (
                  <CategoryBadge cat={cat} />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-full border border-dashed bg-muted text-muted-foreground"
                  >
                    <Ban className="size-[18px]" />
                  </span>
                )}
                <span className="line-clamp-2 w-full break-words text-sm leading-tight text-foreground">
                  {cat ? cat.name : noneLabel}
                </span>
                {active && (
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springs.snappy}
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground"
                  >
                    <Check className="size-3" aria-hidden />
                  </m.span>
                )}
              </button>
            );
          })}
        </div>
        q && visible.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nessuna categoria trovata.
        </p>
        )
      </div>
      onCreateNew && (
      <button
        type="button"
        onClick={onCreateNew}
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus className="size-4 text-brand" aria-hidden />
        Nuova categoria
      </button>
      )
    </div>
  );
}
