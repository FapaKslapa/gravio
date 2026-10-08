import type { FormState, Group, SharedExpensePayload } from "./types";

export type GroupExpensePayload = {
  description: string;
  amount: number;
  currency: string;
  date: string;
  groupId: string;
  groupSplits: Array<{ userId: string; amountNok: number }>;
};

function getSplitValue(state: FormState): number | undefined {
  if (state.splitMode === "percentage")
    return parseFloat(state.percentage) || 50;
  if (state.splitMode === "exact")
    return parseFloat(state.exactNok) || undefined;
  if (state.splitMode === "custom_n") return parseFloat(state.n) || 2;
  return undefined;
}

type SubmitArgs = {
  state: FormState;
  parsedAmount: number;
  currentUserId: string;
  selectedGroup: Group | undefined;
  checkedMemberIdsSet: Set<string>;
  checkedCount: number;
  groupShareNok: number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onSave: (payload: SharedExpensePayload) => Promise<void>;
  onSaveGroupExpense: (payload: GroupExpensePayload) => Promise<void>;
};

export async function submitSharedExpense({
  state,
  parsedAmount,
  currentUserId,
  selectedGroup,
  checkedMemberIdsSet,
  checkedCount,
  groupShareNok,
  convertCurrency,
  onSave,
  onSaveGroupExpense,
}: SubmitArgs): Promise<boolean> {
  if (state.shareType === "group") {
    if (!state.groupId || checkedCount === 0) return false;
    const activeMembers = (selectedGroup?.members || []).filter((m) =>
      checkedMemberIdsSet.has(m.id),
    );
    const groupSplits = activeMembers.flatMap((m) => {
      if (m.id === currentUserId) return [];
      const splitAmountNok =
        state.groupSplitMode === "custom"
          ? convertCurrency(
              parseFloat(state.customSplitsVal[m.id]) || 0,
              state.currency,
              "NOK",
            )
          : groupShareNok;
      return [{ userId: m.id, amountNok: splitAmountNok }];
    });
    await onSaveGroupExpense({
      description: state.desc,
      amount: parsedAmount,
      currency: state.currency,
      date: state.date || new Date().toISOString(),
      groupId: state.groupId,
      groupSplits,
    });
    return true;
  }
  if (!state.friendId) return false;
  await onSave({
    description: state.desc,
    amount: parsedAmount,
    currency: state.currency,
    date: state.date || new Date().toISOString(),
    sharedWithUserId: state.friendId,
    splitMode: state.splitMode,
    splitValue: getSplitValue(state),
  });
  return true;
}
