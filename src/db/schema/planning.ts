import {
  integer,
  numeric,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { category, transaction } from "./transactions";

export const todoList = sqliteTable("todo_list", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const todo = sqliteTable("todo", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  todoListId: text("todo_list_id").references(() => todoList.id, {
    onDelete: "cascade",
  }),
  categoryId: text("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  notes: text("notes"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  estimatedAmount: numeric("estimated_amount"),
  estimatedCurrency: text("estimated_currency"),
  convertedToTransactionId: text("converted_to_transaction_id").references(
    () => transaction.id,
    { onDelete: "set null" },
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const notification = sqliteTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  link: text("link"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const savingsGoal = sqliteTable("savings_goal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  targetDate: text("target_date"),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const savingsContribution = sqliteTable("savings_contribution", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => savingsGoal.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  date: text("date").notNull(),
  note: text("note"),
});

export const aiUsage = sqliteTable(
  "ai_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    kind: text("kind").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [uniqueIndex("ai_usage_user_day_kind").on(t.userId, t.day, t.kind)],
);

export const aiInsight = sqliteTable(
  "ai_insight",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    periodKey: text("period_key").notNull(),
    payload: text("payload").notNull(),
    source: text("source").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("ai_insight_user_period").on(t.userId, t.periodKey)],
);
