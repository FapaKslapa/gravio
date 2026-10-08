import { ArrowRight } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import { SavingsTipList } from "./savings-tip-list";
import type { SavingsInsights } from "./use-savings-insights";

type Props = {
  query: SavingsInsights["query"];
  onOpenAll: () => void;
};

export function SavingsInsightsBody({ query, onOpenAll }: Props) {
  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Non riesco a calcolare i suggerimenti adesso. Riprova tra poco.
      </p>
    );
  }
  if (query.data?.status === "insufficient") {
    return (
      <p className="text-sm text-muted-foreground">
        Servono almeno 2 mesi di movimenti per trovare dove risparmiare.
      </p>
    );
  }
  const insight = query.data?.insight;
  const tips = insight?.payload.tips ?? [];
  const total = insight?.payload.totalMonthlySavingEur ?? 0;
  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      <div>
        <p className="tabular num-display text-3xl font-semibold">
          {formatCurrency(total, "EUR")}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            / mese
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Risparmio stimato, con margine prudente
        </p>
      </div>
      <SavingsTipList tips={tips} summary={insight?.payload.summary} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Suggerimenti generati automaticamente
        </p>
        {tips.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 rounded-full px-3 font-semibold"
            onClick={onOpenAll}
          >
            Vedi tutti
            <ArrowRight />
          </Button>
        ) : null}
      </div>
    </m.div>
  );
}
