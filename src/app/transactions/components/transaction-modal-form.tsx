import type React from "react";
import { FieldGroup } from "@/components/ui/field";
import {
  AmountField,
  CategorySection,
  ConversionBadge,
  CurrencyField,
  DateField,
  DescriptionField,
  TransactionTypeToggle,
} from "./transaction-modal-fields";
import type { Category } from "./transaction-modal-types";
import type { useTransactionModal } from "./use-transaction-modal";

type TransactionModalFormProps = ReturnType<typeof useTransactionModal> & {
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
};

export function TransactionModalForm({
  form,
  set,
  submitted,
  parsedAmount,
  hasAmount,
  convertedAmount,
  displayCurrency,
  suggestedCategoryId,
  handleCreateCategoryInline,
  handleSubmit,
  categories,
}: Omit<TransactionModalFormProps, "onSubmit" | "setSubmitted">) {
  return (
    <form
      id="transaction-form"
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 pb-4"
    >
      <div className="flex flex-col gap-1">
        <AmountField
          amount={form.txAmount}
          currency={form.txCurrency}
          type={form.txType}
          invalid={submitted && !hasAmount}
          onChange={(v) => set({ txAmount: v })}
        />
        {convertedAmount !== null && (
          <ConversionBadge
            parsedAmount={parsedAmount}
            convertedAmount={convertedAmount}
            sourceCurrency={form.txCurrency}
            targetCurrency={displayCurrency}
          />
        )}
      </div>
      <TransactionTypeToggle
        value={form.txType}
        onChange={(v) => set({ txType: v })}
      />
      <FieldGroup className="gap-6">
        <CategorySection
          categoryId={form.txCategoryId}
          suggestedCategoryId={suggestedCategoryId}
          categories={categories}
          onCategoryChange={(v) => set({ txCategoryId: v })}
          isInlineCatOpen={form.isInlineCatOpen}
          onToggleInlineCat={() =>
            set({ isInlineCatOpen: !form.isInlineCatOpen })
          }
          newCatName={form.newCatName}
          onNewCatNameChange={(v) => set({ newCatName: v })}
          newCatColor={form.newCatColor}
          onNewCatColorChange={(v) => set({ newCatColor: v })}
          newCatIcon={form.newCatIcon}
          onNewCatIconChange={(v) => set({ newCatIcon: v })}
          onCreateCategory={handleCreateCategoryInline}
        />
        <div className="grid grid-cols-2 gap-3">
          <DateField value={form.txDate} onChange={(v) => set({ txDate: v })} />
          <CurrencyField
            currency={form.txCurrency}
            onChange={(v) => set({ txCurrency: v })}
          />
        </div>
        <DescriptionField
          value={form.txDesc}
          invalid={submitted && !form.txDesc.trim()}
          onChange={(v) => set({ txDesc: v })}
        />
      </FieldGroup>
    </form>
  );
}
