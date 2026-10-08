import { eq, inArray } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { sharedExpense, transaction, user } from "@/db/schema";

type Db = typeof DatabaseType;

export function selectVisible(db: Db) {
  return db
    .select({
      transaction: transaction,
      shared: sharedExpense,
      payerName: user.name,
      payerEmail: user.email,
    })
    .from(transaction)
    .leftJoin(sharedExpense, eq(transaction.id, sharedExpense.transactionId))
    .leftJoin(user, eq(transaction.userId, user.id));
}

export type RawRow = Awaited<ReturnType<typeof selectVisible>>[number];

export async function loadBorrowers(db: Db, rows: RawRow[]) {
  const borrowerIds = rows
    .map((r) => r.shared?.borrowerId)
    .filter((id): id is string => !!id);

  const borrowerUsers =
    borrowerIds.length > 0
      ? await db
          .select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .where(inArray(user.id, borrowerIds))
      : [];

  return new Map(borrowerUsers.map((u) => [u.id, u]));
}
