"use client";

import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatCompact } from "@/app/analytics/components/months";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatCurrency } from "@/lib/utils";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  NOK: "kr",
  SEK: "kr",
  DKK: "kr",
  CHF: "CHF",
};

function formatTick(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
  return `${formatCompact(value)} ${symbol}`;
}

type MonthData = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

const HEIGHT = 220;
const PADDING_LEFT = 60;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function generateLinePath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  return pts.reduce(
    (path, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`,
    "",
  );
}

function generateAreaPath(pts: { x: number; y: number }[], width: number) {
  if (pts.length === 0) return "";
  const linePath = generateLinePath(pts);
  const firstX = pts[0]?.x ?? PADDING_LEFT;
  const lastX = pts[pts.length - 1]?.x ?? width - PADDING_RIGHT;
  const baseY = HEIGHT - PADDING_BOTTOM;
  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const mounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const findClosest = (clientX: number, rect: DOMRect): number | null => {
    const mouseX = ((clientX - rect.left) / rect.width) * width;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < incomePoints.length; i++) {
      const diff = Math.abs(incomePoints[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return minDiff < 30 ? closestIdx : null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = findClosest(e.clientX, e.currentTarget.getBoundingClientRect());
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: e.clientX, y: e.clientY } : null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    const idx = findClosest(
      touch.clientX,
      e.currentTarget.getBoundingClientRect(),
    );
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: touch.clientX, y: touch.clientY } : null);
  };

  const handleLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

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

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + ratio * chartHeight;
          const val = maxVal * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
                className="text-border"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                className="fill-muted-foreground tabular"
              >
                {formatTick(val, displayCurrency)}
              </text>
            </g>
          );
        })}

        <path
          d={generateAreaPath(incomePoints, width)}
          fill="url(#incomeGrad)"
          stroke="none"
        />
        <path
          d={generateAreaPath(expensePoints, width)}
          fill="url(#expenseGrad)"
          stroke="none"
        />

        <path
          d={generateLinePath(incomePoints)}
          fill="none"
          stroke="var(--income)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={generateLinePath(expensePoints)}
          fill="none"
          stroke="var(--expense)"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {incomePoints.map((p, idx) => (
          <g key={`inc-dot-${months[idx].label}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === idx ? 5 : 3}
              fill="var(--income)"
              stroke="var(--card)"
              strokeWidth={hoveredIndex === idx ? 3 : 1.5}
              className="transition-[r,stroke-width] duration-150"
            />
          </g>
        ))}

        {expensePoints.map((p, idx) => (
          <g key={`exp-dot-${months[idx].label}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === idx ? 5 : 3}
              fill="var(--expense)"
              stroke="var(--card)"
              strokeWidth={hoveredIndex === idx ? 3 : 1.5}
              className="transition-[r,stroke-width] duration-150"
            />
          </g>
        ))}

        {months.map((m, index) => {
          const x = paddingLeft + (index * chartWidth) / (months.length - 1);
          const skip = index % labelStep !== 0;
          if (skip) return null;
          return (
            <text
              key={m.label}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {m.label}
            </text>
          );
        })}
      </svg>

      {mounted &&
        hoveredIndex !== null &&
        tooltipPos &&
        months[hoveredIndex] &&
        createPortal(
          <div
            className="elevation-2 pointer-events-none fixed z-[9999] flex min-w-44 flex-col gap-1.5 rounded-md bg-popover px-3 py-2.5 text-xs text-popover-foreground"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <span className="font-semibold capitalize">
              {dayjs()
                .subtract(11 - hoveredIndex, "month")
                .format("MMMM YYYY")}
            </span>
            <div className="tabular flex items-center justify-between gap-4 text-income">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="size-3.5" aria-hidden="true" />
                Entrate
              </span>
              <span className="font-semibold">
                {formatCurrency(months[hoveredIndex].income, displayCurrency)}
              </span>
            </div>
            <div className="tabular flex items-center justify-between gap-4 text-expense">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                Spese
              </span>
              <span className="font-semibold">
                {formatCurrency(months[hoveredIndex].expense, displayCurrency)}
              </span>
            </div>
            <div className="tabular flex items-center justify-between gap-4 border-t pt-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3.5" aria-hidden="true" />
                Risparmio
              </span>
              <span
                className={
                  months[hoveredIndex].savings >= 0
                    ? "font-semibold text-income"
                    : "font-semibold text-expense"
                }
              >
                {formatCurrency(months[hoveredIndex].savings, displayCurrency)}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
