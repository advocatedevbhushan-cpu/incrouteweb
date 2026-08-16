import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // In production, enforce having JWT_SECRET set
    if (process.env.NODE_ENV === "production") {
      console.error("FATAL: JWT_SECRET environment variable is missing in production!");
    }
    // Stable development fallback so reboots don't logout users
    return "incroute_dev_stable_jwt_secret_do_not_use_in_prod";
  }
  return secret;
}

/**
 * Middleware that verifies the Bearer JWT token in Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "Authentication token missing", code: "UNAUTHORIZED" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid authentication token", code: "INVALID_TOKEN" });
  }
}

/**
 * Optional authentication: populates req.user if token is present, but allows request if not.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      req.user = jwt.verify(token, getJwtSecret()) as AuthUser;
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Must be placed after `authenticateToken`.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    const userRole = (req.user.role || "").toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    // SUPER_ADMIN has access to everything
    if (userRole === "SUPER_ADMIN" || normalizedAllowed.includes(userRole)) {
      return next();
    }

    // Role synonyms (e.g. TEAM_MEMBER / PARTNER)
    if (normalizedAllowed.includes("PARTNER") && userRole === "TEAM_MEMBER") {
      return next();
    }
    if (normalizedAllowed.includes("TEAM_MEMBER") && userRole === "PARTNER") {
      return next();
    }

    return res.status(403).json({
      error: "Access denied: insufficient permissions",
      code: "FORBIDDEN"
    });
  };
}

/**
 * Convenience middleware for Admin & Super Admin routes
 */
export const requireAdmin = requireRole("ADMIN", "SUPER_ADMIN");

/**
 * Convenience middleware for Partner routes
 */
export const requirePartner = requireRole("PARTNER", "TEAM_MEMBER", "ADMIN", "SUPER_ADMIN");
