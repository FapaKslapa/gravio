import { ArrowRight } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import { tipIcon } from "./tip-icon";
import type { SavingsInsights } from "./use-savings-insights";

type Tips = NonNullable<
  NonNullable<SavingsInsights["query"]["data"]>["insight"]
>["payload"]["tips"];

export function SavingsTipsList({
  tips,
  onNavigate,
}: {
  tips: Tips;
  onNavigate: () => void;
}) {
  return (
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
                <p className="text-sm text-muted-foreground">{tip.advice}</p>
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
                <Link href={tip.href} onClick={onNavigate}>
                  {tip.actionLabel}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </m.li>
        );
      })}
    </ul>
  );
}
