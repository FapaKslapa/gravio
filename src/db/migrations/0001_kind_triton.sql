CREATE TABLE `savings_contribution` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`amount` numeric NOT NULL,
	`date` text NOT NULL,
	`note` text,
	FOREIGN KEY (`goal_id`) REFERENCES `savings_goal`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `savings_goal` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`target_amount` numeric NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`target_date` text,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
