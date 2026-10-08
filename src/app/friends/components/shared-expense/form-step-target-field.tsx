"use client";

import { Info } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormState, Friend, Group } from "./types";

type TargetFieldProps = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  friends: Friend[];
  groups: Group[];
  attempted: boolean;
  targetInvalid: boolean;
};

export function TargetField({
  state,
  set,
  friends,
  groups,
  attempted,
  targetInvalid,
}: TargetFieldProps) {
  return (
    <Field data-invalid={attempted && targetInvalid}>
      <FieldLabel htmlFor="shared-target">
        {state.shareType === "friend" ? "Amico" : "Gruppo"}
      </FieldLabel>
      {state.shareType === "friend" ? (
        <Select
          value={state.friendId}
          onValueChange={(v) => set({ friendId: v })}
        >
          <SelectTrigger
            id="shared-target"
            aria-invalid={attempted && targetInvalid}
            className="h-11 w-full"
          >
            <SelectValue placeholder="Seleziona un amico" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {friends.map((f) => (
                <SelectItem key={f.user.id} value={f.user.id}>
                  {f.user.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={state.groupId}
          onValueChange={(v) => set({ groupId: v })}
        >
          <SelectTrigger
            id="shared-target"
            aria-invalid={attempted && targetInvalid}
            className="h-11 w-full"
          >
            <SelectValue placeholder="Seleziona un gruppo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {attempted && targetInvalid ? (
        <FieldError>
          {state.shareType === "friend"
            ? "Scegli con quale amico dividere."
            : "Scegli il gruppo con cui dividere."}
        </FieldError>
      ) : null}
      {(state.shareType === "friend" ? friends : groups).length === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5" aria-hidden="true" />
          {state.shareType === "friend"
            ? "Aggiungi prima un amico."
            : "Crea prima un gruppo."}
        </p>
      ) : null}
    </Field>
  );
}
