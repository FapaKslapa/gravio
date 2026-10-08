"use client";

import { AnimatePresence } from "motion/react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { SharedExpenseFormStep } from "./shared-expense/form-step";
import { SharedExpenseSplitStep } from "./shared-expense/split-step";
import { StepHeader } from "./shared-expense/step-header";
import { SharedExpenseSummaryStep } from "./shared-expense/summary-step";
import type {
  Friend,
  Group,
  SharedExpensePayload,
} from "./shared-expense/types";
import { useSharedExpenseForm } from "./shared-expense/use-shared-expense-form";

export type { SharedExpensePayload };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  groups: Group[];
  onSave: (payload: SharedExpensePayload) => Promise<void>;
  onSaveGroupExpense: (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
    groupId: string;
    groupSplits: Array<{ userId: string; amountNok: number }>;
  }) => Promise<void>;
  defaultGroupId?: string;
  defaultFriendId?: string;
};

const STEP_DESCRIPTION = {
  form: "Importo, chi ha pagato e con chi dividere.",
  split: "Scegli come ripartire la spesa.",
  summary: "Controlla le quote prima di salvare.",
} as const;

export function SharedExpenseDialog({
  isOpen,
  onClose,
  friends,
  groups,
  onSave,
  onSaveGroupExpense,
  defaultGroupId,
  defaultFriendId,
}: Props) {
  const form = useSharedExpenseForm({
    isOpen,
    onClose,
    friends,
    groups,
    onSave,
    onSaveGroupExpense,
    defaultGroupId,
    defaultFriendId,
  });
  const { state, set } = form;
  const payerName = form.currentUser.name;
  const payerImage = form.currentUser.image;

  const handleBack = () =>
    set({ step: state.step === "summary" ? "split" : "form" });

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) form.handleClose();
      }}
      title="Spesa condivisa"
      description={STEP_DESCRIPTION[state.step]}
      className="sm:max-w-lg"
    >
      <div className="flex flex-col gap-6 pb-2">
        <StepHeader step={state.step} onBack={handleBack} />
        <AnimatePresence mode="wait">
          {state.step === "form" ? (
            <SharedExpenseFormStep
              key="form"
              state={state}
              set={set}
              friends={friends}
              groups={groups}
              displayCurrency={form.displayCurrency}
              convertCurrency={form.convertCurrency}
              parsedAmount={form.parsedAmount}
              payerName={payerName}
              payerImage={payerImage}
              onNext={() => set({ step: "split" })}
            />
          ) : state.step === "split" ? (
            <SharedExpenseSplitStep
              key="split"
              state={state}
              set={set}
              selectedFriend={form.selectedFriend}
              selectedGroup={form.selectedGroup}
              currentUserId={form.currentUserId}
              payerName={payerName}
              payerImage={payerImage}
              amountNok={form.amountNok}
              groupShareNok={form.groupShareNok}
              displayCurrency={form.displayCurrency}
              convertCurrency={form.convertCurrency}
              myNok={form.myNok}
              friendNok={form.friendNok}
              myPct={form.myPct}
              friendPct={form.friendPct}
              checkedCount={form.checkedCount}
              customIsExact={form.customIsExact}
              customDifference={form.customDifference}
              onToggleGroupSplitMode={form.handleToggleGroupSplitMode}
              onToggleMember={form.handleToggleMember}
              onChangeCustomSplit={form.handleChangeCustomSplit}
            />
          ) : (
            <SharedExpenseSummaryStep
              key="summary"
              state={state}
              selectedFriend={form.selectedFriend}
              selectedGroup={form.selectedGroup}
              checkedMemberIdsSet={form.checkedMemberIdsSet}
              currentUserId={form.currentUserId}
              payerName={payerName}
              payerImage={payerImage}
              parsedAmount={form.parsedAmount}
              groupShareNok={form.groupShareNok}
              myNok={form.myNok}
              friendNok={form.friendNok}
              splitSummaryLabel={form.splitSummaryLabel}
              displayCurrency={form.displayCurrency}
              convertCurrency={form.convertCurrency}
              canSave={form.canSave}
              isSaving={form.isSaving}
              onSave={form.handleSave}
            />
          )}
        </AnimatePresence>
      </div>
    </ResponsiveSheet>
  );
}
