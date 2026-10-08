"use client";

import { useIsMounted } from "@/hooks/use-is-mounted";
import { LineChartGrid } from "./line-chart-grid";
import { LineChartSeries } from "./line-chart-series";
import { LineChartTooltip } from "./line-chart-tooltip";
import {
  HEIGHT,
  type MonthData,
  PADDING_BOTTOM,
  PADDING_LEFT,
  PADDING_RIGHT,
  PADDING_TOP,
} from "./line-chart-utils";
import { useChartHover, useChartWidth } from "./use-line-chart";

type AnalyticsLineChartProps = {
  months: MonthData[];
  maxVal: number;
  displayCurrency: string;
};

export function AnalyticsLineChart({
  months,
  maxVal,
  displayCurrency,
}: AnalyticsLineChartProps) {
  const mounted = useIsMounted();
  const { containerRef, width } = useChartWidth();

  const height = HEIGHT;
  const paddingLeft = PADDING_LEFT;
  const paddingRight = PADDING_RIGHT;
  const paddingTop = PADDING_TOP;
  const paddingBottom = PADDING_BOTTOM;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getCoordinates = (val: number, index: number) => {
    const x = paddingLeft + (index * chartWidth) / (months.length - 1);
    const y = height - paddingBottom - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const incomePoints = months.map((m, i) => getCoordinates(m.income, i));
  const expensePoints = months.map((m, i) => getCoordinates(m.expense, i));

  const {
    hoveredIndex,
    tooltipPos,
    handleMouseMove,
    handleTouchMove,
    handleLeave,
  } = useChartHover(
    incomePoints.map((p) => p.x),
    width,
  );

  const labelStep = width < 420 ? 2 : 1;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="block overflow-visible"
        role="img"
        aria-label="Entrate e spese degli ultimi 12 mesi"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleLeave}
      >
        <title>Trend Finanziario</title>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--income)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--income)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--expense)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--expense)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <LineChartGrid
          paddingLeft={paddingLeft}
          paddingRight={paddingRight}
          paddingTop={paddingTop}
          chartHeight={chartHeight}
          width={width}
          maxVal={maxVal}
          displayCurrency={displayCurrency}
        />

        <LineChartSeries
          months={months}
          incomePoints={incomePoints}
          expensePoints={expensePoints}
          width={width}
          height={height}
          paddingLeft={paddingLeft}
          chartWidth={chartWidth}
          labelStep={labelStep}
          hoveredIndex={hoveredIndex}
        />
      </svg>

      {mounted &&
        hoveredIndex !== null &&
        tooltipPos &&
        months[hoveredIndex] && (
          <LineChartTooltip
            month={months[hoveredIndex]}
            index={hoveredIndex}
            pos={tooltipPos}
            displayCurrency={displayCurrency}
          />
        )}
    </div>
  );
}
