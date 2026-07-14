export interface TenantScope {
  tenantId: string;
  organisationId: string;
  userId: string;
  roleCode: string;
}

export function assertTenantScope(scope: Partial<TenantScope>): asserts scope is TenantScope {
  if (!scope.tenantId || !scope.organisationId || !scope.userId || !scope.roleCode) {
    throw new Error("A complete tenant, organisation, user and role scope is required");
  }
}

export function isPlatformAdminRole(role?: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function standaloneOrganisationAccessKind(role?: string): "ADMIN_FIRM" | "OWN_ORGANISATION" {
  return isPlatformAdminRole(role) ? "ADMIN_FIRM" : "OWN_ORGANISATION";
}
