"use client";

import { Camera, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SettingsGroup } from "./settings-ui";

type ProfileTabProps = {
  profileName: string;
  setProfileName: (val: string) => void;
  profileImage: string | null;
  setProfileImage: (val: string | null) => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
};

export function ProfileTab({
  profileName,
  setProfileName,
  profileImage,
  setProfileImage,
  user,
  fileInputRef,
  handleFileChange,
  handleLogout,
}: ProfileTabProps) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const initial = (profileName || user.name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup title="Foto profilo" index={0}>
        <div className="flex items-center gap-4 p-4">
          <button
            type="button"
            aria-label="Cambia foto profilo"
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Avatar className="size-20">
              {profileImage && (
                <AvatarImage src={profileImage} alt={profileName} />
              )}
              <AvatarFallback className="bg-brand-soft font-display text-2xl font-bold text-brand">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span
              aria-hidden
              className="elevation-1 absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground"
            >
              <Camera className="size-4" />
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-label="Carica immagine profilo"
          />
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className="truncate text-base font-semibold">
              {profileName || user.name}
            </p>
            <p className="max-w-full truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            {profileImage && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setProfileImage(null)}
                className="-ml-2 h-11 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" />
                Rimuovi foto
              </Button>
            )}
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Dati personali" index={1}>
        <div className="p-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name">Nome</FieldLabel>
              <Input
                id="profile-name"
                type="text"
                placeholder="Il tuo nome"
                autoComplete="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="h-11 rounded-md text-base md:text-sm"
              />
            </Field>
            <Field data-disabled>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                readOnly
                className="h-11 rounded-md text-base md:text-sm"
              />
            </Field>
          </FieldGroup>
        </div>
      </SettingsGroup>

      <SettingsGroup index={2}>
        <div className="p-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmLogout(true)}
            className="h-12 w-full justify-start gap-3 px-2 text-destructive hover:bg-expense-soft hover:text-destructive"
          >
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-sm bg-expense-soft"
            >
              <LogOut className="size-[18px]" />
            </span>
            <span className="font-semibold">Disconnetti account</span>
          </Button>
        </div>
      </SettingsGroup>

      <ConfirmationDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Disconnettere l'account?"
        message="Dovrai accedere di nuovo con un Magic Link."
        confirmLabel="Disconnetti"
      />
    </div>
  );
}
