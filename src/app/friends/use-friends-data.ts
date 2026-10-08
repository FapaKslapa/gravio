"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useFriendsData(selectedGroupId: string | undefined) {
  const trpc = useTRPC();

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
  const { data: proposalsData, isLoading: isProposalsLoading } = useQuery(
    trpc.friend.getGroupSettlementProposals.queryOptions(
      { groupId: selectedGroupId || null },
      { enabled: !!selectedGroupId },
    ),
  );

  return {
    friendsData,
    pendingData,
    balanceSummaryData,
    groupsData,
    transactionsData,
    proposalsData,
    isProposalsLoading,
    isLoading:
      isFriendsLoading ||
      isPendingLoading ||
      isBalanceSummaryLoading ||
      isGroupsLoading ||
      isTransactionsLoading,
  };
}
