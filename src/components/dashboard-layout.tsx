"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type React from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useTRPC } from "@/lib/trpc/client";
import { BottomNav } from "./shell/bottom-nav";
import { CommandPaletteProvider } from "./shell/command-palette";
import { MobileHeader } from "./shell/mobile-header";
import { Sidebar } from "./shell/sidebar";
import { useTheme } from "./theme-provider";

export type UserSettingsType = {
  targetMonthlyBudget: string;
  maxMonthlyBudget: string;
  preferredCurrency: string;
  themeMode: string;
  themeAccent: string;
  notifyBudget80?: boolean;
  notifyRecurrentApplied?: boolean;
  notifyFriendActions?: boolean;
};

type DashboardContextType = {
  displayCurrency: string;
  setDisplayCurrency: (val: string | ((prev: string) => string)) => void;
  exchangeRate: number;
  rates: Record<string, number>;
  convertCurrency: (amount: number, from: string, to: string) => number;
  isRateFetched: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  settings: UserSettingsType | null;
  refetchSettings: () => void;
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
  saveSettings: (updates: {
    targetMonthlyBudget: number;
    maxMonthlyBudget: number;
    preferredCurrency: string;
    themeMode: "light" | "dark";
    themeAccent: string;
    notifyBudget80?: boolean;
    notifyRecurrentApplied?: boolean;
    notifyFriendActions?: boolean;
  }) => Promise<void>;
};

const preferredCurrencyStore = {
  listeners: new Set<() => void>(),
  subscribe(onStoreChange: () => void) {
    preferredCurrencyStore.listeners.add(onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      preferredCurrencyStore.listeners.delete(onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  },
  getSnapshot() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_currency") || "EUR";
    }
    return "EUR";
  },
  getServerSnapshot() {
    return "EUR";
  },
  set(val: string) {
    localStorage.setItem("preferred_currency", val);
    preferredCurrencyStore.listeners.forEach((listener) => listener());
  },
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = use(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

type DashboardProviderProps = {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

function DashboardProvider({ children, user }: DashboardProviderProps) {
  const displayCurrency = useSyncExternalStore(
    preferredCurrencyStore.subscribe,
    preferredCurrencyStore.getSnapshot,
    preferredCurrencyStore.getServerSnapshot,
  );

  const { data: ratesData } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!res.ok) throw new Error("Failed to fetch rates");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const rates = useMemo(
    () =>
      (ratesData?.rates || { EUR: 1, NOK: 11.85 }) as Record<string, number>,
    [ratesData?.rates],
  );
  const isRateFetched = !!ratesData?.rates;
  const exchangeRate = ratesData?.rates?.NOK ?? 11.85;
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

  const setDisplayCurrency = useCallback(
    async (val: string | ((prev: string) => string)) => {
      const nextVal = typeof val === "function" ? val(displayCurrency) : val;
      preferredCurrencyStore.set(nextVal);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: nextVal,
            themeMode: theme,
            themeAccent: accent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [displayCurrency, settingsData, theme, accent, updateSettingsMutation],
  );

  const changeTheme = useCallback(
    async (newTheme: "light" | "dark") => {
      setTheme(newTheme);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: displayCurrency,
            themeMode: newTheme,
            themeAccent: accent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [settingsData, displayCurrency, accent, updateSettingsMutation, setTheme],
  );

  const changeAccent = useCallback(
    async (newAccent: string) => {
      setAccent(newAccent);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: displayCurrency,
            themeMode: theme,
            themeAccent: newAccent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [settingsData, displayCurrency, theme, updateSettingsMutation, setAccent],
  );

  const saveSettings = useCallback(
    async (updates: {
      targetMonthlyBudget: number;
      maxMonthlyBudget: number;
      preferredCurrency: string;
      themeMode: "light" | "dark";
      themeAccent: string;
      notifyBudget80?: boolean;
      notifyRecurrentApplied?: boolean;
      notifyFriendActions?: boolean;
    }) => {
      await updateSettingsMutation.mutateAsync(updates);
    },
    [updateSettingsMutation],
  );

  const convertCurrency = useCallback(
    (amount: number, from: string, to: string) => {
      if (!rates?.[from] || !rates[to]) return amount;
      const amountInEur = from === "EUR" ? amount : amount / rates[from];
      return to === "EUR" ? amountInEur : amountInEur * rates[to];
    },
    [rates],
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

export function DashboardLayout({ children, user }: DashboardProviderProps) {
  return (
    <DashboardProvider user={user}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { displayCurrency, user } = useDashboard();

  return (
    <CommandPaletteProvider>
      <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <Sidebar currency={displayCurrency} userName={user.name} />
        <MobileHeader currency={displayCurrency} />
        <main className="flex flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top))] pb-28 md:pt-0 md:pb-8 md:pl-[72px] xl:pl-64">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-4 md:px-8 md:py-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </CommandPaletteProvider>
  );
}
