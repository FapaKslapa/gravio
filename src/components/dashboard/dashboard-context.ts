import { createContext, use } from "react";

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

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type SaveSettingsInput = {
  targetMonthlyBudget: number;
  maxMonthlyBudget: number;
  preferredCurrency: string;
  themeMode: "light" | "dark";
  themeAccent: string;
  notifyBudget80?: boolean;
  notifyRecurrentApplied?: boolean;
  notifyFriendActions?: boolean;
};

export type DashboardContextType = {
  displayCurrency: string;
  setDisplayCurrency: (val: string | ((prev: string) => string)) => void;
  exchangeRate: number;
  rates: Record<string, number>;
  convertCurrency: (amount: number, from: string, to: string) => number;
  isRateFetched: boolean;
  user: DashboardUser;
  settings: UserSettingsType | null;
  refetchSettings: () => void;
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
  saveSettings: (updates: SaveSettingsInput) => Promise<void>;
};

export const DashboardContext = createContext<DashboardContextType | null>(
  null,
);

export function useDashboard() {
  const context = use(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
