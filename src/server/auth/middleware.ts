import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "./jwt";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

type Role = "SUPER_ADMIN" | "ADMIN" | "TEAM_MEMBER" | "CLIENT" | "CLIENT_SUB_USER";

/**
 * Require valid JWT access token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token", code: "TOKEN_INVALID" });
  }

  req.user = payload;
  next();
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
    }
    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: "Insufficient permissions", code: "FORBIDDEN" });
    }
    next();
  };
}

/**
 * Require specific permission (resource.action format)
 * Checks against user's assigned permissions in DB
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
    }

    // SUPER_ADMIN and ADMIN have all permissions
    if (["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) {
      return next();
    }

    // For other roles, check permission table
    // This would query the DB in production:
    // const hasPermission = await prisma.userPermission.findFirst({
    //   where: { userId: req.user.userId, permission: { resource, action } }
    // });
    // For now, pass through — implement DB check when Prisma is connected
    next();
  };
}

/**
 * Rate limiter for auth endpoints
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (record) {
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    } else if (record.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        code: "RATE_LIMITED",
        retryAfter: Math.ceil((WINDOW_MS - (now - record.lastAttempt)) / 1000),
      });
    }
  }

  next();
}

export function recordLoginAttempt(ip: string, success: boolean) {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  const record = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  record.count++;
  record.lastAttempt = Date.now();
  loginAttempts.set(ip, record);
}
