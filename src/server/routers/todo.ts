import { and, asc, desc, eq } from "drizzle-orm";
import { todo, todoList } from "@/db/schema";
import {
  convertToTransactionBulkSchema,
  convertToTransactionSchema,
  createTodoListSchema,
  createTodoSchema,
  deleteTodoListSchema,
  deleteTodoSchema,
  listTodoSchema,
  toggleTodoSchema,
} from "@/lib/schemas/todo";
import { protectedProcedure, router } from "@/server/trpc";
import { convertToTransaction, convertToTransactionBulk } from "./todo/convert";
import { listTodoLists } from "./todo/lists";

export const todoRouter = router({
  listLists: protectedProcedure.query(({ ctx }) =>
    listTodoLists(ctx.db, ctx.session.user.id),
  ),

  createList: protectedProcedure
    .input(createTodoListSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const newList = {
        id: crypto.randomUUID(),
        userId,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(todoList).values(newList);
      return newList;
    }),

  deleteList: protectedProcedure
    .input(deleteTodoListSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(todoList)
        .where(and(eq(todoList.id, input.id), eq(todoList.userId, userId)));

      return { success: true };
    }),

  list: protectedProcedure
    .input(listTodoSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db
        .select()
        .from(todo)
        .where(
          and(eq(todo.userId, userId), eq(todo.todoListId, input.todoListId)),
        )
        .orderBy(asc(todo.completed), desc(todo.createdAt));
    }),

  create: protectedProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const newTodo = {
        id: crypto.randomUUID(),
        userId,
        todoListId: input.todoListId,
        categoryId: input.categoryId || null,
        title: input.title,
        notes: input.notes || "",
        completed: false,
        estimatedAmount:
          input.estimatedAmount !== undefined
            ? input.estimatedAmount.toFixed(2)
            : null,
        estimatedCurrency: input.estimatedCurrency || null,
        convertedToTransactionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(todo).values(newTodo);
      return newTodo;
    }),

  toggle: protectedProcedure
    .input(toggleTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(todo)
        .set({ completed: input.completed, updatedAt: new Date() })
        .where(and(eq(todo.id, input.id), eq(todo.userId, userId)));

      return { id: input.id, completed: input.completed };
    }),

  delete: protectedProcedure
    .input(deleteTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, userId)));

      return { success: true };
    }),

  convertToTransaction: protectedProcedure
    .input(convertToTransactionSchema)
    .mutation(({ ctx, input }) =>
      convertToTransaction(ctx.db, ctx.session.user.id, input),
    ),

  convertToTransactionBulk: protectedProcedure
    .input(convertToTransactionBulkSchema)
    .mutation(({ ctx, input }) =>
      convertToTransactionBulk(ctx.db, ctx.session.user.id, input),
    ),
});
