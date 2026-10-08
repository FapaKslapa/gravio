"use client";

import { AnimatePresence, m } from "motion/react";
import { useSyncExternalStore } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { springs } from "@/lib/motion";
import type { SettingsFormState } from "../settings-form-state";
import { useProfileImage } from "../use-profile-image";
import { usePushPermission } from "../use-push-permission";
import { BudgetTab } from "./budget-tab";
import { GeneralTab } from "./general-tab";
import { NotificationsTab } from "./notifications-tab";
import { ProfileTab } from "./profile-tab";
import type { Tab } from "./settings-sections";

type SettingsTabContentProps = {
  activeTab: Tab;
  formState: SettingsFormState;
  setField: <K extends keyof SettingsFormState>(
    field: K,
    value: SettingsFormState[K],
  ) => void;
  setCatBudgets: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  categories: { id: string; name: string; icon: string; color: string }[];
  isCategoriesLoading: boolean;
  handleLogout: () => void;
};

export function SettingsTabContent({
  activeTab,
  formState,
  setField,
  setCatBudgets,
  categories,
  isCategoriesLoading,
  handleLogout,
}: SettingsTabContentProps) {
  const {
    displayCurrency,
    theme,
    changeTheme,
    accent,
    changeAccent,
    user,
    exchangeRate,
  } = useDashboard();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { pushNotificationPermission, handlePermissionChange } =
    usePushPermission();
  const { fileInputRef, handleFileChange } = useProfileImage((val) =>
    setField("profileImage", val),
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={activeTab}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={springs.smooth}
      >
        {activeTab === "general" && (
          <GeneralTab
            preferredCurrency={formState.preferredCurrency}
            setPreferredCurrency={(v) => setField("preferredCurrency", v)}
            theme={hydrated ? theme : undefined}
            changeTheme={changeTheme}
            accent={hydrated ? accent : undefined}
            changeAccent={changeAccent}
          />
        )}

        {activeTab === "budget" && (
          <BudgetTab
            targetBudget={formState.targetBudget}
            setTargetBudget={(v) => setField("targetBudget", v)}
            maxBudget={formState.maxBudget}
            setMaxBudget={(v) => setField("maxBudget", v)}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            catBudgets={formState.catBudgets}
            setCatBudgets={setCatBudgets}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            profileName={formState.profileName}
            setProfileName={(v) => setField("profileName", v)}
            profileImage={formState.profileImage}
            setProfileImage={(v) => setField("profileImage", v)}
            user={user}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleLogout={handleLogout}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            notifyBudget80={formState.notifyBudget80}
            setNotifyBudget80={(v) => setField("notifyBudget80", v)}
            notifyRecurrentApplied={formState.notifyRecurrentApplied}
            setNotifyRecurrentApplied={(v) =>
              setField("notifyRecurrentApplied", v)
            }
            notifyFriendActions={formState.notifyFriendActions}
            setNotifyFriendActions={(v) => setField("notifyFriendActions", v)}
            pushNotificationPermission={pushNotificationPermission}
            onPermissionChange={handlePermissionChange}
          />
        )}
      </m.div>
    </AnimatePresence>
  );
}
