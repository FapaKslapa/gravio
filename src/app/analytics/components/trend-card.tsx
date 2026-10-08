"use client";

import { m } from "motion/react";
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
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { formatCompact } from "./months";

export type MonthTrend = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

type Metric = "savings" | "expense" | "income";

const METRICS: { id: Metric; label: string; title: string }[] = [
  { id: "savings", label: "Risparmio", title: "Risparmio mensile" },
  { id: "expense", label: "Spese", title: "Spese mensili" },
  { id: "income", label: "Entrate", title: "Entrate mensili" },
];

type TrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: { payload: MonthTrend }[];
  displayCurrency: string;
};

function TrendTooltip({ active, payload, displayCurrency }: TooltipProps) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  const rows = [
    { label: "Entrate", value: d.income, dot: "bg-income" },
    { label: "Uscite", value: d.expense, dot: "bg-expense" },
    { label: "Risparmio", value: d.savings, dot: "bg-brand" },
  ];
  return (
    <div
      role="status"
      className="elevation-2 flex min-w-40 flex-col gap-1.5 rounded-md bg-popover p-3 text-popover-foreground"
    >
      <span className="text-xs font-semibold">{d.label}</span>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className={cn("size-2 rounded-full", r.dot)} aria-hidden />
            {r.label}
          </span>
          <span className="font-semibold tabular">
            {formatCurrency(r.value, displayCurrency)}
          </span>
        </div>
      ))}
    </div>
  );
}

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

        <div
          role="tablist"
          aria-label="Metrica del trend"
          className="flex w-full rounded-full bg-muted p-1 sm:w-fit"
        >
          {METRICS.map((x) => {
            const selected = x.id === metric;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMetric(x.id)}
                className={cn(
                  "relative h-11 flex-1 rounded-full px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:flex-none",
                  selected
                    ? "text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected && (
                  <m.span
                    layoutId="trend-metric-pill"
                    transition={springs.snappy}
                    className="absolute inset-0 rounded-full bg-brand"
                  />
                )}
                <span className="relative">{x.label}</span>
              </button>
            );
          })}
        </div>
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
