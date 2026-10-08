import { and, eq } from "drizzle-orm";
import { recurrentTransaction } from "@/db/schema";
import {
  deleteRecurrentTransactionSchema,
  recurrentTransactionSchema,
} from "@/lib/schemas/recurrent-transaction";
import { protectedProcedure, router } from "@/server/trpc";
import { processDueRecurrent } from "./recurrent-transaction/process-due";
import {
  processDueSchema,
  toggleRecurrentStatusSchema,
  updateRecurrentSchema,
} from "./recurrent-transaction/schemas";

export const recurrentTransactionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(recurrentTransaction)
      .where(eq(recurrentTransaction.userId, ctx.session.user.id));
  }),

  create: protectedProcedure
    .input(recurrentTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = crypto.randomUUID();
      const startD = new Date(input.startDate);
      const endD = input.endDate ? new Date(input.endDate) : null;

      await ctx.db.insert(recurrentTransaction).values({
        id,
        userId,
        categoryId: input.categoryId || null,
        type: input.type,
        amount: input.amount.toFixed(2),
        currency: input.currency,
        description: input.description,
        frequency: input.frequency,
        startDate: startD,
        nextOccurrence: startD,
        status: input.status ?? "active",
        endDate: endD,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(updateRecurrentSchema)
    .mutation(async ({ ctx, input }) => {
      const startD = new Date(input.startDate);
      const endD = input.endDate ? new Date(input.endDate) : null;

      await ctx.db
        .update(recurrentTransaction)
        .set({
          categoryId: input.categoryId || null,
          type: input.type,
          amount: input.amount.toFixed(2),
          currency: input.currency,
          description: input.description,
          frequency: input.frequency,
          startDate: startD,
          status: input.status,
          endDate: endD,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  toggleStatus: protectedProcedure
    .input(toggleRecurrentStatusSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recurrentTransaction)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(deleteRecurrentTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(recurrentTransaction)
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  processDue: protectedProcedure
    .input(processDueSchema)
    .mutation(({ ctx, input }) =>
      processDueRecurrent(ctx.db, ctx.session.user.id, input),
    ),
});
