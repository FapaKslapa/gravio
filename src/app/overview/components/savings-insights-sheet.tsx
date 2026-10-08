"use client";

import {
  ArrowRight,
  CalendarClock,
  Coffee,
  CopyCheck,
  Landmark,
  Loader2,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { FindingKind } from "@/lib/insights/analyze";
import { fadeUp } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";

const ICONS: Record<FindingKind, typeof PiggyBank> = {
  growth: TrendingUp,
  recurring: CalendarClock,
  micro: Coffee,
  budget_over: Target,
  budget_pace: Target,
  weekday: Zap,
  fees: Landmark,
  duplicate: CopyCheck,
};

export function tipIcon(kind: FindingKind) {
  return ICONS[kind] ?? PiggyBank;
}

import type { SavingsInsights } from "./use-savings-insights";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: SavingsInsights["query"];
  refresh: SavingsInsights["refresh"];
};

export function SavingsInsightsSheet({
  open,
  onOpenChange,
  query,
  refresh,
}: Props) {
  const insight = query.data?.insight;
  const tips = insight?.payload.tips ?? [];
  const isBusy = refresh.isPending;

  const onRefresh = () =>
    refresh.mutate(undefined, {
      onSuccess: (res) => {
        if (res.notice === "quota") {
          toast.message(
            "La quota gratuita dell'AI per oggi e' esaurita: ti mostro i suggerimenti di base.",
          );
        } else if (res.notice === "unavailable") {
          toast.message(
            "L'AI non risponde adesso: ti mostro i suggerimenti di base.",
          );
        }
      },
      onError: (err) => toast.error(err.message),
    });

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Dove puoi risparmiare"
      description="Stime prudenti basate sui tuoi ultimi 6 mesi di spese."
    >
      <div className="flex flex-col gap-4 pb-2">
        {query.isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : query.isError ? (
          <Empty className="border py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PiggyBank />
              </EmptyMedia>
              <EmptyTitle>Non riesco a caricare i suggerimenti</EmptyTitle>
              <EmptyDescription>
                Controlla la connessione e riprova.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full px-4"
              onClick={() => query.refetch()}
            >
              Riprova
            </Button>
          </Empty>
        ) : query.data?.status === "insufficient" ? (
          <Empty className="border py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PiggyBank />
              </EmptyMedia>
              <EmptyTitle>Servono almeno 2 mesi di movimenti</EmptyTitle>
              <EmptyDescription>
                Continua a registrare le spese: appena ci sono abbastanza dati
                trovo dove puoi spendere meno.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : insight ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="tabular num-display text-3xl font-semibold">
                  {formatCurrency(insight.payload.totalMonthlySavingEur, "EUR")}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    / mese
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {insight.payload.summary}
                </p>
              </div>
              <Badge variant="secondary" className="mt-1 gap-1">
                {insight.source === "ai" ? <Sparkles aria-hidden /> : null}
                {insight.source === "ai" ? "AI" : "Base"}
              </Badge>
            </div>

            {insight.payload.tips.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Per ora non ci sono margini evidenti. Ricontrolla tra qualche
                settimana.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tips.map((tip, i) => {
                  const Icon = tipIcon(tip.kind);
                  return (
                    <m.li
                      key={`${tip.kind}-${tip.title}`}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{tip.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {tip.advice}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="tabular text-sm font-semibold text-income">
                          {tip.monthlySavingEur > 0
                            ? `~${formatCurrency(tip.monthlySavingEur, "EUR")} / mese`
                            : "Da controllare"}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="min-h-11 rounded-full px-4"
                        >
                          <Link
                            href={tip.href}
                            onClick={() => onOpenChange(false)}
                          >
                            {tip.actionLabel}
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    </m.li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Suggerimenti generati automaticamente. Le stime sono indicative.
              </p>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 shrink-0 rounded-full px-4"
                onClick={onRefresh}
                disabled={isBusy}
              >
                {isBusy ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <RefreshCw aria-hidden />
                )}
                {isBusy ? "Aggiorno..." : "Aggiorna"}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </ResponsiveSheet>
  );
}
