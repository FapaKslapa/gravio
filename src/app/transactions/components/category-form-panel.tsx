"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  CategoryColorPicker,
  CategoryIconPicker,
  CategoryPreview,
} from "./category-pickers";
import type { FormAction } from "./category-types";

export { CategoryColorPicker, CategoryIconPicker, CategoryPreview };

type CategoryFormPanelProps = {
  editingId: string | null;
  newCatName: string;
  newCatIcon: string;
  newCatColor: string;
  isSubmitting: boolean;
  dispatch: React.Dispatch<FormAction>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelEdit: () => void;
};

export function CategoryFormPanel({
  editingId,
  newCatName,
  newCatIcon,
  newCatColor,
  isSubmitting,
  dispatch,
  onSubmit,
  onCancelEdit,
}: CategoryFormPanelProps) {
  const [touched, setTouched] = useState(false);
  const nameInvalid = touched && !newCatName.trim();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        setTouched(true);
        if (!newCatName.trim()) {
          e.preventDefault();
          return;
        }
        setTouched(false);
        return onSubmit(e);
      }}
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <h4 className="text-base font-semibold">
        {editingId ? "Modifica categoria" : "Nuova categoria"}
      </h4>

      <CategoryPreview
        name={newCatName}
        icon={newCatIcon}
        color={newCatColor}
      />

      <FieldGroup>
        <Field data-invalid={nameInvalid || undefined}>
          <FieldLabel htmlFor="category-name">Nome</FieldLabel>
          <Input
            id="category-name"
            className="h-11"
            placeholder="Es. Spesa, Svago, Bollette"
            value={newCatName}
            aria-invalid={nameInvalid || undefined}
            onChange={(e) =>
              dispatch({ type: "SET_NAME", val: e.target.value })
            }
          />
          {nameInvalid && <FieldError>Inserisci un nome.</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Colore</FieldLabel>
          <CategoryColorPicker
            value={newCatColor}
            onChange={(val) => dispatch({ type: "SET_COLOR", val })}
          />
        </Field>

        <Field>
          <FieldLabel>Icona</FieldLabel>
          <CategoryIconPicker
            value={newCatIcon}
            color={newCatColor}
            onChange={(val) => dispatch({ type: "SET_ICON", val })}
          />
        </Field>
      </FieldGroup>

      <div className="sticky bottom-0 mt-auto flex gap-2 bg-popover pb-1 pt-3">
        {editingId && (
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onCancelEdit}
          >
            Annulla
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {isSubmitting
            ? "Salvataggio..."
            : editingId
              ? "Salva modifiche"
              : "Aggiungi categoria"}
        </Button>
      </div>
    </form>
  );
}
