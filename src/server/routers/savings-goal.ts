import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { savingsContribution, savingsGoal } from "@/db/schema";
import {
  addContributionSchema,
  createSavingsGoalSchema,
  deleteContributionSchema,
  deleteSavingsGoalSchema,
  updateSavingsGoalSchema,
} from "@/lib/schemas/savings-goal";
import { protectedProcedure, router } from "@/server/trpc";

export const savingsGoalRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [goals, contributions] = await Promise.all([
      ctx.db
        .select()
        .from(savingsGoal)
        .where(eq(savingsGoal.userId, userId))
        .orderBy(desc(savingsGoal.createdAt)),
      ctx.db
        .select()
        .from(savingsContribution)
        .where(eq(savingsContribution.userId, userId))
        .orderBy(desc(savingsContribution.date)),
    ]);

    return goals.map((goal) => {
      const own = contributions.filter((c) => c.goalId === goal.id);
      const target = Number(goal.targetAmount);
      const saved = own.reduce((sum, c) => sum + Number(c.amount), 0);
      return {
        ...goal,
        targetAmount: target,
        saved,
        percent:
          target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0,
        contributions: own.map((c) => ({ ...c, amount: Number(c.amount) })),
      };
    });
  }),

  create: protectedProcedure
    .input(createSavingsGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(savingsGoal).values({
        id,
        userId: ctx.session.user.id,
        name: input.name,
        targetAmount: input.targetAmount.toFixed(2),
        currency: input.currency,
        targetDate: input.targetDate,
        color: input.color,
        icon: input.icon,
        createdAt: new Date(),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(updateSavingsGoalSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(savingsGoal)
        .set({
          name: input.name,
          targetAmount: input.targetAmount.toFixed(2),
          currency: input.currency,
          targetDate: input.targetDate,
          color: input.color,
          icon: input.icon,
        })
        .where(
          and(
            eq(savingsGoal.id, input.id),
            eq(savingsGoal.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(deleteSavingsGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .delete(savingsContribution)
        .where(
          and(
            eq(savingsContribution.goalId, input.id),
            eq(savingsContribution.userId, userId),
          ),
        );
      await ctx.db
        .delete(savingsGoal)
        .where(
          and(eq(savingsGoal.id, input.id), eq(savingsGoal.userId, userId)),
        );
      return { success: true };
    }),

  addContribution: protectedProcedure
    .input(addContributionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [goal] = await ctx.db
        .select({ id: savingsGoal.id })
        .from(savingsGoal)
        .where(
          and(eq(savingsGoal.id, input.goalId), eq(savingsGoal.userId, userId)),
        )
        .limit(1);
      if (!goal) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.insert(savingsContribution).values({
        id: crypto.randomUUID(),
        goalId: input.goalId,
        userId,
        amount: input.amount.toFixed(2),
        date: input.date,
        note: input.note || null,
      });
      return { success: true };
    }),

  deleteContribution: protectedProcedure
    .input(deleteContributionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(savingsContribution)
        .where(
          and(
            eq(savingsContribution.id, input.id),
            eq(savingsContribution.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),
});
