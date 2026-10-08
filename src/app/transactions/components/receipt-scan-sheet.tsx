"use client";

import { AnimatePresence } from "motion/react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { ReceiptConfirmForm } from "./receipt-scan/receipt-confirm-form";
import {
  ErrorView,
  IdleView,
  ReadingView,
} from "./receipt-scan/receipt-phase-views";
import type { ReceiptCategory } from "./receipt-scan/receipt-types";
import { useReceiptScan } from "./receipt-scan/use-receipt-scan";
import type { TransactionModal } from "./transaction-modal";

type ModalProps = React.ComponentProps<typeof TransactionModal>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ReceiptCategory[];
  onSave: ModalProps["onSave"];
  onManual: () => void;
};

export function ReceiptScanSheet({
  open,
  onOpenChange,
  categories,
  onSave,
  onManual,
}: Props) {
  const s = useReceiptScan({ open, categories, onOpenChange, onSave });

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={s.handleOpenChange}
      title="Scansiona scontrino"
      description="Fotografa lo scontrino: compilo io la spesa."
      className="md:max-w-md"
    >
      <input
        ref={s.fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void s.handleFile(f);
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        {s.phase.name === "idle" && (
          <IdleView
            onPick={() => s.fileRef.current?.click()}
            onManual={onManual}
          />
        )}
        {s.phase.name === "reading" && <ReadingView preview={s.preview} />}
        {s.phase.name === "error" && (
          <ErrorView
            preview={s.preview}
            message={s.phase.message}
            onRetry={s.retry}
            onManual={onManual}
          />
        )}
        {s.phase.name === "confirm" && (
          <ReceiptConfirmForm
            categories={categories}
            desc={s.desc}
            setDesc={s.setDesc}
            amount={s.amount}
            setAmount={s.setAmount}
            date={s.date}
            setDate={s.setDate}
            currency={s.currency}
            setCurrency={s.setCurrency}
            categoryId={s.categoryId}
            setCategoryId={s.setCategoryId}
            suggestedId={s.suggestedId}
            items={s.items}
            submitted={s.submitted}
            validAmount={s.validAmount}
            saving={s.saving}
            onSubmit={s.handleSave}
            onManual={onManual}
          />
        )}
      </AnimatePresence>
    </ResponsiveSheet>
  );
}
