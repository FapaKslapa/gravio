import { eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import type { db as DatabaseType } from "@/db";
import { notification, sharedExpense, userSettings } from "@/db/schema";
import type { createTransactionSchema } from "@/lib/schemas/transaction";
import { computeFriendSplitNok } from "./split";

type Db = typeof DatabaseType;
type CreateInput = z.output<typeof createTransactionSchema>;

type SplitContext = {
  db: Db;
  userId: string;
  actorName: string;
  input: CreateInput;
  transactionId: string;
  description: string;
  amountNok: number;
};

export async function insertGroupSplits(ctx: SplitContext) {
  const { db, userId, actorName, input, transactionId, description } = ctx;
  const splitsToInsert = (input.groupSplits ?? []).map((s) => ({
    id: crypto.randomUUID(),
    transactionId,
    payerId: userId,
    borrowerId: s.userId,
    amountNok: ctx.amountNok.toFixed(2),
    splitAmountNok: s.amountNok.toFixed(2),
    settled: false,
    groupId: input.groupId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(sharedExpense).values(splitsToInsert);

  const borrowerSettingsList = await db
    .select({
      userId: userSettings.userId,
      notifyFriendActions: userSettings.notifyFriendActions,
    })
    .from(userSettings)
    .where(
      inArray(
        userSettings.userId,
        splitsToInsert.map((s) => s.borrowerId),
      ),
    );

  const borrowerSettingsMap = new Map(
    borrowerSettingsList.map((bs) => [bs.userId, bs]),
  );

  const notificationsToInsert = splitsToInsert.flatMap((s) => {
    const bs = borrowerSettingsMap.get(s.borrowerId);
    if (bs && !bs.notifyFriendActions) return [];
    return [
      {
        id: crypto.randomUUID(),
        userId: s.borrowerId,
        type: "shared_expense_added",
        title: "Nuova spesa di gruppo",
        message: `${actorName} ha aggiunto una spesa "${description}" nel gruppo.`,
        read: false,
        link: "/friends",
        createdAt: new Date(),
      },
    ];
  });

  if (notificationsToInsert.length > 0) {
    await db.insert(notification).values(notificationsToInsert);
  }
}

export async function insertFriendSplit(ctx: SplitContext, friendId: string) {
  const { db, userId, actorName, input, transactionId, description } = ctx;
  const friendSplitNok = computeFriendSplitNok(
    ctx.amountNok,
    input.splitMode ?? "half",
    input.splitValue,
  );
  await db.insert(sharedExpense).values({
    id: crypto.randomUUID(),
    transactionId,
    payerId: userId,
    borrowerId: friendId,
    amountNok: ctx.amountNok.toFixed(2),
    splitAmountNok: friendSplitNok.toFixed(2),
    settled: false,
    groupId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const borrowerSettings = await db
    .select({ notifyFriendActions: userSettings.notifyFriendActions })
    .from(userSettings)
    .where(eq(userSettings.userId, friendId))
    .limit(1);
  if (borrowerSettings[0]?.notifyFriendActions !== false) {
    await db.insert(notification).values({
      id: crypto.randomUUID(),
      userId: friendId,
      type: "shared_expense_added",
      title: "Spesa condivisa",
      message: `${actorName} ha condiviso una spesa con te: "${description}".`,
      read: false,
      link: "/friends",
      createdAt: new Date(),
    });
  }
}
