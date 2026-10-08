import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import type { db as DatabaseType } from "@/db";
import { sharedExpense, transaction } from "@/db/schema";
import type { updateTransactionSchema } from "@/lib/schemas/transaction";
import { triggerBudgetNotifications } from "./budget-notifications";
import { moneyFields } from "./money";

type Db = typeof DatabaseType;

export async function deleteTransaction(db: Db, userId: string, id: string) {
  // If the user owns the transaction, delete it entirely (cascades to sharedExpense)
  const [owned] = await db
    .select({ id: transaction.id })
    .from(transaction)
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
    .limit(1);

  if (owned) {
    await db.delete(transaction).where(eq(transaction.id, id));
    return { success: true };
  }

  // Otherwise, if the user is a borrower on this transaction, remove only the split
  await db
    .delete(sharedExpense)
    .where(
      and(
        eq(sharedExpense.transactionId, id),
        eq(sharedExpense.borrowerId, userId),
      ),
    );

  return { success: true };
}

export async function updateTransaction(
  db: Db,
  userId: string,
  input: z.output<typeof updateTransactionSchema>,
) {
  await db
    .update(transaction)
    .set({ ...moneyFields(input).values, updatedAt: new Date() })
    .where(and(eq(transaction.id, input.id), eq(transaction.userId, userId)));

  if (input.type === "expense") {
    await triggerBudgetNotifications(
      db,
      userId,
      input.categoryId || null,
      new Date(input.date),
    );
  }

  return { success: true };
}
