import { inArray } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { user } from "@/db/schema";

export type Db = typeof DatabaseType;

export async function loadUserMap(db: Db, ids: string[]) {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(inArray(user.id, ids));
  return new Map(rows.map((u) => [u.id, u]));
}

export const notNull = <T>(item: T | null): item is T => item !== null;
