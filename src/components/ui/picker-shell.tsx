"use client";

import { ChevronDown } from "lucide-react";
import type * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export const pickerTriggerClass =
  "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-left text-sm text-foreground transition-colors outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-ring";

type PickerShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PickerShell({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  className,
  contentClassName,
}: PickerShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "w-(--radix-popover-trigger-width) min-w-64 max-w-[22rem] gap-0 rounded-md p-0 elevation-2",
            contentClassName,
          )}
        >
          <span className="sr-only">{title}</span>
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PickerChevron() {
  return (
    <ChevronDown
      aria-hidden
      className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/picker:rotate-180"
    />
  );
}

export type { PickerItem } from "./picker-list";
export { PickerList } from "./picker-list";
