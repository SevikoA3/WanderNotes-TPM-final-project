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
});

export default {};
