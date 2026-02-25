CREATE TABLE `referralRewards` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`referralId` bigint NOT NULL,
	`userId` int NOT NULL,
	`rewardType` enum('bonus_votes','exclusive_badge','bonus_points') NOT NULL,
	`rewardValue` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`isRedeemed` boolean NOT NULL DEFAULT false,
	`redeemedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`status` enum('pending','completed','expired') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `userReferralStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`totalInvites` int NOT NULL DEFAULT 0,
	`completedReferrals` int NOT NULL DEFAULT 0,
	`totalRewardsEarned` int NOT NULL DEFAULT 0,
	`lastInviteSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userReferralStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `userReferralStats_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `userReferralStats_referralCode_unique` UNIQUE(`referralCode`)
);
