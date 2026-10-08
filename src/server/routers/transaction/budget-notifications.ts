import { and, eq } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { categoryBudget, userSettings } from "@/db/schema";
import {
  createUniqueNotification,
  monthlyExpenseNok,
  type Period,
} from "./notification-helpers";

type Db = typeof DatabaseType;

async function notifyGlobalBudget(db: Db, userId: string, period: Period) {
  const [s] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  if (!s) return;

  const targetNok = parseFloat(s.targetMonthlyBudget);
  const maxNok = parseFloat(s.maxMonthlyBudget);
  if (!s.notifyBudget80 || (targetNok <= 0 && maxNok <= 0)) return;

  const spent = await monthlyExpenseNok(db, userId, period);

  if (targetNok > 0) {
    const pct = spent / targetNok;
    if (pct >= 1.0) {
      await createUniqueNotification(
        db,
        userId,
        "budget_100",
        "Budget Target Raggiunto",
        `Hai speso il 100% del tuo budget target mensile (${spent.toFixed(2)} NOK).`,
        period,
      );
    } else if (pct >= 0.8) {
      await createUniqueNotification(
        db,
        userId,
        "budget_80",
        "Budget Target all'80%",
        `Hai speso l'80% del tuo budget target mensile (${spent.toFixed(2)} NOK).`,
        period,
      );
    }
  }

  if (maxNok > 0 && spent >= maxNok) {
    await createUniqueNotification(
      db,
      userId,
      "budget_max",
      "Budget Massimo Superato",
      `Attenzione: hai superato il budget massimo mensile (${spent.toFixed(2)} / ${maxNok.toFixed(2)} NOK).`,
      period,
    );
  }
}

async function notifyCategoryBudget(
  db: Db,
  userId: string,
  categoryId: string,
  period: Period,
) {
  const [catBudget] = await db
    .select()
    .from(categoryBudget)
    .where(
      and(
        eq(categoryBudget.userId, userId),
        eq(categoryBudget.categoryId, categoryId),
      ),
    )
    .limit(1);
  if (!catBudget) return;

  const budgetNok = parseFloat(catBudget.amount);
  if (budgetNok <= 0) return;

  const spent = await monthlyExpenseNok(db, userId, period, categoryId);
  const pct = spent / budgetNok;

  if (pct >= 1.0) {
    await createUniqueNotification(
      db,
      userId,
      `cat_100_${categoryId}`,
      "Budget Categoria Superato",
      `Hai speso il 100% del budget per questa categoria (${spent.toFixed(2)} NOK).`,
      period,
    );
  } else if (pct >= 0.8) {
    await createUniqueNotification(
      db,
      userId,
      `cat_80_${categoryId}`,
      "Budget Categoria all'80%",
      `Hai speso l'80% del budget per questa categoria (${spent.toFixed(2)} NOK).`,
      period,
    );
  }
}

export async function triggerBudgetNotifications(
  db: Db,
  userId: string,
  categoryId: string | null,
  date: Date,
) {
  const period = {
    startOfMonth: new Date(date.getFullYear(), date.getMonth(), 1),
    endOfMonth: new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  };

  await notifyGlobalBudget(db, userId, period);
  if (categoryId) await notifyCategoryBudget(db, userId, categoryId, period);
}
