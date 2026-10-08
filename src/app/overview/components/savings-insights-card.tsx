"use client";

import { PiggyBank, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsInsightsBody } from "./savings-insights-body";
import { SavingsInsightsSheet } from "./savings-insights-sheet";
import { useSavingsInsights } from "./use-savings-insights";

export function SavingsInsightsCard() {
  const [open, setOpen] = useState(false);
  const { query, refresh } = useSavingsInsights();
  const insight = query.data?.insight;

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
          <SavingsInsightsBody query={query} onOpenAll={() => setOpen(true)} />
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
