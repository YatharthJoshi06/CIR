import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const officersTable = pgTable("officers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  badgeNo: text("badge_no").notNull(),
  policeStation: text("police_station").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertOfficerSchema = createInsertSchema(officersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertOfficer = typeof insertOfficerSchema;
export type Officer = typeof officersTable.$inferSelect;