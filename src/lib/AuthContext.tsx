import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  uid: string;
  email: string;
  role: "customer" | "partner" | "admin";
  fullName: string;
  createdAt: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName: string, role: "customer" | "partner") => Promise<void>;
  signInWithGoogle: (roleForNewUser?: "customer" | "partner") => Promise<void>;
  logoutUser: () => Promise<void>;
  activateMockSession: (email: string, role: "customer" | "partner" | "admin", fullName?: string) => void;
  adminCreateUser: (email: string, password: string, fullName: string, role: "customer" | "partner", assignedPartnerId?: string) => Promise<any>;
  updateCustomerProfile: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start as false — no Firebase to wait for
  const [isMock, setIsMock] = useState<boolean>(false);

  // On mount, check if there's a stored session (JWT-based)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("incroute_user");
      const token = localStorage.getItem("incroute_access_token");
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setProfile({
          uid: parsed.id,
          email: parsed.email,
          role: parsed.role === "SUPER_ADMIN" || parsed.role === "ADMIN" || parsed.role === "TEAM_MEMBER" ? "admin" : "customer",
          fullName: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim(),
          createdAt: parsed.createdAt || new Date().toISOString(),
        });
      }
    } catch {}
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("incroute_access_token", data.accessToken);
    localStorage.setItem("incroute_refresh_token", data.refreshToken);
    localStorage.setItem("incroute_user", JSON.stringify(data.user));
    setUser(data.user);
    setProfile({
      uid: data.user.id,
      email: data.user.email,
      role: data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN" || data.user.role === "TEAM_MEMBER" ? "admin" : "customer",
      fullName: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  const signUp = async (email: string, password: string, fullName: string, role: "customer" | "partner") => {
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || "";
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, role: role === "partner" ? "TEAM_MEMBER" : "CLIENT" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("incroute_access_token", data.accessToken);
    localStorage.setItem("incroute_refresh_token", data.refreshToken);
    localStorage.setItem("incroute_user", JSON.stringify(data.user));
    setUser(data.user);
    setProfile({
      uid: data.user.id,
      email: data.user.email,
      role,
      fullName,
      createdAt: new Date().toISOString(),
    });
  };

  const signInWithGoogle = async () => {
    // Not supported without Firebase — show message
    throw new Error("Google Sign-In is not available. Please use email and password.");
  };

  const logoutUser = async () => {
    // Invalidate session on server
    try {
      const token = localStorage.getItem("incroute_access_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      }
    } catch {}
    
    // Clear all stored session data
    localStorage.removeItem("incroute_access_token");
    localStorage.removeItem("incroute_refresh_token");
    localStorage.removeItem("incroute_user");
    localStorage.removeItem("incroute_mock_session");
    setUser(null);
    setProfile(null);
    setIsMock(false);
  };

  const activateMockSession = (email: string, role: "customer" | "partner" | "admin", fullName?: string) => {
    const mockUser = { id: "mock_" + Date.now(), email, firstName: fullName || email.split("@")[0], lastName: "", role: role === "admin" ? "SUPER_ADMIN" : "CLIENT" };
    const mockProfile: UserProfile = { uid: mockUser.id, email, role, fullName: fullName || email, createdAt: new Date().toISOString() };
    setUser(mockUser);
    setProfile(mockProfile);
    setIsMock(true);
    localStorage.setItem("incroute_mock_session", JSON.stringify({ user: mockUser, profile: mockProfile }));
  };

  const adminCreateUser = async (email: string, password: string, fullName: string, role: "customer" | "partner") => {
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || "";
    const token = localStorage.getItem("incroute_access_token");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ email, password, firstName, lastName, role: role === "partner" ? "TEAM_MEMBER" : "CLIENT" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "User creation failed");
    return { uid: data.user?.id, email, password, fullName, role };
  };

  const updateCustomerProfile = async (uid: string, updates: Partial<UserProfile>) => {
    // Update local state
    if (profile && profile.uid === uid) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isMock,
      signIn, signUp, signInWithGoogle, logoutUser,
      activateMockSession, adminCreateUser, updateCustomerProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Kept for backward compat — components that import these won't break
export const getDefaultTimeline = () => [];
export const checkAccountExpiration = () => false;
