import { mysqlTable, int, varchar, text, timestamp, bigint, decimal, mysqlEnum, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const achievements = mysqlTable("achievements", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	icon: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 20 }).default('blue').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const challenges = mysqlTable("challenges", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	icon: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 20 }).default('blue').notNull(),
	type: mysqlEnum(['seasonal','monthly']).notNull(),
	season: varchar({ length: 20 }),
	targetValue: int().notNull(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const parkEloHistory = mysqlTable("parkEloHistory", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	parkId: int().notNull(),
	eloRating: decimal({ precision: 10, scale: 2 }).notNull(),
	voteId: bigint({ mode: "number" }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const parks = mysqlTable("parks", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	location: varchar({ length: 255 }).notNull(),
	imageUrl: text().notNull(),
	eloRating: decimal({ precision: 10, scale: 2 }).default('1500').notNull(),
	voteCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	establishedYear: int(),
	areaSqMiles: decimal({ precision: 10, scale: 2 }),
	annualVisitors: int(),
	description: text(),
});

export const userAchievements = mysqlTable("userAchievements", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: int().notNull(),
	achievementId: int().notNull(),
	unlockedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const userChallenges = mysqlTable("userChallenges", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: int().notNull(),
	challengeId: int().notNull(),
	progress: int().default(0).notNull(),
	isCompleted: tinyint().default(0).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const userVotes = mysqlTable("userVotes", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: int().notNull(),
	voteId: bigint({ mode: "number" }).notNull(),
	parkVotedFor: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	displayName: varchar({ length: 255 }),
	avatarUrl: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const votes = mysqlTable("votes", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	park1Id: int().notNull(),
	park2Id: int().notNull(),
	winnerId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

/**
 * Referrals table to track user referral relationships.
 */
export const referrals = mysqlTable("referrals", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	referrerId: int().notNull(),
	refereeId: int().notNull(),
	referralCode: varchar({ length: 20 }).notNull(),
	status: mysqlEnum(['pending','completed','expired']).default('pending').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Referral Rewards table to track rewards earned from referrals.
 */
export const referralRewards = mysqlTable("referralRewards", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	referralId: bigint({ mode: "number" }).notNull(),
	userId: int().notNull(),
	rewardType: mysqlEnum(['bonus_votes','exclusive_badge','bonus_points']).notNull(),
	rewardValue: int().notNull(),
	description: varchar({ length: 255 }).notNull(),
	isRedeemed: tinyint().default(0).notNull(),
	redeemedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

/**
 * User Referral Stats table to track referral statistics per user.
 */
export const userReferralStats = mysqlTable("userReferralStats", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull(),
	referralCode: varchar({ length: 20 }).notNull(),
	totalInvites: int().default(0).notNull(),
	completedReferrals: int().default(0).notNull(),
	totalRewardsEarned: int().default(0).notNull(),
	lastInviteSentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type UserReferralStats = typeof userReferralStats.$inferSelect;
export type InsertUserReferralStats = typeof userReferralStats.$inferInsert;

/**
 * User Streaks table to track voting streaks per user.
 */
export const userStreaks = mysqlTable("userStreaks", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	userId: int().notNull(),
	currentStreak: int().default(0).notNull(),
	longestStreak: int().default(0).notNull(),
	lastVoteDate: timestamp({ mode: 'string' }),
	streakStartDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;

/**
 * Weekly Streak Challenges table to track weekly competitions.
 */
export const weeklyStreakChallenges = mysqlTable("weeklyStreakChallenges", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	weekStartDate: timestamp({ mode: 'string' }).notNull(),
	weekEndDate: timestamp({ mode: 'string' }).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type WeeklyStreakChallenge = typeof weeklyStreakChallenges.$inferSelect;
export type InsertWeeklyStreakChallenge = typeof weeklyStreakChallenges.$inferInsert;

/**
 * Weekly Badges table to award badges to top 3 streakers.
 */
export const weeklyBadges = mysqlTable("weeklyBadges", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	weeklyChallenge: bigint({ mode: "number" }).notNull(),
	userId: int().notNull(),
	rank: int().notNull(),
	streakLength: int().notNull(),
	badgeIcon: varchar({ length: 50 }).notNull(),
	badgeName: varchar({ length: 100 }).notNull(),
	awardedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export type WeeklyBadge = typeof weeklyBadges.$inferSelect;
export type InsertWeeklyBadge = typeof weeklyBadges.$inferInsert;

/**
 * Weekly Notifications table to track user notifications.
 */
export const weeklyNotifications = mysqlTable("weeklyNotifications", {
	id: bigint({ mode: "number" }).autoincrement().notNull().primaryKey(),
	userId: int().notNull(),
	weeklyChallenge: bigint({ mode: "number" }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	rank: int(),
	badgeIcon: varchar({ length: 50 }),
	isRead: tinyint().default(0).notNull(),
	readAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
});

export type WeeklyNotification = typeof weeklyNotifications.$inferSelect;
export type InsertWeeklyNotification = typeof weeklyNotifications.$inferInsert;
