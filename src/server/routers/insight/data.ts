import { and, eq, gte, isNull, or } from "drizzle-orm";
import { category, categoryBudget, transaction } from "@/db/schema";
import { analyzeSpending } from "@/lib/insights/analyze";
import type { Ctx } from "./cache";

const FALLBACK_NOK_PER_EUR = 11.85;

function periodStart(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
}

export async function analyzeUser({ db, userId }: Ctx, now: Date) {
  const [rows, cats, budgets] = await Promise.all([
    db
      .select({
        id: transaction.id,
        categoryId: transaction.categoryId,
        amountEur: transaction.amountEur,
        amountNok: transaction.amountNok,
        date: transaction.date,
        description: transaction.description,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, "expense"),
          gte(transaction.date, periodStart(now)),
        ),
      ),
    db
      .select({ id: category.id, name: category.name })
      .from(category)
      .where(or(eq(category.userId, userId), isNull(category.userId))),
    db
      .select({
        categoryId: categoryBudget.categoryId,
        amount: categoryBudget.amount,
      })
      .from(categoryBudget)
      .where(eq(categoryBudget.userId, userId)),
  ]);

  let eurSum = 0;
  let nokSum = 0;
  const transactions = rows.map((r) => {
    const eur = parseFloat(r.amountEur);
    eurSum += eur;
    nokSum += parseFloat(r.amountNok);
    return {
      id: r.id,
      categoryId: r.categoryId,
      amountEur: eur,
      date: r.date,
      description: r.description,
    };
  });
  const eurPerNok = nokSum > 0 ? eurSum / nokSum : 1 / FALLBACK_NOK_PER_EUR;

  const analysis = analyzeSpending({
    transactions,
    budgets: budgets.map((b) => ({
      categoryId: b.categoryId,
      amountEur: parseFloat(b.amount) * eurPerNok,
    })),
    categories: cats,
    now,
  });
  return { analysis, categories: cats };
}
