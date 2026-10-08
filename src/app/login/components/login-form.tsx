"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { ErrorAlert } from "./error-alert";
import { SubmitButton } from "./submit-button";
import { SuccessPanel } from "./success-panel";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });
      if (authError) {
        setError(authError.message || "Qualcosa è andato storto. Riprova.");
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore di rete.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SuccessPanel
        title="Controlla la tua email"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
            }}
            className="h-12 w-full rounded-full"
          >
            Usa un&apos;altra email
          </Button>
        }
      >
        Abbiamo inviato un link di accesso a{" "}
        <strong className="font-semibold text-foreground">{email}</strong>.
        Controlla anche la cartella spam.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
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
        </Field>
      </FieldGroup>

      {error && <ErrorAlert message={error} />}

      <SubmitButton
        pending={isLoading}
        pendingLabel="Invio in corso..."
        label="Accedi con Magic Link"
      />

      <p className="text-center text-xs text-muted-foreground">
        Riceverai un link via email. Nessuna password richiesta.
      </p>
    </form>
  );
}
