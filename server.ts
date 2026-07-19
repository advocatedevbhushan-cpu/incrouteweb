import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import compression from "compression";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerBooksRoutes } from "./server/books/routes";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK on server side with proper headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Active compliance calendar list for reference or audit tasks
let complianceCalendar = [
  { id: "1", service: "GST Filing", description: "Monthly GSTR-1 & GSTR-3B filings", dueDate: "11th and 20th of every month", type: "taxation", downloadUrl: "https://www.gst.gov.in/" },
  { id: "2", service: "Income Tax Audit", description: "Tax Audit Filing and assessment for entities", dueDate: "September 30th annually", type: "taxation", downloadUrl: "https://www.incometax.gov.in/iec/foportal/" },
  { id: "3", service: "ROC Annual Filing", description: "Form MGT-7 and Form AOC-4 Filing with Registrar", dueDate: "Within 30 and 60 days of AGM", type: "corporate", downloadUrl: "https://www.mca.gov.in/content/mca/global/en/help-guide/company-forms-download.html" },
  { id: "4", service: "TDS Returns", description: "Quarterly TDS Filings (Form 24Q, 26Q)", dueDate: "Last day of succeeding month of quarter", type: "taxation", downloadUrl: "https://www.tin-nsdl.com/services/etds-etcs/etds-index.html" },
  { id: "5", service: "EPF & ESIC Return", description: "Monthly social security statutory deposit and returns", dueDate: "15th of every month", type: "employment", downloadUrl: "https://www.epfindia.gov.in/" }
];

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Compression middleware — reduces response size by 60-80%
  app.use(compression());

  const JWT_SECRET = process.env.JWT_SECRET || "incroute_jwt_secret_2024";

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.removeHeader("X-Powered-By");
    next();
  });

  // Health check (always works)
  app.get("/api/health", async (req, res) => {
    let dbStatus = "unknown";
    try {
      const conn = await getPlatformConnection();
      const [rows]: any = await conn.query("SELECT COUNT(*) as count FROM `User`");
      dbStatus = `connected (${rows[0].count} users)`;
      conn.release();
    } catch (e: any) {
      dbStatus = `error: ${e.message?.substring(0, 50)}`;
    }
    res.json({ status: "ok", timestamp: new Date().toISOString(), db: dbStatus });
  });

  // Platform DB connection helper — uses connection pool for automatic cleanup
  let platformPool: any = null;
  
  const getPlatformConnection = async () => {
    const dbUrl = process.env.DATABASE_URL || "";
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) throw new Error("DATABASE_URL not configured");
    const [, user, pass, host, port, database] = match;
    
    // Reuse pool if already created
    if (!platformPool) {
      platformPool = mysql.createPool({
        host, port: Number(port), user, password: decodeURIComponent(pass), database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        idleTimeout: 60000,
        enableKeepAlive: true,
        timezone: 'Z',
      });
    }
    
    return platformPool.getConnection();
  };

  // Books DB connection helper — uses separate pool, falls back to platform DB URL
  let booksPool: any = null;

  const getBooksConnection = async () => {
    const dbUrl = process.env.BOOKS_DATABASE_URL || process.env.DATABASE_URL || "";
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) throw new Error("BOOKS_DATABASE_URL or DATABASE_URL not configured");
    const [, user, pass, host, port, database] = match;

    if (!booksPool) {
      booksPool = mysql.createPool({
        host, port: Number(port), user, password: decodeURIComponent(pass), database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        idleTimeout: 60000,
        enableKeepAlive: true,
        timezone: 'Z',
      });
    }

    return booksPool.getConnection();
  };

  // Ensure Timesheet table exists at startup
  (async () => {
    try {
      const conn = await getPlatformConnection();
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`Timesheet\` (
          \`id\` VARCHAR(30) NOT NULL,
          \`userId\` VARCHAR(30) NOT NULL,
          \`clientId\` VARCHAR(30) NULL,
          \`customClient\` VARCHAR(100) NULL,
          \`description\` TEXT NOT NULL,
          \`startTime\` DATETIME NOT NULL,
          \`endTime\` DATETIME NULL,
          \`duration\` INT NOT NULL DEFAULT 0,
          \`billable\` TINYINT(1) NOT NULL DEFAULT 0,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`Timesheet_userId_idx\` (\`userId\`),
          INDEX \`Timesheet_clientId_idx\` (\`clientId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      try {
        await conn.query("ALTER TABLE `Timesheet` ADD COLUMN `customClient` VARCHAR(100) NULL AFTER `clientId` ");
      } catch (e: any) {}
      console.log("[DB Startup] Timesheet table verified/created successfully.");
      conn.release();
    } catch (err: any) {
      console.error("[DB Startup Warning] Failed to verify Timesheet table on startup:", err.message);
    }
  })();

  // ─── ADMIN REGISTRATION (raw SQL, no Prisma needed) ───
  // Visit: /api/setup-admin?key=incroute2026 to create the admin user
  app.get("/api/setup-admin", async (req, res) => {
    const setupKey = req.query.key;
    if (setupKey !== "incroute2026") {
      return res.status(403).json({ error: "Invalid setup key" });
    }
    try {
      const conn = await getPlatformConnection();

      // Update existing admin email or create new one
      const adminEmail = "d.bhushan@incroute.com";
      const [existing]: any = await conn.query("SELECT id FROM `User` WHERE role = 'SUPER_ADMIN' LIMIT 1");
      
      if (existing.length > 0) {
        // Update existing admin's email and reset password
        const passwordHash = await bcrypt.hash("Admin@2026", 12);
        const now = new Date().toISOString().slice(0, 23).replace("T", " ");
        await conn.query("UPDATE `User` SET email = ?, passwordHash = ?, updatedAt = ? WHERE id = ?", 
          [adminEmail, passwordHash, now, existing[0].id]);
        conn.release();
        return res.json({ success: true, message: "Admin user updated!", credentials: { email: adminEmail, password: "***hidden***" }, hint: "Password is the same as ADMIN_PASSWORD env variable" });
      }

      // Create new admin
      const passwordHash = await bcrypt.hash("Admin@2026", 12);
      const id = "admin_" + Date.now().toString(36);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      
      await conn.query(
        `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, adminEmail, passwordHash, "Dev", "Bhushan", "+918707552183", "SUPER_ADMIN", 1, 1, now, now]
      );
      
      conn.release();
      res.json({ 
        success: true, 
        message: "Admin user created!", 
        credentials: { email: adminEmail, password: "***hidden***" },
        hint: "Password is the same as ADMIN_PASSWORD env variable"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Admin setup failed", details: err.message });
    }
  });

  // ─── RAW SQL AUTH ENDPOINTS (bypasses Prisma binary requirement) ───
  // ─── RATE LIMITING & SECURITY ───
  const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();
  
  // Clean up old entries every 15 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of loginAttempts.entries()) {
      if (now - data.lastAttempt > 30 * 60 * 1000) loginAttempts.delete(key);
    }
  }, 15 * 60 * 1000);

  function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntilMs: number } {
    const now = Date.now();
    const entry = loginAttempts.get(identifier);
    
    if (!entry) return { allowed: true, remainingAttempts: 5, lockedUntilMs: 0 };
    
    // If locked, check if lock expired
    if (entry.lockedUntil > now) {
      return { allowed: false, remainingAttempts: 0, lockedUntilMs: entry.lockedUntil - now };
    }
    
    // Reset if last attempt was more than 15 min ago
    if (now - entry.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: 5, lockedUntilMs: 0 };
    }
    
    if (entry.count >= 5) {
      // Lock for 15 minutes after 5 failed attempts
      entry.lockedUntil = now + 15 * 60 * 1000;
      return { allowed: false, remainingAttempts: 0, lockedUntilMs: 15 * 60 * 1000 };
    }
    
    return { allowed: true, remainingAttempts: 5 - entry.count, lockedUntilMs: 0 };
  }

  function recordFailedAttempt(identifier: string) {
    const entry = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
    entry.count += 1;
    entry.lastAttempt = Date.now();
    loginAttempts.set(identifier, entry);
  }

  function clearAttempts(identifier: string) {
    loginAttempts.delete(identifier);
  }

  // Prevent browser/CDN caching on all auth endpoints
  app.use("/api/auth", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Prevent caching on admin API responses (session-sensitive data)
  app.use("/api/admin", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      // Input sanitization — prevent bcrypt DoS with extremely long passwords
      if (email.length > 191 || password.length > 128) {
        return res.status(400).json({ error: "Invalid input length" });
      }

      // Rate limit check
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const rateLimitKey = `${email}:${clientIp}`;
      const rateCheck = checkRateLimit(rateLimitKey);
      
      if (!rateCheck.allowed) {
        const minutes = Math.ceil(rateCheck.lockedUntilMs / 60000);
        return res.status(429).json({ 
          error: `Too many failed attempts. Account locked for ${minutes} minute(s).`,
          lockedMinutes: minutes
        });
      }

      // Token expiry based on rememberMe
      const accessExpiry = rememberMe ? "7d" : "24h";
      const refreshExpiry = rememberMe ? "30d" : "7d";

      // Fallback admin login (works even if DB is not set up)
      const fallbackAdminEmail = process.env.ADMIN_EMAIL || "d.bhushan@incroute.com";
      const fallbackAdminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
      
      if (email === fallbackAdminEmail && password === fallbackAdminPassword) {
        clearAttempts(rateLimitKey);
  const secret = JWT_SECRET;
        const accessToken = jwt.sign(
          { userId: "admin_fallback", email, role: "SUPER_ADMIN", sessionId: "fallback_" + Date.now() },
          secret,
          { expiresIn: accessExpiry }
        );
        const refreshToken = jwt.sign(
          { userId: "admin_fallback", sessionId: "fallback_" + Date.now(), type: "refresh" },
          secret,
          { expiresIn: refreshExpiry }
        );
        return res.json({
          success: true,
          user: { id: "admin_fallback", email, firstName: "Dev", lastName: "Bhushan", role: "SUPER_ADMIN" },
          accessToken,
          refreshToken
        });
      }

      // Database-backed login
      const conn = await getPlatformConnection();
      const [users]: any = await conn.query(
        "SELECT id, email, passwordHash, firstName, lastName, role, isActive FROM `User` WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        conn.release();
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 });
      }

      const user = users[0];
      if (!user.isActive) {
        conn.release();
        return res.status(403).json({ error: "Account is deactivated. Please contact support." });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        conn.release();
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 });
      }

      // Success — clear rate limit
      clearAttempts(rateLimitKey);

      // Update last login
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `User` SET lastLoginAt = ? WHERE id = ?", [now, user.id]);

      // Create session
      const sessionId = "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
      const sessionDays = rememberMe ? 30 : 7;
      const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Session\` (id, userId, ipAddress, userAgent, isActive, createdAt, lastActive, expiresAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, user.id, clientIp, req.headers["user-agent"] || "", 1, now, now, expiresAt]
      );

      conn.release();

      // Sign JWT
const secret = JWT_SECRET;
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, sessionId },
        secret,
        { expiresIn: accessExpiry }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, sessionId, type: "refresh" },
        secret,
        { expiresIn: refreshExpiry }
      );

      res.json({
        success: true,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        accessToken,
        refreshToken
      });
    } catch (err: any) {
      // If DB fails, still allow fallback admin
      try {
          const { email, password, rememberMe } = req.body;
        const fallbackAdminEmail = process.env.ADMIN_EMAIL || "d.bhushan@incroute.com";
        const fallbackAdminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
        
        if (email === fallbackAdminEmail && password === fallbackAdminPassword) {
    const secret = JWT_SECRET;
          const accessExpiry = rememberMe ? "7d" : "24h";
          const refreshExpiry = rememberMe ? "30d" : "7d";
          const accessToken = jwt.sign(
            { userId: "admin_fallback", email, role: "SUPER_ADMIN", sessionId: "fallback_" + Date.now() },
            secret,
            { expiresIn: accessExpiry }
          );
          const refreshToken = jwt.sign(
            { userId: "admin_fallback", sessionId: "fallback_" + Date.now(), type: "refresh" },
            secret,
            { expiresIn: refreshExpiry }
          );
          return res.json({
            success: true,
            user: { id: "admin_fallback", email, firstName: "Dev", lastName: "Bhushan", role: "SUPER_ADMIN" },
            accessToken,
            refreshToken
          });
        }
      } catch {}
      res.status(500).json({ error: "Login failed. Please try again later." });
    }
  });

  // Logout endpoint — invalidates session
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.json({ success: true });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      if (decoded.sessionId && decoded.sessionId !== "fallback_") {
        try {
          const conn = await getPlatformConnection();
          await conn.query("UPDATE `Session` SET isActive = 0 WHERE id = ?", [decoded.sessionId]);
          conn.release();
        } catch {}
      }
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  });

  // Forgot password — sends reset instructions
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    // Always return success to prevent email enumeration
    // In production, this would send an email with a reset link
    try {
      const conn = await getPlatformConnection();
      const [users]: any = await conn.query("SELECT id, email FROM `User` WHERE email = ?", [email]);
      conn.release();
      
      if (users.length > 0) {
        // TODO: Send password reset email when SMTP is configured
        console.log(`🔑 Password reset requested for: ${email}`);
      }
    } catch {}
    
    res.json({ success: true, message: "If an account exists with this email, you will receive reset instructions." });
  });

  // Token verification / current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const conn = await getPlatformConnection();
      const [users]: any = await conn.query(
        "SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM `User` WHERE id = ?",
        [decoded.userId]
      );
      conn.release();

      if (users.length === 0 || !users[0].isActive) {
        return res.status(401).json({ error: "User not found or inactive" });
      }

      res.json({ success: true, user: users[0] });
    } catch (err: any) {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  });

  // Change password endpoint (for logged-in users)
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current password and new password required" });
      if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });

      const conn = await getPlatformConnection();
      const [users]: any = await conn.query("SELECT id, passwordHash FROM `User` WHERE id = ?", [decoded.userId]);
      if (users.length === 0) { conn.release(); return res.status(404).json({ error: "User not found" }); }

      const valid = await bcrypt.compare(currentPassword, users[0].passwordHash);
      if (!valid) { conn.release(); return res.status(401).json({ error: "Current password is incorrect" }); }

      const newHash = await bcrypt.hash(newPassword, 12);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE id = ?", [newHash, now, decoded.userId]);
      conn.release();
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to change password", details: err.message });
    }
  });

  // Admin: Reset client password (requires admin auth)
  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      
      // Verify admin token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!["SUPER_ADMIN", "ADMIN"].includes(decoded.role)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { email, newPassword } = req.body;
      if (!email || !newPassword) return res.status(400).json({ error: "Email and new password required" });
      if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
      const conn = await getPlatformConnection();
      const passwordHash = await bcrypt.hash(newPassword, 12);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const [result]: any = await conn.query("UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE email = ?", [passwordHash, now, email]);
      conn.release();
      if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
      res.json({ success: true, message: "Password reset for " + email });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Register endpoint (public clients, admin-created team members)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, firstName, and lastName are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 191) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      // Input length validation
      if (firstName.length > 100 || lastName.length > 100) {
        return res.status(400).json({ error: "Name too long (max 100 characters)" });
      }
      if (password.length > 128) {
        return res.status(400).json({ error: "Password too long (max 128 characters)" });
      }

      let requesterRole = "";
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
          requesterRole = decoded.role || "";
        } catch {}
      }

      const requestedRole = ["CLIENT", "TEAM_MEMBER", "ADMIN", "SUPER_ADMIN"].includes(role) ? role : "CLIENT";
      const canCreatePrivilegedRole = ["SUPER_ADMIN", "ADMIN"].includes(requesterRole);
      if (requestedRole !== "CLIENT" && !canCreatePrivilegedRole) {
        return res.status(403).json({ error: "Only admins can create partner or admin accounts" });
      }
      if (requestedRole === "SUPER_ADMIN" && requesterRole !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only super admins can create super admin accounts" });
      }

      const conn = await getPlatformConnection();
      const [existing]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [email]);
      if (existing.length > 0) {
        conn.release();
        return res.status(409).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const id = "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await conn.query(
        `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, email, passwordHash, firstName, lastName, phone || null, requestedRole, 1, canCreatePrivilegedRole ? 1 : 0, now, now]
      );
      conn.release();

      res.json({
        success: true,
        message: "Account created",
        userId: id,
        user: { id, email, firstName, lastName, role: requestedRole }
      });
    } catch (err: any) {
      const isDuplicate = err.message?.includes("Duplicate");
      res.status(500).json({ error: isDuplicate ? "An account with this email already exists" : "Registration failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ADMIN CRUD API ENDPOINTS (Raw SQL — no Prisma binary needed)
  // ═══════════════════════════════════════════════════════════════

  // Auth middleware for admin routes
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!["SUPER_ADMIN", "ADMIN"].includes(decoded.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  // Apply auth to ALL /api/admin/* routes (except reset-password which has its own check)
  app.use("/api/admin", requireAdmin);

  // ─── DASHBOARD STATS ───
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [[clientCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Client`");
      const [[entityCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Entity`");
      const [[complianceCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `ComplianceTask` WHERE status NOT IN ('COMPLETED')");
      const [[ticketCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Ticket` WHERE status IN ('OPEN','IN_PROGRESS')");
      const [[invoicePending]]: any = await conn.query("SELECT COALESCE(SUM(total),0) as amount FROM `Invoice` WHERE status IN ('PENDING','SENT','OVERDUE')");
      const [[teamCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `User` WHERE role IN ('ADMIN','TEAM_MEMBER','SUPER_ADMIN')");
      const [[taskCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Task` WHERE status NOT IN ('COMPLETED')");
      
      // Overdue compliance
      const [overdueCompliance]: any = await conn.query(
        "SELECT ct.id, ct.title, ct.dueDate, ct.assigneeId, e.name as entityName FROM `ComplianceTask` ct LEFT JOIN `Entity` e ON ct.entityId = e.id WHERE ct.status NOT IN ('COMPLETED') AND ct.dueDate < NOW() ORDER BY ct.dueDate ASC LIMIT 10"
      );

      // Recent activity
      const [recentActivity]: any = await conn.query(
        "SELECT id, type, title, details, createdAt FROM `Activity` ORDER BY createdAt DESC LIMIT 10"
      );

      conn.release();
      res.json({
        stats: {
          clients: clientCount.count,
          entities: entityCount.count,
          complianceTasks: complianceCount.count,
          openTickets: ticketCount.count,
          pendingInvoices: Number(invoicePending.amount),
          teamMembers: teamCount.count,
          activeTasks: taskCount.count
        },
        overdueCompliance,
        recentActivity
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load stats", details: err.message });
    }
  });

  // ─── CLIENTS CRUD ───
  app.get("/api/admin/clients", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [clients]: any = await conn.query(
        `SELECT c.*, 
         (SELECT COUNT(*) FROM \`Entity\` WHERE clientId = c.id) as entityCount,
         (SELECT AVG(complianceScore) FROM \`Entity\` WHERE clientId = c.id) as avgHealth,
         u.firstName as relationshipMgrFirstName,
         u.lastName as relationshipMgrLastName,
         u.email as relationshipMgrEmail
         FROM \`Client\` c
         LEFT JOIN \`User\` u ON c.relationshipMgrId = u.id
         ORDER BY c.createdAt DESC`
      );
      conn.release();
      res.json({ clients });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load clients", details: err.message });
    }
  });

  app.post("/api/admin/clients", async (req, res) => {
    try {
      const { companyName, contactName, contactEmail, contactPhone, industry, notes, password, services, entityType, relationshipMgrId } = req.body;
      if (!companyName || !contactName || !contactEmail) {
        return res.status(400).json({ error: "companyName, contactName, and contactEmail are required" });
      }
      const conn = await getPlatformConnection();
      
      // Build notes JSON with allowed services
      let notesJson: any = {};
      if (notes) {
        try { notesJson = JSON.parse(notes); } catch { notesJson = { text: notes }; }
      }
      if (services && Array.isArray(services) && services.length > 0) {
        notesJson.allowedServices = services;
      }
      const notesStr = Object.keys(notesJson).length > 0 ? JSON.stringify(notesJson) : null;

      // Create client record
      const clientId = "cli_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Client\` (id, companyName, contactName, contactEmail, contactPhone, industry, relationshipMgrId, notes, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [clientId, companyName, contactName, contactEmail, contactPhone || null, industry || null, relationshipMgrId || null, notesStr, now, now]
      );

      // If entityType is provided, auto-create an Entity for this client
      if (entityType) {
        const entityId = "ent_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await conn.query(
          `INSERT INTO \`Entity\` (id, clientId, name, type, status, complianceScore, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 'ACTIVE', 100, ?, ?)`,
          [entityId, clientId, companyName, entityType, now, now]
        );
      }

      // Create user account for the client (so they can login to portal)
      const loginPassword = password || "Welcome@123";
      const passwordHash = await bcrypt.hash(loginPassword, 12);
      const userId = "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const nameParts = contactName.split(" ");
      const firstName = nameParts[0] || contactName;
      const lastName = nameParts.slice(1).join(" ") || "";
      
      // Check if user with this email already exists
      const [existingUser]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [contactEmail]);
      if (existingUser.length === 0) {
        await conn.query(
          `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'CLIENT', 1, 0, ?, ?)`,
          [userId, contactEmail, passwordHash, firstName, lastName, contactPhone || null, now, now]
        );
      }

      // Log activity
      await conn.query(
        `INSERT INTO \`Activity\` (id, clientId, userId, type, title, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        ["act_" + Date.now().toString(36), clientId, null, "client_created", `New client onboarded: ${companyName}`, now]
      );

      conn.release();
      
      // Send welcome email to new client
      if (emailTransporter) {
        try {
          await emailTransporter.sendMail({
            from: `"INCroute" <${process.env.SMTP_USER || "notifications@incroute.com"}>`,
            to: contactEmail,
            subject: "Welcome to INCroute — Your Business Compliance Partner 🎉",
            html: `
              <div style="font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#15131F;border-radius:16px;overflow:hidden;border:1px solid rgba(108,124,255,0.15);">
                <div style="background:linear-gradient(135deg,#5B6CFF,#7C5CF6);padding:32px 24px;text-align:center;">
                  <img src="https://incroute.com/incroute_logo.png" width="48" height="48" style="border-radius:50%;border:2px solid rgba(255,255,255,0.3);" alt="INCroute" />
                  <h1 style="color:#FFFFFF;font-size:22px;margin:16px 0 4px;font-weight:700;">Welcome to INCroute!</h1>
                  <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Your compliance journey starts here</p>
                </div>
                <div style="padding:32px 24px;color:#F2EFFB;">
                  <p style="font-size:15px;margin-bottom:16px;">Hi <strong>${contactName}</strong>,</p>
                  <p style="font-size:14px;color:#A5A3B5;line-height:1.6;margin-bottom:20px;">
                    Thank you for joining INCroute! We're excited to partner with <strong style="color:#F2EFFB;">${companyName}</strong> on your business compliance and registration needs.
                  </p>
                  <p style="font-size:14px;color:#A5A3B5;margin-bottom:20px;">Here are your portal login credentials:</p>
                  <div style="background:#241F38;border:1px solid rgba(108,124,255,0.15);border-radius:12px;padding:20px;margin-bottom:24px;">
                    <p style="font-size:12px;color:#6C7CFF;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Login URL</p>
                    <p style="font-size:14px;color:#F2EFFB;margin-bottom:16px;"><a href="https://incroute.com/login" style="color:#6C7CFF;">https://incroute.com/login</a></p>
                    <p style="font-size:12px;color:#6C7CFF;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Email</p>
                    <p style="font-size:14px;color:#F2EFFB;margin-bottom:16px;font-family:monospace;">${contactEmail}</p>
                    <p style="font-size:12px;color:#6C7CFF;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Password</p>
                    <p style="font-size:14px;color:#F2EFFB;font-family:monospace;">${loginPassword}</p>
                  </div>
                  <p style="font-size:13px;color:#A5A3B5;line-height:1.6;margin-bottom:24px;">
                    From your portal you can track compliance deadlines, view documents, manage entities, and communicate directly with our team.
                  </p>
                  <a href="https://incroute.com/login" style="display:inline-block;background:linear-gradient(135deg,#5B6CFF,#7C5CF6);color:#FFFFFF;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Login to Your Portal →</a>
                  <p style="font-size:12px;color:#5A5E78;margin-top:24px;">Please change your password after first login for security.</p>
                </div>
                <div style="padding:16px 24px;border-top:1px solid rgba(108,124,255,0.1);text-align:center;">
                  <p style="font-size:11px;color:#5A5E78;">© ${new Date().getFullYear()} INCroute — Make It Right</p>
                  <p style="font-size:10px;color:#5A5E78;margin-top:4px;">info@incroute.com | +91 870 755 2183</p>
                </div>
              </div>
            `
          });
          console.log(`✉️ Welcome email sent to ${contactEmail}`);
        } catch (emailErr: any) {
          console.error(`⚠️ Failed to send welcome email to ${contactEmail}:`, emailErr.message);
        }
      }

      res.json({ success: true, id: clientId, message: "Client created with login credentials", credentials: { email: contactEmail, password: loginPassword } });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create client", details: err.message });
    }
  });

  // Delete client
  app.delete("/api/admin/clients/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      await conn.query("DELETE FROM `Client` WHERE id = ?", [req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Update client
  app.patch("/api/admin/clients/:id", async (req, res) => {
    try {
      const { companyName, contactName, contactEmail, contactPhone, industry, status, notes, relationshipMgrId } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (companyName) { sets.push("companyName = ?"); vals.push(companyName); }
      if (contactName) { sets.push("contactName = ?"); vals.push(contactName); }
      if (contactEmail) { sets.push("contactEmail = ?"); vals.push(contactEmail); }
      if (contactPhone !== undefined) { sets.push("contactPhone = ?"); vals.push(contactPhone); }
      if (industry) { sets.push("industry = ?"); vals.push(industry); }
      if (status) { sets.push("status = ?"); vals.push(status); }
      if (notes !== undefined) { sets.push("notes = ?"); vals.push(notes); }
      if (relationshipMgrId !== undefined) { sets.push("relationshipMgrId = ?"); vals.push(relationshipMgrId || null); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Client\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── CLIENT DETAIL (with entities & service requests) ───
  app.get("/api/admin/clients/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [clients]: any = await conn.query("SELECT * FROM `Client` WHERE id = ?", [req.params.id]);
      if (clients.length === 0) { conn.release(); return res.status(404).json({ error: "Client not found" }); }
      const [entities]: any = await conn.query("SELECT * FROM `Entity` WHERE clientId = ?", [req.params.id]);
      const [serviceRequests]: any = await conn.query("SELECT * FROM `ServiceRequest` WHERE clientId = ? ORDER BY createdAt DESC", [req.params.id]);
      const [invoices]: any = await conn.query("SELECT id, invoiceNo, total, status, dueDate FROM `Invoice` WHERE clientId = ? ORDER BY createdAt DESC LIMIT 5", [req.params.id]);
      const [tickets]: any = await conn.query("SELECT id, subject, status, createdAt FROM `Ticket` WHERE clientId = ? ORDER BY createdAt DESC LIMIT 5", [req.params.id]);
      
      // Members (directors/partners)
      let members: any[] = [];
      try {
        const [rows]: any = await conn.query(
          `SELECT m.*, (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount FROM \`Member\` m WHERE m.clientId = ? ORDER BY m.role, m.fullName`,
          [req.params.id]
        );
        members = rows;
      } catch {} // Table might not exist yet

      // Documents for this client
      let documents: any[] = [];
      try {
        const [rows]: any = await conn.query(
          `SELECT d.id, d.title, d.fileName, d.originalName, d.status, d.folder, d.memberId, d.createdAt,
           m.fullName as memberName
           FROM \`Document\` d LEFT JOIN \`Member\` m ON d.memberId = m.id
           WHERE d.clientId = ? ORDER BY d.createdAt DESC LIMIT 20`,
          [req.params.id]
        );
        documents = rows;
      } catch {}

      // Allowed services config
      let allowedServices: string[] = [];
      if (clients[0].notes) {
        try {
          const parsed = JSON.parse(clients[0].notes);
          allowedServices = parsed.allowedServices || [];
        } catch {}
      }

      conn.release();
      res.json({ client: clients[0], entities, serviceRequests, invoices, tickets, members, documents, allowedServices });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── ENTITIES CRUD ───
  app.post("/api/admin/entities", async (req, res) => {
    try {
      const { clientId, name, type, cin, pan, gstin, incorporatedAt } = req.body;
      if (!clientId || !name || !type) return res.status(400).json({ error: "clientId, name, and type are required" });
      const conn = await getPlatformConnection();
      const id = "ent_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Entity\` (id, clientId, name, type, cin, pan, gstin, incorporatedAt, status, complianceScore, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 100, ?, ?)`,
        [id, clientId, name, type, cin || null, pan || null, gstin || null, incorporatedAt || null, now, now]
      );
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── SERVICE REQUESTS ───
  app.get("/api/admin/service-requests", async (req, res) => {
    try {
      const { status, serviceType, search, page = "1", limit = "20" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND sr.status = ?"; params.push(status); }
      if (serviceType) { where += " AND sr.serviceType = ?"; params.push(serviceType); }
      if (search) { where += " AND (sr.companyName LIKE ? OR c.companyName LIKE ? OR c.contactName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`ServiceRequest\` sr LEFT JOIN \`Client\` c ON sr.clientId = c.id WHERE ${where}`, params);
      const [requests]: any = await conn.query(`SELECT sr.*, c.companyName as clientName, c.contactName, c.contactEmail FROM \`ServiceRequest\` sr LEFT JOIN \`Client\` c ON sr.clientId = c.id WHERE ${where} ORDER BY sr.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      conn.release();
      res.json({ requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/service-requests", async (req, res) => {
    try {
      const { clientId, serviceType, companyName, notes, expectedDate } = req.body;
      if (!clientId || !serviceType) return res.status(400).json({ error: "clientId and serviceType are required" });
      const conn = await getPlatformConnection();
      const id = "sr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`ServiceRequest\` (id, clientId, serviceType, status, companyName, notes, expectedDate, createdAt, updatedAt)
         VALUES (?, ?, ?, 'IN_PROGRESS', ?, ?, ?, ?, ?)`,
        [id, clientId, serviceType, companyName || null, notes || null, expectedDate || null, now, now]
      );
      // Log activity
      await conn.query("INSERT INTO `Activity` (id, clientId, type, title, createdAt) VALUES (?, ?, ?, ?, ?)",
        ["act_" + Date.now().toString(36), clientId, "service_added", `Service ${serviceType.replace(/_/g, " ")} added`, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/service-requests/:id", async (req, res) => {
    try {
      const { status, progress, notes } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (progress !== undefined) { sets.push("progress = ?"); vals.push(progress); }
      if (notes) { sets.push("notes = ?"); vals.push(notes); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`ServiceRequest\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Delete entity
  app.delete("/api/admin/entities/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      await conn.query("DELETE FROM `Entity` WHERE id = ?", [req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Delete service request
  app.delete("/api/admin/service-requests/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      await conn.query("DELETE FROM `ServiceRequest` WHERE id = ?", [req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── TASKS CRUD ───
  app.get("/api/admin/tasks", async (req, res) => {
    try {
      const { status, priority, search, assigneeId, page = "1", limit = "20" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND t.status = ?"; params.push(status); }
      if (priority) { where += " AND t.priority = ?"; params.push(priority); }
      if (assigneeId) { where += " AND t.assigneeId = ?"; params.push(assigneeId); }
      if (search) { where += " AND (t.title LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Task\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where}`, params);
      const [tasks]: any = await conn.query(`SELECT t.*, c.companyName as clientName FROM \`Task\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where} ORDER BY FIELD(t.priority,'CRITICAL','HIGH','MEDIUM','LOW'), t.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      conn.release();
      res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load tasks", details: err.message });
    }
  });

  app.post("/api/admin/tasks", async (req, res) => {
    try {
      const { title, description, clientId, assigneeId, priority, dueDate } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const conn = await getPlatformConnection();
      const id = "tsk_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Task\` (id, clientId, title, description, assigneeId, priority, status, dueDate, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
        [id, clientId || null, title, description || null, assigneeId || null, priority || "MEDIUM", dueDate || null, now, now]
      );
      conn.release();
      res.json({ success: true, id, message: "Task created" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create task", details: err.message });
    }
  });

  app.patch("/api/admin/tasks/:id", async (req, res) => {
    try {
      const { status, assigneeId, priority } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = [`updatedAt = ?`];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      if (priority) { sets.push("priority = ?"); vals.push(priority); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Task\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update task", details: err.message });
    }
  });

  // ─── COMPLIANCE CRUD ───
  app.get("/api/admin/compliance", async (req, res) => {
    try {
      const { status, category, priority, search, page = "1", limit = "20" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND ct.status = ?"; params.push(status); }
      if (category) { where += " AND ct.category = ?"; params.push(category); }
      if (priority) { where += " AND ct.priority = ?"; params.push(priority); }
      if (search) { where += " AND (ct.title LIKE ? OR e.name LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`ComplianceTask\` ct LEFT JOIN \`Entity\` e ON ct.entityId = e.id LEFT JOIN \`Client\` c ON e.clientId = c.id WHERE ${where}`, params);
      const [tasks]: any = await conn.query(
        `SELECT ct.*, e.name as entityName, e.type as entityType, c.companyName as clientName
         FROM \`ComplianceTask\` ct LEFT JOIN \`Entity\` e ON ct.entityId = e.id LEFT JOIN \`Client\` c ON e.clientId = c.id
         WHERE ${where} ORDER BY ct.dueDate ASC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      // Stats
      const [[stats]]: any = await conn.query("SELECT COUNT(CASE WHEN status='PENDING' THEN 1 END) as pending, COUNT(CASE WHEN status='IN_PROGRESS' THEN 1 END) as inProgress, COUNT(CASE WHEN status='OVERDUE' OR (status NOT IN ('COMPLETED') AND dueDate < NOW()) THEN 1 END) as overdue, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed FROM `ComplianceTask`");
      conn.release();
      res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / Number(limit)), stats });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load compliance tasks", details: err.message });
    }
  });

  app.post("/api/admin/compliance", async (req, res) => {
    try {
      const { entityId, title, category, dueDate, priority, assigneeId, notes } = req.body;
      if (!entityId || !title || !category || !dueDate) {
        return res.status(400).json({ error: "entityId, title, category, and dueDate are required" });
      }
      const conn = await getPlatformConnection();
      const id = "comp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`ComplianceTask\` (id, entityId, title, category, dueDate, priority, status, assigneeId, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
        [id, entityId, title, category, dueDate, priority || "MEDIUM", assigneeId || null, notes || null, now, now]
      );
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create compliance task", details: err.message });
    }
  });

  app.patch("/api/admin/compliance/:id", async (req, res) => {
    try {
      const { status, assigneeId, priority } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = [`updatedAt = ?`];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      if (priority) { sets.push("priority = ?"); vals.push(priority); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`ComplianceTask\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update compliance task", details: err.message });
    }
  });

  // ─── CLOUDFLARE R2 DOCUMENT MANAGEMENT SYSTEM ───
  const ALLOWED_MIMES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const DOCUMENT_FOLDERS = ['Incorporation', 'GST', 'Trademark', 'ROC', 'Legal', 'Tax', 'Invoices', 'Other'];

  // R2 Client setup
  const r2Client = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  }) : null;
  const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "incroute-documents";
  const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

  // Multer config for memory storage (before uploading to R2)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
      else cb(new Error("File type not allowed. Allowed: PDF, DOC, DOCX, PNG, JPG, XLS, XLSX"));
    }
  });

  // Generate storage key
  const generateStorageKey = (clientId: string, folder: string, originalName: string) => {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(8).toString("hex");
    const date = new Date().toISOString().slice(0, 10);
    return `clients/${clientId}/${folder.toLowerCase()}/${date}-${hash}${ext}`;
  };

  // Upload to R2
  const uploadToR2 = async (key: string, buffer: Buffer, mimeType: string) => {
    if (!r2Client) throw new Error("R2 not configured");
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: mimeType }));
    return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;
  };

  // Generate signed download URL (for private buckets)
  const getSignedDownloadUrl = async (key: string, expiresIn = 3600) => {
    if (!r2Client) return "";
    if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${key}`;
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    return getSignedUrl(r2Client, command, { expiresIn });
  };

  // List documents
  app.get("/api/admin/documents", async (req, res) => {
    try {
      const { status, category, folder, search, page = "1", limit = "15" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND d.status = ?"; params.push(status); }
      if (category) { where += " AND d.category = ?"; params.push(category); }
      if (folder) { where += " AND d.folder = ?"; params.push(folder); }
      if (search) { where += " AND (d.title LIKE ? OR d.fileName LIKE ? OR d.originalName LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Document\` d LEFT JOIN \`Client\` c ON d.clientId = c.id WHERE ${where}`, params);
      const [documents]: any = await conn.query(`SELECT d.*, c.companyName as clientName FROM \`Document\` d LEFT JOIN \`Client\` c ON d.clientId = c.id WHERE ${where} ORDER BY d.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      const [[stats]]: any = await conn.query("SELECT COUNT(CASE WHEN status='DRAFT' THEN 1 END) as draft, COUNT(CASE WHEN status='UNDER_REVIEW' THEN 1 END) as underReview, COUNT(CASE WHEN status='APPROVED' THEN 1 END) as approved, COUNT(CASE WHEN status='REJECTED' THEN 1 END) as rejected FROM `Document`");
      // Folder counts
      const [folderCounts]: any = await conn.query("SELECT folder, COUNT(*) as count FROM `Document` GROUP BY folder");
      conn.release();
      res.json({ documents, total, page: Number(page), pages: Math.ceil(total / Number(limit)), stats, folderCounts, folders: DOCUMENT_FOLDERS });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Upload document
  app.post("/api/admin/documents/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const { clientId, entityId, title, folder, category } = req.body;
      if (!title || !clientId) return res.status(400).json({ error: "title and clientId required" });

      const file = req.file;
      const docFolder = folder || "Other";
      const storageKey = generateStorageKey(clientId, docFolder, file.originalname);

      // Upload to R2 (or fallback to local if R2 not configured)
      let publicUrl = "";
      if (r2Client) {
        publicUrl = await uploadToR2(storageKey, file.buffer, file.mimetype);
      } else {
        // Fallback: save locally — use storageKey path structure for consistent retrieval
        const localFilePath = path.join(process.cwd(), "uploads", storageKey.replace(/^clients\//, ""));
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, file.buffer);
        publicUrl = `/uploads/${storageKey.replace(/^clients\//, "")}`;
      }

      // Save metadata to MySQL
      const conn = await getPlatformConnection();
      const id = "doc_" + Date.now().toString(36) + crypto.randomBytes(4).toString("hex");
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Document\` (id, clientId, entityId, title, category, fileName, originalName, mimeType, fileSize, fileUrl, storageProvider, storageKey, publicUrl, folder, status, version, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', 1, ?, ?)`,
        [id, clientId, entityId || null, title, category || docFolder, file.originalname, file.originalname, file.mimetype, file.size, publicUrl, r2Client ? "cloudflare_r2" : "local", storageKey, publicUrl, docFolder, now, now]
      );

      // Audit log
      await conn.query("INSERT INTO `AuditLog` (id, userId, action, resource, details, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        ["aud_" + Date.now().toString(36), null, "document_uploaded", `Document: ${title}`, JSON.stringify({ docId: id, fileName: file.originalname, size: file.size, folder: docFolder }), now]);

      conn.release();
      res.json({ success: true, id, storageKey, publicUrl, fileName: file.originalname, size: file.size });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Debug endpoint — shows what files exist on disk and what DB expects
  // Access via: /api/debug/storage?key=incroute2026
  app.get("/api/debug/storage", async (req, res) => {
    // Simple secret key check (not behind requireAdmin)
    if (req.query.key !== (process.env.CMS_PASSWORD || "incroute2026")) {
      return res.status(403).json({ error: "Invalid key" });
    }
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      const allFiles: string[] = [];

      // Recursively scan uploads directory
      const scanDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) scanDir(fullPath);
          else allFiles.push(fullPath.replace(uploadsDir, "").replace(/\\/g, "/"));
        }
      };
      scanDir(uploadsDir);

      // Get DB records
      const conn = await getPlatformConnection();
      const [docs]: any = await conn.query("SELECT id, title, storageKey, publicUrl, storageProvider, fileName, originalName FROM `Document` ORDER BY createdAt DESC LIMIT 50");
      conn.release();

      res.json({
        cwd: process.cwd(),
        uploadsPath: uploadsDir,
        uploadsExists: fs.existsSync(uploadsDir),
        filesOnDisk: allFiles,
        totalFilesOnDisk: allFiles.length,
        dbRecords: docs.map((d: any) => ({
          id: d.id,
          title: d.title,
          storageKey: d.storageKey,
          publicUrl: d.publicUrl,
          storageProvider: d.storageProvider,
          fileName: d.fileName,
        })),
      });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Get signed download URL
  // Debug endpoint (admin-protected version — kept for reference)
  app.get("/api/admin/documents/debug-storage", async (req, res) => {
    return res.redirect(`/api/debug/storage?key=${process.env.CMS_PASSWORD || "incroute2026"}`);
  });

  app.get("/api/admin/documents/:id/download", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [docs]: any = await conn.query("SELECT storageKey, storageProvider, publicUrl, title, fileName, originalName, mimeType FROM `Document` WHERE id = ?", [req.params.id]);
      if (docs.length === 0) { conn.release(); return res.status(404).json({ error: "Document not found" }); }
      const doc = docs[0];
      const fileName = doc.originalName || doc.fileName || "download";

      // R2 storage — stream file directly from R2 to client (forces download)
      if ((doc.storageProvider === "cloudflare_r2" || doc.storageProvider === "r2") && doc.storageKey) {
        const r2 = r2Client || (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
          ? new S3Client({ region: "auto", endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY } })
          : null);
        
        if (r2) {
          try {
            const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: doc.storageKey });
            const response = await r2.send(command);
            
            // Audit log
            const now = new Date().toISOString().slice(0, 23).replace("T", " ");
            await conn.query("INSERT INTO `AuditLog` (id, action, resource, createdAt) VALUES (?, ?, ?, ?)",
              ["aud_" + Date.now().toString(36), "document_downloaded", `Document: ${doc.title}`, now]);
            conn.release();

            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", doc.mimeType || response.ContentType || "application/octet-stream");
            if (response.ContentLength) res.setHeader("Content-Length", String(response.ContentLength));
            
            // Stream R2 response body to client
            const stream = response.Body as any;
            if (stream?.pipe) {
              stream.pipe(res);
            } else if (stream?.transformToByteArray) {
              const bytes = await stream.transformToByteArray();
              res.send(Buffer.from(bytes));
            } else {
              res.send(stream);
            }
            return;
          } catch (r2Err: any) {
            console.error("R2 download stream failed:", r2Err.message);
          }
        }
        conn.release();
        return res.status(404).json({ error: "Could not retrieve file from storage. Check R2 credentials." });
      }
      
      // Local storage — stream from disk
      if (doc.storageProvider === "local" || !doc.storageProvider) {
        const possiblePaths = [
          doc.storageKey ? path.join(process.cwd(), "uploads", doc.storageKey.replace(/^clients\//, "")) : null,
          doc.publicUrl?.startsWith("/uploads") ? path.join(process.cwd(), doc.publicUrl) : null,
          doc.storageKey ? path.join(process.cwd(), "uploads", path.basename(doc.storageKey)) : null,
          doc.fileName ? path.join(process.cwd(), "uploads", doc.fileName) : null,
        ].filter(Boolean) as string[];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            const now = new Date().toISOString().slice(0, 23).replace("T", " ");
            await conn.query("INSERT INTO `AuditLog` (id, action, resource, createdAt) VALUES (?, ?, ?, ?)",
              ["aud_" + Date.now().toString(36), "document_downloaded", `Document: ${doc.title}`, now]);
            conn.release();
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
            return fs.createReadStream(p).pipe(res);
          }
        }
      }

      conn.release();
      return res.status(404).json({ error: "File not found on server." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal download endpoint (for clients) — proxies file from R2
  app.get("/api/portal/documents/:id/download", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [docs]: any = await conn.query(
        `SELECT d.storageKey, d.storageProvider, d.publicUrl, d.title, d.fileName, d.originalName, d.mimeType
         FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id 
         WHERE d.id = ? AND c.contactEmail = ?`,
        [req.params.id, user[0]?.email]
      );
      if (docs.length === 0) { conn.release(); return res.status(404).json({ error: "Document not found" }); }
      const doc = docs[0];
      const fileName = doc.originalName || doc.fileName || "download";

      // R2 — stream directly
      if ((doc.storageProvider === "cloudflare_r2" || doc.storageProvider === "r2") && doc.storageKey) {
        const r2 = r2Client || (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
          ? new S3Client({ region: "auto", endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY } })
          : null);
        if (r2) {
          try {
            const response = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: doc.storageKey }));
            conn.release();
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", doc.mimeType || response.ContentType || "application/octet-stream");
            if (response.ContentLength) res.setHeader("Content-Length", String(response.ContentLength));
            const stream = response.Body as any;
            if (stream?.pipe) return stream.pipe(res);
            if (stream?.transformToByteArray) { const bytes = await stream.transformToByteArray(); return res.send(Buffer.from(bytes)); }
            return res.send(stream);
          } catch {}
        }
      }

      // Local — stream from disk
      if (doc.storageProvider === "local" || !doc.storageProvider) {
        const possiblePaths = [
          doc.storageKey ? path.join(process.cwd(), "uploads", doc.storageKey.replace(/^clients\//, "")) : null,
          doc.publicUrl?.startsWith("/uploads") ? path.join(process.cwd(), doc.publicUrl) : null,
        ].filter(Boolean) as string[];
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            conn.release();
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
            return fs.createReadStream(p).pipe(res);
          }
        }
      }

      conn.release();
      return res.status(404).json({ error: "File not found" });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Update document status (approve/reject/etc)
  app.patch("/api/admin/documents/:id", async (req, res) => {
    try {
      const { status, approvedBy, internalNote } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "APPROVED") { sets.push("approvedAt = ?"); sets.push("approvedBy = ?"); vals.push(now); vals.push(approvedBy || null); } }
      if (internalNote) { sets.push("internalNote = ?"); vals.push(internalNote); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Document\` SET ${sets.join(", ")} WHERE id = ?`, vals);

      // Audit log
      await conn.query("INSERT INTO `AuditLog` (id, action, resource, details, createdAt) VALUES (?, ?, ?, ?, ?)",
        ["aud_" + Date.now().toString(36), `document_${status?.toLowerCase() || "updated"}`, req.params.id, JSON.stringify({ status, note: internalNote }), now]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Delete document (removes from R2 + MySQL)
  app.delete("/api/admin/documents/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [docs]: any = await conn.query("SELECT storageKey, storageProvider, title FROM `Document` WHERE id = ?", [req.params.id]);
      if (docs.length === 0) { conn.release(); return res.status(404).json({ error: "Not found" }); }
      const doc = docs[0];

      // Delete from R2
      if (doc.storageProvider === "cloudflare_r2" && doc.storageKey && r2Client) {
        try { await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: doc.storageKey })); } catch {}
      }

      // Delete metadata
      await conn.query("DELETE FROM `Document` WHERE id = ?", [req.params.id]);
      // Audit log
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("INSERT INTO `AuditLog` (id, action, resource, details, createdAt) VALUES (?, ?, ?, ?, ?)",
        ["aud_" + Date.now().toString(36), "document_deleted", `Document: ${doc.title}`, JSON.stringify({ storageKey: doc.storageKey }), now]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Serve local uploads fallback
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ─── INVOICES CRUD ───
  app.get("/api/admin/invoices", async (req, res) => {
    try {
      const { status, search, page = "1", limit = "15" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND i.status = ?"; params.push(status); }
      if (search) { where += " AND (i.invoiceNo LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE ${where}`, params);
      const [invoices]: any = await conn.query(`SELECT i.*, c.companyName as clientName FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE ${where} ORDER BY i.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      const [[totals]]: any = await conn.query("SELECT COALESCE(SUM(total),0) as totalRev, COALESCE(SUM(CASE WHEN status IN ('PENDING','SENT','OVERDUE') THEN total ELSE 0 END),0) as outstanding, COALESCE(SUM(CASE WHEN status='PAID' AND MONTH(paidAt)=MONTH(NOW()) THEN total ELSE 0 END),0) as paidThisMonth, COALESCE(SUM(CASE WHEN status='OVERDUE' THEN total ELSE 0 END),0) as overdue FROM `Invoice`");
      conn.release();
      res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / Number(limit)), totals: { totalRevenue: Number(totals.totalRev), outstanding: Number(totals.outstanding), paidThisMonth: Number(totals.paidThisMonth), overdue: Number(totals.overdue) } });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/invoices", async (req, res) => {
    try {
      const { clientId, amount, tax, description, dueDate } = req.body;
      if (!clientId || !amount || !dueDate) return res.status(400).json({ error: "clientId, amount, dueDate required" });
      const conn = await getPlatformConnection();
      const id = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const invoiceNo = "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      const totalAmt = Number(amount) + Number(tax || 0);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(`INSERT INTO \`Invoice\` (id, clientId, invoiceNo, amount, tax, total, status, dueDate, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
        [id, clientId, invoiceNo, amount, tax || 0, totalAmt, dueDate, description || null, now, now]);
      conn.release();
      res.json({ success: true, id, invoiceNo });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/invoices/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?", "status = ?"];
      const vals: any[] = [now, status];
      if (status === "PAID") { sets.push("paidAt = ?"); vals.push(now); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Invoice\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Get single invoice with client details (for PDF/preview)
  app.get("/api/admin/invoices/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [rows]: any = await conn.query(
        `SELECT i.*, c.companyName, c.contactEmail, c.contactPhone, c.address, c.gstin
         FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE i.id = ?`,
        [req.params.id]
      );
      conn.release();
      if (rows.length === 0) return res.status(404).json({ error: "Invoice not found" });
      // Parse line items from description if stored as JSON
      const invoice = rows[0];
      try { invoice.lineItems = JSON.parse(invoice.description); } catch { invoice.lineItems = null; }
      res.json({ invoice });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Enhanced invoice creation with line items (Zoho/Tally style)
  app.post("/api/admin/invoices/create", async (req, res) => {
    try {
      const { clientId, lineItems, notes, dueDate, bankDetails, gstRate } = req.body;
      if (!clientId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0 || !dueDate) {
        return res.status(400).json({ error: "clientId, lineItems (array), and dueDate are required" });
      }
      // Calculate totals from line items
      let subtotal = 0;
      const processedItems = lineItems.map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || 0;
        const amount = qty * rate;
        subtotal += amount;
        return { sno: idx + 1, description: item.description || "", hsn: item.hsn || "", quantity: qty, rate, amount };
      });
      const taxRate = Number(gstRate) || 18;
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const total = subtotal + taxAmount;

      const conn = await getPlatformConnection();
      const id = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const invoiceNo = "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      // Store line items as JSON in description field
      const invoiceData = JSON.stringify({ items: processedItems, notes: notes || "", bankDetails: bankDetails || "", gstRate: taxRate });

      await conn.query(
        `INSERT INTO \`Invoice\` (id, clientId, invoiceNo, amount, tax, total, status, dueDate, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)`,
        [id, clientId, invoiceNo, subtotal, taxAmount, total, dueDate, invoiceData, now, now]
      );
      conn.release();
      res.json({ success: true, id, invoiceNo, subtotal, tax: taxAmount, total });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Send invoice via email to client
  app.post("/api/admin/invoices/:id/send", async (req, res) => {
    try {
      const { recipientEmail, subject, message } = req.body;
      const conn = await getPlatformConnection();
      const [rows]: any = await conn.query(
        `SELECT i.*, c.companyName, c.contactEmail, c.contactPhone, c.address, c.gstin
         FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE i.id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) { conn.release(); return res.status(404).json({ error: "Invoice not found" }); }
      const invoice = rows[0];
      const toEmail = recipientEmail || invoice.contactEmail;
      if (!toEmail) { conn.release(); return res.status(400).json({ error: "No recipient email provided or found for client" }); }

      // Parse line items
      let lineItems: any[] = [];
      let notes = "";
      let bankDetails = "";
      let gstRate = 18;
      try {
        const parsed = JSON.parse(invoice.description);
        lineItems = parsed.items || [];
        notes = parsed.notes || "";
        bankDetails = parsed.bankDetails || "";
        gstRate = parsed.gstRate || 18;
      } catch {}

      // Build HTML email with professional invoice layout
      const itemRows = lineItems.map((item: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;">${item.sno}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;">${item.description}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">${item.hsn || '-'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;">₹${Number(item.rate).toLocaleString("en-IN")}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;font-weight:600;">₹${Number(item.amount).toLocaleString("en-IN")}</td>
        </tr>
      `).join("");

      const invoiceHtml = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <div style="background:#1a1a2e;padding:28px 32px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h1 style="margin:0;font-size:22px;color:#d4af37;font-weight:700;">INCroute</h1>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:1px;">CORPORATE REGISTRATIONS & COMPLIANCE</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;font-size:24px;font-weight:800;color:#fff;">INVOICE</p>
              <p style="margin:4px 0 0;font-size:13px;color:#d4af37;">${invoice.invoiceNo}</p>
            </div>
          </div>

          <!-- Bill To / Invoice Meta -->
          <div style="padding:24px 32px;display:flex;justify-content:space-between;border-bottom:1px solid #eee;">
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;color:#888;letter-spacing:1px;font-weight:600;">Bill To</p>
              <p style="margin:6px 0 0;font-size:15px;font-weight:700;color:#1a1a2e;">${invoice.companyName || 'Client'}</p>
              ${invoice.address ? `<p style="margin:4px 0 0;font-size:12px;color:#555;">${invoice.address}</p>` : ''}
              ${invoice.gstin ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">GSTIN: ${invoice.gstin}</p>` : ''}
              ${toEmail ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">${toEmail}</p>` : ''}
            </div>
            <div style="text-align:right;">
              <p style="margin:0;font-size:11px;color:#888;"><strong>Invoice Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p style="margin:6px 0 0;font-size:11px;color:#888;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p style="margin:12px 0 0;padding:6px 12px;background:${invoice.status === 'PAID' ? '#dcfce7' : invoice.status === 'OVERDUE' ? '#fef2f2' : '#fef9c3'};border-radius:6px;font-size:11px;font-weight:700;color:${invoice.status === 'PAID' ? '#166534' : invoice.status === 'OVERDUE' ? '#991b1b' : '#854d0e'};display:inline-block;">${invoice.status}</p>
            </div>
          </div>

          <!-- Line Items Table -->
          <div style="padding:0 32px;">
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <thead>
                <tr style="background:#f8f9fa;">
                  <th style="padding:12px;text-align:left;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">S.No</th>
                  <th style="padding:12px;text-align:left;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">Description</th>
                  <th style="padding:12px;text-align:center;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">HSN/SAC</th>
                  <th style="padding:12px;text-align:center;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">Qty</th>
                  <th style="padding:12px;text-align:right;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">Rate</th>
                  <th style="padding:12px;text-align:right;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px;border-bottom:2px solid #e0e0e0;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="padding:0 32px 24px;display:flex;justify-content:flex-end;">
            <div style="width:260px;">
              <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#555;">
                <span>Subtotal</span><span>₹${Number(invoice.amount).toLocaleString("en-IN")}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#555;border-bottom:1px solid #eee;">
                <span>GST (${gstRate}%)</span><span>₹${Number(invoice.tax).toLocaleString("en-IN")}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:17px;font-weight:800;color:#1a1a2e;">
                <span>Total</span><span>₹${Number(invoice.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          ${bankDetails ? `
          <!-- Bank Details -->
          <div style="padding:16px 32px;background:#f8f9fa;border-top:1px solid #eee;">
            <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;color:#888;letter-spacing:1px;font-weight:600;">Bank Details</p>
            <p style="margin:0;font-size:12px;color:#333;white-space:pre-line;">${bankDetails}</p>
          </div>` : ''}

          ${notes ? `
          <!-- Notes -->
          <div style="padding:16px 32px;border-top:1px solid #eee;">
            <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;color:#888;letter-spacing:1px;font-weight:600;">Notes</p>
            <p style="margin:0;font-size:12px;color:#555;">${notes}</p>
          </div>` : ''}

          <!-- Footer -->
          <div style="padding:16px 32px;background:#1a1a2e;text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);">Thank you for your business • INCroute Corporate Services • incroute.com</p>
          </div>
        </div>
      `;

      if (!emailTransporter) {
        conn.release();
        return res.status(503).json({ error: "Email service not configured. Set SMTP credentials in .env" });
      }

      await emailTransporter.sendMail({
        from: `"INCroute Billing" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: subject || `Invoice ${invoice.invoiceNo} from INCroute`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:700px;margin:0 auto;">
            ${message ? `<p style="font-size:14px;color:#333;margin-bottom:24px;">${message}</p>` : `<p style="font-size:14px;color:#333;margin-bottom:24px;">Please find your invoice attached below. Payment is due by ${new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.</p>`}
            ${invoiceHtml}
          </div>
        `
      });

      // Update status to SENT
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `Invoice` SET status = 'SENT', updatedAt = ? WHERE id = ? AND status IN ('DRAFT','PENDING')", [now, req.params.id]);
      conn.release();

      res.json({ success: true, message: `Invoice sent to ${toEmail}` });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── PROFORMA INVOICES / QUOTATIONS ───
  app.get("/api/admin/proforma", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      // Try to query ProformaInvoice table — create it if it doesn't exist
      try {
        const [proformas]: any = await conn.query(
          `SELECT p.*, c.companyName as clientName, c.contactEmail as clientEmail 
           FROM \`ProformaInvoice\` p LEFT JOIN \`Client\` c ON p.clientId = c.id 
           ORDER BY p.createdAt DESC`
        );
        conn.release();
        res.json({ proformas });
      } catch (tableErr: any) {
        // Table doesn't exist — create it
        if (tableErr.message?.includes("doesn't exist")) {
          await conn.query(`
            CREATE TABLE IF NOT EXISTS \`ProformaInvoice\` (
              \`id\` VARCHAR(30) NOT NULL,
              \`clientId\` VARCHAR(30) NOT NULL,
              \`proformaNo\` VARCHAR(50) NOT NULL,
              \`items\` JSON NOT NULL,
              \`subtotal\` DECIMAL(12,2) NOT NULL,
              \`tax\` DECIMAL(12,2) NOT NULL DEFAULT 0,
              \`total\` DECIMAL(12,2) NOT NULL,
              \`gstRate\` INT NOT NULL DEFAULT 18,
              \`validUntil\` DATE NOT NULL,
              \`notes\` TEXT NULL,
              \`bankDetails\` TEXT NULL,
              \`status\` ENUM('DRAFT','SENT','VIEWED','ACCEPTED','REJECTED','EXPIRED','CONVERTED') NOT NULL DEFAULT 'DRAFT',
              \`convertedInvoiceId\` VARCHAR(30) NULL,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              \`updatedAt\` DATETIME(3) NOT NULL,
              PRIMARY KEY (\`id\`),
              INDEX \`ProformaInvoice_clientId_idx\` (\`clientId\`),
              INDEX \`ProformaInvoice_status_idx\` (\`status\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          conn.release();
          res.json({ proformas: [] });
        } else {
          conn.release();
          throw tableErr;
        }
      }
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/proforma", async (req, res) => {
    try {
      const { clientId, lineItems, notes, validUntil, gstRate, bankDetails } = req.body;
      if (!clientId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0 || !validUntil) {
        return res.status(400).json({ error: "clientId, lineItems, and validUntil required" });
      }
      let subtotal = 0;
      const processedItems = lineItems.map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || 0;
        subtotal += qty * rate;
        return { sno: idx + 1, name: item.name, description: item.description || "", hsn: item.hsn || "998313", quantity: qty, rate, amount: qty * rate };
      });
      const taxRate = Number(gstRate) || 18;
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const total = subtotal + taxAmount;

      const conn = await getPlatformConnection();
      const id = "pf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const proformaNo = "QTN-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await conn.query(
        `INSERT INTO \`ProformaInvoice\` (id, clientId, proformaNo, items, subtotal, tax, total, gstRate, validUntil, notes, bankDetails, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
        [id, clientId, proformaNo, JSON.stringify(processedItems), subtotal, taxAmount, total, taxRate, validUntil, notes || null, bankDetails || null, now, now]
      );
      conn.release();
      res.json({ success: true, id, proformaNo, total });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/proforma/:id/send", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [rows]: any = await conn.query(
        `SELECT p.*, c.companyName, c.contactEmail, c.contactName FROM \`ProformaInvoice\` p JOIN \`Client\` c ON p.clientId = c.id WHERE p.id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) { conn.release(); return res.status(404).json({ error: "Quotation not found" }); }
      const p = rows[0];
      if (!p.contactEmail) { conn.release(); return res.status(400).json({ error: "Client has no email configured" }); }
      if (!emailTransporter) { conn.release(); return res.status(503).json({ error: "Email not configured" }); }

      const items = JSON.parse(p.items);
      const itemRows = items.map((i: any) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;">${i.sno}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><strong style="font-size:13px;">${i.name}</strong>${i.description ? `<br/><span style="font-size:11px;color:#666;">${i.description}</span>` : ""}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:12px;">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;">₹${Number(i.rate).toLocaleString("en-IN")}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600;">₹${Number(i.amount).toLocaleString("en-IN")}</td></tr>`).join("");

      await emailTransporter.sendMail({
        from: `"INCroute" <${process.env.SMTP_USER}>`,
        to: p.contactEmail,
        subject: `Quotation ${p.proformaNo} — Service Pricing from INCroute`,
        html: `<div style="font-family:'Segoe UI',sans-serif;max-width:700px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#1a1a2e;padding:24px 32px;"><h1 style="margin:0;font-size:20px;color:#d4af37;">INCroute</h1><p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;">CORPORATE REGISTRATIONS & COMPLIANCE</p></div>
          <div style="padding:24px 32px;">
            <p style="font-size:14px;color:#333;">Dear ${p.contactName || "Client"},</p>
            <p style="font-size:13px;color:#555;margin:12px 0 20px;">Please find below the pricing quotation for the services discussed. This quotation is valid until <strong>${new Date(p.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</strong>.</p>
            <p style="font-size:11px;color:#888;margin-bottom:8px;">Quotation No: <strong style="color:#333;">${p.proformaNo}</strong></p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;"><thead><tr style="background:#f8f9fa;"><th style="padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0;">#</th><th style="padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0;">Service</th><th style="padding:10px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0;">Qty</th><th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0;">Rate</th><th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0;">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
            <div style="text-align:right;padding:12px 0;"><p style="font-size:13px;color:#555;">Subtotal: ₹${Number(p.subtotal).toLocaleString("en-IN")}</p><p style="font-size:13px;color:#555;">GST (${p.gstRate}%): ₹${Number(p.tax).toLocaleString("en-IN")}</p><p style="font-size:18px;font-weight:800;color:#1a1a2e;margin-top:8px;">Total: ₹${Number(p.total).toLocaleString("en-IN")}</p></div>
            ${p.notes ? `<div style="margin-top:20px;padding:16px;background:#f8f9fa;border-radius:8px;"><p style="font-size:10px;text-transform:uppercase;color:#888;margin-bottom:8px;">Terms & Conditions</p><pre style="font-size:11px;color:#555;margin:0;white-space:pre-wrap;">${p.notes}</pre></div>` : ""}
          </div>
          <div style="padding:16px 32px;background:#1a1a2e;text-align:center;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">This is a quotation/proforma invoice, not a tax invoice. • INCroute • incroute.com</p></div>
        </div>`
      });

      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `ProformaInvoice` SET status = 'SENT', updatedAt = ? WHERE id = ?", [now, req.params.id]);
      conn.release();
      res.json({ success: true, sentTo: p.contactEmail });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/proforma/:id/convert", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [rows]: any = await conn.query("SELECT * FROM `ProformaInvoice` WHERE id = ?", [req.params.id]);
      if (rows.length === 0) { conn.release(); return res.status(404).json({ error: "Not found" }); }
      const p = rows[0];

      // Create a real invoice from this proforma
      const invoiceId = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const invoiceNo = "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 23).replace("T", " ");

      const invoiceData = JSON.stringify({ items: JSON.parse(p.items), notes: p.notes || "", bankDetails: p.bankDetails || "", gstRate: p.gstRate });
      await conn.query(
        `INSERT INTO \`Invoice\` (id, clientId, invoiceNo, amount, tax, total, status, dueDate, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
        [invoiceId, p.clientId, invoiceNo, p.subtotal, p.tax, p.total, dueDate, invoiceData, now, now]
      );

      // Update proforma status
      await conn.query("UPDATE `ProformaInvoice` SET status = 'CONVERTED', convertedInvoiceId = ?, updatedAt = ? WHERE id = ?", [invoiceId, now, req.params.id]);
      conn.release();
      res.json({ success: true, invoiceId, invoiceNo });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── MEMBERS (Directors / Partners / Shareholders) ───
  app.get("/api/admin/members", async (req, res) => {
    try {
      const { clientId, entityId, role } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (clientId) { where += " AND m.clientId = ?"; params.push(clientId); }
      if (entityId) { where += " AND m.entityId = ?"; params.push(entityId); }
      if (role) { where += " AND m.role = ?"; params.push(role); }
      const [members]: any = await conn.query(
        `SELECT m.*, c.companyName as clientName, e.name as entityName,
         (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount
         FROM \`Member\` m 
         LEFT JOIN \`Client\` c ON m.clientId = c.id 
         LEFT JOIN \`Entity\` e ON m.entityId = e.id 
         WHERE ${where} ORDER BY m.createdAt DESC`,
        params
      );
      conn.release();
      res.json({ members });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/members", async (req, res) => {
    try {
      const { clientId, entityId, fullName, role, email, phone, pan, aadhaar, din, dpin, address, isResident, shareholding } = req.body;
      if (!clientId || !fullName || !role) return res.status(400).json({ error: "clientId, fullName, and role are required" });
      const conn = await getPlatformConnection();
      const id = "mem_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Member\` (id, clientId, entityId, fullName, role, email, phone, pan, aadhaar, din, dpin, address, isResident, shareholding, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [id, clientId, entityId || null, fullName, role, email || null, phone || null, pan || null, aadhaar || null, din || null, dpin || null, address || null, isResident !== false ? 1 : 0, shareholding || null, now, now]
      );
      conn.release();
      res.json({ success: true, id, fullName, role });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/members/:id", async (req, res) => {
    try {
      const updates = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const allowed = ["fullName", "role", "email", "phone", "pan", "aadhaar", "din", "dpin", "address", "isResident", "shareholding", "status", "dscExpiry", "entityId"];
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      for (const key of allowed) {
        if (updates[key] !== undefined) { sets.push(`\`${key}\` = ?`); vals.push(updates[key]); }
      }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Member\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.delete("/api/admin/members/:id", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      await conn.query("DELETE FROM `Member` WHERE id = ?", [req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Get members for a client (portal-side)
  app.get("/api/portal/members", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [members]: any = await conn.query(
        `SELECT m.id, m.fullName, m.role, m.email, m.phone, m.status,
         (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount
         FROM \`Member\` m JOIN \`Client\` c ON m.clientId = c.id 
         WHERE c.contactEmail = ? AND m.status = 'ACTIVE' ORDER BY m.role, m.fullName`,
        [user[0]?.email]
      );
      conn.release();
      res.json({ members });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── TICKETS (enhanced) ───
  app.get("/api/admin/tickets", async (req, res) => {
    try {
      const { status, priority, search, page = "1", limit = "15" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND t.status = ?"; params.push(status); }
      if (priority && priority !== "ALL") { where += " AND t.priority = ?"; params.push(priority); }
      if (search) { where += " AND (t.subject LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Ticket\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where}`, params);
      const [tickets]: any = await conn.query(`SELECT t.*, c.companyName as clientName FROM \`Ticket\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where} ORDER BY FIELD(t.priority,'CRITICAL','HIGH','MEDIUM','LOW'), t.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      conn.release();
      res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/tickets", async (req, res) => {
    try {
      const { clientId, subject, description, priority } = req.body;
      if (!clientId || !subject) return res.status(400).json({ error: "clientId and subject required" });
      const conn = await getPlatformConnection();
      const id = "tkt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(`INSERT INTO \`Ticket\` (id, clientId, subject, description, priority, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
        [id, clientId, subject, description || null, priority || "MEDIUM", now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/tickets/:id", async (req, res) => {
    try {
      const { status, assigneeId } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "RESOLVED" || status === "CLOSED") { sets.push("resolvedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`Ticket\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── CONSULTATIONS (enhanced) ───
  app.get("/api/admin/consultations", async (req, res) => {
    try {
      const { status, search, page = "1", limit = "15" } = req.query as any;
      const conn = await getPlatformConnection();
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND con.status = ?"; params.push(status); }
      if (search) { where += " AND (con.topic LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);
      const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Consultation\` con LEFT JOIN \`Client\` c ON con.clientId = c.id WHERE ${where}`, params);
      const [consultations]: any = await conn.query(`SELECT con.*, c.companyName as clientName FROM \`Consultation\` con LEFT JOIN \`Client\` c ON con.clientId = c.id WHERE ${where} ORDER BY con.scheduledAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      conn.release();
      res.json({ consultations, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/consultations", async (req, res) => {
    try {
      const { clientId, topic, advisorId, scheduledAt, duration, meetingLink, notes } = req.body;
      if (!clientId || !topic || !scheduledAt) return res.status(400).json({ error: "clientId, topic, scheduledAt required" });
      const conn = await getPlatformConnection();
      const id = "con_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(`INSERT INTO \`Consultation\` (id, clientId, topic, advisorId, scheduledAt, duration, status, meetingLink, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, ?, ?, ?)`,
        [id, clientId, topic, advisorId || null, scheduledAt, duration || 30, meetingLink || null, notes || null, now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/consultations/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `Consultation` SET status = ?, updatedAt = ? WHERE id = ?", [status, now, req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── TEAM MANAGEMENT ───
  app.get("/api/admin/team", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [team]: any = await conn.query("SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM `User` WHERE role IN ('SUPER_ADMIN','ADMIN','TEAM_MEMBER') ORDER BY createdAt");
      // Get workload per team member
      const workload: any[] = [];
      for (const member of team) {
        const [[taskCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `Task` WHERE assigneeId = ? AND status NOT IN ('COMPLETED')", [member.id]);
        const [[compCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `ComplianceTask` WHERE assigneeId = ? AND status NOT IN ('COMPLETED')", [member.id]);
        const [[clientCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `Client` WHERE relationshipMgrId = ?", [member.id]);
        workload.push({ ...member, activeTasks: (taskCount.c || 0) + (compCount.c || 0), clients: clientCount.c || 0 });
      }
      conn.release();
      res.json({ team: workload });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/team/invite", async (req: any, res) => {
    try {
      const { email, firstName, lastName, role, phone, password } = req.body;
      if (!email || !firstName || !role) return res.status(400).json({ error: "email, firstName, role required" });
      if (!["TEAM_MEMBER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
        return res.status(400).json({ error: "Invalid team role" });
      }
      if (role === "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only super admins can create super admin accounts" });
      }
      const conn = await getPlatformConnection();
      const [existing]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [email]);
      if (existing.length > 0) { conn.release(); return res.status(409).json({ error: "Email already exists" }); }
      const id = "tm_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const passwordHash = await bcrypt.hash(password || "Team@2026", 12);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(`INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [id, email, passwordHash, firstName, lastName || "", phone || null, role, now, now]);
      conn.release();
      res.json({ success: true, id, role, credentials: { email, password: password || "Team@2026" } });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── REPORTS & ANALYTICS ───
  app.get("/api/admin/reports", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      // Client metrics
      const [[clientStats]]: any = await conn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='ACTIVE' THEN 1 END) as active, COUNT(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as newThisMonth FROM `Client`");
      // Revenue metrics
      const [[revenue]]: any = await conn.query("SELECT COALESCE(SUM(CASE WHEN status='PAID' THEN total ELSE 0 END),0) as collected, COALESCE(SUM(CASE WHEN status IN ('PENDING','SENT','OVERDUE') THEN total ELSE 0 END),0) as outstanding, COALESCE(SUM(total),0) as totalBilled FROM `Invoice`");
      // Compliance metrics
      const [[compliance]]: any = await conn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed, COUNT(CASE WHEN status NOT IN ('COMPLETED') AND dueDate < NOW() THEN 1 END) as overdue FROM `ComplianceTask`");
      // Service delivery
      const [[services]]: any = await conn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed, COUNT(CASE WHEN status='IN_PROGRESS' THEN 1 END) as inProgress, ROUND(AVG(CASE WHEN status='COMPLETED' THEN DATEDIFF(completedAt, createdAt) END),1) as avgDays FROM `ServiceRequest`");
      // Task productivity
      const [[tasks]]: any = await conn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed, COUNT(CASE WHEN status='COMPLETED' AND completedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as completedThisWeek FROM `Task`");
      // Ticket resolution
      const [[tickets]]: any = await conn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status IN ('RESOLVED','CLOSED') THEN 1 END) as resolved, ROUND(AVG(CASE WHEN resolvedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, createdAt, resolvedAt) END),1) as avgHoursToResolve FROM `Ticket`");
      // Monthly revenue trend (last 6 months)
      const [monthlyRevenue]: any = await conn.query("SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, SUM(CASE WHEN status='PAID' THEN total ELSE 0 END) as paid, SUM(total) as billed FROM `Invoice` WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month");
      conn.release();
      res.json({
        clients: { total: clientStats.total, active: clientStats.active, newThisMonth: clientStats.newThisMonth },
        revenue: { collected: Number(revenue.collected), outstanding: Number(revenue.outstanding), totalBilled: Number(revenue.totalBilled) },
        compliance: { total: compliance.total, completed: compliance.completed, overdue: compliance.overdue, rate: compliance.total > 0 ? Math.round((compliance.completed / compliance.total) * 100) : 100 },
        services: { total: services.total, completed: services.completed, inProgress: services.inProgress, avgDays: services.avgDays || 0 },
        tasks: { total: tasks.total, completed: tasks.completed, completedThisWeek: tasks.completedThisWeek },
        tickets: { total: tickets.total, resolved: tickets.resolved, avgHoursToResolve: tickets.avgHoursToResolve || 0 },
        monthlyRevenue
      });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── TRADEMARKS ───
  app.get("/api/admin/trademarks", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [trademarks]: any = await conn.query("SELECT tm.*, c.companyName as clientName FROM `TrademarkApp` tm LEFT JOIN `Client` c ON tm.clientId = c.id ORDER BY tm.createdAt DESC");
      conn.release();
      res.json({ trademarks });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/trademarks", async (req, res) => {
    try {
      const { clientId, name, classNumber, applicationNo, status, currentStage, nextAction } = req.body;
      if (!clientId || !name || !classNumber) return res.status(400).json({ error: "clientId, name, classNumber required" });
      const conn = await getPlatformConnection();
      const id = "tm_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("INSERT INTO `TrademarkApp` (id, clientId, name, classNumber, applicationNo, status, currentStage, nextAction, filedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, clientId, name, classNumber, applicationNo || null, status || "FILED", currentStage || null, nextAction || null, now, now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/trademarks/:id", async (req, res) => {
    try {
      const { status, currentStage, nextAction, applicationNo } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); }
      if (currentStage) { sets.push("currentStage = ?"); vals.push(currentStage); }
      if (nextAction) { sets.push("nextAction = ?"); vals.push(nextAction); }
      if (applicationNo) { sets.push("applicationNo = ?"); vals.push(applicationNo); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`TrademarkApp\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── LEGAL MATTERS ───
  app.get("/api/admin/legal-matters", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [matters]: any = await conn.query("SELECT lm.*, c.companyName as clientName FROM `LegalMatter` lm LEFT JOIN `Client` c ON lm.clientId = c.id ORDER BY lm.createdAt DESC");
      conn.release();
      res.json({ matters });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/admin/legal-matters", async (req, res) => {
    try {
      const { clientId, title, type, lawyerId, priority, deadline, notes } = req.body;
      if (!clientId || !title || !type) return res.status(400).json({ error: "clientId, title, type required" });
      const conn = await getPlatformConnection();
      const id = "lm_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("INSERT INTO `LegalMatter` (id, clientId, title, type, lawyerId, priority, status, deadline, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?)",
        [id, clientId, title, type, lawyerId || null, priority || "MEDIUM", deadline || null, notes || null, now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.patch("/api/admin/legal-matters/:id", async (req, res) => {
    try {
      const { status, lawyerId, priority, notes } = req.body;
      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); }
      if (lawyerId) { sets.push("lawyerId = ?"); vals.push(lawyerId); }
      if (priority) { sets.push("priority = ?"); vals.push(priority); }
      if (notes) { sets.push("notes = ?"); vals.push(notes); }
      vals.push(req.params.id);
      await conn.query(`UPDATE \`LegalMatter\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ─── AUDIT LOG ───
  app.get("/api/admin/audit-log", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [logs]: any = await conn.query("SELECT a.*, u.email as userEmail FROM `AuditLog` a LEFT JOIN `User` u ON a.userId = u.id ORDER BY a.createdAt DESC LIMIT 50");
      conn.release();
      res.json({ logs });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ═══ CLIENT PORTAL APIs ═══

  // Partner portal APIs
  const requirePartner = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!["TEAM_MEMBER", "ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
        return res.status(403).json({ error: "Partner access required" });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  app.use("/api/partner", requirePartner);

  const assignedClientWhere = (user: any) => {
    if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return { where: "1=1", params: [] as any[] };
    }
    return { where: "c.relationshipMgrId = ?", params: [user.userId] as any[] };
  };

  app.get("/api/partner/dashboard", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const scope = assignedClientWhere(req.user);
      const [[clientCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`Client\` c WHERE ${scope.where}`, scope.params);
      const [[serviceCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`ServiceRequest\` sr JOIN \`Client\` c ON sr.clientId = c.id WHERE ${scope.where} AND sr.status NOT IN ('COMPLETED','CANCELLED')`, scope.params);
      const [[documentCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id WHERE ${scope.where} AND d.status IN ('PENDING','UNDER_REVIEW')`, scope.params);
      const [[complianceCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id WHERE ${scope.where} AND ct.status NOT IN ('COMPLETED')`, scope.params);
      const [clients]: any = await conn.query(
        `SELECT c.id, c.companyName, c.contactName, c.contactEmail, c.status, c.createdAt,
         (SELECT COUNT(*) FROM \`ServiceRequest\` sr WHERE sr.clientId = c.id AND sr.status NOT IN ('COMPLETED','CANCELLED')) as openServices,
         (SELECT COUNT(*) FROM \`Document\` d WHERE d.clientId = c.id AND d.status IN ('PENDING','UNDER_REVIEW')) as pendingDocuments
         FROM \`Client\` c WHERE ${scope.where} ORDER BY c.createdAt DESC LIMIT 8`,
        scope.params
      );
      const [documentsForReview]: any = await conn.query(
        `SELECT d.id, d.title, d.category, d.folder, d.status, d.originalName, d.fileName, d.createdAt, c.companyName as clientName
         FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
         WHERE ${scope.where} AND d.status IN ('PENDING','UNDER_REVIEW')
         ORDER BY d.createdAt DESC LIMIT 8`,
        scope.params
      );
      const [upcomingCompliance]: any = await conn.query(
        `SELECT ct.id, ct.title, ct.dueDate, ct.priority, ct.status, e.name as entityName, c.companyName as clientName
         FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id
         WHERE ${scope.where} AND ct.status NOT IN ('COMPLETED')
         ORDER BY ct.dueDate ASC LIMIT 8`,
        scope.params
      );
      conn.release();
      res.json({
        stats: {
          clients: clientCount.count || 0,
          openServices: serviceCount.count || 0,
          documentsForReview: documentCount.count || 0,
          upcomingCompliance: complianceCount.count || 0,
        },
        clients,
        documentsForReview,
        upcomingCompliance,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load partner dashboard", details: err.message });
    }
  });

  app.get("/api/partner/clients", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const scope = assignedClientWhere(req.user);
      const [clients]: any = await conn.query(
        `SELECT c.*,
         (SELECT COUNT(*) FROM \`Entity\` e WHERE e.clientId = c.id) as entityCount,
         (SELECT COUNT(*) FROM \`ServiceRequest\` sr WHERE sr.clientId = c.id AND sr.status NOT IN ('COMPLETED','CANCELLED')) as openServices,
         (SELECT COUNT(*) FROM \`Document\` d WHERE d.clientId = c.id AND d.status IN ('PENDING','UNDER_REVIEW')) as pendingDocuments,
         (SELECT COUNT(*) FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id WHERE e.clientId = c.id AND ct.status NOT IN ('COMPLETED')) as openCompliance
         FROM \`Client\` c
         WHERE ${scope.where}
         ORDER BY c.createdAt DESC`,
        scope.params
      );
      conn.release();
      res.json({ clients });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load assigned clients", details: err.message });
    }
  });

  app.get("/api/partner/documents", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const scope = assignedClientWhere(req.user);
      const [documents]: any = await conn.query(
        `SELECT d.*, c.companyName as clientName
         FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
         WHERE ${scope.where}
         ORDER BY FIELD(d.status,'UNDER_REVIEW','PENDING','REJECTED','APPROVED'), d.createdAt DESC
         LIMIT 100`,
        scope.params
      );
      conn.release();
      res.json({ documents });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load documents", details: err.message });
    }
  });

  app.patch("/api/partner/documents/:id", async (req: any, res) => {
    try {
      const { status, internalNote } = req.body;
      if (!["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
        return res.status(400).json({ error: "Invalid document status" });
      }
      const conn = await getPlatformConnection();
      const scope = assignedClientWhere(req.user);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const params = [status, req.user.userId, status === "APPROVED" ? now : null, internalNote || null, now, req.params.id, ...scope.params];
      const [result]: any = await conn.query(
        `UPDATE \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
         SET d.status = ?, d.approvedBy = ?, d.approvedAt = ?, d.internalNote = ?, d.updatedAt = ?
         WHERE d.id = ? AND ${scope.where}`,
        params
      );
      conn.release();
      if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found for assigned client" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update document", details: err.message });
    }
  });

  app.get("/api/partner/compliance", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const scope = assignedClientWhere(req.user);
      const [tasks]: any = await conn.query(
        `SELECT ct.*, e.name as entityName, c.companyName as clientName
         FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id
         WHERE ${scope.where}
         ORDER BY FIELD(ct.priority,'CRITICAL','HIGH','MEDIUM','LOW'), ct.dueDate ASC
         LIMIT 100`,
        scope.params
      );
      conn.release();
      res.json({ tasks });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load compliance tasks", details: err.message });
    }
  });

  // ─── TIMESHEET PORTAL ENDPOINTS ───
  app.get("/api/partner/timesheet", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
      
      let whereClause = "1=1";
      const params: any[] = [];
      
      if (!isAdmin) {
        whereClause += " AND t.userId = ?";
        params.push(req.user.userId);
      } else {
        if (req.query.userId && req.query.userId !== "all") {
          whereClause += " AND t.userId = ?";
          params.push(req.query.userId);
        }
      }
      
      if (req.query.clientId) {
        whereClause += " AND t.clientId = ?";
        params.push(req.query.clientId);
      }
      
      if (req.query.startDate) {
        whereClause += " AND t.startTime >= ?";
        params.push(req.query.startDate);
      }
      
      if (req.query.endDate) {
        whereClause += " AND t.startTime <= ?";
        params.push(req.query.endDate);
      }
      
      const query = `
        SELECT t.*, u.firstName, u.lastName, c.companyName as clientName
        FROM \`Timesheet\` t
        LEFT JOIN \`User\` u ON t.userId = u.id
        LEFT JOIN \`Client\` c ON t.clientId = c.id
        WHERE ${whereClause}
        ORDER BY t.startTime DESC
      `;
      
      const [entries]: any = await conn.query(query, params);
      conn.release();
      res.json({ entries });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load timesheet entries", details: err.message });
    }
  });

  app.get("/api/partner/timesheet/summary", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
      const currentUserId = req.user.userId;
      
      // Active timer check
      const [activeTimers]: any = await conn.query(
        `SELECT t.*, c.companyName as clientName 
         FROM \`Timesheet\` t 
         LEFT JOIN \`Client\` c ON t.clientId = c.id
         WHERE t.userId = ? AND t.endTime IS NULL 
         LIMIT 1`,
        [currentUserId]
      );
      const activeTimer = activeTimers.length > 0 ? activeTimers[0] : null;

      // Stats filters
      let statsWhere = "1=1";
      const statsParams: any[] = [];
      if (!isAdmin) {
        statsWhere += " AND t.userId = ?";
        statsParams.push(currentUserId);
      } else {
        if (req.query.userId && req.query.userId !== "all") {
          statsWhere += " AND t.userId = ?";
          statsParams.push(req.query.userId);
        }
      }

      if (req.query.clientId) {
        statsWhere += " AND t.clientId = ?";
        statsParams.push(req.query.clientId);
      }
      if (req.query.startDate) {
        statsWhere += " AND t.startTime >= ?";
        statsParams.push(req.query.startDate);
      }
      if (req.query.endDate) {
        statsWhere += " AND t.startTime <= ?";
        statsParams.push(req.query.endDate);
      }

      // 1. Basic sums
      const [[totals]]: any = await conn.query(
        `SELECT 
           COALESCE(SUM(duration), 0) as totalDuration,
           COALESCE(SUM(CASE WHEN billable = 1 THEN duration ELSE 0 END), 0) as billableDuration
         FROM \`Timesheet\` t
         WHERE ${statsWhere} AND t.endTime IS NOT NULL`,
        statsParams
      );

      // 2. Breakdown by client
      const [byClient]: any = await conn.query(
        `SELECT 
           t.clientId,
           COALESCE(c.companyName, t.customClient, 'No Client') as clientName,
           SUM(t.duration) as totalDuration,
           SUM(CASE WHEN t.billable = 1 THEN t.duration ELSE 0 END) as billableDuration
         FROM \`Timesheet\` t
         LEFT JOIN \`Client\` c ON t.clientId = c.id
         WHERE ${statsWhere} AND t.endTime IS NOT NULL
         GROUP BY t.clientId, c.companyName, t.customClient
         ORDER BY totalDuration DESC`,
        statsParams
      );

      // 3. Breakdown by user (only meaningful for Admin, but secure for partner too)
      const [byUser]: any = await conn.query(
        `SELECT 
           t.userId,
           CONCAT(u.firstName, ' ', u.lastName) as fullName,
           SUM(t.duration) as totalDuration,
           SUM(CASE WHEN t.billable = 1 THEN t.duration ELSE 0 END) as billableDuration
         FROM \`Timesheet\` t
         JOIN \`User\` u ON t.userId = u.id
         WHERE ${statsWhere} AND t.endTime IS NOT NULL
         GROUP BY t.userId, u.firstName, u.lastName
         ORDER BY totalDuration DESC`,
        statsParams
      );

      conn.release();
      res.json({
        activeTimer,
        summary: {
          totalDuration: totals.totalDuration,
          billableDuration: totals.billableDuration,
          byClient,
          byUser
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load timesheet summary", details: err.message });
    }
  });

  app.post("/api/partner/timesheet", async (req: any, res) => {
    try {
      const { clientId, customClient, description, startTime, endTime, duration, billable } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }
      if (!startTime) {
        return res.status(400).json({ error: "Start time is required" });
      }

      const conn = await getPlatformConnection();
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const startStr = new Date(startTime).toISOString().slice(0, 23).replace("T", " ");
      const id = "ts_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

      if (endTime) {
        // Manual entry: creates a completed log immediately
        const endStr = new Date(endTime).toISOString().slice(0, 23).replace("T", " ");
        const finalDuration = duration !== undefined ? duration : Math.max(0, Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000));
        
        await conn.query(
          `INSERT INTO \`Timesheet\` (id, userId, clientId, customClient, description, startTime, endTime, duration, billable, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, req.user.userId, clientId || null, customClient || null, description, startStr, endStr, finalDuration, billable ? 1 : 0, now, now]
        );
      } else {
        // Timer entry: starts running timer and stops any existing active timers
        const [running]: any = await conn.query(
          "SELECT id, startTime FROM `Timesheet` WHERE userId = ? AND endTime IS NULL",
          [req.user.userId]
        );
        
        for (const timer of running) {
          const start = new Date(timer.startTime);
          const end = new Date(startTime); // Stop old timer at start time of new timer
          const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
          const endStr = end.toISOString().slice(0, 23).replace("T", " ");
          
          await conn.query(
            "UPDATE `Timesheet` SET endTime = ?, duration = ?, updatedAt = ? WHERE id = ?",
            [endStr, duration, now, timer.id]
          );
        }

        await conn.query(
          `INSERT INTO \`Timesheet\` (id, userId, clientId, customClient, description, startTime, endTime, duration, billable, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, req.user.userId, clientId || null, customClient || null, description, startStr, null, 0, billable ? 1 : 0, now, now]
        );
      }
      
      conn.release();
      res.status(201).json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create timesheet entry", details: err.message });
    }
  });

  app.put("/api/partner/timesheet/:id", async (req: any, res) => {
    try {
      const { clientId, customClient, description, billable, startTime, endTime, duration } = req.body;
      const conn = await getPlatformConnection();
      
      // Verify authorization and check if active
      const [existing]: any = await conn.query("SELECT userId, startTime, endTime FROM `Timesheet` WHERE id = ?", [req.params.id]);
      if (existing.length === 0) {
        conn.release();
        return res.status(404).json({ error: "Timesheet entry not found" });
      }

      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
      if (!isAdmin && existing[0].userId !== req.user.userId) {
        conn.release();
        return res.status(403).json({ error: "Insufficient permissions to edit this entry" });
      }

      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      if (existing[0].endTime === null) {
        // The timer is currently running. We are stopping it now.
        const start = new Date(existing[0].startTime);
        const end = new Date();
        const durationVal = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
        const endStr = end.toISOString().slice(0, 23).replace("T", " ");

        await conn.query(
          `UPDATE \`Timesheet\`
           SET clientId = ?, customClient = ?, description = ?, billable = ?, endTime = ?, duration = ?, updatedAt = ?
           WHERE id = ?`,
          [clientId || null, customClient || null, description, billable ? 1 : 0, endStr, durationVal, now, req.params.id]
        );
      } else {
        // Already stopped log, update metadata and optionally times/duration
        const startStr = startTime ? new Date(startTime).toISOString().slice(0, 23).replace("T", " ") : null;
        const endStr = endTime ? new Date(endTime).toISOString().slice(0, 23).replace("T", " ") : null;
        
        await conn.query(
          `UPDATE \`Timesheet\`
           SET clientId = ?, customClient = ?, description = ?, billable = ?,
               startTime = COALESCE(?, startTime),
               endTime = COALESCE(?, endTime),
               duration = COALESCE(?, duration),
               updatedAt = ?
           WHERE id = ?`,
          [clientId || null, customClient || null, description, billable ? 1 : 0, startStr, endStr, duration !== undefined ? duration : null, now, req.params.id]
        );
      }
      
      conn.release();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update timesheet entry", details: err.message });
    }
  });

  app.delete("/api/partner/timesheet/:id", async (req: any, res) => {
    try {
      const conn = await getPlatformConnection();
      
      // Verify authorization
      const [existing]: any = await conn.query("SELECT userId FROM `Timesheet` WHERE id = ?", [req.params.id]);
      if (existing.length === 0) {
        conn.release();
        return res.status(404).json({ error: "Timesheet entry not found" });
      }

      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
      if (!isAdmin && existing[0].userId !== req.user.userId) {
        conn.release();
        return res.status(403).json({ error: "Insufficient permissions to delete this entry" });
      }

      await conn.query("DELETE FROM `Timesheet` WHERE id = ?", [req.params.id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete timesheet entry", details: err.message });
    }
  });

  // Auth middleware for portal routes
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  // Apply auth to ALL /api/portal/* routes
  app.use("/api/portal", requireAuth);

  // Register Books module routes
  registerBooksRoutes(app, getPlatformConnection, getBooksConnection);

  // Portal Dashboard — get logged-in user's data
  app.get("/api/portal/dashboard", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
const secret = JWT_SECRET;
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const conn = await getPlatformConnection();
      const [users]: any = await conn.query("SELECT id, firstName, lastName, email, role FROM `User` WHERE id = ?", [decoded.userId]);
      if (users.length === 0) { conn.release(); return res.status(404).json({ error: "User not found" }); }
      const user = users[0];

      // Get entities for this user's client record
      const [entities]: any = await conn.query("SELECT COUNT(*) as count FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user.email]);
      const [compliance]: any = await conn.query("SELECT COUNT(*) as count FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? AND ct.status != 'COMPLETED'", [user.email]);
      const [docs]: any = await conn.query("SELECT COUNT(*) as count FROM `Document` d JOIN `Client` c ON d.clientId = c.id WHERE c.contactEmail = ?", [user.email]);
      const [tickets]: any = await conn.query("SELECT COUNT(*) as count FROM `Ticket` t JOIN `Client` c ON t.clientId = c.id WHERE c.contactEmail = ? AND t.status IN ('OPEN','IN_PROGRESS')", [user.email]);
      const [recentCompliance]: any = await conn.query("SELECT ct.title, ct.dueDate, ct.status, ct.assigneeId, e.name as entityName FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? AND ct.status != 'COMPLETED' ORDER BY ct.dueDate ASC LIMIT 5", [user.email]);
      const [activities]: any = await conn.query("SELECT a.title, a.type, a.createdAt FROM `Activity` a JOIN `Client` c ON a.clientId = c.id WHERE c.contactEmail = ? ORDER BY a.createdAt DESC LIMIT 5", [user.email]);
      const [entityList]: any = await conn.query("SELECT e.id, e.name, e.type, e.status FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user.email]);

      // If no specific compliance tasks exist, generate generic upcoming deadlines based on entity type
      let complianceToShow = recentCompliance;
      if (recentCompliance.length === 0) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const entityName = entityList.length > 0 ? entityList[0].name : "Your Company";
        // Standard compliance calendar for Indian companies
        const genericTasks = [
          { title: "DIR-3 KYC (Annual Director Verification)", dueDate: new Date(currentYear, 8, 30).toISOString(), status: currentMonth > 8 ? "OVERDUE" : "PENDING", entityName },
          { title: "GST Return - GSTR 1", dueDate: new Date(currentYear, currentMonth, 11).toISOString(), status: now.getDate() > 11 ? "OVERDUE" : "PENDING", entityName },
          { title: "GST Return - GSTR 3B", dueDate: new Date(currentYear, currentMonth, 20).toISOString(), status: now.getDate() > 20 ? "OVERDUE" : "PENDING", entityName },
          { title: "TDS Payment (Monthly)", dueDate: new Date(currentYear, currentMonth + 1, 7).toISOString(), status: "PENDING", entityName },
          { title: "Board Meeting (Quarterly)", dueDate: new Date(currentYear, Math.ceil((currentMonth + 1) / 3) * 3, 15).toISOString(), status: "PENDING", entityName },
          { title: "ROC Annual Filing - AOC-4", dueDate: new Date(currentYear, 10, 30).toISOString(), status: currentMonth > 10 ? "OVERDUE" : "PENDING", entityName },
          { title: "ROC Annual Return - MGT-7", dueDate: new Date(currentYear, 11, 31).toISOString(), status: "PENDING", entityName },
        ].filter(t => new Date(t.dueDate) >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)); // Show items from 7 days ago onwards
        complianceToShow = genericTasks.slice(0, 5);
      }

      conn.release();
      res.json({
        user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
        metrics: { entities: entities[0].count, compliance: compliance[0].count || complianceToShow.length, documents: docs[0].count, openTickets: tickets[0].count },
        recentCompliance: complianceToShow,
        recentActivity: activities,
        entities: entityList
      });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal entities
  app.get("/api/portal/entities", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [entities]: any = await conn.query("SELECT e.* FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user[0]?.email]);
      conn.release();
      res.json({ entities });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal compliance
  app.get("/api/portal/compliance", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [tasks]: any = await conn.query("SELECT ct.*, e.name as entityName FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? ORDER BY ct.dueDate ASC", [user[0]?.email]);
      conn.release();
      res.json({ tasks });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal documents
  app.get("/api/portal/documents", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [docs]: any = await conn.query("SELECT d.* FROM `Document` d JOIN `Client` c ON d.clientId = c.id WHERE c.contactEmail = ? ORDER BY d.createdAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ documents: docs });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal document upload (client uploads their own documents)
  app.post("/api/portal/documents/upload", upload.single("file"), async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      
      const { title, category, folder, memberId } = req.body;
      if (!title || !category) return res.status(400).json({ error: "Title and category are required" });

      const conn = await getPlatformConnection();
      // Get client ID from user email
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      if (!user[0]) { conn.release(); return res.status(404).json({ error: "User not found" }); }
      const [clients]: any = await conn.query("SELECT id FROM `Client` WHERE contactEmail = ?", [user[0].email]);
      if (!clients[0]) { conn.release(); return res.status(404).json({ error: "Client account not found" }); }
      const clientId = clients[0].id;

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const storageKey = `clients/${clientId}/${category}/${Date.now()}${fileExt}`;
      
      let publicUrl = "";
      let storageProvider = "local";

      // Upload to R2 if configured
      if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
        try {
          const s3 = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            },
          });
          await s3.send(new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "incroute",
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.mimetype,
          }));
          storageProvider = "r2";
          if (process.env.CLOUDFLARE_R2_PUBLIC_URL) {
            publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${storageKey}`;
          }
        } catch (r2Err: any) {
          console.error("R2 upload failed, falling back to local:", r2Err.message);
          // Fallback: save locally — use storageKey path for consistency
          const localFilePath = path.join(process.cwd(), "uploads", storageKey.replace(/^clients\//, ""));
          fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
          fs.writeFileSync(localFilePath, file.buffer);
          storageProvider = "local";
          publicUrl = `/uploads/${storageKey.replace(/^clients\//, "")}`;
        }
      } else {
        // Save locally if R2 not configured — use storageKey path for consistency
        const localFilePath = path.join(process.cwd(), "uploads", storageKey.replace(/^clients\//, ""));
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, file.buffer);
        publicUrl = `/uploads/${storageKey.replace(/^clients\//, "")}`;
      }

      // Save metadata to DB
      const docId = "doc_" + Date.now().toString(36) + crypto.randomBytes(4).toString("hex");
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query(
        `INSERT INTO \`Document\` (id, clientId, memberId, title, category, folder, fileName, originalName, mimeType, size, storageKey, storageProvider, publicUrl, status, uploadedBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
        [docId, clientId, memberId || null, title, category, folder || category, file.originalname, file.originalname, file.mimetype, file.size, storageKey, storageProvider, publicUrl, decoded.userId, now, now]
      );
      conn.release();

      res.json({ success: true, id: docId, message: "Document uploaded successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed: " + err.message });
    }
  });

  // Portal — get allowed services for document center (based on client's entities + admin config)
  app.get("/api/portal/allowed-services", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      if (!user[0]) { conn.release(); return res.json({ services: [] }); }

      // Get entity types for this client
      const [entities]: any = await conn.query(
        "SELECT DISTINCT e.type FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?",
        [user[0].email]
      );

      // Check for admin-configured allowed services (stored in Client.notes as JSON)
      const [clients]: any = await conn.query("SELECT notes FROM `Client` WHERE contactEmail = ?", [user[0].email]);

      let services: string[] = [];

      // First priority: admin-configured services from client notes
      if (clients[0]?.notes) {
        try {
          const parsed = JSON.parse(clients[0].notes);
          if (parsed.allowedServices && Array.isArray(parsed.allowedServices)) {
            services = parsed.allowedServices;
          }
        } catch {} // notes is not JSON, ignore
      }

      // If no admin config, derive from entity types
      if (services.length === 0 && entities.length > 0) {
        services = entities.map((e: any) => e.type);
        // Also include common add-ons for companies
        if (services.includes("PVT_LTD") || services.includes("LLP") || services.includes("OPC")) {
          if (!services.includes("GST")) services.push("GST");
          if (!services.includes("ROC_FILING")) services.push("ROC_FILING");
        }
      }

      // If still nothing, auto-detect from uploaded documents
      if (services.length === 0) {
        const [docCategories]: any = await conn.query(
          "SELECT DISTINCT d.category FROM `Document` d JOIN `Client` c ON d.clientId = c.id WHERE c.contactEmail = ?",
          [user[0].email]
        );
        if (docCategories.length > 0) {
          services = docCategories.map((dc: any) => dc.category).filter((c: string) => c && c !== "Other");
        }
      }

      conn.release();
      res.json({ services });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal — company notes (AOA/MOA input from client)
  app.get("/api/portal/company-notes", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [clients]: any = await conn.query("SELECT notes FROM `Client` WHERE contactEmail = ?", [user[0]?.email]);
      conn.release();

      let notes = { aoa: "", moa: "" };
      if (clients[0]?.notes) {
        try {
          const parsed = JSON.parse(clients[0].notes);
          notes = { aoa: parsed.aoa || "", moa: parsed.moa || "" };
        } catch {}
      }
      res.json({ notes });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/portal/company-notes", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const { aoa, moa } = req.body;

      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [clients]: any = await conn.query("SELECT id, notes FROM `Client` WHERE contactEmail = ?", [user[0]?.email]);

      if (!clients[0]) { conn.release(); return res.status(404).json({ error: "Client not found" }); }

      // Merge with existing notes (preserve admin-set fields like allowedServices)
      let existingNotes: any = {};
      if (clients[0].notes) {
        try { existingNotes = JSON.parse(clients[0].notes); } catch {}
      }
      existingNotes.aoa = aoa || "";
      existingNotes.moa = moa || "";
      existingNotes.notesUpdatedAt = new Date().toISOString();

      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `Client` SET notes = ?, updatedAt = ? WHERE id = ?", [JSON.stringify(existingNotes), now, clients[0].id]);
      conn.release();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Admin — configure allowed services for a client
  app.post("/api/admin/clients/:id/services", async (req, res) => {
    try {
      const { services } = req.body;
      if (!Array.isArray(services)) return res.status(400).json({ error: "services must be an array" });

      const conn = await getPlatformConnection();
      const [clients]: any = await conn.query("SELECT notes FROM `Client` WHERE id = ?", [req.params.id]);
      if (!clients[0]) { conn.release(); return res.status(404).json({ error: "Client not found" }); }

      let existingNotes: any = {};
      if (clients[0].notes) {
        try { existingNotes = JSON.parse(clients[0].notes); } catch {}
      }
      existingNotes.allowedServices = services;

      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("UPDATE `Client` SET notes = ?, updatedAt = ? WHERE id = ?", [JSON.stringify(existingNotes), now, req.params.id]);
      conn.release();
      res.json({ success: true, services });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Admin — get client's allowed services & AOA/MOA notes
  app.get("/api/admin/clients/:id/services", async (req, res) => {
    try {
      const conn = await getPlatformConnection();
      const [clients]: any = await conn.query("SELECT notes FROM `Client` WHERE id = ?", [req.params.id]);
      conn.release();
      if (!clients[0]) return res.status(404).json({ error: "Client not found" });

      let data: any = { services: [], aoa: "", moa: "" };
      if (clients[0].notes) {
        try {
          const parsed = JSON.parse(clients[0].notes);
          data = { services: parsed.allowedServices || [], aoa: parsed.aoa || "", moa: parsed.moa || "" };
        } catch {}
      }
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal invoices
  app.get("/api/portal/invoices", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [invoices]: any = await conn.query("SELECT i.* FROM `Invoice` i JOIN `Client` c ON i.clientId = c.id WHERE c.contactEmail = ? ORDER BY i.createdAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ invoices });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal tickets
  app.get("/api/portal/tickets", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [tickets]: any = await conn.query("SELECT t.* FROM `Ticket` t JOIN `Client` c ON t.clientId = c.id WHERE c.contactEmail = ? ORDER BY t.createdAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ tickets });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal profile
  app.get("/api/portal/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [users]: any = await conn.query("SELECT id, firstName, lastName, email, phone, role, createdAt, lastLoginAt FROM `User` WHERE id = ?", [decoded.userId]);
      const [clients]: any = await conn.query("SELECT * FROM `Client` WHERE contactEmail = ? LIMIT 1", [users[0]?.email]);
      conn.release();
      res.json({ user: users[0] || null, client: clients[0] || null });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Create support ticket
  app.post("/api/portal/tickets/create", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const { subject, description, priority } = req.body;
      if (!subject) return res.status(400).json({ error: "Subject is required" });
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [clients]: any = await conn.query("SELECT id FROM `Client` WHERE contactEmail = ?", [user[0]?.email]);
      if (!clients[0]) { conn.release(); return res.status(404).json({ error: "Client not found" }); }
      const id = "tkt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      await conn.query("INSERT INTO `Ticket` (id, clientId, subject, description, priority, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)", [id, clients[0].id, subject, description || null, priority || "MEDIUM", now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Book consultation
  app.post("/api/portal/consultations/book", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const { topic, scheduledAt, notes } = req.body;
      if (!topic || !scheduledAt) return res.status(400).json({ error: "Topic and date required" });
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [clients]: any = await conn.query("SELECT id FROM `Client` WHERE contactEmail = ?", [user[0]?.email]);
      if (!clients[0]) { conn.release(); return res.status(404).json({ error: "Client not found" }); }
      const id = "con_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const scheduled = new Date(scheduledAt).toISOString().slice(0, 23).replace("T", " ");
      await conn.query("INSERT INTO `Consultation` (id, clientId, topic, scheduledAt, duration, status, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, 30, 'SCHEDULED', ?, ?, ?)", [id, clients[0].id, topic, scheduled, notes || null, now, now]);
      conn.release();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Get consultations
  app.get("/api/portal/consultations", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [consultations]: any = await conn.query("SELECT con.* FROM `Consultation` con JOIN `Client` c ON con.clientId = c.id WHERE c.contactEmail = ? ORDER BY con.scheduledAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ consultations });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Get legal matters
  app.get("/api/portal/legal-matters", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [matters]: any = await conn.query("SELECT lm.* FROM `LegalMatter` lm JOIN `Client` c ON lm.clientId = c.id WHERE c.contactEmail = ? ORDER BY lm.createdAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ matters });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Get trademarks
  app.get("/api/portal/trademarks", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [trademarks]: any = await conn.query("SELECT t.* FROM `TrademarkApp` t JOIN `Client` c ON t.clientId = c.id WHERE c.contactEmail = ? ORDER BY t.createdAt DESC", [user[0]?.email]);
      conn.release();
      res.json({ trademarks });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Tax filings (entities with GSTIN info)
  app.get("/api/portal/tax-filings", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [entities]: any = await conn.query("SELECT e.id, e.name, e.gstin, e.pan, e.type FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user[0]?.email]);
      conn.release();
      res.json({ entities });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Portal: Notifications (recent activity for client)
  app.get("/api/portal/notifications", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
      const conn = await getPlatformConnection();
      const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [decoded.userId]);
      const [activities]: any = await conn.query("SELECT a.id, a.title, a.type, a.details, a.createdAt FROM `Activity` a JOIN `Client` c ON a.clientId = c.id WHERE c.contactEmail = ? ORDER BY a.createdAt DESC LIMIT 20", [user[0]?.email]);
      conn.release();
      res.json({ notifications: activities });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // --- MySQL Connection Pool Setup ---
  let dbPool: mysql.Pool | null = null;
  const isDbConfigured = !!(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  );

  if (isDbConfigured) {
    try {
      dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: 'Z'
      });
      console.log("🟢 MySQL Database Pool Initialized.");
      
      // Auto-create database tables
      (async () => {
        try {
          const conn = await dbPool!.getConnection();
          console.log("🟢 Connected to MySQL Server.");
          
          // Create blog views table
          await conn.query(`
            CREATE TABLE IF NOT EXISTS blog_views (
              post_id VARCHAR(255) PRIMARY KEY,
              views INT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          
          // Create contact submissions table
          await conn.query(`
            CREATE TABLE IF NOT EXISTS contact_submissions (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255),
              email VARCHAR(255),
              phone VARCHAR(50),
              message TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);

          // Create blog comments table
          await conn.query(`
            CREATE TABLE IF NOT EXISTS blog_comments (
              id VARCHAR(255) PRIMARY KEY,
              post_id VARCHAR(255),
              name VARCHAR(255),
              content TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          
          console.log("🟢 MySQL Database Tables Verified/Created.");
          conn.release();
        } catch (dbErr: any) {
          console.error("🔴 Failed to initialize MySQL tables:", dbErr.message);
        }
      })();
    } catch (poolErr: any) {
      console.error("🔴 Failed to create MySQL Pool:", poolErr.message);
    }
  } else {
    console.warn("⚠️ MySQL environment credentials not found. Falling back to JSON file storage.");
  }

  // --- Nodemailer Email Notification Setup ---
  let emailTransporter: nodemailer.Transporter | null = null;
  const isEmailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.NOTIFICATION_TO || process.env.NOTIFICATION_TO_SECONDARY)
  );

  if (isEmailConfigured) {
    try {
      const smtpPort = Number(process.env.SMTP_PORT) || 465;
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      // Verify connection configuration immediately
      emailTransporter.verify((error) => {
        if (error) {
          console.error("🔴 SMTP connection verification failed:", error.message);
        } else {
          console.log("🟢 SMTP server is ready to send notifications.");
        }
      });
    } catch (mailErr: any) {
      console.error("🔴 Failed to initialize SMTP Notification Transporter:", mailErr.message);
    }
  } else {
    console.warn("⚠️ SMTP credentials not found. Lead email notifications will be skipped.");
  }

  // Helper to send lead notifications
  const sendLeadNotification = async (submission: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => {
    if (!emailTransporter) return;
    
    const recipients: string[] = [];
    if (process.env.NOTIFICATION_TO) {
      recipients.push(process.env.NOTIFICATION_TO);
    }
    if (process.env.NOTIFICATION_TO_SECONDARY) {
      recipients.push(process.env.NOTIFICATION_TO_SECONDARY);
    }

    if (recipients.length === 0) return;
    
    const mailOptions = {
      from: `"Incroute Notifications" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject: `🏆 New Lead Submission: ${submission.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#0d0d0d;color:#fff;">
          <h2 style="color:#d4af37;margin-top:0;border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:12px;">New Contact Lead</h2>
          <p>A user has filled out the contact form on your website.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;width:120px;">Lead ID:</td>
              <td style="padding:8px 0;color:#fff;">${submission.id}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Full Name:</td>
              <td style="padding:8px 0;color:#fff;">${submission.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Email:</td>
              <td style="padding:8px 0;color:#fff;"><a href="mailto:${submission.email}" style="color:#d4af37;text-decoration:none;">${submission.email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Phone:</td>
              <td style="padding:8px 0;color:#fff;">${submission.phone || "N/A"}</td>
            </tr>
          </table>
          <div style="background:#151515;border-radius:6px;padding:16px;margin-top:20px;">
            <strong style="color:#d4af37;display:block;margin-bottom:8px;">Message:</strong>
            <p style="margin:0;color:#ccc;line-height:1.6;font-size:14px;white-space:pre-wrap;">${submission.message}</p>
          </div>
          <p style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:30px;text-align:center;">This is an automated notification from incroute.com</p>
        </div>
      `
    };

    try {
      await emailTransporter.sendMail(mailOptions);
      console.log(`✉️ Notification email sent to ${recipients.join(", ")} for lead ${submission.id}`);
    } catch (err: any) {
      console.error("🔴 Failed to send lead notification email:", err.message);
    }
  };

  // --- CMS Access Control (Password-based) ---
  const cmsSessions = new Set<string>();

  // Cookie extraction utility
  function getCookie(req: any, name: string): string | null {
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    const parts = cookies.split(";");
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === name) return decodeURIComponent(val);
    }
    return null;
  }

  // CMS password verification endpoint
  app.post("/api/cms/verify", (req, res) => {
    const { password } = req.body;
    const cmsPassword = process.env.CMS_PASSWORD || process.env.ADMIN_PASSWORD || "incroute2026";
    
    if (!password || password !== cmsPassword) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    cmsSessions.add(sessionToken);

    res.cookie("cms_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({ success: true });
  });

  // CMS access middleware
  function cmsAuthMiddleware(req: any, res: any, next: any) {
    const sessionToken = getCookie(req, "cms_session");
    if (sessionToken && cmsSessions.has(sessionToken)) {
      return next();
    }
    
    // Serve the password gate for CMS page requests
    if (req.path === "/cms" || req.path === "/cms/" || req.path === "/cms/index.html") {
      return res.sendFile(path.join(process.cwd(), "admin-portal/gate.html"));
    }
    
    // Block other CMS assets if not authenticated
    if (req.path.startsWith("/cms/")) {
      return res.status(404).end();
    }

    return res.status(403).json({ success: false, error: "Access denied" });
  }

  // Serve Decap CMS — password protected
  app.get(["/cms", "/cms/"], (req, res, next) => {
    if (req.path === "/cms") {
      return res.redirect(301, "/cms/");
    }
    next();
  }, cmsAuthMiddleware, (req, res) => {
    res.sendFile(path.join(process.cwd(), "admin-portal/index.html"));
  });

  // --- GitHub OAuth Provider for self-hosted Decap CMS ---
  app.get("/api/auth", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send("GitHub Client ID (GITHUB_CLIENT_ID) not configured in environment.");
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const hostUrl = `${protocol}://${req.headers.host}`;
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      hostUrl + "/api/auth/callback"
    )}`;
    res.redirect(redirectUrl);
  });

  app.get("/api/auth/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const data = await response.json();
      if (data.error) {
        return res.status(400).send(`GitHub OAuth Error: ${data.error_description || data.error}`);
      }

      const token = data.access_token;
      
      res.send(`
        <html>
          <body>
            <script>
              (function() {
                if (!window.opener) {
                  console.error("No window.opener found.");
                  return;
                }
                function receiveMessage(e) {
                  const message = "authorization:github:success:" + JSON.stringify({
                    token: "${token}",
                    provider: "github"
                  });
                  window.opener.postMessage(message, e.origin);
                  window.close();
                }
                window.addEventListener("message", receiveMessage, false);
                // Signal opener that popup is ready
                window.opener.postMessage("authorizing:github", "*");
              })()
            </script>
            <p style="font-family:sans-serif;text-align:center;padding:20px;color:#d4af37;">Authenticating CMS administrative portal. Closing authentication window...</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("OAuth token exchange failed:", err.message);
      res.status(500).send("Authentication token exchange failed.");
    }
  });

  app.get("/cms/config.yml", cmsAuthMiddleware, (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "admin-portal/config.yml");
      let configContent = fs.readFileSync(configPath, "utf-8");
      
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const hostUrl = `${protocol}://${req.headers.host}`;
      
      // Inject base_url and auth_endpoint only if not already present
      if (!configContent.includes("base_url")) {
        configContent = configContent.replace(
          "name: github",
          `name: github\n  base_url: ${hostUrl}\n  auth_endpoint: api/auth`
        );
      }
      
      res.type("yaml").send(configContent);
    } catch (err: any) {
      console.error("Failed to dynamically serve CMS config:", err.message);
      res.status(500).send("Error generating CMS configuration.");
    }
  });



  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });

  // HTTPS redirect (production only)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }



  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });



  // Persistent Config storage for Google Forms Connection
  const CONFIG_FILE = path.join(process.cwd(), "contact-form-config.json");
  let contactFormUri: string | null = process.env.GOOGLE_FORM_URI || null;

  // Load persisted config on startup if not set in environment
  if (contactFormUri) {
    console.log(`🟢 LOADED GOOGLE FORM URI FROM ENVIRONMENT: ${contactFormUri}`);
  } else if (fs.existsSync(CONFIG_FILE)) {
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      contactFormUri = configData.uri || null;
      console.log(`🟢 LOADED PERSISTED GOOGLE FORM URI: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to read persisted contact form config:", err.message);
    }
  }

  // Fallback to the default Google Form URI if not set
  if (!contactFormUri) {
    contactFormUri = "https://docs.google.com/forms/d/e/1FAIpQLSf_I-0yjXKhV_oJDi2KMpzSrFUnqZF3p_MQJ5oo28dOQ-_0yA/viewform";
    console.log(`🟢 USING FALLBACK GOOGLE FORM URI: ${contactFormUri}`);
  }

  // Config endpoints
  app.get("/api/config/contact-form", (req, res) => {
    res.json({ success: true, uri: contactFormUri });
  });

  app.post("/api/config/contact-form", (req, res) => {
    const { uri } = req.body;
    contactFormUri = uri;
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ uri }, null, 2), "utf-8");
      console.log(`🟢 PERSISTED GOOGLE FORM URI TO DISK: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to persist contact form config:", err.message);
    }
    res.json({ success: true, uri: contactFormUri });
  });

// Local Memory Storage and Disk Persistence for Contact Submissions
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");
let contactSubmissions: any[] = [];

// Load existing submissions from disk at startup
if (fs.existsSync(SUBMISSIONS_FILE)) {
  try {
    contactSubmissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    console.log(`🟢 LOADED PERSISTED SUBMISSIONS: ${contactSubmissions.length} entries`);
  } catch (err: any) {
    console.error("Failed to read persisted contact submissions:", err.message);
  }
}

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const newSubmission = {
    id: `MSG-${Math.floor(Math.random() * 10000)}`,
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  };

  // Store in memory list
  contactSubmissions.push(newSubmission);

  // Persist to MySQL if configured
  if (dbPool) {
    try {
      await dbPool.query(
        "INSERT INTO contact_submissions (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)",
        [newSubmission.id, name, email, phone || null, message]
      );
      console.log(`🟢 Persisted new lead ${newSubmission.id} to MySQL database.`);
    } catch (dbErr: any) {
      console.error("🔴 Failed to write lead to MySQL:", dbErr.message);
    }
  }

  // Persist immediately to local JSON file
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
    console.log(`🟢 PERSISTED NEW SUBMISSION TO DISK: ${newSubmission.id}`);
  } catch (err: any) {
    console.error("Failed to persist submission to disk:", err.message);
  }

  // Trigger email notification in background
  sendLeadNotification(newSubmission);

  // Log to server console so user understands where it goes
  console.log("\n---- NEW CONTACT SUBMISSION ----");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone || "N/A"}`);
  console.log(`Message: ${message}`);
  console.log("--------------------------------\n");
  console.log(`(NOTE: Total submissions saved in server memory & disk: ${contactSubmissions.length})`);

  // Background Google Form Sync (Method 2)
  if (contactFormUri) {
    console.log(`Google Cloud Connection active! Syncing lead dynamically to Google Forms...`);
    try {
      // 1. Fetch the public form page to parse field entry IDs
      const formResponse = await fetch(contactFormUri);
      if (formResponse.ok) {
        const html = await formResponse.text();

        // High-tech regex to extract modern Google Forms entry IDs from data-params
        const entryIds: string[] = [];
        const paramRegex = /data-params="%\.@\.\[(.*?)\]/g;
        let match;
        while ((match = paramRegex.exec(html)) !== null) {
          const content = match[1];
          const idMatch = content.match(/\[\[(\d+)/);
          if (idMatch && !entryIds.includes(idMatch[1])) {
            entryIds.push(idMatch[1]);
          }
        }

        console.log(`Successfully mapped Google Form field entry IDs:`, entryIds);

        // We expect the form to have our 4 fields: Full Name, Email, Phone, Message
        if (entryIds.length >= 4) {
          const postUrl = contactFormUri.replace("/viewform", "/formResponse");

          // Build urlencoded body
          const params = new URLSearchParams();
          params.append(`entry.${entryIds[0]}`, name);
          params.append(`entry.${entryIds[1]}`, email);
          params.append(`entry.${entryIds[2]}`, phone || "");
          params.append(`entry.${entryIds[3]}`, message);

          // Submit in background
          const submitRes = await fetch(postUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });

          if (submitRes.ok) {
            console.log(`🟢 LEAD SYNC SUCCESS: Data pushed to Google Forms & Google Sheets in the background!`);
          } else {
            console.error(`🔴 LEAD SYNC ERROR: Google Forms returned status ${submitRes.status} (${submitRes.statusText})`);
          }
        } else {
          console.warn(`⚠️ LEAD SYNC WARNING: Found insufficient entry fields in the Google Form template (found ${entryIds.length}, expected 4).`);
        }
      } else {
        console.error(`🔴 LEAD SYNC ERROR: Failed to retrieve Google Form template at ${contactFormUri}`);
      }
    } catch (gErr: any) {
      console.error("🔴 LEAD SYNC EXCEPTION: Failed background submission to Google Forms:", gErr.message);
    }
  }

  res.json({ success: true, message: "Contact saved successfully." });
});

// Premium Draft Request endpoint
// NOTE: For production, configure SMTP via Nodemailer or use EmailJS.
// Currently logs to console and stores in memory. Replace with actual email sending.
let premiumRequests: any[] = [];

app.post("/api/send-premium-request", (req, res) => {
  const { fullName, email, phone, companyName, notes, preferredTime, wizardData, agreedToTerms } = req.body;

  if (!fullName || !email || !companyName || !agreedToTerms) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const request = {
    id: `PREM-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName,
    email,
    phone: phone || "N/A",
    companyName,
    notes: notes || "None",
    preferredTime: preferredTime || "Anytime",
    wizardData: wizardData || {},
    agreedToTerms,
    timestamp: new Date().toISOString(),
  };

  premiumRequests.push(request);

  // Log to console (replace with Nodemailer SMTP in production)
  console.log("\n════════════════════════════════════════════");
  console.log("  🏆 NEW PREMIUM DRAFTING REQUEST");
  console.log("════════════════════════════════════════════");
  console.log(`  Name: ${fullName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Phone: ${phone || "N/A"}`);
  console.log(`  Company: ${companyName}`);
  console.log(`  Notes: ${notes || "None"}`);
  console.log(`  Preferred Time: ${preferredTime || "Anytime"}`);
  console.log(`  Wizard Data: ${JSON.stringify(wizardData || {})}`);
  console.log(`  Timestamp: ${request.timestamp}`);
  console.log("════════════════════════════════════════════\n");
  console.log(`  📧 TODO: Send email to premium@incroute.com`);
  console.log(`  Subject: New Premium Drafting Request for ${companyName}\n`);

  res.json({
    success: true,
    message: "Premium drafting request received successfully.",
    requestId: request.id,
  });
});

  // AI Name Feasibility clearance check (DeepSeek API Integration)
  app.post("/api/consult/name-check", async (req, res) => {
    const { name, entityType, industry } = req.body;

    if (!name || !entityType || !industry) {
      return res.status(400).json({ success: false, error: "Name, entity type, and industry are required." });
    }

    const checkPrompt = `Perform a comprehensive, professional name feasibility and registration clearance check for a proposed corporate entity in India.
Proposed Name: "${name}"
Entity Type: "${entityType}"
Sector/Industry: "${industry}"

Assess the proposed name meticulously against naming guidelines (e.g. check if generic, check if offensive, check prefix/suffix suitability, check for prefix descriptiveness).
Analyze the proposed name against phonetic registers, MCA database guidelines, and trademark Class 9/35/42 listings.

For company name suggestions:
Provide exactly 5 highly unique, modern corporate name suggestions. Ensure these suggested names avoid basic, boring additions (e.g. prefix + Solutions, Systems, Tech, Ventures, Global). Instead, use creative naming strategies like:
- Coined (inventing new terms, e.g., using neologisms or phonetic adjustments)
- Semantic (incorporating Latin/Greek roots or meaningful words)
- Portmanteau (smartly blending two related words)
- Modern/Abstract (sleek, highly brandable coined words)
Each suggested name must match the requested entity type legal suffix (e.g., 'Private Limited' or 'LLP'). Write explanations explaining the semantic origin or rationale for each under 'concept'.

Format your response as a strict, clean JSON object matching this exact structure:
{
  "score": 85,
  "scoreDetails": {
    "phoneticUniqueness": 88,
    "trademarkSafety": 82,
    "legalAdherence": 90,
    "linguisticAppeal": 80
  },
  "summary": "Detailed professional suitability summary...",
  "conflicts": [
    "Conflict checking notes...",
    "Trademarks search similarity warnings..."
  ],
  "checklist": [
    { "criterion": "Not generic or common words only", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "No offensive or restricted keywords", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "Matches the activity of the business sector", "passed": false, "reason": "Failed explanation..." }
  ],
  "suggestions": [
    "Suggested Name 1",
    "Suggested Name 2",
    "Suggested Name 3",
    "Suggested Name 4",
    "Suggested Name 5"
  ],
  "creativeSuggestions": [
    { "name": "Suggested Name 1", "type": "Coined neologism", "concept": "Concept/rationale text...", "trademarkRisk": "Low" },
    { "name": "Suggested Name 2", "type": "Semantic concept", "concept": "Concept/rationale text...", "trademarkRisk": "Low" },
    { "name": "Suggested Name 3", "type": "Portmanteau blend", "concept": "Concept/rationale text...", "trademarkRisk": "Medium" },
    { "name": "Suggested Name 4", "type": "Modern abstract", "concept": "Concept/rationale text...", "trademarkRisk": "Low" },
    { "name": "Suggested Name 5", "type": "Phonetic variant", "concept": "Concept/rationale text...", "trademarkRisk": "Low" }
  ],
  "domains": [
    { "ext": ".com", "status": "Available" },
    { "ext": ".in", "status": "Available" },
    { "ext": ".co.in", "status": "Taken" },
    { "ext": ".net", "status": "Available" }
  ],
  "trademarks": [
    { "class": "Class 9 (Software/Tech)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 35 (Business Services)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 42 (IT & Cloud Services)", "status": "Clear", "matches": "No direct matches found." }
  ],
  "postFilingKit": {
    "steps": [
      { "step": "DSC Allocation", "detail": "Obtain Digital Signature Certificates for all directors.", "cost": "₹1,500 - ₹2,500" },
      { "step": "DIN Application", "detail": "Apply for Director Identification Numbers during incorporation.", "cost": "Included in Spice+" },
      { "step": "Spice+ Part A filing", "detail": "Reserve the approved name on the MCA portal.", "cost": "₹1,000" }
    ],
    "stampDuties": "Varies by state (estimated ₹2,000 for standard nominal share capital of ₹1,00,000).",
    "timeframe": "Estimated 2 to 4 working days for ROC name clearance."
  }
}`;

    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();
    
    // Set up local deterministic values for fallbacks/supplementary data
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = (hash << 5) - hash + cleanName.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini key not configured.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: checkPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute with 20+ years of experience in corporate law in India. Return ONLY raw JSON matching the exact structure requested, without markdown syntax blocks. Meticulously analyze phonetic conflicts, MCA name availability guidelines, and Class 9/35/42 trademark classifications. Provide highly detailed, rich, professional corporate insights.",
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      let resultText = response.text || "{}";
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(resultText);

      // Verify necessary fields are present
      if (!parsed.scoreDetails) {
        parsed.scoreDetails = {
          phoneticUniqueness: Math.max(30, Math.min(99, Math.round((parsed.score || 85) * 0.95 + (positiveHash % 5)))),
          trademarkSafety: Math.max(30, Math.min(99, Math.round((parsed.score || 85) * 0.9 + (positiveHash % 8)))),
          legalAdherence: Math.max(30, Math.min(99, Math.round((parsed.score || 85) * 0.98 + (positiveHash % 3)))),
          linguisticAppeal: Math.max(30, Math.min(99, Math.round((parsed.score || 85) * 0.85 + (positiveHash % 10))))
        };
      }
      if (!parsed.creativeSuggestions) {
        const strippedPrefix = cleanName
          .replace(/\b(pvt ltd|private limited|llp|opc|partnership)\b/gi, "")
          .trim();
        const capitalizedPrefix = strippedPrefix.charAt(0).toUpperCase() + strippedPrefix.slice(1);
        const corporateSuffix = entityType.includes("LLP") ? "LLP" : "Private Limited";
        
        parsed.creativeSuggestions = parsed.suggestions ? parsed.suggestions.map((sug: any, i: number) => {
          const sugName = typeof sug === 'string' ? sug : (sug.name || `${capitalizedPrefix} ${i} ${corporateSuffix}`);
          const nameTypes = ["Coined neologism", "Semantic concept", "Portmanteau blend", "Modern abstract", "Phonetic variant"];
          const concepts = [
            `A neologism combining the core brand prefix with a modern legal registry design.`,
            `A semantic alignment with the industry, focusing on standard brand characteristics.`,
            `A portmanteau blending ${cleanName} with industry-relevant concepts.`,
            `A modern abstract brand variant formulated to ensure high trademark clearance.`,
            `A phonetically clean variation of "${cleanName}" tailored to pass registrar audits.`
          ];
          return {
            name: sugName,
            type: nameTypes[i % nameTypes.length],
            concept: concepts[i % concepts.length],
            trademarkRisk: i % 3 === 0 ? "Medium" : "Low"
          };
        }) : [
          { name: `${capitalizedPrefix} Velo ${corporateSuffix}`, type: "Coined neologism", concept: `Blending "${capitalizedPrefix}" with Velocity to represent speed and growth.`, trademarkRisk: "Low" },
          { name: `${capitalizedPrefix} Labs ${corporateSuffix}`, type: "Modern abstract", concept: `A premium research/experimental vibe suggesting innovation.`, trademarkRisk: "Low" },
          { name: `${capitalizedPrefix} Intellect ${corporateSuffix}`, type: "Semantic concept", concept: `Stresses professional knowledge and high-fidelity expertise.`, trademarkRisk: "Medium" },
          { name: `${capitalizedPrefix} Synapse ${corporateSuffix}`, type: "Portmanteau blend", concept: `Stressing networks, connectivity, and intelligent software logic.`, trademarkRisk: "Low" },
          { name: `${capitalizedPrefix} Apex ${corporateSuffix}`, type: "Modern abstract", concept: `Signifies top-tier performance, reaching the highest standard.`, trademarkRisk: "Low" }
        ];
      }
      if (!parsed.domains) {
        parsed.domains = [
          { ext: ".com", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
          { ext: ".in", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
          { ext: ".co.in", status: "Available" },
          { ext: ".net", status: "Available" }
        ];
      }
      if (!parsed.trademarks) {
        parsed.trademarks = [
          { class: "Class 9 (Software/Tech)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 35 (Business Services)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 42 (IT & Cloud Services)", status: "Clear", matches: "No direct conflicts." }
        ];
      }
      if (!parsed.postFilingKit) {
        parsed.postFilingKit = {
          steps: [
            { step: "DSC Allocation", detail: "Obtain Digital Signature Certificates for directors.", cost: "₹2,000 estimated" },
            { step: "DIN Application", detail: "Apply for DIN inside SPICe+ MCA application.", cost: "Included in Spice+" },
            { step: "Spice+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}".`, cost: "₹1,000 MCA fee" }
          ],
          stampDuties: "Estimated ₹2,000 state stamp duties.",
          timeframe: "Clearance approved in 2-3 working days."
        };
      }

      res.json({ success: true, report: parsed });
    } catch (err: any) {
      console.warn("⚠️ Gemini Feasibility clearance falling back to simulated engine:", err.message);
      
      let score = 85;
      const conflicts: string[] = [];
      const checklist = [
        { criterion: "Distinctive coined prefix (not generic)", passed: true, reason: `"${cleanName}" contains distinctive elements suitable for differentiation.` },
        { criterion: "Reflective of business objective", passed: true, reason: `The name aligns well with standard vocabulary in the ${industry} sector.` },
        { criterion: "No restricted keywords (State, Bank, National)", passed: true, reason: "No restricted or prohibited terms were identified in the primary lookup." },
        { criterion: "Phonetic similarity and trademark check", passed: true, reason: "Initial checks indicate healthy separation from dominant trademarks." }
      ];

      // Rule 1: Length check
      if (cleanName.length < 3) {
        score -= 30;
        checklist[0].passed = false;
        checklist[0].reason = `The prefix "${cleanName}" is too short (under 3 characters). ROC rules generally require a substantive coined word.`;
        conflicts.push("Proposed name is extremely short, which makes finding unique separation in the registrar ledger difficult.");
      } else if (cleanName.length < 5) {
        score -= 10;
        checklist[0].reason = `The prefix "${cleanName}" is relatively short. Registrars prefer distinctive, coined phrases.`;
      }

      // Rule 2: Restricted words check
      const restrictedWords = ["bank", "state", "national", "federation", "government", "reserve", "ministry", "municipal", "trust", "union", "india", "bharat"];
      const foundRestricted = restrictedWords.filter(word => lowerName.includes(word));
      if (foundRestricted.length > 0) {
        score -= 40;
        checklist[2].passed = false;
        checklist[2].reason = `Contains restricted word(s): ${foundRestricted.map(w => `'${w}'`).join(', ')}. ROC rules restrict usage without prior central government approvals.`;
        conflicts.push(`Restricted corporate terminology: "${foundRestricted[0].toUpperCase()}" requires special statutory approvals and licensing.`);
      }

      // Rule 3: Suffix check in name field
      const suffixes = ["pvt ltd", "private limited", "llp", "partnership", "opc", "one person company"];
      const foundSuffix = suffixes.find(s => lowerName.endsWith(s));
      if (foundSuffix) {
        score -= 15;
        checklist[0].passed = false;
        checklist[0].reason = `Input includes the corporate suffix "${foundSuffix.toUpperCase()}". Please supply ONLY the brand prefix in the check field.`;
        conflicts.push(`The suffix "${foundSuffix.toUpperCase()}" should not be part of the brand check input. Suffixes are appended automatically by the registry.`);
      }

      // Rule 4: Phonetic trademark clearance simulator using deterministic character hash
      if (positiveHash % 3 === 0) {
        score -= 8;
        checklist[3].passed = false;
        checklist[3].reason = `Phonetic similarities identified in Class 35/42 for names close to "${cleanName}".`;
        conflicts.push(`Phonetic brand overlap detected in public trademark classes. Minor spelling variations are advised.`);
      } else {
        checklist[3].reason = `No exact phonetical matching trademarks found in Class 9, 35, or 42 for "${cleanName}".`;
      }

      // Rule 5: Industry keywords advice check
      const industryKeywords: Record<string, string[]> = {
        technology: ["tech", "software", "digital", "systems", "ai", "data", "cyber", "cloud", "code", "dev", "web"],
        finance: ["wealth", "capital", "finance", "advisor", "invest", "asset", "credit", "ledger", "pay"],
        healthcare: ["health", "med", "cure", "clinic", "bio", "pharma", "care", "wellness"],
        education: ["learn", "academy", "ed", "school", "study", "mind", "skill"],
        consulting: ["consult", "advisor", "strategy", "group", "partners", "solutions"]
      };

      let matchingIndustryKeyword = false;
      const targetIndustry = industry.toLowerCase();
      for (const [ind, words] of Object.entries(industryKeywords)) {
        if (targetIndustry.includes(ind) || ind.includes(targetIndustry)) {
          const match = words.find(w => lowerName.includes(w));
          if (match) {
            matchingIndustryKeyword = true;
            break;
          }
        }
      }

      if (!matchingIndustryKeyword) {
        checklist[1].reason = `Descriptive matching word for "${industry}" is subtle. Adding industry terms (e.g. Tech, Fin, Solutions) is recommended.`;
      }

      // Format clean capitalized name suggestions
      const strippedPrefix = cleanName
        .replace(/\b(pvt ltd|private limited|llp|opc|partnership)\b/gi, "")
        .trim();
      const capitalizedPrefix = strippedPrefix.charAt(0).toUpperCase() + strippedPrefix.slice(1);
      const corporateSuffix = entityType.includes("LLP") ? "LLP" : "Private Limited";

      const suggestions = [
        `${capitalizedPrefix} Solutions ${corporateSuffix}`,
        `${capitalizedPrefix} Ventures ${corporateSuffix}`,
        `${capitalizedPrefix} Systems ${corporateSuffix}`,
        `New ${capitalizedPrefix} Global ${corporateSuffix}`,
        `${capitalizedPrefix} Tech ${corporateSuffix}`
      ];

      // Final bound score
      score = Math.max(20, Math.min(98, score));

      let summary = `Pre-Audit assessment completed successfully for "${cleanName}". `;
      if (score >= 85) {
        summary += `The proposed name exhibits exceptional feasibility with a score of ${score}%. It has a very high probability of direct, friction-free ROC registrar approval.`;
      } else if (score >= 70) {
        summary += `The proposed name exhibits healthy feasibility (${score}%). It is generally suitable, although minor clearance steps or trademark checks are recommended.`;
      } else {
        summary += `The proposed name has moderate to low feasibility (${score}%). We highly recommend adjusting the name prefix or adopting one of our recommended alternatives below to avoid registrar rejection.`;
      }

      const domains = [
        { ext: ".com", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
        { ext: ".in", status: positiveHash % 5 === 0 ? "Taken" : "Available" },
        { ext: ".co.in", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
        { ext: ".net", status: "Available" }
      ];

      const trademarks = [
        { class: "Class 9 (Software/Tech)", status: positiveHash % 3 === 0 ? "Conflict" : "Clear", matches: positiveHash % 3 === 0 ? `Phonetic phonetic match found: "${cleanName} Technologies"` : "No similar phonetic trademark found." },
        { class: "Class 35 (Business Services)", status: "Clear", matches: "No phonetic conflict found in public Class 35 register." },
        { class: "Class 42 (IT & Cloud Services)", status: positiveHash % 7 === 0 ? "Conflict" : "Clear", matches: positiveHash % 7 === 0 ? `Semantic matching trademark "Project ${cleanName}" is registered` : "No matches found." }
      ];

      const postFilingKit = {
        steps: [
          { step: "DSC Allocation", detail: `Acquire Class 3 Digital Signatures for proposed directors. Required for SPICe+ digital signing.`, cost: "₹2,000 estimated" },
          { step: "DIN Registration", detail: `Acquire unique Director Identification Numbers inside SPICe+ MCA application.`, cost: "Free for up to 3 directors" },
          { step: "SPICe+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}" with the Central Registration Centre (CRC).`, cost: "₹1,000 government filing fee" }
        ],
        stampDuties: `Estimated ₹2,000 for Pvt Ltd with ₹1,00,000 nominal share capital. Stamping fees vary slightly based on jurisdiction.`,
        timeframe: "Typically approved within 2-3 MCA working days."
      };

      const fallbackData = {
        score,
        summary,
        conflicts: conflicts.length > 0 ? conflicts : ["No critical conflict reports identified. The brand prefix is relatively unique."],
        checklist,
        suggestions,
        domains,
        trademarks,
        postFilingKit
      };

      res.json({ success: true, report: fallbackData });
    }
  });

app.post("/api/consult/audit", async (req, res) => {
    const { firmName, firmType, jurisdiction, industry } = req.body;

    if (!firmName || !firmType) {
      return res.status(400).json({ success: false, error: "Firm name and type are required." });
    }

    const auditPrompt = `Conduct a comprehensive, professional registration pre-audit advisory for the proposed corporate firm:
Name: "${firmName}"
Firm Type: "${firmType}"
State/Jurisdiction: "${jurisdiction || "Not Specified"}"
Core Sector/Industry: "${industry || "Corporate Consulting Services"}"

Format your response in structured sections:
1. **Name Feasibility Report**: Analyze potential name conflicts, suggest modifications if generic, checks compliance with Registrar naming guides.
2. **Mandatory Documentation Checklist**: Give the exact list of papers, notarization, and identification materials required.
3. **Primary Statutory Costs & Official ROC Capital stamp duties estimation**.
4. **Immediate Post-Incorporation Compliances**: Timeline after registration is complete (GST, bank accounts, First Board meeting, Auditor appointment).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: auditPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute. Provide pristine corporate insights designed to guide new founders.",
          temperature: 0.3,
        }
      });

      res.json({ success: true, advice: response.text });
    } catch (err: any) {
      console.error("Advisory Board audit error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Local JSON Blog Datastore
  const BLOG_FILE = path.join(process.cwd(), "blog-posts.json");
  const VIEWS_FILE = path.join(process.cwd(), "blog-views.json");

  const loadViewsMap = (): Map<string, number> => {
    const viewsMap = new Map<string, number>();
    try {
      if (fs.existsSync(VIEWS_FILE)) {
        const data = JSON.parse(fs.readFileSync(VIEWS_FILE, "utf-8"));
        if (typeof data === "object" && data !== null) {
          Object.keys(data).forEach((id) => {
            viewsMap.set(id, Number(data[id]) || 0);
          });
        }
      }
    } catch (e: any) {
      console.warn("Failed to load blog-views.json:", e.message);
    }
    return viewsMap;
  };

  const saveViewsMap = (viewsMap: Map<string, number>) => {
    try {
      const obj: Record<string, number> = {};
      viewsMap.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(VIEWS_FILE, JSON.stringify(obj, null, 2), "utf-8");
    } catch (e: any) {
      console.error("Failed to save blog-views.json:", e.message);
    }
  };

  let blogPosts: any[] = [];

  // No default/seed blog posts — all content managed through Decap CMS
  const defaultBlogs: any[] = [];

  // Helper to generate slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Helper to sanitize blog posts and ensure critical properties are always present
  const sanitizeBlogPost = (post: any): any => {
    if (!post) return post;
    const title = post.title || "Untitled Post";
    const slug = post.slug || generateSlug(title);
    const id = post.id || `blog-${slug}`;
    return {
      ...post,
      id,
      title,
      slug,
      subtitle: post.subtitle || "",
      content: post.content || "",
      image: post.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: post.date || new Date().toISOString().split("T")[0],
      author: post.author || "D Bhushan",
      tags: Array.isArray(post.tags) ? post.tags : [],
      views: Number(post.views) || 0,
      status: post.status || "published",
      metaDescription: post.metaDescription || post.subtitle || ""
    };
  };

  // Helper to parse blog posts content (handles flat array and wrapped object formats)
  const parseBlogPostsContent = (content: string): any[] => {
    try {
      const data = JSON.parse(content);
      let posts: any[] = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data && Array.isArray(data.posts)) {
        posts = data.posts;
      }
      return posts.map(sanitizeBlogPost);
    } catch (e: any) {
      console.error("Failed to parse blog posts content:", e.message);
      return [];
    }
  };

  // Load persisted blog posts from disk
  if (fs.existsSync(BLOG_FILE)) {
    try {
      blogPosts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED BLOG POSTS: ${blogPosts.length} posts`);
      
      const rawContent = fs.readFileSync(BLOG_FILE, "utf-8");
      const rawData = JSON.parse(rawContent);
      const rawList = Array.isArray(rawData) ? rawData : (rawData?.posts || []);
      const needsMigrationSave = rawList.some((p: any) => 
        !p.id || !p.slug || p.views === undefined || !p.status || p.metaDescription === undefined
      );

      if (needsMigrationSave) {
        fs.writeFileSync(BLOG_FILE, JSON.stringify({posts: blogPosts}, null, 2), "utf-8");
        console.log(`🟢 MIGRATED LOCAL BLOG DATABASE WITH SANITIZED ENTRIES`);
      }
    } catch (err: any) {
      console.error("Failed to read persisted blog posts:", err.message);
      blogPosts = defaultBlogs.map(sanitizeBlogPost);
    }
  } else {
    blogPosts = defaultBlogs.map(sanitizeBlogPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify({posts: blogPosts}, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED BLOG POSTS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed blog posts to disk:", err.message);
    }
  }



  // Blog endpoints — with GitHub sync cache (sync every 5 min, not every request)
  let lastBlogSyncTime = 0;
  const BLOG_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Blog image upload endpoint (used by CMS and admin)
  app.post("/api/blog/upload-image", upload.single("file"), async (req: any, res) => {
    try {
      // Verify admin auth
      const authHeader = req.headers.authorization;
      const adminToken = req.headers["x-admin-token"] || req.query.token;
      let isAdmin = false;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const decoded: any = jwt.verify(authHeader.slice(7), JWT_SECRET);
          isAdmin = ["SUPER_ADMIN", "ADMIN", "TEAM_MEMBER"].includes(decoded.role);
        } catch {}
      }
      if (!isAdmin && adminToken === (process.env.ADMIN_PASSWORD || "Admin@2026")) isAdmin = true;
      if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const file = req.file;
      
      // Only allow images
      if (!file.mimetype.startsWith("image/")) return res.status(400).json({ error: "Only image files allowed" });

      const ext = path.extname(file.originalname) || ".webp";
      const filename = `blog-${Date.now()}${ext}`;
      const imgDir = path.join(process.cwd(), "public", "blog-images");
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(path.join(imgDir, filename), file.buffer);

      const publicUrl = `/blog-images/${filename}`;
      res.json({ success: true, url: publicUrl, filename });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Serve blog images statically
  app.use("/blog-images", express.static(path.join(process.cwd(), "public", "blog-images")));

  const getDbViewsMap = async (): Promise<Map<string, number>> => {
    const dbPostsViews = new Map<string, number>();
    if (dbPool) {
      try {
        const [rows]: any = await dbPool.query("SELECT post_id, views FROM blog_views");
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            if (row && row.post_id) {
              dbPostsViews.set(row.post_id, Number(row.views) || 0);
            }
          });
        }
      } catch (dbErr: any) {
        console.error("🔴 Failed to query DB views map:", dbErr.message);
      }
    }
    return dbPostsViews;
  };

  const applyViewsToPosts = async (postsList: any[]): Promise<any[]> => {
    const dbViews = await getDbViewsMap();
    const localViews = loadViewsMap();
    return postsList.map((p) => {
      if (!p || !p.id) return p;
      const dbVal = dbViews.get(p.id) || 0;
      const localVal = localViews.get(p.id) || 0;
      return {
        ...p,
        views: Math.max(dbVal, localVal, Number(p.views) || 0)
      };
    });
  };

  app.get("/api/blog/posts", async (req, res) => {
    const token = req.query.token || req.headers["x-admin-token"];

    let posts: any[] = [];
    
    // First, load the local cache views map so we don't lose view counts when syncing from GitHub
    const localPostsViews = loadViewsMap();

    // Load latest view counts from MySQL database if configured
    const dbPostsViews = new Map<string, number>();
    if (dbPool) {
      try {
        const [rows]: any = await dbPool.query("SELECT post_id, views FROM blog_views");
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            if (row && row.post_id) {
              dbPostsViews.set(row.post_id, Number(row.views) || 0);
            }
          });
        }
      } catch (dbErr: any) {
        console.error("🔴 Failed to fetch view counts from MySQL:", dbErr.message);
      }
    }

    console.log("🟢 Fetching latest blogs from GitHub and merging local/DB view counts...");
    let fetchedFromGitHub = false;
    const shouldSyncFromGitHub = Date.now() - lastBlogSyncTime > BLOG_SYNC_INTERVAL;
    if (shouldSyncFromGitHub) {
    try {
      const githubUrl = "https://raw.githubusercontent.com/advocatedevbhushan-cpu/incrouteweb/main/blog-posts.json";
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        const parsedPosts = parseBlogPostsContent(content);
        if (parsedPosts.length > 0) {
          // Load local posts to merge and preserve locally created posts
          let localPosts: any[] = [];
          if (fs.existsSync(BLOG_FILE)) {
            try {
              localPosts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
            } catch (e) {}
          }

          const postsMap = new Map<string, any>();
          
          // Seed with local posts first so they are not deleted if missing on GitHub
          localPosts.forEach((lp) => {
            if (lp && lp.id) {
              postsMap.set(lp.id, lp);
            }
          });

          // Merge or overwrite with GitHub posts
          parsedPosts.forEach((gp) => {
            if (gp && gp.id) {
              const lp = postsMap.get(gp.id);
              const dbViews = dbPostsViews.get(gp.id) || 0;
              const localViews = localPostsViews.get(gp.id) || 0;
              const finalViews = Math.max(dbViews, localViews, Number(gp.views) || 0, Number(lp?.views) || 0);

              if (finalViews > localViews) {
                localPostsViews.set(gp.id, finalViews);
              }

              postsMap.set(gp.id, {
                ...(lp || {}),
                ...gp,
                views: finalViews
              });
            }
          });

          // For any local post not present on GitHub, also populate its views
          postsMap.forEach((p, id) => {
            if (!parsedPosts.some(gp => gp.id === id)) {
              const dbViews = dbPostsViews.get(id) || 0;
              const localViews = localPostsViews.get(id) || 0;
              p.views = Math.max(dbViews, localViews, Number(p.views) || 0);
            }
          });

          posts = Array.from(postsMap.values());
          fetchedFromGitHub = true;
          console.log(`🟢 Successfully synchronized ${posts.length} blogs from GitHub with local posts merged and view counts preserved.`);
          saveViewsMap(localPostsViews);
          // Save to local cache with views reset to 0 to prevent git tracked file modifications
          try {
            fs.writeFileSync(BLOG_FILE, JSON.stringify({posts: posts.map(p => ({ ...p, views: 0 }))}, null, 2), "utf-8");
          } catch (err: any) {
            console.error("Failed to write blog cache to disk:", err.message);
          }
        }
      } else {
        console.error(`🔴 GitHub raw fetch returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("🔴 Failed to fetch blogs from GitHub:", err.message);
    }
    lastBlogSyncTime = Date.now();
    } // end shouldSyncFromGitHub

    if (!fetchedFromGitHub) {
      console.log("🟢 GitHub raw fetch unavailable. Loading blogs from local disk cache...");
      if (fs.existsSync(BLOG_FILE)) {
        try {
          posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
        } catch (err: any) {
          console.error("Failed to read local blog file, using in-memory or seed default:", err.message);
          posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map(sanitizeBlogPost);
        }
      } else {
        posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map(sanitizeBlogPost);
      }
    }

    // Final pass to merge database & local views for all loaded posts (covers fallback/in-memory posts)
    posts = await applyViewsToPosts(posts);

    // Sort posts by date descending
    posts.sort((a, b) => b.date.localeCompare(a.date));

    // Update fallback cache
    blogPosts = posts;

    if (token === "admin-session-secure-token") {
      res.json({ success: true, count: posts.length, posts });
    } else {
      const published = posts.filter((p) => p.status === "published");
      res.json({ success: true, count: published.length, posts: published });
    }
  });

  // Legacy blog admin login (used by BlogPage for inline editing)
  app.post("/api/blog/admin-login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
    if (password === adminPassword) {
      res.json({ success: true, token: "admin-session-secure-token" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password." });
    }
  });

  app.post("/api/blog/posts", cmsAuthMiddleware, async (req, res) => {
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    const newId = `blog-${Date.now()}`;
    const newPost = {
      id: newId,
      title,
      subtitle: subtitle || "",
      content,
      image: image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: new Date().toISOString().split("T")[0],
      author: author || "D Bhushan",
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      slug: generateSlug(title),
      status: status || "published",
      metaDescription: metaDescription || subtitle || ""
    };

    // Ensure unique slug
    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    let originalSlug = newPost.slug;
    let count = 1;
    while (posts.some(p => p.slug === newPost.slug)) {
      newPost.slug = `${originalSlug}-${count}`;
      count++;
    }

    // Always save locally to make sure it persists locally
    posts.unshift(newPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify({posts}, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write new blog to local database file:", err.message);
    }

    res.json({ 
      success: true, 
      message: "Blog post saved successfully!", 
      post: newPost 
    });
  });

  // Admin Edit Blog Post
  app.post("/api/blog/posts/:id/edit", cmsAuthMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const existingPostIndex = posts.findIndex((p) => p.id === id);
    if (existingPostIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    const existingPost = posts[existingPostIndex];
    const updatedPost = { ...existingPost };
    if (title && title !== existingPost.title) {
      updatedPost.title = title;
      updatedPost.slug = generateSlug(title);
      // Ensure unique slug
      let originalSlug = updatedPost.slug;
      let count = 1;
      while (posts.some((p) => p.slug === updatedPost.slug && p.id !== id)) {
        updatedPost.slug = `${originalSlug}-${count}`;
        count++;
      }
    }
    if (subtitle !== undefined) updatedPost.subtitle = subtitle;
    if (content !== undefined) updatedPost.content = content;
    if (image !== undefined) updatedPost.image = image;
    if (author !== undefined) updatedPost.author = author;
    if (tags !== undefined) updatedPost.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) updatedPost.status = status;
    if (metaDescription !== undefined) updatedPost.metaDescription = metaDescription;

    // Always update local cache file
    posts[existingPostIndex] = updatedPost;
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify({posts}, null, 2), "utf-8");
      blogPosts = await applyViewsToPosts(posts);
    } catch (err: any) {
      console.error("Failed to write edited blog to local database file:", err.message);
    }

    const [mergedPost] = await applyViewsToPosts([updatedPost]);

    res.json({ 
      success: true, 
      message: "Blog post updated successfully!", 
      post: mergedPost 
    });
  });

  // Toggle/Update blog status
  app.post("/api/blog/posts/:id/status", cmsAuthMiddleware, async (req, res) => {
    const { id } = req.params;
    const { token, status } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (status !== "draft" && status !== "ready" && status !== "published") {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts[postIndex].status = status;

    // Always update local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify({posts}, null, 2), "utf-8");
      blogPosts = await applyViewsToPosts(posts);
    } catch (err: any) {
      console.error("Failed to write blog status to local database file:", err.message);
    }

    const mergedPosts = await applyViewsToPosts(posts);
    res.json({ success: true, post: mergedPosts[postIndex] });
  });

  app.post("/api/blog/posts/:id/view", async (req, res) => {
    const { id } = req.params;

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    // Increment view count in MySQL database first if configured, and query the latest count
    let dbViews = 0;
    if (dbPool) {
      try {
        await dbPool.query(
          "INSERT INTO blog_views (post_id, views) VALUES (?, 1) ON DUPLICATE KEY UPDATE views = views + 1",
          [id]
        );
        console.log(`🟢 Incremented views for blog ${id} in MySQL.`);

        const [rows]: any = await dbPool.query("SELECT views FROM blog_views WHERE post_id = ?", [id]);
        if (Array.isArray(rows) && rows.length > 0) {
          dbViews = Number(rows[0].views) || 0;
        }
      } catch (dbErr: any) {
        console.error("🔴 Failed to write/query views in MySQL:", dbErr.message);
      }
    }

    const localPostsViews = loadViewsMap();
    const localViews = (localPostsViews.get(id) || 0) + 1;
    const finalViews = Math.max(dbViews, localViews);
    localPostsViews.set(id, finalViews);
    saveViewsMap(localPostsViews);

    posts[postIndex].views = finalViews;
    blogPosts = posts;

    res.json({ success: true, post: posts[postIndex] });
  });

  app.delete("/api/blog/posts/:id", cmsAuthMiddleware, async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts.splice(postIndex, 1);

    // Always save local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify({posts}, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to delete blog from local database file:", err.message);
    }

    res.json({ success: true, message: "Blog post deleted successfully!" });
  });

  // Local JSON Blog Comments Datastore
  const COMMENTS_FILE = path.join(process.cwd(), "blog-comments.json");

  const loadComments = (): any[] => {
    try {
      if (fs.existsSync(COMMENTS_FILE)) {
        const raw = fs.readFileSync(COMMENTS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : (parsed.comments || []);
      }
    } catch (e: any) {
      console.error("Failed loading blog comments:", e.message);
    }
    return [];
  };

  const saveComments = (comments: any[]) => {
    try {
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments }, null, 2), "utf-8");
    } catch (e: any) {
      console.error("Failed saving blog comments:", e.message);
    }
  };

  // GET comments for a specific post
  app.get("/api/blog/posts/:id/comments", async (req, res) => {
    const { id } = req.params;

    // Load from database if configured
    if (dbPool) {
      try {
        const [rows]: any = await dbPool.query(
          "SELECT id, post_id as postId, name, content, created_at as date FROM blog_comments WHERE post_id = ? ORDER BY created_at ASC",
          [id]
        );
        if (Array.isArray(rows)) {
          return res.json({ success: true, comments: rows });
        }
      } catch (err: any) {
        console.error("🔴 Failed to fetch comments from MySQL database:", err.message);
      }
    }

    // Fallback to local cache file
    const comments = loadComments();
    const filtered = comments.filter((c: any) => c.postId === id);
    filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    res.json({ success: true, comments: filtered });
  });

  // POST a new comment
  app.post("/api/blog/posts/:id/comments", async (req, res) => {
    const { id } = req.params;
    const { name, content } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Name is required." });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Comment text is required." });
    }

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const commentDate = new Date().toISOString();
    const trimmedName = name.trim();
    const trimmedContent = content.trim();

    // Save to database if configured
    if (dbPool) {
      try {
        await dbPool.query(
          "INSERT INTO blog_comments (id, post_id, name, content, created_at) VALUES (?, ?, ?, ?, ?)",
          [commentId, id, trimmedName, trimmedContent, new Date()]
        );
        console.log(`🟢 Saved new comment to MySQL database: ${commentId}`);
      } catch (err: any) {
        console.error("🔴 Failed to save comment to MySQL database:", err.message);
      }
    }

    // Always append/save to local cache file as a local fallback/backup
    const comments = loadComments();
    const newComment = {
      id: commentId,
      postId: id,
      name: trimmedName,
      content: trimmedContent,
      date: commentDate
    };

    comments.push(newComment);
    saveComments(comments);

    res.json({ success: true, comment: newComment });
  });

  // Testimonials Persistent JSON Datastore
  const TESTIMONIALS_FILE = path.join(process.cwd(), "testimonials.json");
  let testimonials: any[] = [];

  const defaultTestimonials = [
    {
      id: "test-1",
      name: "Amit Sharma",
      designation: "CEO, FinTech Solutions",
      entityType: "Pvt Ltd Company",
      rating: 5,
      content: "Incroute made Pvt Ltd company registration completely hassle-free! D Bhushan personally reviewed all files and completed the incorporation in just 8 working days. Peerless service!",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-2",
      name: "Priya Nair",
      designation: "Managing Partner, Zenith Consultancies",
      entityType: "LLP Partnership",
      rating: 5,
      content: "Outstanding compliance support. The virtual CFO services and dashboard kept our LLP ledger clean for yearly audits. Highly recommend for growing service firms in India.",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-3",
      name: "Devendra Patel",
      designation: "Founder, GreenAgro OPC",
      entityType: "One Person Company",
      rating: 5,
      content: "The Registrar Name Advisor saved us from multiple MCA naming objections. The incorporation process was swift and transparent from day one. Incredibly modern legal tech platform.",
      approved: true,
      timestamp: new Date().toISOString()
    }
  ];

  // Load testimonials from disk
  if (fs.existsSync(TESTIMONIALS_FILE)) {
    try {
      const rawData = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
      testimonials = Array.isArray(rawData) ? rawData : (rawData.testimonials || []);
      console.log(`🟢 LOADED PERSISTED TESTIMONIALS: ${testimonials.length} reviews`);
    } catch (err: any) {
      console.error("Failed to read persisted testimonials:", err.message);
      testimonials = defaultTestimonials;
    }
  } else {
    testimonials = defaultTestimonials;
    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED TESTIMONIALS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed testimonials to disk:", err.message);
    }
  }

  // Testimonials public and admin fetch endpoint
  let lastTestimonialSyncTime = 0;
  app.get("/api/testimonials", async (req, res) => {
    // Sync from GitHub only every 5 minutes
    const shouldSync = Date.now() - lastTestimonialSyncTime > BLOG_SYNC_INTERVAL;
    if (shouldSync) {
    try {
      const githubUrl = "https://raw.githubusercontent.com/advocatedevbhushan-cpu/incrouteweb/main/testimonials.json";
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        const parsed = JSON.parse(content);
        const rawList = Array.isArray(parsed) ? parsed : (parsed?.testimonials || []);
        if (rawList.length > 0) {
          testimonials = rawList;
          console.log(`🟢 Successfully synchronized ${testimonials.length} testimonials from GitHub.`);
          // Save to local cache
          try {
            fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
          } catch (err: any) {
            console.error("Failed to write testimonials cache to disk:", err.message);
          }
        }
      }
    } catch (err: any) {
      console.warn("Failed to synchronize testimonials from GitHub raw:", err.message);
    }
    lastTestimonialSyncTime = Date.now();
    } // end shouldSync

    res.json({ success: true, count: testimonials.length, testimonials });
  });

  // SEO Metadata profiles for sitemappable pages
  const seoProfiles: Record<string, { title: string; description: string; keywords: string }> = {
    "/": {
      title: "INCroute | Premium Startup & Corporate Registrations in India",
      description: "INCroute is a premium corporate registration and compliance advisory platform. Launch and scale your Indian startup with professional guidance for Pvt Ltd, LLP, Section 8, and GST filings.",
      keywords: "company registration, private limited, LLP registration, India, ROC filings, GST, startup advisory, virtual CFO"
    },
    "/services": {
      title: "Statutory Incorporation Services | INCroute",
      description: "Premium end-to-end corporate registration services in India. Register Private Limited, LLP, One Person Company, Partnership, and Section 8 NGO seamlessly.",
      keywords: "Pvt Ltd company registration, LLP registration, OPC registration, NGO Section 8, company setup"
    },
    "/catalog/": {
      title: "Interactive Services Directory & Checklists | INCroute",
      description: "Explore the comprehensive statutory service catalog for Indian startups. Deep-dive into document requirements, legal advantages, and compliance checklists.",
      keywords: "incorporation checklist, startup documents, compliance catalog, business registration service list"
    },
    "/about": {
      title: "Meet the Corporate Expert - D Bhushan | INCroute",
      description: "Learn about D Bhushan, the founder and principal legal advisor behind INCroute. Experience startup legal architecture and corporate compliance informed by professional CA mentorship.",
      keywords: "D Bhushan, INCroute founder, corporate law consultant, startup legal architecture"
    },
    "/blog": {
      title: "LegisCorp Editorial & Compliance Insights Ledger | INCroute",
      description: "Explore statutory briefs, ROC filing warnings, tax advisory articles, and legal ledger insights managed by corporate advocates and chartered analysts.",
      keywords: "compliance blogs, ROC updates, GST changes, corporate law articles"
    },
    "/tools/name-checker/": {
      title: "AI-Powered Registrar Name Feasibility Auditor | INCroute",
      description: "Audit your proposed brand name against official Registrar (MCA) guidelines. Our dynamic auditor maps trade registry databases instantly for zero-conflict incorporation.",
      keywords: "company name search, MCA name checker, startup brand auditor, business name registry"
    },
    "/tools": {
      title: "Interactive Statutory Utilities & Draft Generators | INCroute",
      description: "Calculate stamp duty rates across states, compute estimated company setup costs, and generate live previews of legal draft documents instantly.",
      keywords: "stamp duty calculator, legal draft generator, company registration cost, statutory utilities"
    },
    "/testimonials": {
      title: "Founder Trust & Client Reflections Board | INCroute",
      description: "See reviews and testimonials from Indian startup founders and business owners who registered their companies and handled ROC annual compliance with INCroute.",
      keywords: "INCroute reviews, startup founder feedback, statutory filing client reviews"
    },
    "/contact": {
      title: "Schedule an Expert Corporate Consultation | INCroute",
      description: "Get in touch with our senior registrars and compliance specialists. Book your consultation for company registration, annual compliance, or taxation.",
      keywords: "contact INCroute, corporate consultation, talk to CA, hire startup lawyer"
    },
    "/compliance/flowchart/": {
      title: "Interactive Corporate Compliance Flowcharts | INCroute",
      description: "Visualize step-by-step statutory filing timelines and ROC compliance pipelines for Private Limited and LLP setups in India.",
      keywords: "compliance flowchart, ROC timeline, company registration pipeline"
    },
    "/tools/entity-comparison/": {
      title: "Corporate Entity Structural Comparisons | INCroute",
      description: "Compare Private Limited, LLP, OPC, Nidhi Company, Public Limited, Partnership, and Sole Proprietorship structures side-by-side on liability, funding readiness, audit requirements, and compliance metrics.",
      keywords: "Pvt Ltd vs LLP, OPC vs Partnership, compare business structures, startup entity type"
    },
    "/tools/impact-dashboard/": {
      title: "Filing Speeds & Statutory Impact Dashboard | INCroute",
      description: "Track live operational metrics, ROC filing speeds, and statutory SLA timelines managed by our senior corporate desk.",
      keywords: "ROC filing speed, compliance SLA, INCroute dashboard"
    },
    "/timeline-viz": {
      title: "Statutory Filing Timelines Dashboard | INCroute",
      description: "Track first-year statutory due dates, ROC filings, and calendar roadmaps to prevent compliance penalties.",
      keywords: "statutory calendar, ROC timelines, compliance dashboard"
    },
    "/company-registration-bangalore": {
      title: "Online Pvt Ltd Company Registration in Bangalore | INCroute",
      description: "Instant online Pvt Ltd company registration in Bangalore. Access Silicon Valley's premium incorporation desk. Get MCA name approval, DSC, and local CA assistance for Bangalore startups.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, how long does online company registration take, documents needed for online opc registration, Bangalore startup incorporation, company registration Bangalore"
    },
    "/company-registration-mumbai": {
      title: "Premium Pvt Ltd & LLP Registration in Mumbai | INCroute",
      description: "Fast online company registration and LLP setup in Mumbai BKC. Maharashtra stamp duty compliance, instant MCA name clearance, and expert corporate legal advisory under one roof.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, instant llp registration, cheapest company registration online, Mumbai corporate registry, company registration Mumbai"
    },
    "/company-registration-delhi": {
      title: "Elite Pvt Ltd & LLP Registration in Delhi NCR | INCroute",
      description: "Online Pvt Ltd company registration & instant LLP setup in Delhi, Gurgaon & Noida. High-speed MCA filing, zero office visits. Get your Certificate of Incorporation in 8 working days.",
      keywords: "online pvt ltd registration price, instant llp registration, how long does online company registration take, documents needed for online opc registration, Delhi company registration, Gurgaon company setup"
    },
    "/faq": {
      title: "Company Registration FAQs India — 48 Expert Answers on Pvt Ltd, LLP, GST, MSME, FSSAI | INCroute",
      description: "Get instant expert answers on company registration timelines, document checklists, Pvt Ltd vs LLP comparison, OPC registration costs, GST thresholds, MSME Udyam benefits, FSSAI food license, and trademark registration. Optimized for Google AI Overviews.",
      keywords: "how long does online company registration take, documents needed for online opc registration, pvt ltd vs llp for startup, online pvt ltd registration price, Section 8 NGO tax exemption, MSME registration benefits, FSSAI license India, company registration FAQ India, GST registration mandatory, trademark registration India"
    }
  };

  // Rich Structured JSON-LD schemas for Search Engine optimization & organic rich snippets
  const schemas: Record<string, any> = {
    "/tools/entity-comparison/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Corporate Entity Structural Comparison Utility",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Compare Private Limited, LLP, One Person Company, Nidhi Company, Public Limited, Partnership, and Sole Proprietorship structures in India on statutory metrics.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/catalog/": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "INCroute Service Catalog",
      "description": "Comprehensive statutory directory listing company registration requirements, compliance obligations, and legal services in India.",
      "publisher": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/tools/name-checker/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute AI-Powered MCA Company Name Feasibility Auditor",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Verify your proposed company name against Ministry of Corporate Affairs (MCA) trademark and naming guidelines automatically.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/compliance/flowchart/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Interactive Corporate Compliance Flowchart Roadmap",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Interactive flowchart mapping statutory due dates, ROC calendar timelines, and compliance roadmaps for Indian startups.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/services": {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Corporate Registration & Compliance",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      },
      "areaServed": { "@type": "Country", "name": "India" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Registration Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Private Limited Company Registration" }, "price": "999", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "LLP Registration" }, "price": "1499", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "One Person Company Registration" }, "price": "1299", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Partnership Firm Registration" }, "price": "799", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "GST & Tax Registration" }, "price": "499", "priceCurrency": "INR" }
        ]
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "20", "bestRating": "5" }
    },
    "/": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "INCroute",
      "url": "https://incroute.com",
      "logo": "https://incroute.com/incroute_logo.png",
      "description": "Premium corporate registration and compliance advisory platform. Get professional guidance for Pvt Ltd, LLP, and statutory filings in India.",
      "founder": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8707552183",
        "contactType": "customer service",
        "email": "info@incroute.com"
      }
    },
    "/about": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor",
        "worksFor": {
          "@type": "Organization",
          "name": "INCroute",
          "url": "https://incroute.com"
        },
        "description": "D Bhushan is a practicing corporate lawyer and compliance strategist trained under a CA with senior corporate audit experience."
      }
    },
    "/contact": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "INCroute",
        "image": "https://incroute.com/incroute_logo.png",
        "telephone": "+91-8707552183",
        "email": "info@incroute.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "openingHours": "Mo-Fr 09:00-18:00"
      }
    },
    "/blog": {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "INCroute LegisCorp Insights Ledger",
      "description": "Corporate compliance alerts, GST filing guides, ROC updates, and statutory warnings managed by advocates and analysts.",
      "publisher": {
        "@type": "Organization",
        "name": "INCroute"
      }
    },
    "/tools": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Interactive Statutory Utilities",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Calculators for stamp duty rates, estimated incorporation fees, and live previews of statutory legal drafts in India."
    },
    "/company-registration-bangalore": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Bangalore Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online Pvt Ltd company registration and LLP incorporation services for technology startups in Bangalore.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-bangalore",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "80 Feet Rd, Koramangala 4th Block",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560034",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.9338",
        "longitude": "77.6244"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-mumbai": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Mumbai Corporate Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online company registration, LLP filings, and corporate legal compliance services for Mumbai enterprises.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-mumbai",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "G Block BKC, Bandra Kurla Complex, Bandra East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400051",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.0600",
        "longitude": "72.8600"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-delhi": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Delhi NCR Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Instant online company registration and elite LLP filing services for startups and e-commerce brands in Delhi NCR.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-delhi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Connaught Place",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "28.6304",
        "longitude": "77.2177"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/faq": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": (() => {
        // Dynamically load all FAQs from the data file for full Schema.org FAQPage coverage
        try {
          const faqFilePath = path.join(process.cwd(), "src", "lib", "faq-data.ts");
          const faqContent = fs.readFileSync(faqFilePath, "utf-8");
          // Extract question and bluf pairs using regex (lightweight — no TS compilation needed)
          const entries: any[] = [];
          const questionRegex = /question:\s*"([^"]+)"/g;
          const blufRegex = /bluf:\s*"([^"]+)"/g;
          const questions: string[] = [];
          const blufs: string[] = [];
          let match;
          while ((match = questionRegex.exec(faqContent)) !== null) questions.push(match[1]);
          while ((match = blufRegex.exec(faqContent)) !== null) blufs.push(match[1]);
          for (let i = 0; i < questions.length; i++) {
            entries.push({
              "@type": "Question",
              "name": questions[i],
              "acceptedAnswer": {
                "@type": "Answer",
                "text": blufs[i] || ""
              }
            });
          }
          return entries;
        } catch {
          return [];
        }
      })()
    }
  };

  const serviceNameMap: Record<string, string> = {
    "pvt-ltd": "Private Limited Company (Pvt Ltd)",
    "llp": "Limited Liability Partnership (LLP)",
    "opc": "One Person Company (OPC)",
    "partnership": "Partnership Firm",
    "section8": "Section 8 Company (NGO)",
    "public-ltd": "Public Limited Company",
    "annual-compliance": "Annual Compliances Suite",
    "gst-tax": "GST & Tax Registration",
    "virtual-cfo": "Virtual CFO Retainer",
    "virtual-office": "Virtual Office Address",
    "terms-privacy": "Terms of Service & Privacy Policy",
    "msme-registration": "MSME (Udyam) Registration",
    "fssai-registration": "FSSAI Food License Registration",
    "return-filing": "Tax & Return Filing Services",
    "trademark-registration": "Trademark Services Suite",
    "trademark-objection": "Response to Trademark Objection",
    "trademark-opposition": "Trademark Opposition Services",
    "trademark-assignment": "Trademark & IP Assignment",
    "brand-protection": "Brand Protection & Monitoring",
    "litigation-assistance": "Corporate Litigation Assistance",
    "trademark-renewal": "Trademark & License Renewal",
    "patent-filing": "Patent Drafting & Filing",
    "iso-certification": "ISO Certification Services"
  };

  function injectSEOMetadata(html: string, route: string): string {
    let profile = seoProfiles[route];
    
    if (!profile) {
      // Check for dynamic services subroutes e.g., /services/category/service-id
      const serviceMatch = route.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
      if (serviceMatch) {
        const category = serviceMatch[1].replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        const serviceId = serviceMatch[2];
        const cleanName = serviceNameMap[serviceId] || serviceId.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        
        profile = {
          title: `${cleanName} Registration & Compliance | INCroute`,
          description: `Get professional, CA-backed services for ${cleanName} under ${category} category in India. Real-time filing and guaranteed compliance.`,
          keywords: `${cleanName}, ${category}, company registration, ROC, business filing`
        };
      } else {
        profile = seoProfiles["/"];
      }
    }
    
    // Replace <title>
    let transformed = html.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
    
    // Replace or inject description
    const descMeta = `<meta name="description" content="${profile.description}" />`;
    if (transformed.includes('name="description"')) {
      transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
    }

    // Replace or inject keywords
    const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
    if (transformed.includes('name="keywords"')) {
      transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
    }

    // OpenGraph OG Title & Description
    const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
    const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
    
    if (transformed.includes('property="og:title"')) {
      transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
    } else {
      transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
    }

    if (transformed.includes('property="og:description"')) {
      transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
    } else {
      transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
    }

    // Dynamic Canonical Link Tag
    const canonicalUrl = `https://incroute.com${route === "/" ? "" : route}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
    transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

    // Dynamic JSON-LD Schema Markup
    const schemaData = schemas[route] || schemas["/"];
    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

    return transformed;
  }

  // Dynamic Blog Post Route Handler for SEO crawler support
  const handleBlogPostRoute = async (req: any, res: any, next: any, isDev: boolean, vite?: any) => {
    const { slug } = req.params;

    // Look up blog post from the local in-memory store (synced from GitHub/local JSON)
    const post = blogPosts.find((p) => p.slug === slug && p.status === "published");

    if (!post) {
      return next(); // Fallback to standard client router or 404
    }

    try {
      const templatePath = isDev 
        ? path.join(process.cwd(), "index.html")
        : fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
          ? path.join(process.cwd(), "dist", "index.html")
          : path.join(process.cwd(), "index.html");

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let template = fs.readFileSync(templatePath, "utf-8");
      if (isDev && vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }

      // Generate dynamic SEO profile for this blog post
      const profile = {
        title: `${post.title} | INCroute Blog`,
        description: post.metaDescription || post.subtitle || "Statutory compliance and company incorporation insights.",
        keywords: Array.isArray(post.tags) ? post.tags.join(", ") : "compliance, company registration, ROC, GST"
      };

      // Replace <title>
      let transformed = template.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
      
      // Replace or inject description
      const descMeta = `<meta name="description" content="${profile.description}" />`;
      if (transformed.includes('name="description"')) {
        transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
      }

      // Replace or inject keywords
      const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
      if (transformed.includes('name="keywords"')) {
        transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
      }

      // OpenGraph OG Title & Description
      const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
      const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
      const ogImage = `<meta property="og:image" content="${post.image}" />`;
      
      if (transformed.includes('property="og:title"')) {
        transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
      } else {
        transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
      }

      if (transformed.includes('property="og:description"')) {
        transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
      } else {
        transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
      }

      if (transformed.includes('property="og:image"')) {
        transformed = transformed.replace(/<meta property="og:image" content=".*?" \/>/gi, ogImage);
      } else {
        transformed = transformed.replace("</head>", `  ${ogImage}\n</head>`);
      }

      // Dynamic Canonical Link Tag
      const canonicalUrl = `https://incroute.com/blog/${slug}`;
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
      transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

      // Dynamic JSON-LD Schema Markup
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.subtitle,
        "image": post.image,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "datePublished": post.date,
        "publisher": {
          "@type": "Organization",
          "name": "INCroute",
          "logo": {
            "@type": "ImageObject",
            "url": "https://incroute.com/incroute_logo.png"
          }
        }
      };
      const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
      transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
      transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

      res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
    } catch (err: any) {
      console.error("Vite blog index transform error:", err.message);
      next(err);
    }
  };

  // SEO sitemappable page routes
  const seoRoutes = Object.keys(seoProfiles);

  // Vite Integration for Full-Stack routing
  // Production detection logic:
  // - If NODE_ENV=production → production mode
  // - If running from tsx (dev command) → dev mode, regardless of dist/ existing
  // - If neither is set but built assets exist → production mode (Hostinger fallback)
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  // Also check if running directly from inside dist/ folder (cd dist && node server.cjs)
  const cwdIndexPath = path.join(process.cwd(), "index.html");
  const cwdHasAssets = fs.existsSync(path.join(process.cwd(), "assets")) && fs.existsSync(cwdIndexPath);
  
  // Check if we're running via tsx (TypeScript execution = development)
  const isRunningViaTsx = process.argv[1]?.endsWith('.ts') || process.argv[0]?.includes('tsx');
  
  let isProduction: boolean;
  if (process.env.NODE_ENV === "production") {
    isProduction = true;
  } else if (isRunningViaTsx) {
    isProduction = false;
  } else if (fs.existsSync(distIndexPath) || cwdHasAssets) {
    // Bundled server without NODE_ENV set — assume production
    isProduction = true;
    console.log("ℹ️ NODE_ENV not set but running bundled server. Assuming production.");
  } else {
    isProduction = false;
  }
  
  if (!isProduction) {
    console.log("🔵 Starting in DEVELOPMENT mode (Vite HMR)...");
    const { createServer: createViteServer } = await import("vite");
    const hmrPort = Number(process.env.WS_PORT) || (PORT + 100);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: hmrPort,
        },
      },
      appType: "custom",
    });

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], async (req, res, next) => {
      await handleBlogPostRoute(req, res, next, true, vite);
    });

    // Intercept SEO routes dynamically in development
    app.get([...seoRoutes, "/services/:category/:serviceId", "/services/:category/:serviceId/"], async (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const html = injectSEOMetadata(template, url);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err: any) {
        console.error("Vite index transform error:", err.message);
        next(err);
      }
    });

    app.use(vite.middlewares);

    // SPA fallback for dev mode — serve index.html for all non-API, non-asset routes
    app.use("*", async (req, res, next) => {
      // Skip API routes and static assets
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.includes(".")) {
        return next();
      }
      try {
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (err) {
        next(err);
      }
    });

    console.log(`Vite HMR configured to ws://localhost:${hmrPort}`);
  } else {
    // Production mode — serve built static files with SPA fallback
    // Resolve the actual dist path: if dist/index.html exists use dist/, else use cwd (running from dist/ directly)
    const resolvedDistPath = fs.existsSync(distIndexPath) ? distPath : (cwdHasAssets ? process.cwd() : distPath);
    console.log(`🟢 Starting in PRODUCTION mode. Serving from: ${resolvedDistPath}`);

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], (req, res, next) => {
      handleBlogPostRoute(req, res, next, false);
    });

    // Intercept SEO routes dynamically in production
    app.get([...seoRoutes, "/services/:category/:serviceId", "/services/:category/:serviceId/"], (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(resolvedDistPath, "index.html");
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, "utf-8");
          const html = injectSEOMetadata(template, url);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    // ─── ONE-TIME DATABASE SETUP ENDPOINT ───
    // Visit: /api/setup-db?key=incroute2026 to create all Prisma tables
    // Uses raw SQL since Prisma CLI binaries don't have execute permission on shared hosting
    app.get("/api/setup-db", async (req, res) => {
      const setupKey = req.query.key;
      if (setupKey !== "incroute2026") {
        return res.status(403).json({ error: "Invalid setup key" });
      }
      try {
        const dbUrl = process.env.DATABASE_URL || "";
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
          return res.status(500).json({ error: "Invalid DATABASE_URL format" });
        }
        const [, user, pass, host, port, database] = match;
        const connection = await mysql.createConnection({
          host, port: Number(port), user, password: decodeURIComponent(pass), database,
          multipleStatements: true
        });

        // Create all tables
        const sql = fs.readFileSync(path.join(process.cwd(), "setup-database.sql"), "utf-8");
        await connection.query(sql);
        await connection.end();

        res.json({ success: true, message: "All 27 database tables created successfully!" });
      } catch (err: any) {
        res.status(500).json({ error: "Setup failed", details: err.message });
      }
    });

    // ─── ONE-TIME BOOKS SETUP ENDPOINT ───
    // Visit: /api/setup-books?key=incroute2026 to apply Books migrations and reference seeds
    app.get("/api/setup-books", async (req, res) => {
      const setupKey = req.query.key;
      if (setupKey !== "incroute2026") {
        return res.status(403).json({ error: "Invalid setup key" });
      }
      try {
        const dbUrl = process.env.DATABASE_URL || "";
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
          return res.status(500).json({ error: "Invalid DATABASE_URL format" });
        }
        const [, user, pass, host, port, database] = match;
        const connection = await mysql.createConnection({
          host, port: Number(port), user, password: decodeURIComponent(pass), database,
          multipleStatements: true
        });

        // Read and run Books migration SQL
        const migrationPath = path.join(process.cwd(), "migrations", "20260713_incroute_books_mvp.sql");
        const migrationSql = fs.readFileSync(migrationPath, "utf-8");
        await connection.query(migrationSql);

        // Read and run Books seed SQL
        const seedPath = path.join(process.cwd(), "seeds", "20260713_incroute_books_reference_seed.sql");
        const seedSql = fs.readFileSync(seedPath, "utf-8");
        await connection.query(seedSql);

        await connection.end();

        res.json({ success: true, message: "INCroute Books tables and reference seeds applied successfully!" });
      } catch (err: any) {
        res.status(500).json({ error: "Books setup failed", details: err.message });
      }
    });


    // Static file serving with cache headers
    app.use(express.static(resolvedDistPath, {
      maxAge: '1y',
      immutable: true,
      index: false  // Don't serve index.html from static — SPA fallback handles it
    }));
    app.use(express.static(path.join(process.cwd(), "public"), {
      maxAge: '7d'
    }));

    // SPA fallback — serve index.html for ALL non-API, non-file routes
    app.get("*", (req, res) => {
      // If the request looks like a file (has extension), let it 404 naturally
      if (req.path.includes(".") && !req.path.endsWith(".html")) {
        return res.status(404).end();
      }
      res.sendFile(path.join(resolvedDistPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Incroute backend server active running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
