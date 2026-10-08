import {
  AlertTriangle,
  CheckCircle2,
  OctagonAlert,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Counter } from "./counter";

type StatusProps = {
  hasBudget: boolean;
  isOverMax: boolean;
  isOverTarget: boolean;
  onOpenSettings: () => void;
};

function statusOf(isOverMax: boolean, isOverTarget: boolean) {
  if (isOverMax) return { label: "Oltre budget", Icon: OctagonAlert };
  if (isOverTarget) return { label: "Attenzione", Icon: AlertTriangle };
  return { label: "In linea", Icon: CheckCircle2 };
}

export function BudgetCardHeader({
  hasBudget,
  isOverMax,
  isOverTarget,
  onOpenSettings,
}: StatusProps) {
  const status = statusOf(isOverMax, isOverTarget);
  return (
    <div className="flex items-center justify-between gap-3">
      {hasBudget ? (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-foreground/15 px-3.5 text-sm font-semibold">
          <status.Icon className="size-4" aria-hidden="true" />
          {status.label}
        </span>
      ) : (
        <span className="text-sm font-semibold">Budget del mese</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-11 rounded-full text-brand-foreground hover:bg-brand-foreground/15 hover:text-brand-foreground"
        onClick={onOpenSettings}
        aria-label="Imposta budget"
      >
        <Settings2 />
      </Button>
    </div>
  );
}

type HeadlineProps = {
  hasBudget: boolean;
  isOverMax: boolean;
  totalExpense: number;
  remaining: number;
  daysLeft: number;
  limit: number;
  perDay: number;
  displayCurrency: string;
  onOpenSettings: () => void;
};

export function BudgetHeadline({
  hasBudget,
  isOverMax,
  totalExpense,
  remaining,
  daysLeft,
  limit,
  perDay,
  displayCurrency,
  onOpenSettings,
}: HeadlineProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-balance text-[clamp(2.25rem,10.5vw,3.5rem)] leading-[1.02] font-light tracking-[-0.03em] md:text-6xl xl:text-7xl">
        {!hasBudget ? (
          <>
            Questo mese hai speso{" "}
            <Counter value={totalExpense} currency={displayCurrency} />
          </>
        ) : isOverMax ? (
          <>
            Hai sforato di{" "}
            <Counter value={-remaining} currency={displayCurrency} />
          </>
        ) : (
          <>
            Ti restano <Counter value={remaining} currency={displayCurrency} />{" "}
            per <span className="tabular font-bold">{daysLeft}</span>{" "}
            {daysLeft === 1 ? "giorno" : "giorni"}
          </>
        )}
      </h2>
      {!hasBudget ? (
        <div>
          <Button
            className="h-11 rounded-full bg-brand-foreground px-5 text-brand hover:bg-brand-foreground/90"
            onClick={onOpenSettings}
          >
            <Settings2 data-icon="inline-start" />
            Imposta un budget
          </Button>
        </div>
      ) : (
        <p className="tabular text-lg font-medium md:text-xl">
          {isOverMax
            ? `su un limite di ${formatCurrency(limit, displayCurrency)}`
            : `cioè ${formatCurrency(perDay, displayCurrency)} al giorno`}
        </p>
      )}
    </div>
  );
}
