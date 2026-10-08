"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { useUrlActions } from "@/hooks/use-url-actions";
import { FriendsBody } from "./friends-body";
import type { FriendItem } from "./friends-ui-state";
import { useFriendsData } from "./use-friends-data";
import { useFriendsMutations } from "./use-friends-mutations";
import { useFriendsUi } from "./use-friends-ui";

export default function FriendsView() {
  const ui = useFriendsUi();
  const { activeMobileTab, selectedFriend, selectedGroup } = ui.uiState;

  const data = useFriendsData(selectedGroup?.id);
  const { friendsData } = data;
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

  return (
    <FriendsBody
      ui={ui}
      data={data}
      mutations={mutations}
      shownFriend={shownFriend}
    />
  );
}
