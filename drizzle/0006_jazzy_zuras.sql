ALTER TABLE `notes` ADD `trip_start_date` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `trip_end_date` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `reminder_at` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `is_reminder_set` integer DEFAULT false;