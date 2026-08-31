import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TAB_TO_ROUTE, ROUTES } from "./routes";

// Reverse map: route path → tab name (built once)
const ROUTE_TO_TAB: Record<string, string> = {};
for (const [tab, route] of Object.entries(TAB_TO_ROUTE)) {
  ROUTE_TO_TAB[route] = tab;
}

/** Derive the current tab name from the URL pathname. */
function deriveTabFromPath(pathname: string): string {
  // Books subdomain or path
  if (typeof window !== "undefined" && window.location.hostname.startsWith("books.")) return "books";
  if (pathname.startsWith("/books") || pathname.startsWith("/portal/books") || pathname.startsWith("/admin/books")) return "books";

  // Auth / login
  if (pathname === "/login" || pathname === "/login/") return "login";
  if (pathname === "/auth" || pathname === "/auth/") return "auth";

  // Dynamic partner customer detail
  if (/^\/dashboard\/partner\/customer\/[^/]+/.test(pathname)) return "dashboard-partner-customer-detail";

  // Dynamic service detail
  if (/^\/services\/[^/]+\/[^/]+/.test(pathname)) return "service-detail";

  // Static route → tab lookup
  const cleaned = pathname.replace(/\/$/, "") || "/";
  if (ROUTE_TO_TAB[cleaned]) return ROUTE_TO_TAB[cleaned];
  if (ROUTE_TO_TAB[cleaned + "/"]) return ROUTE_TO_TAB[cleaned + "/"];

  // Fallback: first path segment
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg || "services";
}

/**
 * Provides a `setActiveTab`-compatible function that translates
 * legacy tab names into proper React Router navigations.
 *
 * Also exposes `activeTab` (the current tab derived from the URL)
 * for components like the Navbar that need to highlight the active link.
 */
export function useTabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => deriveTabFromPath(location.pathname), [location.pathname]);

  /** Navigate to a legacy tab name. Recognised names are mapped to
   *  the canonical route via TAB_TO_ROUTE. Unknown names are silently
   *  ignored (they represent component-local state, not routes). */
  const setActiveTab = (tab: string) => {
    const route = TAB_TO_ROUTE[tab];
    if (route && route !== location.pathname) {
      navigate(route);
    } else if (tab === "home" || tab === "landing") {
      if (location.pathname !== ROUTES.home) navigate(ROUTES.home);
    } else if (tab === "services") {
      if (location.pathname !== ROUTES.services) navigate(ROUTES.services);
    }
    // Unknown tabs (e.g. "health_checker", "cards", "tracker") → no-op
  };

  /** Convenience: go to a service detail page by slug */
  const goToService = (category: string, serviceId: string) => {
    navigate(`/services/${category}/${serviceId}/`);
  };

  return { activeTab, setActiveTab, goToService, navigate, location };
}
