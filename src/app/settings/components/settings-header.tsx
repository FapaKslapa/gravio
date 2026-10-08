"use client";

import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type SettingsHeaderProps = {
  title: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
};

export function SettingsHeader({
  title,
  onBack,
  onSave,
  isSaving,
}: SettingsHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          aria-label="Torna indietro"
          className="size-11 shrink-0 rounded-full"
        >
          <ChevronLeft />
        </Button>
        <h1 className="truncate font-display text-2xl font-bold tracking-tight">
          {title}
        </h1>
      </div>
      <Button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="h-11 shrink-0 rounded-full bg-brand px-5 font-semibold text-brand-foreground hover:bg-brand/90"
      >
        {isSaving ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Save data-icon="inline-start" />
        )}
        Salva
      </Button>
    </header>
  );
}
