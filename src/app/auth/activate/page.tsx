"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { m } from "motion/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { useTRPC } from "@/lib/trpc/client";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const hasRun = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const trpc = useTRPC();
  const activateMutation = useMutation(
    trpc.auth.activate.mutationOptions({
      onSuccess: () => setStatus("success"),
      onError: (err) => {
        setStatus("error");
        setErrorMessage(err.message);
      },
    }),
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Link non valido. Registrati di nuovo.");
      return;
    }
    activateMutation.mutate({ token, email });
  }, [token, email, activateMutation.mutate]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.smooth}
        className="elevation-2 flex w-full max-w-sm flex-col items-center gap-5 rounded-xl bg-card p-8 text-center text-card-foreground"
      >
        <Image
          src="/logo.png"
          alt="Gravio"
          width={52}
          height={52}
          className="rounded-md"
        />

        {status === "loading" && (
          <div role="status" className="flex flex-col items-center gap-3 py-2">
            <Loader2 aria-hidden className="size-8 animate-spin text-brand" />
            <p className="text-sm text-muted-foreground">
              Attivazione in corso...
            </p>
          </div>
        )}

        {status === "success" && (
          <div
            role="status"
            className="flex w-full flex-col items-center gap-4"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-income-soft text-income">
              <CheckCircle2 aria-hidden className="size-7" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-xl font-bold">
                Account attivato
              </h1>
              <p className="text-sm text-muted-foreground text-pretty">
                Il tuo account è ora attivo. Accedi inserendo la tua email: ti
                invieremo un Magic Link.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              Vai al login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="flex w-full flex-col items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-expense-soft text-destructive">
              <AlertCircle aria-hidden className="size-7" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-xl font-bold">
                Attivazione fallita
              </h1>
              <p className="text-sm text-muted-foreground text-pretty">
                {errorMessage}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/login")}
              className="h-12 w-full rounded-full"
            >
              Torna alla registrazione
            </Button>
          </div>
        )}
      </m.div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateContent />
    </Suspense>
  );
}
