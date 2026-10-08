"use client";

import { X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { MONTH_NAMES } from "./months";

type SpendingCalendarCardProps = {
  currentMonth: number;
  currentYear: number;
  dailyExpensesMap: Record<number, number>;
  maxDailyExpense: number;
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  displayCurrency: string;
};

const WEEKDAYS = ["L", "M", "M", "G", "V", "S", "D"];

const LEVELS = [
  "color-mix(in oklab, var(--brand) 14%, transparent)",
  "color-mix(in oklab, var(--brand) 30%, transparent)",
  "color-mix(in oklab, var(--brand) 55%, transparent)",
  "var(--brand)",
];

function levelFor(amount: number, max: number): number {
  if (amount <= 0) return -1;
  const ratio = amount / max;
  if (ratio > 0.75) return 3;
  if (ratio > 0.5) return 2;
  if (ratio > 0.25) return 1;
  return 0;
}

export function SpendingCalendarCard({
  currentMonth,
  currentYear,
  dailyExpensesMap,
  maxDailyExpense,
  selectedDay,
  setSelectedDay,
  displayCurrency,
}: SpendingCalendarCardProps) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex =
    (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const spacers = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <section className="elevation-1 flex flex-col gap-4 rounded-lg bg-card p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-semibold">
          Calendario di spesa
        </h2>
        <p className="text-sm text-muted-foreground">
          Più il giorno è intenso, più hai speso. Tocca un giorno per filtrare i
          movimenti.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static weekday labels
            key={i}
            className="py-1 text-xs font-medium text-muted-foreground"
            aria-hidden
          >
            {d}
          </span>
        ))}

        {spacers.map((s) => (
          <div key={`spacer-${s}`} aria-hidden />
        ))}

        {days.map((day) => {
          const amount = dailyExpensesMap[day] || 0;
          const level = levelFor(amount, maxDailyExpense);
          const isSelected = selectedDay === day;
          return (
            <button
              type="button"
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              aria-pressed={isSelected}
              aria-label={`${day} ${MONTH_NAMES[currentMonth]}, ${
                amount > 0
                  ? formatCurrency(amount, displayCurrency)
                  : "nessuna spesa"
              }`}
              title={
                amount > 0 ? formatCurrency(amount, displayCurrency) : undefined
              }
              style={
                level >= 0 ? { backgroundColor: LEVELS[level] } : undefined
              }
              className={cn(
                "flex aspect-square min-h-11 items-center justify-center rounded-md text-xs font-semibold tabular outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.95]",
                level < 0 && "bg-muted text-muted-foreground",
                level >= 0 && level < 3 && "text-foreground",
                level === 3 && "text-brand-foreground",
                isSelected &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-card",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
        aria-hidden
      >
        <span>Meno</span>
        <div className="flex items-center gap-1.5">
          <span className="size-4 rounded-sm bg-muted" />
          {LEVELS.map((c) => (
            <span
              key={c}
              className="size-4 rounded-sm"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span>Più</span>
      </div>

      {selectedDay && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-brand-soft p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {selectedDay} {MONTH_NAMES[currentMonth]}
            </span>
            <span className="font-display text-lg font-bold tabular">
              {formatCurrency(
                dailyExpensesMap[selectedDay] || 0,
                displayCurrency,
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="flex h-11 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            <X className="size-4" aria-hidden />
            Tutto il mese
          </button>
        </div>
      )}
    </section>
  );
}
