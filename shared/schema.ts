import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  company_id: integer("company_id"),
  points_total: integer("points_total").default(0).notNull(),
  streak_count: integer("streak_count").default(0).notNull(),
  role: text("role").default("user").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  name: true,
  password: true,
  company_id: true,
  role: true,
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  domain: true,
});

// Commute types enum
export const commuteTypes = z.enum([
  "walk", 
  "cycle", 
  "public_transport", 
  "carpool", 
  "electric_vehicle", 
  "gas_vehicle", 
  "remote_work"
]);

// Weekly commute logs
export const commuteLogs = pgTable("commute_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  week_start: date("week_start").notNull(),
  commute_type: text("commute_type").notNull(),
  days_logged: integer("days_logged").notNull(),
  distance_km: integer("distance_km").default(0),
  co2_saved_kg: integer("co2_saved_kg").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommuteLogSchema = createInsertSchema(commuteLogs).pick({
  user_id: true,
  week_start: true,
  commute_type: true,
  days_logged: true,
  distance_km: true,
});

// Points transactions
export const pointsTransactions = pgTable("points_transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  source: text("source").notNull(),
  points: integer("points").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).pick({
  user_id: true,
  source: true,
  points: true,
});

// Challenges 
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  points_reward: integer("points_reward").notNull(),
  goal_type: text("goal_type").notNull(), // e.g. 'days', 'distance', etc.
  goal_value: integer("goal_value").notNull(),
  commute_type: text("commute_type"), // can be null if challenge applies to any type
  company_id: integer("company_id"), // can be null if challenge is global
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  start_date: true,
  end_date: true,
  points_reward: true,
  goal_type: true,
  goal_value: true,
  commute_type: true,
  company_id: true,
});

// Challenge participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challenge_id: integer("challenge_id").notNull(),
  user_id: integer("user_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  joined_at: timestamp("joined_at").defaultNow().notNull(),
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).pick({
  challenge_id: true,
  user_id: true,
  progress: true,
  completed: true,
});

// Rewards
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cost_points: integer("cost_points").notNull(),
  quantity_limit: integer("quantity_limit"),
  company_id: integer("company_id"), // can be null if reward is global
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  title: true,
  description: true,
  cost_points: true,
  quantity_limit: true,
  company_id: true,
});

// Redemptions
export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  reward_id: integer("reward_id").notNull(),
  redeemed_at: timestamp("redeemed_at").defaultNow().notNull(),
});

export const insertRedemptionSchema = createInsertSchema(redemptions).pick({
  user_id: true,
  reward_id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CommuteType = z.infer<typeof commuteTypes>;
export type CommuteLog = typeof commuteLogs.$inferSelect;
export type InsertCommuteLog = z.infer<typeof insertCommuteLogSchema>;

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
