import type { Finding } from "../insight-types";
import { fmt, round2, sum } from "../insight-utils";
import { type DetectorContext, idOf } from "./context";

export function detectGrowth(ctx: DetectorContext): Finding[] {
  const { catMonth, byMonth, lastM, nameOf } = ctx;
  const findings: Finding[] = [];
  for (const [key, mm] of catMonth) {
    const last = mm.get(lastM) ?? 0;
    const prev = [lastM - 1, lastM - 2, lastM - 3].map((m) => mm.get(m) ?? 0);
    const monthsInPrev = [lastM - 1, lastM - 2, lastM - 3].filter((m) =>
      byMonth.has(m),
    ).length;
    if (monthsInPrev < 2) continue;
    const avg = sum(prev) / monthsInPrev;
    const delta = last - avg;
    if (avg >= 30 && last >= 40 && delta >= 15 && delta / avg >= 0.25) {
      const cid = idOf(key);
      findings.push({
        kind: "growth",
        categoryId: cid,
        title: `${nameOf(cid)} in aumento`,
        detail: `Il mese scorso hai speso ${fmt(last)} in ${nameOf(cid)}, contro una media di ${fmt(avg)} dei tre mesi prima (+${Math.round((delta / avg) * 100)}%).`,
        monthlySavingEur: round2(Math.min(delta, last * 0.15)),
        evidence: {
          lastMonthEur: round2(last),
          avgPrevEur: round2(avg),
          growthPct: Math.round((delta / avg) * 100),
        },
      });
    }
  }
  return findings;
}
