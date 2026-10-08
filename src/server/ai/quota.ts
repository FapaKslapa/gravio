import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { aiUsage } from "@/db/schema";
import { AiLimitError } from "./errors";

export const DEFAULT_DAILY_SCANS = 20;

const today = () => new Date().toISOString().substring(0, 10);

/** Atomically counts one use; throws AiLimitError when over the daily limit. */
export async function consumeAiQuota(
  db: Database,
  userId: string,
  kind: string,
  dailyLimit = DEFAULT_DAILY_SCANS,
) {
  const rows = await db
    .insert(aiUsage)
    .values({ id: crypto.randomUUID(), userId, day: today(), kind, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.day, aiUsage.kind],
      set: { count: sql`${aiUsage.count} + 1` },
      setWhere: sql`${aiUsage.count} < ${dailyLimit}`,
    })
    .returning({ count: aiUsage.count });
  if (rows.length === 0) throw new AiLimitError(dailyLimit);
  return { used: rows[0].count, remaining: dailyLimit - rows[0].count };
}

/** Gives back one use (e.g. when the model call failed). */
export async function refundAiQuota(
  db: Database,
  userId: string,
  kind: string,
) {
  await db
    .update(aiUsage)
    .set({ count: sql`max(${aiUsage.count} - 1, 0)` })
    .where(
      and(
        eq(aiUsage.userId, userId),
        eq(aiUsage.day, today()),
        eq(aiUsage.kind, kind),
      ),
    );
}
