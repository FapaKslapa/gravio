import { formatCompact } from "@/app/analytics/components/months";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  NOK: "kr",
  SEK: "kr",
  DKK: "kr",
  CHF: "CHF",
};

export function formatTick(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
  return `${formatCompact(value)} ${symbol}`;
}

export type MonthData = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

export const HEIGHT = 220;
export const PADDING_LEFT = 60;
export const PADDING_RIGHT = 12;
export const PADDING_TOP = 12;
export const PADDING_BOTTOM = 28;

export function generateLinePath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  return pts.reduce(
    (path, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`,
    "",
  );
}

export function generateAreaPath(
  pts: { x: number; y: number }[],
  width: number,
) {
  if (pts.length === 0) return "";
  const linePath = generateLinePath(pts);
  const firstX = pts[0]?.x ?? PADDING_LEFT;
  const lastX = pts[pts.length - 1]?.x ?? width - PADDING_RIGHT;
  const baseY = HEIGHT - PADDING_BOTTOM;
  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}
