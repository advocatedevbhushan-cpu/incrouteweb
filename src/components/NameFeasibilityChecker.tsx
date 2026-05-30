import React, { useState } from "react";
import { Sparkles, Shield, CheckCircle2, AlertTriangle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface NameCheckReport {
  score: number;
  summary: string;
  conflicts: string[];
  checklist: {
    criterion: string;
    passed: boolean;
    reason: string;
  }[];
  suggestions: string[];
}

interface NameFeasibilityCheckerProps {
  onOnboard?: (name: string, entityType: string) => void;
}

export default function NameFeasibilityChecker({ onOnboard }: NameFeasibilityCheckerProps) {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("Private Limited Company (Pvt Ltd)");
  const [industry, setIndustry] = useState("Technology & Software Services");
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<NameCheckReport | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsChecking(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/consult/name-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, entityType, industry })
      });
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setError(data.error || "Failed to generate report. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the advisor. Please check your internet connection.");
    } finally {
      setIsChecking(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-500 border-amber-500/30 bg-amber-500/10";
    return "text-red-500 border-red-500/30 bg-red-500/10";
  };

  return (
    <div className="space-y-12">
      {/* Intro Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
          <img src="/ashoka_lion_gold.png" className="w-5 h-5 rounded-full object-cover border border-brand-gold/40 bg-black" alt="Emblem" />
          AI-POWERED COMPLIANCE AUDITING
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Registrar Name <span className="text-brand-gold italic font-normal">Feasibility Advisor.</span>
        </h1>
        <p className="text-sm text-brand-text-muted font-sans leading-relaxed max-w-xl mx-auto">
          Audit your proposed brand name against official Registrar naming guidelines. Our Gemini engine maps trade registry databases instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        {/* Left Column: Form Intake (5 cols) */}
        <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-light text-brand-text serif border-b border-brand-border pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" /> Check Suitability
          </h3>

          <form onSubmit={handleCheck} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Proposed Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Select Entity Type *</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border focus:border-brand-gold rounded px-4 py-2.5 text-xs text-brand-text-muted outline-none cursor-pointer"
              >
                <option>Private Limited Company (Pvt Ltd)</option>
                <option>Limited Liability Partnership (LLP)</option>
                <option>One Person Company (OPC)</option>
                <option>Partnership Firm</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Industry / Sector *</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border focus:border-brand-gold rounded px-4 py-2.5 text-xs text-brand-text-muted outline-none cursor-pointer"
              >
                <option>Technology & Software Services</option>
                <option>E-Commerce & Retail</option>
                <option>Finance & Consulting Services</option>
                <option>Healthcare & Pharma</option>
                <option>Real Estate & Construction</option>
                <option>Food & Hospitality</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isChecking || !name.trim()}
              className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-xs py-3 rounded transition-all cursor-pointer font-bold duration-300 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-brand-gold/5"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> AUDITING NAME...
                </>
              ) : (
                <>
                  RUN PRE-REGISTRY AUDIT <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Report Display (7 cols) */}
        <div className="lg:col-span-7">
          {isChecking && (
            <div className="bg-brand-bg-lighter border border-brand-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[420px] space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
              <div>
                <h4 className="text-brand-text font-serif text-lg font-light tracking-wide">Querying Central Registries...</h4>
                <p className="text-xs text-brand-text-muted font-mono mt-1">Checking phonetics, trademarks, and semantic compliance</p>
              </div>
            </div>
          )}

          {!isChecking && !report && (
            <div className="bg-brand-bg-lighter/30 border border-dashed border-brand-border rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[420px] text-brand-text-muted space-y-3 font-serif italic">
              <Shield className="w-8 h-8 text-brand-text-muted/40 stroke-[1.5]" />
              <p className="text-xs">Your AI pre-incorporation suitability report will be generated here.</p>
            </div>
          )}

          {!isChecking && report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
              
              {/* Report Header Block */}
              <div className="border-b border-brand-border pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1">
                  <span className="text-[8px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    Official Pre-Clearance Audit
                  </span>
                  <h3 className="text-2xl font-light text-brand-text serif tracking-wide mt-1.5">
                    {name}
                  </h3>
                  <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest">
                    Scope: {entityType} • {industry}
                  </p>
                </div>

                {/* Score Gauge */}
                <div className={`px-4 py-3 rounded-2xl border text-center flex flex-col justify-center items-center shrink-0 min-w-28 ${getScoreColor(report.score)}`}>
                  <span className="text-[8px] font-mono uppercase tracking-widest block font-bold mb-0.5">Likelihood</span>
                  <span className="text-3xl font-light font-serif italic">{report.score}%</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 relative z-10">
                <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                  Executive AI Suitability Audit
                </h4>
                <p className="text-xs text-brand-text/90 leading-relaxed font-sans mt-1.5">
                  {report.summary}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 relative z-10 pt-2">
                <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                  Statutory Rule Checklist
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {report.checklist.map((item, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg border border-brand-border rounded-xl flex items-start gap-3">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-xs font-semibold ${item.passed ? "text-brand-text" : "text-amber-250 font-semibold"}`}>
                          {item.criterion}
                        </p>
                        <p className="text-[10px] text-brand-text-muted mt-1 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives Suggestions */}
              <div className="space-y-3 relative z-10 pt-2">
                <h4 className="text-[9px] font-medium text-brand-gold uppercase tracking-widest font-mono">
                  Recommended Alternatives
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Strip entity suffix to let them check again easily
                        const base = sug
                          .replace(" Private Limited", "")
                          .replace(" LLP", "")
                          .replace(" Ltd", "");
                        setName(base);
                      }}
                      className="text-[10px] font-mono bg-brand-bg hover:bg-brand-gold hover:text-black border border-brand-border hover:border-brand-gold px-3 py-1.5 rounded transition-all cursor-pointer text-brand-text-muted"
                    >
                      {sug} <RefreshCw className="w-2.5 h-2.5 inline-block ml-1 opacity-40 hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-brand-border pt-4 mt-6 flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (onOnboard) {
                      onOnboard(name, entityType);
                    }
                  }}
                  className="bg-brand-gold text-black font-mono uppercase tracking-widest text-[10px] px-6 py-3 rounded hover:bg-white transition-all cursor-pointer font-bold shadow-md shadow-brand-gold/10"
                >
                  Onboard This Brand Now <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
