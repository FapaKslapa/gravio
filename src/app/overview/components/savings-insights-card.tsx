"use client";

import { ArrowRight, PiggyBank, Sparkles } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import { SavingsInsightsSheet } from "./savings-insights-sheet";
import { tipIcon } from "./tip-icon";
import { useSavingsInsights } from "./use-savings-insights";

export function SavingsInsightsCard() {
  const [open, setOpen] = useState(false);
  const { query, refresh } = useSavingsInsights();
  const insight = query.data?.insight;
  const tips = insight?.payload.tips ?? [];
  const total = insight?.payload.totalMonthlySavingEur ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="size-4" aria-hidden />
            Dove puoi risparmiare
          </CardTitle>
          {insight ? (
            <Badge variant="secondary" className="gap-1">
              {insight.source === "ai" ? <Sparkles aria-hidden /> : null}
              {insight.source === "ai" ? "AI" : "Base"}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {query.isLoading ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : query.isError ? (
            <p className="text-sm text-muted-foreground">
              Non riesco a calcolare i suggerimenti adesso. Riprova tra poco.
            </p>
          ) : query.data?.status === "insufficient" ? (
            <p className="text-sm text-muted-foreground">
              Servono almeno 2 mesi di movimenti per trovare dove risparmiare.
            </p>
          ) : (
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
              {tips.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {insight?.payload.summary}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {tips.slice(0, 2).map((tip) => {
                    const Icon = tipIcon(tip.kind);
                    return (
                      <li
                        key={`${tip.kind}-${tip.title}`}
                        className="flex items-start gap-3"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-tight font-semibold">
                            {tip.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {tip.advice}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  Suggerimenti generati automaticamente
                </p>
                {tips.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 rounded-full px-3 font-semibold"
                    onClick={() => setOpen(true)}
                  >
                    Vedi tutti
                    <ArrowRight />
                  </Button>
                ) : null}
              </div>
            </m.div>
          )}
        </CardContent>
      </Card>
      <SavingsInsightsSheet
        open={open}
        onOpenChange={setOpen}
        query={query}
        refresh={refresh}
      />
    </>
  );
}
