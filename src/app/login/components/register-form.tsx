"use client";

import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/lib/trpc/client";
import { SubmitButton } from "./submit-button";
import { SuccessPanel } from "./success-panel";

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const trpc = useTRPC();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => setIsSuccess(true),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    registerMutation.mutate({ name, email });
  };

  if (isSuccess) {
    return (
      <SuccessPanel
        title="Controlla la tua email"
        action={
          <Button
            type="button"
            onClick={onSuccess}
            className="h-12 w-full rounded-full font-semibold"
          >
            Vai al login
          </Button>
        }
      >
        Abbiamo inviato un link di attivazione a{" "}
        <strong className="font-semibold text-foreground">{email}</strong>. Dopo
        l&apos;attivazione potrai accedere con Magic Link.
      </SuccessPanel>
    );
  }

  const error = registerMutation.error?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reg-name">Nome</FieldLabel>
          <Input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Mario Rossi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-md text-base"
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="reg-email">Email</FieldLabel>
          <Input
            id="reg-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            required
            className="h-12 rounded-md text-base"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>

      <SubmitButton
        pending={registerMutation.isPending}
        pendingLabel="Registrazione..."
        label="Crea account"
      />

      <p className="text-center text-xs text-muted-foreground">
        Riceverai un&apos;email di attivazione. Nessuna password.
      </p>
    </form>
  );
}
