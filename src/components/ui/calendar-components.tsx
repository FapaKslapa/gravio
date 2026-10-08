import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { CustomComponents, Locale } from "react-day-picker";
import { cn } from "@/lib/utils";
import { CalendarDayButton } from "./calendar-day-button";

export function buildCalendarComponents(
  locale?: Partial<Locale>,
): Partial<CustomComponents> {
  return {
    Root: ({ className, rootRef, ...props }) => {
      return (
        <div
          data-slot="calendar"
          ref={rootRef}
          className={cn(className)}
          {...props}
        />
      );
    },
    Chevron: ({ className, orientation, ...props }) => {
      if (orientation === "left") {
        return (
          <ChevronLeftIcon className={cn("size-4", className)} {...props} />
        );
      }

      if (orientation === "right") {
        return (
          <ChevronRightIcon className={cn("size-4", className)} {...props} />
        );
      }

      return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
    },
    DayButton: ({ ...props }) => (
      <CalendarDayButton locale={locale} {...props} />
    ),
    WeekNumber: ({ children, ...props }) => {
      return (
        <td {...props}>
          <div className="flex size-(--cell-size) items-center justify-center text-center">
            {children}
          </div>
        </td>
      );
    },
  };
}
