"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type ResponsiveSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ResponsiveSheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : (
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            )}
          </DrawerHeader>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-4",
              !footer && "pb-[max(1rem,env(safe-area-inset-bottom))]",
              className,
            )}
          >
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t bg-popover px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col gap-4 overflow-hidden",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
          {children}
        </div>
        {footer && <div className="shrink-0 border-t pt-3">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
