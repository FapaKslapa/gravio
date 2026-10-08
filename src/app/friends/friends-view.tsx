"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { useTRPC } from "@/lib/trpc/client";

import { AddFriendCard } from "./components/add-friend-card";
import { BalanceSummarySection } from "./components/balance-summary-section";
import { FriendsHeader } from "./components/friends-header";
import { FriendsLeftColumn } from "./components/friends-left-column";
import { FriendsModals } from "./components/friends-modals";
import { FriendsRightColumn } from "./components/friends-right-column";
import type { SharedExpensePayload } from "./components/shared-expense-dialog";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: { id: string; name: string; email: string }[];
};

type UIState = {
  activeMobileTab: "friends" | "groups";
  isAddFriendOpen: boolean;
  isSharedExpenseOpen: boolean;
  isCreateGroupOpen: boolean;
  selectedFriend: FriendItem | null;
  selectedGroup: GroupItem | null;
  friendToDelete: FriendItem | null;
  settleConfirmFriend: FriendItem | null;
  groupToDelete: GroupItem | null;
};

type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

export default function FriendsView() {
  const {
    displayCurrency,
    convertCurrency,
    rates,
    user: currentUser,
  } = useDashboard();
  const currentUserId = currentUser.id;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: friendsData, isLoading: isFriendsLoading } = useQuery(
    trpc.friend.listFriends.queryOptions(),
  );
  const { data: pendingData, isLoading: isPendingLoading } = useQuery(
    trpc.friend.listPendingRequests.queryOptions(),
  );
  const { data: balanceSummaryData, isLoading: isBalanceSummaryLoading } =
    useQuery(trpc.friend.getBalanceSummary.queryOptions());
  const { data: groupsData, isLoading: isGroupsLoading } = useQuery(
    trpc.group.list.queryOptions(),
  );
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    trpc.transaction.list.queryOptions(),
  );

  // ── State ─────────────────────────────────────────────────────────────────
  const [uiState, dispatch] = useReducer(uiReducer, {
    activeMobileTab: "friends",
    isAddFriendOpen: false,
    isSharedExpenseOpen: false,
    isCreateGroupOpen: false,
    selectedFriend: null,
    selectedGroup: null,
    friendToDelete: null,
    settleConfirmFriend: null,
    groupToDelete: null,
  });

  const {
    activeMobileTab,
    isAddFriendOpen,
    isSharedExpenseOpen,
    isCreateGroupOpen,
    selectedFriend,
    selectedGroup,
    friendToDelete,
    settleConfirmFriend,
    groupToDelete,
  } = uiState;

  const setActiveMobileTab = (val: "friends" | "groups") =>
    dispatch({ type: "SET_FIELD", field: "activeMobileTab", value: val });
  const setIsAddFriendOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isAddFriendOpen", value: val });
  const setIsSharedExpenseOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isSharedExpenseOpen", value: val });
  const setIsCreateGroupOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isCreateGroupOpen", value: val });
  const setSelectedFriend = (val: FriendItem | null) =>
    dispatch({ type: "SET_FIELD", field: "selectedFriend", value: val });
  const setSelectedGroup = (val: GroupItem | null) =>
    dispatch({ type: "SET_FIELD", field: "selectedGroup", value: val });
  const setFriendToDelete = (val: FriendItem | null) =>
    dispatch({ type: "SET_FIELD", field: "friendToDelete", value: val });
  const setSettleConfirmFriend = (val: FriendItem | null) =>
    dispatch({ type: "SET_FIELD", field: "settleConfirmFriend", value: val });
  const setGroupToDelete = (val: GroupItem | null) =>
    dispatch({ type: "SET_FIELD", field: "groupToDelete", value: val });

  const { data: proposalsData, isLoading: isProposalsLoading } = useQuery(
    trpc.friend.getGroupSettlementProposals.queryOptions(
      { groupId: selectedGroup?.id || null },
      { enabled: !!selectedGroup?.id },
    ),
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const settleDebtMutation = useMutation(
    trpc.friend.settleDebt.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.friend.getBalanceSummary.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.friend.getGroupSettlementProposals.queryKey(),
        });
      },
    }),
  );

  const deleteFriendMutation = useMutation(
    trpc.friend.deleteFriend.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.friend.listFriends.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.friend.getBalanceSummary.queryKey(),
        });
        if (selectedFriend) setSelectedFriend(null);
      },
    }),
  );

  const deleteGroupMutation = useMutation(
    trpc.group.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.group.list.queryKey() });
        setSelectedGroup(null);
      },
    }),
  );

  const createTransactionMutation = useMutation(
    trpc.transaction.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.friend.getBalanceSummary.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.list.queryKey(),
        });
      },
    }),
  );

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (
    isFriendsLoading ||
    isPendingLoading ||
    isBalanceSummaryLoading ||
    isGroupsLoading ||
    isTransactionsLoading
  ) {
    return <LoadingState />;
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const balances = balanceSummaryData || [];
  const totalYouAreOwedNok = balances
    .filter((b) => b.balanceNok > 0)
    .reduce((s, b) => s + b.balanceNok, 0);
  const totalYouOweNok = Math.abs(
    balances
      .filter((b) => b.balanceNok < 0)
      .reduce((s, b) => s + b.balanceNok, 0),
  );
  const netBalanceNok = totalYouAreOwedNok - totalYouOweNok;

  const convertNokAmount = (val: number | string): number =>
    convertCurrency(
      typeof val === "string" ? parseFloat(val) : val,
      "NOK",
      displayCurrency,
    );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRespondSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.friend.listPendingRequests.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.friend.listFriends.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.friend.getBalanceSummary.queryKey(),
    });
  };

  const handleSettle = async (friendId: string) => {
    await settleDebtMutation.mutateAsync({ friendId });
  };

  const handleSharedExpense = async (payload: SharedExpensePayload) => {
    await createTransactionMutation.mutateAsync({
      description: payload.description,
      type: "expense",
      amount: payload.amount,
      currency: payload.currency,
      exchangeRate: rates[payload.currency] ?? 1,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: null,
      date: payload.date,
      sharedWithUserId: payload.sharedWithUserId,
      splitMode: payload.splitMode,
      splitValue: payload.splitValue,
    });
  };

  const handleGroupExpense = async (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
    groupId: string;
    groupSplits: Array<{ userId: string; amountNok: number }>;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: payload.description,
      type: "expense",
      amount: payload.amount,
      currency: payload.currency,
      exchangeRate: rates[payload.currency] ?? 1,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: null,
      date: payload.date,
      groupId: payload.groupId,
      groupSplits: payload.groupSplits,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-3 pb-24 text-foreground md:px-8 md:pb-12">
      <FriendsHeader
        hasFriends={!!friendsData && friendsData.length > 0}
        onAddExpense={() => setIsSharedExpenseOpen(true)}
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
          onTabChange={setActiveMobileTab}
          isSelecting={!!(selectedFriend || selectedGroup)}
          pendingIncoming={pendingData?.incoming ?? []}
          pendingOutgoing={pendingData?.outgoing ?? []}
          friends={friendsData ?? []}
          balances={balances}
          groups={groupsData ?? []}
          selectedFriendId={selectedFriend?.user.id}
          selectedGroupId={selectedGroup?.id}
          displayCurrency={displayCurrency}
          convertNokAmount={convertNokAmount}
          onAddFriend={() => setIsAddFriendOpen(true)}
          onPendingActionSuccess={handleRespondSuccess}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setSelectedGroup(null);
          }}
          onSelectGroup={(group) => {
            setSelectedGroup(group);
            setSelectedFriend(null);
          }}
          onClearFriend={() => setSelectedFriend(null)}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        />

        <FriendsRightColumn
          selectedFriend={selectedFriend}
          selectedGroup={selectedGroup}
          balances={balances}
          transactions={transactionsData ?? []}
          proposals={proposalsData ?? []}
          isProposalsLoading={isProposalsLoading}
          currentUserId={currentUserId}
          displayCurrency={displayCurrency}
          convertNokAmount={convertNokAmount}
          convertCurrency={convertCurrency}
          onClearFriend={() => setSelectedFriend(null)}
          onClearGroup={() => setSelectedGroup(null)}
          onOpenSharedExpense={() => setIsSharedExpenseOpen(true)}
          onOpenSettleDebt={setSettleConfirmFriend}
          onOpenDeleteFriend={setFriendToDelete}
          onOpenDeleteGroup={setGroupToDelete}
          onSettle={handleSettle}
        />
      </div>

      <AddFriendCard
        open={isAddFriendOpen}
        onOpenChange={setIsAddFriendOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: trpc.friend.listPendingRequests.queryKey(),
          })
        }
      />

      <FriendsModals
        isSharedExpenseOpen={isSharedExpenseOpen}
        onCloseSharedExpense={() => setIsSharedExpenseOpen(false)}
        friends={friendsData ?? []}
        groups={groupsData ?? []}
        selectedGroup={selectedGroup}
        selectedFriend={selectedFriend}
        onSaveSharedExpense={handleSharedExpense}
        onSaveGroupExpense={handleGroupExpense}
        isCreateGroupOpen={isCreateGroupOpen}
        onCloseCreateGroup={() => setIsCreateGroupOpen(false)}
        onCreateGroupSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: trpc.group.list.queryKey(),
          })
        }
        friendToDelete={friendToDelete}
        onCloseFriendDelete={() => setFriendToDelete(null)}
        onConfirmFriendDelete={async () => {
          if (friendToDelete)
            await deleteFriendMutation.mutateAsync({
              friendId: friendToDelete.user.id,
            });
        }}
        settleConfirmFriend={settleConfirmFriend}
        onCloseSettle={() => setSettleConfirmFriend(null)}
        onConfirmSettle={async () => {
          if (settleConfirmFriend)
            await handleSettle(settleConfirmFriend.user.id);
        }}
        groupToDelete={groupToDelete}
        onCloseGroupDelete={() => setGroupToDelete(null)}
        onConfirmGroupDelete={async () => {
          if (groupToDelete)
            await deleteGroupMutation.mutateAsync({
              groupId: groupToDelete.id,
            });
        }}
      />
    </div>
  );
}
