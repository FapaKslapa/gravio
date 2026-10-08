"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export const pickerTriggerClass =
  "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-left text-sm text-foreground transition-colors outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-ring";

type PickerShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PickerShell({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  className,
  contentClassName,
}: PickerShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "w-(--radix-popover-trigger-width) min-w-64 max-w-[22rem] gap-0 rounded-md p-0 elevation-2",
            contentClassName,
          )}
        >
          <span className="sr-only">{title}</span>
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PickerChevron() {
  return (
    <ChevronDown
      aria-hidden
      className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/picker:rotate-180"
    />
  );
}

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
  const isMobile = useIsMobile();
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
        <div className="flex items-center gap-2 border-b px-3">
          <Search
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            // biome-ignore lint/a11y/noAutofocus: la ricerca deve avere il focus solo su desktop
            autoFocus={!isMobile}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="picker-listbox"
            aria-label={searchLabel}
            placeholder={`${searchLabel}…`}
            value={query}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
          />
          {query && (
            <button
              type="button"
              aria-label="Cancella ricerca"
              onClick={() => setQuery("")}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
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
