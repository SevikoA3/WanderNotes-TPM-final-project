PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL,
	`profile_image` text DEFAULT 'https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg' NOT NULL,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "password", "created_at", "profile_image", "timezone") SELECT "id", "username", "password", "created_at", "profile_image", "timezone" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);