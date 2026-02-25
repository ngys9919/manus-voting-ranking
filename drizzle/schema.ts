import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * National Parks table for the ranking system.
 * Stores park information and their current ELO rating.
 */
export const parks = mysqlTable("parks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  eloRating: decimal("eloRating", { precision: 10, scale: 2 }).default("1500").notNull(),
  voteCount: int("voteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Park = typeof parks.$inferSelect;
export type InsertPark = typeof parks.$inferInsert;

/**
 * Votes table to record all matchup results.
 * Tracks which park won in each head-to-head comparison.
 */
export const votes = mysqlTable("votes", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  park1Id: int("park1Id").notNull(),
  park2Id: int("park2Id").notNull(),
  winnerId: int("winnerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Park ELO History table to track rating changes over time.
 * Records each ELO rating change for visualization and analysis.
 */
export const parkEloHistory = mysqlTable("parkEloHistory", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  parkId: int("parkId").notNull(),
  eloRating: decimal("eloRating", { precision: 10, scale: 2 }).notNull(),
  voteId: bigint("voteId", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParkEloHistory = typeof parkEloHistory.$inferSelect;
export type InsertParkEloHistory = typeof parkEloHistory.$inferInsert;

/**
 * User Votes table to track individual user voting history.
 * Records which user voted for which park in each matchup.
 */
export const userVotes = mysqlTable("userVotes", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  voteId: bigint("voteId", { mode: "number" }).notNull(),
  parkVotedFor: int("parkVotedFor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserVote = typeof userVotes.$inferSelect;
export type InsertUserVote = typeof userVotes.$inferInsert;

/**
 * Achievements table defining all available achievements in the system.
 * Contains metadata about each achievement type.
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).default("blue").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements table tracking which achievements each user has earned.
 * Records when a user unlocked an achievement.
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;


/**
 * Challenges table defining seasonal and monthly challenges.
 * Tracks challenge metadata, time periods, and requirements.
 */
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).default("blue").notNull(),
  type: mysqlEnum("type", ["seasonal", "monthly"]).notNull(),
  season: varchar("season", { length: 20 }), // "winter", "spring", "summer", "fall"
  targetValue: int("targetValue").notNull(), // e.g., 25 votes, 10 parks
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

/**
 * User Challenges table tracking user progress on challenges.
 * Records current progress and completion status.
 */
export const userChallenges = mysqlTable("userChallenges", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  progress: int("progress").default(0).notNull(),
  isCompleted: boolean("isCompleted").notNull().default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

/**
 * User Streaks table tracking consecutive voting days.
 * Maintains current streak and longest streak for each user.
 */
export const userStreaks = mysqlTable("userStreaks", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastVoteDate: timestamp("lastVoteDate"),
  streakStartDate: timestamp("streakStartDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;


/**
 * Weekly Streak Challenges table tracking weekly competitions.
 * Stores information about each week's challenge period and status.
 */
export const weeklyStreakChallenges = mysqlTable("weeklyStreakChallenges", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  weekEndDate: timestamp("weekEndDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyStreakChallenge = typeof weeklyStreakChallenges.$inferSelect;
export type InsertWeeklyStreakChallenge = typeof weeklyStreakChallenges.$inferInsert;

/**
 * Weekly Badges table tracking limited-time badges earned by top streakers.
 * Stores badge awards for users who rank in top 3 each week.
 */
export const weeklyBadges = mysqlTable("weeklyBadges", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  weeklyChallenge: bigint("weeklyChallenge", { mode: "number" }).notNull(),
  userId: int("userId").notNull(),
  rank: int("rank").notNull(), // 1st, 2nd, or 3rd place
  streakLength: int("streakLength").notNull(),
  badgeIcon: varchar("badgeIcon", { length: 50 }).notNull(), // 🥇, 🥈, 🥉
  badgeName: varchar("badgeName", { length: 100 }).notNull(), // "Weekly Champion", "Weekly Runner-Up", etc.
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyBadge = typeof weeklyBadges.$inferSelect;
export type InsertWeeklyBadge = typeof weeklyBadges.$inferInsert;


/**
 * Weekly Notifications table tracking notifications sent to users.
 * Stores notifications for top 3 rankings and challenge start events.
 */
export const weeklyNotifications = mysqlTable("weeklyNotifications", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weeklyChallenge: bigint("weeklyChallenge", { mode: "number" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'top_3_ranking' | 'challenge_start' | 'challenge_end'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  rank: int("rank"), // For top 3 rankings: 1, 2, or 3
  badgeIcon: varchar("badgeIcon", { length: 50 }), // 🥇, 🥈, 🥉
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyNotification = typeof weeklyNotifications.$inferSelect;
export type InsertWeeklyNotification = typeof weeklyNotifications.$inferInsert;


/**
 * Push Subscriptions table tracking browser push notification subscriptions.
 * Stores subscription endpoints and keys for sending web push notifications.
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
