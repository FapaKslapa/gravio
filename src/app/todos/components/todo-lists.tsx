"use client";

import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TodoList = {
  id: string;
  name: string;
  activeCount?: number;
};

type TodoListsProps = {
  lists: TodoList[];
  activeListId: string;
  onSelectActiveList: (id: string) => void;
};

function Count({ value, active }: { value: number; active: boolean }) {
  if (value <= 0) return null;
  return (
    <span
      className={cn(
        "tabular inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-5",
        active
          ? "bg-brand-foreground/20 text-brand-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function TodoLists({
  lists,
  activeListId,
  onSelectActiveList,
}: TodoListsProps) {
  return (
    <nav aria-label="Liste della spesa">
      <div
        role="tablist"
        aria-label="Liste"
        className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:hidden"
      >
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          return (
            <button
              key={list.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectActiveList(list.id)}
              className={cn(
                "relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
                isActive
                  ? "text-brand-foreground"
                  : "bg-muted/70 text-muted-foreground",
              )}
            >
              {isActive && (
                <m.span
                  layoutId="todo-list-pill"
                  transition={springs.snappy}
                  className="absolute inset-0 rounded-full bg-brand"
                />
              )}
              <span className="relative max-w-[10rem] truncate">
                {list.name}
              </span>
              <span className="relative">
                <Count value={list.activeCount ?? 0} active={isActive} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          return (
            <button
              key={list.id}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelectActiveList(list.id)}
              className={cn(
                "relative flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3.5 text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "text-brand-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {isActive && (
                <m.span
                  layoutId="todo-list-rail"
                  transition={springs.snappy}
                  className="absolute inset-0 rounded-lg bg-brand"
                />
              )}
              <span className="relative truncate">{list.name}</span>
              <span className="relative">
                <Count value={list.activeCount ?? 0} active={isActive} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
