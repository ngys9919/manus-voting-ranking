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
  getUserAchievements,
  checkAndUnlockAchievements,
  seedAchievements,
  getActiveChallenges,
  getUserChallengeProgress,
  updateChallengeProgress,
  getCompletedChallenges,
  getChallengeNotifications,
  getAllChallengeNotifications,
  updateVotingStreak,
  getUserStreak,
  getStreakLeaderboard,
  getOrCreateCurrentWeeklyChallenge,
  awardWeeklyBadges,
  getUserWeeklyBadges,
  completeWeeklyChallenge,
  sendTop3RankingNotifications,
  sendChallengeStartNotifications,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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

    getAchievements: protectedProcedure.query(async ({ ctx }) => {
      const achievements = await getUserAchievements(ctx.user.id);
      return achievements;
    }),
  }),

  achievements: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const achievements = await getUserAchievements(ctx.user.id);
      return achievements;
    }),

    checkAndUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      const unlockedAchievements = await checkAndUnlockAchievements(ctx.user.id);
      return unlockedAchievements;
    }),
  }),

  challenges: router({
    getActive: publicProcedure.query(async () => {
      const activeChallenges = await getActiveChallenges();
      return activeChallenges;
    }),

    getUserProgress: protectedProcedure.query(async ({ ctx }) => {
      const progress = await getUserChallengeProgress(ctx.user.id);
      return progress;
    }),

    getCompleted: protectedProcedure.query(async ({ ctx }) => {
      const completed = await getCompletedChallenges(ctx.user.id);
      return completed;
    }),

    updateProgress: protectedProcedure
      .input(
        z.object({
          challengeId: z.number(),
          increment: z.number().default(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await updateChallengeProgress(
          ctx.user.id,
          input.challengeId,
          input.increment
        );
        return result;
      }),

    getNotifications: protectedProcedure
      .input(
        z.object({
          challengeId: z.number(),
        })
      )
      .query(async ({ input, ctx }) => {
        const notifications = await getChallengeNotifications(
          ctx.user.id,
          input.challengeId
        );
        return notifications;
      }),

    getAllNotifications: protectedProcedure.query(async ({ ctx }) => {
      const notifications = await getAllChallengeNotifications(ctx.user.id);
      return notifications;
    }),
  }),

  streaks: router({
    updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
      const notification = await updateVotingStreak(ctx.user.id);
      return notification;
    }),

    getUserStreak: protectedProcedure.query(async ({ ctx }) => {
      const streak = await getUserStreak(ctx.user.id);
      return streak;
    }),

    getLeaderboard: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(10),
        })
      )
      .query(async ({ input }) => {
        const leaderboard = await getStreakLeaderboard(input.limit);
        return leaderboard;
      }),
  }),

  weeklyStreakChallenges: router({
    getCurrent: publicProcedure.query(async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      return challenge;
    }),

    getUserBadges: protectedProcedure.query(async ({ ctx }) => {
      const badges = await getUserWeeklyBadges(ctx.user.id);
      return badges;
    }),

    awardBadges: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        const badges = await awardWeeklyBadges(input.challengeId);
        return badges;
      }),

    completeChallenge: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await completeWeeklyChallenge(input.challengeId);
        return success;
      }),
  }),

  notifications: router({
    getNotifications: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        const notifications = await getUserNotifications(ctx.user.id, input.limit);
        return notifications;
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await getUnreadNotificationCount(ctx.user.id);
      return count;
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await markNotificationAsRead(input.notificationId);
        return success;
      }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const success = await markAllNotificationsAsRead(ctx.user.id);
      return success;
    }),

    sendTop3Notifications: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        const notifications = await sendTop3RankingNotifications(input.challengeId);
        return notifications;
      }),

    sendChallengeStartNotifications: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        const notifications = await sendChallengeStartNotifications(input.challengeId);
        return notifications;
      }),
  }),
});

export type AppRouter = typeof appRouter;
