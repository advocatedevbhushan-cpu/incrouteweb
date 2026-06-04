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
  Globe,
  Award,
  Layers,
  FileText,
  DollarSign,
  Info,
  Sliders,
  Check
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
  domains?: { ext: string; status: string }[];
  trademarks?: { class: string; status: string; matches: string }[];
  postFilingKit?: {
    steps: { step: string; detail: string; cost: string }[];
    stampDuties: string;
    timeframe: string;
  };
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

  // Advanced Report Tabs & Interactive Playground States
  const [activeReportTab, setActiveReportTab] = useState<"summary" | "trademarks" | "roc" | "kit">("summary");
  const [expandedCriteria, setExpandedCriteria] = useState<number | null>(null);
  
  // Sandbox Playground states
  const [sandboxActive, setSandboxActive] = useState(false);
  const [sandboxName, setSandboxName] = useState("");
  const [sandboxSuffix, setSandboxSuffix] = useState("Private Limited");

  // Live input properties validation diagnostics
  const [diagnostics, setDiagnostics] = useState({
    lengthValid: false,
    noSuffixInBrand: true,
    noRestrictedWords: true,
  });

  // Persist history whenever it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Real-time diagnostics engine as user types
  useEffect(() => {
    const trimmed = name.trim();
    const lower = trimmed.toLowerCase();
    
    // 1. Length validation (ROC prefers brand words above 3 characters)
    const lengthValid = trimmed.length >= 4;

    // 2. Suffix check (Founders shouldn't add Pvt Ltd, LLP in brand name inputs)
    const suffixes = ["pvt ltd", "private limited", "llp", "partnership", "opc", "one person company", "ltd"];
    const noSuffixInBrand = !suffixes.some(s => lower.endsWith(s));

    // 3. Restricted statutory terms check
    const restricted = ["bank", "state", "national", "federation", "government", "reserve", "ministry", "municipal", "trust", "union", "india", "bharat"];
    const noRestrictedWords = !restricted.some(w => lower.includes(w));

    setDiagnostics({ lengthValid, noSuffixInBrand, noRestrictedWords });
  }, [name]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await executeClearanceTest(name.trim(), entityType, industry);
  };

  const executeClearanceTest = async (targetName: string, targetEntity: string, targetIndustry: string) => {
    setIsChecking(true);
    setError("");
    setReport(null);
    setSandboxActive(false);

    try {
      const response = await fetch("/api/consult/name-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, entityType: targetEntity, industry: targetIndustry }),
      });
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        setActiveReportTab("summary");

        // Save to history
        const entry: NameCheckHistoryEntry = {
          id: `nc-${Date.now()}`,
          name: targetName,
          entityType: targetEntity,
          industry: targetIndustry,
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
          const filtered = prev.filter((h) => h.name.toLowerCase() !== targetName.toLowerCase());
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
    setActiveReportTab("summary");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    if (score >= 70) return "text-amber-400 border-amber-500/30 bg-amber-950/20";
    return "text-red-400 border-red-500/30 bg-red-950/20";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 85) return "#10B981"; // Emerald
    if (score >= 70) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 70) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const openSandbox = (suggestion: string) => {
    // Strip standard suffixes to get prefix
    const prefix = suggestion
      .replace(/\s*(Private Limited|LLP|LLP Partnership|Company|Pvt Ltd|Ltd)\s*$/gi, "")
      .trim();
    
    const isLLP = suggestion.toLowerCase().includes("llp");
    
    setSandboxName(prefix);
    setSandboxSuffix(isLLP ? "LLP" : "Private Limited");
    setSandboxActive(true);

    // Scroll to sandbox smoothly
    setTimeout(() => {
      document.getElementById("sandbox-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
          <img
            src="/incroute_logo.png"
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
          DeepSeek clearance processor and statutory compliance tracker. Scan Indian MCA records instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Input Form, Live Diagnostics & History */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Input Form */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 premium-card relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-2xl rounded-full" />
            
            <h3 className="text-lg font-light text-brand-text serif border-b border-brand-border pb-3 flex items-center gap-2 relative z-10">
              <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" /> suitability clearance check
            </h3>

            <form onSubmit={handleCheck} className="space-y-5 relative z-10">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Brand Name Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono flex justify-between">
                  <span>{t("name_checker_label_name") as string}</span>
                  <span className="text-brand-gold/70 lowercase font-sans">enter brand prefix only</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incroute"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none fast-transition"
                />
              </div>

              {/* Real-time Inline Diagnostic micro-alerts */}
              {name.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-brand-bg border border-brand-border/60 rounded-xl space-y-2 text-[10px]"
                >
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#9E896A] font-bold block mb-1">live brand properties scan</span>
                  
                  {/* Criteria 1: Length */}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${diagnostics.lengthValid ? "text-emerald-400" : "text-brand-text-muted/40"}`} />
                    <span className={diagnostics.lengthValid ? "text-brand-text" : "text-brand-text-muted"}>
                      Coined prefix length &gt;= 4 characters
                    </span>
                  </div>

                  {/* Criteria 2: No suffixes */}
                  <div className="flex items-center gap-2">
                    {diagnostics.noSuffixInBrand ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className={diagnostics.noSuffixInBrand ? "text-brand-text" : "text-amber-300 font-semibold"}>
                      {diagnostics.noSuffixInBrand 
                        ? "Exclude legal suffixes (Pvt Ltd / LLP)"
                        : "Warning: Suffix entered. Exclude 'Pvt Ltd'/'LLP' in brand field."
                      }
                    </span>
                  </div>

                  {/* Criteria 3: Restricted statutory words */}
                  <div className="flex items-center gap-2">
                    {diagnostics.noRestrictedWords ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span className={diagnostics.noRestrictedWords ? "text-brand-text" : "text-red-400 font-bold"}>
                      {diagnostics.noRestrictedWords 
                        ? "No restricted registry keywords (Bank, State, National)"
                        : "Prohibited: Restricted words require central approval"
                      }
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Entity Type Selector */}
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

              {/* Industry Sector Selector */}
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

              {/* Action Button */}
              <button
                type="submit"
                disabled={isChecking || !name.trim()}
                className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-xs py-3 rounded transition-all duration-150 fast-transition snappy-press font-bold flex items-center justify-center gap-2 mt-6 shadow-lg shadow-brand-gold/5 cursor-pointer"
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

          {/* Persistent History Panel */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-brand-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-text-muted font-semibold">
                <History className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
                {t("name_checker_history_title") as string}
                {history.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/20 rounded text-[9px] font-bold animate-pulse">
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
                              className="flex-1 text-left space-y-0.5 min-w-0 cursor-pointer"
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
                              className="shrink-0 text-[9px] font-mono uppercase tracking-wider text-brand-gold border border-brand-gold/25 hover:bg-brand-gold hover:text-black px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              {t("name_checker_history_rerun") as string}
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={clearHistory}
                          className="w-full flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/40 py-2 rounded-lg transition-colors mt-1 cursor-pointer"
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

        {/* Right Column: High-Fidelity Workspace & Multi-Tab Report Panel */}
        <div className="lg:col-span-7 space-y-5">
          
          {isChecking && (
            <div className="bg-brand-bg-lighter border border-brand-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[480px] space-y-4 shadow-xl">
              <Loader2 className="w-12 h-12 animate-spin text-brand-gold" />
              <div>
                <h4 className="text-brand-text font-serif text-lg font-light tracking-wide">
                  Querying Central MCA Registry...
                </h4>
                <p className="text-xs text-brand-text-muted font-mono mt-1 animate-pulse">
                  DeepSeek clearance agent is checking phonetics, trademarks, and statutory compliance
                </p>
              </div>
            </div>
          )}

          {!isChecking && !report && (
            <div className="bg-brand-bg-lighter/30 border border-dashed border-brand-border rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[480px] text-brand-text-muted space-y-3 font-serif italic shadow-inner">
              <Shield className="w-10 h-10 text-brand-text-muted/30 stroke-[1.2]" />
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

              {/* Report Header Metadata */}
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

                {/* Score Circular Gauge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-brand-border"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${report.score}, 100` }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke={getScoreStrokeColor(report.score)}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-brand-text">
                      {report.score}%
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider font-bold ${getScoreColor(report.score)}`}>
                    {report.score >= 85 ? "Approved" : report.score >= 70 ? "Caution" : "High Risk"}
                  </div>
                </div>
              </div>

              {/* Premium Workspace HSL-Tailored Tabs */}
              <div className="flex border-b border-brand-border/60">
                {[
                  { id: "summary", name: "Suitability Check", icon: Award },
                  { id: "trademarks", name: "IP & Domains Check", icon: Globe },
                  { id: "roc", name: "ROC Guidelines Audit", icon: Layers },
                  { id: "kit", name: "MCA Filing Setup Kit", icon: FileText }
                ].map((tb) => {
                  const isActive = activeReportTab === tb.id;
                  const Icon = tb.icon;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => setActiveReportTab(tb.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono uppercase tracking-wider font-bold border-b-2 transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "border-brand-gold text-brand-gold font-bold"
                          : "border-transparent text-brand-text-muted hover:text-brand-text hover:border-brand-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tb.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Executive Suitability Analysis Score */}
              {activeReportTab === "summary" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                      {t("name_checker_summary_title") as string}
                    </h4>
                    <p className="text-xs text-brand-text/95 leading-relaxed font-sans mt-1.5">
                      {report.summary}
                    </p>
                  </div>

                  {report.conflicts && report.conflicts.length > 0 && (
                    <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl space-y-2.5">
                      <h5 className="text-[9px] uppercase tracking-widest font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Registry ledger conflict warnings
                      </h5>
                      <ul className="list-disc pl-4 space-y-1.5 text-xs text-brand-text-muted font-sans">
                        {report.conflicts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Alternative Suggestions Sandbox Toggler */}
                  {report.suggestions && report.suggestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                          Registry recommended alternatives
                        </h4>
                        <span className="text-[8px] text-brand-gold font-mono uppercase">click name to customize</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {report.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => openSandbox(sug)}
                            className="text-[10px] font-mono bg-brand-bg hover:bg-brand-gold/10 border border-brand-border hover:border-brand-gold/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-brand-text-muted hover:text-brand-text flex items-center gap-1"
                          >
                            <span>{sug}</span>
                            <Sliders className="w-2.5 h-2.5 text-brand-gold/50" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Trademark & Domain clearance check */}
              {activeReportTab === "trademarks" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* IP Trademark phonetics */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand-gold" /> public IP trademark clearance scan
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {report.trademarks?.map((tm, idx) => (
                        <div key={idx} className="p-3.5 bg-brand-bg border border-brand-border rounded-xl flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-brand-text">{tm.class}</span>
                            <p className="text-[10px] text-brand-text-muted leading-normal">{tm.matches}</p>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 uppercase ${
                            tm.status === "Clear" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                              : "bg-red-500/10 text-red-400 border-red-500/25"
                          }`}>
                            {tm.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain Extensions check */}
                  <div className="space-y-3 pt-1">
                    <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-brand-gold" /> simulated domain namespace availability
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {report.domains?.map((dom, idx) => (
                        <div key={idx} className="p-3 bg-brand-bg border border-brand-border rounded-xl text-center space-y-1">
                          <span className="text-xs font-mono font-bold text-brand-text">{dom.ext}</span>
                          <span className={`block text-[9px] font-mono uppercase ${
                            dom.status === "Available" ? "text-emerald-400" : "text-brand-text-muted"
                          }`}>
                            {dom.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: ROC Registrar Guidelines Audit */}
              {activeReportTab === "roc" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                    Registrar of Companies statutory rules checklist
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {report.checklist.map((item, idx) => {
                      const isExpanded = expandedCriteria === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-brand-bg border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/25 transition-colors"
                        >
                          <button
                            onClick={() => setExpandedCriteria(isExpanded ? null : idx)}
                            className="w-full p-4 flex items-start justify-between gap-3 text-left cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              {item.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              )}
                              <span className={`text-xs font-semibold ${item.passed ? "text-brand-text" : "text-amber-300 font-semibold"}`}>
                                {item.criterion}
                              </span>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 text-brand-text-muted transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pl-11 text-[10px] text-brand-text-muted leading-relaxed font-sans border-t border-brand-border/40 pt-3 bg-brand-bg-darker/30">
                                  {item.reason}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Next-Step Filing Setup Kit */}
              {activeReportTab === "kit" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                      step-by-step name reservation protocol
                    </h4>
                    <div className="relative pl-5 border-l border-brand-border/65 ml-2.5 space-y-4">
                      {report.postFilingKit?.steps.map((st, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[27.5px] top-0 w-3.5 h-3.5 rounded-full bg-brand-gold/15 border border-brand-gold text-brand-gold text-[8px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-brand-text flex justify-between">
                              <span>{st.step}</span>
                              <span className="text-brand-gold/90 font-mono text-[10px]">{st.cost}</span>
                            </span>
                            <p className="text-[10px] text-brand-text-muted leading-relaxed">{st.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {/* Stamp duties */}
                    <div className="p-3.5 bg-brand-bg border border-brand-border rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold block">ROC stamp duty</span>
                      <p className="text-[10px] text-brand-text/90 leading-relaxed font-sans">{report.postFilingKit?.stampDuties}</p>
                    </div>

                    {/* Timeline clearance */}
                    <div className="p-3.5 bg-brand-bg border border-brand-border rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold block">government filing SLA</span>
                      <p className="text-[10px] text-brand-text/90 leading-relaxed font-sans">{report.postFilingKit?.timeframe}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Global Actions Row */}
              <div className="border-t border-brand-border pt-4 mt-6 flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => onOnboard && onOnboard(name, entityType)}
                  className="bg-brand-gold text-black font-mono uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg hover:bg-white transition-all cursor-pointer font-bold shadow-md shadow-brand-gold/10"
                >
                  {t("name_checker_onboard_btn") as string}{" "}
                  <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Suggested Alternatives Customization Sandbox Playground Drawer */}
          <AnimatePresence>
            {sandboxActive && (
              <motion.div
                id="sandbox-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-brand-bg-lighter border border-brand-gold rounded-2xl p-6 shadow-2xl relative space-y-5"
              >
                <div className="flex justify-between items-center border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-gold" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text font-serif">suitability clearance playground</h4>
                      <p className="text-[8px] text-brand-text-muted font-mono uppercase mt-0.5">customize and re-test suggested brand names</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSandboxActive(false)}
                    className="text-xs font-mono text-brand-text-muted hover:text-brand-gold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tweak spell */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">1. Brand prefix spelling</label>
                    <input
                      type="text"
                      value={sandboxName}
                      onChange={(e) => setSandboxName(e.target.value)}
                      className="w-full bg-brand-input-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                    />
                  </div>

                  {/* Suffix toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">2. Registrar suffix structure</label>
                    <div className="flex bg-brand-bg rounded-lg border border-brand-border p-0.5">
                      {["Private Limited", "LLP"].map((suf) => (
                        <button
                          key={suf}
                          type="button"
                          onClick={() => setSandboxSuffix(suf)}
                          className={`flex-1 text-[9px] font-mono py-1 rounded cursor-pointer ${
                            sandboxSuffix === suf ? "bg-brand-gold text-black font-bold" : "text-brand-text-muted hover:text-brand-text"
                          }`}
                        >
                          {suf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated preview display */}
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border text-center space-y-1">
                  <span className="text-[8px] uppercase font-mono tracking-widest text-[#9E896A] block">full proposed trademark prefix</span>
                  <span className="text-xs font-semibold text-brand-gold font-sans block">{sandboxName} {sandboxSuffix}</span>
                </div>

                {/* Sandbox Action */}
                <div className="flex justify-end gap-2 text-xs pt-1">
                  <button 
                    type="button"
                    onClick={() => setSandboxActive(false)}
                    className="bg-transparent hover:bg-brand-bg border border-brand-border text-brand-text-muted px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={!sandboxName.trim()}
                    onClick={() => {
                      const entityStr = sandboxSuffix === "LLP" 
                        ? "Limited Liability Partnership (LLP)" 
                        : "Private Limited Company (Pvt Ltd)";
                      executeClearanceTest(sandboxName.trim(), entityStr, industry);
                    }}
                    className="bg-brand-gold text-black font-mono font-bold uppercase tracking-widest text-[9px] px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> run clearance test
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
