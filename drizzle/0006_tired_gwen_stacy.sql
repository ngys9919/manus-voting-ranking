CREATE TABLE `userStreaks` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastVoteDate` timestamp,
	`streakStartDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStreaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `userStreaks_userId_unique` UNIQUE(`userId`)
);
