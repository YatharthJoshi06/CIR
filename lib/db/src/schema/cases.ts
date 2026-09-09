import {
  pgTable,
  text,
  serial,
  timestamp,
  numeric,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  firNo: text("fir_no").notNull().unique(),
  policeStation: text("police_station").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  victimName: text("victim_name").notNull(),
  victimContact: text("victim_contact"),
  victimEmail: text("victim_email"),
  suspectedWalletAddress: text("suspected_wallet_address").notNull(),
  txHash: text("tx_hash"),
  cryptoType: text("crypto_type").notNull(),
  amountLost: numeric("amount_lost", {
    precision: 20,
    scale: 2,
  }).notNull(),
  exchangeName: text("exchange_name"),
  telegramId: text("telegram_id"),
  websiteUrl: text("website_url"),
  suspectMobile: text("suspect_mobile"),
  socialMediaHandle: text("social_media_handle"),
  ipAddress: text("ip_address"),
  bankDetails: text("bank_details"),
  blockchainNetwork: text("blockchain_network"),
  screenshotsCollected: boolean("screenshots_collected")
    .notNull()
    .default(false),
  evidenceAttached: boolean("evidence_attached")
    .notNull()
    .default(false),
  remarks: text("remarks"),
  investigatingOfficerId: integer("investigating_officer_id"),
  status: text("status").notNull().default("open"),
  riskLevel: text("risk_level").notNull().default("low"),
  linkedCaseCount: integer("linked_case_count").notNull().default(0),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  linkedCaseCount: true,
  riskLevel: true,
  status: true,
});

export type InsertCase = typeof casesTable.$inferInsert;
export type Case = typeof casesTable.$inferSelect;