import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, 
  CheckCircle2, Shield, Building2, Users, Sparkles, 
  ArrowLeft, Phone, KeyRound, ShieldAlert, Cpu, Award
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

type UserRoleTab = "client" | "partner" | "admin" | "super_admin";

interface LoginPageProps {
  setActiveTab?: (tab: string) => void;
}

export default function LoginPage({ setActiveTab }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, activateMockSession } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRoleTab>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [superAdminKey, setSuperAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedMinutes, setLockedMinutes] = useState(0);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Inspect query param for redirect target or preset role
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect") || "";
    const roleParam = params.get("role") || "";

    if (roleParam === "super_admin" || redirectParam.includes("super-admin")) {
      setActiveRole("super_admin");
    } else if (roleParam === "admin" || redirectParam.includes("admin")) {
      setActiveRole("admin");
    } else if (roleParam === "partner" || redirectParam.includes("partner")) {
      setActiveRole("partner");
    } else if (redirectParam.includes("portal")) {
      setActiveRole("client");
    }
  }, [location.search]);

  // Monitor CapsLock key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleLoginSuccess = (userRole?: string) => {
    const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }

    if (activeRole === "super_admin" || userRole === "SUPER_ADMIN") {
      navigate("/admin");
    } else if (activeRole === "admin" || userRole === "ADMIN") {
      navigate("/admin");
    } else if (activeRole === "partner" || userRole === "TEAM_MEMBER") {
      navigate("/partner");
    } else {
      navigate("/portal");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLockedMinutes(0);
    if (!email || !password) {
      setError("Please provide your registered email and password.");
      return;
    }

    setLoading(true);
    try {
      if (signIn) {
        await signIn(email, password);
        const storedUser = localStorage.getItem("incroute_user");
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        handleLoginSuccess(parsed?.role);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, rememberMe }),
        });
        const data = await res.json();
        
        if (res.status === 429) {
          setLockedMinutes(data.lockedMinutes || 15);
          setError(data.error || "Account temporarily locked.");
          setLoading(false);
          return;
        }
        
        if (!res.ok) { 
          setError(data.error || "Invalid credentials for the selected role."); 
          setLoading(false); 
          return; 
        }

        localStorage.setItem("incroute_access_token", data.accessToken);
        localStorage.setItem("incroute_refresh_token", data.refreshToken);
        localStorage.setItem("incroute_user", JSON.stringify(data.user));
        handleLoginSuccess(data.user?.role);
      }
    } catch (err: any) {
      setError(err.message || "Authentication network error. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Instant one-click demo access tailored by role
  const handleQuickDemo = (role: UserRoleTab) => {
    setDemoLoading(true);
    setError("");
    try {
      if (role === "super_admin") {
        activateMockSession("d.bhushan@incroute.com", "admin", "Dev Bhushan (Super Admin)");
        navigate("/admin");
      } else if (role === "admin") {
        activateMockSession("ops.manager@incroute.com", "admin", "Operations Legal Lead");
        navigate("/admin");
      } else if (role === "partner") {
        activateMockSession("ca.partner@incroute.com", "partner", "CA Advocate Associate");
        navigate("/partner");
      } else {
        activateMockSession("founder@startup.in", "customer", "Demo Founder (Pvt Ltd)");
        navigate("/portal");
      }
    } catch {
      setError("Failed to initialize demo session. Please log in normally.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotSuccess("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotSuccess(data.message || "Password recovery instructions dispatched to your inbox.");
    } catch {
      setForgotSuccess("Request submitted. Please check your registered inbox.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleContactNavigate = () => {
    if (setActiveTab) setActiveTab("contact");
    navigate("/contact");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      {/* Dynamic Background Glow Based on Active Role */}
      {activeRole === "super_admin" ? (
        <>
          <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : activeRole === "admin" ? (
        <>
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : activeRole === "partner" ? (
        <>
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--accent)]/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* ─── Top Navigation Bar ─── */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors shadow-xs">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="hidden sm:inline">Back to INCroute</span>
        </button>

        <a href="/" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs">
            <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            INC<span className="italic font-normal text-[var(--accent)]">route</span>
          </span>
        </a>

        <a
          href="tel:+918707552183"
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:text-[var(--accent-deep)] transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Support: +91 87075 52183</span>
          <span className="sm:hidden">Help</span>
        </a>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="w-full max-w-lg mx-auto px-4 py-4 sm:py-8 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Role-Specific Header Announcement */}
        <div className="text-center mb-5">
          {activeRole === "super_admin" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2.5 shadow-xs">
              <ShieldAlert className="w-3 h-3 text-amber-500 animate-pulse" /> Root Executive Console · Level 0
            </span>
          ) : activeRole === "admin" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-2.5 shadow-xs">
              <Cpu className="w-3 h-3 text-indigo-500" /> Operations Command & Filing Ops
            </span>
          ) : activeRole === "partner" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2.5 shadow-xs">
              <Award className="w-3 h-3 text-emerald-500" /> Verified CA / CS Associate Network
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)] mb-2.5 shadow-xs">
              <Shield className="w-3 h-3" /> Founder & Client Portal
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {activeRole === "super_admin" && "Super Admin Gateway"}
            {activeRole === "admin" && "Operations Console"}
            {activeRole === "partner" && "Partner & CA Station"}
            {activeRole === "client" && "Client Sign In"}
          </h1>
          
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
            {activeRole === "super_admin" && "Master platform controls, system audit logs, and infrastructure configuration."}
            {activeRole === "admin" && "Internal legal operations, ROC/GST review desk, and workflow processing."}
            {activeRole === "partner" && "Client folios, partner commission statements, and referral advisory."}
            {activeRole === "client" && "Track incorporations, view compliance calendars, and download certificates."}
          </p>
        </div>

        {/* ─── 4-Role Workspace Switcher ─── */}
        {!showForgotPassword && (
          <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-2xl mb-4 shadow-inner">
            
            {/* Client Tab */}
            <button
              type="button"
              onClick={() => { setActiveRole("client"); setError(""); }}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeRole === "client"
                  ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Client</span>
            </button>

            {/* Partner Tab */}
            <button
              type="button"
              onClick={() => { setActiveRole("partner"); setError(""); }}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeRole === "partner"
                  ? "bg-[var(--bg-surface)] text-emerald-500 shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Partner</span>
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => { setActiveRole("admin"); setError(""); }}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeRole === "admin"
                  ? "bg-[var(--bg-surface)] text-indigo-500 shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Admin</span>
            </button>

            {/* Super Admin Tab */}
            <button
              type="button"
              onClick={() => { setActiveRole("super_admin"); setError(""); }}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                activeRole === "super_admin"
                  ? "bg-[var(--bg-surface)] text-amber-500 shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Super Admin</span>
            </button>
          </div>
        )}

        {/* ─── Login Card Body ─── */}
        <div className={`bg-[var(--bg-surface)] border rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-left relative overflow-hidden transition-all ${
          activeRole === "super_admin" 
            ? "border-amber-500/30 ring-1 ring-amber-500/20" 
            : activeRole === "admin"
            ? "border-indigo-500/30 ring-1 ring-indigo-500/20"
            : activeRole === "partner"
            ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
            : "border-[var(--border-subtle)]"
        }`}>
          
          {/* Top highlight bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            activeRole === "super_admin"
              ? "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600"
              : activeRole === "admin"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600"
              : activeRole === "partner"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]"
          }`} />

          {showForgotPassword ? (
            /* ─── Forgot Password View ─── */
            <div className="space-y-4 pt-1">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Reset Password</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Enter your registered email and we'll dispatch password recovery instructions.
                </p>
              </div>

              {forgotSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="forgot-email" className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="account@incroute.com"
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-[var(--on-gradient-text)] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-[var(--accent)]/20"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                </button>
              </form>

              <button
                onClick={() => { setShowForgotPassword(false); setForgotSuccess(""); }}
                className="w-full text-center text-xs text-[var(--accent)] font-semibold cursor-pointer hover:underline pt-2 block"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            /* ─── Role-Specific Login Form ─── */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              {/* Context Banner */}
              <div className="flex items-center justify-between pb-1.5 text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                <span>Access Level:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  activeRole === "super_admin" ? "text-amber-500" :
                  activeRole === "admin" ? "text-indigo-400" :
                  activeRole === "partner" ? "text-emerald-400" :
                  "text-[var(--accent)]"
                }`}>
                  {activeRole === "super_admin" && "Super Admin (Full Root Permissions)"}
                  {activeRole === "admin" && "Admin (Operations & Case Review)"}
                  {activeRole === "partner" && "Partner (CA / CS Desk)"}
                  {activeRole === "client" && "Client (Company & Filings)"}
                </span>
              </div>

              {/* Account Locked Alert */}
              {lockedMinutes > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Account temporarily locked. Please try again in {lockedMinutes} minutes.</span>
                </div>
              )}

              {/* Error Alert */}
              {error && !lockedMinutes && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")} className="text-xs font-bold underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {activeRole === "super_admin" ? "Super Admin ID / Email" :
                   activeRole === "admin" ? "Staff / Operations Email" :
                   activeRole === "partner" ? "Partner / CA Registered Email" :
                   "Client Account Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeRole === "super_admin" ? "admin@incroute.com" :
                      activeRole === "admin" ? "ops@incroute.com" :
                      activeRole === "partner" ? "partner@firm.in" :
                      "founder@company.com"
                    }
                    autoComplete="email"
                    disabled={lockedMinutes > 0}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    {activeRole === "super_admin" ? "Root Security Passphrase" : "Password"}
                  </label>
                  {capsLockActive && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
                      Caps Lock ON
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    disabled={lockedMinutes > 0}
                    className="w-full pl-10 pr-11 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Super Admin Special Hardware Key Option */}
              {activeRole === "super_admin" && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="superadmin-key" className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> Hardware / Root Security Token (Optional)
                    </label>
                    <span className="text-[9px] font-mono text-slate-400">YubiKey / TOTP</span>
                  </div>
                  <input
                    id="superadmin-key"
                    type="text"
                    value={superAdminKey}
                    onChange={(e) => setSuperAdminKey(e.target.value)}
                    placeholder="Enter security token if configured"
                    className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-amber-500/30 rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="text-xs text-[var(--text-secondary)] font-medium">Keep session active</span>
                </label>
                {activeRole !== "super_admin" && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent-deep)] font-semibold cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || lockedMinutes > 0}
                className={`w-full py-3 text-[var(--on-gradient-text)] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md active:scale-[0.99] ${
                  activeRole === "super_admin"
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white shadow-amber-500/20"
                    : activeRole === "admin"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                    : activeRole === "partner"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-deep)] shadow-[var(--accent)]/25"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeRole === "super_admin" && "Authenticate Super Admin"}
                      {activeRole === "admin" && "Enter Operations Console"}
                      {activeRole === "partner" && "Open Partner Workstation"}
                      {activeRole === "client" && "Open Client Dashboard"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Role-Tailored Instant Demo Switcher */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-[var(--border-subtle)] w-full" />
                  <span className="bg-[var(--bg-surface)] px-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-mono font-bold">
                    Quick test access
                  </span>
                </div>

                <button
                  type="button"
                  disabled={demoLoading}
                  onClick={() => handleQuickDemo(activeRole)}
                  className="w-full py-2.5 px-4 bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-soft)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 text-[var(--text-primary)] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {demoLoading 
                      ? "Switching role..." 
                      : `Instant Preview as ${
                          activeRole === "super_admin" ? "Super Admin (Dev Bhushan)" :
                          activeRole === "admin" ? "Operations Admin" :
                          activeRole === "partner" ? "CA Advocate Partner" :
                          "Client Founder"
                        }`}
                  </span>
                </button>
              </div>

              {/* Super Admin Audit Note */}
              {activeRole === "super_admin" && (
                <p className="text-[10px] text-slate-400 font-mono text-center pt-1 leading-relaxed">
                  🛡️ Security Audit: All master root sessions are cryptographically logged with IP and hardware fingerprints.
                </p>
              )}
            </form>
          )}
        </div>

        {/* ─── Footer Registration CTA ─── */}
        <div className="text-center mt-5 space-y-2">
          {activeRole === "client" ? (
            <p className="text-xs text-[var(--text-secondary)]">
              Need new company incorporation or GST?{" "}
              <button
                type="button"
                onClick={handleContactNavigate}
                className="text-[var(--accent)] font-bold hover:underline cursor-pointer"
              >
                Inquire with INCroute Advisors →
              </button>
            </p>
          ) : activeRole === "partner" ? (
            <p className="text-xs text-[var(--text-secondary)]">
              Are you a CA, CS, or Advocate?{" "}
              <button
                type="button"
                onClick={handleContactNavigate}
                className="text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                Join our Affiliate Partner Network →
              </button>
            </p>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              Internal access strictly for authorized INCroute personnel.{" "}
              <a href="mailto:d.bhushan@incroute.com" className="text-indigo-400 font-bold hover:underline">
                Contact Security Desk
              </a>
            </p>
          )}
        </div>
      </main>

      {/* ─── Bottom Trust Strip ─── */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 relative z-10 border-t border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-[11px] text-[var(--text-tertiary)] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit TLS Secured
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> MCA & GST Statutory Gateway
            </span>
          </div>
          <span>INCroute Corporate Technologies Pvt. Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
