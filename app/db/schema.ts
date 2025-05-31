import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Notes table
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagePath: text("image_path").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  address: text("address"),
  createdAt: text("created_at").notNull(),
  tripStartDate: text("trip_start_date"),
  tripEndDate: text("trip_end_date"),
  reminderAt: text("reminder_at"), 
  isReminderSet: integer("is_reminder_set", { mode: "boolean" }).default(false), 
});

export default {};
