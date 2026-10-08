import type { Finding, InsightTx } from "../insight-types";
import {
  fmt,
  median,
  monthIndex,
  normalizeDescription,
  round2,
} from "../insight-utils";
import type { DetectorContext } from "./context";

export function detectRecurring(ctx: DetectorContext): Finding[] {
  const findings: Finding[] = [];
  const groups = new Map<string, InsightTx[]>();
  for (const t of ctx.txs) {
    const k = normalizeDescription(t.description);
    if (!k) continue;
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  for (const [k, list] of groups) {
    const months = new Set(list.map((t) => monthIndex(t.date)));
    if (list.length < 3 || months.size < 3) continue;
    const med = median(list.map((t) => t.amountEur));
    if (med < 3 || med > 150) continue;
    if (!list.every((t) => Math.abs(t.amountEur - med) / med <= 0.1)) continue;
    const sorted = [...list].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const gaps = sorted
      .slice(1)
      .map(
        (t, i) => (t.date.getTime() - sorted[i].date.getTime()) / 86_400_000,
      );
    const gap = median(gaps);
    if (gap < 24 || gap > 38) continue;
    const label = k.replace(/\b\w/g, (c) => c.toUpperCase());
    const cid = sorted[sorted.length - 1].categoryId;
    findings.push({
      kind: "recurring",
      categoryId: cid,
      title: `Spesa ricorrente: ${label}`,
      detail: `${label} si ripete ogni mese per circa ${fmt(med)}. Vale la pena verificare se lo usi ancora.`,
      monthlySavingEur: round2(med * 0.5),
      evidence: {
        monthlyEur: round2(med),
        occurrences: list.length,
        search: k,
      },
    });
  }
  return findings;
}
