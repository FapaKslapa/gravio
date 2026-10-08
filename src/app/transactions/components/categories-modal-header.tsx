"use client";

import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FormAction } from "./category-types";

type CategoriesModalHeaderProps = {
  categoriesCount: number;
  editingId: string | null;
  mobilePanel: "list" | "form";
  dispatch: React.Dispatch<FormAction>;
};

export function CategoriesModalHeader({
  categoriesCount,
  editingId,
  mobilePanel,
  dispatch,
}: CategoriesModalHeaderProps) {
  const tabs = [
    { id: "list" as const, label: `Categorie (${categoriesCount})` },
    { id: "form" as const, label: editingId ? "Modifica" : "Nuova" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Sezione categorie"
      className="mb-4 grid h-11 grid-cols-2 rounded-full bg-muted p-1 md:hidden"
    >
      {tabs.map((tab) => {
        const active = mobilePanel === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => dispatch({ type: "SET_MOBILE_PANEL", val: tab.id })}
            className={cn(
              "relative rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId="categories-mobile-tab"
                transition={springs.snappy}
                className="absolute inset-0 rounded-full bg-card elevation-1"
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
