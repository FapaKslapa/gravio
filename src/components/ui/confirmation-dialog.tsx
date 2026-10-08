"use client";

import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Conferma operazione",
  message = "Sei sicuro di voler procedere? Questa azione non può essere annullata.",
  confirmLabel = "Procedi",
  cancelLabel = "Annulla",
  isDestructive = true,
}: ConfirmationDialogProps) {
  const isMobile = useIsMobile();
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) onClose();
  };

  const Icon = isDestructive ? AlertTriangle : HelpCircle;
  const mediaClass = isDestructive
    ? "bg-expense-soft text-destructive"
    : "bg-brand-soft text-brand";

  const confirmButton = (
    <Button
      type="button"
      size="lg"
      variant={isDestructive ? "destructive" : "default"}
      disabled={isPending}
      onClick={handleConfirm}
      className="h-11 w-full font-semibold sm:h-9 sm:w-auto"
    >
      {isPending && (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      )}
      {isPending ? "Attendi..." : confirmLabel}
    </Button>
  );

  const cancelButton = (
    <Button
      type="button"
      size="lg"
      variant="outline"
      disabled={isPending}
      onClick={onClose}
      className="h-11 w-full sm:h-9 sm:w-auto"
    >
      {cancelLabel}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={handleOpenChange}
        dismissible={!isPending}
      >
        <DrawerContent>
          <DrawerHeader className="items-center gap-2 text-center">
            <div
              aria-hidden
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                mediaClass,
              )}
            >
              <Icon className="size-6" />
            </div>
            <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
            <DrawerDescription className="text-balance">
              {message}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
            {confirmButton}
            {cancelButton}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={mediaClass}>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
          {cancelButton}
          {confirmButton}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
