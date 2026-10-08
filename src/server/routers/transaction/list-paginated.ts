import { asc, count, desc, eq } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { sharedExpense, transaction } from "@/db/schema";
import { type ListInput, visibleWhere } from "./filters";
import { loadBorrowers, selectVisible } from "./list-shared";

type Db = typeof DatabaseType;

function sortColumn(input: ListInput) {
  switch (input?.sortField) {
    case "description":
      return transaction.description;
    case "type":
      return transaction.type;
    case "amount":
      return transaction.amountNok;
    case "category":
      return transaction.categoryId;
    default:
      return transaction.date;
  }
}

export async function listTransactionsPaginated(
  db: Db,
  userId: string,
  input: ListInput,
) {
  const where = visibleWhere(userId, input);

  const [countRes] = await db
    .select({ count: count() })
    .from(transaction)
    .leftJoin(sharedExpense, eq(transaction.id, sharedExpense.transactionId))
    .where(where);

  const direction = input?.sortDirection === "asc" ? asc : desc;
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;

  const rawTxs = await selectVisible(db)
    .where(where)
    .orderBy(direction(sortColumn(input)))
    .limit(limit)
    .offset((page - 1) * limit);

  const borrowerMap = await loadBorrowers(db, rawTxs);

  const items = rawTxs.map((row) => {
    const shared = row.shared;
    const borrower = shared ? borrowerMap.get(shared.borrowerId) : null;

    return {
      ...row.transaction,
      payerName: row.payerName,
      payerEmail: row.payerEmail,
      sharedInfo: shared
        ? {
            id: shared.id,
            payerId: shared.payerId,
            borrowerId: shared.borrowerId,
            borrowerName: borrower?.name || "Amico",
            borrowerEmail: borrower?.email || "",
            splitAmountNok: shared.splitAmountNok,
            settled: shared.settled,
            isBorrowed: shared.borrowerId === userId,
            isPaidByMe: shared.payerId === userId,
          }
        : null,
    };
  });

  return { items, totalCount: countRes?.count ?? 0 };
}
