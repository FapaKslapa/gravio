import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull, or } from "drizzle-orm";
import { aiInsight, category, categoryBudget, transaction } from "@/db/schema";
import {
  aiAdviceSchema,
  buildAiPrompt,
  fallbackAdvice,
  type InsightPayload,
  mergeAiAdvice,
  topFindings,
} from "@/lib/insights/advice";
import { analyzeSpending, isoWeekKey } from "@/lib/insights/analyze";
import {
  AiLimitError,
  AiParseError,
  AiQuotaError,
  AiTimeoutError,
  AiUnavailableError,
  consumeAiQuota,
  refundAiQuota,
  runModelJson,
} from "@/server/ai";
import { protectedProcedure, router } from "@/server/trpc";

const KIND = "insight";
const REFRESH_DAILY_LIMIT = 2;
const FALLBACK_NOK_PER_EUR = 11.85;

type Ctx = { db: typeof import("@/db").db; userId: string };
type Notice = "quota" | "unavailable" | null;

function periodStart(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
}

async function compute(
  { db, userId }: Ctx,
  now: Date,
): Promise<{
  payload: InsightPayload;
  source: "ai" | "fallback";
  notice: Notice;
} | null> {
  const [rows, cats, budgets] = await Promise.all([
    db
      .select({
        id: transaction.id,
        categoryId: transaction.categoryId,
        amountEur: transaction.amountEur,
        amountNok: transaction.amountNok,
        date: transaction.date,
        description: transaction.description,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, "expense"),
          gte(transaction.date, periodStart(now)),
        ),
      ),
    db
      .select({ id: category.id, name: category.name })
      .from(category)
      .where(or(eq(category.userId, userId), isNull(category.userId))),
    db
      .select({
        categoryId: categoryBudget.categoryId,
        amount: categoryBudget.amount,
      })
      .from(categoryBudget)
      .where(eq(categoryBudget.userId, userId)),
  ]);

  let eurSum = 0;
  let nokSum = 0;
  const transactions = rows.map((r) => {
    const eur = parseFloat(r.amountEur);
    eurSum += eur;
    nokSum += parseFloat(r.amountNok);
    return {
      id: r.id,
      categoryId: r.categoryId,
      amountEur: eur,
      date: r.date,
      description: r.description,
    };
  });
  const eurPerNok = nokSum > 0 ? eurSum / nokSum : 1 / FALLBACK_NOK_PER_EUR;

  const analysis = analyzeSpending({
    transactions,
    budgets: budgets.map((b) => ({
      categoryId: b.categoryId,
      amountEur: parseFloat(b.amount) * eurPerNok,
    })),
    categories: cats,
    now,
  });
  if (analysis.monthsWithData < 2) return null;

  const names = new Map(cats.map((c) => [c.id, c.name]));
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

function shape(row: {
  payload: string;
  source: string;
  periodKey: string;
  createdAt: Date;
}) {
  return {
    payload: JSON.parse(row.payload) as InsightPayload,
    source: row.source as "ai" | "fallback",
    periodKey: row.periodKey,
    createdAt: row.createdAt,
  };
}

async function readCached(ctx: Ctx, periodKey: string) {
  const [row] = await ctx.db
    .select()
    .from(aiInsight)
    .where(
      and(eq(aiInsight.userId, ctx.userId), eq(aiInsight.periodKey, periodKey)),
    )
    .limit(1);
  return row ?? null;
}

export const insightRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const c: Ctx = { db: ctx.db, userId: ctx.session.user.id };
    const now = new Date();
    const periodKey = isoWeekKey(now);

    const cached = await readCached(c, periodKey);
    if (cached) {
      return {
        status: "ok" as const,
        insight: shape(cached),
        notice: null as Notice,
      };
    }

    const result = await compute(c, now);
    if (!result) {
      return {
        status: "insufficient" as const,
        insight: null,
        notice: null as Notice,
      };
    }
    const createdAt = new Date();
    await ctx.db
      .insert(aiInsight)
      .values({
        id: crypto.randomUUID(),
        userId: c.userId,
        periodKey,
        payload: JSON.stringify(result.payload),
        source: result.source,
        createdAt,
      })
      .onConflictDoNothing();
    return {
      status: "ok" as const,
      insight: shape({
        payload: JSON.stringify(result.payload),
        source: result.source,
        periodKey,
        createdAt,
      }),
      notice: result.notice,
    };
  }),

  refresh: protectedProcedure.mutation(async ({ ctx }) => {
    const c: Ctx = { db: ctx.db, userId: ctx.session.user.id };
    try {
      await consumeAiQuota(ctx.db, c.userId, KIND, REFRESH_DAILY_LIMIT);
    } catch (e) {
      if (e instanceof AiLimitError) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Hai gia' aggiornato i suggerimenti due volte oggi. Riprova domani.",
        });
      }
      throw e;
    }

    const now = new Date();
    const periodKey = isoWeekKey(now);
    const result = await compute(c, now);
    if (!result) {
      await refundAiQuota(ctx.db, c.userId, KIND).catch(() => {});
      return {
        status: "insufficient" as const,
        insight: null,
        notice: null as Notice,
      };
    }
    if (result.source === "fallback" && result.notice) {
      await refundAiQuota(ctx.db, c.userId, KIND).catch(() => {});
    }

    const existing = await readCached(c, periodKey);
    // Do not replace a good AI insight with a fallback caused by a failure.
    if (
      existing?.source === "ai" &&
      result.source === "fallback" &&
      result.notice
    ) {
      return {
        status: "ok" as const,
        insight: shape(existing),
        notice: result.notice,
      };
    }

    const createdAt = new Date();
    const payload = JSON.stringify(result.payload);
    await ctx.db
      .insert(aiInsight)
      .values({
        id: crypto.randomUUID(),
        userId: c.userId,
        periodKey,
        payload,
        source: result.source,
        createdAt,
      })
      .onConflictDoUpdate({
        target: [aiInsight.userId, aiInsight.periodKey],
        set: { payload, source: result.source, createdAt },
      });
    return {
      status: "ok" as const,
      insight: shape({ payload, source: result.source, periodKey, createdAt }),
      notice: result.notice,
    };
  }),
});
