"use client";

import type React from "react";
import { useDashboard } from "./dashboard/dashboard-context";
import {
  DashboardProvider,
  type DashboardProviderProps,
} from "./dashboard/dashboard-provider";
import { BottomNav } from "./shell/bottom-nav";
import { CommandPaletteProvider } from "./shell/command-palette";
import { MobileHeader } from "./shell/mobile-header";
import { Sidebar } from "./shell/sidebar";

export {
  type UserSettingsType,
  useDashboard,
} from "./dashboard/dashboard-context";

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
