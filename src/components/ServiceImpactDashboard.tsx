import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Info,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calculator,
  Compass,
  MapPin,
  Download,
  Check,
  X as CloseIcon,
  HelpCircle,
  Building,
  Award,
  Layers,
  ChevronDown,
} from "lucide-react";
import jsPDF from "jspdf";
import { useTheme } from "../lib/useTheme";

interface ServiceImpactDashboardProps {
  onEntitySelect?: (entityId: string) => void;
}

export default function ServiceImpactDashboard({ onEntitySelect }: ServiceImpactDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cost" | "timeline" | "compliance" | "growth" | "calculator" | "matcher">("cost");
  const [hoveredCostIdx, setHoveredCostIdx] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<string>("KA");
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  // ROI Calculator State
  const [annualRevenue, setAnnualRevenue] = useState<number>(5000000); // 50 Lakhs default
  const [profitMargin, setProfitMargin] = useState<number>(20); // 20% margin

  // Entity Matcher State (5 Dimensions)
  const [matcherFunding, setMatcherFunding] = useState<"vc" | "bootstrapped" | "solo">("vc");
  const [matcherFounders, setMatcherFounders] = useState<"1" | "2-5" | "5+">("2-5");
  const [matcherBusiness, setMatcherBusiness] = useState<"tech" | "trading" | "services" | "ngo">("tech");
  const [matcherForeign, setMatcherForeign] = useState<"yes" | "no">("no");
  const [matcherEsop, setMatcherEsop] = useState<"yes" | "no">("yes");
  const [inspectedEntityId, setInspectedEntityId] = useState<string | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Calculations for ROI / Tax Savings
  const netProfit = useMemo(() => (annualRevenue * profitMargin) / 100, [annualRevenue, profitMargin]);
  const pvtLtdTax = useMemo(() => Math.round(netProfit * 0.2517), [netProfit]); // 22% + 4% cess
  const llpTax = useMemo(() => Math.round(netProfit * 0.312), [netProfit]); // 30% + 4% cess
  const taxSavings = useMemo(() => Math.max(0, llpTax - pvtLtdTax), [llpTax, pvtLtdTax]);
  const complianceSavings = useMemo(() => Math.round(annualRevenue * 0.008 + 45000), [annualRevenue]);

  // Multi-Entity Ranked Intelligence Engine
  const rankedEntities = useMemo(() => {
    // 1. Private Limited Score Calculation
    let pvtScore = 65;
    if (matcherFunding === "vc") pvtScore += 22;
    if (matcherBusiness === "tech") pvtScore += 8;
    if (matcherEsop === "yes") pvtScore += 12;
    if (matcherForeign === "yes") pvtScore += 6;
    if (matcherFounders === "2-5") pvtScore += 6;
    if (matcherFounders === "1") pvtScore -= 18;
    if (matcherBusiness === "ngo") pvtScore -= 45;
    pvtScore = Math.min(99, Math.max(25, pvtScore));

    // 2. LLP Score Calculation
    let llpScore = 65;
    if (matcherFunding === "bootstrapped") llpScore += 18;
    if (matcherBusiness === "services" || matcherBusiness === "trading") llpScore += 15;
    if (matcherEsop === "yes") llpScore -= 30;
    if (matcherFunding === "vc") llpScore -= 28;
    if (matcherFounders === "1") llpScore -= 45;
    if (matcherForeign === "yes") llpScore += 4;
    if (matcherBusiness === "ngo") llpScore -= 45;
    llpScore = Math.min(96, Math.max(20, llpScore));

    // 3. OPC Score Calculation
    let opcScore = 40;
    if (matcherFounders === "1") opcScore += 52;
    if (matcherFunding === "solo") opcScore += 14;
    if (matcherFounders !== "1") opcScore -= 48;
    if (matcherForeign === "yes") opcScore -= 45; // Foreigners cannot form OPC
    if (matcherEsop === "yes") opcScore -= 25;
    if (matcherFunding === "vc") opcScore -= 20;
    if (matcherBusiness === "ngo") opcScore -= 40;
    opcScore = Math.min(96, Math.max(15, opcScore));

    // 4. Section 8 (Non-Profit)
    let s8Score = 20;
    if (matcherBusiness === "ngo") s8Score += 75;
    else s8Score -= 10;
    s8Score = Math.min(98, Math.max(10, s8Score));

    const list = [
      {
        id: "pvt-ltd",
        title: "Private Limited Company",
        score: pvtScore,
        badge: "VC & Startup Standard",
        desc: "The gold standard for high-growth ventures seeking institutional equity capital, foreign investment, and employee stock options (ESOPs).",
        pros: [
          "100% FDI Eligible via RBI Automatic Route",
          "Permits Equity Stock Issuance & ESOP Option Pools",
          "Eligible for Startup India 3-Year 80-IAC Tax Exemption",
          "Separate Corporate Personality & Limited Liability",
        ],
        tradeoffs: [
          "Mandatory Statutory Auditor Appointment (Form ADT-1 within 30 days)",
          "Form INC-20A Commencement of Business Filing required within 180 days",
          "Annual ROC Filings (AOC-4 Financials & MGT-7 Annual Return)",
        ],
        docs: ["PAN & Aadhaar of all Directors", "Bank Statement / Electricity Bill (< 2 months)", "Registered Office NOC & Utility Bill"],
      },
      {
        id: "llp",
        title: "Limited Liability Partnership (LLP)",
        score: llpScore,
        badge: "Low Compliance Burden",
        desc: "Ideal for consulting firms, professional practices, and bootstrapped trade ventures seeking limited liability with minimal statutory overhead.",
        pros: [
          "Zero Mandatory Statutory Audit below ₹40L Turnover / ₹25L Capital",
          "No Dividend Distribution Tax on Partner Profit Share",
          "Internal flexibility governed by Custom Partnership Deed",
        ],
        tradeoffs: [
          "Cannot issue Equity Shares or ESOP Stock Options",
          "Not preferred by Institutional Venture Capital / Angel Funds",
          "Requires minimum 2 Designated Partners at all times",
        ],
        docs: ["PAN & Aadhaar of Designated Partners", "Address Proof of Partners", "Registered Office Proof & NOC"],
      },
      {
        id: "opc",
        title: "One Person Company (OPC)",
        score: opcScore,
        badge: "Solo Founder Protection",
        desc: "Tailored for solo entrepreneurs wanting 100% corporate limited liability protection without needing a co-founder or second director.",
        pros: [
          "Single Director & Single Shareholder structure",
          "Full Corporate Entity Status with Limited Liability",
          "Seamless future conversion into Pvt Ltd as capital scales",
        ],
        tradeoffs: [
          "Mandatory Nominee Director appointment in MOA",
          "Only Indian Resident Citizens are permitted to incorporate",
          "Cannot raise equity funding without conversion to Pvt Ltd",
        ],
        docs: ["Founder & Nominee PAN + Aadhaar", "Nominee Consent Form (INC-3)", "Registered Office Electricity Bill & NOC"],
      },
      {
        id: "section8",
        title: "Section 8 Non-Profit Organization",
        score: s8Score,
        badge: "Philanthropic & CSR Eligible",
        desc: "Formed to promote commerce, art, science, education, charity, or environmental protection with zero dividend distribution to members.",
        pros: [
          "Eligible for 12A & 80G Tax Exemption Certificates",
          "High credibility for CSR Grants & Government Subsidies",
          "No minimum capital requirement",
        ],
        tradeoffs: [
          "Profits cannot be distributed as dividends to promoters",
          "Central Government / ROC license required prior to incorporation",
          "Strict regulatory oversight on foreign donations (FCRA)",
        ],
        docs: ["Promoters KYC & Photographs", "Draft Objects & 3-Year Future Budget Estimates", "Registered Office Proof"],
      },
    ];

    // Sort descending by score
    return list.sort((a, b) => b.score - a.score);
  }, [matcherFunding, matcherFounders, matcherBusiness, matcherForeign, matcherEsop]);

  // Active Selected / Inspected Entity
  const matchedEntity = useMemo(() => {
    if (inspectedEntityId) {
      const found = rankedEntities.find((e) => e.id === inspectedEntityId);
      if (found) return found;
    }
    return rankedEntities[0];
  }, [rankedEntities, inspectedEntityId]);

  // State-Specific ROC SLA Radar
  const stateData: Record<string, { name: string; city: string; avgDays: string; stampDuty: string; mcaSpeed: number }> = {
    KA: { name: "Karnataka", city: "Bengaluru ROC", avgDays: "3.6 Days", stampDuty: "₹1,000 (Fixed e-Stamp)", mcaSpeed: 98 },
    MH: { name: "Maharashtra", city: "Mumbai / Pune ROC", avgDays: "4.2 Days", stampDuty: "₹1,000 - ₹2,000 (Based on Capital)", mcaSpeed: 95 },
    DL: { name: "NCT of Delhi", city: "Delhi & Haryana ROC", avgDays: "3.8 Days", stampDuty: "₹360 (Lowest in India)", mcaSpeed: 97 },
    TS: { name: "Telangana", city: "Hyderabad ROC", avgDays: "4.0 Days", stampDuty: "₹1,000 (Fixed e-Stamp)", mcaSpeed: 96 },
    TN: { name: "Tamil Nadu", city: "Chennai / Coimbatore ROC", avgDays: "4.4 Days", stampDuty: "₹1,000 - ₹1,500", mcaSpeed: 94 },
  };

  // Cost Breakdown Data
  const costData = [
    { name: "Government & MCA Fees", value: 42, color: "#6366F1", amount: "₹4,500 - ₹7,000", desc: "SPICe+ Part B, Name reservation (RUN), MCA stamp duty & PAN/TAN registration fees." },
    { name: "CA / CS Legal Advisory", value: 36, color: "#06B6D4", amount: "₹3,999 - ₹5,999", desc: "MOA/AOA drafting, statutory auditor appointment documentation & professional certification." },
    { name: "DSC & DIN Credentials", value: 16, color: "#10B981", amount: "₹1,500 - ₹2,500", desc: "Class-3 Digital Signature Certificates with crypto token & Director Identification Numbers." },
    { name: "State Stamping & Notary", value: 6, color: "#F59E0B", amount: "₹500 - ₹1,200", desc: "State-specific electronic stamp duty, affidavit notarization & registered office proofs." },
  ];

  // Timeline SLA Benchmarks
  const timelineData = [
    { name: "Pvt Ltd", days: 7, mcaFiling: 3, fullDays: "7-10 Days" },
    { name: "LLP", days: 11, mcaFiling: 5, fullDays: "10-14 Days" },
    { name: "OPC", days: 8, mcaFiling: 4, fullDays: "7-9 Days" },
    { name: "Nidhi", days: 16, mcaFiling: 7, fullDays: "15-20 Days" },
  ];

  // 1-Year Compliance Roadmap Curve
  const complianceTimeline = [
    { month: "Day 0", score: 10, milestone: "Incorporation Cert Issued" },
    { month: "Day 30", score: 40, milestone: "Auditor Appointed (ADT-1) & 1st Board Meeting" },
    { month: "Day 60", score: 65, milestone: "Share Certificates Issued & Bank A/c Active" },
    { month: "Day 180", score: 85, milestone: "Form INC-20A Commencement of Business" },
    { month: "Month 9", score: 92, milestone: "DIN e-KYC (DIR-3) & GST Returns" },
    { month: "Year 1", score: 100, milestone: "Annual Filing AOC-4 & MGT-7" },
  ];

  // 5-Year Growth Scalability Index
  const growthData = [
    { year: "Year 1", pvtLtd: 35, llp: 22, opc: 18 },
    { year: "Year 2", pvtLtd: 68, llp: 44, opc: 32 },
    { year: "Year 3", pvtLtd: 92, llp: 62, opc: 46 },
    { year: "Year 4", pvtLtd: 115, llp: 78, opc: 58 },
    { year: "Year 5", pvtLtd: 140, llp: 92, opc: 68 },
  ];

  const tabs = [
    { id: "cost", label: "Cost Breakdown", icon: DollarSign },
    { id: "calculator", label: "Estimated ROI & Tax Simulator*", icon: Calculator },
    { id: "matcher", label: "AI Entity Matchmaker", icon: Compass },
    { id: "timeline", label: "SLA Timelines", icon: Clock },
    { id: "compliance", label: "Compliance Curve", icon: CheckCircle2 },
    { id: "growth", label: "Growth Scalability", icon: TrendingUp },
  ];

  // Custom Glass Tooltip with forced high z-index and absolute top layering
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: "#0F172A",
          color: "#F8FAFC",
          border: "1px solid rgba(99, 102, 241, 0.4)",
          borderRadius: "12px",
          padding: "10px 14px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          zIndex: 99999,
          pointerEvents: "none",
          minWidth: "160px"
        }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: 700, color: "#E2E8F0" }}>{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "12px", color: "#94A3B8", marginTop: "3px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color || item.fill || "#6366F1" }} />
                <span>{item.name}:</span>
              </span>
              <strong style={{ color: "#FFFFFF", fontFamily: "monospace" }}>
                {item.value} {activeTab === "cost" || activeTab === "compliance" ? "%" : (activeTab === "timeline" ? "Days" : "pts")}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // PDF Report Generator
  const generateFeasibilityPdf = () => {
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const navy: [number, number, number] = [15, 23, 42];
      const indigo: [number, number, number] = [99, 102, 241];

      // Header Banner
      doc.setFillColor(...navy);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("INCroute Corporate Intelligence", 16, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("STATUTORY FEASIBILITY & REGULATORY SLA REPORT", 16, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 194, 16, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("VERIFIED LEGAL BRIEF", 194, 22, { align: "right" });

      // Body Content
      doc.setTextColor(...navy);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Selected Entity Recommendation", 16, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${matchedEntity.title} (Match Score: ${matchedEntity.score}%)`, 16, 56);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(matchedEntity.desc, 16, 62, { maxWidth: 178 });

      // ROI Calculation Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 76, 182, 38, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 76, 182, 38, 3, 3, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("2. Financial & Tax Projections (Estimated)", 18, 84);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Projected Annual Turnover: Rs. ${(annualRevenue / 100000).toFixed(1)} Lakhs`, 18, 92);
      doc.text(`Net Taxable Profit (${profitMargin}% Margin): Rs. ${(netProfit / 100000).toFixed(1)} Lakhs`, 18, 98);
      doc.text(`Estimated Direct Corporate Tax Savings (Pvt Ltd vs LLP): Rs. ${(taxSavings / 1000).toFixed(1)}k / yr`, 18, 104);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...indigo);
      doc.text(`Total Projected Compliance & Tax Savings: Rs. ${((taxSavings + complianceSavings) / 100000).toFixed(2)} Lakhs`, 18, 110);

      // Cost Breakdown Table
      doc.setTextColor(...navy);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("3. Transparent Statutory Cost Matrix", 16, 126);

      let y = 136;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 6, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Cost Component", 18, y - 1);
      doc.text("Share %", 110, y - 1);
      doc.text("Estimated Cost (Rs.)", 192, y - 1, { align: "right" });

      doc.setFont("helvetica", "normal");
      for (const item of costData) {
        y += 8;
        doc.text(item.name, 18, y);
        doc.text(`${item.value}%`, 110, y);
        doc.text(item.amount, 192, y, { align: "right" });
        doc.setDrawColor(226, 232, 240);
        doc.line(14, y + 2.5, 196, y + 2.5);
      }

      // 1-Year Compliance Roadmap
      y += 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("4. 365-Day Corporate Compliance Milestones", 16, y);

      y += 8;
      for (const step of complianceTimeline) {
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`• ${step.month}:`, 18, y);
        doc.setFont("helvetica", "normal");
        doc.text(step.milestone, 42, y);
      }

      // Footer
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 285, 210, 12, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("INCroute Corporate Technologies · www.incroute.com · support@incroute.com", 105, 292, { align: "center" });

      doc.save(`INCroute_Feasibility_${matchedEntity.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const gridStroke = isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(226, 232, 240, 0.9)";
  const axisStroke = isDark ? "#94A3B8" : "#64748B";

  return (
    <div className="space-y-10 font-sans">
      {/* ═══ LUXURY HERO HEADER ═══ */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800/80 uppercase tracking-widest font-mono shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Corporate Intelligence Matrix
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Service Impact <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400">Visual Analytics.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Interactive statutory intelligence suite: simulate corporate tax savings, match legal structures with AI, track multi-state ROC SLAs, and download custom corporate feasibility reports.
        </p>

        {/* Live Key Metric Pills & PDF Action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MCA SPICe+ Fast Track: <strong>7-10 Days</strong></span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Digital Signature: <strong>Class-3 Token</strong></span>
          </div>
          <button
            onClick={generateFeasibilityPdf}
            disabled={downloadingPdf}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer border-none transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? "Compiling PDF…" : "Download Feasibility PDF"}</span>
          </button>
        </div>
      </div>

      {/* ═══ INTERACTIVE TAB NAVIGATOR ═══ */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-inner max-w-full overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap outline-none border-none ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN VISUAL CARD ═══ */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white/95 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden max-w-6xl mx-auto text-left"
      >
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ─── TAB: COST BREAKDOWN ─── */}
        {activeTab === "cost" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Statutory Cost Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Itemized distribution of government stamp duties, digital credential tokens, and chartered legal audit charges.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard Incorporation:</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">₹6,999 - ₹12,999</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Donut Chart with Clear Tooltip and Zero Occlusion */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[300px]">
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      onMouseEnter={(_, index) => setHoveredCostIdx(index)}
                      onMouseLeave={() => setHoveredCostIdx(null)}
                    >
                      {costData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={hoveredCostIdx === null || hoveredCostIdx === index ? 1 : 0.4}
                          style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      wrapperStyle={{ zIndex: 99999, pointerEvents: "none" }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center KPI Overlay with pointer-events-none so tooltip never hides */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    {hoveredCostIdx !== null ? costData[hoveredCostIdx].name.split(" ")[0] : "Average"}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {hoveredCostIdx !== null ? `${costData[hoveredCostIdx].value}%` : "100%"}
                  </span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                    {hoveredCostIdx !== null ? "Proportion" : "Transparent"}
                  </span>
                </div>
              </div>

              {/* Cost Item Cards */}
              <div className="lg:col-span-7 space-y-3">
                {costData.map((item, idx) => {
                  const isHovered = hoveredCostIdx === idx;
                  return (
                    <motion.div
                      key={idx}
                      onMouseEnter={() => setHoveredCostIdx(idx)}
                      onMouseLeave={() => setHoveredCostIdx(null)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isHovered
                          ? "bg-indigo-50/70 dark:bg-slate-800/90 border-indigo-500 shadow-md scale-[1.01]"
                          : "bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">{item.amount}</span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm" style={{ color: item.color }}>
                            {item.value}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed pl-6.5">{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 dark:from-indigo-950/40 via-cyan-50 dark:via-cyan-950/20 to-transparent border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3.5">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-bold">Incroute Zero-Surprise Guarantee:</strong> All initial incorporation packages include verified name approval fees on MCA Portal, Certificate of Incorporation (COI), e-PAN, e-TAN, and digital compliance locker.
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ESTIMATED ROI & TAX SIMULATOR ─── */}
        {activeTab === "calculator" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> *Estimated ROI & Tax Simulator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simulate estimated corporate tax advantages (22% vs 30%) and calculate your annual regulatory savings with INCroute.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                Tax Exemption: Section 80-IAC Ready
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sliders Area */}
              <div className="lg:col-span-6 space-y-6">
                {/* Revenue Slider */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Projected Annual Revenue</span>
                    <span className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">
                      ₹{(annualRevenue / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={50000000}
                    step={250000}
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹5 Lakhs</span>
                    <span>₹2.5 Cr</span>
                    <span>₹5 Crores</span>
                  </div>
                </div>

                {/* Margin Slider */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Profit Margin</span>
                    <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>5% (Thin Margin)</span>
                    <span>25% (Standard)</span>
                    <span>50% (High Margin SaaS)</span>
                  </div>
                </div>
              </div>

              {/* Real-time ROI Output Cards */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-mono">Net Profit Pool</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{(netProfit / 100000).toFixed(2)} L</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Pre-tax operating surplus generated.</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">Tax Savings (Pvt Ltd)</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{(taxSavings / 1000).toFixed(1)}k</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Pvt Ltd 22% rate vs LLP 30% flat tax.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Compliance Savings</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{(complianceSavings / 1000).toFixed(1)}k</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated filings & zero penalty risk.</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200 dark:border-purple-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider font-mono">Total Annual Benefit</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    ₹{((taxSavings + complianceSavings) / 100000).toFixed(2)} L
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Total estimated 1st year surplus.</p>
                </div>
              </div>
            </div>

            {/* Prominent Statutory Asterisk & Disclaimer Note */}
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">*</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Statutory Estimation Notice:</strong> Figures calculated in this ROI & Tax Simulator are indicative mathematical estimates based on current standard corporate tax brackets (22% Base Corporate Tax u/s 115BAA + Surcharge & Cess vs. 30% Flat Rate for LLPs/Partnerships) and standard corporate ROC filing cycles. Actual tax liability and permissible business deductions are subject to audited books of accounts and Chartered Accountant review.
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB: AI ENTITY MATCHMAKER (EXPANDED 5-FACTOR ARCHITECTURE) ─── */}
        {activeTab === "matcher" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> AI Entity Matchmaker & Multi-Structure Leaderboard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluate your capital strategy, co-founder composition, foreign investment (FDI), and ESOP roadmap to get a ranked legal architecture.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  5-Dimensional Fit
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* 5-Step Smart Questionnaire */}
              <div className="lg:col-span-5 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">1. Incorporation Parameters</h4>

                {/* Q1: Funding */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                    Capital & Fundraising Strategy:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "vc", label: "Angel / VC Equity" },
                      { id: "bootstrapped", label: "Bootstrapped" },
                      { id: "solo", label: "Solo Capital" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setMatcherFunding(opt.id as any); setInspectedEntityId(null); }}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          matcherFunding === opt.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Founders */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                    Number of Directors / Founders:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "1", label: "1 (Solo Founder)" },
                      { id: "2-5", label: "2 - 5 Co-Founders" },
                      { id: "5+", label: "5+ Shareholders" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setMatcherFounders(opt.id as any); setInspectedEntityId(null); }}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          matcherFounders === opt.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3: Business Domain */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                    Industry Domain:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "tech", label: "Tech / SaaS / App" },
                      { id: "trading", label: "E-Commerce / Trade" },
                      { id: "services", label: "Consulting / Agency" },
                      { id: "ngo", label: "Non-Profit / NGO" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setMatcherBusiness(opt.id as any); setInspectedEntityId(null); }}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          matcherBusiness === opt.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4 & Q5 in 2-column layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Q4: FDI / Foreign */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-mono font-bold">4</span>
                      NRI / Foreign Investors?
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: "yes", label: "Yes (FDI / NRI)" },
                        { id: "no", label: "No (Residents)" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setMatcherForeign(opt.id as any); setInspectedEntityId(null); }}
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            matcherForeign === opt.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q5: ESOP Options */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-mono font-bold">5</span>
                      Employee ESOPs?
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: "yes", label: "Yes (Stock ESOPs)" },
                        { id: "no", label: "No (Cash Payroll)" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setMatcherEsop(opt.id as any); setInspectedEntityId(null); }}
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            matcherEsop === opt.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard & Matched Deep-Dive Card */}
              <div className="lg:col-span-7 space-y-5">
                {/* Multi-Entity Ranked Leaderboard */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      2. Live Compatibility Leaderboard
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Click any entity to inspect</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {rankedEntities.map((ent, idx) => {
                      const isSelected = matchedEntity.id === ent.id;
                      const isTopRanked = idx === 0;
                      return (
                        <button
                          key={ent.id}
                          type="button"
                          onClick={() => setInspectedEntityId(ent.id)}
                          className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]"
                              : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                            {isTopRanked && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold uppercase">
                                Best Fit
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{ent.title.split(" ")[0]}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${ent.score}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{ent.score}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Entity Deep-Dive Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-mono font-bold shadow-sm">
                        {matchedEntity.score}% Fit Score
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{matchedEntity.badge}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Statutory Analysis</span>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{matchedEntity.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{matchedEntity.desc}</p>
                  </div>

                  {/* Pros & Statutory Trade-offs Dual Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-100 dark:border-slate-800">
                    {/* Advantages */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Key Statutory Advantages:
                      </span>
                      {matchedEntity.pros.map((pro, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trade-offs */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Compliance Governance:
                      </span>
                      {matchedEntity.tradeoffs.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      📋 Required Documents Checklist for {matchedEntity.title}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {matchedEntity.docs.map((doc, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                          ✓ {doc}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onEntitySelect) {
                          onEntitySelect(matchedEntity.id);
                        } else {
                          window.location.href = `/services/private-corporate/${matchedEntity.id}`;
                        }
                      }}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer border-none transition-all"
                    >
                      <span>Start {matchedEntity.title.split(" ")[0]} Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onEntitySelect) {
                          onEntitySelect("virtual-cfo");
                        } else {
                          window.location.href = "/services/enterprise-growth/virtual-cfo";
                        }
                      }}
                      className="py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 cursor-pointer transition-all"
                    >
                      <span>Book Free 15-Min CA Strategy Call</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: TIMELINE COMPARISON & STATE RADAR ─── */}
        {activeTab === "timeline" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> MCA Turnaround Benchmarks (SLA) & State ROC Radar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparison of government turnaround times across corporate entity types and state ROC jurisdictions.</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 99.4% On-Time Execution
              </div>
            </div>

            {/* State Selection Radar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-indigo-600" /> Select Innovation Hub / ROC:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stateData).map(([code, s]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedState(code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                      selectedState === code
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                    }`}
                  >
                    {s.city}
                  </button>
                ))}
              </div>
            </div>

            {/* State SLA Highlight Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Average Approval Time</span>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{stateData[selectedState].avgDays}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">State e-Stamp Duty</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-1">{stateData[selectedState].stampDuty}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">SPICe+ Processing Speed</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">{stateData[selectedState].mcaSpeed}% Fast-Track</p>
              </div>
            </div>

            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#4338CA" />
                    </linearGradient>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0E7490" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={axisStroke} fontSize={12} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} unit=" Days" />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 99999, pointerEvents: "none" }}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="days" fill="url(#barGrad1)" name="Total Working Days" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="mcaFiling" fill="url(#barGrad2)" name="MCA Approval Window" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─── TAB: COMPLIANCE JOURNEY ─── */}
        {activeTab === "compliance" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 365-Day Corporate Governance Lifecycle
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sequential post-incorporation milestone completion track from Day 0 to Year 1 statutory filings.</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Statutory Score: <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">100% Guard</span>
              </div>
            </div>

            <div className="h-[320px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTimeline} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="month" stroke={axisStroke} fontSize={12} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 99999, pointerEvents: "none" }}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#areaGrad)"
                    name="Compliance Coverage"
                    dot={{ fill: "#10B981", r: 5, strokeWidth: 2, stroke: isDark ? "#0F172A" : "#FFFFFF" }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Milestone Breakdown List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {complianceTimeline.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{item.month}</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.score}% Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{item.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: GROWTH SCALABILITY ─── */}
        {activeTab === "growth" && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" /> 5-Year Enterprise Growth Scalability
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Long-term institutional fundraising capacity, equity share allocation, and angel/VC readiness trajectory.</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                VC Standard: <strong className="text-slate-900 dark:text-white">Private Limited</strong>
              </div>
            </div>

            <div className="h-[320px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="year" stroke={axisStroke} fontSize={12} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 99999, pointerEvents: "none" }}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="pvtLtd" stroke="#6366F1" strokeWidth={3} name="Private Limited (Equity/VC)" dot={{ fill: "#6366F1", r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="llp" stroke="#06B6D4" strokeWidth={2.5} name="Limited Liability Partnership" dot={{ fill: "#06B6D4", r: 4 }} />
                  <Line type="monotone" dataKey="opc" stroke="#94A3B8" strokeWidth={2} name="One Person Company (Solo)" dot={{ fill: "#94A3B8", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 dark:from-amber-950/30 via-amber-50/50 to-transparent border border-amber-200 dark:border-amber-900/50 flex items-start gap-3.5">
              <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-bold">Founder Takeaway:</strong> If you plan to raise institutional equity from angel networks, incubators, or venture capital funds, a <strong>Private Limited Company</strong> is the universally accepted standard due to separate legal personality, stock issuance, and ESOP schemes.
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ═══ INTERACTIVE SIDE-BY-SIDE ENTITY COMPARISON MATRIX ═══ */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setShowMatrix((prev) => !prev)}
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left cursor-pointer hover:border-indigo-400 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Comparative Entity Matrix & Statutory Drilldown</h4>
              <p className="text-xs text-slate-500">Compare FDI eligibility, ESOP issuance, audit thresholds, and liability across Pvt Ltd, LLP, and OPC.</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showMatrix ? "rotate-180" : ""}`} />
        </button>

        {showMatrix && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-x-auto rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  <th className="p-4 font-bold">Key Metric</th>
                  <th className="p-4 font-bold text-indigo-600 dark:text-indigo-400">Pvt Ltd Company</th>
                  <th className="p-4 font-bold text-cyan-600 dark:text-cyan-400">LLP</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400">One Person Co (OPC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">Angel / VC Funding</td>
                  <td className="p-4 text-emerald-600 font-bold">✓ 100% Eligible (Equity)</td>
                  <td className="p-4 text-amber-600">Limited (Debt only)</td>
                  <td className="p-4 text-slate-500">Requires Conversion</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">100% FDI Automatic Route</td>
                  <td className="p-4 text-emerald-600 font-bold">✓ Yes</td>
                  <td className="p-4 text-emerald-600 font-bold">✓ Yes</td>
                  <td className="p-4 text-rose-500">✗ Indian Citizens Only</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">ESOP Stock Options</td>
                  <td className="p-4 text-emerald-600 font-bold">✓ Full ESOP Allocation</td>
                  <td className="p-4 text-rose-500">✗ Not Allowed</td>
                  <td className="p-4 text-rose-500">✗ Not Allowed</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">Corporate Tax Rate</td>
                  <td className="p-4 font-mono font-bold text-indigo-600">22% (+ Cess)</td>
                  <td className="p-4 font-mono">30% (+ Cess)</td>
                  <td className="p-4 font-mono">22% (+ Cess)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">Annual Audit Mandate</td>
                  <td className="p-4">Mandatory (Statutory CA)</td>
                  <td className="p-4 text-emerald-600 font-bold">Exempt if &lt; ₹40L Turnover</td>
                  <td className="p-4">Mandatory (Statutory CA)</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* ═══ 3 KEY STATUTORY ADVANTAGE CARDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
        {[
          {
            icon: DollarSign,
            title: "Zero Hidden Charges",
            desc: "Full clarity on Ministry of Corporate Affairs filing challans, PAN/TAN issuance, and digital signature tokens.",
            tag: "Transparent",
            color: "from-indigo-600 to-indigo-700",
          },
          {
            icon: Clock,
            title: "Guaranteed SLA Execution",
            desc: "Dedicated Chartered Accountants and Company Secretaries track name availability and application resubmissions.",
            tag: "7-10 Days",
            color: "from-cyan-600 to-cyan-700",
          },
          {
            icon: ShieldCheck,
            title: "Annual Compliance Shield",
            desc: "Seamless post-incorporation statutory compliance: Auditor ADT-1, Form INC-20A, DIN eKYC, and annual AOC-4 / MGT-7.",
            tag: "Protected",
            color: "from-emerald-600 to-emerald-700",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 transition-all duration-300 relative group overflow-hidden shadow-lg dark:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {card.tag}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{card.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

