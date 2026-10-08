import { useCallback } from "react";
import type { SaveSettingsInput, UserSettingsType } from "./dashboard-context";

type Mutation = {
  mutateAsync: (input: SaveSettingsInput) => Promise<unknown>;
};

type Params = {
  settingsData: UserSettingsType | undefined;
  displayCurrency: string;
  theme: "light" | "dark";
  accent: string;
  setTheme: (theme: "light" | "dark") => void;
  setAccent: (accent: string) => void;
  updateSettingsMutation: Mutation;
};

export function useSettingsActions({
  settingsData,
  displayCurrency,
  theme,
  accent,
  setTheme,
  setAccent,
  updateSettingsMutation,
}: Params) {
  const persist = useCallback(
    async (
      overrides: Pick<
        SaveSettingsInput,
        "preferredCurrency" | "themeMode" | "themeAccent"
      >,
    ) => {
      if (!settingsData) return;
      try {
        await updateSettingsMutation.mutateAsync({
          targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
          maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
          ...overrides,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [settingsData, updateSettingsMutation],
  );

  const changeTheme = useCallback(
    async (newTheme: "light" | "dark") => {
      setTheme(newTheme);
      await persist({
        preferredCurrency: displayCurrency,
        themeMode: newTheme,
        themeAccent: accent,
      });
    },
    [persist, displayCurrency, accent, setTheme],
  );

  const changeAccent = useCallback(
    async (newAccent: string) => {
      setAccent(newAccent);
      await persist({
        preferredCurrency: displayCurrency,
        themeMode: theme,
        themeAccent: newAccent,
      });
    },
    [persist, displayCurrency, theme, setAccent],
  );

  const persistCurrency = useCallback(
    (preferredCurrency: string) =>
      persist({ preferredCurrency, themeMode: theme, themeAccent: accent }),
    [persist, theme, accent],
  );

  const saveSettings = useCallback(
    async (updates: SaveSettingsInput) => {
      await updateSettingsMutation.mutateAsync(updates);
    },
    [updateSettingsMutation],
  );

  return { changeTheme, changeAccent, persistCurrency, saveSettings };
}
