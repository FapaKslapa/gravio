import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import type { SettingsFormState } from "./settings-form-state";

type Category = { id: string };

export function useSaveSettings(
  formState: SettingsFormState,
  setIsSaving: (val: boolean) => void,
  categories: Category[] | undefined,
) {
  const router = useRouter();
  const trpc = useTRPC();
  const {
    displayCurrency,
    convertCurrency,
    theme,
    accent,
    user,
    saveSettings,
    refetchSettings,
  } = useDashboard();
  const updateProfileMutation = useMutation(
    trpc.settings.updateProfile.mutationOptions(),
  );
  const setCategoryBudgetMutation = useMutation(
    trpc.categoryBudget.set.mutationOptions(),
  );

  const toNok = useCallback(
    (displayVal: number): number =>
      convertCurrency(displayVal, displayCurrency, "NOK"),
    [convertCurrency, displayCurrency],
  );

  return async () => {
    const {
      preferredCurrency,
      targetBudget,
      maxBudget,
      notifyBudget80,
      notifyRecurrentApplied,
      notifyFriendActions,
      profileName,
      profileImage,
      catBudgets,
    } = formState;
    setIsSaving(true);
    try {
      await saveSettings({
        targetMonthlyBudget: toNok(parseFloat(targetBudget) || 0),
        maxMonthlyBudget: toNok(parseFloat(maxBudget) || 0),
        preferredCurrency,
        themeMode: theme,
        themeAccent: accent,
        notifyBudget80,
        notifyRecurrentApplied,
        notifyFriendActions,
      });

      if (categories) {
        await Promise.all(
          categories.map((cat) =>
            setCategoryBudgetMutation.mutateAsync({
              categoryId: cat.id,
              amount: toNok(parseFloat(catBudgets[cat.id] || "0") || 0),
            }),
          ),
        );
      }

      if (profileName !== user.name || profileImage !== user.image) {
        await updateProfileMutation.mutateAsync({
          name: profileName,
          image: profileImage,
        });
      }

      refetchSettings();
      toast.success("Impostazioni salvate");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Non è stato possibile salvare le impostazioni. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };
}
