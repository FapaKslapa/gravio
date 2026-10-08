"use client";

import { it } from "date-fns/locale";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { pickerTriggerClass } from "@/components/ui/picker-shell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import "dayjs/locale/it";

dayjs.locale("it");

const MONTH_FMT = new Intl.DateTimeFormat("it", { month: "long" });
const ISO = "YYYY-MM-DD";
const CELL_SIZE = "[--cell-size:--spacing(11)] md:[--cell-size:--spacing(9)]";

function parse(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = dayjs(value);
  return d.isValid() ? d.toDate() : undefined;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type CommonProps = {
  id?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  invalid?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  title?: string;
};

function CalendarHeader({
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

function PickerSurface({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  popoverClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: ReactNode;
  children: ReactNode;
  popoverClassName?: string;
}) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  const focusDay = (e: Event) => {
    e.preventDefault();
    panelRef.current
      ?.querySelector<HTMLElement>('button[data-day]:not([tabindex="-1"])')
      ?.focus({ preventScroll: true });
  };

  if (isMobile) {
    return (
      <DrawerPrimitive.NestedRoot open={open} onOpenChange={onOpenChange}>
        <DrawerPrimitive.Trigger asChild>{trigger}</DrawerPrimitive.Trigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          </DrawerHeader>
          <div
            ref={panelRef}
            data-vaul-no-drag
            className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            {children}
          </div>
        </DrawerContent>
      </DrawerPrimitive.NestedRoot>
    );
  }

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={focusDay}
        aria-label={title}
        className={cn("w-auto rounded-md p-2 elevation-2", popoverClassName)}
      >
        <div ref={panelRef}>{children}</div>
      </PopoverContent>
    </Popover>
  );
}

function ClearButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <X aria-hidden className="size-4" />
    </button>
  );
}

function triggerProps(
  p: CommonProps,
  open: boolean,
  hasValue: boolean,
  defaultLabel: string,
) {
  return {
    id: p.id,
    type: "button" as const,
    disabled: p.disabled,
    "aria-label": p["aria-label"] ?? defaultLabel,
    "aria-describedby": p["aria-describedby"],
    "aria-invalid": p.invalid || undefined,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    className: cn(
      pickerTriggerClass,
      "justify-start pr-10",
      !hasValue && "text-muted-foreground",
      p.invalid && "border-destructive focus-visible:ring-destructive/30",
      p.triggerClassName,
    ),
  };
}

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

  const prevValueRef = useRef<string | null>(null);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
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
            <div className="mx-auto flex w-[calc(var(--cell-size)*7)] flex-wrap gap-1.5">
              {presets.map((p) => {
                const active = p.from === value.from && p.to === value.to;
                return (
                  <button
                    key={p.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onChange({ from: p.from, to: p.to });
                      handleOpenChange(false);
                    }}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "border-transparent bg-brand text-brand-foreground"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
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
