"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = ["Dettagli", "Divisione", "Riepilogo"] as const;

type Props = {
  step: "form" | "split" | "summary";
  onBack: () => void;
};

export function StepHeader({ step, onBack }: Props) {
  const index = step === "form" ? 0 : step === "split" ? 1 : 2;
  return (
    <div className="flex items-center gap-3">
      {index > 0 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          aria-label="Torna al passo precedente"
          className="size-11 shrink-0 rounded-full"
        >
          <ArrowLeft />
        </Button>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Passo {index + 1} di {STEPS.length}
          <span className="text-foreground"> · {STEPS[index]}</span>
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= index ? "bg-brand" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
