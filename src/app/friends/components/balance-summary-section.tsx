"use client";

import { m } from "motion/react";
import { Card } from "@/components/ui/card";
import { fadeUp } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

interface BalanceSummarySectionProps {
  totalYouAreOwed: number;
  totalYouOwe: number;
  netBalance: number;
  displayCurrency: string;
  convertAmount: (val: number) => number;
}

export function BalanceSummarySection({
  totalYouAreOwed,
  totalYouOwe,
  netBalance,
  displayCurrency,
  convertAmount,
}: BalanceSummarySectionProps) {
  const netLabel =
    netBalance > 0.005
      ? "In positivo"
      : netBalance < -0.005
        ? "In negativo"
        : "In pari";

  const stats = [
    {
      label: "Ti devono",
      value: formatCurrency(convertAmount(totalYouAreOwed), displayCurrency),
      color: "text-income",
    },
    {
      label: "Devi dare",
      value: formatCurrency(convertAmount(totalYouOwe), displayCurrency),
      color: "text-expense",
    },
    {
      label: `Netto, ${netLabel.toLowerCase()}`,
      value: formatCurrency(convertAmount(netBalance), displayCurrency),
      color:
        netBalance > 0.005
          ? "text-income"
          : netBalance < -0.005
            ? "text-expense"
            : "text-foreground",
    },
  ];

  return (
    <m.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
      <Card className="grid grid-cols-3 gap-0 p-0 elevation-1">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "flex min-w-0 flex-col gap-1 px-4 py-4",
              i > 0 && "border-l",
            )}
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {stat.label}
            </span>
            <span
              className={cn(
                "num-display truncate text-base font-bold md:text-xl",
                stat.color,
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </Card>
    </m.div>
  );
}
