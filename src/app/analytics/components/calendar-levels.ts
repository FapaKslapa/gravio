export const WEEKDAYS = [
  { key: "mon", label: "L" },
  { key: "tue", label: "M" },
  { key: "wed", label: "M" },
  { key: "thu", label: "G" },
  { key: "fri", label: "V" },
  { key: "sat", label: "S" },
  { key: "sun", label: "D" },
];

export const LEVELS = [
  "color-mix(in oklab, var(--brand) 14%, transparent)",
  "color-mix(in oklab, var(--brand) 30%, transparent)",
  "color-mix(in oklab, var(--brand) 55%, transparent)",
  "var(--brand)",
];

export function levelFor(amount: number, max: number): number {
  if (amount <= 0) return -1;
  const ratio = amount / max;
  if (ratio > 0.75) return 3;
  if (ratio > 0.5) return 2;
  if (ratio > 0.25) return 1;
  return 0;
}
