import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — resets scroll position to top on every route change.
 * Place inside <BrowserRouter> but outside <Routes>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll reset
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
