CREATE TABLE `userVotes` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`voteId` bigint NOT NULL,
	`parkVotedFor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userVotes_id` PRIMARY KEY(`id`)
);
