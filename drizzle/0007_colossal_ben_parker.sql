CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_id` integer NOT NULL,
	`reminder_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `notes` DROP COLUMN `trip_start_date`;--> statement-breakpoint
ALTER TABLE `notes` DROP COLUMN `trip_end_date`;