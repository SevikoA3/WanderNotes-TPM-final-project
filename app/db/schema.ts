import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Notes table
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id), // <--- Tambah kolom userId
  imagePath: text("image_path").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  address: text("address"),
  createdAt: text("created_at").notNull(),
  reminderAt: text("reminder_at"),
  isReminderSet: integer("is_reminder_set", { mode: "boolean" }).default(false),
  stepCount: integer("step_count").default(0),
  createdTimezone: text("created_timezone").notNull().default("UTC"), // timezone saat note dibuat
});

// Reminders table
export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  noteId: integer("note_id")
    .notNull()
    .references(() => notes.id),
  reminderAt: text("reminder_at").notNull(),
  createdAt: text("created_at").notNull(),
  notificationId: text("notification_id"),
});

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
  profileImage: text("profile_image")
    .default(
      "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
    )
    .notNull(),
  timezone: text("timezone").default("Asia/Jakarta").notNull(),
});

export default {};
