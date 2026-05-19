import { Pool } from "pg";
import {
  type User, type InsertUser,
  type Course, type InsertCourse,
  type Lesson, type InsertLesson,
  type PaymentSetting, type InsertPaymentSetting,
  type Transaction, type InsertTransaction,
  type SkillScore, type InsertSkillScore,
  type Progress, type InsertProgress,
  type CareerAnalysis,
  type Coupon,
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "role" | "subscription_status">): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User>;
  updateUserSubscription(id: number, status: boolean): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Courses
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  // Lessons
  getLessonsForCourse(courseId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, data: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: number): Promise<void>;

  // Payment Settings
  getAllPaymentSettings(): Promise<PaymentSetting[]>;
  updatePaymentSetting(id: number, data: Partial<InsertPaymentSetting>): Promise<PaymentSetting>;
  createPaymentSetting(data: InsertPaymentSetting): Promise<PaymentSetting>;

  // Transactions
  createTransaction(tx: InsertTransaction, screenshot_url?: string): Promise<Transaction>;
  getAllTransactions(): Promise<(Transaction & { user_name: string; user_email: string; screenshot_url: string })[]>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;

  // Skill Scores
  getSkillScore(userId: number): Promise<SkillScore | undefined>;
  upsertSkillScore(score: InsertSkillScore): Promise<SkillScore>;

  // Progress
  getUserProgress(userId: number): Promise<Progress[]>;
  upsertProgress(p: InsertProgress): Promise<Progress>;

  // Giveaway Stats
  getGiveawayStats(): Promise<{ activeUsers: number; nextMilestone: number; prevMilestone: number }>;

  // Referral System
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getReferralStats(userId: number): Promise<{ referral_code: string; successful_referrals: number; total_tickets: number }>;
  getReferralLeaderboard(): Promise<{ name: string; referral_count: number; rank: number }[]>;

  // Career Analyses
  saveCareerAnalysis(data: { user_id: number; skill_path: string; secondary_path: string; personality_type: string; income_6m: string; income_12m: string; recommended_skills: string; roadmap: string; rarity: string }): Promise<CareerAnalysis>;
  getCareerAnalysisByShareId(shareId: string): Promise<CareerAnalysis | undefined>;
  getLatestCareerAnalysis(userId: number): Promise<CareerAnalysis | undefined>;

  // Admin Referral Management
  getAllUsersWithReferralStats(): Promise<{
    id: number; name: string; email: string; referral_code: string;
    subscription_status: boolean; referred_by_name: string | null;
    referral_bonus_count: number;
    total_referrals: number; successful_referrals: number; premium_conversions: number;
  }[]>;
  adjustUserReferralBonus(userId: number, bonus: number): Promise<void>;
  getReferralSettings(): Promise<{ referral_enabled: boolean; referral_reward_rules: string }>;
  updateReferralSettings(enabled: boolean, rules: string): Promise<void>;

  // App Settings
  getSubscriptionPrice(): Promise<number>;
  updateSubscriptionPrice(price: number): Promise<number>;

  // Coupons
  getCoupon(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon_code: string, custom_price: number, description: string): Promise<Coupon>;
  deleteCoupon(id: number): Promise<void>;
}

export class PgStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    await pool.query(`
      UPDATE users SET subscription_status = false, subscription_expiry_date = NULL
      WHERE id = $1 AND subscription_status = true
        AND subscription_expiry_date IS NOT NULL
        AND subscription_expiry_date < NOW()
    `, [id]);
    const r = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    return r.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return r.rows[0];
  }

  async createUser(user: { name: string; email: string; password_hash: string; referred_by?: number; whatsapp_number?: string }): Promise<User> {
    const referral_code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const r = await pool.query(
      "INSERT INTO users (name, email, password_hash, referral_code, referred_by, whatsapp_number) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [user.name, user.email, user.password_hash, referral_code, user.referred_by ?? null, user.whatsapp_number ?? null]
    );
    return r.rows[0];
  }

  async getAllUsers(): Promise<User[]> {
    const r = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return r.rows;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const r = await pool.query("UPDATE users SET role=$1 WHERE id=$2 RETURNING *", [role, id]);
    return r.rows[0];
  }

  async updateUserSubscription(id: number, status: boolean): Promise<User> {
    const r = status
      ? await pool.query(
          "UPDATE users SET subscription_status=true, subscription_expiry_date=NOW() + INTERVAL '30 days' WHERE id=$1 RETURNING *",
          [id]
        )
      : await pool.query(
          "UPDATE users SET subscription_status=false, subscription_expiry_date=NULL WHERE id=$1 RETURNING *",
          [id]
        );
    return r.rows[0];
  }

  async deleteUser(id: number): Promise<void> {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const r = await pool.query("SELECT * FROM courses WHERE id=$1", [id]);
    return r.rows[0];
  }

  async getAllCourses(): Promise<Course[]> {
    const r = await pool.query("SELECT * FROM courses ORDER BY id ASC");
    return r.rows;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const r = await pool.query(
      "INSERT INTO courses (title, category, description, video_url, tags) VALUES ($1,$2,$3,'',$4) RETURNING *",
      [course.title, course.category, course.description, course.tags ?? ""]
    );
    return r.rows[0];
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const allowed = ['title', 'category', 'description', 'tags'];
    const keys = Object.keys(course).filter(k => allowed.includes(k));
    if (keys.length === 0) {
      const r = await pool.query("SELECT * FROM courses WHERE id=$1", [id]);
      return r.rows[0];
    }
    const fields = keys.map((k, i) => `${k}=$${i + 2}`).join(", ");
    const values = keys.map(k => (course as any)[k]);
    const r = await pool.query(`UPDATE courses SET ${fields} WHERE id=$1 RETURNING *`, [id, ...values]);
    return r.rows[0];
  }

  async deleteCourse(id: number): Promise<void> {
    await pool.query("DELETE FROM lessons WHERE course_id=$1", [id]);
    await pool.query("DELETE FROM courses WHERE id=$1", [id]);
  }

  async getLessonsForCourse(courseId: number): Promise<Lesson[]> {
    const r = await pool.query(
      `SELECT * FROM lessons WHERE course_id=$1
       ORDER BY module_name ASC,
         order_index ASC,
         title ASC`,
      [courseId]
    );
    return r.rows;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const r = await pool.query(
      "INSERT INTO lessons (course_id, title, video_url, order_index, module_name) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [lesson.course_id, lesson.title, lesson.video_url, lesson.order_index ?? 0, lesson.module_name ?? ""]
    );
    return r.rows[0];
  }

  async updateLesson(id: number, data: Partial<InsertLesson>): Promise<Lesson> {
    const allowed = ['title', 'video_url', 'order_index', 'module_name'];
    const keys = Object.keys(data).filter(k => allowed.includes(k));
    const fields = keys.map((k, i) => `${k}=$${i + 2}`).join(", ");
    const values = keys.map(k => (data as any)[k]);
    const r = await pool.query(`UPDATE lessons SET ${fields} WHERE id=$1 RETURNING *`, [id, ...values]);
    return r.rows[0];
  }

  async deleteLesson(id: number): Promise<void> {
    await pool.query("DELETE FROM lessons WHERE id=$1", [id]);
  }

  async getAllPaymentSettings(): Promise<PaymentSetting[]> {
    const r = await pool.query("SELECT * FROM payment_settings ORDER BY id ASC");
    return r.rows;
  }

  async updatePaymentSetting(id: number, data: Partial<InsertPaymentSetting>): Promise<PaymentSetting> {
    const fields = Object.keys(data).map((k, i) => `${k}=$${i + 2}`).join(", ");
    const values = Object.values(data);
    const r = await pool.query(`UPDATE payment_settings SET ${fields} WHERE id=$1 RETURNING *`, [id, ...values]);
    return r.rows[0];
  }

  async createPaymentSetting(data: InsertPaymentSetting): Promise<PaymentSetting> {
    const r = await pool.query(
      "INSERT INTO payment_settings (method_name, account_details) VALUES ($1,$2) RETURNING *",
      [data.method_name, data.account_details]
    );
    return r.rows[0];
  }

  async createTransaction(tx: InsertTransaction, screenshot_url: string = ""): Promise<Transaction> {
    const r = await pool.query(
      "INSERT INTO transactions (user_id, amount, method, trx_id, status, screenshot_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [tx.user_id, tx.amount ?? 500, tx.method, tx.trx_id, tx.status ?? "pending", screenshot_url]
    );
    return r.rows[0];
  }

  async getAllTransactions(): Promise<(Transaction & { user_name: string; user_email: string; screenshot_url: string })[]> {
    const r = await pool.query(`
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
    `);
    return r.rows;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const r = await pool.query("SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
    return r.rows;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const r = await pool.query("UPDATE transactions SET status=$1 WHERE id=$2 RETURNING *", [status, id]);
    return r.rows[0];
  }

  async getSkillScore(userId: number): Promise<SkillScore | undefined> {
    const r = await pool.query("SELECT * FROM skill_scores WHERE user_id=$1", [userId]);
    return r.rows[0];
  }

  async upsertSkillScore(score: InsertSkillScore): Promise<SkillScore> {
    const r = await pool.query(`
      INSERT INTO skill_scores (user_id, technical, communication, logical, digital, goal, existing_skill, available_tool, roadmap_result)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (user_id) DO UPDATE SET
        technical=EXCLUDED.technical,
        communication=EXCLUDED.communication,
        logical=EXCLUDED.logical,
        digital=EXCLUDED.digital,
        goal=EXCLUDED.goal,
        existing_skill=EXCLUDED.existing_skill,
        available_tool=EXCLUDED.available_tool,
        roadmap_result=EXCLUDED.roadmap_result
      RETURNING *
    `, [
      score.user_id, score.technical, score.communication, score.logical, score.digital,
      score.goal ?? "", score.existing_skill ?? "", score.available_tool ?? "",
      score.roadmap_result ?? ""
    ]);
    return r.rows[0];
  }

  async getUserProgress(userId: number): Promise<Progress[]> {
    const r = await pool.query("SELECT * FROM progress WHERE user_id=$1", [userId]);
    return r.rows;
  }

  async upsertProgress(p: InsertProgress): Promise<Progress> {
    const r = await pool.query(`
      INSERT INTO progress (user_id, course_id, lessons_completed, is_completed)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        lessons_completed=EXCLUDED.lessons_completed,
        is_completed=EXCLUDED.is_completed
      RETURNING *
    `, [p.user_id, p.course_id, p.lessons_completed, p.is_completed]);
    return r.rows[0];
  }

  async getGiveawayStats(): Promise<{ activeUsers: number; nextMilestone: number; prevMilestone: number }> {
    const r = await pool.query("SELECT COUNT(*) FROM users WHERE subscription_status = true");
    const activeUsers = parseInt(r.rows[0].count, 10);
    let nextMilestone = 300;
    let prevMilestone = 0;
    if (activeUsers >= 300) {
      nextMilestone = 1000;
      prevMilestone = 300;
    }
    return { activeUsers, nextMilestone, prevMilestone };
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const r = await pool.query("SELECT * FROM users WHERE referral_code=$1", [code]);
    return r.rows[0];
  }

  async getReferralStats(userId: number): Promise<{ referral_code: string; successful_referrals: number; total_tickets: number }> {
    const userRow = await pool.query("SELECT referral_code, subscription_status FROM users WHERE id=$1", [userId]);
    const user = userRow.rows[0];
    const referral_code = user?.referral_code ?? "";
    const isPremium = user?.subscription_status === true;

    const refRow = await pool.query(
      "SELECT COUNT(*) FROM users WHERE referred_by=$1 AND subscription_status=true",
      [userId]
    );
    const successful_referrals = parseInt(refRow.rows[0].count, 10);

    const base_tickets = isPremium ? 1 : 0;
    const extra_tickets = Math.floor(successful_referrals / 2);
    const total_tickets = base_tickets + extra_tickets;

    return { referral_code, successful_referrals, total_tickets };
  }

  async getReferralLeaderboard(): Promise<{ name: string; referral_count: number; rank: number }[]> {
    const r = await pool.query(`
      SELECT u.name,
             COUNT(ref.id) AS referral_count,
             RANK() OVER (ORDER BY COUNT(ref.id) DESC) AS rank
      FROM users u
      LEFT JOIN users ref ON ref.referred_by = u.id AND ref.subscription_status = true
      GROUP BY u.id, u.name
      HAVING COUNT(ref.id) > 0
      ORDER BY referral_count DESC
      LIMIT 10
    `);
    return r.rows.map(row => ({
      name: row.name,
      referral_count: parseInt(row.referral_count, 10),
      rank: parseInt(row.rank, 10),
    }));
  }

  async saveCareerAnalysis(data: { user_id: number; skill_path: string; secondary_path: string; personality_type: string; income_6m: string; income_12m: string; recommended_skills: string; roadmap: string; rarity: string }): Promise<CareerAnalysis> {
    const share_id = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const result_image_url = `/result-image/${share_id}`;
    const result_png_url = `/result-image/${share_id}/square`;
    const result_jpg_url = `/result-image/${share_id}/square`;
    const r = await pool.query(
      `INSERT INTO career_analyses (user_id, share_id, skill_path, secondary_path, personality_type, income_6m, income_12m, recommended_skills, roadmap, rarity, result_image_url, result_png_url, result_jpg_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [data.user_id, share_id, data.skill_path, data.secondary_path, data.personality_type, data.income_6m, data.income_12m, data.recommended_skills, data.roadmap, data.rarity, result_image_url, result_png_url, result_jpg_url]
    );
    return r.rows[0];
  }

  async getCareerAnalysisByShareId(shareId: string): Promise<CareerAnalysis | undefined> {
    const r = await pool.query("SELECT * FROM career_analyses WHERE share_id=$1", [shareId]);
    return r.rows[0];
  }

  async getLatestCareerAnalysis(userId: number): Promise<CareerAnalysis | undefined> {
    const r = await pool.query(
      "SELECT * FROM career_analyses WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    return r.rows[0];
  }

  async getAllUsersWithReferralStats(): Promise<{
    id: number; name: string; email: string; referral_code: string;
    subscription_status: boolean; referred_by_name: string | null;
    referral_bonus_count: number;
    total_referrals: number; successful_referrals: number; premium_conversions: number;
  }[]> {
    const r = await pool.query(`
      SELECT
        u.id, u.name, u.email,
        COALESCE(u.referral_code, '') AS referral_code,
        u.subscription_status,
        COALESCE(u.referral_bonus_count, 0) AS referral_bonus_count,
        ref.name AS referred_by_name,
        COUNT(child.id) AS total_referrals,
        COUNT(child.id) FILTER (WHERE child.subscription_status = true) AS successful_referrals,
        COUNT(child.id) FILTER (WHERE child.subscription_status = true) AS premium_conversions
      FROM users u
      LEFT JOIN users ref ON ref.id = u.referred_by
      LEFT JOIN users child ON child.referred_by = u.id
      GROUP BY u.id, u.name, u.email, u.referral_code, u.subscription_status, u.referral_bonus_count, ref.name
      ORDER BY total_referrals DESC, u.created_at DESC
    `);
    return r.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      referral_code: row.referral_code,
      subscription_status: row.subscription_status,
      referred_by_name: row.referred_by_name,
      referral_bonus_count: parseInt(row.referral_bonus_count, 10),
      total_referrals: parseInt(row.total_referrals, 10),
      successful_referrals: parseInt(row.successful_referrals, 10),
      premium_conversions: parseInt(row.premium_conversions, 10),
    }));
  }

  async adjustUserReferralBonus(userId: number, bonus: number): Promise<void> {
    await pool.query("UPDATE users SET referral_bonus_count=$1 WHERE id=$2", [bonus, userId]);
  }

  async getReferralSettings(): Promise<{ referral_enabled: boolean; referral_reward_rules: string }> {
    const r = await pool.query("SELECT referral_enabled, referral_reward_rules FROM app_settings WHERE id='main'");
    return {
      referral_enabled: r.rows[0]?.referral_enabled ?? true,
      referral_reward_rules: r.rows[0]?.referral_reward_rules ?? "[]",
    };
  }

  async updateReferralSettings(enabled: boolean, rules: string): Promise<void> {
    await pool.query(
      `INSERT INTO app_settings (id, referral_enabled, referral_reward_rules, subscription_price)
       VALUES ('main', $1, $2, 750)
       ON CONFLICT (id) DO UPDATE SET referral_enabled=$1, referral_reward_rules=$2`,
      [enabled, rules]
    );
  }

  async getSubscriptionPrice(): Promise<number> {
    const r = await pool.query("SELECT subscription_price FROM app_settings WHERE id='main'");
    return r.rows[0]?.subscription_price ?? 750;
  }

  async updateSubscriptionPrice(price: number): Promise<number> {
    const r = await pool.query(
      "INSERT INTO app_settings (id, subscription_price) VALUES ('main', $1) ON CONFLICT (id) DO UPDATE SET subscription_price=$1 RETURNING subscription_price",
      [price]
    );
    return r.rows[0].subscription_price;
  }

  async getCoupon(code: string): Promise<Coupon | undefined> {
    const r = await pool.query("SELECT * FROM coupons WHERE UPPER(coupon_code)=UPPER($1)", [code]);
    return r.rows[0];
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const r = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return r.rows;
  }

  async createCoupon(coupon_code: string, custom_price: number, description: string): Promise<Coupon> {
    const r = await pool.query(
      "INSERT INTO coupons (coupon_code, custom_price, description) VALUES (UPPER($1), $2, $3) RETURNING *",
      [coupon_code, custom_price, description]
    );
    return r.rows[0];
  }

  async deleteCoupon(id: number): Promise<void> {
    await pool.query("DELETE FROM coupons WHERE id=$1", [id]);
  }
}

export const storage = new PgStorage();
