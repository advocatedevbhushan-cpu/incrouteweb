import React, { useState } from "react";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }

      localStorage.setItem("incroute_access_token", data.accessToken);
      localStorage.setItem("incroute_refresh_token", data.refreshToken);
      setActiveTab("portal");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-4">
            <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Sign in to your INC<span className="text-[var(--accent)] italic font-normal">route</span> account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-5">
          {error && (
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
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all"
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
                className="w-full pl-10 pr-11 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all"
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
              <span className="text-[12px] text-[var(--text-secondary)]">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => {/* Future: forgot password flow */}}
              className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-deep)] font-medium cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
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
      </div>
    </div>
  );
}
