import React from "react";
import { useSecureAuth } from "./AuthProvider";

type Role = "SUPER_ADMIN" | "ADMIN" | "TEAM_MEMBER" | "CLIENT" | "CLIENT_SUB_USER";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RoleGuardProps extends ProtectedRouteProps {
  roles: Role[];
}

interface PermissionGuardProps extends ProtectedRouteProps {
  permission: string; // "resource.action" format
}

/**
 * Require authenticated user
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSecureAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Authentication Required</h2>
        <p className="text-[var(--text-secondary)] text-sm">Please sign in to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Require specific role(s)
 */
export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useSecureAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAuthenticated || !user || !roles.includes(user.role)) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-[var(--text-secondary)] text-sm">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Require specific permission
 */
export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { user, isAuthenticated } = useSecureAuth();

  // SUPER_ADMIN and ADMIN always pass
  if (isAuthenticated && user && ["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return <>{children}</>;
  }

  // For other roles, permission checking would query a permissions state
  // This is a placeholder for when permissions are loaded from the API
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Hook: Check if current user has a specific role
 */
export function useRole() {
  const { user } = useSecureAuth();
  return {
    role: user?.role || null,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isTeamMember: user?.role === "TEAM_MEMBER",
    isClient: user?.role === "CLIENT",
    isSubUser: user?.role === "CLIENT_SUB_USER",
    hasRole: (...roles: Role[]) => user ? roles.includes(user.role) : false,
  };
}

/**
 * Hook: Check permissions (placeholder — connect to API)
 */
export function usePermission() {
  const { user } = useSecureAuth();
  return {
    can: (resource: string, action: string) => {
      if (!user) return false;
      if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) return true;
      // For other roles, this would check loaded permissions
      return false;
    },
  };
}
