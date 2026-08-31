import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { withPlatformConnection } from "../db";
import { getJwtSecret, AuthUser, authenticateToken } from "../middleware/auth";

export function createAuthRouter() {
  const router = Router();
  const JWT_SECRET = getJwtSecret();

  const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

  // Clean up old rate limit entries every 15 minutes
  const _cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of loginAttempts.entries()) {
      if (now - data.lastAttempt > 30 * 60 * 1000) loginAttempts.delete(key);
    }
  }, 15 * 60 * 1000);
  // Expose cleanup for graceful shutdown and testing
  router._cleanupInterval = _cleanupInterval;

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
  router.post("/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone, role: requestedRole } = req.body;
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      if (email.length > 191 || password.length > 128) {
        return res.status(400).json({ error: "Invalid input length" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      // Public registration assigns CLIENT role by default
      const role = requestedRole === "TEAM_MEMBER" || requestedRole === "ADMIN" || requestedRole === "SUPER_ADMIN" ? "CLIENT" : "CLIENT";

      const result = await withPlatformConnection(async (conn) => {
        const [existing]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [email]);
        if (existing.length > 0) {
          return { error: "An account with this email already exists", status: 409 };
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

        return {
          status: 201,
          data: {
            success: true,
            user: { id, email, firstName, lastName: lastName || "", role },
            accessToken,
            refreshToken,
          }
        };
      });

      if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
      }

      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error("[Auth Register Error]:", err);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  });

  // User Login
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      if (email.length > 191 || password.length > 128) {
        return res.status(400).json({ error: "Invalid input length" });
      }

      const clientIp = req.ip || (req.headers["x-forwarded-for"] as string) || "unknown";
      const rateLimitKey = `${email}:${clientIp}`;
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        const minutes = Math.ceil(rateCheck.lockedUntilMs / 60000);
        return res.status(429).json({ error: `Too many failed attempts. Account locked for ${minutes} minute(s).` });
      }

      const accessExpiry = rememberMe ? "7d" : "24h";
      const refreshExpiry = rememberMe ? "30d" : "7d";

      // Fallback admin login (allows recovery even if database is offline)
      const fallbackAdminEmail = process.env.ADMIN_EMAIL || "d.bhushan@incroute.com";
      const fallbackAdminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
      if (email === fallbackAdminEmail && password === fallbackAdminPassword) {
        clearAttempts(rateLimitKey);
        const accessToken = jwt.sign(
          { userId: "admin_fallback", email, role: "SUPER_ADMIN", sessionId: "fallback_" + Date.now() },
          JWT_SECRET,
          { expiresIn: accessExpiry }
        );
        const refreshToken = jwt.sign(
          { userId: "admin_fallback", sessionId: "fallback_" + Date.now(), type: "refresh" },
          JWT_SECRET,
          { expiresIn: refreshExpiry }
        );
        return res.json({
          success: true,
          user: { id: "admin_fallback", email, firstName: "Dev", lastName: "Bhushan", role: "SUPER_ADMIN" },
          accessToken,
          refreshToken
        });
      }

      const loginResult = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query(
          "SELECT id, email, passwordHash, firstName, lastName, role, isActive FROM `User` WHERE email = ?",
          [email]
        );

        if (users.length === 0) {
          recordFailedAttempt(rateLimitKey);
          return { status: 401, error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 };
        }

        const user = users[0];
        if (!user.isActive) {
          return { status: 403, error: "Account is deactivated. Please contact support." };
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          recordFailedAttempt(rateLimitKey);
          return { status: 401, error: "Invalid email or password", remainingAttempts: rateCheck.remainingAttempts - 1 };
        }

        clearAttempts(rateLimitKey);

        const now = new Date().toISOString().slice(0, 23).replace("T", " ");
        await conn.query("UPDATE `User` SET lastLoginAt = ? WHERE id = ?", [now, user.id]);

        const sessionId = "sess_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        const sessionDays = rememberMe ? 30 : 7;
        const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 23).replace("T", " ");

        await conn.query(
          `INSERT INTO \`Session\` (id, userId, ipAddress, userAgent, isActive, createdAt, lastActive, expiresAt)
           VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
          [sessionId, user.id, clientIp, req.headers["user-agent"] || null, now, now, expiresAt]
        );

        const accessToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role, sessionId },
          JWT_SECRET,
          { expiresIn: accessExpiry }
        );
        const refreshToken = jwt.sign(
          { userId: user.id, sessionId, type: "refresh" },
          JWT_SECRET,
          { expiresIn: refreshExpiry }
        );

        return {
          status: 200,
          data: {
            success: true,
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
            accessToken,
            refreshToken,
          }
        };
      });

      if (loginResult.error) {
        return res.status(loginResult.status).json({ error: loginResult.error, remainingAttempts: loginResult.remainingAttempts });
      }

      return res.json(loginResult.data);
    } catch (err: any) {
      console.error("[Auth Login Error]:", err);
      res.status(500).json({ error: "Login failed. Please try again later." });
    }
  });

  // Token Refresh
  router.post("/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      if (decoded.type !== "refresh") {
        return res.status(401).json({ error: "Invalid token type" });
      }

      if (decoded.userId === "admin_fallback") {
        const accessToken = jwt.sign(
          { userId: "admin_fallback", email: process.env.ADMIN_EMAIL || "d.bhushan@incroute.com", role: "SUPER_ADMIN", sessionId: decoded.sessionId },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        return res.json({ success: true, accessToken });
      }

      const result = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, email, role, isActive FROM `User` WHERE id = ?", [decoded.userId]);
        if (users.length === 0 || !users[0].isActive) {
          return { status: 401, error: "User inactive or not found" };
        }
        const user = users[0];
        const accessToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role, sessionId: decoded.sessionId },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        return { status: 200, data: { success: true, accessToken } };
      });

      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.json(result.data);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  });

  // Current User / Me
  router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (req.user?.userId === "admin_fallback") {
        return res.json({
          success: true,
          user: { id: "admin_fallback", email: req.user.email, firstName: "Dev", lastName: "Bhushan", role: "SUPER_ADMIN", isActive: 1 }
        });
      }

      const result = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query(
          "SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM `User` WHERE id = ?",
          [req.user!.userId]
        );

        if (users.length === 0 || !users[0].isActive) {
          return { status: 401, error: "User not found or inactive" };
        }

        return { status: 200, user: users[0] };
      });

      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.json({ success: true, user: result.user });
    } catch (err: any) {
      console.error("[Auth /me Error]:", err);
      res.status(500).json({ error: "Failed to retrieve user profile" });
    }
  });

  // Logout
  router.post("/logout", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.sessionId && !decoded.sessionId.startsWith("fallback_")) {
            await withPlatformConnection(async (conn) => {
              await conn.query("UPDATE `Session` SET isActive = 0 WHERE id = ?", [decoded.sessionId]);
            });
          }
        } catch {}
      }
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  });

  // Change password for authenticated users
  router.post("/change-password", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current password and new password required" });
      if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });

      if (req.user?.userId === "admin_fallback") {
        return res.status(400).json({ error: "Cannot change password for environment fallback admin" });
      }

      const result = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, passwordHash FROM `User` WHERE id = ?", [req.user!.userId]);
        if (users.length === 0) return { status: 404, error: "User not found" };

        const valid = await bcrypt.compare(currentPassword, users[0].passwordHash);
        if (!valid) return { status: 401, error: "Current password is incorrect" };

        const newHash = await bcrypt.hash(newPassword, 12);
        const now = new Date().toISOString().slice(0, 23).replace("T", " ");
        await conn.query("UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE id = ?", [newHash, now, req.user!.userId]);
        return { status: 200, message: "Password updated successfully" };
      });

      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error("[Auth Change Password Error]:", err);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Forgot password
  router.post("/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Always return 200 to prevent user enumeration
    try {
      await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, email FROM `User` WHERE email = ?", [email]);
        if (users.length > 0) {
          console.log(`[Auth] Password reset requested for: ${email}`);
        }
      });
    } catch {}

    res.json({ success: true, message: "If an account exists with this email, you will receive reset instructions." });
  });

  return router;
}
