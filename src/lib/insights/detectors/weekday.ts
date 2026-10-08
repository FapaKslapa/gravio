import type { Finding } from "../insight-types";
import { fmt, round2, sum } from "../insight-utils";
import type { DetectorContext } from "./context";

const WEEKDAYS = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

export function detectWeekday(ctx: DetectorContext): Finding[] {
  const { now, firstM, txs, monthsWithData } = ctx;
  const dayTotals = new Array<number>(7).fill(0);
  const dayCounts = new Array<number>(7).fill(0);
  const start = Date.UTC(Math.floor(firstM / 12), firstM % 12, 1);
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  for (let t = start; t <= todayUtc; t += 86_400_000) {
    dayCounts[new Date(t).getUTCDay()]++;
  }
  for (const t of txs) dayTotals[t.date.getUTCDay()] += t.amountEur;
  if (monthsWithData < 2) return [];
  const perDay = dayTotals.map((v, i) => (dayCounts[i] ? v / dayCounts[i] : 0));
  let peak = 0;
  for (let i = 1; i < 7; i++) if (perDay[i] > perDay[peak]) peak = i;
  const others = perDay.filter((_, i) => i !== peak);
  const othersAvg = sum(others) / others.length;
  const monthlyPeak = dayTotals[peak] / Math.max(monthsWithData, 1);
  if (
    !(othersAvg > 0 && perDay[peak] >= othersAvg * 1.8 && monthlyPeak >= 40)
  ) {
    return [];
  }
  return [
    {
      kind: "weekday",
      categoryId: null,
      title: `Picco di spesa il ${WEEKDAYS[peak]}`,
      detail: `Il ${WEEKDAYS[peak]} spendi in media ${fmt(perDay[peak])} contro ${fmt(othersAvg)} degli altri giorni.`,
      monthlySavingEur: round2(monthlyPeak * 0.1),
      evidence: {
        weekday: WEEKDAYS[peak],
        avgDayEur: round2(perDay[peak]),
        avgOtherDaysEur: round2(othersAvg),
        monthlyEur: round2(monthlyPeak),
      },
    },
  ];
}
