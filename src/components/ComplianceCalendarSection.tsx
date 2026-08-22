import React, { useState } from "react";
import { 
  Calendar, 
  Bell, 
  Shield, 
  FileText, 
  Globe, 
  Users, 
  Building2, 
  UserCheck, 
  Percent, 
  Receipt, 
  Search, 
  SlidersHorizontal, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Activity,
  CheckCircle2
} from "lucide-react";
import ComplianceHealthChecker from "./ComplianceHealthChecker";
import GstLateFeeCalculator from "./GstLateFeeCalculator";

/* ═══ DATA MODEL ═══ */
interface ComplianceItem {
  id: string | number;
  days: string;
  deadlineType: string;
  step: string;
  title: string;
  category: string;
  subtitle: string;
  statutoryReference: string;
  dueTimeline: string;
  frequency: string;
  applicability: string;
  description: string;
  proTip: string;
  penalty: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string | null;
  detailsRoute: string;
  fullDetails: {
    overview: string;
    requirements: string[];
    documents: string[];
    steps: string[];
    tip?: string;
    penalty: string;
  };
}

const complianceData: ComplianceItem[] = [
  {
    id: "first-board-meeting",
    days: "30 DAYS",
    deadlineType: "30 DAYS",
    step: "1/8",
    title: "First Board Meeting & Share Subscription",
    category: "Board",
    subtitle: "COMPANIES ACT SEC 173",
    statutoryReference: "COMPANIES ACT SEC 173",
    dueTimeline: "Within 30 days of incorporation",
    frequency: "One-time",
    applicability: "All newly incorporated companies",
    description: "Conduct first board meeting within 30 days. Allot subscriber shares and appoint auditor.",
    proTip: "Open a corporate bank account immediately after incorporation to deposit the subscribed share capital.",
    penalty: "₹1,00,000 penalty on company + ₹25,000 on every defaulting officer.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/first-board-meeting",
    fullDetails: {
      overview: "The first board meeting must be conducted within 30 days of incorporation to adopt basic bylaws, issue share certificates, open a corporate bank account, and appoint the statutory auditor.",
      requirements: ["Convene board meeting with all directors present", "Pass resolution for share allotment", "Open corporate bank account", "Appoint statutory auditor", "Maintain statutory registers"],
      documents: ["Board Resolution (signed)", "Share Certificates", "Bank Account Opening Proof", "Auditor Consent Letter (ADT-1)", "Minutes of Meeting"],
      steps: ["Schedule board meeting within 30 days of incorporation", "Prepare agenda: share allotment, auditor appointment, bank account", "Conduct meeting and record minutes", "Issue share certificates to subscribers", "File Form ADT-1 for auditor appointment"],
      tip: "Open a corporate bank account immediately after incorporation to deposit the subscribed share capital. This is required for Form 20A later.",
      penalty: "₹1,00,000 penalty on company + ₹25,000 on every defaulting officer. Risk of ROC registry warnings if share certificates not dispatched within 60 days."
    }
  },
  {
    id: "inc-20a",
    days: "60 DAYS",
    deadlineType: "60 DAYS",
    step: "2/8",
    title: "INC-20A Commencement of Business",
    category: "ROC",
    subtitle: "MCA FORM INC-20A",
    statutoryReference: "MCA FORM INC-20A",
    dueTimeline: "Within 180 days of incorporation",
    frequency: "One-time",
    applicability: "Companies having share capital",
    description: "File declaration proving subscribers deposited share capital into company bank account.",
    proTip: "You CANNOT trade, sign contracts, or start operations until Form 20A is filed.",
    penalty: "₹50,000 on company + ₹1,000/day on directors.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/inc-20a",
    fullDetails: {
      overview: "Form INC-20A is a declaration filed with ROC proving that every subscriber has paid the value of shares agreed upon. Without this, the company cannot legally commence business operations.",
      requirements: ["All subscribers must pay share capital", "Bank statement showing capital deposit", "Verification by a CA/CS/Cost Accountant", "Board resolution authorizing the filing"],
      documents: ["Bank Statement showing deposits", "Bank Confirmation Letter", "Board Resolution", "CA/CS Certificate", "Form INC-20A (signed digitally)"],
      steps: ["Ensure all subscribers have paid share capital", "Obtain bank statement as proof", "Get CA/CS verification certificate", "Draft and sign Form INC-20A digitally", "File with MCA within 180 days"],
      tip: "You CANNOT trade, sign contracts, or start operations until Form 20A is approved by MCA. File this immediately after share capital is deposited.",
      penalty: "₹50,000 on company + ₹1,000/day on directors. Entity may face strike-off after 180 days of non-filing."
    }
  },
  {
    id: "dir-3-kyc",
    days: "90 DAYS",
    deadlineType: "90 DAYS",
    step: "3/8",
    title: "DIR-3 KYC for All Directors",
    category: "Director",
    subtitle: "ANNUAL DIN VERIFICATION",
    statutoryReference: "ANNUAL DIN VERIFICATION",
    dueTimeline: "Annually on or before September 30",
    frequency: "Annual",
    applicability: "All individual directors holding DIN",
    description: "Every director must file DIR-3 KYC annually to keep their DIN active.",
    proTip: "Use mobile OTP verification for faster and secure DIN reactivation.",
    penalty: "DIN gets deactivated immediately. ₹5,000 late fee applies for reactivation.",
    priority: "Medium",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/dir-3-kyc",
    fullDetails: {
      overview: "DIR-3 KYC is mandatory annual compliance for every person holding a Director Identification Number (DIN). It verifies personal details, address, and contact information with the MCA registry.",
      requirements: ["Valid DIN for all directors", "Mobile number linked to Aadhaar", "Personal email ID verification", "Current residential address proof"],
      documents: ["Aadhaar Card", "PAN Card", "Passport-size Photo", "Address Proof (Utility Bill)", "Digital Signature Certificate"],
      steps: ["Login to MCA portal", "Navigate to DIR-3 KYC form", "Fill personal details and OTP verification", "Attach DSC and submit", "Download acknowledgement"],
      tip: "Use mobile OTP verification for faster processing. Ensure Aadhaar is linked to the mobile number used for OTP.",
      penalty: "DIN gets deactivated immediately. ₹5,000 late fee applies for reactivation after September 30 each year."
    }
  },
  {
    id: "quarterly-board-meeting",
    days: "120 DAYS",
    deadlineType: "120 DAYS",
    step: "4/8",
    title: "Quarterly Board Meeting & Minutes",
    category: "Board",
    subtitle: "BOARD MEETING COMPLIANCE",
    statutoryReference: "BOARD MEETING COMPLIANCE",
    dueTimeline: "Every quarter (gap < 120 days)",
    frequency: "Quarterly",
    applicability: "All private & public companies",
    description: "Hold at least 4 board meetings each financial year with no more than 120 days between two meetings.",
    proTip: "Circulate draft minutes within 15 days of meeting for director approval.",
    penalty: "₹25,000 to ₹1,00,000 on default.",
    priority: "Medium",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/quarterly-board-meeting",
    fullDetails: {
      overview: "Companies Act mandates a minimum of 4 board meetings every year, with the gap between consecutive meetings not exceeding 120 days. Proper notice, agenda, and minutes must be maintained.",
      requirements: ["Notice sent at least 7 days in advance", "Quorum requirement: 1/3 of total directors or 2", "Recording of minutes in statutory register", "Director attendance register"],
      documents: ["Board Meeting Notice & Agenda", "Attendance Sheet", "Signed Board Resolutions", "Minutes Book (duly signed by Chairperson)"],
      steps: ["Draft agenda and send 7-day advance notice", "Convene meeting (in-person or VC)", "Pass necessary corporate resolutions", "Draft minutes and circulate within 15 days", "Enter approved minutes in Minutes Book"],
      penalty: "₹25,000 on company + ₹5,000 per defaulting officer under Section 118(11)."
    }
  },
  {
    id: "aoc-4-financials",
    days: "180 DAYS",
    deadlineType: "180 DAYS",
    step: "5/8",
    title: "Form AOC-4 Financial Statements",
    category: "ROC",
    subtitle: "ANNUAL FINANCIAL FILING",
    statutoryReference: "ANNUAL FINANCIAL FILING",
    dueTimeline: "Within 30 days of Annual General Meeting (AGM)",
    frequency: "Annual",
    applicability: "All companies incorporated under Companies Act",
    description: "File audited balance sheet, profit & loss account, auditor's report, and director's report with MCA.",
    proTip: "Complete statutory audit by September 30 to file AOC-4 on time by October 30.",
    penalty: "₹100 per day recurring penalty indefinitely on the company and defaulting directors.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/aoc-4-financials",
    fullDetails: {
      overview: "Form AOC-4 is the annual financial filing submitted to the Registrar of Companies (ROC). It includes the audited balance sheet, statement of profit & loss, cash flow statement, board report, and auditor's report.",
      requirements: ["Statutory audit completed by CA", "Approval of financials by Board", "Adoption of financials at AGM", "XBRL conversion if turnover > ₹100Cr"],
      documents: ["Audited Balance Sheet", "Profit & Loss Account", "Auditor's Report (signed)", "Director's Report", "Notice of AGM"],
      steps: ["Finalize annual accounts", "Statutory auditor conducts audit and signs report", "Board approves financials", "Adopt at AGM by September 30", "File Form AOC-4 with ROC within 30 days"],
      penalty: "₹100/day penalty on company + ₹100/day on directors. Continues indefinitely until filed."
    }
  },
  {
    id: "mgt-7-annual-return",
    days: "365 DAYS",
    deadlineType: "365 DAYS",
    step: "6/8",
    title: "Form MGT-7 Annual Return",
    category: "ROC",
    subtitle: "ANNUAL RETURN FILING",
    statutoryReference: "ANNUAL RETURN FILING",
    dueTimeline: "Within 60 days of Annual General Meeting (AGM)",
    frequency: "Annual",
    applicability: "All companies (MGT-7A for small companies)",
    description: "File comprehensive annual return covering shareholding pattern, directors, and governance details.",
    proTip: "Small companies can file simplified Form MGT-7A with lower certification fees.",
    penalty: "₹100 per day recurring penalty on company and directors.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/mgt-7-annual-return",
    fullDetails: {
      overview: "Form MGT-7 captures complete details of the company's registered office, principal business activities, shareholding pattern, indebtedness, members, debenture holders, and director disclosures.",
      requirements: ["Updated shareholding pattern", "Details of transfers during FY", "Director meeting attendance", "Certification by practicing CS (if applicable)"],
      documents: ["List of Shareholders", "List of Directors", "Board Meeting Attendance Record", "MGT-8 Certification (for large entities)", "Digital Signatures"],
      steps: ["Prepare register of members", "Draft Form MGT-7 / MGT-7A", "Obtain CS certification (if required)", "Attach shareholder lists", "File with ROC within 60 days of AGM"],
      penalty: "₹100 per day recurring penalty on company and every defaulting director."
    }
  },
  {
    id: "gst-return-monthly",
    days: "ONGOING",
    deadlineType: "ONGOING",
    step: "7/8",
    title: "GST Return Filing (GSTR-1 & GSTR-3B)",
    category: "GST",
    subtitle: "MONTHLY GST COMPLIANCE",
    statutoryReference: "MONTHLY GST COMPLIANCE",
    dueTimeline: "GSTR-1: 11th | GSTR-3B: 20th of every month",
    frequency: "Monthly",
    applicability: "All GST-registered entities",
    description: "File outward supply details (GSTR-1) and monthly summary return with tax payment (GSTR-3B).",
    proTip: "Reconcile GSTR-2B before filing GSTR-3B to claim 100% eligible Input Tax Credit (ITC).",
    penalty: "₹50/day late fee (₹20 for NIL). 18% p.a. interest on delayed tax payment.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/gst-return-monthly",
    fullDetails: {
      overview: "Every GST-registered business must file monthly/quarterly returns. GSTR-1 contains details of all outward supplies (sales), while GSTR-3B is a self-declared summary return for tax payment and ITC claim.",
      requirements: ["Sales & purchase invoices", "E-way bill reconciliation", "Input Tax Credit (ITC) reconciliation with GSTR-2B", "Tax liability computation"],
      documents: ["Sales Register", "Purchase Register", "GSTR-2B statement from portal", "Bank statement for tax challan payment"],
      steps: ["Compile sales data and upload GSTR-1 by 11th", "Download GSTR-2B for ITC reconciliation", "Compute net GST payable after ITC offset", "Pay tax through online challan", "File GSTR-3B by 20th"],
      penalty: "₹50 per day (₹25 CGST + ₹25 SGST), capped at ₹5,000 per return. 18% p.a. interest on unpaid tax."
    }
  },
  {
    id: "itr-filing",
    days: "YEARLY",
    deadlineType: "YEARLY",
    step: "8/8",
    title: "Income Tax Return Filing",
    category: "Tax",
    subtitle: "ITR FOR COMPANIES",
    statutoryReference: "ITR FOR COMPANIES",
    dueTimeline: "By October 31 of assessment year",
    frequency: "Annual",
    applicability: "All registered companies",
    description: "File corporate income tax return (ITR-6) by October 31 each year.",
    proTip: "Claim all eligible deductions, depreciation, and set-off of losses.",
    penalty: "₹5,000 late fee. Interest under 234A/B/C applies.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/itr-filing",
    fullDetails: {
      overview: "Every company must file its income tax return in Form ITR-6 by October 31 (if tax audit applicable) or July 31 (otherwise). This includes computation of income, tax liability, advance tax, and TDS credits.",
      requirements: ["Finalized accounts", "Tax audit report (if applicable)", "Advance tax payments", "TDS credit reconciliation", "MAT computation (if applicable)"],
      documents: ["Audited Financial Statements", "Tax Audit Report (Form 3CD)", "Form ITR-6", "Advance Tax Challans", "Form 26AS reconciliation"],
      steps: ["Finalize accounts and get audited", "Compute total income and tax liability", "Claim all eligible deductions", "Reconcile advance tax and TDS credits", "File ITR-6 before deadline"],
      penalty: "₹5,000 late fee (₹1,000 if income < ₹5L). Interest under 234A (1% per month on unpaid tax). 234B/234C for advance tax defaults."
    }
  }
];

/* ═══ COMPLIANCE DETAIL VIEW ═══ */
function ComplianceDetail({ item, onBack }: { item: ComplianceItem; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeScale_0.2s_ease-out] text-left">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-[#4F46E5] dark:text-[#9D85F2] hover:underline cursor-pointer transition-colors border-none bg-transparent p-0 outline-none">
        <ArrowLeft className="w-4 h-4" /> Back to Compliance Calendar
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold bg-[rgba(99,102,241,0.12)] text-[#4F46E5] dark:text-[#9D85F2] px-3 py-1 rounded-full tracking-wide">{item.deadlineType}</span>
          <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">{item.frequency}</span>
          {item.priority === "High" && (
            <span className="text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">High Priority</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight font-display">{item.title}</h1>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#4F46E5] dark:text-[#9D85F2]">{item.statutoryReference}</p>
      </div>

      {/* Overview & Applicability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] shadow-[0_12px_32px_rgba(31,41,95,0.04)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 font-display">Overview</h3>
          <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">{item.fullDetails.overview}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] shadow-[0_12px_32px_rgba(31,41,95,0.04)] rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Applicability</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">{item.applicability}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Due Timeline</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">{item.dueTimeline}</p>
          </div>
        </div>
      </div>

      {/* Requirements & Documents side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] shadow-[0_12px_32px_rgba(31,41,95,0.04)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <span className="w-1.5 h-3 bg-[#4F46E5] rounded-full" /> Requirements
          </h3>
          <ul className="space-y-3">
            {item.fullDetails.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                <span className="text-[#4F46E5] dark:text-[#9D85F2] font-extrabold">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] shadow-[0_12px_32px_rgba(31,41,95,0.04)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <span className="w-1.5 h-3 bg-[#7C3AED] rounded-full" /> Key Documents
          </h3>
          <ul className="space-y-3">
            {item.fullDetails.documents.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                <span className="text-[#7C3AED] dark:text-[#C4B3F5] font-extrabold">•</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══ CARD COMPONENT ═══ */
function ComplianceCard({ item, onClick }: { item: ComplianceItem; onClick: () => void }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Board": return <Users className="w-3.5 h-3.5" />;
      case "ROC": return <Building2 className="w-3.5 h-3.5" />;
      case "Director": return <UserCheck className="w-3.5 h-3.5" />;
      case "GST": return <Percent className="w-3.5 h-3.5" />;
      case "Tax": return <Receipt className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div 
      onClick={onClick} 
      className="compliance-card flex flex-col justify-between cursor-pointer group text-left"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold bg-[rgba(99,102,241,0.12)] text-[#4F46E5] dark:text-[#9D85F2] px-2.5 py-1 rounded-full tracking-wide">
              {item.deadlineType}
            </span>
            {item.priority === "High" && (
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <span className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.08)] text-[#4F46E5] dark:text-[#9D85F2] flex items-center justify-center shrink-0">
            {getCategoryIcon(item.category)}
          </span>
        </div>
        <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#4F46E5] dark:group-hover:text-[#9D85F2] transition-colors duration-250 font-display">
          {item.title}
        </h3>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#4F46E5] dark:text-[#9D85F2] mt-1.5 block">
          {item.statutoryReference}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
          {item.description}
        </p>
        
        {/* Pro Tip Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[rgba(79,70,229,0.05)] border border-[rgba(79,70,229,0.12)] text-slate-800 dark:text-slate-200">
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#3730A3] dark:text-[#C4B3F5]">Pro Tip:</span> {item.proTip}
          </p>
        </div>
        
        {/* Penalty Box */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.12)] text-slate-800 dark:text-slate-200">
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#B91C1C] dark:text-red-400">Penalty:</span> {item.penalty}
          </p>
        </div>
      </div>
      
      <span className="mt-5 text-xs font-bold text-[#4F46E5] dark:text-[#9D85F2] flex items-center gap-1 group-hover:gap-2 transition-all">
        View Full Details <span>→</span>
      </span>
    </div>
  );
}

/* ═══ MAIN SECTION ═══ */
export default function ComplianceCalendarSection() {
  const [activeTab, setActiveTab] = useState<"health_checker" | "gst_calculator" | "statutory_calendar">("health_checker");
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"urgency" | "name">("urgency");

  // Filtering & Sorting
  const filteredEvents = complianceData
    .filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.statutoryReference.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        const getUrgencyScore = (type: string) => {
          if (type.includes("30")) return 30;
          if (type.includes("60")) return 60;
          if (type.includes("90")) return 90;
          if (type.includes("120")) return 120;
          if (type.includes("180")) return 180;
          if (type.includes("365")) return 365;
          if (type.includes("ONGOING")) return 1000;
          if (type.includes("YEARLY")) return 2000;
          return 9999;
        };
        return getUrgencyScore(a.deadlineType) - getUrgencyScore(b.deadlineType);
      }
    });

  return (
    <section className="relative overflow-hidden py-6">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Switcher Bar */}
        <div className="flex items-center justify-center">
          <div className="bg-[var(--bg-surface-alt)] p-1.5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-2 shadow-sm flex-wrap justify-center">
            <button
              onClick={() => { setActiveTab("health_checker"); setSelectedItem(null); }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer font-display ${
                activeTab === "health_checker"
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] shadow-md shadow-[var(--accent)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Activity className="w-4 h-4" /> Compliance Health Score
            </button>

            <button
              onClick={() => { setActiveTab("gst_calculator"); setSelectedItem(null); }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer font-display ${
                activeTab === "gst_calculator"
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] shadow-md shadow-[var(--accent)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Receipt className="w-4 h-4" /> GST Late Fee & Sec 50 Calculator
            </button>

            <button
              onClick={() => { setActiveTab("statutory_calendar"); setSelectedItem(null); }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer font-display ${
                activeTab === "statutory_calendar"
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] shadow-md shadow-[var(--accent)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Calendar className="w-4 h-4" /> Annual Statutory Master Calendar
            </button>
          </div>
        </div>

        {/* ─── TAB 1: Health Score & Action Planner ─── */}
        {activeTab === "health_checker" && (
          <ComplianceHealthChecker />
        )}

        {/* ─── TAB 2: GST Late Fee & Sec 50 Calculator ─── */}
        {activeTab === "gst_calculator" && (
          <GstLateFeeCalculator />
        )}

        {/* ─── TAB 3: Statutory Master Calendar ─── */}
        {activeTab === "statutory_calendar" && (
          <div>
            {selectedItem ? (
              <ComplianceDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
            ) : (
              <div className="space-y-8">
                {/* Stats strip */}
                <div className="compliance-stats grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[rgba(99,102,241,0.15)] p-5 md:p-6 mb-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  {[
                    { label: "Total Events", value: "248+", desc: "Across all jurisdictions", icon: Calendar, color: "text-[#4F46E5] bg-[rgba(79,70,229,0.08)]" },
                    { label: "High Priority", value: "32", desc: "Due in next 30 days", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10" },
                    { label: "Monthly", value: "86", desc: "Recurring every month", icon: RefreshCw, color: "text-blue-500 bg-blue-500/10" },
                    { label: "Annual", value: "102", desc: "Yearly compliance events", icon: Calendar, color: "text-green-500 bg-green-500/10" },
                    { label: "Ongoing", value: "60", desc: "Continuous obligations", icon: Clock, color: "text-purple-500 bg-purple-500/10" }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 px-3 py-3.5 md:py-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight font-display">{stat.value}</span>
                        <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-none">{stat.label}</span>
                        <span className="text-[9.5px] text-slate-400 mt-1 leading-none">{stat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filters & Search Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Filters */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none scroll-smooth">
                    {["All", "Board", "ROC", "Tax", "GST", "Director"].map((cat) => {
                      const active = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all duration-200 whitespace-nowrap ${
                            active
                              ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-transparent shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
                              : "bg-white/80 dark:bg-slate-900/60 text-slate-750 dark:text-slate-350 border-[rgba(99,102,241,0.14)] hover:bg-white dark:hover:bg-slate-900 hover:border-[rgba(99,102,241,0.3)]"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search & Sort */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search compliance or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-72 pl-10 pr-10 py-2.5 bg-white/80 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-100 border border-[rgba(99,102,241,0.14)] focus:border-[#4F46E5] rounded-xl outline-none transition-all focus:bg-white shadow-[0_2px_8px_rgba(31,41,95,0.02)]"
                      />
                    </div>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "urgency" | "name")}
                      className="px-3 py-2.5 bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] rounded-xl text-xs text-slate-700 dark:text-slate-350 outline-none cursor-pointer hover:border-[rgba(99,102,241,0.3)] transition-all"
                    >
                      <option value="urgency">Sort: Urgency</option>
                      <option value="name">Sort: Name A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredEvents.map(item => (
                    <ComplianceCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
