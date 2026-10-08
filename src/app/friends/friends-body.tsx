"use client";

import { useDashboard } from "@/components/dashboard-layout";
import { computeBalanceTotals } from "./balance-totals";
import { BalanceSummarySection } from "./components/balance-summary-section";
import { FriendsHeader } from "./components/friends-header";
import { FriendsLeftColumn } from "./components/friends-left-column";
import { FriendsRightColumn } from "./components/friends-right-column";
import { FriendsOverlays } from "./friends-overlays";
import type { FriendItem } from "./friends-ui-state";
import type { useFriendsData } from "./use-friends-data";
import type { useFriendsMutations } from "./use-friends-mutations";
import type { useFriendsUi } from "./use-friends-ui";

type FriendsBodyProps = {
  ui: ReturnType<typeof useFriendsUi>;
  data: ReturnType<typeof useFriendsData>;
  mutations: ReturnType<typeof useFriendsMutations>;
  shownFriend: FriendItem | null;
};

export function FriendsBody({
  ui,
  data,
  mutations,
  shownFriend,
}: FriendsBodyProps) {
  const {
    displayCurrency,
    convertCurrency,
    user: currentUser,
  } = useDashboard();
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
        hasFriends={!!data.friendsData && data.friendsData.length > 0}
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
          activeTab={ui.uiState.activeMobileTab}
          onTabChange={ui.setActiveMobileTab}
          isSelecting={
            !!(ui.uiState.selectedFriend || ui.uiState.selectedGroup)
          }
          pendingIncoming={data.pendingData?.incoming ?? []}
          pendingOutgoing={data.pendingData?.outgoing ?? []}
          friends={data.friendsData ?? []}
          balances={balances}
          groups={data.groupsData ?? []}
          selectedFriendId={shownFriend?.user.id}
          selectedGroupId={ui.uiState.selectedGroup?.id}
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
          selectedGroup={ui.uiState.selectedGroup}
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
        friends={data.friendsData ?? []}
        groups={data.groupsData ?? []}
        shownFriend={shownFriend}
      />
    </div>
  );
}
