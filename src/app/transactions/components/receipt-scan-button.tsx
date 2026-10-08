"use client";

import { ScanLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUrlActions } from "@/hooks/use-url-actions";
import { cn } from "@/lib/utils";
import { ReceiptScanSheet } from "./receipt-scan-sheet";
import { TransactionModal } from "./transaction-modal";

type ModalProps = React.ComponentProps<typeof TransactionModal>;

type Props = {
  categories: ModalProps["categories"];
  onSave: ModalProps["onSave"];
  onCreateCategory: ModalProps["onCreateCategory"];
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  label?: string;
};

export function ReceiptScanButton({
  categories,
  onSave,
  onCreateCategory,
  className,
  variant = "outline",
  label = "Scansiona scontrino",
}: Props) {
  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useUrlActions({ scan: () => setScanOpen(true) });

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={cn("h-11", className)}
        onClick={() => setScanOpen(true)}
      >
        <ScanLine data-icon="inline-start" />
        {label}
      </Button>
      <ReceiptScanSheet
        open={scanOpen}
        onOpenChange={setScanOpen}
        categories={categories}
        onSave={onSave}
        onManual={() => {
          setScanOpen(false);
          setManualOpen(true);
        }}
      />
      <TransactionModal
        isOpen={manualOpen}
        onClose={() => setManualOpen(false)}
        categories={categories}
        onSave={onSave}
        onCreateCategory={onCreateCategory}
      />
    </>
  );
}
