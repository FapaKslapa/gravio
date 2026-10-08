"use client";

import { useState } from "react";
import { AttentionStack } from "./overview/components/attention-stack";
import { OnboardingCard } from "./overview/components/onboarding-card";
import { OverviewGrid } from "./overview/components/overview-grid";
import { OverviewHeader } from "./overview/components/overview-header";
import { QuickAddForm } from "./overview/components/quick-add-form";
import { useOverviewData } from "./overview/hooks/use-overview-data";

export default function OverviewClient() {
  const data = useOverviewData();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gravio_onboarding_dismissed") !== "true";
    }
    return true;
  });

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("gravio_onboarding_dismissed", "true");
  };

  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader
        userName={data.user.name}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <OnboardingCard
        showOnboarding={showOnboarding}
        onDismiss={handleDismissOnboarding}
      />

      <AttentionStack
        categories={data.categories}
        categoryBudgets={data.categoryBudgets}
        monthTransactions={data.currentMonthTransactions}
        todos={data.todos}
        displayCurrency={data.displayCurrency}
        convertCurrency={data.convertCurrency}
      />

      <OverviewGrid data={data} />

      <QuickAddForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={data.categories}
        recentTransactions={data.transactions}
        onSave={data.handleSaveQuickAdd}
      />
    </div>
  );
}
