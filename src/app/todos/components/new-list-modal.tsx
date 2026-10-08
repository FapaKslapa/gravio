"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

type NewListModalProps = {
  isOpen: boolean;
  name: string;
  onChangeName: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NewListModal({
  isOpen,
  name,
  onChangeName,
  onClose,
  onSubmit,
}: NewListModalProps) {
  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Nuova lista"
      description="Dai un nome alla lista, per esempio il negozio o l'occasione."
    >
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-list-name">Nome lista</FieldLabel>
            <Input
              id="new-list-name"
              placeholder="es. Regali di Natale, Spesa settimanale"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              required
              autoFocus
              className="h-12 text-base md:text-sm"
            />
          </Field>
          <Button
            type="submit"
            disabled={!name.trim()}
            className="h-12 w-full rounded-full text-sm font-semibold"
          >
            Crea lista
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveSheet>
  );
}
