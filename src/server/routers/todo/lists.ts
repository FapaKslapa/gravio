import { and, eq, isNull } from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import { todo, todoList } from "@/db/schema";

type Db = typeof DatabaseType;

export async function listTodoLists(db: Db, userId: string) {
  let lists = await db
    .select()
    .from(todoList)
    .where(eq(todoList.userId, userId));

  if (lists.length === 0) {
    const defaultList = {
      id: crypto.randomUUID(),
      userId,
      name: "Spesa",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(todoList).values(defaultList);

    await db
      .update(todo)
      .set({ todoListId: defaultList.id })
      .where(and(eq(todo.userId, userId), isNull(todo.todoListId)));

    lists = [defaultList];
  }

  const activeTodos = await db
    .select({ id: todo.id, todoListId: todo.todoListId })
    .from(todo)
    .where(and(eq(todo.userId, userId), eq(todo.completed, false)));

  const countMap = activeTodos.reduce(
    (acc, t) => {
      if (t.todoListId) {
        acc[t.todoListId] = (acc[t.todoListId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return lists.map((l) => ({
    ...l,
    activeCount: countMap[l.id] || 0,
  }));
}
