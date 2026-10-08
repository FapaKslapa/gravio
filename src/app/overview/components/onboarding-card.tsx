"use client";

import { BarChart3, Globe, Settings, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";

type OnboardingCardProps = {
  showOnboarding: boolean;
  onDismiss: () => void;
};

export function OnboardingCard({
  showOnboarding,
  onDismiss,
}: OnboardingCardProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {showOnboarding && (
        <m.section
          exit={{ opacity: 0, scale: 0.98 }}
          transition={springs.snappy}
          aria-label="Benvenuto in Gravio"
          className="relative rounded-xl bg-brand-soft p-5 md:p-6"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 size-11 rounded-full"
            onClick={onDismiss}
            aria-label="Chiudi onboarding"
          >
            <X />
          </Button>

          <div className="flex max-w-xl flex-col items-start gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Globe className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">
                Benvenuto in Gravio
              </h2>
              <p className="text-sm text-muted-foreground">
                Tieni traccia delle tue spese in qualsiasi valuta con tassi di
                cambio in tempo reale. Inizia configurando la tua valuta e il
                budget mensile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
                <BarChart3 aria-hidden="true" /> Analytics
              </Badge>
              <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
                <Globe aria-hidden="true" /> Multi-valuta
              </Badge>
              <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
                <ShieldCheck aria-hidden="true" /> Budget
              </Badge>
            </div>
            <Button
              className="h-11 rounded-full px-5"
              onClick={() => router.push("/settings?tab=general")}
            >
              <Settings data-icon="inline-start" />
              Configura ora
            </Button>
          </div>
        </m.section>
      )}
    </AnimatePresence>
  );
}
