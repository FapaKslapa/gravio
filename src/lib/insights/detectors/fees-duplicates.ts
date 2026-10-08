import type { Finding, InsightTx } from "../insight-types";
import { fmt, normalizeDescription, round2, sum } from "../insight-utils";
import type { DetectorContext } from "./context";

const FEE_RE =
  /commission|canone|spese (di )?(tenuta|gestione|conto)|\bfee\b|\bfees\b|interessi passivi|bollo|imposta di bollo|costo (prelievo|operazione)/i;

export function detectFees(ctx: DetectorContext): Finding[] {
  const fees = ctx.txs.filter(
    (t) => t.description && FEE_RE.test(t.description),
  );
  if (fees.length < 2) return [];
  const total = sum(fees.map((t) => t.amountEur));
  const monthly = total / Math.max(ctx.monthsWithData, 1);
  if (monthly < 2) return [];
  return [
    {
      kind: "fees",
      categoryId: null,
      title: "Commissioni e canoni bancari",
      detail: `${fees.length} voci tra commissioni e canoni per ${fmt(total)} negli ultimi mesi: confronta le condizioni del tuo conto.`,
      monthlySavingEur: round2(monthly * 0.5),
      evidence: { occurrences: fees.length, totalEur: round2(total) },
    },
  ];
}

export function detectDuplicates(ctx: DetectorContext): Finding[] {
  const seen = new Map<string, InsightTx>();
  const dups: InsightTx[] = [];
  for (const t of ctx.txs) {
    const k = normalizeDescription(t.description);
    if (!k || t.amountEur < 5) continue;
    const day = Math.floor(t.date.getTime() / 86_400_000);
    const key = `${k}|${t.amountEur.toFixed(2)}|${day}|${t.categoryId ?? ""}`;
    if (seen.has(key)) dups.push(t);
    else seen.set(key, t);
  }
  if (dups.length === 0) return [];
  const total = sum(dups.map((t) => t.amountEur));
  return [
    {
      kind: "duplicate",
      categoryId: null,
      title: "Possibili spese duplicate",
      detail: `${dups.length} movimenti identici nello stesso giorno (${fmt(total)}). Se sono doppioni puoi eliminarli per correggere il saldo.`,
      monthlySavingEur: 0,
      evidence: { count: dups.length, totalEur: round2(total) },
    },
  ];
}
