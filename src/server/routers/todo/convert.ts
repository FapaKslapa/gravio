import { and, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import type { db as DatabaseType } from "@/db";
import { todo, transaction } from "@/db/schema";
import type {
  convertToTransactionBulkSchema,
  convertToTransactionSchema,
} from "@/lib/schemas/todo";

type Db = typeof DatabaseType;

function convertAmounts(
  amount: number,
  currency: string,
  exchangeRate: number,
) {
  if (currency === "EUR") {
    return { amountEur: amount, amountNok: amount * exchangeRate };
  }
  return { amountNok: amount, amountEur: amount / exchangeRate };
}

export async function convertToTransaction(
  db: Db,
  userId: string,
  input: z.output<typeof convertToTransactionSchema>,
) {
  const existingTodo = await db
    .select()
    .from(todo)
    .where(and(eq(todo.id, input.todoId), eq(todo.userId, userId)))
    .limit(1);

  if (existingTodo.length === 0) {
    throw new Error("Elemento to-do non trovato o non autorizzato");
  }

  const item = existingTodo[0];
  const { amountEur, amountNok } = convertAmounts(
    input.amount,
    input.currency,
    input.exchangeRate,
  );

  const newTransactionId = crypto.randomUUID();

  const newTransaction = {
    id: newTransactionId,
    userId,
    categoryId: item.categoryId,
    type: "expense",
    amount: input.amount.toFixed(2),
    currency: input.currency,
    amountEur: amountEur.toFixed(2),
    amountNok: amountNok.toFixed(2),
    exchangeRate: input.exchangeRate.toFixed(4),
    description: item.title,
    date: new Date(input.date),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(transaction).values(newTransaction);

  await db
    .update(todo)
    .set({
      completed: true,
      convertedToTransactionId: newTransactionId,
      updatedAt: new Date(),
    })
    .where(eq(todo.id, input.todoId));

  return {
    transaction: newTransaction,
    todoId: input.todoId,
    completed: true,
  };
}

export async function convertToTransactionBulk(
  db: Db,
  userId: string,
  input: z.output<typeof convertToTransactionBulkSchema>,
) {
  if (input.todoIds.length === 0) {
    throw new Error("Nessun articolo selezionato per la conversione");
  }

  // Check that all selected items belong to the user
  const existingTodos = await db
    .select()
    .from(todo)
    .where(and(inArray(todo.id, input.todoIds), eq(todo.userId, userId)));

  if (existingTodos.length !== input.todoIds.length) {
    throw new Error(
      "Alcuni articoli non sono stati trovati o non sei autorizzato",
    );
  }

  const { amountEur, amountNok } = convertAmounts(
    input.amount,
    input.currency,
    input.exchangeRate,
  );

  const newTransactionId = crypto.randomUUID();

  const newTransaction = {
    id: newTransactionId,
    userId,
    categoryId: input.categoryId || null,
    type: "expense",
    amount: input.amount.toFixed(2),
    currency: input.currency,
    amountEur: amountEur.toFixed(2),
    amountNok: amountNok.toFixed(2),
    exchangeRate: input.exchangeRate.toFixed(4),
    description: input.description,
    date: new Date(input.date),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(transaction).values(newTransaction);

  await db
    .update(todo)
    .set({
      completed: true,
      convertedToTransactionId: newTransactionId,
      updatedAt: new Date(),
    })
    .where(inArray(todo.id, input.todoIds));

  return {
    transaction: newTransaction,
    todoIds: input.todoIds,
    completed: true,
  };
}
