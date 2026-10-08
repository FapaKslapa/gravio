import { and, eq, gte, lte, sum } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { notification, transaction } from "@/db/schema";

type Db = typeof DatabaseType;

export type Period = { startOfMonth: Date; endOfMonth: Date };

export async function createUniqueNotification(
  db: Db,
  userId: string,
  type: string,
  title: string,
  message: string,
  { startOfMonth, endOfMonth }: Period,
) {
  const existing = await db
    .select()
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.type, type),
        gte(notification.createdAt, startOfMonth),
        lte(notification.createdAt, endOfMonth),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(notification).values({
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    });
  }
}

export async function monthlyExpenseNok(
  db: Db,
  userId: string,
  { startOfMonth, endOfMonth }: Period,
  categoryId?: string,
) {
  const res = await db
    .select({ total: sum(transaction.amountNok) })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.type, "expense"),
        categoryId ? eq(transaction.categoryId, categoryId) : undefined,
        gte(transaction.date, startOfMonth),
        lte(transaction.date, endOfMonth),
      ),
    );
  return parseFloat(res[0]?.total || "0");
}
