"use client";

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
import { formatCompact } from "./months";
import type { Metric } from "./trend-metrics";
import { type MonthTrend, TrendTooltip } from "./trend-tooltip";

type TrendChartProps = {
  trendData: MonthTrend[];
  metric: Metric;
  displayCurrency: string;
};

export default function TrendChart({
  trendData,
  metric,
  displayCurrency,
}: TrendChartProps) {
  const lastIndex = trendData.length - 1;

  const barClass =
    metric === "income"
      ? "fill-income"
      : metric === "expense"
        ? "fill-expense"
        : "fill-brand";

  return (
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
          <ReferenceLine y={0} className="stroke-border" strokeWidth={1.5} />
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
  );
}
