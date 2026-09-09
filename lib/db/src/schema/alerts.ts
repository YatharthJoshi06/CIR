import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("warning"),
  caseId: integer("case_id").notNull(),
  firNo: text("fir_no").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAlert = typeof alertsTable.$inferInsert;
export type Alert = typeof alertsTable.$inferSelect;