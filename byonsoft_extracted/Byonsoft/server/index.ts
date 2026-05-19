import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ limit: "10mb", extended: true }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

async function seedDatabase() {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Ensure lessons table exists (created via direct SQL, not Drizzle)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        module_name TEXT NOT NULL DEFAULT ''
      )
    `);

    // Add module_name column to existing lessons tables that predate this feature
    await pool.query(`
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_name TEXT NOT NULL DEFAULT ''
    `);

    // Add referral, subscription, and whatsapp columns to users if they predate these features
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry_date TIMESTAMP`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT`);

    // Backfill referral codes for any users missing them
    await pool.query(`
      UPDATE users SET referral_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT), 1, 8))
      WHERE referral_code IS NULL
    `);

    // Ensure app_settings table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        subscription_price INTEGER NOT NULL DEFAULT 750
      )
    `);

    // Ensure the default price row exists
    await pool.query(`
      INSERT INTO app_settings (id, subscription_price)
      VALUES ('main', 750)
      ON CONFLICT (id) DO NOTHING
    `);

    // Ensure career_analyses table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS career_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        share_id TEXT NOT NULL UNIQUE,
        skill_path TEXT NOT NULL,
        secondary_path TEXT NOT NULL DEFAULT '',
        personality_type TEXT NOT NULL DEFAULT '',
        income_6m TEXT NOT NULL DEFAULT '',
        income_12m TEXT NOT NULL DEFAULT '',
        recommended_skills TEXT NOT NULL DEFAULT '[]',
        roadmap TEXT NOT NULL DEFAULT '{}',
        rarity TEXT NOT NULL DEFAULT '10',
        result_image_url TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS result_image_url TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS result_png_url TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS result_jpg_url TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_bonus_count INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS referral_enabled BOOLEAN NOT NULL DEFAULT true`);
    await pool.query(`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS referral_reward_rules TEXT NOT NULL DEFAULT '[]'`);
    await pool.query(`
      INSERT INTO app_settings (id, subscription_price, referral_enabled, referral_reward_rules)
      VALUES ('main', 750, true, '[]')
      ON CONFLICT (id) DO NOTHING
    `);

    await pool.end();

    // Seed admin user if missing
    const existing = await storage.getUserByEmail("admin@byonsoft.com");
    if (!existing) {
      const password_hash = await bcrypt.hash("password", 10);
      const admin = await storage.createUser({
        name: "Super Admin",
        email: "admin@byonsoft.com",
        password_hash,
      });
      await storage.updateUserRole(admin.id, "admin");
      await storage.updateUserSubscription(admin.id, true);
      log("Seeded admin user: admin@byonsoft.com", "seed");
    }

    // Seed default payment methods if none exist
    const methods = await storage.getAllPaymentSettings();
    if (methods.length === 0) {
      const defaults = [
        { method_name: "JazzCash", account_details: "Account Number: (update via admin panel)\nName: Byonsoft Academy" },
        { method_name: "EasyPaisa", account_details: "Account Number: (update via admin panel)\nName: Byonsoft Academy" },
        { method_name: "Bank Transfer", account_details: "Bank: (update via admin panel)\nAccount Title: Byonsoft Academy" },
      ];
      for (const m of defaults) {
        await storage.createPaymentSetting(m);
      }
      log("Seeded default payment methods", "seed");
    }

    log("Database seed complete", "seed");
  } catch (err: any) {
    log(`Seed error: ${err.message}`, "seed");
  }
}

(async () => {
  await seedDatabase();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
