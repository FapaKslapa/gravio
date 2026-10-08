"use client";

import type React from "react";
import { useReducer, useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { CategoriesModalHeader } from "./categories-modal-header";
import { CategoryFormPanel } from "./category-form-panel";
import { CategoryListPanel } from "./category-list-panel";
import { type Category, formReducer, initialFormState } from "./category-types";

type CategoriesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  onUpdateCategory: (cat: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
};

export function CategoriesModal({
  isOpen,
  onClose,
  categories,
  onDeleteCategory,
  onCreateCategory,
  onUpdateCategory,
}: CategoriesModalProps) {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const { editingId, newCatName, newCatIcon, newCatColor, mobilePanel } =
    formState;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateCategory({
          id: editingId,
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
      } else {
        await onCreateCategory({
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
      }
      dispatch({ type: "RESET_FORM" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Gestione categorie"
      description="Crea, modifica ed elimina le categorie delle tue transazioni"
      className="md:max-w-3xl"
    >
      <CategoriesModalHeader
        categoriesCount={categories.length}
        editingId={editingId}
        mobilePanel={mobilePanel}
        dispatch={dispatch}
      />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div
          className={cn(
            "min-w-0 flex-col gap-3",
            mobilePanel === "list" ? "flex" : "hidden md:flex",
          )}
        >
          <CategoryListPanel
            categories={categories}
            dispatch={dispatch}
            onDeleteCategory={onDeleteCategory}
          />
        </div>

        <div
          className={cn(
            "min-w-0 flex-col md:rounded-lg md:border md:bg-muted/30 md:p-4",
            mobilePanel === "form" ? "flex" : "hidden md:flex",
          )}
        >
          <CategoryFormPanel
            editingId={editingId}
            newCatName={newCatName}
            newCatIcon={newCatIcon}
            newCatColor={newCatColor}
            isSubmitting={isSubmitting}
            dispatch={dispatch}
            onSubmit={handleSubmit}
            onCancelEdit={() => dispatch({ type: "CANCEL_EDIT" })}
          />
        </div>
      </div>
    </ResponsiveSheet>
  );
}
