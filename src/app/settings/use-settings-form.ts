import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import {
  type SettingsFormAction,
  type SettingsFormState,
  settingsFormReducer,
} from "./settings-form-state";

export function useSettingsForm() {
  const { displayCurrency, convertCurrency, settings, user } = useDashboard();
  const trpc = useTRPC();

  const toDisplayCurrency = useCallback(
    (nokVal: number): number => convertCurrency(nokVal, "NOK", displayCurrency),
    [convertCurrency, displayCurrency],
  );

  const [formState, dispatch] = useReducer(settingsFormReducer, null, () => ({
    preferredCurrency: displayCurrency,
    targetBudget: settings
      ? toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(2)
      : "0.00",
    maxBudget: settings
      ? toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2)
      : "0.00",
    notifyBudget80: settings?.notifyBudget80 ?? true,
    notifyRecurrentApplied: settings?.notifyRecurrentApplied ?? true,
    notifyFriendActions: settings?.notifyFriendActions ?? true,
    profileName: user.name || "",
    profileImage: user.image || null,
    catBudgets: {},
    isSaving: false,
  })) as [SettingsFormState, React.Dispatch<SettingsFormAction>];

  const setField = <K extends keyof SettingsFormState>(
    field: K,
    value: SettingsFormState[K],
  ) => dispatch({ type: "SET_FIELD", field, value });

  const setCatBudgets = (
    val:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) =>
    setField(
      "catBudgets",
      typeof val === "function" ? val(formState.catBudgets) : val,
    );

  const { data: categoryBudgetsData } = useQuery(
    trpc.categoryBudget.list.queryOptions(),
  );

  useEffect(() => {
    if (categoryBudgetsData) {
      const budgetMap: Record<string, string> = {};
      for (const cb of categoryBudgetsData) {
        budgetMap[cb.categoryId] = toDisplayCurrency(
          parseFloat(cb.amount),
        ).toFixed(2);
      }
      dispatch({ type: "SET_FIELD", field: "catBudgets", value: budgetMap });
    }
  }, [categoryBudgetsData, toDisplayCurrency]);

  const [prevSettings, setPrevSettings] = useState<typeof settings | null>(
    null,
  );
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    if (settings) {
      dispatch({
        type: "SET_FIELDS",
        fields: {
          targetBudget: toDisplayCurrency(
            parseFloat(settings.targetMonthlyBudget),
          ).toFixed(2),
          maxBudget: toDisplayCurrency(
            parseFloat(settings.maxMonthlyBudget),
          ).toFixed(2),
          preferredCurrency: settings.preferredCurrency,
          notifyBudget80: settings.notifyBudget80 ?? true,
          notifyRecurrentApplied: settings.notifyRecurrentApplied ?? true,
          notifyFriendActions: settings.notifyFriendActions ?? true,
        },
      });
    }
  }

  const [prevUser, setPrevUser] = useState<typeof user | null>(null);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      dispatch({
        type: "SET_FIELDS",
        fields: {
          profileName: user.name || "",
          profileImage: user.image || null,
        },
      });
    }
  }

  return { formState, setField, setCatBudgets };
}
