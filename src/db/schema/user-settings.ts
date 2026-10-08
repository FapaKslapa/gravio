import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  targetMonthlyBudget: numeric("target_monthly_budget").notNull(),
  maxMonthlyBudget: numeric("max_monthly_budget").notNull(),
  preferredCurrency: text("preferred_currency").notNull().default("NOK"),
  themeMode: text("theme_mode").notNull().default("dark"),
  themeAccent: text("theme_accent").notNull().default("blue"),
  aiProvider: text("ai_provider").notNull().default("local"),
  geminiApiKey: text("gemini_api_key"),
  ollamaUrl: text("ollama_url").notNull().default("http://localhost:11434"),
  ollamaModel: text("ollama_model").notNull().default("llama3.2:1b"),
  notifyBudget80: integer("notify_budget_80", { mode: "boolean" })
    .notNull()
    .default(true),
  notifyRecurrentApplied: integer("notify_recurrent_applied", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
  notifyFriendActions: integer("notify_friend_actions", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
