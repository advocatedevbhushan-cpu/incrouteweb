import React, { useState } from "react";

/* ═══ DATA MODEL ═══ */
interface ComplianceItem {
  id: number;
  days: string;
  step: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDetails: {
    overview: string;
    requirements: string[];
    documents: string[];
    steps: string[];
    tip: string;
    penalty: string;
  };
}

const complianceData: ComplianceItem[] = [
  {
    id: 1, days: "30 DAYS", step: "1/8", title: "First Board Meeting & Share Subscription", subtitle: "COMPANIES ACT SEC 173",
    shortDescription: "Conduct first board meeting within 30 days. Allot subscriber shares and appoint auditor.",
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
    id: 2, days: "60 DAYS", step: "2/8", title: "INC-20A Commencement of Business", subtitle: "MCA FORM INC-20A",
    shortDescription: "File declaration proving subscribers deposited share capital into company bank account.",
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
    id: 3, days: "90 DAYS", step: "3/8", title: "DIR-3 KYC for All Directors", subtitle: "ANNUAL DIN VERIFICATION",
    shortDescription: "Every director must file DIR-3 KYC annually to keep their DIN active.",
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
    id: 4, days: "120 DAYS", step: "4/8", title: "Quarterly Board Meeting & Minutes", subtitle: "BOARD MEETING COMPLIANCE",
    shortDescription: "Hold minimum 4 board meetings/year with max 120-day gap between consecutive meetings.",
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
    id: 5, days: "180 DAYS", step: "5/8", title: "GST Return Filing (Monthly/Quarterly)", subtitle: "GSTR-1 & GSTR-3B",
    shortDescription: "File GSTR-1 and GSTR-3B every month or quarter based on turnover bracket.",
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
    id: 6, days: "365 DAYS", step: "6/8", title: "Annual ROC Filing (AOC-4 & MGT-7)", subtitle: "ANNUAL RETURN & FINANCIALS",
    shortDescription: "File audited financial statements and annual return with Registrar of Companies.",
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
    id: 7, days: "ONGOING", step: "7/8", title: "TDS Deduction & Quarterly Returns", subtitle: "INCOME TAX ACT SEC 194",
    shortDescription: "Deduct TDS on salary, rent, professional fees. File quarterly returns.",
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
    id: 8, days: "YEARLY", step: "8/8", title: "Income Tax Return Filing", subtitle: "ITR FOR COMPANIES",
    shortDescription: "File corporate income tax return (ITR-6) by October 31 each year.",
    fullDetails: {
      overview: "Every company must file its income tax return in Form ITR-6 by October 31 (if tax audit applicable) or July 31 (otherwise). This includes computation of income, tax liability, advance tax, and TDS credits.",
      requirements: ["Finalized accounts", "Tax audit report (if applicable)", "Advance tax payments", "TDS credit reconciliation", "MAT computation (if applicable)"],
      documents: ["Audited Financial Statements", "Tax Audit Report (Form 3CD)", "Form ITR-6", "Advance Tax Challans", "Form 26AS reconciliation"],
      steps: ["Finalize accounts and get audited", "Compute total income and tax liability", "Claim all eligible deductions", "Reconcile advance tax and TDS credits", "File ITR-6 before deadline"],
      tip: "Claim all eligible deductions — 80IAC (startup 3-year holiday), depreciation, and advance tax credits. File early to get faster refund processing.",
      penalty: "₹5,000 late fee (₹1,000 if income < ₹5L). Interest under 234A (1% per month on unpaid tax). 234B/234C for advance tax defaults."
    }
  },
];

/* ═══ COMPLIANCE DETAIL VIEW ═══ */
function ComplianceDetail({ item, onBack }: { item: ComplianceItem; onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-[fadeScale_0.2s_ease-out]">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-colors">
        ← Back to Compliance Calendar
      </button>

      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-1 rounded-md inline-block">{item.days}</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{item.title}</h1>
        <p className="text-xs uppercase tracking-widest text-[var(--accent)]">{item.subtitle}</p>
      </div>

      {/* Overview */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Overview</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.fullDetails.overview}</p>
      </div>

      {/* Requirements & Documents side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Requirements</h3>
          <ul className="space-y-2">
            {item.fullDetails.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"><span className="text-[var(--accent)] mt-0.5">•</span>{r}</li>
            ))}
          </ul>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Documents Required</h3>
          <ul className="space-y-2">
            {item.fullDetails.documents.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"><span className="text-[var(--accent)] mt-0.5">📄</span>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Steps</h3>
        <ol className="space-y-3">
          {item.fullDetails.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* Tip & Penalty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--accent)] font-semibold">� Pro Tip:</span> {item.fullDetails.tip}</p>
        </div>
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300"><span className="font-semibold">⚠️ Penalty:</span> {item.fullDetails.penalty}</p>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full sm:w-auto px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
        Delegate This Task →
      </button>
    </div>
  );
}

/* ═══ DEMO MODAL ═══ */
function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--accent)]/20 rounded-2xl p-6 sm:p-8 space-y-5 animate-[fadeScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Compliance Tracking Demo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-surface-alt)] text-[var(--text-tertiary)] cursor-pointer" aria-label="Close">✕</button>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">See how INCroute tracks your compliance deadlines automatically.</p>
        <div className="space-y-3">
          {[{ task: "DIR-3 KYC", due: "Sep 30", progress: 85 }, { task: "GSTR-3B Filing", due: "Jul 20", progress: 60 }, { task: "AOC-4 Annual", due: "Oct 30", progress: 20 }].map((t, i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between text-sm"><span className="text-white font-medium">{t.task}</span><span className="text-[var(--text-tertiary)]">Due: {t.due}</span></div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-alt)]"><div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${t.progress}%` }} /></div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors">Start Tracking Now</button>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--accent)]/20 rounded-2xl p-6 sm:p-8 space-y-5 animate-[fadeScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Select Your Business Type</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-surface-alt)] text-[var(--text-tertiary)] cursor-pointer" aria-label="Close">✕</button>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">We'll show you the compliance requirements specific to your entity type.</p>
        <div className="space-y-2">
          {types.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${selected === t.id ? "border-purple-500 bg-[var(--accent-soft)]" : "border-[var(--border-subtle)] hover:border-[var(--accent)]/40 bg-[var(--bg-surface-alt)]"}`}>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
        <button disabled={!selected} className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors">
          View Compliance Roadmap →
        </button>
      </div>
    </div>
  );
}

/* ═══ CARD COMPONENT ═══ */
function ComplianceCard({ item, onClick }: { item: ComplianceItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className="relative bg-[var(--bg-surface)] backdrop-blur-sm border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] hover:border-[var(--accent)]/40 transition-all duration-300 cursor-pointer group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-1 rounded-md tracking-wide">{item.days}</span>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">{item.step}</span>
        </div>
        <h3 className="text-lg font-semibold text-white leading-snug">{item.title}</h3>
        <p className="uppercase text-[10px] tracking-widest text-[var(--accent)] mt-1.5 font-medium">{item.subtitle}</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-3 leading-relaxed">{item.shortDescription}</p>
        <div className="mt-4 p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/20">
          <p className="text-xs text-[var(--text-secondary)]"><span className="text-[var(--accent)] font-semibold">Pro Tip:</span> {item.fullDetails.tip}</p>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400"><span className="font-semibold">Penalty:</span> {item.fullDetails.penalty.substring(0, 80)}...</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-[var(--accent)] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        View Full Details <span>→</span>
      </p>
    </div>
  );
}

/* ═══ MAIN SECTION ═══ */
export default function ComplianceCalendarSection() {
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-[var(--accent)]/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {selectedItem ? (
            <ComplianceDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-5 mb-14">
                <span className="inline-block text-xs tracking-widest uppercase bg-[var(--accent-soft)] text-[var(--accent)] px-4 py-1.5 rounded-full font-medium">
                  Static Statutory Calendars
                </span>
                <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                  <span className="bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent)] bg-clip-text text-transparent">Global Compliance</span><br />
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--gradient-end)] bg-clip-text text-transparent">Calendars Tracker</span>
                </h2>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-[15px] leading-relaxed">
                  Unified live schedule of state, federal, and local statutory obligations. Keep your company fully operational and liability-free.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setShowOnboarding(true)} className="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    Get Started
                  </button>
                  <button onClick={() => setShowDemo(true)} className="px-6 py-2.5 border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)] text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    View Demo
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {complianceData.map(item => (
                  <ComplianceCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
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
