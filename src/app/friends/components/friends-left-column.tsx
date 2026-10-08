"use client";

import { m } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FriendListPanel } from "./friend-list-panel";
import { GroupListCard } from "./group-list-card";
import { MobileTabBar } from "./mobile-tab-bar";
import { PendingRequestsCard } from "./pending-requests-card";

type GroupMember = { id: string; name: string; email: string };

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type BalanceInfo = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

type PendingItem = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  createdAt: Date | null;
};

interface FriendsLeftColumnProps {
  activeTab: "friends" | "groups";
  onTabChange: (tab: "friends" | "groups") => void;
  isSelecting: boolean;
  pendingIncoming: PendingItem[];
  pendingOutgoing: PendingItem[];
  friends: FriendItem[];
  balances: BalanceInfo[];
  groups: GroupItem[];
  selectedFriendId: string | undefined;
  selectedGroupId: string | undefined;
  displayCurrency: string;
  convertNokAmount: (val: number) => number;
  onAddFriend: () => void;
  onPendingActionSuccess: () => void;
  onSelectFriend: (friend: FriendItem) => void;
  onSelectGroup: (group: GroupItem) => void;
  onClearFriend: () => void;
  onOpenCreateGroup: () => void;
}

export function FriendsLeftColumn({
  activeTab,
  onTabChange,
  isSelecting,
  pendingIncoming,
  pendingOutgoing,
  friends,
  balances,
  groups,
  selectedFriendId,
  selectedGroupId,
  displayCurrency,
  convertNokAmount,
  onAddFriend,
  onPendingActionSuccess,
  onSelectFriend,
  onSelectGroup,
  onClearFriend,
  onOpenCreateGroup,
}: FriendsLeftColumnProps) {
  const incoming = pendingIncoming.filter(
    (r): r is typeof r & { user: NonNullable<typeof r.user> } =>
      r.user !== null,
  );
  const outgoing = pendingOutgoing.filter(
    (r): r is typeof r & { user: NonNullable<typeof r.user> } =>
      r.user !== null,
  );

  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={2}
      className={cn(
        "flex min-w-0 flex-col gap-4",
        isSelecting && "hidden xl:flex",
      )}
    >
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        pendingCount={incoming.length}
      />

      {activeTab === "friends" ? (
        <>
          <PendingRequestsCard
            incomingRequests={incoming}
            outgoingRequests={outgoing}
            onActionSuccess={onPendingActionSuccess}
          />
          <FriendListPanel
            friends={friends}
            balances={balances}
            selectedFriendId={selectedFriendId}
            displayCurrency={displayCurrency}
            convertNokAmount={convertNokAmount}
            onSelectFriend={onSelectFriend}
            onAddFriend={onAddFriend}
          />
        </>
      ) : (
        <GroupListCard
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={onSelectGroup}
          onClearFriend={onClearFriend}
          onOpenCreateGroup={onOpenCreateGroup}
        />
      )}
    </m.div>
  );
}
