import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  History,
  Trash2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "../lib/LanguageContext";
import { NameCheckHistoryEntry } from "../types";

const HISTORY_KEY = "incroute_name_check_history";
const MAX_HISTORY = 5;

interface NameCheckReport {
  score: number;
  summary: string;
  conflicts: string[];
  checklist: { criterion: string; passed: boolean; reason: string }[];
  suggestions: string[];
}

interface NameFeasibilityCheckerProps {
  onOnboard?: (name: string, entityType: string) => void;
}

function loadHistory(): NameCheckHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: NameCheckHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export default function NameFeasibilityChecker({ onOnboard }: NameFeasibilityCheckerProps) {
  const { t } = useLang();

  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("Private Limited Company (Pvt Ltd)");
  const [industry, setIndustry] = useState("Technology & Software Services");
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<NameCheckReport | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<NameCheckHistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);

  // Persist history whenever it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

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
        body: JSON.stringify({ name, entityType, industry }),
      });
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);

        // Save to history
        const entry: NameCheckHistoryEntry = {
          id: `nc-${Date.now()}`,
          name: name.trim(),
          entityType,
          industry,
          score: data.report.score,
          checkedAt: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          report: data.report,
        };

        setHistory((prev) => {
          const filtered = prev.filter((h) => h.name.toLowerCase() !== name.trim().toLowerCase());
          return [entry, ...filtered].slice(0, MAX_HISTORY);
        });
      } else {
        setError(data.error || "Failed to generate report. Please try again.");
      }
    } catch {
      setError("Failed to connect to the advisor. Please check your internet connection.");
    } finally {
      setIsChecking(false);
    }
  };

  const loadFromHistory = (entry: NameCheckHistoryEntry) => {
    setName(entry.name);
    setEntityType(entry.entityType);
    setIndustry(entry.industry);
    setReport(entry.report);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-500 border-amber-500/30 bg-amber-500/10";
    return "text-red-500 border-red-500/30 bg-red-500/10";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
          <img
            src="/ashoka_lion_gold.png"
            className="w-5 h-5 rounded-full object-cover border border-brand-gold/40 bg-black"
            alt="Emblem"
          />
          {t("name_checker_badge") as string}
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          {t("name_checker_title") as string}{" "}
          <span className="text-brand-gold italic font-normal">
            {t("name_checker_title_accent") as string}
          </span>
        </h1>
        <p className="text-sm text-brand-text-muted font-sans leading-relaxed max-w-xl mx-auto">
          {t("name_checker_subtitle") as string}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        {/* Left: Form + History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Form Card */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 premium-card">
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
                <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">
                  {t("name_checker_label_name") as string}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none fast-transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">
                  {t("name_checker_label_entity") as string}
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border focus:border-brand-gold rounded px-4 py-2.5 text-xs text-brand-text-muted outline-none cursor-pointer fast-transition"
                >
                  <option>Private Limited Company (Pvt Ltd)</option>
                  <option>Limited Liability Partnership (LLP)</option>
                  <option>One Person Company (OPC)</option>
                  <option>Partnership Firm</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">
                  {t("name_checker_label_industry") as string}
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border focus:border-brand-gold rounded px-4 py-2.5 text-xs text-brand-text-muted outline-none cursor-pointer fast-transition"
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
                className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-xs py-3 rounded transition-all duration-150 fast-transition snappy-press font-bold flex items-center justify-center gap-2 mt-6 shadow-lg shadow-brand-gold/5"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t("name_checker_btn_loading") as string}
                  </>
                ) : (
                  <>
                    {t("name_checker_btn") as string} <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-brand-bg transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-text-muted font-semibold">
                <History className="w-3.5 h-3.5 text-brand-gold" />
                {t("name_checker_history_title") as string}
                {history.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/20 rounded text-[9px] font-bold">
                    {history.length}
                  </span>
                )}
              </div>
              <ChevronRight
                className={`w-4 h-4 text-brand-text-muted transition-transform duration-200 ${showHistory ? "rotate-90" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-brand-border px-4 py-3 space-y-2">
                    {history.length === 0 ? (
                      <p className="text-[10px] text-brand-text-muted font-mono italic py-2 text-center">
                        {t("name_checker_history_empty") as string}
                      </p>
                    ) : (
                      <>
                        {history.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between gap-3 p-3 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-gold/25 transition-colors group"
                          >
                            <button
                              onClick={() => loadFromHistory(entry)}
                              className="flex-1 text-left space-y-0.5 min-w-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-brand-text truncate">
                                  {entry.name}
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${getScoreBadgeColor(entry.score)}`}
                                >
                                  {entry.score}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] text-brand-text-muted font-mono">
                                <Clock className="w-2.5 h-2.5" />
                                {entry.checkedAt}
                              </div>
                            </button>
                            <button
                              onClick={() => loadFromHistory(entry)}
                              className="shrink-0 text-[9px] font-mono uppercase tracking-wider text-brand-gold border border-brand-gold/25 hover:bg-brand-gold hover:text-black px-2 py-1 rounded transition-colors"
                            >
                              {t("name_checker_history_rerun") as string}
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={clearHistory}
                          className="w-full flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/40 py-2 rounded-lg transition-colors mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t("name_checker_history_clear") as string}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Report */}
        <div className="lg:col-span-7">
          {isChecking && (
            <div className="bg-brand-bg-lighter border border-brand-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[420px] space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
              <div>
                <h4 className="text-brand-text font-serif text-lg font-light tracking-wide">
                  Querying Central Registries...
                </h4>
                <p className="text-xs text-brand-text-muted font-mono mt-1">
                  Checking phonetics, trademarks, and semantic compliance
                </p>
              </div>
            </div>
          )}

          {!isChecking && !report && (
            <div className="bg-brand-bg-lighter/30 border border-dashed border-brand-border rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[420px] text-brand-text-muted space-y-3 font-serif italic">
              <Shield className="w-8 h-8 text-brand-text-muted/40 stroke-[1.5]" />
              <p className="text-xs">
                Your AI pre-incorporation suitability report will be generated here.
              </p>
            </div>
          )}

          {!isChecking && report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden premium-card fast-transition"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />

              {/* Report Header */}
              <div className="border-b border-brand-border pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1">
                  <span className="text-[8px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    {t("name_checker_report_title") as string}
                  </span>
                  <h3 className="text-2xl font-light text-brand-text serif tracking-wide mt-1.5">
                    {name}
                  </h3>
                  <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest">
                    Scope: {entityType} • {industry}
                  </p>
                </div>

                <div
                  className={`px-4 py-3 rounded-2xl border text-center flex flex-col justify-center items-center shrink-0 min-w-28 ${getScoreColor(report.score)}`}
                >
                  <span className="text-[8px] font-mono uppercase tracking-widest block font-bold mb-0.5">
                    {t("name_checker_score_label") as string}
                  </span>
                  <span className="text-3xl font-light font-serif italic">{report.score}%</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 relative z-10">
                <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                  {t("name_checker_summary_title") as string}
                </h4>
                <p className="text-xs text-brand-text/90 leading-relaxed font-sans mt-1.5">
                  {report.summary}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 relative z-10 pt-2">
                <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                  {t("name_checker_checklist_title") as string}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {report.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-brand-bg border border-brand-border rounded-xl flex items-start gap-3"
                    >
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            item.passed ? "text-brand-text" : "text-amber-250 font-semibold"
                          }`}
                        >
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

              {/* Suggestions */}
              <div className="space-y-3 relative z-10 pt-2">
                <h4 className="text-[9px] font-medium text-brand-gold uppercase tracking-widest font-mono">
                  {t("name_checker_suggestions_title") as string}
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const base = sug
                          .replace(" Private Limited", "")
                          .replace(" LLP", "")
                          .replace(" Ltd", "");
                        setName(base);
                      }}
                      className="text-[10px] font-mono bg-brand-bg hover:bg-brand-gold hover:text-black border border-brand-border hover:border-brand-gold px-3 py-1.5 rounded transition-all cursor-pointer text-brand-text-muted"
                    >
                      {sug}{" "}
                      <RefreshCw className="w-2.5 h-2.5 inline-block ml-1 opacity-40 hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="border-t border-brand-border pt-4 mt-6 flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => onOnboard && onOnboard(name, entityType)}
                  className="bg-brand-gold text-black font-mono uppercase tracking-widest text-[10px] px-6 py-3 rounded hover:bg-white transition-all cursor-pointer font-bold shadow-md shadow-brand-gold/10"
                >
                  {t("name_checker_onboard_btn") as string}{" "}
                  <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
