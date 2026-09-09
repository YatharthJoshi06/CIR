import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export * from "./schema/index.js";
export * from "./schema/cases.js";
export * from "./schema/alerts.js";
export * from "./schema/officers.js";
export * from "./schema/investigation_notes.js";

export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "officers" (
        "id" serial PRIMARY KEY,
        "user_id" text NOT NULL UNIQUE,
        "password_hash" text NOT NULL,
        "name" text NOT NULL,
        "designation" text NOT NULL,
        "badge_no" text NOT NULL,
        "police_station" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "cases" (
        "id" serial PRIMARY KEY,
        "fir_no" text NOT NULL UNIQUE,
        "police_station" text NOT NULL,
        "date" date NOT NULL,
        "victim_name" text NOT NULL,
        "victim_contact" text,
        "victim_email" text,
        "suspected_wallet_address" text NOT NULL,
        "tx_hash" text,
        "crypto_type" text NOT NULL,
        "amount_lost" numeric(20, 2) NOT NULL,
        "exchange_name" text,
        "telegram_id" text,
        "website_url" text,
        "suspect_mobile" text,
        "social_media_handle" text,
        "ip_address" text,
        "bank_details" text,
        "blockchain_network" text,
        "screenshots_collected" boolean DEFAULT false NOT NULL,
        "evidence_attached" boolean DEFAULT false NOT NULL,
        "remarks" text,
        "investigating_officer_id" integer,
        "status" text DEFAULT 'open' NOT NULL,
        "risk_level" text DEFAULT 'low' NOT NULL,
        "linked_case_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "investigation_notes" (
        "id" serial PRIMARY KEY,
        "case_id" integer NOT NULL,
        "officer_id" integer,
        "content" text NOT NULL,
        "note_type" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "alerts" (
        "id" serial PRIMARY KEY,
        "type" text NOT NULL,
        "message" text NOT NULL,
        "severity" text DEFAULT 'warning' NOT NULL,
        "case_id" integer NOT NULL,
        "fir_no" text NOT NULL,
        "is_read" boolean DEFAULT false NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log("[DB] Tables ensured successfully.");

    await pool.query(`
      INSERT INTO "officers" ("user_id", "password_hash", "name", "designation", "badge_no", "police_station")
      VALUES
        ('yatharth', 'yatharth123', 'Admin Officer', 'Admin', 'ADM001', 'Cyber Crime HQ'),
        ('officer001', 'Pass@1234', 'Rajesh Kumar', 'Inspector', 'INS001', 'Cyber Crime Cell Delhi'),
        ('officer002', 'Pass@1234', 'Priya Sharma', 'Sub-Inspector', 'SI002', 'Cyber Crime Cell Mumbai')
      ON CONFLICT ("user_id") DO NOTHING;
    `);
  } catch (err) {
    console.error("[DB] Error initializing database tables:", err);
  }
}

