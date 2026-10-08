"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsGroup } from "./settings-group";
import { SettingsRow } from "./settings-row";

import { SECTIONS, type Tab } from "./settings-sections";

type SettingsNavProps = {
  activeTab: Tab;
  highlight: boolean;
  onSelect: (tab: Tab) => void;
  user: { name: string; email: string };
  profileImage: string | null;
  onLogout?: () => void;
};

export function SettingsNav({
  activeTab,
  highlight,
  onSelect,
  user,
  profileImage,
  onLogout,
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

      {onLogout && (
        <SettingsGroup index={2}>
          <SettingsRow
            icon={LogOut}
            tone="expense"
            title="Esci"
            subtitle="Chiudi la sessione su questo dispositivo"
            onClick={onLogout}
          />
        </SettingsGroup>
      )}
    </nav>
  );
}
