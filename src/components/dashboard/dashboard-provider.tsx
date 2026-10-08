"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useTheme } from "@/components/theme-provider";
import { useTRPC } from "@/lib/trpc/client";
import { DashboardContext, type DashboardUser } from "./dashboard-context";
import { preferredCurrencyStore } from "./preferred-currency-store";
import { useExchangeRates } from "./use-exchange-rates";
import { useSettingsActions } from "./use-settings-actions";

export type DashboardProviderProps = {
  children: React.ReactNode;
  user: DashboardUser;
};

export function DashboardProvider({ children, user }: DashboardProviderProps) {
  const displayCurrency = useSyncExternalStore(
    preferredCurrencyStore.subscribe,
    preferredCurrencyStore.getSnapshot,
    preferredCurrencyStore.getServerSnapshot,
  );
  const { rates, isRateFetched, exchangeRate, convertCurrency } =
    useExchangeRates();
  const { theme, setTheme, accent, setAccent } = useTheme();

  const trpc = useTRPC();
  const { data: settingsData, refetch: refetchSettings } = useQuery(
    trpc.settings.get.queryOptions(),
  );
  const updateSettingsMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        refetchSettings();
      },
    }),
  );

  const hasProcessed = useRef(false);
  const processDueRecurrentMutation = useMutation(
    trpc.recurrentTransaction.processDue.mutationOptions(),
  );

  useEffect(() => {
    if (isRateFetched && !hasProcessed.current) {
      hasProcessed.current = true;
      processDueRecurrentMutation.mutate({ rates });
    }
  }, [isRateFetched, rates, processDueRecurrentMutation]);

  useEffect(() => {
    if (settingsData) {
      const dbCurrency = settingsData.preferredCurrency;
      preferredCurrencyStore.set(dbCurrency);
      localStorage.setItem("preferred_currency", dbCurrency);
      if (settingsData.themeMode) {
        setTheme(settingsData.themeMode as "light" | "dark");
      }
      if (settingsData.themeAccent) {
        setAccent(settingsData.themeAccent);
      }
    }
  }, [settingsData, setTheme, setAccent]);

  const { changeTheme, changeAccent, persistCurrency, saveSettings } =
    useSettingsActions({
      settingsData,
      displayCurrency,
      theme,
      accent,
      setTheme,
      setAccent,
      updateSettingsMutation,
    });

  const setDisplayCurrency = useCallback(
    async (val: string | ((prev: string) => string)) => {
      const nextVal = typeof val === "function" ? val(displayCurrency) : val;
      preferredCurrencyStore.set(nextVal);
      await persistCurrency(nextVal);
    },
    [displayCurrency, persistCurrency],
  );

  const contextValue = useMemo(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      exchangeRate,
      rates,
      convertCurrency,
      isRateFetched,
      user,
      settings: settingsData || null,
      refetchSettings: () => {
        refetchSettings();
      },
      theme,
      changeTheme,
      accent,
      changeAccent,
      saveSettings,
    }),
    [
      displayCurrency,
      setDisplayCurrency,
      exchangeRate,
      rates,
      convertCurrency,
      isRateFetched,
      user,
      settingsData,
      refetchSettings,
      theme,
      changeTheme,
      accent,
      changeAccent,
      saveSettings,
    ],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}
