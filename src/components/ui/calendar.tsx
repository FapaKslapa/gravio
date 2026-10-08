"use client";

import type * as React from "react";
import { DayPicker } from "react-day-picker";

import type { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildCalendarClassNames } from "./calendar-class-names";
import { buildCalendarComponents } from "./calendar-components";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        ...buildCalendarClassNames({
          captionLayout,
          buttonVariant,
          showWeekNumber: props.showWeekNumber,
        }),
        ...classNames,
      }}
      components={{
        ...buildCalendarComponents(locale),
        ...components,
      }}
      {...props}
    />
  );
}

export { CalendarDayButton } from "./calendar-day-button";
export { Calendar };
