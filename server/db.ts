import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, parks, votes, InsertPark, parkEloHistory, InsertParkEloHistory, userVotes, InsertUserVote, achievements, userAchievements, InsertAchievement, InsertUserAchievement, challenges, userChallenges, InsertChallenge, InsertUserChallenge } from "../drizzle/schema";
import { ENV } from './_core/env';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  {
    code: 'first_vote',
    name: 'First Vote',
    description: 'Cast your first vote',
    icon: 'Zap',
    color: 'yellow',
  },
  {
    code: 'ten_votes',
    name: 'Voting Enthusiast',
    description: 'Cast 10 votes',
    icon: 'Flame',
    color: 'orange',
  },
  {
    code: 'fifty_votes',
    name: 'Park Ranger',
    description: 'Cast 50 votes',
    icon: 'Trophy',
    color: 'green',
  },
  {
    code: 'hundred_votes',
    name: 'Voting Champion',
    description: 'Cast 100 votes',
    icon: 'Crown',
    color: 'purple',
  },
  {
    code: 'favorite_top_ten',
    name: 'Favorite in Top 10',
    description: 'Your favorite park reaches the top 10',
    icon: 'Star',
    color: 'blue',
  },
  {
    code: 'favorite_top_five',
    name: 'Favorite in Top 5',
    description: 'Your favorite park reaches the top 5',
    icon: 'Sparkles',
    color: 'cyan',
  },
  {
    code: 'favorite_number_one',
    name: 'Ultimate Fan',
    description: 'Your favorite park reaches #1',
    icon: 'Heart',
    color: 'red',
  },
];

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Parks and Votes functions

export async function getAllParksSortedByElo() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parks: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(parks)
      .orderBy(desc(parks.eloRating));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get parks:", error);
    throw error;
  }
}

export async function getRandomParkPair() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parks: database not available");
    return null;
  }

  try {
    const allParks = await db.select().from(parks);
    if (allParks.length < 2) return null;

    const idx1 = Math.floor(Math.random() * allParks.length);
    let idx2 = Math.floor(Math.random() * allParks.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * allParks.length);
    }

    return {
      park1: allParks[idx1],
      park2: allParks[idx2],
    };
  } catch (error) {
    console.error("[Database] Failed to get random park pair:", error);
    throw error;
  }
}

export async function getRecentVotes(limit: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get votes: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(votes)
      .orderBy(desc(votes.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get recent votes:", error);
    throw error;
  }
}

export async function getParkById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get park: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(parks)
      .where(eq(parks.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get park:", error);
    throw error;
  }
}

function calculateEloRatings(
  rating1: number,
  rating2: number,
  player1Won: boolean
): { newRating1: number; newRating2: number } {
  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

  const actual1 = player1Won ? 1 : 0;
  const actual2 = player1Won ? 0 : 1;

  const newRating1 = Math.round(rating1 + K * (actual1 - expected1));
  const newRating2 = Math.round(rating2 + K * (actual2 - expected2));

  return { newRating1, newRating2 };
}

export async function recordVote(
  park1Id: number,
  park2Id: number,
  winnerId: number,
  userId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record vote: database not available");
    return null;
  }

  try {
    const park1 = await getParkById(park1Id);
    const park2 = await getParkById(park2Id);

    if (!park1 || !park2) {
      throw new Error("One or both parks not found");
    }

    const { newRating1, newRating2 } = calculateEloRatings(
      parseFloat(park1.eloRating.toString()),
      parseFloat(park2.eloRating.toString()),
      winnerId === park1Id
    );

    await db
      .update(parks)
      .set({ eloRating: newRating1.toString() })
      .where(eq(parks.id, park1Id));

    await db
      .update(parks)
      .set({ eloRating: newRating2.toString() })
      .where(eq(parks.id, park2Id));

    await db
      .update(parks)
      .set({ voteCount: park1.voteCount + 1 })
      .where(eq(parks.id, park1Id));

    await db
      .update(parks)
      .set({ voteCount: park2.voteCount + 1 })
      .where(eq(parks.id, park2Id));

    const voteResult = await db.insert(votes).values({
      park1Id,
      park2Id,
      winnerId,
    });

    // Record ELO history for both parks
    // Get the vote ID from the inserted vote
    const insertedVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.winnerId, winnerId))
      .orderBy(desc(votes.createdAt))
      .limit(1);
    
    if (insertedVotes.length > 0) {
      const voteId = insertedVotes[0].id;
      await recordEloHistory(park1Id, newRating1, voteId);
      await recordEloHistory(park2Id, newRating2, voteId);
      
      // Record user vote if userId is provided
      if (userId) {
        await recordUserVote(userId, voteId, winnerId);
      }
    }

    return {
      park1: { ...park1, eloRating: newRating1 },
      park2: { ...park2, eloRating: newRating2 },
      vote: voteResult,
    };
  } catch (error) {
    console.error("[Database] Failed to record vote:", error);
    throw error;
  }
}

export async function getParkEloHistory(parkId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ELO history: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(parkEloHistory)
      .where(eq(parkEloHistory.parkId, parkId))
      .orderBy(desc(parkEloHistory.createdAt))
      .limit(limit);
    return result.reverse(); // Return in chronological order
  } catch (error) {
    console.error("[Database] Failed to get ELO history:", error);
    throw error;
  }
}

export async function recordEloHistory(
  parkId: number,
  eloRating: number,
  voteId: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record ELO history: database not available");
    return;
  }

  try {
    await db.insert(parkEloHistory).values({
      parkId,
      eloRating: eloRating.toString(),
      voteId,
    });
  } catch (error) {
    console.error("[Database] Failed to record ELO history:", error);
    throw error;
  }
}

export async function recordUserVote(
  userId: number,
  voteId: number,
  parkVotedFor: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record user vote: database not available");
    return;
  }

  try {
    await db.insert(userVotes).values({
      userId,
      voteId,
      parkVotedFor,
    });
  } catch (error) {
    console.error("[Database] Failed to record user vote:", error);
    throw error;
  }
}

export async function getUserVotes(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user votes: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(userVotes)
      .where(eq(userVotes.userId, userId))
      .orderBy(desc(userVotes.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user votes:", error);
    throw error;
  }
}

export async function getUserStatistics(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user statistics: database not available");
    return null;
  }

  try {
    const userVotesData = await getUserVotes(userId, 1000);
    const totalVotes = userVotesData.length;

    let favoritePark = null;
    if (totalVotes > 0) {
      const voteCounts: Record<number, number> = {};
      for (const vote of userVotesData) {
        voteCounts[vote.parkVotedFor] = (voteCounts[vote.parkVotedFor] || 0) + 1;
      }
      const mostVotedParkId = Object.keys(voteCounts).reduce((a, b) =>
        voteCounts[parseInt(a)] > voteCounts[parseInt(b)] ? a : b
      );
      favoritePark = await getParkById(parseInt(mostVotedParkId));
    }

    return {
      totalVotes,
      favoritePark,
    };
  } catch (error) {
    console.error("[Database] Failed to get user statistics:", error);
    throw error;
  }
}

export async function seedParks(parksData: InsertPark[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed parks: database not available");
    return;
  }

  try {
    await db.insert(parks).values(parksData);
    console.log(`[Database] Seeded ${parksData.length} parks`);
  } catch (error) {
    console.error("[Database] Failed to seed parks:", error);
    throw error;
  }
}


// Achievement functions

export async function seedAchievements() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed achievements: database not available");
    return;
  }

  try {
    // Check if achievements already exist
    const existingAchievements = await db.select().from(achievements);
    if (existingAchievements.length > 0) {
      console.log("[Database] Achievements already seeded");
      return;
    }

    const achievementsToInsert = ACHIEVEMENT_DEFINITIONS.map(def => ({
      code: def.code,
      name: def.name,
      description: def.description,
      icon: def.icon,
      color: def.color,
    }));

    await db.insert(achievements).values(achievementsToInsert);
    console.log(`[Database] Seeded ${achievementsToInsert.length} achievements`);
  } catch (error) {
    console.error("[Database] Failed to seed achievements:", error);
    throw error;
  }
}

export async function getAchievementByCode(code: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get achievement: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(achievements)
      .where(eq(achievements.code, code))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get achievement:", error);
    throw error;
  }
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user achievements: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user achievements:", error);
    throw error;
  }
}

export async function hasUserAchievement(userId: number, achievementCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check achievement: database not available");
    return false;
  }

  try {
    const achievement = await getAchievementByCode(achievementCode);
    if (!achievement) return false;

    const result = await db
      .select()
      .from(userAchievements)
      .where(
        eq(userAchievements.userId, userId) &&
        eq(userAchievements.achievementId, achievement.id)
      )
      .limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check achievement:", error);
    throw error;
  }
}

export async function unlockAchievement(userId: number, achievementCode: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot unlock achievement: database not available");
    return null;
  }

  try {
    // Check if already unlocked
    const alreadyUnlocked = await hasUserAchievement(userId, achievementCode);
    if (alreadyUnlocked) {
      return null;
    }

    const achievement = await getAchievementByCode(achievementCode);
    if (!achievement) {
      console.warn(`[Database] Achievement not found: ${achievementCode}`);
      return null;
    }

    const result = await db.insert(userAchievements).values({
      userId,
      achievementId: achievement.id,
    });

    return achievement;
  } catch (error) {
    console.error("[Database] Failed to unlock achievement:", error);
    throw error;
  }
}

export async function checkAndUnlockAchievements(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check achievements: database not available");
    return [];
  }

  try {
    const unlockedAchievements = [];
    const userStats = await getUserStatistics(userId);
    
    if (!userStats) return [];

    const totalVotes = userStats.totalVotes;
    const favoritePark = userStats.favoritePark;

    // Check vote count achievements
    if (totalVotes === 1) {
      const achievement = await unlockAchievement(userId, 'first_vote');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (totalVotes === 10) {
      const achievement = await unlockAchievement(userId, 'ten_votes');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (totalVotes === 50) {
      const achievement = await unlockAchievement(userId, 'fifty_votes');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (totalVotes === 100) {
      const achievement = await unlockAchievement(userId, 'hundred_votes');
      if (achievement) unlockedAchievements.push(achievement);
    }

    // Check favorite park achievements
    if (favoritePark) {
      const allParks = await getAllParksSortedByElo();
      const parkRank = allParks.findIndex(p => p.id === favoritePark.id) + 1;

      if (parkRank === 1) {
        const achievement = await unlockAchievement(userId, 'favorite_number_one');
        if (achievement) unlockedAchievements.push(achievement);
      } else if (parkRank <= 5) {
        const achievement = await unlockAchievement(userId, 'favorite_top_five');
        if (achievement) unlockedAchievements.push(achievement);
      } else if (parkRank <= 10) {
        const achievement = await unlockAchievement(userId, 'favorite_top_ten');
        if (achievement) unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error("[Database] Failed to check achievements:", error);
    throw error;
  }
}


// Challenge definitions
export const CHALLENGE_DEFINITIONS = [
  // Monthly Challenges
  {
    code: 'monthly_votes_25',
    name: 'Vote Machine',
    description: 'Cast 25 votes this month',
    icon: 'Zap',
    color: 'blue',
    type: 'monthly' as const,
    targetValue: 25,
  },
  {
    code: 'monthly_parks_15',
    name: 'Park Explorer',
    description: 'Vote for 15 different parks this month',
    icon: 'Map',
    color: 'green',
    type: 'monthly' as const,
    targetValue: 15,
  },
  {
    code: 'monthly_streak_10',
    name: 'Voting Streak',
    description: 'Vote on 10 consecutive days this month',
    icon: 'Flame',
    color: 'orange',
    type: 'monthly' as const,
    targetValue: 10,
  },
  // Seasonal Challenges
  {
    code: 'seasonal_winter_100',
    name: 'Winter Champion',
    description: 'Cast 100 votes during winter season',
    icon: 'Snowflake',
    color: 'cyan',
    type: 'seasonal' as const,
    season: 'winter',
    targetValue: 100,
  },
  {
    code: 'seasonal_spring_100',
    name: 'Spring Awakening',
    description: 'Cast 100 votes during spring season',
    icon: 'Flower2',
    color: 'pink',
    type: 'seasonal' as const,
    season: 'spring',
    targetValue: 100,
  },
  {
    code: 'seasonal_summer_100',
    name: 'Summer Vacation',
    description: 'Cast 100 votes during summer season',
    icon: 'Sun',
    color: 'yellow',
    type: 'seasonal' as const,
    season: 'summer',
    targetValue: 100,
  },
  {
    code: 'seasonal_fall_100',
    name: 'Fall Festival',
    description: 'Cast 100 votes during fall season',
    icon: 'Leaf',
    color: 'orange',
    type: 'seasonal' as const,
    season: 'fall',
    targetValue: 100,
  },
];

// Challenge management functions

export async function seedChallenges() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed challenges: database not available");
    return;
  }

  try {
    // Check if challenges already exist
    const existingChallenges = await db.select().from(challenges);
    if (existingChallenges.length > 0) {
      console.log("[Database] Challenges already seeded");
      return;
    }

    // Create current month and season dates
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Determine current season
    const month = now.getMonth();
    let currentSeason = 'winter';
    if (month >= 2 && month < 5) currentSeason = 'spring';
    else if (month >= 5 && month < 8) currentSeason = 'summer';
    else if (month >= 8 && month < 11) currentSeason = 'fall';

    const challengesToInsert = CHALLENGE_DEFINITIONS.map(def => {
      let startDate = currentMonth;
      let endDate = nextMonth;

      if (def.type === 'seasonal') {
        // Calculate season dates
        if (def.season === 'winter') {
          startDate = new Date(now.getFullYear(), 11, 21);
          endDate = new Date(now.getFullYear() + 1, 2, 20);
        } else if (def.season === 'spring') {
          startDate = new Date(now.getFullYear(), 2, 20);
          endDate = new Date(now.getFullYear(), 5, 20);
        } else if (def.season === 'summer') {
          startDate = new Date(now.getFullYear(), 5, 20);
          endDate = new Date(now.getFullYear(), 8, 22);
        } else if (def.season === 'fall') {
          startDate = new Date(now.getFullYear(), 8, 22);
          endDate = new Date(now.getFullYear(), 11, 21);
        }
      }

      return {
        code: def.code,
        name: def.name,
        description: def.description,
        icon: def.icon,
        color: def.color,
        type: def.type,
        season: def.season || null,
        targetValue: def.targetValue,
        startDate,
        endDate,
        isActive: true,
      };
    });

    await db.insert(challenges).values(challengesToInsert);
    console.log(`[Database] Seeded ${challengesToInsert.length} challenges`);
  } catch (error) {
    console.error("[Database] Failed to seed challenges:", error);
    throw error;
  }
}

export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get challenges: database not available");
    return [];
  }

  try {
    const now = new Date();
    const result = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true));
    // Filter in memory for date comparison
    return result.filter(c => c.startDate <= now && c.endDate >= now);
  } catch (error) {
    console.error("[Database] Failed to get active challenges:", error);
    throw error;
  }
}

export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user challenge progress: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: userChallenges.id,
        userId: userChallenges.userId,
        challengeId: userChallenges.challengeId,
        progress: userChallenges.progress,
        isCompleted: userChallenges.isCompleted,
        completedAt: userChallenges.completedAt,
        challenge: challenges,
      })
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(eq(userChallenges.userId, userId));
    return result.map(r => ({
      ...r,
      completedAt: r.completedAt || undefined,
    }));
  } catch (error) {
    console.error("[Database] Failed to get user challenge progress:", error);
    throw error;
  }
}

export async function updateChallengeProgress(userId: number, challengeId: number, increment: number = 1) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update challenge progress: database not available");
    return null;
  }

  try {
    // Get or create user challenge
    let userChallenge = await db
      .select()
      .from(userChallenges)
      .where(
        eq(userChallenges.userId, userId) &&
        eq(userChallenges.challengeId, challengeId)
      )
      .limit(1);

    if (userChallenge.length === 0) {
      // Create new user challenge
      await db.insert(userChallenges).values({
        userId,
        challengeId,
        progress: increment,
      });
    } else {
      // Update existing progress
      const newProgress = userChallenge[0].progress + increment;
      
      // Get challenge to check if completed
      const challenge = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

      const isCompleted = challenge.length > 0 && newProgress >= challenge[0].targetValue;

      await db
        .update(userChallenges)
        .set({
          progress: newProgress,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .where(
          eq(userChallenges.userId, userId) &&
          eq(userChallenges.challengeId, challengeId)
        );
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to update challenge progress:", error);
    throw error;
  }
}

export async function getCompletedChallenges(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get completed challenges: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: userChallenges.id,
        userId: userChallenges.userId,
        challengeId: userChallenges.challengeId,
        progress: userChallenges.progress,
        isCompleted: userChallenges.isCompleted,
        completedAt: userChallenges.completedAt,
        challenge: challenges,
      })
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(
        eq(userChallenges.userId, userId) &&
        eq(userChallenges.isCompleted, true)
      )
      .orderBy(desc(userChallenges.completedAt));
    return result.map(r => ({
      ...r,
      completedAt: r.completedAt || undefined,
    }));
  } catch (error) {
    console.error("[Database] Failed to get completed challenges:", error);
    throw error;
  }
}


// Challenge Notification Helper Functions

export interface ChallengeNotification {
  type: 'milestone' | 'completion';
  challengeName: string;
  challengeCode: string;
  message: string;
  percentage: number;
  icon: string;
}

export async function getChallengeNotifications(userId: number, challengeId: number): Promise<ChallengeNotification[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get challenge notifications: database not available");
    return [];
  }

  try {
    const notifications: ChallengeNotification[] = [];

    // Get user challenge progress
    const userChallenge = await db
      .select()
      .from(userChallenges)
      .where(
        eq(userChallenges.userId, userId) &&
        eq(userChallenges.challengeId, challengeId)
      )
      .limit(1);

    if (userChallenge.length === 0) {
      return [];
    }

    // Get challenge details
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return [];
    }

    const progress = userChallenge[0].progress;
    const target = challenge[0].targetValue;
    const percentage = Math.round((progress / target) * 100);

    // Check for completion
    if (userChallenge[0].isCompleted && percentage >= 100) {
      notifications.push({
        type: 'completion',
        challengeName: challenge[0].name,
        challengeCode: challenge[0].code,
        message: `🎉 Challenge Completed: ${challenge[0].name}!`,
        percentage: 100,
        icon: '🏆',
      });
    }
    // Check for 90% milestone
    else if (percentage >= 90 && percentage < 100) {
      notifications.push({
        type: 'milestone',
        challengeName: challenge[0].name,
        challengeCode: challenge[0].code,
        message: `Nearly done! ${progress}/${target} - Just ${target - progress} more to go!`,
        percentage,
        icon: '🔥',
      });
    }
    // Check for 75% milestone
    else if (percentage >= 75 && percentage < 90) {
      notifications.push({
        type: 'milestone',
        challengeName: challenge[0].name,
        challengeCode: challenge[0].code,
        message: `Almost there! You're ${percentage}% complete on ${challenge[0].name}!`,
        percentage,
        icon: '⚡',
      });
    }

    return notifications;
  } catch (error) {
    console.error("[Database] Failed to get challenge notifications:", error);
    return [];
  }
}

export async function getAllChallengeNotifications(userId: number): Promise<ChallengeNotification[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all challenge notifications: database not available");
    return [];
  }

  try {
    const allNotifications: ChallengeNotification[] = [];

    // Get all user challenges
    const userChallenges_ = await db
      .select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId));

    // Get notifications for each challenge
    for (const userChallenge of userChallenges_) {
      const notifications = await getChallengeNotifications(userId, userChallenge.challengeId);
      allNotifications.push(...notifications);
    }

    return allNotifications;
  } catch (error) {
    console.error("[Database] Failed to get all challenge notifications:", error);
    return [];
  }
}
