"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { SwipeArea } from "@/components/ui/swipe-area";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { SettingsHeader } from "./components/settings-header";
import { SECTIONS, type Tab } from "./components/settings-sections";
import { SettingsTabContent } from "./components/settings-tab-content";
import { SettingsNav } from "./components/settings-tabs";
import { useSaveSettings } from "./use-save-settings";
import { useSettingsForm } from "./use-settings-form";

const handleLogout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/login";
      },
    },
  });
};

const VALID_TABS: Tab[] = ["general", "budget", "profile", "notifications"];
const SWIPE_ORDER: Tab[] = ["profile", "general", "budget", "notifications"];

export function SettingsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") as Tab | null;
  const { user } = useDashboard();
  const trpc = useTRPC();

  const [activeTab, setActiveTab] = useState<Tab>(
    rawTab && VALID_TABS.includes(rawTab) ? rawTab : "general",
  );
  const [mobileOpen, setMobileOpen] = useState(
    Boolean(rawTab && VALID_TABS.includes(rawTab)),
  );

  const { formState, setField, setCatBudgets } = useSettingsForm();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const handleSave = useSaveSettings(
    formState,
    (val) => setField("isSaving", val),
    categoriesData,
  );

  const handleBack = () => {
    if (mobileOpen && window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen(false);
    } else {
      router.back();
    }
  };

  const swipeIdx = SWIPE_ORDER.indexOf(activeTab);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setMobileOpen(true);
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <SettingsHeader
        title={mobileOpen ? SECTIONS[activeTab].title : "Impostazioni"}
        onBack={handleBack}
        onSave={handleSave}
        isSaving={formState.isSaving}
      />

      <div className="grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start md:gap-8">
        <div className={mobileOpen ? "hidden md:block" : "block"}>
          <SettingsNav
            activeTab={activeTab}
            highlight
            onSelect={selectTab}
            user={user}
            profileImage={formState.profileImage}
            onLogout={handleLogout}
          />
        </div>

        <SwipeArea
          className={mobileOpen ? "block" : "hidden md:block"}
          onPrev={
            swipeIdx > 0
              ? () => setActiveTab(SWIPE_ORDER[swipeIdx - 1])
              : undefined
          }
          onNext={
            swipeIdx < SWIPE_ORDER.length - 1
              ? () => setActiveTab(SWIPE_ORDER[swipeIdx + 1])
              : undefined
          }
          disabled={!mobileOpen}
        >
          <h2 className="mb-4 hidden font-display text-xl font-bold tracking-tight md:block">
            {SECTIONS[activeTab].title}
          </h2>
          <SettingsTabContent
            activeTab={activeTab}
            formState={formState}
            setField={setField}
            setCatBudgets={setCatBudgets}
            categories={categoriesData ?? []}
            isCategoriesLoading={isCategoriesLoading}
            handleLogout={handleLogout}
          />
        </SwipeArea>
      </div>
    </div>
  );
}
