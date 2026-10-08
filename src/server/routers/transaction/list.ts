import { desc } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { transaction } from "@/db/schema";
import { type ListInput, visibleWhere } from "./filters";
import { loadBorrowers, type RawRow, selectVisible } from "./list-shared";

type Db = typeof DatabaseType;

export async function listTransactions(
  db: Db,
  userId: string,
  input: ListInput,
) {
  const rawTxs = await selectVisible(db)
    .where(visibleWhere(userId, input))
    .orderBy(desc(transaction.date));

  const borrowerMap = await loadBorrowers(db, rawTxs);

  // The sharedExpense join yields one row per debtor: collapse them so each
  // transaction appears once. The payer sees the sum of all debtor splits.
  const byTx = new Map<string, RawRow[]>();
  for (const row of rawTxs) {
    const rows = byTx.get(row.transaction.id);
    if (rows) rows.push(row);
    else byTx.set(row.transaction.id, [row]);
  }

  return [...byTx.values()].map((rows) => {
    const first = rows[0];
    const shares = rows.flatMap((r) => (r.shared ? [r.shared] : []));
    const mine = shares.find((s) => s.borrowerId === userId);
    const shared = mine ?? shares[0] ?? null;
    const splitTotal = shares.reduce(
      (sum, s) => sum + parseFloat(s.splitAmountNok),
      0,
    );
    const borrowerName = mine
      ? borrowerMap.get(mine.borrowerId)?.name || "Amico"
      : shares
          .map((s) => borrowerMap.get(s.borrowerId)?.name || "Amico")
          .join(", ");
    const borrower = shared ? borrowerMap.get(shared.borrowerId) : null;

    return {
      ...first.transaction,
      payerName: first.payerName,
      payerEmail: first.payerEmail,
      sharedInfo: shared
        ? {
            id: shared.id,
            payerId: shared.payerId,
            borrowerId: shared.borrowerId,
            borrowerName,
            borrowerEmail: borrower?.email || "",
            splitAmountNok: mine ? mine.splitAmountNok : splitTotal.toFixed(2),
            settled: shares.every((s) => s.settled),
            isBorrowed: shared.borrowerId === userId,
            isPaidByMe: shared.payerId === userId,
          }
        : null,
    };
  });
}
