import { drizzle } from "drizzle-orm/node-postgres";
import { jsonb, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import type { ProfileData } from "./types";

export const classroomProfiles = pgTable("classroom_profiles", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull().unique(),
  pinSalt: text("pin_salt").notNull(),
  pinHash: text("pin_hash").notNull(),
  profile: jsonb("profile").notNull().$type<ProfileData>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classroomSessions = pgTable("classroom_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  profileId: text("profile_id").notNull(),
  role: text("role").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classroomPinAttempts = pgTable("classroom_pin_attempts", {
  nickname: text("nickname").primaryKey(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

const globalForDb = globalThis as typeof globalThis & { classroomPool?: Pool };
const pool =
  globalForDb.classroomPool ?? new Pool({ connectionString: process.env["DATABASE_URL"], max: 5 });
if (process.env["NODE_ENV"] !== "production") globalForDb.classroomPool = pool;

export const db = drizzle(pool, {
  schema: { classroomProfiles, classroomSessions, classroomPinAttempts },
});
