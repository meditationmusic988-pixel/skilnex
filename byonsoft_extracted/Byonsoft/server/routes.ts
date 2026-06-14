import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateResultCardSVG, generateSquareCardSVG } from "./imageGenerator";
import { groqChat, BYONSOFT_SYSTEM_PROMPT, BYONSOFT_JSON_SYSTEM_PROMPT, CAREER_MAPPING_PROMPT } from "./groq";

const JWT_SECRET = process.env.SESSION_SECRET || "byonsoft_secret_2024";

interface AuthRequest extends Request {
  user?: { id: number; role: string; email: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; email: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password, ref, whatsapp_number } = req.body;
      if (!name || !email || !password || !whatsapp_number) return res.status(400).json({ error: "All fields required including WhatsApp number" });
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ error: "Email already registered" });

      let referred_by: number | undefined;
      if (ref) {
        const referrer = await storage.getUserByReferralCode(String(ref));
        if (referrer) referred_by = referrer.id;
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ name, email, password_hash, referred_by, whatsapp_number });
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription_status: user.subscription_status, referral_code: user.referral_code ?? null, whatsapp_number: user.whatsapp_number ?? null } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription_status: user.subscription_status } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_expiry_date: user.subscription_expiry_date ?? null,
      referral_code: user.referral_code ?? null,
      whatsapp_number: user.whatsapp_number ?? null,
    });
  });

  // ─── PAYMENT METHODS (public) ──────────────────────────────────────────────
  app.get("/api/payment-methods", async (_req, res) => {
    try {
      const methods = await storage.getAllPaymentSettings();
      return res.json(methods);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── COUPON CODES ──────────────────────────────────────────────────────────
  const HARDCODED_COUPONS: Record<string, number> = {
    BYONSOFT500: 500,
    GCTVIP: 500,
    EARN500: 500,
  };

  async function resolveCoupon(code: string, basePrice: number): Promise<{ valid: boolean; finalPrice: number; saving: number }> {
    const normalized = (code || "").trim().toUpperCase();
    const dbCoupon = await storage.getCoupon(normalized);
    if (dbCoupon) {
      return { valid: true, finalPrice: dbCoupon.custom_price, saving: basePrice - dbCoupon.custom_price };
    }
    if (HARDCODED_COUPONS[normalized]) {
      const finalPrice = HARDCODED_COUPONS[normalized];
      return { valid: true, finalPrice, saving: basePrice - finalPrice };
    }
    return { valid: false, finalPrice: basePrice, saving: 0 };
  }

  app.post("/api/validate-coupon", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code } = req.body;
      const basePrice = await storage.getSubscriptionPrice();
      const result = await resolveCoupon(code, basePrice);
      if (!result.valid) return res.status(400).json({ error: "Invalid Promo Code" });
      return res.json({ valid: true, finalPrice: result.finalPrice, saving: result.saving });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── SUBMIT PAYMENT ────────────────────────────────────────────────────────
  app.post("/api/submit-payment", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { method, trx_id, screenshot_url, coupon_code } = req.body;
      if (!method) return res.status(400).json({ error: "Payment method required" });
      const basePrice = await storage.getSubscriptionPrice();
      const { finalPrice } = await resolveCoupon(coupon_code || "", basePrice);
      const tx = await storage.createTransaction({
        user_id: req.user!.id,
        amount: String(finalPrice),
        method,
        trx_id: trx_id || "N/A",
        status: "pending",
      }, screenshot_url || "");
      return res.json(tx);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/my-transactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const txs = await storage.getUserTransactions(req.user!.id);
      return res.json(txs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── COURSES (public list) ─────────────────────────────────────────────────
  app.get("/api/courses", async (_req, res) => {
    try {
      const courses = await storage.getAllCourses();
      return res.json(courses);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(Number(req.params.id));
      if (!course) return res.status(404).json({ error: "Course not found" });
      return res.json(course);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── SKILL SCORES ──────────────────────────────────────────────────────────
  app.get("/api/skills", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const score = await storage.getSkillScore(req.user!.id);
      return res.json(score || null);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/skills", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { technical, communication, logical, digital, goal, existing_skill, available_tool, roadmap_result } = req.body;
      const existing = await storage.getSkillScore(req.user!.id);
      const score = await storage.upsertSkillScore({
        user_id: req.user!.id,
        technical: Number(technical ?? 50),
        communication: Number(communication ?? 50),
        logical: Number(logical ?? 50),
        digital: Number(digital ?? 50),
        goal: goal ?? "",
        existing_skill: existing_skill ?? "",
        available_tool: available_tool ?? "",
        roadmap_result: roadmap_result !== undefined ? roadmap_result : (existing?.roadmap_result ?? ""),
      });
      return res.json(score);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── PROGRESS ──────────────────────────────────────────────────────────────
  app.get("/api/progress", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const prog = await storage.getUserProgress(req.user!.id);
      return res.json(prog);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/progress", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { course_id, lessons_completed, is_completed } = req.body;
      const p = await storage.upsertProgress({
        user_id: req.user!.id,
        course_id: Number(course_id),
        lessons_completed: Number(lessons_completed),
        is_completed: Boolean(is_completed),
      });
      return res.json(p);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── AI ENDPOINTS ──────────────────────────────────────────────────────────
  app.post("/api/ai/roadmap", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { goal, existing_skill, available_tool } = req.body;
      if (!goal || goal.trim().length < 3) {
        return res.status(400).json({ error: "Please describe your primary goal." });
      }

      const userMessage = `Primary Goal: ${(goal || "").trim()}\nExisting Skill: ${(existing_skill || "None").trim()}\nAvailable Tool/Device: ${(available_tool || "Mobile").trim()}`;

      const existingScore = await storage.getSkillScore(req.user!.id);

      let raw = "";
      try {
        raw = await groqChat([
          { role: "system", content: CAREER_MAPPING_PROMPT },
          { role: "user", content: userMessage },
        ]);
      } catch (aiErr: any) {
        console.error("[roadmap] Groq call failed:", aiErr?.message || aiErr);
        return res.status(503).json({ error: "AI service temporarily unavailable. Please try again shortly." });
      }

      const cleaned = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("[roadmap] No JSON object found in AI response:", raw.slice(0, 300));
        return res.status(500).json({ error: "AI response parse error. Please try again." });
      }

      try {
        const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
        const result = {
          recommended_courses: Array.isArray(parsed.recommended_courses) ? parsed.recommended_courses : [],
          career_paths: Array.isArray(parsed.career_paths) ? parsed.career_paths : [],
          expected_income: typeof parsed.expected_income === "string" ? parsed.expected_income : "",
          learning_order: typeof parsed.learning_order === "string" ? parsed.learning_order : "",
        };

        await storage.upsertSkillScore({
          user_id: req.user!.id,
          technical: existingScore?.technical ?? 0,
          communication: existingScore?.communication ?? 0,
          logical: existingScore?.logical ?? 0,
          digital: existingScore?.digital ?? 0,
          goal: (goal || "").trim(),
          existing_skill: (existing_skill || "").trim(),
          available_tool: (available_tool || "").trim(),
          roadmap_result: JSON.stringify(result),
        });

        return res.json(result);
      } catch (parseErr) {
        console.error("[roadmap] JSON.parse failed:", (parseErr as Error).message, "| raw:", raw.slice(0, 300));
        return res.status(500).json({ error: "AI response parse error. Please try again." });
      }
    } catch (err: any) {
      console.error("[roadmap] Unexpected error:", err?.message || err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/mentor", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { lesson, question } = req.body;
      const answer = await groqChat([
        { role: "system", content: BYONSOFT_SYSTEM_PROMPT },
        { role: "user", content: `Lesson topic: ${lesson}\nStudent ka sawal: ${question}` },
      ], { max_tokens: 4096 });
      return res.json({ answer });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/progress-report", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { activity } = req.body;
      let text = "";
      try {
        text = await groqChat([
          { role: "system", content: BYONSOFT_JSON_SYSTEM_PROMPT },
          { role: "user", content: `Student ki weekly activity: ${activity}\n\nOutput ONLY this JSON structure (no markdown, no extra text):\n{\n  "strengths": "kya acha kar raha hai (Roman Urdu)",\n  "improvements": "kya improve karna hai (Roman Urdu)",\n  "next_week_plan": "aglay hafte ka specific plan (Roman Urdu)",\n  "pitch": "use the exact pitch value from your system instructions"\n}` },
        ]);
      } catch (aiErr: any) {
        return res.status(503).json({ error: "AI service temporarily unavailable. Thodi der baad try karein." });
      }
      try {
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return res.json(JSON.parse(cleaned));
      } catch {
        return res.status(500).json({ error: "AI response parse error. Please try again." });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── ADMIN ROUTES ──────────────────────────────────────────────────────────
  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json(users.map(u => ({ ...u, password_hash: undefined })));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const user = await storage.updateUserRole(Number(req.params.id), req.body.role);
      return res.json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/users/:id/subscription", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const user = await storage.updateUserSubscription(Number(req.params.id), Boolean(req.body.subscription_status));
      return res.json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/courses", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      return res.json(await storage.getAllCourses());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/courses", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { title, category, description, tags } = req.body;
      const course = await storage.createCourse({ title, category, description, tags: tags ?? "" });
      return res.json(course);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/courses/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { title, category, description, tags } = req.body;
      const course = await storage.updateCourse(Number(req.params.id), { title, category, description, tags: tags ?? "" });
      return res.json(course);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/courses/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      await storage.deleteCourse(Number(req.params.id));
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── LESSON ROUTES ─────────────────────────────────────────────────────────
  app.get("/api/courses/:id/lessons", authMiddleware, async (req, res) => {
    try {
      const lessons = await storage.getLessonsForCourse(Number(req.params.id));
      return res.json(lessons);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/courses/:id/lessons", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const lessons = await storage.getLessonsForCourse(Number(req.params.id));
      return res.json(lessons);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/courses/:id/lessons", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { title, video_url, order_index, module_name } = req.body;
      const lesson = await storage.createLesson({
        course_id: Number(req.params.id),
        title,
        video_url,
        order_index: Number(order_index ?? 0),
        module_name: module_name ?? "",
      });
      return res.json(lesson);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/lessons/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { title, video_url, order_index, module_name } = req.body;
      const lesson = await storage.updateLesson(Number(req.params.id), { title, video_url, order_index, module_name });
      return res.json(lesson);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/lessons/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      await storage.deleteLesson(Number(req.params.id));
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/payment-settings", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      return res.json(await storage.getAllPaymentSettings());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/payment-settings/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const setting = await storage.updatePaymentSetting(Number(req.params.id), req.body);
      return res.json(setting);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/payment-settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const setting = await storage.createPaymentSetting(req.body);
      return res.json(setting);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/transactions", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      return res.json(await storage.getAllTransactions());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/transactions/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const tx = await storage.updateTransactionStatus(Number(req.params.id), status);
      if (status === "approved") {
        await storage.updateUserSubscription(tx.user_id, true);
      } else if (status === "rejected") {
        await storage.updateUserSubscription(tx.user_id, false);
      }
      return res.json(tx);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── ADMIN COUPON MANAGEMENT ───────────────────────────────────────────────
  app.get("/api/admin/coupons", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      return res.json(await storage.getAllCoupons());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/coupons", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { coupon_code, custom_price, description } = req.body;
      if (!coupon_code || !custom_price) return res.status(400).json({ error: "Code and price required" });
      const coupon = await storage.createCoupon(String(coupon_code), Number(custom_price), String(description || ""));
      return res.json(coupon);
    } catch (err: any) {
      if (err.code === "23505") return res.status(400).json({ error: "Coupon code already exists" });
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/coupons/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      await storage.deleteCoupon(Number(req.params.id));
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── AI CAREER ANALYSIS ────────────────────────────────────────────────────
  app.post("/api/ai/career-analysis", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const skill = await storage.getSkillScore(userId);
      if (!skill) return res.status(400).json({ error: "Complete the skill test first" });

      const prompt = `User skill assessment for career analysis:

SKILL SCORES (out of 100):
- Technical Skills: ${skill.technical}/100
- Communication: ${skill.communication}/100
- Logical Reasoning: ${skill.logical}/100
- Digital Literacy: ${skill.digital}/100

BACKGROUND:
- Career Goal: ${skill.goal || "Not specified"}
- Existing Skills: ${skill.existing_skill || "None mentioned"}
- Available Device: ${skill.available_tool || "Not specified"}

Note: If device is mobile/phone only, recommend mobile-friendly career paths only.

Output ONLY this exact JSON structure (no markdown, no text before or after the JSON):
{
  "skill_path": "Primary career path (e.g. Fiverr Freelancing — Logo Design)",
  "secondary_path": "Secondary career option (e.g. Social Media Marketing)",
  "personality_type": "One of: Entrepreneur / Creative / Analyst / Communicator",
  "income_6m": "Realistic PKR income at 6 months (e.g. Rs. 25,000 – 50,000/month)",
  "income_12m": "Realistic PKR income at 12 months (e.g. Rs. 60,000 – 1,20,000/month)",
  "recommended_skills": ["skill1", "skill2", "skill3", "skill4"],
  "roadmap": {
    "month1": "Month 1 plan in Roman Urdu: fundamentals + ONE tool to master",
    "month2": "Month 2 plan in Roman Urdu: portfolio + first samples",
    "month3": "Month 3 plan in Roman Urdu: launch on freelancing platform + first client"
  },
  "rarity": "a number 1-15 only, representing how rare this profile is as a percentage",
  "pitch": "use the exact pitch value from your system instructions"
}`;

      let text = "";
      try {
        text = await groqChat([
          { role: "system", content: BYONSOFT_JSON_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ]);
      } catch (aiErr: any) {
        console.error("[groq] career-analysis AI call failed:", aiErr?.message);
        return res.status(503).json({ error: "AI service temporarily unavailable. Thodi der baad try karein." });
      }

      let data: Record<string, any> = {};
      try {
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        data = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("[groq] career-analysis JSON parse failed. Raw response:", text.slice(0, 300));
        return res.status(500).json({ error: "AI response parse error. Please try again." });
      }

      const analysis = await storage.saveCareerAnalysis({
        user_id: userId,
        skill_path: data.skill_path ?? "Freelancing",
        secondary_path: data.secondary_path ?? "",
        personality_type: data.personality_type ?? "",
        income_6m: data.income_6m ?? "",
        income_12m: data.income_12m ?? "",
        recommended_skills: JSON.stringify(data.recommended_skills ?? []),
        roadmap: JSON.stringify(data.roadmap ?? {}),
        rarity: String(data.rarity ?? "10"),
      });

      return res.json({ ...analysis, recommended_skills: data.recommended_skills, roadmap: data.roadmap, pitch: data.pitch ?? "" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── PUBLIC CAREER RESULT ──────────────────────────────────────────────────
  app.get("/api/career-results/:shareId", async (req, res) => {
    try {
      const analysis = await storage.getCareerAnalysisByShareId(req.params.shareId);
      if (!analysis) return res.status(404).json({ error: "Result not found" });
      return res.json({
        ...analysis,
        recommended_skills: JSON.parse(analysis.recommended_skills || "[]"),
        roadmap: JSON.parse(analysis.roadmap || "{}"),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/career-results/me/latest", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const analysis = await storage.getLatestCareerAnalysis(req.user!.id);
      if (!analysis) return res.status(404).json({ error: "No analysis found" });
      return res.json({
        ...analysis,
        recommended_skills: JSON.parse(analysis.recommended_skills || "[]"),
        roadmap: JSON.parse(analysis.roadmap || "{}"),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── DYNAMIC RESULT IMAGES (SVG) ───────────────────────────────────────────
  app.get("/result-image/:shareId", async (req, res) => {
    try {
      const analysis = await storage.getCareerAnalysisByShareId(req.params.shareId);
      if (!analysis) return res.status(404).send("Not found");
      const origin = `${req.protocol}://${req.get("host")}`;
      const svg = generateResultCardSVG({
        skill_path: analysis.skill_path,
        income_6m: analysis.income_6m,
        income_12m: analysis.income_12m,
        rarity: analysis.rarity,
        share_url: `${origin}/result/${analysis.share_id}`,
      });
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(svg);
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  });

  // 1080×1080 square — for PNG/JPG download + Instagram
  app.get("/result-image/:shareId/square", async (req, res) => {
    try {
      const analysis = await storage.getCareerAnalysisByShareId(req.params.shareId);
      if (!analysis) return res.status(404).send("Not found");
      const origin = `${req.protocol}://${req.get("host")}`;
      const svg = generateSquareCardSVG({
        skill_path: analysis.skill_path,
        income_6m: analysis.income_6m,
        income_12m: analysis.income_12m,
        rarity: analysis.rarity,
        share_url: `${origin}/result/${analysis.share_id}`,
      });
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(svg);
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  });

  // ─── REFERRAL LEADERBOARD & REWARDS ────────────────────────────────────────
  app.get("/api/referral/leaderboard", authMiddleware, async (_req, res) => {
    try {
      const leaderboard = await storage.getReferralLeaderboard();
      return res.json(leaderboard);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/referral/rewards", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getReferralStats(req.user!.id);
      const count = stats.successful_referrals;
      const tiers = [
        { threshold: 1, label: "Bonus Lesson", icon: "📚", achieved: count >= 1 },
        { threshold: 3, label: "Free Premium Week", icon: "⭐", achieved: count >= 3 },
        { threshold: 5, label: "Extra Giveaway Ticket", icon: "🎟️", achieved: count >= 5 },
        { threshold: 10, label: "Free 1-Month Premium", icon: "👑", achieved: count >= 10 },
      ];
      const nextTier = tiers.find(t => !t.achieved);
      return res.json({ tiers, count, nextTier: nextTier ?? null });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── GIVEAWAY STATS ────────────────────────────────────────────────────────
  app.get("/api/giveaway/stats", async (_req, res) => {
    try {
      const stats = await storage.getGiveawayStats();
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── REFERRAL SYSTEM ───────────────────────────────────────────────────────
  app.get("/api/referral/stats", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getReferralStats(req.user!.id);
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── GOOGLE DRIVE BULK IMPORT ──────────────────────────────────────────────
  app.get("/api/admin/drive/import", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const folderUrl = req.query.folderUrl as string;
      if (!folderUrl) return res.status(400).json({ error: "folderUrl is required" });

      let folderId: string | null = null;
      try {
        const parsed = new URL(folderUrl);
        const parts = parsed.pathname.split("/");
        const idx = parts.indexOf("folders");
        if (idx !== -1 && parts[idx + 1]) {
          folderId = parts[idx + 1];
        } else if (parsed.searchParams.get("id")) {
          folderId = parsed.searchParams.get("id");
        }
      } catch {
        folderId = folderUrl.trim();
      }

      if (!folderId) return res.status(400).json({ error: "Could not extract folder ID" });

      const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GOOGLE_DRIVE_API_KEY not configured" });

      // Recursive function to fetch all files from folder + sub-folders
      // IMPORTANT: Each folder's files are sorted internally (by Drive API orderBy=name),
      // but the overall order across modules is preserved by folder traversal order
      // (no global re-sort, so Module 1's videos stay together before Module 2's videos).
      async function fetchAllFiles(parentId: string, moduleName: string = ""): Promise<{title: string, video_url: string, module_name: string}[]> {
        const query = encodeURIComponent(`'${parentId}' in parents and trashed=false`);
        const fields = encodeURIComponent("files(id,name,mimeType)");
        const driveRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=folder,name&pageSize=1000&key=${encodeURIComponent(apiKey)}`
        );
        if (!driveRes.ok) {
          const errBody: any = await driveRes.json();
          throw new Error(errBody?.error?.message || "Google Drive API error");
        }
        const driveData: { files: { id: string; name: string; mimeType: string }[] } = await driveRes.json();
        const files = driveData.files || [];

        // Separate folders and video files at this level
        const subFolders = files.filter(f => f.mimeType === "application/vnd.google-apps.folder");
        const videoFiles = files.filter(f =>
          f.mimeType !== "application/vnd.google-apps.folder" && (
            f.mimeType.includes("video") ||
            f.mimeType === "application/octet-stream" ||
            f.name.match(/\.(mp4|mkv|avi|mov|webm|flv)$/i)
          )
        );

        // Sort videos within this folder by name (numeric-aware)
        videoFiles.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
        );

        let results: {title: string, video_url: string, module_name: string}[] = videoFiles.map(f => ({
          title: f.name.replace(/\.[^/.]+$/, ""),
          video_url: `https://drive.google.com/file/d/${f.id}/preview`,
          module_name: moduleName,
        }));

        // Sort sub-folders by name (numeric-aware) so Module 1 comes before Module 2, etc.
        subFolders.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
        );

        // Process each sub-folder in order, appending its videos as its own module group
        for (const folder of subFolders) {
          const subFiles = await fetchAllFiles(folder.id, folder.name);
          results = results.concat(subFiles);
        }

        return results;
      }

      const lessons = await fetchAllFiles(folderId);
      return res.json({ lessons });

    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── APP SETTINGS / PRICING ────────────────────────────────────────────────
  app.get("/api/settings/price", async (_req, res) => {
    try {
      const price = await storage.getSubscriptionPrice();
      return res.json({ subscription_price: price });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/settings/price", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const price = parseInt(req.body.subscription_price, 10);
      if (isNaN(price) || price < 1) return res.status(400).json({ error: "Invalid price" });
      const updated = await storage.updateSubscriptionPrice(price);
      return res.json({ subscription_price: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── ADMIN REFERRAL MANAGEMENT ──────────────────────────────────────────────
  app.get("/api/admin/referrals", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const data = await storage.getAllUsersWithReferralStats();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/referrals/settings", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const settings = await storage.getReferralSettings();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/referrals/settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { referral_enabled, referral_reward_rules } = req.body;
      await storage.updateReferralSettings(
        Boolean(referral_enabled),
        typeof referral_reward_rules === "string" ? referral_reward_rules : JSON.stringify(referral_reward_rules)
      );
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/referrals/:userId/bonus", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const bonus = parseInt(req.body.bonus ?? "0", 10);
      if (isNaN(userId) || isNaN(bonus)) return res.status(400).json({ error: "Invalid params" });
      await storage.adjustUserReferralBonus(userId, bonus);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Export referral data as CSV
  app.get("/api/admin/referrals/export", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const data = await storage.getAllUsersWithReferralStats();
      const header = "ID,Name,Email,Referral Code,Referred By,Total Referrals,Successful Referrals,Premium Conversions,Bonus Count,Premium";
      const rows = data.map(u =>
        [u.id, `"${u.name}"`, `"${u.email}"`, u.referral_code, `"${u.referred_by_name ?? ""}"`,
          u.total_referrals, u.successful_referrals, u.premium_conversions, u.referral_bonus_count,
          u.subscription_status ? "Yes" : "No"
        ].join(",")
      );
      const csv = [header, ...rows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=byonsoft-referrals.csv");
      return res.send(csv);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
