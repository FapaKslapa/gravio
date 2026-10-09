"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendMetricTabs } from "./trend-metric-tabs";
import { METRICS, type Metric } from "./trend-metrics";
import type { MonthTrend } from "./trend-tooltip";

const TrendChart = dynamic(() => import("./trend-chart"), {
  ssr: false,
});

type TrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: string;
};

export function TrendCard({ trendData, displayCurrency }: TrendCardProps) {
  const [metric, setMetric] = useState<Metric>("savings");
  const active = METRICS.find((x) => x.id === metric) ?? METRICS[0];

  const values = trendData.map((d) => d[metric]);
  const total = values.reduce((s, v) => s + v, 0);
  const average = trendData.length > 0 ? total / trendData.length : 0;

  return (
    <section className="elevation-1 flex flex-col gap-4 rounded-lg bg-card p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold">
            {active.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Ultimi 6 mesi, media{" "}
            <span className="font-semibold text-foreground tabular">
              {formatCurrency(average, displayCurrency)}
            </span>
          </p>
        </div>

        <TrendMetricTabs metric={metric} onChange={setMetric} />
      </div>

      <div data-no-swipe className="h-60 w-full md:h-72">
        <TrendChart
          trendData={trendData}
          metric={metric}
          displayCurrency={displayCurrency}
        />
      </div>

      <div className="sr-only">
        <table>
          <caption>{active.title}, ultimi 6 mesi</caption>
          <thead>
            <tr>
              <th scope="col">Mese</th>
              <th scope="col">Importo</th>
            </tr>
          </thead>
          <tbody>
            {trendData.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{formatCurrency(d[metric], displayCurrency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
