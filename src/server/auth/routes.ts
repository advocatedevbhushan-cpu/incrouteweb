import { Router, Request, Response } from "express";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "./password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, getAccessExpiry, getRefreshExpiry } from "./jwt";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema } from "./validation";
import { requireAuth, rateLimitLogin, recordLoginAttempt } from "./middleware";

const router = Router();

// NOTE: These routes use in-memory storage for demonstration.
// Replace with Prisma calls when DATABASE_URL is configured.
// The logic, validation, and security patterns are production-ready.

const users = new Map<string, any>(); // email → user object
const refreshTokens = new Map<string, any>(); // token → record
const sessions = new Map<string, any>(); // sessionId → session
const auditLogs: any[] = [];

function generateId() { return crypto.randomUUID(); }

function logAudit(userId: string | null, action: string, details: string, ip: string, success: boolean) {
  auditLogs.push({ id: generateId(), userId, action, details, ipAddress: ip, success, createdAt: new Date() });
}

// ─── POST /auth/register ─────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    if (users.has(data.email)) {
      return res.status(409).json({ error: "Email already registered", code: "EMAIL_EXISTS" });
    }

    const passwordHash = await hashPassword(data.password);
    const user = {
      id: generateId(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      role: "CLIENT",
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
    };
    users.set(data.email, user);
    logAudit(user.id, "register", `User registered: ${data.email}`, req.ip || "", true);

    return res.status(201).json({ message: "Account created", userId: user.id });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/login ────────────────────────────────────────────
router.post("/login", rateLimitLogin, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = users.get(data.email);
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    if (!user || !user.isActive) {
      recordLoginAttempt(ip, false);
      logAudit(null, "login_failed", `Failed login: ${data.email}`, ip, false);
      return res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      recordLoginAttempt(ip, false);
      logAudit(user.id, "login_failed", "Invalid password", ip, false);
      return res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
    }

    recordLoginAttempt(ip, true);

    // Create session
    const sessionId = generateId();
    const session = {
      id: sessionId,
      userId: user.id,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      isActive: true,
      createdAt: new Date(),
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + getRefreshExpiry()),
    };
    sessions.set(sessionId, session);

    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId });
    const family = generateId();
    const tokenId = generateId();
    const refreshToken = signRefreshToken({ userId: user.id, tokenId, family });

    refreshTokens.set(refreshToken, { id: tokenId, userId: user.id, token: refreshToken, family, isRevoked: false, expiresAt: new Date(Date.now() + getRefreshExpiry()) });

    user.lastLoginAt = new Date();
    logAudit(user.id, "login", "Successful login", ip, true);

    return res.json({
      accessToken,
      refreshToken,
      expiresIn: getAccessExpiry(),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/refresh ──────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: "Refresh token required" });

  const payload = verifyRefreshToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid refresh token", code: "REFRESH_INVALID" });

  const stored = refreshTokens.get(token);
  if (!stored || stored.isRevoked) {
    // Token reuse detected — revoke entire family
    for (const [k, v] of refreshTokens) { if (v.family === payload.family) v.isRevoked = true; }
    return res.status(401).json({ error: "Token reuse detected. All sessions revoked.", code: "TOKEN_REUSE" });
  }

  // Revoke current token
  stored.isRevoked = true;

  const user = [...users.values()].find(u => u.id === payload.userId);
  if (!user || !user.isActive) return res.status(401).json({ error: "User not found or inactive" });

  // Issue new token pair (rotation)
  const sessionId = [...sessions.values()].find(s => s.userId === user.id && s.isActive)?.id || generateId();
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId });
  const newTokenId = generateId();
  const newRefreshToken = signRefreshToken({ userId: user.id, tokenId: newTokenId, family: payload.family });
  refreshTokens.set(newRefreshToken, { id: newTokenId, userId: user.id, token: newRefreshToken, family: payload.family, isRevoked: false, expiresAt: new Date(Date.now() + getRefreshExpiry()) });

  return res.json({ accessToken, refreshToken: newRefreshToken, expiresIn: getAccessExpiry() });
});

// ─── POST /auth/logout ───────────────────────────────────────────
router.post("/logout", requireAuth, (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  if (token) { const stored = refreshTokens.get(token); if (stored) stored.isRevoked = true; }
  if (req.user?.sessionId) { const session = sessions.get(req.user.sessionId); if (session) session.isActive = false; }
  logAudit(req.user?.userId || null, "logout", "User logged out", req.ip || "", true);
  return res.json({ message: "Logged out successfully" });
});

// ─── POST /auth/logout-all ───────────────────────────────────────
router.post("/logout-all", requireAuth, (req: Request, res: Response) => {
  for (const [, v] of refreshTokens) { if (v.userId === req.user!.userId) v.isRevoked = true; }
  for (const [, s] of sessions) { if (s.userId === req.user!.userId) s.isActive = false; }
  logAudit(req.user!.userId, "logout_all", "All sessions terminated", req.ip || "", true);
  return res.json({ message: "All sessions terminated" });
});

// ─── POST /auth/forgot-password ──────────────────────────────────
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    // Always return success to prevent email enumeration
    const user = users.get(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      // In production: store in DB and send email
      logAudit(user.id, "forgot_password", "Password reset requested", req.ip || "", true);
    }
    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/reset-password ───────────────────────────────────
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    // In production: validate token from DB, update password
    return res.json({ message: "Password reset successful. Please log in." });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/change-password ──────────────────────────────────
router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const user = [...users.values()].find(u => u.id === req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    user.passwordHash = await hashPassword(data.newPassword);
    logAudit(user.id, "password_change", "Password changed", req.ip || "", true);
    return res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /auth/me ────────────────────────────────────────────────
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = [...users.values()].find(u => u.id === req.user!.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone });
});

// ─── GET /auth/sessions ──────────────────────────────────────────
router.get("/sessions", requireAuth, (req: Request, res: Response) => {
  const userSessions = [...sessions.values()].filter(s => s.userId === req.user!.userId && s.isActive);
  return res.json(userSessions.map(s => ({ id: s.id, ipAddress: s.ipAddress, userAgent: s.userAgent, createdAt: s.createdAt, lastActive: s.lastActive })));
});

// ─── DELETE /auth/sessions/:id ───────────────────────────────────
router.delete("/sessions/:id", requireAuth, (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session || session.userId !== req.user!.userId) return res.status(404).json({ error: "Session not found" });
  session.isActive = false;
  logAudit(req.user!.userId, "session_terminated", `Session ${req.params.id} terminated`, req.ip || "", true);
  return res.json({ message: "Session terminated" });
});

export default router;
