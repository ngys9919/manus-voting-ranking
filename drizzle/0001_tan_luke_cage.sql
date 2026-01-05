CREATE TABLE `parks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`imageUrl` text NOT NULL,
	`eloRating` decimal(10,2) NOT NULL DEFAULT '1500',
	`voteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parks_id` PRIMARY KEY(`id`),
	CONSTRAINT `parks_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`park1Id` int NOT NULL,
	`park2Id` int NOT NULL,
	`winnerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
