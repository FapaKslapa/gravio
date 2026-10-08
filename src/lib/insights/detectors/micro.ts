import type { Finding } from "../insight-types";
import { fmt, monthIndex, round2, sum } from "../insight-utils";
import { type DetectorContext, idOf } from "./context";

export function detectMicro(ctx: DetectorContext): Finding[] {
  const { txs, lastM, nameOf } = ctx;
  const findings: Finding[] = [];
  const microByCatMonth = new Map<string, Map<number, number[]>>();
  for (const t of txs) {
    if (t.amountEur >= 10) continue;
    const key = t.categoryId ?? "__none";
    const mm = microByCatMonth.get(key) ?? new Map<number, number[]>();
    mm.set(monthIndex(t.date), [
      ...(mm.get(monthIndex(t.date)) ?? []),
      t.amountEur,
    ]);
    microByCatMonth.set(key, mm);
  }
  for (const [key, mm] of microByCatMonth) {
    const recent = [lastM, lastM - 1, lastM - 2].filter(
      (m) => (mm.get(m)?.length ?? 0) >= 8,
    );
    if (!recent.includes(lastM)) continue;
    const totals = recent.map((m) => sum(mm.get(m) ?? []));
    const counts = recent.map((m) => mm.get(m)?.length ?? 0);
    const avgTotal = sum(totals) / totals.length;
    const avgCount = sum(counts) / counts.length;
    if (avgTotal < 15) continue;
    const cid = idOf(key);
    findings.push({
      kind: "micro",
      categoryId: cid,
      title: `Piccole spese frequenti in ${nameOf(cid)}`,
      detail: `Circa ${Math.round(avgCount)} spese sotto i 10 € al mese in ${nameOf(cid)}, per ${fmt(avgTotal)} in tutto. Da sole sembrano poco, insieme pesano.`,
      monthlySavingEur: round2(avgTotal * 0.25),
      evidence: {
        monthlyCount: Math.round(avgCount),
        monthlyTotalEur: round2(avgTotal),
      },
    });
  }
  return findings;
}
