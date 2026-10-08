import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { friendGroup } from "./social";

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const transaction = sqliteTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  amountEur: numeric("amount_eur").notNull(),
  amountNok: numeric("amount_nok").notNull(),
  exchangeRate: numeric("exchange_rate").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  groupId: text("group_id").references(() => friendGroup.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sharedExpense = sqliteTable("shared_expense", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transaction.id, { onDelete: "cascade" }),
  payerId: text("payer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  borrowerId: text("borrower_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountNok: numeric("amount_nok").notNull(),
  splitAmountNok: numeric("split_amount_nok").notNull(),
  settled: integer("settled", { mode: "boolean" }).notNull().default(false),
  groupId: text("group_id").references(() => friendGroup.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const categoryBudget = sqliteTable("category_budget", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const recurrentTransaction = sqliteTable("recurrent_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  nextOccurrence: integer("next_occurrence", { mode: "timestamp" }).notNull(),
  lastExecuted: integer("last_executed", { mode: "timestamp" }),
  status: text("status").notNull().default("active"),
  endDate: integer("end_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
