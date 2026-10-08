CREATE TABLE `ai_insight` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`period_key` text NOT NULL,
	`payload` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_insight_user_period` ON `ai_insight` (`user_id`,`period_key`);