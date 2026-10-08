"use client";

import { it } from "date-fns/locale";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "./datepicker-header";
import {
  CELL_SIZE,
  type CommonProps,
  ISO,
  parse,
  triggerProps,
} from "./datepicker-shared";
import { ClearButton, PickerSurface } from "./datepicker-surface";

type SingleProps = CommonProps & {
  value: string;
  onChange: (val: string) => void;
  clearable?: boolean;
};

export function CustomDatePicker(props: SingleProps) {
  const { value, onChange, className, placeholder, clearable = true } = props;
  const [open, setOpen] = useState(false);
  const selected = parse(value);
  const minDate = parse(props.min);
  const maxDate = parse(props.max);
  const [month, setMonth] = useState<Date>(selected ?? new Date());

  const [prevValue, setPrevValue] = useState<string | null>(null);
  if (prevValue !== value) {
    setPrevValue(value);
    if (selected) setMonth(selected);
  }

  const label = selected
    ? dayjs(selected).format("D MMMM YYYY")
    : placeholder || "Seleziona data";
  const today = new Date();
  const todayAllowed =
    (!minDate || !dayjs(today).isBefore(minDate, "day")) &&
    (!maxDate || !dayjs(today).isAfter(maxDate, "day"));

  const pick = (date: Date) => {
    onChange(dayjs(date).format(ISO));
    setOpen(false);
  };

  const trigger = (
    <button {...triggerProps(props, open, !!selected, "Apri calendario")}>
      <CalendarIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span className="truncate tabular">{label}</span>
    </button>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <PickerSurface
        open={open}
        onOpenChange={setOpen}
        title={props.title ?? "Seleziona data"}
        trigger={trigger}
        popoverClassName={props.popoverClassName}
      >
        <div className={cn("flex flex-col gap-1", CELL_SIZE)}>
          <CalendarHeader
            month={month}
            onMonthChange={setMonth}
            min={minDate}
            max={maxDate}
          />
          <Calendar
            mode="single"
            locale={it}
            weekStartsOn={1}
            hideNavigation
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            onSelect={(date) => {
              if (date) pick(date);
            }}
            classNames={{ month_caption: "hidden" }}
            className={cn("mx-auto", CELL_SIZE)}
          />
          {todayAllowed && (
            <Button
              type="button"
              variant="ghost"
              className="mx-auto h-11 rounded-full px-4 text-brand md:h-9"
              onClick={() => pick(today)}
            >
              Oggi
            </Button>
          )}
        </div>
      </PickerSurface>
      {clearable && value && !props.disabled && (
        <ClearButton onClick={() => onChange("")} label="Resetta data" />
      )}
    </div>
  );
}

export type { DateRangePreset, DateRangeValue } from "./datepicker-range";
export { CustomDateRangePicker } from "./datepicker-range";
