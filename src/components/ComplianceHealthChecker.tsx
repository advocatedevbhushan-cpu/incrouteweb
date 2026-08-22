import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Calendar, 
  Download, ArrowRight, RefreshCw, FileText, Check, HelpCircle, 
  Building2, Users, Receipt, Percent, Sparkles, PhoneCall, ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";

export interface ComplianceHealthCheckerProps {
  onBookAudit?: () => void;
}

export default function ComplianceHealthChecker({ onBookAudit }: ComplianceHealthCheckerProps) {
  // ─── Diagnostic Form State ───
  const [entityType, setEntityType] = useState<"pvt_ltd" | "llp" | "opc" | "sec8">("pvt_ltd");
  const [companyAge, setCompanyAge] = useState<"under_180_days" | "under_1_year" | "1_to_3_years" | "over_3_years">("1_to_3_years");
  const [turnoverBracket, setTurnoverBracket] = useState<"under_20l" | "20l_to_1cr" | "1cr_to_5cr" | "over_5cr">("20l_to_1cr");
  
  // Statutory registrations held
  const [hasGst, setHasGst] = useState<boolean>(true);
  const [hasTds, setHasTds] = useState<boolean>(true);
  const [hasPfEsi, setHasPfEsi] = useState<boolean>(false);
  const [hasMsme, setHasMsme] = useState<boolean>(true);
  const [hasFdi, setHasFdi] = useState<boolean>(false);

  // Past compliance status
  const [inc20aFiled, setInc20aFiled] = useState<boolean>(true);
  const [firstBmDone, setFirstBmDone] = useState<boolean>(true);
  const [dir3KycDone, setDir3KycDone] = useState<boolean>(true);
  const [aoc4Mgt7Filed, setAoc4Mgt7Filed] = useState<boolean>(true);
  const [dpt3Filed, setDpt3Filed] = useState<boolean>(false);
  const [gstrUpToDate, setGstrUpToDate] = useState<boolean>(true);

  const [companyName, setCompanyName] = useState<string>("");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [filterDueCategory, setFilterDueCategory] = useState<"all" | "urgent" | "roc" | "tax">("all");

  // ─── Score & Risk Engine ───
  const { score, riskLevel, riskColor, penaltiesEstimated, actionItems } = useMemo(() => {
    let pts = 100;
    let penaltyTotal = 0;
    const actions: { id: string; title: string; category: "roc" | "tax" | "governance"; dueDate: string; isUrgent: boolean; penaltyRate: string; description: string }[] = [];

    // 1. INC-20A Check
    if (entityType !== "llp") {
      if (!inc20aFiled) {
        pts -= 25;
        penaltyTotal += 50000;
        actions.push({
          id: "act-inc20a",
          title: "File Form INC-20A (Commencement of Business)",
          category: "roc",
          dueDate: "Immediate (Within 180 Days of Incorporation)",
          isUrgent: true,
          penaltyRate: "₹50,000 flat + ₹1,000/day on Directors",
          description: "Crucial MCA filing to unlock banking operations and prevent automatic company strike-off.",
        });
      }
    }

    // 2. DIR-3 KYC Check
    if (entityType !== "llp") {
      if (!dir3KycDone) {
        pts -= 20;
        penaltyTotal += 10000; // 2 directors * ₹5,000
        actions.push({
          id: "act-dir3",
          title: "File Annual DIR-3 KYC for Directors",
          category: "roc",
          dueDate: "Annually by September 30",
          isUrgent: true,
          penaltyRate: "₹5,000 late fee per Director DIN",
          description: "DIN is currently at risk of deactivation on the MCA registry.",
        });
      }
    }

    // 3. AOC-4 & MGT-7 (Annual ROC)
    if (companyAge !== "under_180_days") {
      if (!aoc4Mgt7Filed) {
        pts -= 25;
        penaltyTotal += 36000; // ~180 days * ₹200/day
        actions.push({
          id: "act-roc-annual",
          title: "File Form AOC-4 (Financials) & MGT-7 (Annual Return)",
          category: "roc",
          dueDate: "AOC-4: Oct 30 | MGT-7: Nov 29",
          isUrgent: true,
          penaltyRate: "₹100 per day per form indefinitely",
          description: "Essential annual secretarial filing of balance sheet and profit & loss statement.",
        });
      }
    }

    // 4. GST Returns
    if (hasGst) {
      if (!gstrUpToDate) {
        pts -= 15;
        penaltyTotal += 5000;
        actions.push({
          id: "act-gst",
          title: "Regularize GSTR-1 & GSTR-3B Monthly / QRMP Filings",
          category: "tax",
          dueDate: "Monthly on 11th & 20th",
          isUrgent: true,
          penaltyRate: "₹50 per day + 18% p.a. interest",
          description: "Unfiled GST returns block e-way bill generation and risk GSTIN cancellation.",
        });
      }
    }

    // 5. First Board Meeting & ADT-1
    if (!firstBmDone && (companyAge === "under_180_days" || companyAge === "under_1_year")) {
      pts -= 10;
      actions.push({
        id: "act-adt1",
        title: "Draft First Board Minutes & File ADT-1 (Auditor Appointment)",
        category: "governance",
        dueDate: "Within 30 Days of Incorporation",
        isUrgent: false,
        penaltyRate: "MCA Secretarial Default Notice",
        description: "Appoint formal statutory Chartered Accountant for mandatory annual audit.",
      });
    }

    // 6. DPT-3 Return of Deposits
    if (!dpt3Filed && entityType !== "llp") {
      actions.push({
        id: "act-dpt3",
        title: "File Form DPT-3 (Return of Deposits / Loan Disclosures)",
        category: "roc",
        dueDate: "Annually on or before June 30",
        isUrgent: false,
        penaltyRate: "₹5,000 on company + ₹500/day",
        description: "Mandatory annual filing for any director unsecured loans or advances received.",
      });
    }

    // 7. Advance Tax Deadlines
    actions.push({
      id: "act-advance-tax",
      title: "Quarterly Advance Income Tax Installments",
      category: "tax",
      dueDate: "15th June (15%), 15th Sep (45%), 15th Dec (75%), 15th Mar (100%)",
      isUrgent: false,
      penaltyRate: "1% per month interest under Sec 234B & 234C",
      description: "Pay corporate income tax installments in advance to avoid heavy fiscal interest.",
    });

    // 8. MSME-1 Half Yearly
    if (hasMsme) {
      actions.push({
        id: "act-msme1",
        title: "File Form MSME-1 (Half-Yearly Vendor Dues Return)",
        category: "roc",
        dueDate: "H1: Oct 31 | H2: April 30",
        isUrgent: false,
        penaltyRate: "₹20,000 to ₹3,00,000 on default",
        description: "Mandatory disclosure for payments delayed past 45 days to registered MSME suppliers.",
      });
    }

    // Bound score 0-100
    const finalScore = Math.max(10, Math.min(100, pts));
    let level: "Compliant" | "Moderate Risk" | "Critical Risk" = "Compliant";
    let color = "text-emerald-400";

    if (finalScore < 60) {
      level = "Critical Risk";
      color = "text-red-400";
    } else if (finalScore < 85) {
      level = "Moderate Risk";
      color = "text-amber-400";
    }

    return {
      score: finalScore,
      riskLevel: level,
      riskColor: color,
      penaltiesEstimated: penaltyTotal,
      actionItems: actions,
    };
  }, [entityType, companyAge, turnoverBracket, hasGst, hasTds, hasPfEsi, hasMsme, hasFdi, inc20aFiled, firstBmDone, dir3KycDone, aoc4Mgt7Filed, dpt3Filed, gstrUpToDate]);

  const filteredActionItems = useMemo(() => {
    if (filterDueCategory === "all") return actionItems;
    if (filterDueCategory === "urgent") return actionItems.filter(a => a.isUrgent);
    return actionItems.filter(a => a.category === filterDueCategory);
  }, [actionItems, filterDueCategory]);

  // ─── Export PDF Compliance Report ───
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 18;
      const cw = pw - m * 2;
      let y = 0;

      // Header Banner
      doc.setFillColor(13, 14, 21);
      doc.rect(0, 0, pw, 36, "F");

      doc.setFillColor(212, 175, 55);
      doc.rect(0, 36, pw, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("INC", m, 16);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(212, 175, 55);
      doc.text("route", m + 13, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(180, 185, 200);
      doc.text("CORPORATE STATUTORY AUDIT & COMPLIANCE HEALTH REPORT", m, 22);
      doc.text("Generated: " + new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }), m, 26);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.text("STATUTORY HEALTH: " + score + "%", pw - m, 18, { align: "right" });
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Status: " + riskLevel.toUpperCase(), pw - m, 24, { align: "right" });

      y = 46;

      // Company Overview Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(m, y, cw, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("ENTITY PROFILE UNDER ASSESSMENT", m + 5, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(companyName || "Your Enterprise Entity", m + 5, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const entityLabel = entityType === "pvt_ltd" ? "Private Limited Company" : entityType === "llp" ? "Limited Liability Partnership" : "One Person Company";
      doc.text(`Entity: ${entityLabel}  |  Age: ${companyAge.replace(/_/g, " ")}  |  Turnover: ${turnoverBracket.replace(/_/g, " ")}`, m + 5, y + 17);

      y += 28;

      // Risk & Penalty Summary
      doc.setFillColor(riskLevel === "Compliant" ? 240 : 254, riskLevel === "Compliant" ? 253 : 242, riskLevel === "Compliant" ? 244 : 242);
      doc.setDrawColor(riskLevel === "Compliant" ? 187 : 254, riskLevel === "Compliant" ? 247 : 202, riskLevel === "Compliant" ? 208 : 202);
      doc.roundedRect(m, y, cw, 18, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(riskLevel === "Compliant" ? 22 : 185, riskLevel === "Compliant" ? 101 : 28, riskLevel === "Compliant" ? 52 : 28);
      doc.text(`Compliance Score: ${score}/100 — Status: ${riskLevel}`, m + 5, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Estimated Accumulated / Impending Penalty Risk: Rs ${penaltiesEstimated.toLocaleString("en-IN")}`, m + 5, y + 13);

      y += 24;

      // Action Items Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("Personalized Statutory Compliance Action Plan & Due Dates:", m, y);
      y += 6;

      actionItems.forEach((act, idx) => {
        if (y > ph - 30) {
          doc.addPage();
          y = m + 5;
        }

        doc.setFillColor(act.isUrgent ? 254 : 248, act.isUrgent ? 242 : 250, act.isUrgent ? 242 : 252);
        doc.setDrawColor(act.isUrgent ? 254 : 226, act.isUrgent ? 202 : 232, act.isUrgent ? 202 : 240);
        doc.roundedRect(m, y, cw, 16, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(act.isUrgent ? 185 : 15, act.isUrgent ? 28 : 23, act.isUrgent ? 28 : 42);
        doc.text(`${idx + 1}. ${act.title}`, m + 4, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(79, 70, 229);
        doc.text(`Due: ${act.dueDate}`, pw - m - 4, y + 5, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(act.description, m + 4, y + 10);
        doc.text(`Statutory Penalty: ${act.penaltyRate}`, m + 4, y + 14);

        y += 19;
      });

      // Footer
      const signY = ph - 15;
      doc.setDrawColor(226, 232, 240);
      doc.line(m, signY - 2, pw - m, signY - 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("INCroute Corporate Advisory  |  Helpline: +91 87075 52183  |  Email: info@incroute.com", pw / 2, signY + 3, { align: "center" });

      doc.save(`INCroute_Compliance_Audit_${score}pct.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ─── Export iCalendar (.ics) File ───
  const handleExportICS = () => {
    const icsEvents = actionItems.map((act) => {
      const title = `[INCroute Compliance] ${act.title}`;
      const desc = `${act.description}\nPenalty if delayed: ${act.penaltyRate}`;
      return (
        "BEGIN:VEVENT\r\n" +
        `SUMMARY:${title}\r\n` +
        `DESCRIPTION:${desc}\r\n` +
        `STATUS:CONFIRMED\r\n` +
        "END:VEVENT\r\n"
      );
    }).join("");

    const icsContent = 
      "BEGIN:VCALENDAR\r\n" +
      "VERSION:2.0\r\n" +
      "PRODID:-//INCroute Corporate Services//Compliance Calendar//EN\r\n" +
      "CALSCALE:GREGORIAN\r\n" +
      icsEvents +
      "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "INCroute_Statutory_Deadlines.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-10 text-left">
      {/* ─── Hero Header ─── */}
      <div className="bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-alt)] to-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-mono font-bold rounded-full border border-[var(--border-subtle)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> AI Statutory Diagnostic
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold rounded-full border border-emerald-500/20">
              MCA & Income Tax Updated
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Enterprise Compliance Health Score & Due Date Planner
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Audit your company's regulatory health, calculate notice & penalty exposures, and generate a customized statutory calendar for your board.
          </p>
        </div>
      </div>

      {/* ─── Diagnostic & Score Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Questionnaire (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Entity Details */}
          <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" /> 1. Company Profile & Structure
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Company / Proposed Business Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Technologies Private Limited"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Entity Constitution
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="pvt_ltd">Private Limited Company</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="opc">One Person Company (OPC)</option>
                    <option value="sec8">Section 8 (Non-Profit NGO)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Incorporation Age / Vintage
                  </label>
                  <select
                    value={companyAge}
                    onChange={(e) => setCompanyAge(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="under_180_days">Under 180 Days (Newly Registered)</option>
                    <option value="under_1_year">6 Months to 1 Year</option>
                    <option value="1_to_3_years">1 to 3 Years</option>
                    <option value="over_3_years">Over 3 Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Active Licenses & Registrations */}
          <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--accent)]" /> 2. Active Statutory Registrations Held
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                hasGst ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}>
                <input type="checkbox" checked={hasGst} onChange={e => setHasGst(e.target.checked)} className="accent-[var(--accent)]" />
                <span>GSTIN Active</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                hasTds ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}>
                <input type="checkbox" checked={hasTds} onChange={e => setHasTds(e.target.checked)} className="accent-[var(--accent)]" />
                <span>TAN / TDS Deduction</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                hasPfEsi ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}>
                <input type="checkbox" checked={hasPfEsi} onChange={e => setHasPfEsi(e.target.checked)} className="accent-[var(--accent)]" />
                <span>PF / ESIC Payroll</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                hasMsme ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}>
                <input type="checkbox" checked={hasMsme} onChange={e => setHasMsme(e.target.checked)} className="accent-[var(--accent)]" />
                <span>MSME / Udyam</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                hasFdi ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-semibold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}>
                <input type="checkbox" checked={hasFdi} onChange={e => setHasFdi(e.target.checked)} className="accent-[var(--accent)]" />
                <span>Foreign Investment (FDI)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Governance & Past Compliance Checklist */}
          <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" /> 3. Current Filing & Compliance Status
            </h3>

            <div className="space-y-2.5 text-xs">
              {entityType !== "llp" && (
                <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-[var(--text-primary)] block">Form INC-20A (Commencement of Business)</strong>
                    <span className="text-[11px] text-[var(--text-secondary)]">Filed capital deposit proof with MCA within 180 days?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInc20aFiled(true)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${inc20aFiled ? "bg-emerald-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Filed
                    </button>
                    <button
                      type="button"
                      onClick={() => setInc20aFiled(false)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${!inc20aFiled ? "bg-red-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}

              {entityType !== "llp" && (
                <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-[var(--text-primary)] block">DIR-3 KYC (Annual Director Verification)</strong>
                    <span className="text-[11px] text-[var(--text-secondary)]">Have all directors completed KYC for the latest fiscal year?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDir3KycDone(true)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${dir3KycDone ? "bg-emerald-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => setDir3KycDone(false)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${!dir3KycDone ? "bg-red-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Overdue
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                <div>
                  <strong className="text-[var(--text-primary)] block">Annual ROC Returns (AOC-4 & MGT-7)</strong>
                  <span className="text-[11px] text-[var(--text-secondary)]">Filed balance sheet & annual secretarial returns?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAoc4Mgt7Filed(true)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${aoc4Mgt7Filed ? "bg-emerald-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                  >
                    Filed
                  </button>
                  <button
                    type="button"
                    onClick={() => setAoc4Mgt7Filed(false)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${!aoc4Mgt7Filed ? "bg-red-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {hasGst && (
                <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-[var(--text-primary)] block">GSTR-1 & GSTR-3B Filings</strong>
                    <span className="text-[11px] text-[var(--text-secondary)]">Are monthly/quarterly GST returns up-to-date?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGstrUpToDate(true)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${gstrUpToDate ? "bg-emerald-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Up to date
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstrUpToDate(false)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${!gstrUpToDate ? "bg-red-500 text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Score Gauge & Risk Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Score Card */}
          <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl text-center space-y-6 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-tertiary)] font-bold">
                Overall Compliance Health
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-display">
                Regulatory Health Gauge
              </h3>
            </div>

            {/* Circular Meter Display */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-[var(--bg-surface-alt)] fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className={`fill-none transition-all duration-700 ${
                    score >= 85 ? "stroke-emerald-400" : score >= 60 ? "stroke-amber-400" : "stroke-red-400"
                  }`}
                  strokeWidth="10"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
                  {score}%
                </span>
                <span className={`text-[11px] font-bold font-mono mt-0.5 ${riskColor}`}>
                  {riskLevel}
                </span>
              </div>
            </div>

            {/* Penalty Warning Banner */}
            <div className={`p-4 rounded-2xl border text-left space-y-1.5 ${
              penaltiesEstimated > 0
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {penaltiesEstimated > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>
                  {penaltiesEstimated > 0 ? "Penalty Exposure Detected" : "Zero Penalties Accrued"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {penaltiesEstimated > 0
                  ? `Estimated exposure of ₹${penaltiesEstimated.toLocaleString("en-IN")} in government late fees & compounding daily charges.`
                  : "All critical statutory filings are on schedule. Keep track of upcoming deadlines below."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <Download className="w-4 h-4" />
                {isExportingPdf ? "Generating PDF Audit..." : "Download Compliance Audit (PDF)"}
              </button>

              <button
                onClick={handleExportICS}
                className="w-full py-2.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[var(--accent)]" /> Sync to Google Calendar (.ics)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Plan & Due Dates Timeline ─── */}
      <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
              Personalized Statutory Due Date Roadmap
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Action items tailored to your entity type and active registrations.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "urgent", "roc", "tax"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterDueCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-colors cursor-pointer ${
                  filterDueCategory === cat
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                {cat === "all" ? "All Items" : cat === "urgent" ? "⚠️ Urgent" : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActionItems.map((act) => (
            <div
              key={act.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                act.isUrgent
                  ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                  : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] hover:border-[var(--accent)]/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    act.isUrgent ? "bg-red-500/15 text-red-400" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}>
                    {act.category.toUpperCase()} • {act.isUrgent ? "Action Required" : "Scheduled"}
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-display pt-1">
                    {act.title}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-[var(--accent)] font-mono block">
                    {act.dueDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                {act.description}
              </p>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[var(--accent)]" /> {act.penaltyRate}
                </span>
                <button
                  onClick={() => window.open(`https://wa.me/918707552183?text=${encodeURIComponent(`Hi, I need assistance with ${act.title} for my company.`)}`, "_blank")}
                  className="text-[var(--accent)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  CA Support <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
