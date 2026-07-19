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
  ArrowLeft 
} from "lucide-react";

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
    dueTimeline: "Minimum 4 meetings per calendar year",
    frequency: "Quarterly",
    applicability: "All active companies",
    description: "Hold minimum 4 board meetings/year with max 120-day gap between consecutive meetings.",
    proTip: "Video conferencing is allowed for board meetings with proper notice.",
    penalty: "₹25,000 fine on company for each violation. Officer in default liable.",
    priority: "Medium",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/quarterly-board-meeting",
    fullDetails: {
      overview: "Every company must hold at least 4 board meetings in a calendar year, with a maximum gap of 120 days between two consecutive meetings. Minutes must be prepared within 15 days.",
      requirements: ["Minimum 4 meetings per calendar year", "Gap not exceeding 120 days", "Quorum of directors present", "Written minutes within 15 days"],
      documents: ["Notice of Board Meeting", "Agenda Documents", "Attendance Register", "Minutes of Meeting (signed)", "Board Resolutions"],
      steps: ["Send notice 7 days before meeting", "Prepare agenda and supporting documents", "Conduct meeting with quorum", "Record minutes within 15 days", "Get minutes signed by Chairman"],
      tip: "Video conferencing is allowed for board meetings. Maintain a dedicated minutes book with page numbering and director signatures.",
      penalty: "₹25,000 fine on company for each violation. Officers in default fined ₹5,000 per meeting missed."
    }
  },
  {
    id: "gst-returns",
    days: "180 DAYS",
    deadlineType: "180 DAYS",
    step: "5/8",
    title: "GST Return Filing (Monthly/Quarterly)",
    category: "GST",
    subtitle: "GSTR-1 & GSTR-3B",
    statutoryReference: "GSTR-1 & GSTR-3B",
    dueTimeline: "Monthly by 11th/20th or Quarterly",
    frequency: "Monthly/Quarterly",
    applicability: "All GST-registered taxpayers",
    description: "File GSTR-1 and GSTR-3B every month or quarter based on turnover bracket.",
    proTip: "Always reconcile GSTR-2B before filing.",
    penalty: "Late fee ₹50/day. Interest at 18% p.a. on outstanding tax.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/gst-returns",
    fullDetails: {
      overview: "All GST-registered businesses must file GSTR-1 (outward supply details) and GSTR-3B (summary return with tax payment). Filing frequency depends on annual turnover — monthly for >₹5Cr, quarterly for others.",
      requirements: ["Valid GSTIN", "Accurate sales and purchase records", "Input tax credit reconciliation", "Tax payment before due date"],
      documents: ["Sales Invoices", "Purchase Invoices", "Credit/Debit Notes", "Bank Payment Challan", "GSTR-2B Reconciliation"],
      steps: ["Reconcile purchase register with GSTR-2B", "Prepare GSTR-1 with all outward supplies", "Compute net tax liability", "Pay tax via GST portal challan", "File GSTR-3B by 20th of next month"],
      tip: "Always reconcile GSTR-2B before filing 3B to maximize Input Tax Credit. Missing even one invoice means losing that ITC permanently.",
      penalty: "Late fee ₹50/day (₹20 for nil returns). Interest at 18% p.a. on outstanding tax. E-way bill generation gets blocked after 2 months default."
    }
  },
  {
    id: "annual-roc",
    days: "365 DAYS",
    deadlineType: "365 DAYS",
    step: "6/8",
    title: "Annual ROC Filing (AOC-4 & MGT-7)",
    category: "ROC",
    subtitle: "ANNUAL RETURN & FINANCIALS",
    statutoryReference: "ANNUAL RETURN & FINANCIALS",
    dueTimeline: "Within 30/60 days of Annual General Meeting (AGM)",
    frequency: "Annual",
    applicability: "All active registered companies",
    description: "File audited financial statements and annual return with Registrar of Companies.",
    proTip: "Start audit preparation by avoiding last-minute rush.",
    penalty: "₹100/day compounding penalty on company and additional ₹100/day on officer.",
    priority: "High",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/annual-roc",
    fullDetails: {
      overview: "Every company must file Form AOC-4 (financial statements) within 30 days of AGM and Form MGT-7 (annual return) within 60 days of AGM with the Registrar of Companies annually.",
      requirements: ["Audited Balance Sheet & P&L", "Directors' Report", "Auditor's Report", "Board approval of financials", "AGM conducted within 6 months of FY end"],
      documents: ["Audited Financial Statements", "Directors' Report", "Form AOC-4 (digitally signed)", "Form MGT-7/MGT-7A", "AGM Notice & Minutes"],
      steps: ["Get accounts audited by September", "Hold AGM within 6 months of FY end", "File AOC-4 within 30 days of AGM", "File MGT-7 within 60 days of AGM", "Pay filing fees on MCA portal"],
      tip: "Start audit preparation by July to avoid last-minute rush. Late filing penalties compound daily with NO maximum cap.",
      penalty: "₹100/day compounding penalty on company + additional ₹100/day on every director. No maximum cap — penalties can run into lakhs."
    }
  },
  {
    id: "tds-returns",
    days: "ONGOING",
    deadlineType: "ONGOING",
    step: "7/8",
    title: "TDS Deduction & Quarterly Returns",
    category: "Tax",
    subtitle: "INCOME TAX ACT SEC 194",
    statutoryReference: "INCOME TAX ACT SEC 194",
    dueTimeline: "Deposit by 7th monthly, file quarterly within 31 days",
    frequency: "Quarterly",
    applicability: "All entities making payments subject to TDS",
    description: "Deduct TDS on salary, rent, professional fees. File quarterly returns.",
    proTip: "Issue TDS certificates within 15 days of quarterly return filing.",
    penalty: "Interest 1.5%/month for late deposit. Penalty equal to TDS amount for non-deduction.",
    priority: "Medium",
    dueDate: null,
    detailsRoute: "/resources/compliance-calendar/tds-returns",
    fullDetails: {
      overview: "Every company/LLP making payments subject to TDS must deduct tax at source and deposit it with the government by the 7th of the next month. Quarterly returns must be filed to report all deductions.",
      requirements: ["TAN registration", "Correct TDS rate application", "Monthly deposit by 7th", "Quarterly return filing", "Issue TDS certificates"],
      documents: ["Form 26Q (Non-salary TDS)", "Form 24Q (Salary TDS)", "TDS Certificates (Form 16/16A)", "Challan 281", "Deductee PAN verification"],
      steps: ["Deduct TDS at applicable rates", "Deposit with government by 7th of next month", "File quarterly return (26Q/24Q)", "Issue certificates within 15 days of filing", "Reconcile with Form 26AS"],
      tip: "Issue TDS certificates (Form 16/16A) within 15 days of quarterly return filing. Late issuance attracts ₹100/day penalty per certificate.",
      penalty: "Interest 1.5%/month for late deposit. Penalty equal to TDS amount for non-deduction. ₹200/day for late return filing (max = TDS amount)."
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
            <span className="w-1.5 h-3 bg-[#4F46E5] rounded-full" /> Documents Required
          </h3>
          <ul className="space-y-3">
            {item.fullDetails.documents.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                <span className="text-[#4F46E5] dark:text-[#9D85F2]">📄</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.14)] shadow-[0_12px_32px_rgba(31,41,95,0.04)] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 font-display">
          <span className="w-1.5 h-3 bg-[#4F46E5] rounded-full" /> Filing Steps
        </h3>
        <ol className="space-y-4">
          {item.fullDetails.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-4 text-xs text-slate-655 dark:text-slate-355 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-[rgba(99,102,241,0.08)] text-[#4F46E5] dark:text-[#9D85F2] flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-[rgba(99,102,241,0.15)]">
                {i + 1}
              </span>
              <div className="pt-0.5">{s}</div>
            </li>
          ))}
        </ol>
      </div>

      {/* Tip & Penalty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[rgba(79,70,229,0.06)] border border-[rgba(79,70,229,0.15)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#3730A3] dark:text-[#C4B3F5] uppercase tracking-wider block mb-1">💡 Pro Tip</span>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{item.proTip}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#B91C1C] dark:text-red-400 uppercase tracking-wider block mb-1">⚠️ Penalty Warning</span>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{item.penalty}</p>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all cursor-pointer border-none outline-none">
        Delegate This Task →
      </button>
    </div>
  );
}

/* ═══ DEMO MODAL ═══ */
function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1B1828] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-5 animate-[fadeScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Compliance Tracking Demo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer border-none bg-transparent outline-none" aria-label="Close">✕</button>
        </div>
        <p className="text-sm text-slate-550 dark:text-slate-350">See how INCroute tracks your compliance deadlines automatically.</p>
        <div className="space-y-3 text-left">
          {[{ task: "DIR-3 KYC", due: "Sep 30", progress: 85 }, { task: "GSTR-3B Filing", due: "Jul 20", progress: 60 }, { task: "AOC-4 Annual", due: "Oct 30", progress: 20 }].map((t, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between text-xs"><span className="text-slate-800 dark:text-slate-200 font-bold">{t.task}</span><span className="text-slate-400">Due: {t.due}</span></div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${t.progress}%` }} /></div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Start Tracking Now</button>
      </div>
    </div>
  );
}

/* ═══ ONBOARDING MODAL ═══ */
function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const types = [
    { id: "pvt-ltd", name: "Private Limited", desc: "Most popular for startups" },
    { id: "llp", name: "LLP", desc: "For professional services" },
    { id: "opc", name: "One Person Company", desc: "Solo entrepreneurs" },
    { id: "startup", name: "Startup (DPIIT)", desc: "Recognized startups" },
  ];
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1B1828] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-5 animate-[fadeScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Select Your Business Type</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer border-none bg-transparent outline-none" aria-label="Close">✕</button>
        </div>
        <p className="text-xs text-slate-400">We'll show you the compliance requirements specific to your entity type.</p>
        <div className="space-y-2 text-left">
          {types.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer bg-transparent outline-none ${selected === t.id ? "border-[#5B6CFF] bg-[rgba(91,108,255,0.06)]" : "border-slate-200 dark:border-slate-850 hover:border-[#5B6CFF]/40 bg-slate-50/50 dark:bg-slate-900/50"}`}>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
        <button disabled={!selected} className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">
          View Compliance Roadmap →
        </button>
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
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    <>
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          {selectedItem ? (
            <ComplianceDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
          ) : (
            <>
              {/* Two-Column Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 pt-10 sm:pt-12">
                {/* Hero Left Column */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] text-[#4F46E5] dark:text-[#9D85F2] px-4 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> Static Statutory Calendars
                  </span>
                  
                  <h1 className="font-display tracking-tight text-[#080F2A] dark:text-white" style={{ fontSize: "clamp(38px, 4.5vw, 68px)", fontWeight: 850, lineHeight: 0.95, letterSpacing: "-0.045em" }}>
                    Global Compliance <br />
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                      Calendars Tracker
                    </span>
                  </h1>
                  
                  <p className="text-slate-600 dark:text-slate-350 text-[14.5px] leading-relaxed max-w-xl">
                    Unified live schedule of state, federal, and local statutory obligations. Keep your company fully operational and liability-free.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={() => setShowOnboarding(true)} 
                      className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all flex items-center gap-1.5 cursor-pointer border-none outline-none"
                    >
                      Get Started <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                    <button 
                      onClick={() => setShowDemo(true)} 
                      className="px-6 py-3 bg-white/80 dark:bg-slate-900/60 border border-[rgba(99,102,241,0.16)] hover:bg-white text-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      View Demo
                    </button>
                  </div>
                </div>

                {/* Hero Right Column (3D Dashboard Preview) */}
                <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end pr-6 sm:pr-12 lg:pr-12">
                  <div className="relative w-full max-w-[340px] sm:max-w-[440px] animate-float z-10">
                    {/* Glow background behind mockup */}
                    <div className="absolute inset-0 -m-8 bg-gradient-to-tr from-[#4F46E5]/15 to-[#7C3AED]/10 rounded-[40px] blur-3xl pointer-events-none" />

                    {/* Outer Card */}
                    <div className="hero-dashboard p-5 w-full text-slate-800 dark:text-slate-100 flex flex-col gap-4 relative">
                      {/* Header bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-[rgba(99,102,241,0.1)]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[rgba(99,102,241,0.08)] flex items-center justify-center">
                            <Calendar className="w-3 h-3 text-[#4F46E5] dark:text-[#9D85F2]" />
                          </span>
                          <span className="text-[11px] font-extrabold tracking-wide text-slate-900 dark:text-white">Compliance Calendar</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="relative w-7 h-7 rounded-full bg-[rgba(99,102,241,0.08)] flex items-center justify-center bell-ring border-none outline-none">
                            <Bell className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#9D85F2]" />
                            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          </button>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-[10px] text-white font-bold border border-white/20">
                            IR
                          </div>
                        </div>
                      </div>

                      {/* Calendar and upcoming events split */}
                      <div className="grid grid-cols-12 gap-3 text-left">
                        {/* Mini Calendar (7 cols) */}
                        <div className="col-span-7 pr-3 border-r border-[rgba(99,102,241,0.1)] flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">May 2026</span>
                            <div className="flex gap-1.5 text-slate-400 font-bold text-xs select-none">
                              <span className="cursor-pointer hover:text-[#4F46E5]">‹</span>
                              <span className="cursor-pointer hover:text-[#4F46E5]">›</span>
                            </div>
                          </div>
                          
                          {/* Calendar days grid */}
                          <div className="grid grid-cols-7 gap-y-1 text-center">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                              <span key={d} className="text-[7.5px] font-bold text-slate-400 uppercase">{d}</span>
                            ))}
                            {/* May starts on Thursday */}
                            {[null, null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day, idx) => {
                              if (day === null) return <span key={`empty-${idx}`} />;
                              const is15 = day === 15;
                              return (
                                <span 
                                  key={`day-${day}`} 
                                  className={`text-[8px] font-bold flex items-center justify-center aspect-square rounded-full transition-all ${
                                    is15 
                                      ? "bg-[#4F46E5] text-white font-bold shadow-[0_4px_8px_rgba(79,70,229,0.35)] scale-110" 
                                      : "text-slate-600 dark:text-slate-350 hover:bg-[rgba(99,102,241,0.08)]"
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upcoming Deadlines (5 cols) */}
                        <div className="col-span-5 flex flex-col justify-between py-0.5">
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 block font-display">Upcoming Deadlines</span>
                          <div className="space-y-2 flex-grow">
                            {[
                              { title: "DIR-3 KYC for All Directors", due: "Due in 12 days" },
                              { title: "GST Return Filing (Monthly)", due: "Due in 16 days" },
                              { title: "Quarterly Board Meeting", due: "Due in 25 days" }
                            ].map((item, idx) => (
                              <div key={idx} className="flex flex-col gap-0.5 text-left">
                                <span className="text-[8.5px] font-bold leading-tight text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                                <span className="text-[7.5px] font-bold text-amber-600 dark:text-amber-400">{item.due}</span>
                              </div>
                            ))}
                          </div>
                          <span className="text-[8px] font-extrabold text-[#4F46E5] dark:text-[#9D85F2] hover:underline cursor-pointer text-right block mt-1">View all</span>
                        </div>
                      </div>

                      {/* Floating Overlapping Card */}
                      <div className="absolute -bottom-6 left-2 right-2 sm:-left-4 sm:right-4 bg-white/95 dark:bg-[#201C30]/95 border border-[rgba(99,102,241,0.22)] shadow-[0_20px_45px_rgba(31,41,95,0.18)] backdrop-blur-md rounded-2xl p-3 flex items-center justify-between gap-3 animate-pulse-glow z-30">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-[rgba(99,102,241,0.08)] text-[#4F46E5] font-extrabold text-[8px] rounded-full border border-indigo-100 dark:border-indigo-900 uppercase tracking-wider whitespace-nowrap">
                            90 DAYS
                          </span>
                          <div className="flex flex-col text-left">
                            <span className="text-[9.5px] font-bold text-slate-900 dark:text-white leading-tight">DIR-3 KYC for All Directors</span>
                            <span className="text-[8.5px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" /> Due: 15 May 2026
                            </span>
                          </div>
                        </div>
                        <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce shrink-0" />
                      </div>
                    </div>

                    {/* Floating items around */}
                    <div className="absolute -top-6 right-2 sm:-right-6 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1B1828]/80 border border-indigo-150 dark:border-slate-800 shadow-md flex items-center justify-center animate-float z-20" style={{ animationDelay: "1s" }}>
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="absolute bottom-6 right-2 sm:-right-10 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1B1828]/80 border border-indigo-150 dark:border-slate-800 shadow-md flex items-center justify-center animate-float z-20" style={{ animationDelay: "2.5s" }}>
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="compliance-stats grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[rgba(99,102,241,0.15)] p-5 md:p-6 mb-12">
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none scroll-smooth -mx-6 px-6 md:mx-0 md:px-0">
                  {["All", "Board", "ROC", "Tax", "GST", "Director", "Labour", "Others"].map((cat) => {
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
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#4F46E5] border-none bg-transparent outline-none">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Sorting dropdown */}
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

              {/* Grid or Empty State */}
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-[rgba(99,102,241,0.1)] p-8 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No compliance events found</h3>
                  <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or selected category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredEvents.map(item => (
                    <ComplianceCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modals */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* Animation keyframe */}
      <style>{`@keyframes fadeScale { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </>
  );
}
