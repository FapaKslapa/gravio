import type { z } from "zod";
import type { db as DatabaseType } from "@/db";
import { transaction } from "@/db/schema";
import type {
  createManyTransactionsSchema,
  createTransactionSchema,
} from "@/lib/schemas/transaction";
import { triggerBudgetNotifications } from "./budget-notifications";
import { moneyFields } from "./money";
import { insertFriendSplit, insertGroupSplits } from "./shared-splits";

type Db = typeof DatabaseType;
type Actor = { id: string; name?: string | null; email: string };

export async function createTransaction(
  db: Db,
  actor: Actor,
  input: z.output<typeof createTransactionSchema>,
) {
  const userId = actor.id;
  const { amountNok, values } = moneyFields(input);

  const newTransaction = {
    id: crypto.randomUUID(),
    userId,
    ...values,
    groupId: input.groupId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(transaction).values(newTransaction);

  const splitCtx = {
    db,
    userId,
    actorName: actor.name || actor.email,
    input,
    transactionId: newTransaction.id,
    description: newTransaction.description,
    amountNok,
  };

  if (
    input.groupId &&
    input.groupSplits &&
    input.groupSplits.length > 0 &&
    input.type === "expense"
  ) {
    await insertGroupSplits(splitCtx);
  } else if (input.sharedWithUserId && input.type === "expense") {
    await insertFriendSplit(splitCtx, input.sharedWithUserId);
  }

  if (input.type === "expense") {
    await triggerBudgetNotifications(
      db,
      userId,
      input.categoryId || null,
      newTransaction.date,
    );
  }

  return newTransaction;
}

export async function createManyTransactions(
  db: Db,
  userId: string,
  input: z.output<typeof createManyTransactionsSchema>,
) {
  if (input.length === 0) return { count: 0 };

  const valuesToInsert = input.map((item) => ({
    id: crypto.randomUUID(),
    userId,
    ...moneyFields(item).values,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(transaction).values(valuesToInsert);

  const first = valuesToInsert.find((t) => t.type === "expense");
  if (first) {
    await triggerBudgetNotifications(db, userId, first.categoryId, first.date);
  }

  return { count: valuesToInsert.length };
}
