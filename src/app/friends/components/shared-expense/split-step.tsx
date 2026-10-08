"use client";

import { ArrowRight } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";
import { FriendSplit } from "./friend-split";
import { GroupMemberSplits } from "./group-member-splits";
import type { FormState, Friend, Group } from "./types";

type Props = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  selectedFriend?: Friend;
  selectedGroup?: Group;
  currentUserId: string;
  payerName: string;
  payerImage?: string | null;
  amountNok: number;
  groupShareNok: number;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  myNok: number;
  friendNok: number;
  myPct: number;
  friendPct: number;
  checkedCount: number;
  customIsExact: boolean;
  customDifference: number;
  onToggleGroupSplitMode: (mode: "equal" | "custom") => void;
  onToggleMember: (mId: string) => void;
  onChangeCustomSplit: (memberId: string, val: string) => void;
};

export function SharedExpenseSplitStep({
  state,
  set,
  selectedFriend,
  selectedGroup,
  currentUserId,
  payerName,
  payerImage,
  amountNok,
  groupShareNok,
  displayCurrency,
  convertCurrency,
  myNok,
  friendNok,
  myPct,
  friendPct,
  checkedCount,
  customIsExact,
  customDifference,
  onToggleGroupSplitMode,
  onToggleMember,
  onChangeCustomSplit,
}: Props) {
  const blocked =
    state.shareType === "group" &&
    (checkedCount === 0 ||
      (state.groupSplitMode === "custom" && !customIsExact));

  return (
    <m.div
      key="split-step"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {state.shareType === "friend" ? (
        <FriendSplit
          splitMode={state.splitMode}
          percentage={state.percentage}
          exactNok={state.exactNok}
          n={state.n}
          payerName={payerName}
          payerImage={payerImage}
          friendName={selectedFriend?.user.name}
          myNok={myNok}
          friendNok={friendNok}
          myPct={myPct}
          friendPct={friendPct}
          amountNok={amountNok}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
          onChangeSplitMode={(v) => set({ splitMode: v })}
          onChangePercentage={(v) => set({ percentage: v })}
          onChangeExactNok={(v) => set({ exactNok: v })}
          onChangeN={(v) => set({ n: v })}
        />
      ) : (
        <GroupMemberSplits
          selectedGroup={selectedGroup}
          checkedMemberIds={state.checkedMemberIds}
          groupSplitMode={state.groupSplitMode}
          customSplitsVal={state.customSplitsVal}
          currentUserId={currentUserId}
          currency={state.currency}
          amountNok={amountNok}
          groupShareNok={groupShareNok}
          displayCurrency={displayCurrency}
          customIsExact={customIsExact}
          customDifference={customDifference}
          convertCurrency={convertCurrency}
          onToggleGroupSplitMode={onToggleGroupSplitMode}
          onToggleMember={onToggleMember}
          onChangeCustomSplit={onChangeCustomSplit}
        />
      )}

      <Button
        type="button"
        disabled={blocked}
        onClick={() => set({ step: "summary" })}
        className="h-12 w-full text-base"
      >
        Vai al riepilogo
        <ArrowRight data-icon="inline-end" />
      </Button>
    </m.div>
  );
}
