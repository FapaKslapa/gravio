"use client";

import dayjs from "dayjs";
import { pickerTriggerClass } from "@/components/ui/picker-shell";
import { cn } from "@/lib/utils";

import "dayjs/locale/it";

dayjs.locale("it");

export const MONTH_FMT = new Intl.DateTimeFormat("it", { month: "long" });

export const ISO = "YYYY-MM-DD";

export const CELL_SIZE =
  "[--cell-size:--spacing(11)] md:[--cell-size:--spacing(9)]";

export function parse(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = dayjs(value);
  return d.isValid() ? d.toDate() : undefined;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type CommonProps = {
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

export function triggerProps(
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

export function disabledDays(min?: Date, max?: Date) {
  return [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])];
}

export function isDayAllowed(day: Date, min?: Date, max?: Date) {
  return (
    (!min || !dayjs(day).isBefore(min, "day")) &&
    (!max || !dayjs(day).isAfter(max, "day"))
  );
}

export function orderDates(a: Date, b: Date): [Date, Date] {
  return dayjs(a).isBefore(b, "day") ? [a, b] : [b, a];
}

export function formatRange(from?: Date, to?: Date) {
  if (!from) return "";
  if (!to) return `${dayjs(from).format("D MMM YYYY")} –`;
  if (dayjs(from).isSame(to, "day")) return dayjs(from).format("D MMM YYYY");
  const sameYear = dayjs(from).isSame(to, "year");
  return `${dayjs(from).format(sameYear ? "D MMM" : "D MMM YYYY")} – ${dayjs(to).format("D MMM YYYY")}`;
}
