/**
 * INCroute Frontend Auth Module
 * ─────────────────────────────────────────────
 * Usage:
 *   import { SecureAuthProvider, useSecureAuth, ProtectedRoute, RoleGuard } from "@/lib/auth";
 */

export { SecureAuthProvider, useSecureAuth } from "./AuthProvider";
export { ProtectedRoute, RoleGuard, PermissionGuard, useRole, usePermission } from "./guards";
