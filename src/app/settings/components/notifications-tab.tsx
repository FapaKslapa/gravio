"use client";

import {
  Bell,
  CalendarSync,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { SettingsGroup } from "./settings-group";
import { SettingsRow } from "./settings-row";

type NotificationsTabProps = {
  notifyBudget80: boolean;
  setNotifyBudget80: (val: boolean) => void;
  notifyRecurrentApplied: boolean;
  setNotifyRecurrentApplied: (val: boolean) => void;
  notifyFriendActions: boolean;
  setNotifyFriendActions: (val: boolean) => void;
  pushNotificationPermission:
    | NotificationPermission
    | "unsupported"
    | "default";
  onPermissionChange: () => void;
};

export function NotificationsTab({
  notifyBudget80,
  setNotifyBudget80,
  notifyRecurrentApplied,
  setNotifyRecurrentApplied,
  notifyFriendActions,
  setNotifyFriendActions,
  pushNotificationPermission,
  onPermissionChange,
}: NotificationsTabProps) {
  const inApp = [
    {
      id: "notify-budget",
      icon: TrendingUp,
      tone: "warning" as const,
      label: "Avvisi budget",
      description: "Quando raggiungi l'80%, il 100% o il massimo del budget",
      checked: notifyBudget80,
      onChange: setNotifyBudget80,
    },
    {
      id: "notify-recurrent",
      icon: CalendarSync,
      tone: "brand" as const,
      label: "Transazioni ricorrenti",
      description: "Quando una ricorrente viene registrata in automatico",
      checked: notifyRecurrentApplied,
      onChange: setNotifyRecurrentApplied,
    },
    {
      id: "notify-friends",
      icon: Users,
      tone: "income" as const,
      label: "Azioni degli amici",
      description: "Quando un amico aggiunge una spesa condivisa con te",
      checked: notifyFriendActions,
      onChange: setNotifyFriendActions,
    },
  ];

  const handlePush = async (checked: boolean) => {
    if (checked) {
      const permission = await Notification.requestPermission();
      onPermissionChange();
      if (permission === "granted" && "serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("Notifiche Attivate", {
            body: "Riceverai le notifiche push di Gravio direttamente su questo dispositivo.",
            icon: "/icon-192.png",
            badge: "/favicon-32.png",
          });
        });
      }
    } else {
      toast.info("Per disattivarle, gestisci i permessi del sito dal browser.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup title="Nell'app" index={0}>
        {inApp.map((item) => (
          <SettingsRow
            key={item.id}
            htmlFor={item.id}
            icon={item.icon}
            tone={item.tone}
            title={item.label}
            subtitle={item.description}
            trailing={
              <Switch
                id={item.id}
                checked={item.checked}
                onCheckedChange={item.onChange}
              />
            }
          />
        ))}
      </SettingsGroup>

      {pushNotificationPermission !== "unsupported" && (
        <SettingsGroup
          title="Sul dispositivo"
          description={
            pushNotificationPermission === "denied"
              ? "Le notifiche sono bloccate: abilitale dai permessi del sito nel browser."
              : undefined
          }
          index={1}
        >
          <SettingsRow
            htmlFor="notify-push"
            icon={pushNotificationPermission === "granted" ? Bell : Smartphone}
            tone="brand"
            title="Notifiche push"
            subtitle={
              pushNotificationPermission === "granted"
                ? "Attive su questo dispositivo"
                : "Ricevi avvisi anche ad app chiusa"
            }
            trailing={
              <Switch
                id="notify-push"
                checked={pushNotificationPermission === "granted"}
                disabled={pushNotificationPermission === "denied"}
                onCheckedChange={handlePush}
              />
            }
          />
        </SettingsGroup>
      )}
    </div>
  );
}
