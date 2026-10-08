import { and, eq, or } from "drizzle-orm";
import { friendship } from "@/db/schema";
import { type Db, loadUserMap, notNull } from "./users";

export async function listFriends(db: Db, userId: string) {
  const friendships = await db
    .select()
    .from(friendship)
    .where(
      and(
        eq(friendship.status, "accepted"),
        or(eq(friendship.userId, userId), eq(friendship.friendId, userId)),
      ),
    );

  if (friendships.length === 0) return [];

  const friendIds = Array.from(
    new Set(
      friendships
        .map((f) => (f.userId === userId ? f.friendId : f.userId))
        .filter((id): id is string => typeof id === "string" && !!id),
    ),
  );

  if (friendIds.length === 0) return [];

  const userMap = await loadUserMap(db, friendIds);

  return friendships
    .map((f) => {
      const friendUserId = f.userId === userId ? f.friendId : f.userId;
      const friendUser = userMap.get(friendUserId);
      if (!friendUser) return null;
      return { friendshipId: f.id, user: friendUser, createdAt: f.createdAt };
    })
    .filter(notNull);
}

export async function listPendingRequests(db: Db, userId: string) {
  const [incoming, outgoing] = await Promise.all([
    db
      .select()
      .from(friendship)
      .where(
        and(eq(friendship.friendId, userId), eq(friendship.status, "pending")),
      ),
    db
      .select()
      .from(friendship)
      .where(
        and(eq(friendship.userId, userId), eq(friendship.status, "pending")),
      ),
  ]);

  const allUserIds = Array.from(
    new Set(
      [
        ...incoming.map((r) => r.userId),
        ...outgoing.map((r) => r.friendId),
      ].filter((id): id is string => typeof id === "string" && !!id),
    ),
  );

  const userMap =
    allUserIds.length > 0
      ? await loadUserMap(db, allUserIds)
      : new Map<string, never>();

  return {
    incoming: incoming
      .map((req) => {
        const sender = userMap.get(req.userId);
        if (!sender) return null;
        return { id: req.id, user: sender, createdAt: req.createdAt };
      })
      .filter(notNull),
    outgoing: outgoing
      .map((req) => {
        const receiver = userMap.get(req.friendId);
        if (!receiver) return null;
        return { id: req.id, user: receiver, createdAt: req.createdAt };
      })
      .filter(notNull),
  };
}

export async function deleteFriend(db: Db, userId: string, friendId: string) {
  await db
    .delete(friendship)
    .where(
      or(
        and(eq(friendship.userId, userId), eq(friendship.friendId, friendId)),
        and(eq(friendship.userId, friendId), eq(friendship.friendId, userId)),
      ),
    );

  return { success: true };
}
