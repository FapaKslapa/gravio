"use client";

import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Category, FormAction } from "./category-types";

type CategoryListPanelProps = {
  categories: Category[];
  dispatch: React.Dispatch<FormAction>;
  onDeleteCategory: (id: string) => void;
};

export function CategoryListPanel({
  categories,
  dispatch,
  onDeleteCategory,
}: CategoryListPanelProps) {
  if (categories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nessuna categoria</EmptyTitle>
          <EmptyDescription>
            Creane una per organizzare le spese.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <h4 className="text-base font-semibold">
        Categorie
        <span className="tabular ml-2 text-sm font-normal text-muted-foreground">
          {categories.length}
        </span>
      </h4>
      <ul className="flex flex-col gap-1.5">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex min-h-14 items-center gap-3 rounded-lg border bg-card py-2 pl-3 pr-1.5"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
            >
              <CategoryIcon name={cat.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {cat.name}
            </span>
            {cat.userId && (
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`Modifica ${cat.name}`}
                  className="size-11"
                  onClick={() => dispatch({ type: "START_EDIT", cat })}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`Elimina ${cat.name}`}
                  className="size-11 text-destructive hover:text-destructive"
                  onClick={() => onDeleteCategory(cat.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
