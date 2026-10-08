"use client";

import { PillSegments } from "./transactions-view-mode-switcher";

export type MobileTab = "list" | "summary";

interface TransactionsMobileTabsProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function TransactionsMobileTabs({
  activeTab,
  onTabChange,
}: TransactionsMobileTabsProps) {
  return (
    <PillSegments
      value={activeTab}
      onChange={onTabChange}
      options={[
        { value: "list", label: "Transazioni" },
        { value: "summary", label: "Riepilogo" },
      ]}
      layoutId="transactions-mobile-pill"
      label="Sezione"
      className="xl:hidden md:max-w-md"
    />
  );
}
