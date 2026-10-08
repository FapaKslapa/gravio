"use client";

import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export function PickerSurface({
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

export function ClearButton({
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
