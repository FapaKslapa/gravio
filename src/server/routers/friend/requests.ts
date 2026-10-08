import { and, eq, or } from "drizzle-orm";
import { friendship, notification, user } from "@/db/schema";
import type { Db } from "./users";

type Actor = { id: string; name?: string | null; email: string };

export async function sendRequest(db: Db, actor: Actor, rawEmail: string) {
  const userId = actor.id;

  if (rawEmail.toLowerCase() === actor.email.toLowerCase()) {
    throw new Error("Non puoi inviare una richiesta di amicizia a te stesso");
  }

  const targetUsers = await db
    .select()
    .from(user)
    .where(eq(user.email, rawEmail.toLowerCase()))
    .limit(1);

  if (targetUsers.length === 0) {
    throw new Error("Nessun utente trovato con questa email");
  }

  const targetUser = targetUsers[0];

  const existing = await db
    .select()
    .from(friendship)
    .where(
      or(
        and(
          eq(friendship.userId, userId),
          eq(friendship.friendId, targetUser.id),
        ),
        and(
          eq(friendship.userId, targetUser.id),
          eq(friendship.friendId, userId),
        ),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Esiste già una richiesta pendente o siete già amici");
  }

  await db.insert(friendship).values({
    id: crypto.randomUUID(),
    userId: userId,
    friendId: targetUser.id,
    status: "pending",
    senderId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(notification).values({
    id: crypto.randomUUID(),
    userId: targetUser.id,
    type: "friend_request_received",
    title: "Richiesta di amicizia",
    message: `${actor.name || actor.email} ti ha inviato una richiesta di amicizia.`,
    read: false,
    link: "/friends",
    createdAt: new Date(),
  });

  return { success: true };
}

export async function respondRequest(
  db: Db,
  actor: Actor,
  input: { requestId: string; action: "accept" | "reject" | string },
) {
  const requests = await db
    .select()
    .from(friendship)
    .where(
      and(
        eq(friendship.id, input.requestId),
        eq(friendship.friendId, actor.id),
        eq(friendship.status, "pending"),
      ),
    )
    .limit(1);

  if (requests.length === 0) {
    throw new Error("Richiesta di amicizia non trovata o non autorizzata");
  }

  const req = requests[0];

  if (input.action === "accept") {
    await db
      .update(friendship)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(friendship.id, req.id));

    await db.insert(notification).values({
      id: crypto.randomUUID(),
      userId: req.userId,
      type: "friend_request_accepted",
      title: "Richiesta accettata",
      message: `${actor.name || actor.email} ha accettato la tua richiesta di amicizia.`,
      read: false,
      link: "/friends",
      createdAt: new Date(),
    });
  } else {
    await db.delete(friendship).where(eq(friendship.id, req.id));
  }

  return { success: true };
}
