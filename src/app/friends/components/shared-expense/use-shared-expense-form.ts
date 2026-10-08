"use client";

import { useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { formReducer, initialFormState } from "./form-reducer";
import {
  toggleGroupSplitModeUpdate,
  toggleMemberUpdate,
} from "./group-split-updates";
import {
  type GroupExpensePayload,
  submitSharedExpense,
} from "./submit-shared-expense";
import type { FormState, Friend, Group, SharedExpensePayload } from "./types";
import { useSharedExpenseDerived } from "./use-shared-expense-derived";

type UseSharedExpenseFormProps = {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  groups: Group[];
  onSave: (payload: SharedExpensePayload) => Promise<void>;
  onSaveGroupExpense: (payload: GroupExpensePayload) => Promise<void>;
  defaultGroupId?: string;
  defaultFriendId?: string;
};

export function useSharedExpenseForm({
  isOpen,
  onClose,
  friends,
  groups,
  onSave,
  onSaveGroupExpense,
  defaultGroupId,
  defaultFriendId,
}: UseSharedExpenseFormProps) {
  const {
    user: currentUser,
    displayCurrency,
    convertCurrency,
  } = useDashboard();
  const currentUserId = currentUser.id;

  const [state, dispatch] = useReducer(formReducer, {
    ...initialFormState,
    currency: displayCurrency,
  });

  const [isSaving, setIsSaving] = useState(false);

  const set = (payload: Partial<FormState>) =>
    dispatch({ type: "SET", payload });

  // ── Sync isOpen / defaults ──────────────────────────────────────────────────
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (defaultGroupId) {
        set({ shareType: "group", groupId: defaultGroupId });
      } else if (defaultFriendId) {
        set({ shareType: "friend", friendId: defaultFriendId });
      }
    }
  }

  // ── Sync members when group changes ─────────────────────────────────────────
  const [prevGroupId, setPrevGroupId] = useState("");
  if (state.groupId !== prevGroupId) {
    setPrevGroupId(state.groupId);
    const grp = groups.find((g) => g.id === state.groupId);
    set({ checkedMemberIds: grp ? grp.members.map((m) => m.id) : [] });
  }

  const derived = useSharedExpenseDerived(
    state,
    friends,
    groups,
    convertCurrency,
  );
  const { parsedAmount, hasAmount } = derived;

  const resetForm = () =>
    dispatch({ type: "RESET", payload: { currency: displayCurrency } });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleGroupSplitMode = (mode: "equal" | "custom") =>
    set(toggleGroupSplitModeUpdate(state, mode, parsedAmount, hasAmount));

  const handleToggleMember = (mId: string) =>
    set(toggleMemberUpdate(state, mId, parsedAmount));

  const handleChangeCustomSplit = (memberId: string, val: string) => {
    set({
      customSplitsVal: { ...state.customSplitsVal, [memberId]: val },
    });
  };

  const handleSave = async () => {
    if (!state.desc || !hasAmount) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      const saved = await submitSharedExpense({
        state,
        parsedAmount,
        currentUserId,
        selectedGroup: derived.selectedGroup,
        checkedMemberIdsSet: derived.checkedMemberIdsSet,
        checkedCount: derived.checkedCount,
        groupShareNok: derived.groupShareNok,
        convertCurrency,
        onSave,
        onSaveGroupExpense,
      });
      if (!saved) return;
      resetForm();
      onClose();
    } catch {
      set({ step: "summary" });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ...derived,
    state,
    set,
    currentUser,
    currentUserId,
    displayCurrency,
    convertCurrency,
    isSaving,
    handleClose,
    handleToggleGroupSplitMode,
    handleToggleMember,
    handleChangeCustomSplit,
    handleSave,
  };
}
