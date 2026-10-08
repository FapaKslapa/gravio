export type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

export type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: { id: string; name: string; email: string }[];
};

export type UIState = {
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
  | { type: "SET_FIELD"; field: keyof UIState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

export const initialUIState: UIState = {
  activeMobileTab: "friends",
  isAddFriendOpen: false,
  isSharedExpenseOpen: false,
  isCreateGroupOpen: false,
  selectedFriend: null,
  selectedGroup: null,
  friendToDelete: null,
  settleConfirmFriend: null,
  groupToDelete: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}
