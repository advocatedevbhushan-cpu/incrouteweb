import React, { useState, useMemo } from "react";
import { 
  Calculator, Receipt, Clock, AlertTriangle, ShieldCheck, Download, 
  ArrowRight, Info, CheckCircle2, RefreshCw, Calendar, Sparkles, Percent
} from "lucide-react";
import jsPDF from "jspdf";

export default function GstLateFeeCalculator() {
  // ─── Calculator Inputs ───
  const [returnType, setReturnType] = useState<"GSTR-3B" | "GSTR-1">("GSTR-3B");
  const [isNilReturn, setIsNilReturn] = useState<boolean>(false);
  const [turnoverSlab, setTurnoverSlab] = useState<"under_1.5cr" | "1.5cr_to_5cr" | "above_5cr">("under_1.5cr");
  
  // Dates
  const [dueDate, setDueDate] = useState<string>("2026-05-20");
  const [filingDate, setFilingDate] = useState<string>("2026-06-15");
  
  // Tax breakdown
  const [cashIgst, setCashIgst] = useState<number>(0);
  const [cashCgst, setCashCgst] = useState<number>(15000);
  const [cashSgst, setCashSgst] = useState<number>(15000);
  const [itcOffset, setItcOffset] = useState<number>(50000);

  const [interestRate, setInterestRate] = useState<18 | 24>(18);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ─── Calculation Engine ───
  const calculation = useMemo(() => {
    const due = new Date(dueDate);
    const filing = new Date(filingDate);

    // Days difference
    const diffTime = filing.getTime() - due.getTime();
    const delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Late Fee calculation
    // NIL return: ₹20/day (₹10 CGST + ₹10 SGST)
    // Non-NIL return: ₹50/day (₹25 CGST + ₹25 SGST)
    const dailyLateFeeCgst = isNilReturn ? 10 : 25;
    const dailyLateFeeSgst = isNilReturn ? 10 : 25;

    let rawLateFeeCgst = delayDays * dailyLateFeeCgst;
    let rawLateFeeSgst = delayDays * dailyLateFeeSgst;

    // Capping as per CBIC Notification
    // NIL: max ₹500 (₹250+₹250)
    // Turnover < 1.5Cr: max ₹2,000 (₹1,000+₹1,000)
    // Turnover 1.5Cr - 5Cr: max ₹5,000 (₹2,500+₹2,500)
    // Turnover > 5Cr: max ₹10,000 (₹5,000+₹5,000)
    let maxCapPerHead = 5000;
    if (isNilReturn) maxCapPerHead = 250;
    else if (turnoverSlab === "under_1.5cr") maxCapPerHead = 1000;
    else if (turnoverSlab === "1.5cr_to_5cr") maxCapPerHead = 2500;
    else maxCapPerHead = 5000;

    const finalLateFeeCgst = Math.min(rawLateFeeCgst, maxCapPerHead);
    const finalLateFeeSgst = Math.min(rawLateFeeSgst, maxCapPerHead);
    const totalLateFee = finalLateFeeCgst + finalLateFeeSgst;

    // Section 50 Interest Calculation (ONLY on Net Cash Liability!)
    const totalNetCashTax = (cashIgst || 0) + (cashCgst || 0) + (cashSgst || 0);
    
    // Formula: (Net Cash Tax * Interest Rate% * Delay Days) / 365
    const interestPayable = isNilReturn || totalNetCashTax === 0 || delayDays === 0
      ? 0
      : Math.round((totalNetCashTax * (interestRate / 100) * delayDays) / 365);

    const interestCgst = Math.round(((cashCgst || 0) * (interestRate / 100) * delayDays) / 365);
    const interestSgst = Math.round(((cashSgst || 0) * (interestRate / 100) * delayDays) / 365);
    const interestIgst = Math.round(((cashIgst || 0) * (interestRate / 100) * delayDays) / 365);

    const grandTotalPayable = totalLateFee + interestPayable + totalNetCashTax;

    return {
      delayDays,
      dailyRate: isNilReturn ? 20 : 50,
      lateFeeCgst: finalLateFeeCgst,
      lateFeeSgst: finalLateFeeSgst,
      totalLateFee,
      totalNetCashTax,
      interestPayable,
      interestCgst,
      interestSgst,
      interestIgst,
      grandTotalPayable,
      maxCapPerHead,
    };
  }, [dueDate, filingDate, isNilReturn, turnoverSlab, cashIgst, cashCgst, cashSgst, interestRate]);

  // ─── Export PDF Computation Sheet ───
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 18;
      const cw = pw - m * 2;
      let y = 0;

      // Header
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
      doc.text("GST STATUTORY LATE FEE & SECTION 50 INTEREST COMPUTATION", m, 22);
      doc.text("Generated: " + new Date().toLocaleDateString("en-IN"), m, 26);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.text(`DELAY: ${calculation.delayDays} DAYS`, pw - m, 18, { align: "right" });
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`Return: ${returnType}`, pw - m, 24, { align: "right" });

      y = 48;

      // Filing Parameters Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(m, y, cw, 20, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("RETURN FILING PARAMETERS", m + 5, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Due Date: ${dueDate}   |   Actual Filing Date: ${filingDate}   |   Days Delayed: ${calculation.delayDays} Days`, m + 5, y + 11);
      doc.text(`Return Type: ${returnType} ${isNilReturn ? "(NIL Return)" : "(Regular)"}   |   Turnover Slab: ${turnoverSlab.replace(/_/g, " ")}`, m + 5, y + 16);

      y += 26;

      // Computation Table
      doc.setFillColor(15, 23, 42);
      doc.rect(m, y, cw, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Statutory Component", m + 4, y + 5);
      doc.text("Basis / Statutory Rate", m + 70, y + 5);
      doc.text("CGST (Rs)", m + 115, y + 5);
      doc.text("SGST (Rs)", m + 138, y + 5);
      doc.text("Total (Rs)", pw - m - 4, y + 5, { align: "right" });
      y += 7;

      // Row 1: Late Fee
      doc.setFillColor(255, 255, 255);
      doc.rect(m, y, cw, 7, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("Late Filing Fee (Sec 47)", m + 4, y + 5);
      doc.text(`Rs ${calculation.dailyRate}/day (Cap Rs ${calculation.maxCapPerHead * 2})`, m + 70, y + 5);
      doc.text(calculation.lateFeeCgst.toLocaleString("en-IN"), m + 115, y + 5);
      doc.text(calculation.lateFeeSgst.toLocaleString("en-IN"), m + 138, y + 5);
      doc.text(calculation.totalLateFee.toLocaleString("en-IN"), pw - m - 4, y + 5, { align: "right" });
      y += 7;

      // Row 2: Section 50 Interest
      doc.setFillColor(248, 250, 252);
      doc.rect(m, y, cw, 7, "F");
      doc.text("Interest on Net Cash Tax (Sec 50)", m + 4, y + 5);
      doc.text(`${interestRate}% p.a. on Cash Ledger`, m + 70, y + 5);
      doc.text(calculation.interestCgst.toLocaleString("en-IN"), m + 115, y + 5);
      doc.text(calculation.interestSgst.toLocaleString("en-IN"), m + 138, y + 5);
      doc.text(calculation.interestPayable.toLocaleString("en-IN"), pw - m - 4, y + 5, { align: "right" });
      y += 7;

      // Row 3: Net Cash Tax
      doc.setFillColor(255, 255, 255);
      doc.rect(m, y, cw, 7, "F");
      doc.text("Net Cash Tax Liability", m + 4, y + 5);
      doc.text("Challan Cash Offset", m + 70, y + 5);
      doc.text(cashCgst.toLocaleString("en-IN"), m + 115, y + 5);
      doc.text(cashSgst.toLocaleString("en-IN"), m + 138, y + 5);
      doc.text(calculation.totalNetCashTax.toLocaleString("en-IN"), pw - m - 4, y + 5, { align: "right" });
      y += 9;

      // Totals Box
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(pw - m - 70, y, 70, 20, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text("TOTAL CASH OUTLAY:", pw - m - 66, y + 7);
      doc.setFontSize(13);
      doc.text(`Rs ${calculation.grandTotalPayable.toLocaleString("en-IN")}`, pw - m - 4, y + 15, { align: "right" });

      y += 28;

      // Section 50 Note Box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(m, y, cw, 18, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text("PRO-TIP: SECTION 50 PROVISO STATUTORY BENEFIT", m + 4, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("As per the retrospective amendment to Section 50(1), interest is payable ONLY on the net cash liability paid through PMT-06 challan.", m + 4, y + 11);
      doc.text(`Tax liability paid via Input Tax Credit (Rs ${itcOffset.toLocaleString("en-IN")}) attracts ZERO interest under law.`, m + 4, y + 15);

      // Footer
      const signY = ph - 15;
      doc.setDrawColor(226, 232, 240);
      doc.line(m, signY - 2, pw - m, signY - 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("INCroute Corporate Advisory  |  Helpline: +91 87075 52183  |  Email: info@incroute.com", pw / 2, signY + 3, { align: "center" });

      doc.save(`INCroute_GST_Late_Fee_Computation.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-10 text-left">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-alt)] to-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-mono font-bold rounded-full border border-[var(--border-subtle)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Statutory GST Calculator
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold rounded-full border border-emerald-500/20">
              Updated with Sec 50 Proviso
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            GST Late Fee & Section 50 Interest Calculator
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Calculate precise GST late filing fees under Section 47 and statutory interest under Section 50 on net cash liability for Form GSTR-3B and GSTR-1.
          </p>
        </div>
      </div>

      {/* Grid Layout: Inputs & Computed Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Calculator Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Return Type & Turnover */}
          <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--accent)]" /> 1. Return Type & Period
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Return Form
                </label>
                <select
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                >
                  <option value="GSTR-3B">Form GSTR-3B (Monthly/QRMP)</option>
                  <option value="GSTR-1">Form GSTR-1 (Outward Supplies)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Annual Turnover Slab
                </label>
                <select
                  value={turnoverSlab}
                  onChange={(e) => setTurnoverSlab(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                >
                  <option value="under_1.5cr">Turnover &lt; ₹1.5 Cr (Cap ₹2K)</option>
                  <option value="1.5cr_to_5cr">Turnover ₹1.5 Cr - ₹5 Cr (Cap ₹5K)</option>
                  <option value="above_5cr">Turnover &gt; ₹5 Cr (Cap ₹10K)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Return Status
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <label className={`px-3 py-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all w-full ${
                    isNilReturn ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)] font-bold" : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}>
                    <input type="checkbox" checked={isNilReturn} onChange={e => setIsNilReturn(e.target.checked)} className="accent-[var(--accent)]" />
                    <span>NIL Return (₹20/d)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)] text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Statutory Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Actual / Planned Filing Date
                </label>
                <input
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tax Liability & Cash Breakdown */}
          {!isNilReturn && (
            <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[var(--accent)]" /> 2. Tax Liability Breakdown
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  Sec 50 on Cash Ledger Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Net Cash CGST (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashCgst || ""}
                    onChange={(e) => setCashCgst(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Net Cash SGST (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashSgst || ""}
                    onChange={(e) => setCashSgst(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Net Cash IGST (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashIgst || ""}
                    onChange={(e) => setCashIgst(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    ITC Utilized (0% Interest Rate)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itcOffset || ""}
                    onChange={(e) => setItcOffset(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Applicable Interest Rate
                  </label>
                  <select
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value) as any)}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold outline-none focus:border-[var(--accent)]"
                  >
                    <option value="18">18% p.a. (Section 50(1) Standard Delay)</option>
                    <option value="24">24% p.a. (Section 50(3) Ineligible ITC claim)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Computed Output Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-5 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-tertiary)] font-bold">
                Computed Statutory Liability
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-display">
                GST Outflow Breakdown
              </h3>
            </div>

            {/* Big Total Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-surface-alt)] to-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Days of Filing Delay:</span>
                <strong className="text-amber-400 font-mono text-sm bg-amber-500/10 px-2 py-0.5 rounded">
                  {calculation.delayDays} Days
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Late Fee (Sec 47):</span>
                <strong className="text-[var(--text-primary)] font-mono">
                  ₹{calculation.totalLateFee.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Interest on Cash (Sec 50):</span>
                <strong className="text-[var(--text-primary)] font-mono">
                  ₹{calculation.interestPayable.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">Total Extra Outlay:</span>
                <span className="text-lg font-extrabold text-[var(--accent)] font-display">
                  ₹{(calculation.totalLateFee + calculation.interestPayable).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Section 50 Proviso Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 text-left">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Section 50(1) Benefit Applied</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Interest is strictly calculated on ₹{calculation.totalNetCashTax.toLocaleString("en-IN")} (Cash Challan). ₹{itcOffset.toLocaleString("en-IN")} paid via ITC is 100% interest-free.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Generating PDF..." : "Download Calculation Sheet (PDF)"}
              </button>

              <button
                onClick={() => window.open(`https://wa.me/918707552183?text=${encodeURIComponent(`Hi, I calculated GST late fees for ${calculation.delayDays} days of delay. Need help filing GSTR-3B and regularizing compliance.`)}`, "_blank")}
                className="w-full py-2.5 bg-[var(--bg-surface-alt)] hover:bg-emerald-500/10 hover:text-emerald-400 text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Consult CA to File GST Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
