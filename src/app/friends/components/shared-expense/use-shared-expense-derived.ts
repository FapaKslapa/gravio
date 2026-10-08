import { useMemo } from "react";
import type { FormState, Friend, Group, SplitMode } from "./types";

function computeShares(
  amountNok: number,
  mode: SplitMode,
  value: number,
): { myNok: number; friendNok: number } {
  let friendNok: number;
  switch (mode) {
    case "percentage":
      friendNok = amountNok * (value / 100);
      break;
    case "exact":
      friendNok = Math.min(value, amountNok);
      break;
    case "thirds":
      friendNok = amountNok / 3;
      break;
    case "custom_n":
      friendNok = amountNok / Math.max(value, 2);
      break;
    default:
      friendNok = amountNok / 2;
  }
  return { myNok: amountNok - friendNok, friendNok };
}

function getSplitValueNum(state: FormState, amountNok: number): number {
  switch (state.splitMode) {
    case "percentage":
      return parseFloat(state.percentage) || 50;
    case "exact":
      return parseFloat(state.exactNok) || amountNok / 2;
    case "custom_n":
      return parseFloat(state.n) || 2;
    default:
      return 0;
  }
}

function getSplitSummaryLabel(
  state: FormState,
  checkedCount: number,
  friendName: string | undefined,
  myNok: number,
  friendNok: number,
): string {
  if (state.shareType === "group") {
    return `Diviso per ${checkedCount} partecipanti`;
  }
  switch (state.splitMode) {
    case "half":
      return "50 / 50";
    case "thirds":
      return "1/3 ciascuno";
    case "percentage":
      return `Tu ${100 - parseFloat(state.percentage || "50")}% / ${friendName} ${state.percentage}%`;
    case "exact":
      return `${myNok.toFixed(0)} / ${friendNok.toFixed(0)} NOK`;
    default:
      return `1/${state.n} ciascuno`;
  }
}

export function useSharedExpenseDerived(
  state: FormState,
  friends: Friend[],
  groups: Group[],
  convertCurrency: (amount: number, from: string, to: string) => number,
) {
  const parsedAmount = parseFloat(state.amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const amountNok = hasAmount
    ? convertCurrency(parsedAmount, state.currency, "NOK")
    : 0;

  const checkedMemberIdsSet = useMemo(
    () => new Set(state.checkedMemberIds),
    [state.checkedMemberIds],
  );

  const selectedFriend = friends.find((f) => f.user.id === state.friendId);
  const selectedGroup = groups.find((g) => g.id === state.groupId);

  const { myNok, friendNok } =
    amountNok > 0
      ? computeShares(
          amountNok,
          state.splitMode,
          getSplitValueNum(state, amountNok),
        )
      : { myNok: 0, friendNok: 0 };

  const myPct = amountNok > 0 ? (myNok / amountNok) * 100 : 50;
  const friendPct = amountNok > 0 ? (friendNok / amountNok) * 100 : 50;

  const checkedCount = state.checkedMemberIds.length;
  const groupShareNok = checkedCount > 0 ? amountNok / checkedCount : 0;

  const customSum = Object.entries(state.customSplitsVal)
    .filter(([id]) => checkedMemberIdsSet.has(id))
    .reduce((sum, [, val]) => sum + (parseFloat(val) || 0), 0);

  const customIsExact = Math.abs(customSum - parsedAmount) < 0.01;
  const customDifference = parsedAmount - customSum;

  const isGroupCustomValid =
    state.shareType === "group" && state.groupSplitMode === "custom"
      ? customIsExact
      : true;

  const canSave =
    hasAmount &&
    !!state.desc &&
    (state.shareType === "friend"
      ? !!state.friendId
      : !!state.groupId && checkedCount > 0 && isGroupCustomValid);

  return {
    parsedAmount,
    hasAmount,
    amountNok,
    checkedMemberIdsSet,
    selectedFriend,
    selectedGroup,
    myNok,
    friendNok,
    myPct,
    friendPct,
    checkedCount,
    groupShareNok,
    customIsExact,
    customDifference,
    canSave,
    splitSummaryLabel: getSplitSummaryLabel(
      state,
      checkedCount,
      selectedFriend?.user.name,
      myNok,
      friendNok,
    ),
  };
}
