import { and, eq, lte } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import {
  notification,
  recurrentTransaction,
  transaction,
  userSettings,
} from "@/db/schema";
import { convertAmounts } from "@/lib/utils";

type Db = typeof DatabaseType;

function getNextOccurrenceDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export async function processDueRecurrent(
  db: Db,
  userId: string,
  input?: { rates?: Record<string, number> },
) {
  const rates = input?.rates || {
    NOK: 11.85,
    EUR: 1.0,
  };
  const now = new Date();

  const [settingsRow, due] = await Promise.all([
    db
      .select({
        notifyRecurrentApplied: userSettings.notifyRecurrentApplied,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1),
    db
      .select()
      .from(recurrentTransaction)
      .where(
        and(
          eq(recurrentTransaction.userId, userId),
          eq(recurrentTransaction.status, "active"),
          lte(recurrentTransaction.nextOccurrence, now),
        ),
      ),
  ]);

  const notifyRecurrentApplied = settingsRow[0]?.notifyRecurrentApplied ?? true;
  let processedCount = 0;

  for (const rt of due) {
    let occurrence = new Date(rt.nextOccurrence);
    const endDate = rt.endDate ? new Date(rt.endDate) : null;
    const txsToInsert = [];

    const currencyRate = rates[rt.currency] ?? 1.0;
    const { amountEur, amountNok } = convertAmounts(
      parseFloat(rt.amount),
      rt.currency,
      currencyRate,
      rates.NOK ?? 11.85,
    );

    while (occurrence <= now) {
      if (endDate && occurrence > endDate) {
        break;
      }
      txsToInsert.push({
        id: crypto.randomUUID(),
        userId,
        categoryId: rt.categoryId,
        type: rt.type,
        amount: rt.amount,
        currency: rt.currency,
        amountEur: amountEur.toFixed(2),
        amountNok: amountNok.toFixed(2),
        exchangeRate: currencyRate.toFixed(4),
        description: rt.description,
        date: new Date(occurrence),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      occurrence = getNextOccurrenceDate(occurrence, rt.frequency);
    }

    if (txsToInsert.length > 0) {
      await db.insert(transaction).values(txsToInsert);

      await db
        .update(recurrentTransaction)
        .set({
          nextOccurrence: occurrence,
          lastExecuted: now,
          updatedAt: now,
        })
        .where(eq(recurrentTransaction.id, rt.id));

      if (notifyRecurrentApplied) {
        await db.insert(notification).values({
          id: crypto.randomUUID(),
          userId,
          type: "recurrent_executed",
          title: "Transazione ricorrente eseguita",
          message: `Eseguita: ${rt.description} (${rt.amount} ${rt.currency}) x${txsToInsert.length}`,
          read: false,
          link: "/transactions",
          createdAt: new Date(),
        });
      }

      processedCount += txsToInsert.length;
    }
  }

  return { success: true, processedCount };
}
