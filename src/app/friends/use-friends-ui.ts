"use client";

import { useReducer, useSyncExternalStore } from "react";
import {
  type FriendItem,
  type GroupItem,
  initialUIState,
  type UIState,
  uiReducer,
} from "./friends-ui-state";

export function useFriendsUi() {
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);

  const isXl = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1280px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false,
  );

  const setField = <K extends keyof UIState>(field: K, value: UIState[K]) =>
    dispatch({ type: "SET_FIELD", field, value });

  return {
    uiState,
    isXl,
    setActiveMobileTab: (val: "friends" | "groups") =>
      setField("activeMobileTab", val),
    setIsAddFriendOpen: (val: boolean) => setField("isAddFriendOpen", val),
    setIsSharedExpenseOpen: (val: boolean) =>
      setField("isSharedExpenseOpen", val),
    setIsCreateGroupOpen: (val: boolean) => setField("isCreateGroupOpen", val),
    setSelectedFriend: (val: FriendItem | null) =>
      setField("selectedFriend", val),
    setSelectedGroup: (val: GroupItem | null) => setField("selectedGroup", val),
    setFriendToDelete: (val: FriendItem | null) =>
      setField("friendToDelete", val),
    setSettleConfirmFriend: (val: FriendItem | null) =>
      setField("settleConfirmFriend", val),
    setGroupToDelete: (val: GroupItem | null) => setField("groupToDelete", val),
  };
}
