import { and, eq, or } from "drizzle-orm";
import { sharedExpense } from "@/db/schema";
import { type Db, loadUserMap, notNull } from "./users";

type Participant = { id: string; balance: number };
type Proposal = { fromId: string; toId: string; amountNok: number };

function netBalances(
  expenses: { payerId: string; borrowerId: string; splitAmountNok: string }[],
) {
  const balances: Record<string, number> = {};
  for (const exp of expenses) {
    const amount = parseFloat(exp.splitAmountNok);
    balances[exp.payerId] = (balances[exp.payerId] || 0) + amount;
    balances[exp.borrowerId] = (balances[exp.borrowerId] || 0) - amount;
  }
  return balances;
}

function matchProposals(balances: Record<string, number>): Proposal[] {
  const debtors: Participant[] = [];
  const creditors: Participant[] = [];

  for (const [id, bal] of Object.entries(balances)) {
    if (bal < -0.01) {
      debtors.push({ id, balance: bal });
    } else if (bal > 0.01) {
      creditors.push({ id, balance: bal });
    }
  }

  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const proposals: Proposal[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settleAmount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (settleAmount > 0.01) {
      proposals.push({
        fromId: debtor.id,
        toId: creditor.id,
        amountNok: settleAmount,
      });
    }

    debtor.balance += settleAmount;
    creditor.balance -= settleAmount;

    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (Math.abs(creditor.balance) < 0.01) cIdx++;
  }

  return proposals;
}

export async function getGroupSettlementProposals(
  db: Db,
  userId: string,
  groupId?: string | null,
) {
  const scope = groupId
    ? eq(sharedExpense.groupId, groupId)
    : or(
        eq(sharedExpense.payerId, userId),
        eq(sharedExpense.borrowerId, userId),
      );

  const unsettled = await db
    .select()
    .from(sharedExpense)
    .where(and(eq(sharedExpense.settled, false), scope));

  if (unsettled.length === 0) return [];

  const proposals = matchProposals(netBalances(unsettled));

  const allUserIds = Array.from(
    new Set([
      ...proposals.map((p) => p.fromId),
      ...proposals.map((p) => p.toId),
    ]),
  );

  if (allUserIds.length === 0) return [];

  const userMap = await loadUserMap(db, allUserIds);

  return proposals
    .map((p) => {
      const fromUser = userMap.get(p.fromId);
      const toUser = userMap.get(p.toId);
      if (!fromUser || !toUser) return null;
      return { fromUser, toUser, amountNok: p.amountNok };
    })
    .filter(notNull);
}
