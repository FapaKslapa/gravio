"use client";

import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalize, MONTH_FMT } from "./datepicker-shared";

export function CalendarHeader({
  month,
  onMonthChange,
  min,
  max,
}: {
  month: Date;
  onMonthChange: (d: Date) => void;
  min?: Date;
  max?: Date;
}) {
  const now = dayjs();
  const m = dayjs(month);
  const firstYear = Math.min(
    min ? dayjs(min).year() : now.year() - 100,
    m.year(),
  );
  const lastYear = Math.max(
    max ? dayjs(max).year() : now.year() + 10,
    m.year(),
  );
  const years = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, i) => lastYear - i,
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    MONTH_FMT.format(new Date(2000, i, 1)),
  );

  const clamp = (d: dayjs.Dayjs) => {
    let out = d;
    if (min && out.isBefore(min, "month")) out = dayjs(min);
    if (max && out.isAfter(max, "month")) out = dayjs(max);
    return out.startOf("month").toDate();
  };

  const canPrev = !min || m.subtract(1, "month").endOf("month").isAfter(min);
  const canNext = !max || m.add(1, "month").startOf("month").isBefore(max);

  return (
    <div className="mx-auto flex w-[calc(var(--cell-size)*7)] items-center justify-between gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Mese precedente"
        disabled={!canPrev}
        onClick={() => onMonthChange(m.subtract(1, "month").toDate())}
        className="size-(--cell-size) shrink-0"
      >
        <ChevronLeft aria-hidden className="size-4" />
      </Button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <Select
          value={String(m.month())}
          onValueChange={(v) =>
            onMonthChange(clamp(m.month(Number(v)).startOf("month")))
          }
        >
          <SelectTrigger
            aria-label="Mese"
            className="h-9 w-auto min-w-0 gap-1 border-0 bg-transparent px-2 font-medium shadow-none hover:bg-muted"
          >
            <SelectValue>{capitalize(months[m.month()])}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {months.map((label, i) => {
              const start = m.month(i).startOf("month");
              const outside =
                (min && start.endOf("month").isBefore(min, "day")) ||
                (max && start.isAfter(max, "day"));
              return (
                <SelectItem key={label} value={String(i)} disabled={!!outside}>
                  {capitalize(label)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={String(m.year())}
          onValueChange={(v) =>
            onMonthChange(clamp(m.year(Number(v)).startOf("month")))
          }
        >
          <SelectTrigger
            aria-label="Anno"
            className="tabular h-9 w-auto min-w-0 gap-1 border-0 bg-transparent px-2 font-medium shadow-none hover:bg-muted"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)} className="tabular">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Mese successivo"
        disabled={!canNext}
        onClick={() => onMonthChange(m.add(1, "month").toDate())}
        className="size-(--cell-size) shrink-0"
      >
        <ChevronRight aria-hidden className="size-4" />
      </Button>
    </div>
  );
}
