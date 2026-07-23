import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BadgeIndianRupee, Lock, Mail, ArrowRight, ShieldCheck, 
  BarChart3, FileSpreadsheet, CheckCircle2, Sparkles, Building2, 
  BookOpen, Calculator, Layers, Key
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

interface BooksLoginPageProps {
  onSuccess?: () => void;
}

export default function BooksLoginPage({ onSuccess }: BooksLoginPageProps) {
  const { signIn, activateMockSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (signIn) {
        await signIn(email, password);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to authenticate into INCroute Books");
        localStorage.setItem("incroute_access_token", data.accessToken);
        localStorage.setItem("incroute_user", JSON.stringify(data.user));
      }
      if (onSuccess) onSuccess();
      else window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate into INCroute Books");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (activateMockSession) {
        activateMockSession("demo@incroute.com", "customer", "Demo Founder");
      } else {
        localStorage.setItem("incroute_access_token", "demo_books_token");
      }
      if (onSuccess) onSuccess();
      else window.location.reload();
    } catch (err: any) {
      localStorage.setItem("incroute_access_token", "demo_books_token");
      if (onSuccess) onSuccess();
      else window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1830] text-[#F1F5F9] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#6857EE]/30 selection:text-white">
      {/* Background Violet Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#6857EE]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#5545D8]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* ═══ TOP BOOKS NAVBAR ═══ */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6857EE] to-[#5545D8] flex items-center justify-center shadow-lg shadow-[#6857EE]/25 text-white font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              INCroute <span className="text-[#A99FFF] italic font-semibold">Books</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              Cloud Accounting & GST Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <a href="https://incroute.com" className="text-slate-400 hover:text-[#A99FFF] transition-colors">
            Main Site →
          </a>
        </div>
      </header>

      {/* ═══ MAIN AUTH CONTAINER ═══ */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 flex-1">
        {/* Left Column: Accounting Showcase */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 space-y-8 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6857EE]/15 text-[#A99FFF] border border-[#6857EE]/30 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Standalone Cloud Financial Platform
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Double-Entry Accounting &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A99FFF] via-[#8172FF] to-indigo-300">
                GST Compliance
              </span>
            </h1>
            <p className="text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              Designed specifically for growing Indian businesses. Automated general ledger, multi-currency invoicing, bank reconciliations, and direct GSTR-1/3B portal filing.
            </p>
          </div>

          {/* Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                icon: FileSpreadsheet,
                title: "Double-Entry General Ledger",
                desc: "Real-time Chart of Accounts, Trial Balance, P&L, and Balance Sheet generation."
              },
              {
                icon: BadgeIndianRupee,
                title: "Automated GST & E-Way Bills",
                desc: "GSTR-1, GSTR-3B reconciliation with direct e-invoicing portal sync."
              },
              {
                icon: BarChart3,
                title: "Bank Reconciliations",
                desc: "Smart transaction matching, cash flow analytics, and multi-bank tracking."
              },
              {
                icon: Layers,
                title: "Inventory & Purchases",
                desc: "Real-time stock valuation, purchase order management, and vendor payables."
              }
            ].map((pillar, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#12213F]/80 border border-[#1E3058] space-y-2 hover:border-[#6857EE]/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-[#6857EE]/15 text-[#A99FFF] flex items-center justify-center">
                  <pillar.icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-[#1E3058] text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#A99FFF]" /> 256-Bit Bank Grade Encryption</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#A99FFF]" /> ICAI & GST Council Compliant</span>
          </div>
        </motion.div>

        {/* Right Column: Dedicated Books Auth Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 w-full"
        >
          <div className="bg-[#12213F]/90 border border-[#1E3058] rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6857EE]/10 blur-2xl pointer-events-none" />

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#6857EE]/15 text-[#A99FFF] flex items-center justify-center border border-[#6857EE]/30 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sign In to INCroute Books</h2>
              <p className="text-xs text-slate-300">
                Access your accounting ledgers, invoices, and GST portal.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#0C1830] border border-[#1E3058] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6857EE] focus:ring-1 focus:ring-[#6857EE] transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">Password</label>
                  <a href="#" className="text-[11px] text-[#A99FFF] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0C1830] border border-[#1E3058] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6857EE] focus:ring-1 focus:ring-[#6857EE] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#6857EE] to-[#5545D8] hover:from-[#5545D8] hover:to-[#4636c7] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#6857EE]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Accounting Workspace"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-[#1E3058] w-full" />
              <span className="bg-[#12213F] px-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono shrink-0">OR QUICK PREVIEW</span>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 bg-[#1A2A4C] hover:bg-[#22355C] text-white border border-[#2B406B] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#A99FFF]" /> Instant Demo Accounting Workspace
            </button>
          </div>
        </motion.div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#1E3058] text-xs text-slate-400 flex items-center justify-between flex-wrap gap-4 relative z-10">
        <div>© 2026 INCroute Books Cloud Suite. All rights reserved.</div>
        <div className="flex items-center gap-6 text-[11px]">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">GST Security Whitepaper</a>
        </div>
      </footer>
    </div>
  );
}
