import { z } from "zod";
import type { Finding, FindingKind } from "./analyze";

export { buildAiPrompt } from "./advice-prompt";

export const MAX_TIPS = 5;

export const aiAdviceSchema = z.object({
  summary: z.string().trim().min(1).max(220),
  tips: z
    .array(
      z.object({
        findingIndex: z.number().int().min(0),
        title: z.string().trim().min(1).max(60),
        advice: z.string().trim().min(1).max(200),
        actionLabel: z.string().trim().min(1).max(30).catch("Vedi"),
      }),
    )
    .min(1)
    .max(8),
});

export type InsightTip = {
  kind: FindingKind;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  advice: string;
  actionLabel: string;
  monthlySavingEur: number;
  href: string;
};

export type InsightPayload = {
  summary: string;
  totalMonthlySavingEur: number;
  tips: InsightTip[];
};

export function topFindings(findings: Finding[]): Finding[] {
  return findings.slice(0, MAX_TIPS + 1);
}

export function findingHref(f: Finding, categoryName: string | null): string {
  if (f.kind === "budget_over" || f.kind === "budget_pace") {
    return "/settings?tab=budget";
  }
  const q =
    f.kind === "recurring" && typeof f.evidence.search === "string"
      ? f.evidence.search
      : categoryName;
  return q ? `/transactions?q=${encodeURIComponent(q)}` : "/transactions";
}

const ACTION: Record<FindingKind, string> = {
  growth: "Guarda le spese",
  recurring: "Controlla",
  micro: "Guarda le spese",
  budget_over: "Rivedi il budget",
  budget_pace: "Rivedi il budget",
  weekday: "Guarda i movimenti",
  fees: "Guarda i movimenti",
  duplicate: "Controlla",
};

export function fallbackAdvice(
  findings: Finding[],
  names: (id: string | null) => string | null,
  totalMonthlySavingEur: number,
): InsightPayload {
  const tips = findings.slice(0, MAX_TIPS).map((f) => tipFromFinding(f, names));
  const summary =
    tips.length === 0
      ? "Per ora non vedo margini evidenti: le tue spese sono stabili."
      : `Ho trovato ${tips.length} ${tips.length === 1 ? "spunto" : "spunti"} per risparmiare circa ${Math.round(totalMonthlySavingEur)} € al mese.`;
  return { summary, totalMonthlySavingEur, tips };
}

function tipFromFinding(
  f: Finding,
  names: (id: string | null) => string | null,
  override?: Partial<Pick<InsightTip, "title" | "advice" | "actionLabel">>,
): InsightTip {
  const categoryName = names(f.categoryId);
  return {
    kind: f.kind,
    categoryId: f.categoryId,
    categoryName,
    title: override?.title ?? f.title.slice(0, 60),
    advice: override?.advice ?? f.detail.slice(0, 200),
    actionLabel: override?.actionLabel ?? ACTION[f.kind],
    monthlySavingEur: f.monthlySavingEur,
    href: findingHref(f, categoryName),
  };
}

export function mergeAiAdvice(
  ai: z.infer<typeof aiAdviceSchema>,
  findings: Finding[],
  names: (id: string | null) => string | null,
  totalMonthlySavingEur: number,
): InsightPayload | null {
  const used = new Set<number>();
  const tips: InsightTip[] = [];
  for (const t of ai.tips) {
    if (t.findingIndex >= findings.length || used.has(t.findingIndex)) continue;
    used.add(t.findingIndex);
    tips.push(
      tipFromFinding(findings[t.findingIndex], names, {
        title: t.title,
        advice: t.advice,
        actionLabel: t.actionLabel,
      }),
    );
    if (tips.length === MAX_TIPS) break;
  }
  if (tips.length === 0) return null;
  return { summary: ai.summary, totalMonthlySavingEur, tips };
}
