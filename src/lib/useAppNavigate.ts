import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { TAB_TO_ROUTE } from "./routes";

/**
 * Drop-in replacement for setActiveTab.
 * Components call navigateToTab("services") and it navigates to the correct URL.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  const navigateToTab = useCallback((tab: string) => {
    const route = TAB_TO_ROUTE[tab] || `/${tab}/`;
    navigate(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  return navigateToTab;
}
