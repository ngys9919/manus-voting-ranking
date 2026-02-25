CREATE TABLE `weeklyBadges` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`weeklyChallenge` bigint NOT NULL,
	`userId` int NOT NULL,
	`rank` int NOT NULL,
	`streakLength` int NOT NULL,
	`badgeIcon` varchar(50) NOT NULL,
	`badgeName` varchar(100) NOT NULL,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyStreakChallenges` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weeklyStreakChallenges_id` PRIMARY KEY(`id`)
);
