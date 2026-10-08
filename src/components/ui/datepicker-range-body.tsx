import { it } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "./datepicker-header";
import { DatePresets } from "./datepicker-presets";
import type { DateRangePreset, DateRangeValue } from "./datepicker-range";
import { CELL_SIZE, disabledDays } from "./datepicker-shared";
import { MonthSwipe } from "./datepicker-swipe";

type RangeBodyProps = {
  presets?: DateRangePreset[];
  value: DateRangeValue;
  onPreset: (preset: DateRangePreset) => void;
  month: Date;
  onMonthChange: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  shownFrom?: Date;
  shownTo?: Date;
  drafting: boolean;
  onDayClick: (date: Date) => void;
};

export function RangeBody({
  presets,
  value,
  onPreset,
  month,
  onMonthChange,
  minDate,
  maxDate,
  shownFrom,
  shownTo,
  drafting,
  onDayClick,
}: RangeBodyProps) {
  return (
    <div className={cn("flex flex-col gap-2", CELL_SIZE)}>
      {presets && presets.length > 0 && (
        <DatePresets presets={presets} value={value} onSelect={onPreset} />
      )}
      <MonthSwipe
        month={month}
        onMonthChange={onMonthChange}
        min={minDate}
        max={maxDate}
      >
        <CalendarHeader
          month={month}
          onMonthChange={onMonthChange}
          min={minDate}
          max={maxDate}
        />
        <Calendar
          mode="range"
          locale={it}
          weekStartsOn={1}
          hideNavigation
          selected={shownFrom ? { from: shownFrom, to: shownTo } : undefined}
          onDayClick={onDayClick}
          month={month}
          onMonthChange={onMonthChange}
          startMonth={minDate}
          endMonth={maxDate}
          disabled={disabledDays(minDate, maxDate)}
          classNames={{ month_caption: "hidden" }}
          className={cn("mx-auto", CELL_SIZE)}
        />
      </MonthSwipe>
      <p
        aria-live="polite"
        className="mx-auto min-h-5 text-center text-xs text-muted-foreground"
      >
        {drafting ? "Scegli la data finale" : "Scegli la data iniziale"}
      </p>
    </div>
  );
}
