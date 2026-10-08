"use client";

import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CategoryColorPicker, CategoryIconPicker } from "./category-form-panel";

type Category = { id: string; name: string; icon: string; color: string };

export function CategorySection({
  categoryId,
  suggestedCategoryId,
  categories,
  onCategoryChange,
  isInlineCatOpen,
  onToggleInlineCat,
  newCatName,
  onNewCatNameChange,
  newCatColor,
  onNewCatColorChange,
  newCatIcon,
  onNewCatIconChange,
  onCreateCategory,
}: {
  categoryId: string;
  suggestedCategoryId: string | null;
  categories: Category[];
  onCategoryChange: (id: string) => void;
  isInlineCatOpen: boolean;
  onToggleInlineCat: () => void;
  newCatName: string;
  onNewCatNameChange: (v: string) => void;
  newCatColor: string;
  onNewCatColorChange: (v: string) => void;
  newCatIcon: string;
  onNewCatIconChange: (v: string) => void;
  onCreateCategory: () => void;
}) {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel>Categoria</FieldLabel>
        {isInlineCatOpen && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-3 text-brand"
            onClick={onToggleInlineCat}
          >
            Indietro
          </Button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {isInlineCatOpen ? (
          <m.div
            key="creator"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-3"
          >
            <Field data-invalid={undefined}>
              <FieldLabel htmlFor="tx-new-cat">Nome categoria</FieldLabel>
              <Input
                id="tx-new-cat"
                className="h-11"
                placeholder="Es. Palestra"
                value={newCatName}
                onChange={(e) => onNewCatNameChange(e.target.value)}
              />
            </Field>
            <CategoryColorPicker
              value={newCatColor}
              onChange={onNewCatColorChange}
            />
            <CategoryIconPicker
              value={newCatIcon}
              color={newCatColor}
              onChange={onNewCatIconChange}
            />
            <Button
              type="button"
              disabled={!newCatName.trim()}
              className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={onCreateCategory}
            >
              Crea categoria
            </Button>
            <FieldDescription>
              La nuova categoria viene selezionata automaticamente.
            </FieldDescription>
          </m.div>
        ) : (
          <m.div
            key="picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={onCategoryChange}
              suggestedId={suggestedCategoryId}
              onCreateNew={onToggleInlineCat}
            />
          </m.div>
        )}
      </AnimatePresence>
    </Field>
  );
}
