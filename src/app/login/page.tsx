"use client";

import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MailCheck,
  Moon,
  Sun,
} from "lucide-react";
import { m } from "motion/react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { fadeUp, springs } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";

type Tab = "login" | "register";

const SAMPLE_CATEGORIES = [
  { name: "Spesa", amount: "182", share: 46, color: "var(--chart-1)" },
  { name: "Trasporti", amount: "96", share: 24, color: "var(--chart-2)" },
  { name: "Svago", amount: "64", share: 16, color: "var(--chart-3)" },
];

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <main className="relative z-10 -mt-8 flex flex-col items-center px-4 pb-10 lg:mt-0 lg:justify-center lg:py-12">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"
          }
          className="absolute top-4 right-4 size-11 rounded-full text-brand-foreground hover:bg-brand-foreground/15 hover:text-brand-foreground lg:text-foreground lg:hover:bg-muted lg:hover:text-foreground"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="elevation-2 mt-0 w-full max-w-md rounded-xl bg-card p-6 text-card-foreground sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {tab === "login" ? "Bentornato" : "Crea il tuo account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tab === "login"
                ? "Inserisci la tua email, ti mandiamo un link per entrare."
                : "Ti serve solo un nome e un'email. Nessuna password."}
            </p>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="mb-6"
          >
            <TabsList className="h-11 w-full rounded-full p-1">
              <TabsTrigger value="login" className="h-full rounded-full">
                Accedi
              </TabsTrigger>
              <TabsTrigger value="register" className="h-full rounded-full">
                Registrati
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "login" ? (
            <LoginForm key="login" />
          ) : (
            <RegisterForm key="register" onSuccess={() => setTab("login")} />
          )}
        </m.div>
      </main>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand px-6 pt-12 pb-16 text-brand-foreground lg:min-h-dvh lg:px-14 lg:py-14">
      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="flex items-center gap-3"
      >
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          priority
          className="rounded-md"
        />
        <span className="font-display text-2xl font-bold tracking-tight">
          Gravio
        </span>
      </m.div>

      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="flex max-w-xl flex-col gap-4"
      >
        <h1 className="font-display text-[clamp(2rem,9vw,3.5rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
          Quanto ti resta, a colpo d&apos;occhio.
        </h1>
        <p className="max-w-md text-base text-brand-foreground/90 text-pretty">
          Registra una spesa in pochi secondi, in qualsiasi valuta, e tieni il
          budget del mese sempre sotto controllo.
        </p>
      </m.div>

      <m.div
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.gentle, delay: 0.25 }}
        className="hidden max-w-sm flex-col gap-5 rounded-xl bg-card p-5 text-card-foreground shadow-[0_24px_60px_-24px_oklch(0.2_0.1_285/0.6)] lg:flex"
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            Ti restano questo mese
          </span>
          <span className="num-display text-5xl font-bold">
            412<span className="text-2xl text-muted-foreground">,50 €</span>
          </span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {SAMPLE_CATEGORIES.map((c) => (
            <span
              key={c.name}
              className="h-full"
              style={{ width: `${c.share}%`, backgroundColor: c.color }}
            />
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {SAMPLE_CATEGORIES.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
              <span className="tabular text-muted-foreground">
                {c.amount} €
              </span>
            </li>
          ))}
        </ul>
      </m.div>
    </aside>
  );
}

function SuccessPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.smooth}
      role="status"
      className="flex flex-col items-center gap-4 py-2 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-income-soft text-income">
        <MailCheck aria-hidden className="size-7" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground text-pretty">{children}</p>
      </div>
      <div className="w-full">{action}</div>
    </m.div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function SubmitButton({
  pending,
  pendingLabel,
  label,
}: {
  pending: boolean;
  pendingLabel: string;
  label: string;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-full text-base font-semibold"
    >
      {pending ? (
        <>
          <Loader2 data-icon="inline-start" className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight data-icon="inline-end" />
        </>
      )}
    </Button>
  );
}

function LoginForm() {
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

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
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
