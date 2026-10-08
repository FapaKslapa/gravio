"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./shared-expense/member-avatar";

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
  const [name, setName] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const trpc = useTRPC();
  const createGroupMutation = useMutation(
    trpc.group.create.mutationOptions({
      onSuccess: () => {
        onSuccess();
        reset();
        onClose();
      },
    }),
  );

  const reset = () => {
    setName("");
    setSelectedIds([]);
    setAttempted(false);
  };

  const toggle = (friendId: string) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const nameInvalid = !name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (nameInvalid) return;
    createGroupMutation.mutate({
      name: name.trim(),
      memberUserIds: selectedIds,
    });
  };

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
              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {friends.map((friend) => {
                  const checked = selectedSet.has(friend.user.id);
                  const id = `member-${friend.user.id}`;
                  return (
                    <li
                      key={friend.user.id}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                        checked ? "border-brand/40 bg-brand-soft" : "bg-card",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() => toggle(friend.user.id)}
                      />
                      <label
                        htmlFor={id}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1"
                      >
                        <MemberAvatar
                          name={friend.user.name}
                          image={friend.user.image}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">
                            {friend.user.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {friend.user.email}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
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
          <Button
            type="submit"
            disabled={createGroupMutation.isPending}
            className="h-12 flex-[2]"
          >
            {createGroupMutation.isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : null}
            {createGroupMutation.isPending ? "Creazione..." : "Crea gruppo"}
          </Button>
        </div>
      </form>
    </ResponsiveSheet>
  );
}
