import {
  aiAdviceSchema,
  buildAiPrompt,
  fallbackAdvice,
  mergeAiAdvice,
  topFindings,
} from "@/lib/insights/advice";
import {
  AiParseError,
  AiQuotaError,
  AiTimeoutError,
  AiUnavailableError,
  runModelJson,
} from "@/server/ai";
import type { ComputeResult, Ctx, Notice } from "./cache";
import { analyzeUser } from "./data";

export async function compute(
  ctx: Ctx,
  now: Date,
): Promise<ComputeResult | null> {
  const { analysis, categories } = await analyzeUser(ctx, now);
  if (analysis.monthsWithData < 2) return null;

  const names = new Map(categories.map((c) => [c.id, c.name]));
  const nameOf = (id: string | null) => (id ? (names.get(id) ?? null) : null);
  const selected = topFindings(analysis.findings);
  const fallback = () =>
    fallbackAdvice(analysis.findings, nameOf, analysis.totalMonthlySavingEur);

  if (selected.length === 0) {
    return { payload: fallback(), source: "fallback", notice: null };
  }

  try {
    const raw = await runModelJson({
      messages: buildAiPrompt(selected, nameOf, analysis),
      maxTokens: 700,
      temperature: 0.4,
      timeoutMs: 30_000,
    });
    const parsed = aiAdviceSchema.safeParse(raw);
    const merged = parsed.success
      ? mergeAiAdvice(
          parsed.data,
          selected,
          nameOf,
          analysis.totalMonthlySavingEur,
        )
      : null;
    if (!merged) throw new AiParseError();
    return { payload: merged, source: "ai", notice: null };
  } catch (e) {
    const notice: Notice = e instanceof AiQuotaError ? "quota" : "unavailable";
    if (
      !(
        e instanceof AiQuotaError ||
        e instanceof AiParseError ||
        e instanceof AiTimeoutError ||
        e instanceof AiUnavailableError
      )
    ) {
      console.error("insight ai failure", e);
    }
    return { payload: fallback(), source: "fallback", notice };
  }
}
