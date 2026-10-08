"use client";

import { Check } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APPLE_COLORS, CURATED_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FormAction } from "./category-types";

export function CategoryColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <fieldset
      aria-label="Colore categoria"
      className="m-0 grid min-w-0 border-0 grid-cols-7 gap-2"
    >
      {APPLE_COLORS.map((col) => {
        const selected = value === col;
        return (
          <button
            key={col}
            type="button"
            aria-pressed={selected}
            aria-label={`Colore ${col}`}
            onClick={() => onChange(col)}
            className="flex size-11 items-center justify-center rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-white transition-shadow",
                selected &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: col }}
            >
              {selected && <Check className="size-4" aria-hidden />}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

export function CategoryIconPicker({
  value,
  color,
  onChange,
}: {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}) {
  return (
    <fieldset
      aria-label="Icona categoria"
      className="m-0 grid min-w-0 border-0 grid-cols-6 gap-2"
    >
      {CURATED_ICONS.map((ico) => {
        const selected = value === ico;
        return (
          <button
            key={ico}
            type="button"
            aria-pressed={selected}
            aria-label={`Icona ${ico}`}
            onClick={() => onChange(ico)}
            className={cn(
              "flex size-11 items-center justify-center rounded-md border outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50",
              selected ? "border-transparent" : "border-border bg-card",
            )}
            style={
              selected
                ? {
                    backgroundColor: `${color}26`,
                    color,
                    boxShadow: `inset 0 0 0 2px ${color}`,
                  }
                : undefined
            }
          >
            <CategoryIcon name={ico} size={18} />
          </button>
        );
      })}
    </fieldset>
  );
}

export function CategoryPreview({
  name,
  icon,
  color,
}: {
  name: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}26`, color }}
      >
        <CategoryIcon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {name.trim() || "Nome categoria"}
        </p>
        <p className="text-xs text-muted-foreground">Anteprima</p>
      </div>
      <span
        className="ml-auto h-6 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
    </div>
  );
}

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
