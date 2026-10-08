"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { AmountSection } from "./quick-add/amount-section";
import { DetailsFields } from "./quick-add/details-fields";
import {
  type CategoryType,
  NO_RECENT,
  type QuickAddTransaction,
  type RecentTx,
} from "./quick-add/quick-add-types";
import { RecentsSection } from "./quick-add/recents-section";
import { TypeToggle } from "./quick-add/type-toggle";
import { useQuickAddForm } from "./quick-add/use-quick-add-form";

type QuickAddFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  recentTransactions?: RecentTx[];
  onSave: (transaction: QuickAddTransaction) => Promise<void>;
};

export function QuickAddForm({
  isOpen,
  onClose,
  categories,
  recentTransactions = NO_RECENT,
  onSave,
}: QuickAddFormProps) {
  const form = useQuickAddForm({
    isOpen,
    onClose,
    categories,
    recentTransactions,
    onSave,
  });
  const { desc, type, amount, currency, categoryId, isSaving } = form.state;
  const { set, hasAmount } = form;

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={type === "expense" ? "Nuova spesa" : "Nuova entrata"}
      description="Registra una transazione in pochi tocchi"
      className="sm:max-w-lg"
      footer={
        <Button
          type="submit"
          form="quick-add-form"
          size="lg"
          disabled={isSaving || !hasAmount}
          className={cn(
            "h-12 w-full rounded-full text-base font-semibold text-background active:scale-[0.97]",
            type === "expense"
              ? "bg-expense hover:bg-expense/90"
              : "bg-income hover:bg-income/90",
          )}
        >
          {isSaving
            ? "Salvataggio..."
            : type === "expense"
              ? "Aggiungi spesa"
              : "Aggiungi entrata"}
        </Button>
      }
    >
      <form
        id="quick-add-form"
        className="flex flex-col gap-5 pb-2"
        action={() => form.handleSave()}
      >
        <RecentsSection
          recents={form.recents}
          categories={categories}
          onApply={form.applyRecent}
        />
        <TypeToggle type={type} onChange={(v) => set("type", v)} />
        <AmountSection
          amount={amount}
          currency={currency}
          currencyOptions={form.currencyOptions}
          parsedAmount={form.parsedAmount}
          convertedAmount={form.convertedAmount}
          displayCurrency={form.displayCurrency}
          set={set}
        />
        <DetailsFields
          categories={categories}
          categoryId={categoryId}
          suggestedId={form.suggestedId}
          desc={desc}
          today={form.today}
          yesterday={form.yesterday}
          effectiveDate={form.effectiveDate}
          set={set}
        />
      </form>
    </ResponsiveSheet>
  );
}
