"use client";

import { useMutation } from "@tanstack/react-query";
import { Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTRPC } from "@/lib/trpc/client";

type AddFriendCardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AddFriendCard({
  open,
  onOpenChange,
  onSuccess,
}: AddFriendCardProps) {
  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const trpc = useTRPC();
  const sendRequestMutation = useMutation(
    trpc.friend.sendRequest.mutationOptions({
      onSuccess: () => {
        onSuccess();
        setEmailInput("");
        setErrorMsg("");
        toast.success("Richiesta inviata con successo!");
        onOpenChange(false);
      },
      onError: (err) => {
        setErrorMsg(err.message || "Impossibile inviare la richiesta.");
      },
    }),
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setErrorMsg("");
    sendRequestMutation.mutate({ email: emailInput.trim() });
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Aggiungi amico"
      description="Invia una richiesta all'email del tuo amico."
    >
      <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
        <Field data-invalid={!!errorMsg}>
          <FieldLabel htmlFor="friend-email">Email dell&apos;amico</FieldLabel>
          <div className="relative">
            <Mail
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="friend-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="email@esempio.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              aria-invalid={!!errorMsg}
              required
              className="h-11 pl-9"
            />
          </div>
          {errorMsg ? (
            <FieldDescription role="alert" className="text-destructive">
              {errorMsg}
            </FieldDescription>
          ) : null}
        </Field>
        <Button
          type="submit"
          disabled={sendRequestMutation.isPending}
          className="h-11 gap-1.5 rounded-full bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
        >
          <UserPlus />
          {sendRequestMutation.isPending ? "Invio..." : "Invia richiesta"}
        </Button>
      </form>
    </ResponsiveSheet>
  );
}
