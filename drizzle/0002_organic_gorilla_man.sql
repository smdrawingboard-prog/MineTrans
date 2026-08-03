CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`certificateNumber` varchar(64) NOT NULL,
	`issuedDate` timestamp NOT NULL DEFAULT (now()),
	`certificateUrl` varchar(2048),
	`finalScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `certification_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`totalSections` int NOT NULL,
	`passingScore` int NOT NULL DEFAULT 70,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certification_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certification_students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text NOT NULL,
	`passwordHash` text NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`status` enum('active','completed','suspended') NOT NULL DEFAULT 'active',
	CONSTRAINT `certification_students_id` PRIMARY KEY(`id`),
	CONSTRAINT `certification_students_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `course_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`sectionNumber` int NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`quizId` int NOT NULL,
	`score` int NOT NULL,
	`totalPoints` int NOT NULL,
	`answers` text NOT NULL,
	`passed` enum('true','false') NOT NULL,
	`timeSpent` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','true_false','short_answer','calculation') NOT NULL,
	`options` text,
	`correctAnswer` text NOT NULL,
	`explanation` text,
	`points` int NOT NULL DEFAULT 1,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int NOT NULL,
	`courseId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`passingScore` int NOT NULL DEFAULT 70,
	`timeLimit` int,
	`isExam` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`sectionId` int,
	`completed` enum('true','false') NOT NULL DEFAULT 'false',
	`score` int,
	`attemptCount` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_progress_id` PRIMARY KEY(`id`)
);
