import { and, eq } from "drizzle-orm";
import { aiInsight } from "@/db/schema";
import type { InsightPayload } from "@/lib/insights/advice";

export type Ctx = { db: typeof import("@/db").db; userId: string };
export type Notice = "quota" | "unavailable" | null;

export type ComputeResult = {
  payload: InsightPayload;
  source: "ai" | "fallback";
  notice: Notice;
};

export function shape(row: {
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

export async function readCached(ctx: Ctx, periodKey: string) {
  const [row] = await ctx.db
    .select()
    .from(aiInsight)
    .where(
      and(eq(aiInsight.userId, ctx.userId), eq(aiInsight.periodKey, periodKey)),
    )
    .limit(1);
  return row ?? null;
}
