"use client";

import { Bell, type LucideIcon, Palette, Target, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsGroup, SettingsRow, type Tone } from "./settings-ui";

export type Tab = "general" | "budget" | "profile" | "notifications";

export const SECTIONS: Record<
  Tab,
  { title: string; subtitle: string; icon: LucideIcon; tone: Tone }
> = {
  general: {
    title: "Aspetto e valuta",
    subtitle: "Tema, accento, valuta",
    icon: Palette,
    tone: "brand",
  },
  budget: {
    title: "Budget",
    subtitle: "Mensile e per categoria",
    icon: Target,
    tone: "income",
  },
  notifications: {
    title: "Notifiche",
    subtitle: "Avvisi in app e push",
    icon: Bell,
    tone: "warning",
  },
  profile: {
    title: "Profilo",
    subtitle: "Nome, foto, account",
    icon: User,
    tone: "expense",
  },
};

type SettingsNavProps = {
  activeTab: Tab;
  highlight: boolean;
  onSelect: (tab: Tab) => void;
  user: { name: string; email: string };
  profileImage: string | null;
};

export function SettingsNav({
  activeTab,
  highlight,
  onSelect,
  user,
  profileImage,
}: SettingsNavProps) {
  const row = (id: Tab) => (
    <SettingsRow
      key={id}
      icon={SECTIONS[id].icon}
      tone={SECTIONS[id].tone}
      title={SECTIONS[id].title}
      subtitle={SECTIONS[id].subtitle}
      chevron
      selected={highlight && activeTab === id}
      onClick={() => onSelect(id)}
    />
  );

  return (
    <nav aria-label="Sezioni impostazioni" className="flex flex-col gap-6">
      <SettingsGroup index={0}>
        <SettingsRow
          onClick={() => onSelect("profile")}
          selected={highlight && activeTab === "profile"}
          chevron
          className="min-h-20"
          leading={
            <Avatar className="size-12">
              {profileImage && (
                <AvatarImage src={profileImage} alt={user.name} />
              )}
              <AvatarFallback className="bg-brand-soft font-display text-lg font-bold text-brand">
                {(user.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          }
          title={user.name}
          subtitle={user.email}
        />
      </SettingsGroup>

      <SettingsGroup title="Preferenze" index={1}>
        {row("general")}
        {row("budget")}
        {row("notifications")}
      </SettingsGroup>
    </nav>
  );
}
