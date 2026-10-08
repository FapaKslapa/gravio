import { TRPCError } from "@trpc/server";
import { aiInsight } from "@/db/schema";
import { isoWeekKey } from "@/lib/insights/analyze";
import { AiLimitError, consumeAiQuota, refundAiQuota } from "@/server/ai";
import { protectedProcedure, router } from "@/server/trpc";
import { type Ctx, type Notice, readCached, shape } from "./insight/cache";
import { compute } from "./insight/compute";

const KIND = "insight";
const REFRESH_DAILY_LIMIT = 2;

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
