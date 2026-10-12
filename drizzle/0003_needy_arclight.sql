CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(40) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(60),
	`payload` text NOT NULL,
	`sheetsSynced` enum('true','false') NOT NULL DEFAULT 'false',
	`sheetsAttempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
