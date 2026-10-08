"use client";

import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RangeBody } from "./datepicker-range-body";
import {
  type CommonProps,
  formatRange,
  ISO,
  orderDates,
  parse,
  triggerProps,
} from "./datepicker-shared";
import { ClearButton, PickerSurface } from "./datepicker-surface";

export type DateRangeValue = { from: string; to: string };

export type DateRangePreset = DateRangeValue & { label: string };

type RangeProps = CommonProps & {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  presets?: DateRangePreset[];
  clearable?: boolean;
};

export function CustomDateRangePicker(props: RangeProps) {
  const { value, onChange, className, placeholder, presets } = props;
  const clearable = props.clearable ?? true;
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState<Date | undefined>();
  const from = parse(value.from);
  const to = parse(value.to);
  const minDate = parse(props.min);
  const maxDate = parse(props.max);
  const [month, setMonth] = useState<Date>(from ?? new Date());

  const hasValue = !!(value.from || value.to);
  const label = formatRange(from, to) || placeholder || "Seleziona periodo";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setDraftFrom(undefined);
    if (next) setMonth(from ?? new Date());
  };

  const onDayClick = (date: Date) => {
    if (!draftFrom) {
      setDraftFrom(date);
      return;
    }
    const [a, b] = orderDates(date, draftFrom);
    onChange({ from: dayjs(a).format(ISO), to: dayjs(b).format(ISO) });
    handleOpenChange(false);
  };

  const shownFrom = draftFrom ?? from;
  const shownTo = draftFrom ? undefined : to;

  const trigger = (
    <button {...triggerProps(props, open, hasValue, "Apri calendario periodo")}>
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
        onOpenChange={handleOpenChange}
        title={props.title ?? "Seleziona periodo"}
        trigger={trigger}
        popoverClassName={props.popoverClassName}
      >
        <RangeBody
          presets={presets}
          value={value}
          onPreset={(p) => {
            onChange({ from: p.from, to: p.to });
            handleOpenChange(false);
          }}
          month={month}
          onMonthChange={setMonth}
          minDate={minDate}
          maxDate={maxDate}
          shownFrom={shownFrom}
          shownTo={shownTo}
          drafting={!!draftFrom}
          onDayClick={onDayClick}
        />
      </PickerSurface>
      {clearable && hasValue && !props.disabled && (
        <ClearButton
          onClick={() => onChange({ from: "", to: "" })}
          label="Resetta periodo"
        />
      )}
    </div>
  );
}
