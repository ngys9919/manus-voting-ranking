import { getDb } from './db';
import { eq, desc } from 'drizzle-orm';
import { weeklyStreakChallenges, weeklyBadges, weeklyNotifications, userStreaks, users } from '../drizzle/schema';

/**
 * Weekly challenge scheduler that runs every Monday at midnight
 * Handles:
 * 1. Ending the previous week's challenge
 * 2. Awarding badges to top 3 streakers
 * 3. Sending notifications to winners
 * 4. Creating a new weekly challenge
 */

export async function scheduleWeeklyChallenge() {
  // Calculate next Monday at midnight
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
  nextMonday.setHours(0, 0, 0, 0);

  const timeUntilNextMonday = nextMonday.getTime() - now.getTime();

  console.log(`[Weekly Scheduler] Next weekly challenge rotation scheduled for ${nextMonday.toISOString()}`);

  // Schedule the weekly challenge rotation
  setTimeout(() => {
    rotateWeeklyChallenge();
    // Then schedule it to repeat every week
    setInterval(rotateWeeklyChallenge, 7 * 24 * 60 * 60 * 1000); // Every 7 days
  }, timeUntilNextMonday);
}

export async function rotateWeeklyChallenge() {
  const db = await getDb();
  if (!db) {
    console.error("[Weekly Scheduler] Database not available");
    return;
  }

  try {
    console.log("[Weekly Scheduler] Starting weekly challenge rotation...");

    // 1. Get the current active challenge
    const activeChallenge = await db
      .select()
      .from(weeklyStreakChallenges)
      .where(eq(weeklyStreakChallenges.isActive, 1) as any)
      .limit(1);

    if (activeChallenge.length > 0) {
      const currentChallenge = activeChallenge[0];
      const challengeId = Number(currentChallenge.id);

      console.log(`[Weekly Scheduler] Processing challenge ${challengeId}`);

      // 2. Award badges to top 3 streakers
      await awardWeeklyBadges(challengeId);

      // 3. Send notifications to winners
      await sendTop3RankingNotifications(challengeId);

      // 4. Send challenge start notifications to all users
      await sendChallengeStartNotifications(challengeId);

      // 5. Mark current challenge as inactive
      await db
        .update(weeklyStreakChallenges)
        .set({
          isActive: 0,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(weeklyStreakChallenges.id, challengeId as any) as any);

      console.log(`[Weekly Scheduler] Challenge ${challengeId} completed`);
    }

    // 6. Create new weekly challenge
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7); // End of week (next Sunday)

    const result = await db.insert(weeklyStreakChallenges).values({
      weekStartDate: weekStart.toISOString(),
      weekEndDate: weekEnd.toISOString(),
      isActive: 1,
    });

    console.log("[Weekly Scheduler] New weekly challenge created");
  } catch (error) {
    console.error("[Weekly Scheduler] Error rotating weekly challenge:", error);
  }
}

async function awardWeeklyBadges(challengeId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get top 3 streakers
    const topStreakers = await db
      .select({
        userId: userStreaks.userId,
        currentStreak: userStreaks.currentStreak,
        userName: users.name,
      })
      .from(userStreaks)
      .innerJoin(users, eq(userStreaks.userId, users.id))
      .orderBy(desc(userStreaks.currentStreak))
      .limit(3);

    const badgeData = [
      { rank: 1, icon: "🥇", name: "Weekly Champion" },
      { rank: 2, icon: "🥈", name: "Weekly Runner-Up" },
      { rank: 3, icon: "🥉", name: "Weekly Third Place" },
    ];

    for (let i = 0; i < topStreakers.length && i < 3; i++) {
      const streaker = topStreakers[i];
      const badge = badgeData[i];

      await db.insert(weeklyBadges).values({
        weeklyChallenge: challengeId as any,
        userId: streaker.userId,
        rank: badge.rank,
        streakLength: streaker.currentStreak,
        badgeIcon: badge.icon,
        badgeName: badge.name,
      });

      console.log(`[Weekly Scheduler] Awarded ${badge.name} to user ${streaker.userId}`);
    }
  } catch (error) {
    console.error("[Weekly Scheduler] Error awarding badges:", error);
  }
}

async function sendTop3RankingNotifications(challengeId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get top 3 badges for this challenge
    const topBadges = await db
      .select({
        rank: weeklyBadges.rank,
        userId: weeklyBadges.userId,
        badgeIcon: weeklyBadges.badgeIcon,
        badgeName: weeklyBadges.badgeName,
        streakLength: weeklyBadges.streakLength,
      })
      .from(weeklyBadges)
      .where(eq(weeklyBadges.weeklyChallenge, challengeId as any) as any)
      .orderBy(weeklyBadges.rank);

    const rankLabels: Record<number, string> = {
      1: "🥇 You're the Weekly Champion!",
      2: "🥈 You're the Weekly Runner-Up!",
      3: "🥉 You earned a Weekly Third Place Badge!",
    };

    for (const badge of topBadges) {
      const rankLabel = rankLabels[badge.rank] || "You earned a weekly badge!";

      await db.insert(weeklyNotifications).values({
        userId: badge.userId,
        weeklyChallenge: challengeId as any,
        type: "top_3_ranking",
        title: rankLabel,
        message: `Congratulations! Your ${badge.streakLength}-day voting streak earned you a ${badge.badgeName} badge. Keep it up!`,
        rank: badge.rank,
        badgeIcon: badge.badgeIcon,
        isRead: 0,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`[Weekly Scheduler] Sent ranking notification to user ${badge.userId}`);
    }
  } catch (error) {
    console.error("[Weekly Scheduler] Error sending ranking notifications:", error);
  }
}

async function sendChallengeStartNotifications(challengeId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all users
    const allUsers = await db.select({ id: users.id }).from(users);

    for (const user of allUsers) {
      await db.insert(weeklyNotifications).values({
        userId: user.id,
        weeklyChallenge: challengeId as any,
        type: "challenge_start",
        title: "🏆 New Weekly Streak Challenge Started!",
        message: "A new weekly challenge has begun! Vote daily to build your streak and compete for top 3 badges.",
        rank: null,
        badgeIcon: null,
        isRead: 0,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`[Weekly Scheduler] Sent challenge start notifications to ${allUsers.length} users`);
  } catch (error) {
    console.error("[Weekly Scheduler] Error sending challenge start notifications:", error);
  }
}

/**
 * Get user's weekly progress
 */
export async function getUserWeeklyProgress(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get user's current streak
    const streak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId) as any)
      .limit(1);

    if (streak.length === 0) {
      return { userId, challengeId, currentStreak: 0, rank: null };
    }

    // Get user's rank if they have a badge
    const badge = await db
      .select()
      .from(weeklyBadges)
      .where(
        eq(weeklyBadges.userId, userId) &&
        eq(weeklyBadges.weeklyChallenge, challengeId as any)
      )
      .limit(1);

    return {
      userId,
      challengeId,
      currentStreak: streak[0].currentStreak,
      rank: badge.length > 0 ? badge[0].rank : null,
    };
  } catch (error) {
    console.error("[Weekly Scheduler] Error getting user progress:", error);
    return null;
  }
}

/**
 * Get weekly leaderboard
 */
export async function getWeeklyLeaderboard(challengeId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const leaderboard = await db
      .select({
        rank: weeklyBadges.rank,
        userId: weeklyBadges.userId,
        userName: users.name,
        streakLength: weeklyBadges.streakLength,
        badgeIcon: weeklyBadges.badgeIcon,
        badgeName: weeklyBadges.badgeName,
      })
      .from(weeklyBadges)
      .innerJoin(users, eq(weeklyBadges.userId, users.id))
      .where(eq(weeklyBadges.weeklyChallenge, challengeId as any) as any)
      .orderBy(weeklyBadges.rank);

    return leaderboard;
  } catch (error) {
    console.error("[Weekly Scheduler] Error getting leaderboard:", error);
    return [];
  }
}
