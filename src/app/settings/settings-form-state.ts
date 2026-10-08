export type SettingsFormState = {
  preferredCurrency: string;
  targetBudget: string;
  maxBudget: string;
  notifyBudget80: boolean;
  notifyRecurrentApplied: boolean;
  notifyFriendActions: boolean;
  profileName: string;
  profileImage: string | null;
  catBudgets: Record<string, string>;
  isSaving: boolean;
};

export type SettingsFormAction =
  | { type: "SET_FIELD"; field: keyof SettingsFormState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<SettingsFormState> };

export function settingsFormReducer(
  state: SettingsFormState,
  action: SettingsFormAction,
): SettingsFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}
