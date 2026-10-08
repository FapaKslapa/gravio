"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import type { SharedExpensePayload } from "./components/shared-expense-dialog";

type GroupExpensePayload = {
  description: string;
  amount: number;
  currency: string;
  date: string;
  groupId: string;
  groupSplits: Array<{ userId: string; amountNok: number }>;
};

type Options = {
  hasSelectedFriend: boolean;
  clearSelectedFriend: () => void;
  clearSelectedGroup: () => void;
};

export function useFriendsMutations({
  hasSelectedFriend,
  clearSelectedFriend,
  clearSelectedGroup,
}: Options) {
  const { rates } = useDashboard();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
        if (hasSelectedFriend) clearSelectedFriend();
      },
    }),
  );

  const deleteGroupMutation = useMutation(
    trpc.group.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.group.list.queryKey() });
        clearSelectedGroup();
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

  const baseTransaction = (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
  }) => ({
    description: payload.description,
    type: "expense" as const,
    amount: payload.amount,
    currency: payload.currency,
    exchangeRate: rates[payload.currency] ?? 1,
    exchangeRateNok: rates.NOK ?? 11.85,
    categoryId: null,
    date: payload.date,
  });

  const handleSharedExpense = async (payload: SharedExpensePayload) => {
    await createTransactionMutation.mutateAsync({
      ...baseTransaction(payload),
      sharedWithUserId: payload.sharedWithUserId,
      splitMode: payload.splitMode,
      splitValue: payload.splitValue,
    });
  };

  const handleGroupExpense = async (payload: GroupExpensePayload) => {
    await createTransactionMutation.mutateAsync({
      ...baseTransaction(payload),
      groupId: payload.groupId,
      groupSplits: payload.groupSplits,
    });
  };

  return {
    deleteFriend: (friendId: string) =>
      deleteFriendMutation.mutateAsync({ friendId }),
    deleteGroup: (groupId: string) =>
      deleteGroupMutation.mutateAsync({ groupId }),
    handleRespondSuccess,
    handleSettle,
    handleSharedExpense,
    handleGroupExpense,
  };
}
