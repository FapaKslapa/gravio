"use client";

import { Check } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PickerSearch } from "./picker-search";

export type PickerItem = {
  value: string;
  label: string;
  description?: string;
  leading?: React.ReactNode;
};

type PickerListProps = {
  items: PickerItem[];
  value: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
  searchLabel?: string;
  emptyLabel?: string;
  footerAction?: { label: string; onPress: () => void };
};

export function PickerList({
  items,
  value,
  onSelect,
  searchable = false,
  searchLabel = "Cerca",
  emptyLabel = "Nessun risultato.",
  footerAction,
}: PickerListProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          it.value.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q),
      )
    : items;

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cur = filtered[activeIndex];
      if (cur) onSelect(cur.value);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {searchable && (
        <PickerSearch
          query={query}
          label={searchLabel}
          onKeyDown={onKeyDown}
          onQueryChange={(value) => {
            setQuery(value);
            if (value) setActiveIndex(0);
          }}
        />
      )}

      <div
        ref={listRef}
        id="picker-listbox"
        role="listbox"
        className="custom-scrollbar flex max-h-[min(20rem,50dvh)] flex-col gap-0.5 overflow-y-auto overscroll-contain p-1.5"
      >
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
        {filtered.map((it, idx) => {
          const selected = it.value === value;
          const active = searchable && idx === activeIndex;
          return (
            <button
              key={it.value === "" ? "__empty__" : it.value}
              type="button"
              role="option"
              aria-selected={selected}
              data-index={idx}
              onClick={() => onSelect(it.value)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-sm px-2.5 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                active && "bg-muted",
                selected && "font-semibold",
              )}
            >
              {it.leading}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate", selected && "text-brand")}>
                  {it.label}
                </span>
                {it.description && (
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {it.description}
                  </span>
                )}
              </span>
              {selected && (
                <Check aria-hidden className="size-4 shrink-0 text-brand" />
              )}
            </button>
          );
        })}
      </div>

      {footerAction && (
        <button
          type="button"
          onClick={footerAction.onPress}
          className="min-h-11 w-full cursor-pointer border-t px-3 text-center text-sm font-semibold text-brand outline-none transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft"
        >
          {footerAction.label}
        </button>
      )}
    </div>
  );
}
