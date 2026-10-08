"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { MONTH_NAMES, MONTH_SHORT } from "./months";

type AnalyticsHeaderProps = {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (month: number, year: number) => void;
};

export function AnalyticsHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
}: AnalyticsHeaderProps) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Statistiche
        </h1>
        <p className="text-sm text-muted-foreground">
          Come si muovono entrate, uscite e risparmio mese dopo mese.
        </p>
      </div>

      <div className="elevation-1 flex w-fit items-center rounded-full bg-card p-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full"
          onClick={onPrevMonth}
          aria-label="Mese precedente"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <button
          type="button"
          onClick={() => {
            setPickerYear(currentYear);
            setOpen(true);
          }}
          className="flex h-11 min-w-44 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Scegli il mese"
        >
          <CalendarDays className="size-4 text-brand" aria-hidden />
          <span className="tabular">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full"
          onClick={onNextMonth}
          aria-label="Mese successivo"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title="Scegli il mese"
        className="sm:max-w-sm"
      >
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full"
              onClick={() => setPickerYear((y) => y - 1)}
              aria-label="Anno precedente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <span className="font-display text-lg font-semibold tabular">
              {pickerYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full"
              onClick={() => setPickerYear((y) => y + 1)}
              aria-label="Anno successivo"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTH_SHORT.map((label, idx) => {
              const isCurrent =
                idx === currentMonth && pickerYear === currentYear;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={isCurrent}
                  onClick={() => {
                    onSelectMonth(idx, pickerYear);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-11 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
                    isCurrent
                      ? "bg-brand text-brand-foreground"
                      : "bg-muted text-foreground hover:bg-brand-soft",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </ResponsiveSheet>
    </header>
  );
}
