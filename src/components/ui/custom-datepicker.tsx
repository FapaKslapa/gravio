"use client";

import { it } from "date-fns/locale";
import dayjs from "dayjs";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { pickerTriggerClass } from "@/components/ui/picker-shell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import "dayjs/locale/it";

dayjs.locale("it");

type CustomDatePickerProps = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  placeholder?: string;
};

export function CustomDatePicker({
  value,
  onChange,
  className,
  triggerClassName,
  popoverClassName,
  placeholder,
}: CustomDatePickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selected = value ? dayjs(value).toDate() : undefined;
  const [month, setMonth] = useState<Date>(selected ?? new Date());

  const prevValueRef = useRef<string | null>(null);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    if (value) setMonth(dayjs(value).toDate());
  }

  const label = value
    ? dayjs(value).format("D MMMM YYYY")
    : placeholder || "Seleziona data...";

  const calendar = (
    <Calendar
      mode="single"
      locale={it}
      weekStartsOn={1}
      selected={selected}
      month={month}
      onMonthChange={setMonth}
      onSelect={(date) => {
        if (!date) return;
        onChange(dayjs(date).format("YYYY-MM-DD"));
        setOpen(false);
      }}
      className={cn(
        "mx-auto [--cell-size:--spacing(11)] md:[--cell-size:--spacing(9)]",
      )}
    />
  );

  const trigger = (
    <button
      type="button"
      aria-label="Apri calendario"
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        pickerTriggerClass,
        "justify-start pr-10",
        value ? "" : "text-muted-foreground",
        triggerClassName,
      )}
    >
      <CalendarIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span className="truncate tabular">{label}</span>
    </button>
  );

  return (
    <div className={cn("relative w-full", className)}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Seleziona data</DrawerTitle>
              <DrawerDescription className="sr-only">
                Scegli un giorno dal calendario
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {calendar}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className={cn(
              "w-auto rounded-md p-2 elevation-2",
              popoverClassName,
            )}
          >
            {calendar}
          </PopoverContent>
        </Popover>
      )}

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Resetta data"
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
