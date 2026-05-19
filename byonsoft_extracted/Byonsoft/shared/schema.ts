import { pgTable, serial, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  subscription_status: boolean("subscription_status").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
  referral_code: text("referral_code"),
  referred_by: integer("referred_by"),
  subscription_expiry_date: timestamp("subscription_expiry_date"),
  whatsapp_number: text("whatsapp_number"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  video_url: text("video_url").notNull().default(""),
  description: text("description").notNull(),
  tags: text("tags").notNull().default(""),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id").notNull(),
  title: text("title").notNull(),
  video_url: text("video_url").notNull(),
  order_index: integer("order_index").notNull().default(0),
  module_name: text("module_name").notNull().default(""),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  method_name: text("method_name").notNull(),
  account_details: text("account_details").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  amount: numeric("amount").notNull().default("500"),
  method: text("method").notNull(),
  trx_id: text("trx_id").notNull(),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const skillScores = pgTable("skill_scores", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  technical: integer("technical").notNull().default(0),
  communication: integer("communication").notNull().default(0),
  logical: integer("logical").notNull().default(0),
  digital: integer("digital").notNull().default(0),
  goal: text("goal").default(""),
  existing_skill: text("existing_skill").default(""),
  available_tool: text("available_tool").default(""),
  roadmap_result: text("roadmap_result").default(""),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  course_id: integer("course_id").notNull(),
  lessons_completed: integer("lessons_completed").notNull().default(0),
  is_completed: boolean("is_completed").notNull().default(false),
});

export const giveaways = pgTable("giveaways", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  won_at: timestamp("won_at").defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey(),
  subscription_price: integer("subscription_price").notNull().default(750),
  referral_enabled: boolean("referral_enabled").notNull().default(true),
  referral_reward_rules: text("referral_reward_rules").notNull().default("[]"),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  coupon_code: text("coupon_code").notNull().unique(),
  custom_price: integer("custom_price").notNull(),
  description: text("description").default(""),
  created_at: timestamp("created_at").defaultNow(),
});

export const careerAnalyses = pgTable("career_analyses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  share_id: text("share_id").notNull().unique(),
  skill_path: text("skill_path").notNull(),
  secondary_path: text("secondary_path").notNull().default(""),
  personality_type: text("personality_type").notNull().default(""),
  income_6m: text("income_6m").notNull().default(""),
  income_12m: text("income_12m").notNull().default(""),
  recommended_skills: text("recommended_skills").notNull().default("[]"),
  roadmap: text("roadmap").notNull().default("{}"),
  rarity: text("rarity").notNull().default("10"),
  result_image_url: text("result_image_url").notNull().default(""),
  result_png_url: text("result_png_url").notNull().default(""),
  result_jpg_url: text("result_jpg_url").notNull().default(""),
  created_at: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, created_at: true });
export const insertCareerAnalysisSchema = createInsertSchema(careerAnalyses).omit({ id: true, created_at: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, video_url: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertPaymentSettingSchema = createInsertSchema(paymentSettings).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, created_at: true });
export const insertSkillScoreSchema = createInsertSchema(skillScores).omit({ id: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = z.infer<typeof insertPaymentSettingSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SkillScore = typeof skillScores.$inferSelect;
export type InsertSkillScore = z.infer<typeof insertSkillScoreSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Giveaway = typeof giveaways.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type CareerAnalysis = typeof careerAnalyses.$inferSelect;
export type InsertCareerAnalysis = z.infer<typeof insertCareerAnalysisSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
