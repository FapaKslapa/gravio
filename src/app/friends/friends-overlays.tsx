"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { AddFriendCard } from "./components/add-friend-card";
import { FriendsModals } from "./components/friends-modals";
import type { FriendItem, GroupItem, UIState } from "./friends-ui-state";
import type { useFriendsMutations } from "./use-friends-mutations";
import type { useFriendsUi } from "./use-friends-ui";

type Props = {
  ui: ReturnType<typeof useFriendsUi>;
  mutations: ReturnType<typeof useFriendsMutations>;
  friends: FriendItem[];
  groups: GroupItem[];
  shownFriend: FriendItem | null;
};

export function FriendsOverlays({
  ui,
  mutations,
  friends,
  groups,
  shownFriend,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const s: UIState = ui.uiState;

  return (
    <>
      <AddFriendCard
        open={s.isAddFriendOpen}
        onOpenChange={ui.setIsAddFriendOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: trpc.friend.listPendingRequests.queryKey(),
          })
        }
      />

      <FriendsModals
        isSharedExpenseOpen={s.isSharedExpenseOpen}
        onCloseSharedExpense={() => ui.setIsSharedExpenseOpen(false)}
        friends={friends}
        groups={groups}
        selectedGroup={s.selectedGroup}
        selectedFriend={shownFriend}
        onSaveSharedExpense={mutations.handleSharedExpense}
        onSaveGroupExpense={mutations.handleGroupExpense}
        isCreateGroupOpen={s.isCreateGroupOpen}
        onCloseCreateGroup={() => ui.setIsCreateGroupOpen(false)}
        onCreateGroupSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: trpc.group.list.queryKey(),
          })
        }
        friendToDelete={s.friendToDelete}
        onCloseFriendDelete={() => ui.setFriendToDelete(null)}
        onConfirmFriendDelete={async () => {
          if (s.friendToDelete)
            await mutations.deleteFriend(s.friendToDelete.user.id);
        }}
        settleConfirmFriend={s.settleConfirmFriend}
        onCloseSettle={() => ui.setSettleConfirmFriend(null)}
        onConfirmSettle={async () => {
          if (s.settleConfirmFriend)
            await mutations.handleSettle(s.settleConfirmFriend.user.id);
        }}
        groupToDelete={s.groupToDelete}
        onCloseGroupDelete={() => ui.setGroupToDelete(null)}
        onConfirmGroupDelete={async () => {
          if (s.groupToDelete) await mutations.deleteGroup(s.groupToDelete.id);
        }}
      />
    </>
  );
}
