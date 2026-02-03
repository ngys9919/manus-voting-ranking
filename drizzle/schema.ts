import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * National Parks table for the ranking system.
 * Stores park information and their current ELO rating.
 */
export const parks = mysqlTable("parks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  eloRating: decimal("eloRating", { precision: 10, scale: 2 }).default("1500").notNull(),
  voteCount: int("voteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Park = typeof parks.$inferSelect;
export type InsertPark = typeof parks.$inferInsert;

/**
 * Votes table to record all matchup results.
 * Tracks which park won in each head-to-head comparison.
 */
export const votes = mysqlTable("votes", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  park1Id: int("park1Id").notNull(),
  park2Id: int("park2Id").notNull(),
  winnerId: int("winnerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Park ELO History table to track rating changes over time.
 * Records each ELO rating change for visualization and analysis.
 */
export const parkEloHistory = mysqlTable("parkEloHistory", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  parkId: int("parkId").notNull(),
  eloRating: decimal("eloRating", { precision: 10, scale: 2 }).notNull(),
  voteId: bigint("voteId", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParkEloHistory = typeof parkEloHistory.$inferSelect;
export type InsertParkEloHistory = typeof parkEloHistory.$inferInsert;