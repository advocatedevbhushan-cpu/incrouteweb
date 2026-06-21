import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEAM_MEMBER" | "CLIENT" | "CLIENT_SUB_USER";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthState>({
  user: null, isAuthenticated: false, isLoading: true,
  login: async () => ({ success: false }), logout: async () => {}, refreshSession: async () => false,
});

const TOKEN_KEY = "incroute_access_token";
const REFRESH_KEY = "incroute_refresh_token";

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) { clearTokens(); return false; }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);

      // Fetch user profile
      const meRes = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${data.accessToken}` } });
      if (meRes.ok) { setUser(await meRes.json()); return true; }
      return false;
    } catch { clearTokens(); return false; }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Login failed" };

      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ refreshToken }),
      });
    } catch { /* ignore */ }
    clearTokens();
  };

  // Initialize — check stored tokens
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setIsLoading(false); return; }
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { setUser(await res.json()); }
        else { await refreshSession(); }
      } catch { clearTokens(); }
      setIsLoading(false);
    };
    init();
  }, [refreshSession]);

  // Auto-refresh token before expiry (every 12 minutes)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => refreshSession(), 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useSecureAuth = () => useContext(AuthContext);
export default SecureAuthProvider;
