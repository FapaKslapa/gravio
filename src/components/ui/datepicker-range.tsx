"use client";

import { it } from "date-fns/locale";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "./datepicker-header";
import { DatePresets } from "./datepicker-presets";
import {
  CELL_SIZE,
  type CommonProps,
  ISO,
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

function formatRange(from?: Date, to?: Date) {
  if (!from) return "";
  if (!to) return `${dayjs(from).format("D MMM YYYY")} –`;
  if (dayjs(from).isSame(to, "day")) return dayjs(from).format("D MMM YYYY");
  const sameYear = dayjs(from).isSame(to, "year");
  return `${dayjs(from).format(sameYear ? "D MMM" : "D MMM YYYY")} – ${dayjs(to).format("D MMM YYYY")}`;
}

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
    const [a, b] = dayjs(date).isBefore(draftFrom, "day")
      ? [date, draftFrom]
      : [draftFrom, date];
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
        <div className={cn("flex flex-col gap-2", CELL_SIZE)}>
          {presets && presets.length > 0 && (
            <DatePresets
              presets={presets}
              value={value}
              onSelect={(p) => {
                onChange({ from: p.from, to: p.to });
                handleOpenChange(false);
              }}
            />
          )}
          <CalendarHeader
            month={month}
            onMonthChange={setMonth}
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
            onMonthChange={setMonth}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            classNames={{ month_caption: "hidden" }}
            className={cn("mx-auto", CELL_SIZE)}
          />
          <p
            aria-live="polite"
            className="mx-auto min-h-5 text-center text-xs text-muted-foreground"
          >
            {draftFrom ? "Scegli la data finale" : "Scegli la data iniziale"}
          </p>
        </div>
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
