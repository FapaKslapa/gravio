"use client";

import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ActiveTab = "friends" | "groups";

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingCount: number;
  hidden?: boolean;
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "friends", label: "Amici" },
  { id: "groups", label: "Gruppi" },
];

export function MobileTabBar({
  activeTab,
  onTabChange,
  pendingCount,
  hidden,
}: MobileTabBarProps) {
  if (hidden) return null;

  return (
    <div
      role="tablist"
      aria-label="Amici o gruppi"
      className="flex w-full shrink-0 rounded-full bg-muted p-1"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <m.span
                layoutId="friends-tab-pill"
                transition={springs.snappy}
                className="absolute inset-0 rounded-full bg-card elevation-1"
              />
            )}
            <span className="relative">{tab.label}</span>
            {tab.id === "friends" && pendingCount > 0 && (
              <span
                role="img"
                aria-label={`${pendingCount} richieste pendenti`}
                className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground"
              >
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
