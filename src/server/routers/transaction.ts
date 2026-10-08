import {
  createManyTransactionsSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from "@/lib/schemas/transaction";
import { protectedProcedure, router } from "@/server/trpc";
import { deleteTransaction, updateTransaction } from "./transaction/edit";
import { listTransactions } from "./transaction/list";
import { listTransactionsPaginated } from "./transaction/list-paginated";
import {
  createManyTransactions,
  createTransaction,
} from "./transaction/mutations";

export const transactionRouter = router({
  list: protectedProcedure
    .input(listTransactionsSchema)
    .query(({ ctx, input }) =>
      listTransactions(ctx.db, ctx.session.user.id, input),
    ),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(({ ctx, input }) =>
      createTransaction(ctx.db, ctx.session.user, input),
    ),

  createMany: protectedProcedure
    .input(createManyTransactionsSchema)
    .mutation(({ ctx, input }) =>
      createManyTransactions(ctx.db, ctx.session.user.id, input),
    ),

  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(({ ctx, input }) =>
      deleteTransaction(ctx.db, ctx.session.user.id, input.id),
    ),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(({ ctx, input }) =>
      updateTransaction(ctx.db, ctx.session.user.id, input),
    ),

  listPaginated: protectedProcedure
    .input(listTransactionsSchema)
    .query(({ ctx, input }) =>
      listTransactionsPaginated(ctx.db, ctx.session.user.id, input),
    ),
});
