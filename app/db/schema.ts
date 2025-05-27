import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Notes table
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagePath: text("image_path").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export default {};
