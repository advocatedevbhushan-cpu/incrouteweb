import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  setActiveTab: (tab: string) => void;
}

export default function LoginPage({ setActiveTab }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedMinutes, setLockedMinutes] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLockedMinutes(0);
    if (!email || !password) { setError("Please enter email and password."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      
      if (res.status === 429) {
        setLockedMinutes(data.lockedMinutes || 15);
        setError(data.error);
        setLoading(false);
        return;
      }
      
      if (!res.ok) { 
        setError(data.error || "Login failed"); 
        setLoading(false); 
        return; 
      }

      localStorage.setItem("incroute_access_token", data.accessToken);
      localStorage.setItem("incroute_refresh_token", data.refreshToken);
      localStorage.setItem("incroute_user", JSON.stringify(data.user));
      
      // Redirect based on role or query parameter
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (window.location.hostname.startsWith("books.")) {
        window.location.href = "/";
      } else if (data.user?.role === "SUPER_ADMIN" || data.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (data.user?.role === "TEAM_MEMBER") {
        window.location.href = "/partner";
      } else {
        window.location.href = "/portal";
      }
    } catch {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
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
      setForgotSuccess(data.message || "Reset instructions sent if account exists.");
    } catch {
      setForgotSuccess("Request submitted. Check your email.");
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-[420px] mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-4">
            <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Sign in to your INC<span className="text-[var(--accent)] italic font-normal">route</span> account</p>
        </div>

        {/* Forgot Password View */}
        {showForgotPassword ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Reset Password</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">Enter your email to receive reset instructions</p>
            </div>

            {forgotSuccess && (
              <div className="px-4 py-3 rounded-xl bg-[color-mix(in_srgb,#10B981_8%,transparent)] border border-[color-mix(in_srgb,#10B981_20%,transparent)] text-[13px] text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-semibold text-[14px] rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Reset Link"}
              </button>
            </form>

            <button
              onClick={() => { setShowForgotPassword(false); setForgotSuccess(""); }}
              className="w-full text-center text-[12px] text-[var(--accent)] font-medium cursor-pointer hover:text-[var(--accent-deep)] transition-colors"
            >
              ← Back to login
            </button>
          </div>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-5">
              {/* Account Locked Warning */}
              {lockedMinutes > 0 && (
                <div className="px-4 py-3 rounded-xl bg-[color-mix(in_srgb,#F59E0B_8%,transparent)] border border-[color-mix(in_srgb,#F59E0B_20%,transparent)] text-[13px] text-[#D97706] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Account temporarily locked due to multiple failed attempts. Try again in {lockedMinutes} minute(s).</span>
                </div>
              )}

              {/* Error */}
              {error && !lockedMinutes && (
                <div className="px-4 py-3 rounded-xl bg-[color-mix(in_srgb,#EF4444_8%,transparent)] border border-[color-mix(in_srgb,#EF4444_20%,transparent)] text-[13px] text-[#EF4444]">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={lockedMinutes > 0}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={lockedMinutes > 0}
                    className="w-full pl-10 pr-11 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="text-[12px] text-[var(--text-secondary)]">Remember me (30 days)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-deep)] font-medium cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || lockedMinutes > 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-semibold text-[14px] rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-[12px] text-[var(--text-tertiary)] mt-5">
              Don't have an account?{" "}
              <button onClick={() => setActiveTab("contact")} className="text-[var(--accent)] font-medium cursor-pointer hover:text-[var(--accent-deep)] transition-colors">
                Contact us to get started
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
