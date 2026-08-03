CREATE TABLE `email_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int NOT NULL,
	`subject` text NOT NULL,
	`articleCount` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` varchar(20) NOT NULL DEFAULT 'sent',
	`errorMessage` text,
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_engagement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64),
	`category` varchar(100),
	CONSTRAINT `news_engagement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text,
	`subscribed` enum('true','false') NOT NULL DEFAULT 'true',
	`categories` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`unsubscribeToken` varchar(64),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `newsletter_subscribers_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` varchar(255) NOT NULL,
	`referrer` varchar(2048),
	`userAgent` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
