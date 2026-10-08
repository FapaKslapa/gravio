"use client";

import dayjs from "dayjs";
import type { ReactNode } from "react";
import { SwipeArea } from "@/components/ui/swipe-area";

/** Swipe left/right on the calendar to move to the next/previous month. */
export function MonthSwipe({
  month,
  onMonthChange,
  min,
  max,
  children,
}: {
  month: Date;
  onMonthChange: (d: Date) => void;
  min?: Date;
  max?: Date;
  children: ReactNode;
}) {
  const m = dayjs(month);
  const canPrev = !min || m.subtract(1, "month").endOf("month").isAfter(min);
  const canNext = !max || m.add(1, "month").startOf("month").isBefore(max);
  return (
    <SwipeArea
      className="flex flex-col gap-1"
      onPrev={
        canPrev
          ? () => onMonthChange(m.subtract(1, "month").toDate())
          : undefined
      }
      onNext={
        canNext ? () => onMonthChange(m.add(1, "month").toDate()) : undefined
      }
    >
      {children}
    </SwipeArea>
  );
}
