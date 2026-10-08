import type { FormState } from "./types";

export function toggleGroupSplitModeUpdate(
  state: FormState,
  mode: "equal" | "custom",
  parsedAmount: number,
  hasAmount: boolean,
): Partial<FormState> {
  if (mode !== "custom") return { groupSplitMode: mode };
  const initial: Record<string, string> = {};
  const checkedCount = state.checkedMemberIds.length;
  if (hasAmount && checkedCount > 0) {
    const equalShare = (parsedAmount / checkedCount).toFixed(2);
    for (const mId of state.checkedMemberIds) initial[mId] = equalShare;
  }
  return { groupSplitMode: mode, customSplitsVal: initial };
}

export function toggleMemberUpdate(
  state: FormState,
  mId: string,
  parsedAmount: number,
): Partial<FormState> {
  const isChecking = !state.checkedMemberIds.includes(mId);
  const nextChecked = isChecking
    ? [...state.checkedMemberIds, mId]
    : state.checkedMemberIds.filter((id) => id !== mId);

  let nextCustom = state.customSplitsVal;
  if (state.groupSplitMode === "custom") {
    nextCustom = { ...state.customSplitsVal };
    if (isChecking) {
      const currentSum = Object.values(nextCustom).reduce(
        (s, v) => s + (parseFloat(v) || 0),
        0,
      );
      const remaining = Math.max(0, parsedAmount - currentSum);
      nextCustom[mId] = remaining > 0 ? remaining.toFixed(2) : "0";
    } else {
      delete nextCustom[mId];
    }
  }
  return { checkedMemberIds: nextChecked, customSplitsVal: nextCustom };
}
