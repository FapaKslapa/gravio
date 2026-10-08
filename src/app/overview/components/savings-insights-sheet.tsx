"use client";

import { PiggyBank } from "lucide-react";
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
import { SavingsInsightView } from "./savings-insight-view";
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
          <SavingsInsightView
            insight={insight}
            refresh={refresh}
            onNavigate={() => onOpenChange(false)}
          />
        ) : null}
      </div>
    </ResponsiveSheet>
  );
}
