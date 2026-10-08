import { and, eq, or } from "drizzle-orm";
import { sharedExpense, transaction } from "@/db/schema";
import { type Db, loadUserMap, notNull } from "./users";

export async function getBalanceSummary(db: Db, userId: string) {
  const [creditExpenses, debitExpenses] = await Promise.all([
    db
      .select()
      .from(sharedExpense)
      .where(
        and(
          eq(sharedExpense.payerId, userId),
          eq(sharedExpense.settled, false),
        ),
      ),
    db
      .select()
      .from(sharedExpense)
      .where(
        and(
          eq(sharedExpense.borrowerId, userId),
          eq(sharedExpense.settled, false),
        ),
      ),
  ]);

  const balances: Record<string, number> = {};

  for (const exp of creditExpenses) {
    balances[exp.borrowerId] =
      (balances[exp.borrowerId] || 0) + parseFloat(exp.splitAmountNok);
  }
  for (const exp of debitExpenses) {
    balances[exp.payerId] =
      (balances[exp.payerId] || 0) - parseFloat(exp.splitAmountNok);
  }

  const relevantFriendIds = Object.entries(balances).flatMap(([id, bal]) =>
    Math.abs(bal) >= 0.01 ? [id] : [],
  );

  if (relevantFriendIds.length === 0) return [];

  const userMap = await loadUserMap(db, relevantFriendIds);

  return relevantFriendIds
    .map((friendUserId) => {
      const friendUser = userMap.get(friendUserId);
      if (!friendUser) return null;
      return { user: friendUser, balanceNok: balances[friendUserId] };
    })
    .filter(notNull);
}

export async function settleDebt(db: Db, userId: string, friendId: string) {
  const betweenUsers = and(
    eq(sharedExpense.settled, false),
    or(
      and(
        eq(sharedExpense.payerId, userId),
        eq(sharedExpense.borrowerId, friendId),
      ),
      and(
        eq(sharedExpense.payerId, friendId),
        eq(sharedExpense.borrowerId, userId),
      ),
    ),
  );

  const unsettledExpenses = await db
    .select()
    .from(sharedExpense)
    .where(betweenUsers);

  if (unsettledExpenses.length === 0) return { success: true };

  const reimbursementTransactions = await Promise.all(
    unsettledExpenses.map(async (exp) => {
      const splitNok = parseFloat(exp.splitAmountNok);

      const [originalTx] = await db
        .select()
        .from(transaction)
        .where(eq(transaction.id, exp.transactionId))
        .limit(1);

      const exchangeRate = originalTx
        ? parseFloat(originalTx.exchangeRate)
        : 11.5;
      const amountEur = splitNok / exchangeRate;
      const description = originalTx
        ? `Rimborso — ${originalTx.description}`
        : "Rimborso spesa condivisa";

      return {
        id: crypto.randomUUID(),
        userId: exp.payerId,
        categoryId: null,
        type: "income" as const,
        amount: splitNok.toFixed(2),
        currency: "NOK" as const,
        amountNok: splitNok.toFixed(2),
        amountEur: amountEur.toFixed(2),
        exchangeRate: exchangeRate.toFixed(4),
        description,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
  );

  if (reimbursementTransactions.length > 0) {
    await db.insert(transaction).values(reimbursementTransactions);
  }

  await db
    .update(sharedExpense)
    .set({ settled: true, updatedAt: new Date() })
    .where(betweenUsers);

  return { success: true };
}
