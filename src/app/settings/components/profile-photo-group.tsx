import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SettingsGroup } from "./settings-group";

type ProfilePhotoGroupProps = {
  profileName: string;
  profileImage: string | null;
  setProfileImage: (val: string | null) => void;
  user: { name: string; email: string };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProfilePhotoGroup({
  profileName,
  profileImage,
  setProfileImage,
  user,
  fileInputRef,
  handleFileChange,
}: ProfilePhotoGroupProps) {
  const initial = (profileName || user.name || "U").charAt(0).toUpperCase();

  return (
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
  );
}
