"use client";

import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { useUrlActions } from "@/hooks/use-url-actions";
import { computeBalanceTotals } from "./balance-totals";
import { BalanceSummarySection } from "./components/balance-summary-section";
import { FriendsHeader } from "./components/friends-header";
import { FriendsLeftColumn } from "./components/friends-left-column";
import { FriendsRightColumn } from "./components/friends-right-column";
import { FriendsOverlays } from "./friends-overlays";
import type { FriendItem } from "./friends-ui-state";
import { useFriendsData } from "./use-friends-data";
import { useFriendsMutations } from "./use-friends-mutations";
import { useFriendsUi } from "./use-friends-ui";

export default function FriendsView() {
  const {
    displayCurrency,
    convertCurrency,
    user: currentUser,
  } = useDashboard();
  const ui = useFriendsUi();
  const { activeMobileTab, selectedFriend, selectedGroup } = ui.uiState;

  const data = useFriendsData(selectedGroup?.id);
  const { friendsData, groupsData } = data;
  const mutations = useFriendsMutations({
    hasSelectedFriend: !!selectedFriend,
    clearSelectedFriend: () => ui.setSelectedFriend(null),
    clearSelectedGroup: () => ui.setSelectedGroup(null),
  });

  const autoFriend =
    ui.isXl &&
    !selectedFriend &&
    !selectedGroup &&
    activeMobileTab === "friends"
      ? ((friendsData?.[0] as FriendItem | undefined) ?? null)
      : null;
  const shownFriend = selectedFriend ?? autoFriend;

  useUrlActions(
    {
      friend: (id) => {
        const found = friendsData?.find((f) => f.user.id === id);
        if (found) ui.setSelectedFriend(found as FriendItem);
      },
    },
    !!friendsData,
  );

  if (data.isLoading) {
    return <LoadingState />;
  }

  const balances = data.balanceSummaryData || [];
  const { totalYouAreOwedNok, totalYouOweNok, netBalanceNok } =
    computeBalanceTotals(balances);

  const convertNokAmount = (val: number | string): number =>
    convertCurrency(
      typeof val === "string" ? parseFloat(val) : val,
      "NOK",
      displayCurrency,
    );

  return (
    <div className="flex w-full flex-col gap-5 text-foreground">
      <FriendsHeader
        hasFriends={!!friendsData && friendsData.length > 0}
        onAddExpense={() => ui.setIsSharedExpenseOpen(true)}
      />

      <BalanceSummarySection
        totalYouAreOwed={totalYouAreOwedNok}
        totalYouOwe={totalYouOweNok}
        netBalance={netBalanceNok}
        displayCurrency={displayCurrency}
        convertAmount={convertNokAmount}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:items-start">
        <FriendsLeftColumn
          activeTab={activeMobileTab}
          onTabChange={ui.setActiveMobileTab}
          isSelecting={!!(selectedFriend || selectedGroup)}
          pendingIncoming={data.pendingData?.incoming ?? []}
          pendingOutgoing={data.pendingData?.outgoing ?? []}
          friends={friendsData ?? []}
          balances={balances}
          groups={groupsData ?? []}
          selectedFriendId={shownFriend?.user.id}
          selectedGroupId={selectedGroup?.id}
          displayCurrency={displayCurrency}
          convertNokAmount={convertNokAmount}
          onAddFriend={() => ui.setIsAddFriendOpen(true)}
          onPendingActionSuccess={mutations.handleRespondSuccess}
          onSelectFriend={(friend) => {
            ui.setSelectedFriend(friend);
            ui.setSelectedGroup(null);
          }}
          onSelectGroup={(group) => {
            ui.setSelectedGroup(group);
            ui.setSelectedFriend(null);
          }}
          onClearFriend={() => ui.setSelectedFriend(null)}
          onOpenCreateGroup={() => ui.setIsCreateGroupOpen(true)}
        />

        <FriendsRightColumn
          selectedFriend={shownFriend}
          selectedGroup={selectedGroup}
          balances={balances}
          transactions={data.transactionsData ?? []}
          proposals={data.proposalsData ?? []}
          isProposalsLoading={data.isProposalsLoading}
          currentUserId={currentUser.id}
          displayCurrency={displayCurrency}
          convertNokAmount={convertNokAmount}
          convertCurrency={convertCurrency}
          onClearFriend={() => ui.setSelectedFriend(null)}
          onClearGroup={() => ui.setSelectedGroup(null)}
          onOpenSharedExpense={() => ui.setIsSharedExpenseOpen(true)}
          onOpenSettleDebt={ui.setSettleConfirmFriend}
          onOpenDeleteFriend={ui.setFriendToDelete}
          onOpenDeleteGroup={ui.setGroupToDelete}
          onSettle={mutations.handleSettle}
        />
      </div>

      <FriendsOverlays
        ui={ui}
        mutations={mutations}
        friends={friendsData ?? []}
        groups={groupsData ?? []}
        shownFriend={shownFriend}
      />
    </div>
  );
}
