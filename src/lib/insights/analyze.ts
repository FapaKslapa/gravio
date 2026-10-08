export type InsightTx = {
  id: string;
  categoryId: string | null;
  /** Always a positive expense amount, already normalised to EUR. */
  amountEur: number;
  date: Date;
  description: string | null;
};

export type InsightBudget = { categoryId: string; amountEur: number };
export type InsightCategory = { id: string; name: string };

export type FindingKind =
  | "growth"
  | "recurring"
  | "micro"
  | "budget_over"
  | "budget_pace"
  | "weekday"
  | "fees"
  | "duplicate";

export type Finding = {
  kind: FindingKind;
  categoryId: string | null;
  title: string;
  detail: string;
  monthlySavingEur: number;
  evidence: Record<string, number | string>;
};

export type Analysis = {
  findings: Finding[];
  monthsWithData: number;
  avgMonthlyExpenseEur: number;
  totalMonthlySavingEur: number;
};

const WEEKDAYS = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

const FEE_RE =
  /commission|canone|spese (di )?(tenuta|gestione|conto)|\bfee\b|\bfees\b|interessi passivi|bollo|imposta di bollo|costo (prelievo|operazione)/i;

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => `${Math.round(n).toLocaleString("it-IT")} €`;

const monthIndex = (d: Date) => d.getUTCFullYear() * 12 + d.getUTCMonth();
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function normalizeDescription(raw: string | null): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[0-9]+/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 4)
    .join(" ");
}

/** ISO week key such as 2026-W41 (UTC). */
export function isoWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function analyzeSpending(input: {
  transactions: InsightTx[];
  budgets: InsightBudget[];
  categories: InsightCategory[];
  now?: Date;
}): Analysis {
  const now = input.now ?? new Date();
  const curM = monthIndex(now);
  const firstM = curM - 5;
  const catName = new Map(input.categories.map((c) => [c.id, c.name]));
  const nameOf = (id: string | null) =>
    (id && catName.get(id)) || "Senza categoria";

  const txs = input.transactions.filter(
    (t) =>
      t.amountEur > 0 &&
      monthIndex(t.date) >= firstM &&
      monthIndex(t.date) <= curM &&
      t.date.getTime() <= now.getTime() + 86_400_000,
  );

  const byMonth = new Map<number, number>();
  for (const t of txs) {
    const m = monthIndex(t.date);
    byMonth.set(m, (byMonth.get(m) ?? 0) + t.amountEur);
  }
  const monthsWithData = byMonth.size;
  const completeMonths = [...byMonth.keys()].filter((m) => m < curM);
  const avgMonthlyExpenseEur =
    completeMonths.length > 0
      ? sum(completeMonths.map((m) => byMonth.get(m) ?? 0)) /
        completeMonths.length
      : (byMonth.get(curM) ?? 0);

  const findings: Finding[] = [];
  const lastM = curM - 1;

  // category x month totals
  const catMonth = new Map<string, Map<number, number>>();
  for (const t of txs) {
    const key = t.categoryId ?? "__none";
    const mm = catMonth.get(key) ?? new Map<number, number>();
    mm.set(monthIndex(t.date), (mm.get(monthIndex(t.date)) ?? 0) + t.amountEur);
    catMonth.set(key, mm);
  }
  const idOf = (key: string) => (key === "__none" ? null : key);

  // 1. growth vs previous 3 complete months
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

  // 2. recurring payments / subscriptions
  const groups = new Map<string, InsightTx[]>();
  for (const t of txs) {
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

  // 3. frequent micro-spending
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

  // 4. budget over / pace
  const dim = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const frac = now.getUTCDate() / dim;
  for (const b of input.budgets) {
    if (b.amountEur <= 0) continue;
    const mm = catMonth.get(b.categoryId);
    if (!mm) continue;
    const cur = mm.get(curM) ?? 0;
    const last = mm.get(lastM) ?? 0;
    const name = nameOf(b.categoryId);
    if (cur > b.amountEur || last > b.amountEur) {
      const spent = cur > b.amountEur ? cur : last;
      const over = spent - b.amountEur;
      findings.push({
        kind: "budget_over",
        categoryId: b.categoryId,
        title: `Budget ${name} superato`,
        detail: `${cur > b.amountEur ? "Questo mese" : "Il mese scorso"} hai speso ${fmt(spent)} contro un budget di ${fmt(b.amountEur)} (${fmt(over)} oltre).`,
        monthlySavingEur: round2(Math.min(over, spent * 0.3)),
        evidence: {
          spentEur: round2(spent),
          budgetEur: round2(b.amountEur),
          overEur: round2(over),
        },
      });
    } else if (frac >= 0.2 && frac < 1) {
      const projected = cur / frac;
      if (projected > b.amountEur * 1.1) {
        findings.push({
          kind: "budget_pace",
          categoryId: b.categoryId,
          title: `${name}: ritmo sopra il budget`,
          detail: `Finora ${fmt(cur)} su ${fmt(b.amountEur)}: di questo passo chiuderai il mese intorno a ${fmt(projected)}.`,
          monthlySavingEur: round2(
            Math.min(projected - b.amountEur, projected * 0.2),
          ),
          evidence: {
            spentEur: round2(cur),
            budgetEur: round2(b.amountEur),
            projectedEur: round2(projected),
          },
        });
      }
    }
  }

  // 5. weekday peaks
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
  if (monthsWithData >= 2) {
    const perDay = dayTotals.map((v, i) =>
      dayCounts[i] ? v / dayCounts[i] : 0,
    );
    let peak = 0;
    for (let i = 1; i < 7; i++) if (perDay[i] > perDay[peak]) peak = i;
    const others = perDay.filter((_, i) => i !== peak);
    const othersAvg = sum(others) / others.length;
    const monthlyPeak = dayTotals[peak] / Math.max(monthsWithData, 1);
    if (othersAvg > 0 && perDay[peak] >= othersAvg * 1.8 && monthlyPeak >= 40) {
      findings.push({
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
      });
    }
  }

  // 6. fees and suspicious duplicates
  const fees = txs.filter((t) => t.description && FEE_RE.test(t.description));
  if (fees.length >= 2) {
    const total = sum(fees.map((t) => t.amountEur));
    const monthly = total / Math.max(monthsWithData, 1);
    if (monthly >= 2) {
      findings.push({
        kind: "fees",
        categoryId: null,
        title: "Commissioni e canoni bancari",
        detail: `${fees.length} voci tra commissioni e canoni per ${fmt(total)} negli ultimi mesi: confronta le condizioni del tuo conto.`,
        monthlySavingEur: round2(monthly * 0.5),
        evidence: { occurrences: fees.length, totalEur: round2(total) },
      });
    }
  }
  const seen = new Map<string, InsightTx>();
  const dups: InsightTx[] = [];
  for (const t of txs) {
    const k = normalizeDescription(t.description);
    if (!k || t.amountEur < 5) continue;
    const day = Math.floor(t.date.getTime() / 86_400_000);
    const key = `${k}|${t.amountEur.toFixed(2)}|${day}|${t.categoryId ?? ""}`;
    if (seen.has(key)) dups.push(t);
    else seen.set(key, t);
  }
  if (dups.length > 0) {
    const total = sum(dups.map((t) => t.amountEur));
    findings.push({
      kind: "duplicate",
      categoryId: null,
      title: "Possibili spese duplicate",
      detail: `${dups.length} movimenti identici nello stesso giorno (${fmt(total)}). Se sono doppioni puoi eliminarli per correggere il saldo.`,
      monthlySavingEur: 0,
      evidence: { count: dups.length, totalEur: round2(total) },
    });
  }

  findings.sort((a, b) => b.monthlySavingEur - a.monthlySavingEur);

  // Prudent total: best estimate per category, capped to 25% of monthly spend.
  const bestPerKey = new Map<string, number>();
  for (const f of findings) {
    const key = f.categoryId ?? `${f.kind}:${f.title}`;
    bestPerKey.set(key, Math.max(bestPerKey.get(key) ?? 0, f.monthlySavingEur));
  }
  const rawTotal = sum([...bestPerKey.values()]);
  const cap = avgMonthlyExpenseEur * 0.25;
  const totalMonthlySavingEur = round2(
    cap > 0 ? Math.min(rawTotal, cap) : rawTotal,
  );

  return {
    findings,
    monthsWithData,
    avgMonthlyExpenseEur: round2(avgMonthlyExpenseEur),
    totalMonthlySavingEur,
  };
}
