CREATE TABLE `mining_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`headline` text NOT NULL,
	`excerpt` text NOT NULL,
	`publication` varchar(255) NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`category` varchar(100),
	CONSTRAINT `mining_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
