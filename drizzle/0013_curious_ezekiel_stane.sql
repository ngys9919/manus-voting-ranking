ALTER TABLE `achievements` DROP INDEX `achievements_code_unique`;--> statement-breakpoint
ALTER TABLE `challenges` DROP INDEX `challenges_code_unique`;--> statement-breakpoint
ALTER TABLE `parks` DROP INDEX `parks_name_unique`;--> statement-breakpoint
ALTER TABLE `referrals` DROP INDEX `referrals_referralCode_unique`;--> statement-breakpoint
ALTER TABLE `userReferralStats` DROP INDEX `userReferralStats_userId_unique`;--> statement-breakpoint
ALTER TABLE `userReferralStats` DROP INDEX `userReferralStats_referralCode_unique`;--> statement-breakpoint
ALTER TABLE `userStreaks` DROP INDEX `userStreaks_userId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `achievements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `challenges` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `parkEloHistory` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `parks` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `userAchievements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `userChallenges` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `userVotes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `votes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `achievements` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `challenges` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `challenges` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `parkEloHistory` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `parks` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `referralRewards` MODIFY COLUMN `isRedeemed` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `referralRewards` MODIFY COLUMN `isRedeemed` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `referralRewards` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `referralRewards` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `userAchievements` MODIFY COLUMN `unlockedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `userChallenges` MODIFY COLUMN `isCompleted` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `userChallenges` MODIFY COLUMN `isCompleted` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `userChallenges` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `userReferralStats` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `userReferralStats` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `userStreaks` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `userStreaks` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `userVotes` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `votes` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `weeklyBadges` MODIFY COLUMN `awardedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `weeklyBadges` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `weeklyNotifications` MODIFY COLUMN `isRead` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `weeklyNotifications` MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `weeklyNotifications` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `weeklyNotifications` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `weeklyStreakChallenges` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `weeklyStreakChallenges` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `weeklyStreakChallenges` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `parks` ADD `establishedYear` int;--> statement-breakpoint
ALTER TABLE `parks` ADD `areaSqMiles` decimal(10,2);--> statement-breakpoint
ALTER TABLE `parks` ADD `annualVisitors` int;--> statement-breakpoint
ALTER TABLE `parks` ADD `description` text;