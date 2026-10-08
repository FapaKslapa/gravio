import { ArrowRight, LinkIcon } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VerifyPageProps = {
  searchParams: Promise<{ token?: string; callbackURL?: string }>;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="elevation-2 flex w-full max-w-sm flex-col items-center gap-5 rounded-xl bg-card p-8 text-center text-card-foreground">
        <Image
          src="/logo.png"
          alt="Gravio"
          width={52}
          height={52}
          className="rounded-md"
        />
        {children}
      </div>
    </main>
  );
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const token = params.token;
  const callbackURL = params.callbackURL || "/";

  if (!token) {
    return (
      <Shell>
        <span className="flex size-14 items-center justify-center rounded-full bg-expense-soft text-destructive">
          <LinkIcon aria-hidden className="size-7" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-xl font-bold">
            Link non valido o scaduto
          </h1>
          <p className="text-sm text-muted-foreground">
            Richiedi un nuovo link di accesso dalla pagina di login.
          </p>
        </div>
        <a
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 w-full rounded-full",
          )}
        >
          Torna al login
        </a>
      </Shell>
    );
  }

  const verifyUrl = `/api/auth/magic-link/verify?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`;

  return (
    <Shell>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-xl font-bold">Quasi fatto</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Conferma per completare l&apos;accesso a Gravio.
        </p>
      </div>
      <a
        href={verifyUrl}
        className={cn(
          buttonVariants(),
          "h-12 w-full rounded-full text-base font-semibold",
        )}
      >
        Accedi
        <ArrowRight data-icon="inline-end" />
      </a>
    </Shell>
  );
}
