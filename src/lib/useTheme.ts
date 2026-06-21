import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme-preference";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getActiveTheme(): Theme {
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getActiveTheme);
  const [hasManualOverride, setHasManualOverride] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== null; } catch { return false; }
  });

  // Manual toggle
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setThemeState(next);
    setHasManualOverride(true);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, [theme]);

  // Listen for OS-level changes (only if no manual override)
  useEffect(() => {
    if (hasManualOverride) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      const t: Theme = e.matches ? "light" : "dark";
      applyTheme(t);
      setThemeState(t);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [hasManualOverride]);

  return { theme, toggleTheme };
}
