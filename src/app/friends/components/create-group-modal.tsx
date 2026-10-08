"use client";

import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { CreateGroupMemberList } from "./create-group-member-list";
import { useCreateGroupForm } from "./use-create-group-form";

type FriendUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type FriendItem = {
  friendshipId: string;
  user: FriendUser;
};

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendItem[];
  onSuccess: () => void;
};

export function CreateGroupModal({
  isOpen,
  onClose,
  friends,
  onSuccess,
}: CreateGroupModalProps) {
  const {
    name,
    setName,
    attempted,
    selectedIds,
    selectedSet,
    toggle,
    nameInvalid,
    handleSubmit,
    isPending,
  } = useCreateGroupForm(onSuccess, onClose);

  return (
    <ResponsiveSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Nuovo gruppo"
      description="Dai un nome al gruppo e scegli chi ne fa parte."
      className="sm:max-w-md"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6 pb-2"
      >
        <FieldGroup>
          <Field data-invalid={attempted && nameInvalid}>
            <FieldLabel htmlFor="group-name">Nome del gruppo</FieldLabel>
            <Input
              id="group-name"
              type="text"
              value={name}
              aria-invalid={attempted && nameInvalid}
              placeholder="Es. Convivenza, Vacanza in Norvegia"
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            {attempted && nameInvalid ? (
              <FieldError>Scrivi un nome per il gruppo.</FieldError>
            ) : null}
          </Field>

          <FieldSet>
            <FieldLegend variant="label">Membri</FieldLegend>
            <FieldDescription>
              {selectedIds.length === 0
                ? "Scegli tra i tuoi amici. Puoi aggiungerne altri dopo."
                : `${selectedIds.length} ${selectedIds.length === 1 ? "amico selezionato" : "amici selezionati"}`}
            </FieldDescription>
            {friends.length === 0 ? (
              <Empty className="border border-dashed p-6">
                <UserPlus className="size-6 text-muted-foreground" />
                <EmptyTitle>Nessun amico</EmptyTitle>
                <EmptyDescription>
                  Aggiungi un amico prima di creare un gruppo.
                </EmptyDescription>
              </Empty>
            ) : (
              <CreateGroupMemberList
                friends={friends}
                selectedSet={selectedSet}
                onToggle={toggle}
              />
            )}
          </FieldSet>
        </FieldGroup>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 flex-1"
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isPending} className="h-12 flex-[2]">
            {isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : null}
            {isPending ? "Creazione..." : "Crea gruppo"}
          </Button>
        </div>
      </form>
    </ResponsiveSheet>
  );
}
