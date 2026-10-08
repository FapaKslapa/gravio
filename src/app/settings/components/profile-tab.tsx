"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProfilePhotoGroup } from "./profile-photo-group";
import { SettingsGroup } from "./settings-group";

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

  return (
    <div className="flex flex-col gap-6">
      <ProfilePhotoGroup
        profileName={profileName}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        user={user}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />

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
