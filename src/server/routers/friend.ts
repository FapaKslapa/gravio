import { z } from "zod";
import {
  respondFriendRequestSchema,
  sendFriendRequestSchema,
  settleDebtSchema,
} from "@/lib/schemas/friend";
import { protectedProcedure, router } from "@/server/trpc";
import { getBalanceSummary, settleDebt } from "./friend/balances";
import {
  deleteFriend,
  listFriends,
  listPendingRequests,
} from "./friend/friends-list";
import { getGroupSettlementProposals } from "./friend/proposals";
import { respondRequest, sendRequest } from "./friend/requests";

export const friendRouter = router({
  sendRequest: protectedProcedure
    .input(sendFriendRequestSchema)
    .mutation(({ ctx, input }) =>
      sendRequest(ctx.db, ctx.session.user, input.email),
    ),

  respondRequest: protectedProcedure
    .input(respondFriendRequestSchema)
    .mutation(({ ctx, input }) =>
      respondRequest(ctx.db, ctx.session.user, input),
    ),

  listFriends: protectedProcedure.query(({ ctx }) =>
    listFriends(ctx.db, ctx.session.user.id),
  ),

  listPendingRequests: protectedProcedure.query(({ ctx }) =>
    listPendingRequests(ctx.db, ctx.session.user.id),
  ),

  getBalanceSummary: protectedProcedure.query(({ ctx }) =>
    getBalanceSummary(ctx.db, ctx.session.user.id),
  ),

  settleDebt: protectedProcedure
    .input(settleDebtSchema)
    .mutation(({ ctx, input }) =>
      settleDebt(ctx.db, ctx.session.user.id, input.friendId),
    ),

  deleteFriend: protectedProcedure
    .input(settleDebtSchema)
    .mutation(({ ctx, input }) =>
      deleteFriend(ctx.db, ctx.session.user.id, input.friendId),
    ),

  getGroupSettlementProposals: protectedProcedure
    .input(z.object({ groupId: z.string().nullable().optional() }).optional())
    .query(({ ctx, input }) =>
      getGroupSettlementProposals(ctx.db, ctx.session.user.id, input?.groupId),
    ),
});
