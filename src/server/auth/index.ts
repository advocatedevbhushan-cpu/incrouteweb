/**
 * INCroute Authentication Module
 * ─────────────────────────────────────────────
 * Enterprise-grade auth with JWT, RBAC, rate limiting, and audit logging.
 *
 * Usage in server.ts:
 *   import authRoutes from "./server/auth/routes";
 *   app.use("/api/auth", authRoutes);
 */

export { default as authRoutes } from "./routes";
export { requireAuth, requireRole, requirePermission, rateLimitLogin } from "./middleware";
export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./jwt";
export { hashPassword, verifyPassword } from "./password";
export * from "./validation";
