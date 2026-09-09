import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const investigationNotesTable = pgTable("investigation_notes", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  officerId: integer("officer_id"),
  content: text("content").notNull(),
  noteType: text("note_type"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const insertNoteSchema = createInsertSchema(
  investigationNotesTable
).omit({
  id: true,
  createdAt: true,
});

export type InsertInvestigationNote =
  typeof investigationNotesTable.$inferInsert;
  export type InvestigationNote = typeof investigationNotesTable.$inferSelect;