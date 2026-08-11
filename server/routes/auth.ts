import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function createAuthRouter(getPlatformConnection: () => Promise<any>, JWT_SECRET: string) {
  const router = Router();

  const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

  // Clean up old rate limit entries every 15 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of loginAttempts.entries()) {
      if (now - data.lastAttempt > 30 * 60 * 1000) loginAttempts.delete(key);
    }
  }, 15 * 60 * 1000);

  function checkRateLimit(identifier: string) {
    const now = Date.now();
    const entry = loginAttempts.get(identifier);
    if (!entry) return { allowed: true, remainingAttempts: 5, lockedUntilMs: 0 };
    if (entry.lockedUntil > now) return { allowed: false, remainingAttempts: 0, lockedUntilMs: entry.lockedUntil - now };
    if (now - entry.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: 5, lockedUntilMs: 0 };
    }
    if (entry.count >= 5) {
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

  // Prevent browser/CDN caching on auth endpoints
  router.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // User Registration
  router.post("/register", async (req, res) => {
    let conn;
    try {
      const { email, password, firstName, lastName, phone, role: requestedRole } = req.body;
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      // Public registration only allows CLIENT role to prevent privilege escalation
      const role = requestedRole === "TEAM_MEMBER" || requestedRole === "ADMIN" || requestedRole === "SUPER_ADMIN" ? "CLIENT" : "CLIENT";

      conn = await getPlatformConnection();
      const [existing]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const id = "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await conn.query(
        `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`,
        [id, email, passwordHash, firstName, lastName || "", phone || null, role, now, now]
      );

      const sessionId = "sess_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      await conn.query(
        `INSERT INTO \`Session\` (id, userId, ipAddress, userAgent, isActive, createdAt, lastActive, expiresAt)
         VALUES (?, ?, ?, ?, 1, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [sessionId, id, req.ip || null, req.headers["user-agent"] || null, now, now]
      );

      const accessToken = jwt.sign({ userId: id, email, role, sessionId }, JWT_SECRET, { expiresIn: "24h" });
      const refreshToken = jwt.sign({ userId: id, sessionId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        user: { id, email, firstName, lastName: lastName || "", role },
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Registration failed", details: err.message });
    } finally {
      if (conn) conn.release();
    }
  });

  // User Login
  router.post("/login", async (req, res) => {
    let conn;
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      if (email.length > 191 || password.length > 128) {
        return res.status(400).json({ error: "Invalid input length" });
      }

      const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const rateLimitKey = `${email}:${clientIp}`;
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        const minutes = Math.ceil(rateCheck.lockedUntilMs / 60000);
        return res.status(429).json({ error: `Too many failed attempts. Account locked for ${minutes} minute(s).` });
      }

      conn = await getPlatformConnection();
      const [users]: any = await conn.query(
        "SELECT id, email, passwordHash, firstName, lastName, role, isActive FROM `User` WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 });
      }

      const user = users[0];
      if (!user.isActive) {
        return res.status(403).json({ error: "Account is deactivated. Please contact support." });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 });
      }

      clearAttempts(rateLimitKey);
      const accessExpiry = rememberMe ? "7d" : "24h";
      const refreshExpiry = rememberMe ? "30d" : "7d";
      const sessionId = "sess_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await conn.query(
        `INSERT INTO \`Session\` (id, userId, ipAddress, userAgent, isActive, createdAt, lastActive, expiresAt)
         VALUES (?, ?, ?, ?, 1, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [sessionId, user.id, clientIp, req.headers["user-agent"] || null, now, now]
      );

      const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role, sessionId }, JWT_SECRET, { expiresIn: accessExpiry });
      const refreshToken = jwt.sign({ userId: user.id, sessionId, type: "refresh" }, JWT_SECRET, { expiresIn: refreshExpiry });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Login failed. Please try again later." });
    } finally {
      if (conn) conn.release();
    }
  });

  // Current User / Me
  router.get("/me", async (req, res) => {
    let conn;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
      const token = authHeader.slice(7);
      const decoded: any = jwt.verify(token, JWT_SECRET);

      conn = await getPlatformConnection();
      const [users]: any = await conn.query(
        "SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM `User` WHERE id = ?",
        [decoded.userId]
      );

      if (users.length === 0 || !users[0].isActive) {
        return res.status(401).json({ error: "User not found or inactive" });
      }

      res.json({ success: true, user: users[0] });
    } catch (err: any) {
      res.status(401).json({ error: "Invalid or expired token" });
    } finally {
      if (conn) conn.release();
    }
  });

  // Logout
  router.post("/logout", async (req, res) => {
    let conn;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.sessionId) {
          conn = await getPlatformConnection();
          await conn.query("UPDATE `Session` SET isActive = 0 WHERE id = ?", [decoded.sessionId]);
        }
      }
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    } finally {
      if (conn) conn.release();
    }
  });

  return router;
}
