import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { TAB_TO_ROUTE } from "./routes";

export function useAppNavigate() {
  const navigate = useNavigate();

  const navigateToTab = useCallback((tab: string) => {
    const route = TAB_TO_ROUTE[tab] || `/${tab}/`;
    navigate(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const navigateToService = useCallback((serviceId: string, category?: string) => {
    const cat = category || "corporate";
    navigate(`/services/${cat}/${serviceId}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  return Object.assign(navigateToTab, { navigateToTab, navigateToService });
}
