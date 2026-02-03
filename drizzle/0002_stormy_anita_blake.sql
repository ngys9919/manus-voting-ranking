CREATE TABLE `parkEloHistory` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`parkId` int NOT NULL,
	`eloRating` decimal(10,2) NOT NULL,
	`voteId` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parkEloHistory_id` PRIMARY KEY(`id`)
);
