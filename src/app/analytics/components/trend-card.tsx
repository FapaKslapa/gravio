"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { formatCompact } from "./months";
import { METRICS, type Metric, TrendMetricTabs } from "./trend-metric-tabs";
import { type MonthTrend, TrendTooltip } from "./trend-tooltip";

type TrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: string;
};

export function TrendCard({ trendData, displayCurrency }: TrendCardProps) {
  const [metric, setMetric] = useState<Metric>("savings");
  const active = METRICS.find((x) => x.id === metric) ?? METRICS[0];
  const lastIndex = trendData.length - 1;

  const barClass =
    metric === "income"
      ? "fill-income"
      : metric === "expense"
        ? "fill-expense"
        : "fill-brand";

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

      <div className="h-60 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trendData}
            margin={{ top: 22, right: 4, left: 4, bottom: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 4"
              className="stroke-border"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ className: "fill-muted-foreground", fontSize: 12 }}
            />
            <YAxis
              width={44}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatCompact(v)}
              tick={{ className: "fill-muted-foreground", fontSize: 11 }}
            />
            {metric === "savings" && (
              <ReferenceLine
                y={0}
                className="stroke-border"
                strokeWidth={1.5}
              />
            )}
            <Tooltip
              cursor={{ className: "fill-muted", fillOpacity: 0.6 }}
              content={<TrendTooltip displayCurrency={displayCurrency} />}
            />
            <Bar
              dataKey={metric}
              radius={[8, 8, 8, 8]}
              maxBarSize={44}
              isAnimationActive={false}
            >
              {trendData.map((d, i) => (
                <Cell
                  key={d.label}
                  className={
                    metric === "savings" && d.savings < 0
                      ? "fill-expense"
                      : barClass
                  }
                  fillOpacity={i === lastIndex ? 1 : 0.5}
                />
              ))}
              <LabelList
                dataKey={metric}
                position="top"
                offset={6}
                formatter={(v: unknown) => formatCompact(Number(v))}
                className="fill-foreground tabular"
                fontSize={11}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
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
    </section>
  );
}
