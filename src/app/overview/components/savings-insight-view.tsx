import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SavingsTipsList } from "./savings-tips-list";
import type { SavingsInsights } from "./use-savings-insights";

type Insight = NonNullable<
  NonNullable<SavingsInsights["query"]["data"]>["insight"]
>;

export function SavingsInsightView({
  insight,
  refresh,
  onNavigate,
}: {
  insight: Insight;
  refresh: SavingsInsights["refresh"];
  onNavigate: () => void;
}) {
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
        <SavingsTipsList tips={insight.payload.tips} onNavigate={onNavigate} />
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
  );
}
