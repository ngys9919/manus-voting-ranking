CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(50) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT 'blue',
	`type` enum('seasonal','monthly') NOT NULL,
	`season` varchar(20),
	`targetValue` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`),
	CONSTRAINT `challenges_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `userChallenges` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userChallenges_id` PRIMARY KEY(`id`)
);
