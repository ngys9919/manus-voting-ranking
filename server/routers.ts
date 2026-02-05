import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllParksSortedByElo,
  getRandomParkPair,
  getRecentVotes,
  getParkById,
  recordVote,
  getParkEloHistory,
  getUserVotes,
  getUserStatistics,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  parks: router({
    getMatchup: publicProcedure.query(async () => {
      const pair = await getRandomParkPair();
      return pair;
    }),

    getRankings: publicProcedure.query(async () => {
      const rankings = await getAllParksSortedByElo();
      return rankings;
    }),

    getRecentVotes: publicProcedure
      .input(z.object({ limit: z.number().default(30) }))
      .query(async ({ input }) => {
        const recentVotes = await getRecentVotes(input.limit);
        // Enrich votes with park information
        const enrichedVotes = await Promise.all(
          recentVotes.map(async (vote) => {
            const park1 = await getParkById(vote.park1Id);
            const park2 = await getParkById(vote.park2Id);
            const winner = await getParkById(vote.winnerId);
            return {
              ...vote,
              park1,
              park2,
              winner,
            };
          })
        );
        return enrichedVotes;
      }),

    submitVote: publicProcedure
      .input(
        z.object({
          park1Id: z.number(),
          park2Id: z.number(),
          winnerId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await recordVote(
          input.park1Id,
          input.park2Id,
          input.winnerId,
          ctx.user?.id
        );
        return result;
      }),

    getEloHistory: publicProcedure
      .input(
        z.object({
          parkId: z.number(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        const history = await getParkEloHistory(input.parkId, input.limit);
        return history;
      }),
  }),

  profile: router({
    getUserVotes: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        const userVotesData = await getUserVotes(ctx.user.id, input.limit);
        const enrichedVotes = await Promise.all(
          userVotesData.map(async (vote) => {
            const park = await getParkById(vote.parkVotedFor);
            return {
              ...vote,
              park,
            };
          })
        );
        return enrichedVotes;
      }),

    getStatistics: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getUserStatistics(ctx.user.id);
      return stats;
    }),
  }),
});

export type AppRouter = typeof appRouter;
