import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertCourseSchema, insertLessonSchema, insertProgressSchema, 
  insertSkillScoreSchema, insertSubscriptionSchema, insertReferralSchema, 
  insertUserSchema, insertAppSettingsSchema, insertContactSchema, 
  insertWithdrawalSchema, insertWithdrawalMethodSchema, insertAffiliateSchema,
  insertQuizSchema, insertQuizAttemptSchema, insertCertificateSchema,
  insertCourseReviewSchema, insertVideoNoteSchema, insertSavedVideoSchema,
  insertCourseCompletionSchema, insertAdminNoteSchema, insertNotificationSchema,
  insertAnnouncementSchema, insertCourseCategorySchema, insertFaqSchema,
  insertTestimonialSchema, insertFeatureRequestSchema, insertBugReportSchema,
  insertCourseMaterialSchema, insertCourseTagSchema, insertCoursePrerequisiteSchema,
  insertCourseOutcomeSchema, insertCourseModuleSchema, insertCourseModuleLessonSchema,
  insertCourseModuleQuizSchema, insertCourseModuleAssignmentSchema,
  insertCourseModuleResourceSchema, insertCourseModuleDiscussionSchema,
  insertCourseModuleAnnouncementSchema, insertCourseModuleProgressSchema,
  insertCourseModuleCompletionSchema, insertCourseModuleCertificateSchema,
  insertCourseModuleReviewSchema, insertCourseModuleNoteSchema,
  insertCourseModuleSavedVideoSchema, insertCourseModuleVideoNoteSchema,
  insertCourseModuleQuizAttemptSchema, insertCourseModuleAssignmentSubmissionSchema,
  insertCourseModuleDiscussionReplySchema, insertCourseModuleAnnouncementReadSchema,
  insertCourseModuleProgressUpdateSchema, insertCourseModuleCompletionUpdateSchema,
  insertCourseModuleCertificateUpdateSchema, insertCourseModuleReviewUpdateSchema,
  insertCourseModuleNoteUpdateSchema, insertCourseModuleSavedVideoUpdateSchema,
  insertCourseModuleVideoNoteUpdateSchema, insertCourseModuleQuizAttemptUpdateSchema,
  insertCourseModuleAssignmentSubmissionUpdateSchema, insertCourseModuleDiscussionReplyUpdateSchema,
  insertCourseModuleAnnouncementReadUpdateSchema
} from "@shared/schema";
import { BYONSOFT_JSON_SYSTEM_PROMPT, CAREER_MAPPING_PROMPT, getGroqChatCompletion } from "./groq";
import { generateSkillResultCardSVG } from "./imageGenerator";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, skillScores, courses, progress, appSettings, subscriptions, referrals, contacts, withdrawals, withdrawalMethods, affiliates, quizzes, quizAttempts, certificates, courseReviews, videoNotes, savedVideos, courseCompletions, adminNotes, notifications, announcements, courseCategories, faqs, testimonials, featureRequests, bugReports, courseMaterials, courseTags, coursePrerequisites, courseOutcomes, courseModules, courseModuleLessons, courseModuleQuizzes, courseModuleAssignments, courseModuleResources, courseModuleDiscussions, courseModuleAnnouncements, courseModuleProgress, courseModuleCompletions, courseModuleCertificates, courseModuleReviews, courseModuleNotes, courseModuleSavedVideos, courseModuleVideoNotes, courseModuleQuizAttempts, courseModuleAssignmentSubmissions, courseModuleDiscussionReplies, courseModuleAnnouncementReads } from "@shared/schema";
import { sendEmail } from "./email";
import { generateCertificatePDF } from "./certificateGenerator";
import { createObjectCsvStringifier } from "csv-writer";
import { createReadStream } from "fs";
import { join } from "path";
import { statSync } from "fs";
import { Readable } from "stream";

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

// Admin middleware
function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // ── Health ──
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ── App Settings ──
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getAppSettings();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/settings", adminMiddleware, async (req, res) => {
    try {
      const settings = await storage.updateAppSettings(req.body);
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Courses ──
  app.get("/api/courses", async (_req, res) => {
    try {
      const all = await storage.getAllCourses();
      return res.json(all);
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

  app.get("/api/courses/:id/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByCourse(Number(req.params.id));
      return res.json(lessons);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Progress ──
  app.get("/api/progress", authMiddleware, async (req: any, res) => {
    try {
      const list = await storage.getProgressByUser(req.user.id);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/progress", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertProgressSchema.parse(req.body);
      const progress = await storage.upsertProgress({ ...parsed, user_id: req.user.id });
      return res.json(progress);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Skill Test ──
  app.post("/api/skill-test", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertSkillScoreSchema.parse(req.body);
      const score = await storage.upsertSkillScore({ ...parsed, user_id: req.user.id });
      return res.json(score);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/skills", authMiddleware, async (req: any, res) => {
    try {
      const score = await storage.getSkillScore(req.user.id);
      if (!score) return res.json(null);
      
      // Parse roadmap_result to extract learning_order and other AI fields
      let parsed: any = {};
      try {
        parsed = JSON.parse(score.roadmap_result || "{}");
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
      } catch {
        parsed = {};
      }
      
      return res.json({
        ...score,
        learning_order: parsed.learning_order || [],
        confidence_scores: parsed.confidence_scores || { technical: 50, mindset: 50, market_awareness: 50 },
        skill_score: parsed.skill_score || 0,
        skill_level: parsed.skill_level || "Beginner",
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── AI Career Analysis ──
  app.post("/api/ai/career-analysis", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skill = await storage.getSkillScore(userId);
      if (!skill) return res.status(400).json({ error: "Complete the skill test first" });

      // Get actual uploaded courses from database
      const allCourses = await storage.getAllCourses();
      const courseList = allCourses.map(c => `${c.title} (${c.category})`).join(", ");

      const prompt = `User skill assessment:
SKILL SCORES: Technical: ${skill.technical}/100, Communication: ${skill.communication}/100, Logical: ${skill.logical}/100, Digital: ${skill.digital}/100
BACKGROUND: Goal: ${skill.goal || "Not specified"}, Skills: ${skill.existing_skill || "None"}, Device: ${skill.available_tool || "Not specified"}
Note: If device is mobile/phone only, recommend mobile-friendly careers only.

AVAILABLE COURSES IN APP (ONLY recommend from these exact courses):
${courseList}

CRITICAL RULE: recommended_courses MUST contain ONLY course titles from the above list. Do NOT make up courses. If no exact match, pick the closest course from the list.

Output ONLY this JSON (no markdown):
{
  "skill_path": "Primary career path",
  "secondary_path": "Secondary career option",
  "personality_type": "Entrepreneur / Creative / Analyst / Communicator",
  "income_6m": "Realistic PKR income at 6 months",
  "income_12m": "Realistic PKR income at 12 months",
  "recommended_skills": ["skill1", "skill2", "skill3", "skill4"],
  "recommended_courses": ["Exact Course Title from list", "Another from list"],
  "roadmap": { "month1": "...", "month2": "...", "month3": "..." },
  "learning_order": ["Step 1: Start with [Course Name]...", "Step 2: Then learn..."],
  "rarity": "1-15",
  "pitch": "use the exact pitch value from your system instructions"
}`;

      const raw = await getGroqChatCompletion(BYONSOFT_JSON_SYSTEM_PROMPT + "\n\n" + CAREER_MAPPING_PROMPT, prompt);
      let data: any = {};
      try {
        const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
        data = JSON.parse(cleaned);
        if (typeof data === "string") data = JSON.parse(data);
      } catch (e) {
        console.error("AI JSON parse error:", e, "Raw:", raw);
        return res.status(500).json({ error: "AI response parse failed" });
      }

      // Ensure learning_order exists
      if (!data.learning_order || !Array.isArray(data.learning_order) || data.learning_order.length === 0) {
        data.learning_order = [
          "Step 1: Apne basic skills ko strong karo",
          "Step 2: Portfolio banana seekho",
          "Step 3: Freelancing platforms pe profile banao",
          "Step 4: First client dhundo aur experience gain karo"
        ];
      }

      // Ensure confidence_scores are different
      if (data.confidence_scores) {
        const { technical = 50, mindset = 50, market_awareness = 50 } = data.confidence_scores;
        if (technical === mindset && mindset === market_awareness) {
          data.confidence_scores = {
            technical: Math.min(95, Math.max(10, technical + 15)),
            mindset: Math.min(95, Math.max(10, mindset)),
            market_awareness: Math.min(95, Math.max(10, market_awareness - 10))
          };
        }
      }

      // Ensure skill_score is valid
      if (!data.skill_score || data.skill_score === 0 || data.skill_score === 100) {
        const avg = Math.round((skill.technical + skill.communication + skill.logical + skill.digital) / 4);
        data.skill_score = avg > 0 ? Math.min(95, Math.max(10, avg)) : 25;
      }

      // Filter recommended_courses to only include actual uploaded courses
      if (data.recommended_courses && Array.isArray(data.recommended_courses)) {
        const validCourseTitles = allCourses.map(c => c.title.toLowerCase());
        data.recommended_courses = data.recommended_courses.filter((rc: string) => 
          validCourseTitles.some(vt => rc.toLowerCase().includes(vt) || vt.includes(rc.toLowerCase()))
        );
        // If no matches, pick top 3 courses by category relevance
        if (data.recommended_courses.length === 0) {
          const relevantCourses = allCourses.slice(0, 3);
          data.recommended_courses = relevantCourses.map(c => c.title);
        }
      }

      await storage.updateSkillScoreRoadmap(userId, JSON.stringify(data));

      return res.json({ 
        ...data, 
        recommended_skills: data.recommended_skills || [], 
        roadmap: data.roadmap || {}, 
        learning_order: data.learning_order,
        pitch: data.pitch ?? "" 
      });
    } catch (err: any) {
      console.error("Career analysis error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── AI Chat ──
  app.post("/api/ai/chat", authMiddleware, async (req: any, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "Message required" });

      const skill = await storage.getSkillScore(req.user.id);
      const context = skill ? `User skill: Tech:${skill.technical}, Comm:${skill.communication}, Logic:${skill.logical}, Digital:${skill.digital}. Goal: ${skill.goal || "N/A"}` : "No skill test yet.";

      const prompt = `${context}\n\nUser: ${message}\n\nRespond in Roman Urdu or English. Be encouraging and practical.`;
      const reply = await getGroqChatCompletion(BYONSOFT_JSON_SYSTEM_PROMPT, prompt);
      return res.json({ reply });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Subscription ──
  app.get("/api/subscription", authMiddleware, async (req: any, res) => {
    try {
      const sub = await storage.getSubscription(req.user.id);
      return res.json(sub);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/subscription", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertSubscriptionSchema.parse(req.body);
      const sub = await storage.createSubscription({ ...parsed, user_id: req.user.id });
      return res.json(sub);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Referrals ──
  app.get("/api/referrals", authMiddleware, async (req: any, res) => {
    try {
      const list = await storage.getReferralsByUser(req.user.id);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/referrals", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertReferralSchema.parse(req.body);
      const ref = await storage.createReferral({ ...parsed, referrer_id: req.user.id });
      return res.json(ref);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Share Image ──
  app.get("/api/share-image/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const skill = await storage.getSkillScore(userId);
      if (!skill) return res.status(404).json({ error: "No skill score found" });

      let parsed: any = {};
      try {
        parsed = JSON.parse(skill.roadmap_result || "{}");
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
      } catch {
        parsed = {};
      }

      const svg = generateSkillResultCardSVG({
        skill_level: parsed.skill_level || "Beginner",
        skill_score: parsed.skill_score || 0,
        career_paths: parsed.career_paths || [],
        expected_income: parsed.expected_income || "PKR 0",
        timeline: parsed.timeline || "N/A",
        technical: parsed.confidence_scores?.technical || 0,
        mindset: parsed.confidence_scores?.mindset || 0,
        market_awareness: parsed.confidence_scores?.market_awareness || 0,
        share_url: `${req.protocol}://${req.get("host")}/career-result?u=${userId}`,
        learning_order: parsed.learning_order || [],
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.send(svg);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Contact ──
  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(parsed);
      return res.json(contact);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Admin Routes ──
  app.get("/api/admin/users", adminMiddleware, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/progress", adminMiddleware, async (_req, res) => {
    try {
      const progress = await storage.getAllProgress();
      return res.json(progress);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/skill-scores", adminMiddleware, async (_req, res) => {
    try {
      const scores = await storage.getAllSkillScores();
      return res.json(scores);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/subscriptions", adminMiddleware, async (_req, res) => {
    try {
      const subs = await storage.getAllSubscriptions();
      return res.json(subs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/referrals", adminMiddleware, async (_req, res) => {
    try {
      const refs = await storage.getAllReferrals();
      return res.json(refs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/contacts", adminMiddleware, async (_req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      return res.json(contacts);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Withdrawals ──
  app.get("/api/withdrawals", authMiddleware, async (req: any, res) => {
    try {
      const list = await storage.getWithdrawalsByUser(req.user.id);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/withdrawals", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertWithdrawalSchema.parse(req.body);
      const withdrawal = await storage.createWithdrawal({ ...parsed, user_id: req.user.id });
      return res.json(withdrawal);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Affiliate ──
  app.get("/api/affiliate", authMiddleware, async (req: any, res) => {
    try {
      const affiliate = await storage.getAffiliate(req.user.id);
      return res.json(affiliate);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/affiliate", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate({ ...parsed, user_id: req.user.id });
      return res.json(affiliate);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Quizzes ──
  app.get("/api/quizzes/:courseId", async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByCourse(Number(req.params.courseId));
      return res.json(quizzes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/quiz-attempts", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertQuizAttemptSchema.parse(req.body);
      const attempt = await storage.createQuizAttempt({ ...parsed, user_id: req.user.id });
      return res.json(attempt);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Certificates ──
  app.get("/api/certificates", authMiddleware, async (req: any, res) => {
    try {
      const certs = await storage.getCertificatesByUser(req.user.id);
      return res.json(certs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/certificates", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCertificateSchema.parse(req.body);
      const cert = await storage.createCertificate({ ...parsed, user_id: req.user.id });
      return res.json(cert);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Reviews ──
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getCourseReviews(Number(req.params.id));
      return res.json(reviews);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/reviews", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseReviewSchema.parse(req.body);
      const review = await storage.createCourseReview({ ...parsed, user_id: req.user.id, course_id: Number(req.params.id) });
      return res.json(review);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Video Notes ──
  app.get("/api/video-notes", authMiddleware, async (req: any, res) => {
    try {
      const notes = await storage.getVideoNotesByUser(req.user.id);
      return res.json(notes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/video-notes", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertVideoNoteSchema.parse(req.body);
      const note = await storage.createVideoNote({ ...parsed, user_id: req.user.id });
      return res.json(note);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Saved Videos ──
  app.get("/api/saved-videos", authMiddleware, async (req: any, res) => {
    try {
      const videos = await storage.getSavedVideosByUser(req.user.id);
      return res.json(videos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/saved-videos", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertSavedVideoSchema.parse(req.body);
      const video = await storage.createSavedVideo({ ...parsed, user_id: req.user.id });
      return res.json(video);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Completions ──
  app.get("/api/course-completions", authMiddleware, async (req: any, res) => {
    try {
      const completions = await storage.getCourseCompletionsByUser(req.user.id);
      return res.json(completions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/course-completions", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseCompletionSchema.parse(req.body);
      const completion = await storage.createCourseCompletion({ ...parsed, user_id: req.user.id });
      return res.json(completion);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Admin Notes ──
  app.get("/api/admin/notes", adminMiddleware, async (_req, res) => {
    try {
      const notes = await storage.getAllAdminNotes();
      return res.json(notes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/notes", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertAdminNoteSchema.parse(req.body);
      const note = await storage.createAdminNote({ ...parsed, admin_id: req.user.id });
      return res.json(note);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Notifications ──
  app.get("/api/notifications", authMiddleware, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      return res.json(notifications);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/notifications", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification({ ...parsed, user_id: req.user.id });
      return res.json(notification);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Announcements ──
  app.get("/api/announcements", async (_req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      return res.json(announcements);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/announcements", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({ ...parsed, admin_id: req.user.id });
      return res.json(announcement);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Categories ──
  app.get("/api/course-categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCourseCategories();
      return res.json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/course-categories", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseCategorySchema.parse(req.body);
      const category = await storage.createCourseCategory(parsed);
      return res.json(category);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── FAQs ──
  app.get("/api/faqs", async (_req, res) => {
    try {
      const faqs = await storage.getAllFaqs();
      return res.json(faqs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/faqs", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(parsed);
      return res.json(faq);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Testimonials ──
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      return res.json(testimonials);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/testimonials", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(parsed);
      return res.json(testimonial);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Feature Requests ──
  app.get("/api/feature-requests", async (_req, res) => {
    try {
      const requests = await storage.getAllFeatureRequests();
      return res.json(requests);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/feature-requests", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertFeatureRequestSchema.parse(req.body);
      const request = await storage.createFeatureRequest({ ...parsed, user_id: req.user.id });
      return res.json(request);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Bug Reports ──
  app.get("/api/bug-reports", adminMiddleware, async (_req, res) => {
    try {
      const reports = await storage.getAllBugReports();
      return res.json(reports);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/bug-reports", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertBugReportSchema.parse(req.body);
      const report = await storage.createBugReport({ ...parsed, user_id: req.user.id });
      return res.json(report);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Materials ──
  app.get("/api/courses/:id/materials", async (req, res) => {
    try {
      const materials = await storage.getCourseMaterials(Number(req.params.id));
      return res.json(materials);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/materials", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseMaterialSchema.parse(req.body);
      const material = await storage.createCourseMaterial({ ...parsed, course_id: Number(req.params.id) });
      return res.json(material);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Tags ──
  app.get("/api/courses/:id/tags", async (req, res) => {
    try {
      const tags = await storage.getCourseTags(Number(req.params.id));
      return res.json(tags);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/tags", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseTagSchema.parse(req.body);
      const tag = await storage.createCourseTag({ ...parsed, course_id: Number(req.params.id) });
      return res.json(tag);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Prerequisites ──
  app.get("/api/courses/:id/prerequisites", async (req, res) => {
    try {
      const prerequisites = await storage.getCoursePrerequisites(Number(req.params.id));
      return res.json(prerequisites);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/prerequisites", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCoursePrerequisiteSchema.parse(req.body);
      const prerequisite = await storage.createCoursePrerequisite({ ...parsed, course_id: Number(req.params.id) });
      return res.json(prerequisite);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Outcomes ──
  app.get("/api/courses/:id/outcomes", async (req, res) => {
    try {
      const outcomes = await storage.getCourseOutcomes(Number(req.params.id));
      return res.json(outcomes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/outcomes", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseOutcomeSchema.parse(req.body);
      const outcome = await storage.createCourseOutcome({ ...parsed, course_id: Number(req.params.id) });
      return res.json(outcome);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Modules ──
  app.get("/api/courses/:id/modules", async (req, res) => {
    try {
      const modules = await storage.getCourseModules(Number(req.params.id));
      return res.json(modules);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses/:id/modules", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleSchema.parse(req.body);
      const module = await storage.createCourseModule({ ...parsed, course_id: Number(req.params.id) });
      return res.json(module);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Lessons ──
  app.get("/api/modules/:id/lessons", async (req, res) => {
    try {
      const lessons = await storage.getCourseModuleLessons(Number(req.params.id));
      return res.json(lessons);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/lessons", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleLessonSchema.parse(req.body);
      const lesson = await storage.createCourseModuleLesson({ ...parsed, module_id: Number(req.params.id) });
      return res.json(lesson);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Quizzes ──
  app.get("/api/modules/:id/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getCourseModuleQuizzes(Number(req.params.id));
      return res.json(quizzes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/quizzes", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleQuizSchema.parse(req.body);
      const quiz = await storage.createCourseModuleQuiz({ ...parsed, module_id: Number(req.params.id) });
      return res.json(quiz);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Assignments ──
  app.get("/api/modules/:id/assignments", async (req, res) => {
    try {
      const assignments = await storage.getCourseModuleAssignments(Number(req.params.id));
      return res.json(assignments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/assignments", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleAssignmentSchema.parse(req.body);
      const assignment = await storage.createCourseModuleAssignment({ ...parsed, module_id: Number(req.params.id) });
      return res.json(assignment);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Resources ──
  app.get("/api/modules/:id/resources", async (req, res) => {
    try {
      const resources = await storage.getCourseModuleResources(Number(req.params.id));
      return res.json(resources);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/resources", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleResourceSchema.parse(req.body);
      const resource = await storage.createCourseModuleResource({ ...parsed, module_id: Number(req.params.id) });
      return res.json(resource);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Discussions ──
  app.get("/api/modules/:id/discussions", async (req, res) => {
    try {
      const discussions = await storage.getCourseModuleDiscussions(Number(req.params.id));
      return res.json(discussions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/discussions", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleDiscussionSchema.parse(req.body);
      const discussion = await storage.createCourseModuleDiscussion({ ...parsed, module_id: Number(req.params.id), user_id: req.user.id });
      return res.json(discussion);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Announcements ──
  app.get("/api/modules/:id/announcements", async (req, res) => {
    try {
      const announcements = await storage.getCourseModuleAnnouncements(Number(req.params.id));
      return res.json(announcements);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/announcements", adminMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleAnnouncementSchema.parse(req.body);
      const announcement = await storage.createCourseModuleAnnouncement({ ...parsed, module_id: Number(req.params.id), admin_id: req.user.id });
      return res.json(announcement);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Progress ──
  app.get("/api/modules/:id/progress", authMiddleware, async (req: any, res) => {
    try {
      const progress = await storage.getCourseModuleProgress(req.user.id, Number(req.params.id));
      return res.json(progress);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/progress", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleProgressSchema.parse(req.body);
      const progress = await storage.upsertCourseModuleProgress({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(progress);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Completions ──
  app.get("/api/modules/:id/completions", authMiddleware, async (req: any, res) => {
    try {
      const completions = await storage.getCourseModuleCompletions(req.user.id, Number(req.params.id));
      return res.json(completions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/completions", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleCompletionSchema.parse(req.body);
      const completion = await storage.createCourseModuleCompletion({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(completion);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Certificates ──
  app.get("/api/modules/:id/certificates", authMiddleware, async (req: any, res) => {
    try {
      const certificates = await storage.getCourseModuleCertificates(req.user.id, Number(req.params.id));
      return res.json(certificates);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/certificates", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleCertificateSchema.parse(req.body);
      const certificate = await storage.createCourseModuleCertificate({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(certificate);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Reviews ──
  app.get("/api/modules/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getCourseModuleReviews(Number(req.params.id));
      return res.json(reviews);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/reviews", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleReviewSchema.parse(req.body);
      const review = await storage.createCourseModuleReview({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(review);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Notes ──
  app.get("/api/modules/:id/notes", authMiddleware, async (req: any, res) => {
    try {
      const notes = await storage.getCourseModuleNotes(req.user.id, Number(req.params.id));
      return res.json(notes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/notes", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleNoteSchema.parse(req.body);
      const note = await storage.createCourseModuleNote({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(note);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Saved Videos ──
  app.get("/api/modules/:id/saved-videos", authMiddleware, async (req: any, res) => {
    try {
      const videos = await storage.getCourseModuleSavedVideos(req.user.id, Number(req.params.id));
      return res.json(videos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/saved-videos", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleSavedVideoSchema.parse(req.body);
      const video = await storage.createCourseModuleSavedVideo({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(video);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Video Notes ──
  app.get("/api/modules/:id/video-notes", authMiddleware, async (req: any, res) => {
    try {
      const notes = await storage.getCourseModuleVideoNotes(req.user.id, Number(req.params.id));
      return res.json(notes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/video-notes", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleVideoNoteSchema.parse(req.body);
      const note = await storage.createCourseModuleVideoNote({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(note);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Quiz Attempts ──
  app.get("/api/modules/:id/quiz-attempts", authMiddleware, async (req: any, res) => {
    try {
      const attempts = await storage.getCourseModuleQuizAttempts(req.user.id, Number(req.params.id));
      return res.json(attempts);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/quiz-attempts", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleQuizAttemptSchema.parse(req.body);
      const attempt = await storage.createCourseModuleQuizAttempt({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(attempt);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Assignment Submissions ──
  app.get("/api/modules/:id/assignment-submissions", authMiddleware, async (req: any, res) => {
    try {
      const submissions = await storage.getCourseModuleAssignmentSubmissions(req.user.id, Number(req.params.id));
      return res.json(submissions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules/:id/assignment-submissions", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleAssignmentSubmissionSchema.parse(req.body);
      const submission = await storage.createCourseModuleAssignmentSubmission({ ...parsed, user_id: req.user.id, module_id: Number(req.params.id) });
      return res.json(submission);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Discussion Replies ──
  app.get("/api/discussions/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getCourseModuleDiscussionReplies(Number(req.params.id));
      return res.json(replies);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/discussions/:id/replies", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleDiscussionReplySchema.parse(req.body);
      const reply = await storage.createCourseModuleDiscussionReply({ ...parsed, user_id: req.user.id, discussion_id: Number(req.params.id) });
      return res.json(reply);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Course Module Announcement Reads ──
  app.get("/api/announcements/:id/reads", authMiddleware, async (req: any, res) => {
    try {
      const reads = await storage.getCourseModuleAnnouncementReads(req.user.id, Number(req.params.id));
      return res.json(reads);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/announcements/:id/reads", authMiddleware, async (req: any, res) => {
    try {
      const parsed = insertCourseModuleAnnouncementReadSchema.parse(req.body);
      const read = await storage.createCourseModuleAnnouncementRead({ ...parsed, user_id: req.user.id, announcement_id: Number(req.params.id) });
      return res.json(read);
    } catch (err: any) {
      if (err instanceof ZodError) return res.status(400).json({ error: fromZodError(err).message });
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Certificate Download ──
  app.get("/api/certificates/:id/download", authMiddleware, async (req: any, res) => {
    try {
      const cert = await storage.getCertificate(Number(req.params.id));
      if (!cert) return res.status(404).json({ error: "Certificate not found" });
      if (cert.user_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const pdf = await generateCertificatePDF(cert);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="certificate-${cert.id}.pdf"`);
      return res.send(pdf);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── CSV Export ──
  app.get("/api/admin/export/:type", adminMiddleware, async (req, res) => {
    try {
      const type = req.params.type;
      let data: any[] = [];
      let headers: { id: string; title: string }[] = [];

      switch (type) {
        case "users":
          data = await storage.getAllUsers();
          headers = [
            { id: "id", title: "ID" },
            { id: "username", title: "Username" },
            { id: "email", title: "Email" },
            { id: "role", title: "Role" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        case "progress":
          data = await storage.getAllProgress();
          headers = [
            { id: "id", title: "ID" },
            { id: "user_id", title: "User ID" },
            { id: "course_id", title: "Course ID" },
            { id: "lesson_id", title: "Lesson ID" },
            { id: "completed", title: "Completed" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        case "skill-scores":
          data = await storage.getAllSkillScores();
          headers = [
            { id: "id", title: "ID" },
            { id: "user_id", title: "User ID" },
            { id: "technical", title: "Technical" },
            { id: "communication", title: "Communication" },
            { id: "logical", title: "Logical" },
            { id: "digital", title: "Digital" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        case "subscriptions":
          data = await storage.getAllSubscriptions();
          headers = [
            { id: "id", title: "ID" },
            { id: "user_id", title: "User ID" },
            { id: "status", title: "Status" },
            { id: "amount", title: "Amount" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        case "referrals":
          data = await storage.getAllReferrals();
          headers = [
            { id: "id", title: "ID" },
            { id: "referrer_id", title: "Referrer ID" },
            { id: "referred_id", title: "Referred ID" },
            { id: "status", title: "Status" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        case "contacts":
          data = await storage.getAllContacts();
          headers = [
            { id: "id", title: "ID" },
            { id: "name", title: "Name" },
            { id: "email", title: "Email" },
            { id: "subject", title: "Subject" },
            { id: "created_at", title: "Created At" },
          ];
          break;
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }

      const csvStringifier = createObjectCsvStringifier({ header: headers });
      const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${type}-export.csv"`);
      return res.send(csv);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── File Upload ──
  app.post("/api/upload", adminMiddleware, async (req: any, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const file = req.files.file;
      const uploadDir = join(process.cwd(), "uploads");
      const filePath = join(uploadDir, file.name);
      await file.mv(filePath);
      return res.json({ url: `/uploads/${file.name}` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Static Files ──
  app.use("/uploads", (req, res, next) => {
    const filePath = join(process.cwd(), "uploads", req.path);
    try {
      const stat = statSync(filePath);
      if (stat.isFile()) {
        return res.sendFile(filePath);
      }
    } catch {
      // File not found
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
