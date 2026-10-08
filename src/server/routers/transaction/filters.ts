import { and, eq, gte, like, lte, or } from "drizzle-orm";
import type { z } from "zod";
import { sharedExpense, transaction } from "@/db/schema";
import type { listTransactionsSchema } from "@/lib/schemas/transaction";

export type ListInput = z.output<typeof listTransactionsSchema>;

export function visibleWhere(userId: string, input: ListInput) {
  const conditions = [];
  if (input?.categoryId) {
    conditions.push(eq(transaction.categoryId, input.categoryId));
  }
  if (input?.type) {
    conditions.push(eq(transaction.type, input.type));
  }
  if (input?.startDate) {
    conditions.push(gte(transaction.date, new Date(input.startDate)));
  }
  if (input?.endDate) {
    conditions.push(lte(transaction.date, new Date(input.endDate)));
  }
  if (input?.search) {
    conditions.push(like(transaction.description, `%${input.search}%`));
  }
  return and(
    or(eq(transaction.userId, userId), eq(sharedExpense.borrowerId, userId)),
    ...conditions,
  );
}
