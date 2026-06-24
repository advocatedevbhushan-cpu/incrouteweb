import React, { useState, useMemo } from "react";
import { useLang } from "../lib/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator, FileText, Download, TrendingUp, Building2, Users, Sparkles,
  ClipboardCheck, Scale, Check, CheckCircle2, X, AlertCircle, Loader2,
  Send, Info, HelpCircle,
} from "lucide-react";
import jsPDF from "jspdf";

// India Stamp Duty Rates (State-wise)
const STATE_STAMP_RATES: Record<string, { pvtLtdBase: number; pvtLtdPercent: number; llpBase: number }> = {
  "Andaman & Nicobar Islands": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Andhra Pradesh": { pvtLtdBase: 1000, pvtLtdPercent: 0.005, llpBase: 500 },
  "Arunachal Pradesh": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Assam": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Bihar": { pvtLtdBase: 1500, pvtLtdPercent: 0.003, llpBase: 750 },
  "Chandigarh": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Chhattisgarh": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Delhi": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Goa": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Gujarat": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Haryana": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Himachal Pradesh": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Jharkhand": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Karnataka": { pvtLtdBase: 1500, pvtLtdPercent: 0.005, llpBase: 750 },
  "Kerala": { pvtLtdBase: 1500, pvtLtdPercent: 0.005, llpBase: 750 },
  "Madhya Pradesh": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Maharashtra": { pvtLtdBase: 2000, pvtLtdPercent: 0.005, llpBase: 1000 },
  "Manipur": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Meghalaya": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Mizoram": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Nagaland": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Odisha": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Punjab": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Rajasthan": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Sikkim": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Tamil Nadu": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Telangana": { pvtLtdBase: 1500, pvtLtdPercent: 0.005, llpBase: 750 },
  "Tripura": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Uttar Pradesh": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Uttarakhand": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "West Bengal": { pvtLtdBase: 1500, pvtLtdPercent: 0.0045, llpBase: 750 },
};

export default function StatutoryTools() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"calculator" | "generator">("calculator");

  // Calculator State
  const [calcState, setCalcState] = useState("Maharashtra");
  const [entityType, setEntityType] = useState("Pvt Ltd");
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);

  // Document Generator State
  const [selectedDoc, setSelectedDoc] = useState<"noc" | "founders">("noc");
  const [nocFields, setNocFields] = useState({
    proposedName: "",
    ownerName: "",
    premisesAddress: "",
    applicantName: "",
    relationship: "",
    otherRelationship: "",
  });
  const [foundersFields, setFoundersFields] = useState({
    founderA: "",
    founderB: "",
    equitySplit: "50/50",
    customSplit: "",
    vestingEnabled: true,
    proposedName: "",
  });

  // Premium Request State
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumCooldown, setPremiumCooldown] = useState(() => sessionStorage.getItem("premium_sent") === "true");
  const [premiumSubmitting, setPremiumSubmitting] = useState(false);
  const [premiumError, setPremiumError] = useState("");
  const [premiumSuccess, setPremiumSuccess] = useState(false);
  const [premiumForm, setPremiumForm] = useState({ email: "", phone: "", specialRequests: "" });
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);

  // Calculate fees (detailed breakdown)
  const getCalculatedFees = () => {
    const govBaseFee = entityType === "Pvt Ltd" ? 1000 : entityType === "LLP" ? 500 : 800;
    const stateRules = STATE_STAMP_RATES[calcState] || STATE_STAMP_RATES["Maharashtra"];
    let stampDuty = 0;
    if (entityType === "Pvt Ltd" || entityType === "OPC") {
      stampDuty = stateRules.pvtLtdBase + (authorizedCapital * stateRules.pvtLtdPercent);
    } else {
      stampDuty = stateRules.llpBase + (authorizedCapital * 0.001);
    }
    const dscCost = entityType === "LLP" ? 1500 : 3000;
    const panTanGovFee = 150;
    const professionalFee = entityType === "Pvt Ltd" ? 999 : entityType === "LLP" ? 1499 : 1299;
    const totalGovernmentFees = govBaseFee + Math.round(stampDuty) + panTanGovFee;
    const totalFinal = totalGovernmentFees + dscCost + professionalFee;
    return { govBaseFee, stampDuty: Math.round(stampDuty), dscCost, panTanGovFee, professionalFee, totalGovernmentFees: Math.round(totalGovernmentFees), totalFinal: Math.round(totalFinal) };
  };

  const fees = getCalculatedFees();

  // Helper for placeholder text
  const fill = (val: string, placeholder: string) => val.trim() || `______ [${placeholder}]`;

  // Real-time NOC template
  const nocPreview = useMemo(() => {
    const owner = fill(nocFields.ownerName, "PROPERTY OWNER NAME");
    const address = fill(nocFields.premisesAddress, "FULL OFFICE ADDRESS");
    const applicant = fill(nocFields.applicantName, "APPLICANT / FOUNDER NAME");
    const rel = nocFields.relationship === "Other"
      ? fill(nocFields.otherRelationship, "RELATIONSHIP")
      : fill(nocFields.relationship, "LEASE RELATIONSHIP");
    const name = fill(nocFields.proposedName, "PROPOSED BRAND PREFIX");

    return `NO OBJECTION CERTIFICATE

TO WHOMSOEVER IT MAY CONCERN

I, ${owner}, sole owner and legal possessor of the commercial premises situated at:
${address}

Do hereby declare and state under no duress that:

1. I am the absolute legal owner of the aforementioned property and have full authority to execute this No Objection Certificate.

2. I have granted full authorization and license to ${applicant} in the capacity of ${rel} to utilize the registered commercial address of the property as the "Registered Office Address" of their proposed corporate entity under the name of:
   M/S ${name} PRIVATE LIMITED / LLP

3. I solemnly affirm that I have no objection to the Registrar of Companies (ROC), Ministry of Corporate Affairs, or statutory tax authorities registering the proposed company at this property location.

4. I further declare that I have no financial interest, debt liability, or regulatory conflict with the operations of the proposed company.

Signed, Sealed, and Executed on this ______ Day of ____________, ${new Date().getFullYear()}.

____________________________
(${owner})
Property Owner & Declarant`;
  }, [nocFields]);

  // Real-time Founders Deed template
  const foundersPreview = useMemo(() => {
    const a = fill(foundersFields.founderA, "FOUNDER A NAME");
    const b = fill(foundersFields.founderB, "FOUNDER B NAME");
    const name = fill(foundersFields.proposedName, "PROPOSED BRAND PREFIX");
    const split = foundersFields.equitySplit === "Custom"
      ? fill(foundersFields.customSplit, "CUSTOM SPLIT e.g. 65/35")
      : foundersFields.equitySplit;
    const [splitA, splitB] = split.includes("/") ? split.split("/") : ["50", "50"];
    const vesting = foundersFields.vestingEnabled
      ? "All founder shares shall vest over a 4-year period (48 months), subject to a 1-year (12 months) cliff."
      : "No vesting schedule applies. All shares are fully vested upon incorporation.";

    return `FOUNDERS' CO-FOUNDER AGREEMENT

THIS AGREEMENT is entered into this ______ Day of ____________, ${new Date().getFullYear()} by and between:
1. ${a} ("Founder A")
2. ${b} ("Founder B")

WHEREAS the Founders intend to incorporate and launch a business under the proposed brand prefix:
M/S ${name} PRIVATE LIMITED ("The Company")

IT IS AGREED BY THE FOUNDERS AS FOLLOWS:

1. EQUITY & SHAREHOLDING ALLOCATION:
   • Founder A (${a}): ${splitA}% Shareholding
   • Founder B (${b}): ${splitB}% Shareholding

2. RESPONSIBILITIES & DESIGNATION:
   • Founder A shall assume the role of Chief Executive Officer (CEO).
   • Founder B shall assume the role of Chief Operating Officer (COO).

3. VESTING SCHEDULE:
   ${vesting}

4. JURISDICTION & DISPUTE RESOLUTION:
   This agreement shall be governed under the laws of India. Disputes shall be resolved through arbitration in ${calcState}.

IN WITNESS WHEREOF, the Founders have executed this agreement:

____________________________            ____________________________
Founder A Signature                     Founder B Signature`;
  }, [foundersFields, calcState]);

  const currentPreview = selectedDoc === "noc" ? nocPreview : foundersPreview;

  // PDF Generation
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(26, 28, 30); // charcoal
    doc.text("INCROUTE | Common Draft Document", margin, y);
    y += 6;

    // Neon Green line
    doc.setDrawColor(191, 255, 0); // #BFFF00
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, margin, y);
    y += 10;

    // Document content
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    const lines = doc.splitTextToSize(currentPreview, contentWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5.5;
    }

    // Footer
    y = Math.max(y + 10, 270);
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setDrawColor(191, 255, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This is a common draft generated by Incroute. Not a substitute for legal advice. Upgrade to Premium for a personalized, CA-reviewed document.",
      margin, y, { maxWidth: contentWidth }
    );

    const filename = selectedDoc === "noc" ? "Incroute_NOC_Draft.pdf" : "Incroute_Founders_Agreement_Draft.pdf";
    doc.save(filename);
  };

  // Premium submit handler
  const handlePremiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumForm.email || !premiumForm.phone) {
      setPremiumError("Email and phone are required.");
      return;
    }
    setPremiumSubmitting(true);
    setPremiumError("");

    // Simulate submission (no actual email sent)
    setTimeout(() => {
      console.log(`Premium request submitted for ${premiumForm.email}`, {
        phone: premiumForm.phone,
        specialRequests: premiumForm.specialRequests,
        documentType: selectedDoc,
        wizardData: selectedDoc === "noc" ? nocFields : foundersFields,
      });

      localStorage.setItem("premium_request", JSON.stringify({
        email: premiumForm.email,
        phone: premiumForm.phone,
        specialRequests: premiumForm.specialRequests,
        documentType: selectedDoc,
        timestamp: new Date().toISOString(),
      }));

      setPremiumSubmitting(false);
      setShowPremiumModal(false);
      setPremiumCooldown(true);
      sessionStorage.setItem("premium_sent", "true");
      setPremiumSuccess(true);
      setPremiumForm({ email: "", phone: "", specialRequests: "" });
      setTimeout(() => setPremiumSuccess(false), 8000);
    }, 1200);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> {lang === "hi" ? "इंटरैक्टिव उपकरण" : "Interactive Statutory Tools"}
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          {lang === "hi" ? "कानूनी" : "Legal"} <span className="text-brand-gold italic font-normal">{lang === "hi" ? "उपकरण।" : "Utilities."}</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          {lang === "hi" ? "स्टाम्प ड्यूटी कैलकुलेटर और कानूनी ड्राफ्ट जनरेटर" : "Interactive calculator for government stamp duties and an intelligent generator to build, preview, and download legal drafts instantly."}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-brand-bg-lighter border border-brand-border p-1 rounded-xl inline-flex gap-1">
          <button onClick={() => setActiveTab("calculator")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${activeTab === "calculator" ? "bg-brand-gold text-black font-bold" : "text-brand-text-muted hover:text-brand-text"}`}>
            <Calculator className="w-3.5 h-3.5" /> {lang === "hi" ? "स्टाम्प कैलकुलेटर" : "Stamp Calculator"}
          </button>
          <button onClick={() => setActiveTab("generator")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${activeTab === "generator" ? "bg-brand-gold text-black font-bold" : "text-brand-text-muted hover:text-brand-text"}`}>
            <FileText className="w-3.5 h-3.5" /> {lang === "hi" ? "ड्राफ्ट जनरेटर" : "Draft Generator"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ CALCULATOR TAB ═══ */}
        {activeTab === "calculator" && (
          <motion.div key="calc" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
            {/* Left: Configuration (7 cols) */}
            <div className="lg:col-span-7 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-brand-border pb-3">
                <h3 className="text-xl font-light text-brand-text serif flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-brand-gold" /> Fee Configuration
                </h3>
                <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest mt-1">Configure Company Share & Capital parameters</p>
              </div>

              <div className="space-y-4">
                {/* State */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">State / Union Territory</label>
                  <select value={calcState} onChange={(e) => setCalcState(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-3 text-xs text-brand-text outline-none focus:border-brand-gold cursor-pointer">
                    {Object.keys(STATE_STAMP_RATES).map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                {/* Entity Type Buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">Entity Framework</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pvt Ltd", "LLP", "OPC"].map((type) => (
                      <button key={type} type="button" onClick={() => setEntityType(type)} className={`py-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${entityType === type ? "bg-brand-gold/15 text-brand-gold border-brand-gold/45 shadow" : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text"}`}>
                        {type === "Pvt Ltd" ? <Building2 className="w-4 h-4 inline-block mr-1.5" /> : type === "LLP" ? <Users className="w-4 h-4 inline-block mr-1.5" /> : <Scale className="w-4 h-4 inline-block mr-1.5" />}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capital Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-brand-gold font-bold">Proposed Authorized Capital* (Estimated)</span>
                    <span className="text-brand-text font-bold">₹{authorizedCapital.toLocaleString()}*</span>
                  </div>
                  <input type="range" min="100000" max="10000000" step="50000" value={authorizedCapital} onChange={(e) => setAuthorizedCapital(Number(e.target.value))} className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-gold" />
                  <div className="flex justify-between text-[9px] text-brand-text-muted/60 font-mono">
                    <span>₹1,00,000*</span>
                    <span>₹50,00,000*</span>
                    <span>₹1,00,00,000*</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Invoice Receipt (5 cols) */}
            <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl rounded-full" />
              <div className="space-y-4 relative z-10">
                <div className="border-b border-brand-border pb-3 text-center">
                  <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded border border-brand-gold/20 uppercase tracking-widest font-bold">Statutory Receipt Draft</span>
                  <h4 className="text-lg font-light text-brand-text serif mt-2">{entityType} Incorporation Cost*</h4>
                  <p className="text-[9px] text-brand-text-muted/60 font-mono tracking-wider">State: {calcState}</p>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between text-brand-text-muted"><span>ROC Registration Base Fee*:</span><span>₹{fees.govBaseFee.toLocaleString()}*</span></div>
                  <div className="flex justify-between text-brand-text-muted"><span>State Stamp Duty*:</span><span>₹{fees.stampDuty.toLocaleString()}*</span></div>
                  <div className="flex justify-between text-brand-text-muted"><span>PAN/TAN Application Fee*:</span><span>₹{fees.panTanGovFee.toLocaleString()}*</span></div>
                  <div className="border-t border-brand-border/40 pt-2 flex justify-between text-brand-text font-semibold">
                    <span>Total Gov Statutory Fees*:</span>
                    <span className="text-brand-gold">₹{fees.totalGovernmentFees.toLocaleString()}*</span>
                  </div>
                  <div className="border-t border-brand-border/40 pt-3 flex justify-between text-brand-text-muted"><span>Digital Signature (DSC)*:</span><span>₹{fees.dscCost.toLocaleString()}*</span></div>

                  <div className="border-t border-brand-gold/30 border-dashed pt-4 mt-2 flex justify-between text-xs font-bold text-brand-text">
                    <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-brand-gold" /> Estimated Total*:</span>
                    <span className="text-brand-gold text-sm font-bold">₹{fees.totalFinal.toLocaleString()}*</span>
                  </div>
                </div>

                <div className="bg-brand-bg border border-brand-border rounded-xl p-3.5 text-[9px] text-brand-text-muted/80 leading-relaxed font-sans mt-3">
                  <span className="font-bold text-brand-gold">Statutory Disclaimer:</span> Fees above are automated estimates* based on current state stamp laws and MCA guidelines. Government portals may vary slightly.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ GENERATOR TAB ═══ */}
        {activeTab === "generator" && (
          <motion.div key="gen" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Form Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Document Class Toggle */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 space-y-5">
                  <div className="flex items-center gap-2 text-[9px] font-mono tracking-wider text-brand-gold uppercase font-bold">
                    <FileText className="w-3.5 h-3.5" /> Document Class
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setSelectedDoc("noc")} className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${selectedDoc === "noc" ? "bg-brand-gold text-black border-brand-gold" : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40"}`}>
                      Office NOC
                    </button>
                    <button onClick={() => setSelectedDoc("founders")} className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${selectedDoc === "founders" ? "bg-brand-gold text-black border-brand-gold" : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40"}`}>
                      Founders' Deed
                    </button>
                  </div>

                  {/* Dynamic Form Fields */}
                  <div className="space-y-3 pt-3 border-t border-brand-border">
                    {selectedDoc === "noc" ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Proposed Corporate Name</label>
                          <input type="text" value={nocFields.proposedName} onChange={(e) => setNocFields(f => ({ ...f, proposedName: e.target.value }))} placeholder="e.g. Acme Tech" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Primary Declarant (Applicant)</label>
                          <input type="text" value={nocFields.applicantName} onChange={(e) => setNocFields(f => ({ ...f, applicantName: e.target.value }))} placeholder="Founder / Director name" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Property Owner</label>
                          <input type="text" value={nocFields.ownerName} onChange={(e) => setNocFields(f => ({ ...f, ownerName: e.target.value }))} placeholder="Landlord / Owner name" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Registered Address</label>
                          <textarea value={nocFields.premisesAddress} onChange={(e) => setNocFields(f => ({ ...f, premisesAddress: e.target.value }))} placeholder="Full office address..." rows={2} className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 resize-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Lease Relationship</label>
                          <select value={nocFields.relationship} onChange={(e) => setNocFields(f => ({ ...f, relationship: e.target.value }))} className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold cursor-pointer">
                            <option value="">Select relationship...</option>
                            <option value="Tenant">Tenant</option>
                            <option value="Licensee">Licensee</option>
                            <option value="Promoter">Promoter</option>
                            <option value="Other">Other (specify)</option>
                          </select>
                          {nocFields.relationship === "Other" && (
                            <input type="text" value={nocFields.otherRelationship} onChange={(e) => setNocFields(f => ({ ...f, otherRelationship: e.target.value }))} placeholder="Specify relationship..." className="w-full mt-2 bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Proposed Corporate Name</label>
                          <input type="text" value={foundersFields.proposedName} onChange={(e) => setFoundersFields(f => ({ ...f, proposedName: e.target.value }))} placeholder="e.g. Acme Tech" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Founder A Name</label>
                          <input type="text" value={foundersFields.founderA} onChange={(e) => setFoundersFields(f => ({ ...f, founderA: e.target.value }))} placeholder="CEO / Primary founder" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Founder B Name</label>
                          <input type="text" value={foundersFields.founderB} onChange={(e) => setFoundersFields(f => ({ ...f, founderB: e.target.value }))} placeholder="COO / Co-founder" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Equity Split</label>
                          <select value={foundersFields.equitySplit} onChange={(e) => setFoundersFields(f => ({ ...f, equitySplit: e.target.value }))} className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold cursor-pointer">
                            <option value="50/50">50/50</option>
                            <option value="60/40">60/40</option>
                            <option value="70/30">70/30</option>
                            <option value="Custom">Custom</option>
                          </select>
                          {foundersFields.equitySplit === "Custom" && (
                            <input type="text" value={foundersFields.customSplit} onChange={(e) => setFoundersFields(f => ({ ...f, customSplit: e.target.value }))} placeholder="e.g. 65/35" className="w-full mt-2 bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
                          )}
                        </div>
                        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                          <input type="checkbox" checked={foundersFields.vestingEnabled} onChange={(e) => setFoundersFields(f => ({ ...f, vestingEnabled: e.target.checked }))} className="w-4 h-4 rounded border-brand-border accent-brand-gold cursor-pointer" />
                          <span className="text-[10px] text-brand-text-muted">Standard 4-year vesting with 1-year cliff</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Preview + Tier Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Live Preview */}
                <div className="bg-[#0b0f19] border border-brand-gold/20 rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="bg-[#131b2e] border-b border-brand-border px-4 py-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-brand-gold font-bold">
                      <ClipboardCheck className="w-3.5 h-3.5" /> Live Draft Preview
                    </span>
                    <span className="text-[9px] font-mono text-emerald-500">● SYNCED</span>
                  </div>
                  <div className="p-6 font-mono text-[9px] text-[#A6ADBA] leading-relaxed max-h-[320px] overflow-y-auto whitespace-pre-wrap select-all">
                    {currentPreview}
                  </div>
                  <div className="absolute right-6 bottom-12 opacity-[0.03] pointer-events-none">
                    <Scale className="w-40 h-40 text-brand-gold" />
                  </div>
                </div>

                {/* Tier Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free Tier */}
                  <div className="p-5 rounded-2xl border border-brand-border bg-brand-bg-lighter space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Free</span>
                      <span className="text-[9px] text-brand-text-muted font-mono">₹0</span>
                    </div>
                    <h4 className="text-sm font-semibold text-brand-text">Common Draft</h4>
                    <p className="text-[10px] text-brand-text-muted leading-relaxed">Standard template with your details. Generic clauses for most registrations.</p>
                    <ul className="space-y-1.5 text-[10px] text-brand-text-muted">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Pre-filled with your details</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Standard legal clauses</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Instant PDF download</li>
                    </ul>
                    <button type="button" onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 bg-[#2B5B84] hover:bg-[#1E405E] text-white font-mono uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-lg transition-all cursor-pointer font-bold">
                      <Download className="w-3.5 h-3.5" /> Download Free Draft (PDF)
                    </button>
                  </div>

                  {/* Premium Tier */}
                  <div className="p-5 rounded-2xl border-2 border-brand-gold/50 bg-brand-bg-lighter space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 blur-2xl rounded-full" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded">Premium</span>
                      <span className="text-[8px] font-mono uppercase bg-brand-gold text-black px-2 py-0.5 rounded font-bold">Recommended</span>
                    </div>
                    <h4 className="text-sm font-semibold text-brand-text relative z-10">Personalized Draft</h4>
                    <p className="text-[10px] text-brand-text-muted leading-relaxed relative z-10">Custom-drafted by our legal expert with clauses tailored to your business.</p>
                    <ul className="space-y-1.5 text-[10px] text-brand-text-muted relative z-10">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-brand-gold" /> Expert-reviewed & customized</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-brand-gold" /> Industry-specific clauses</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-brand-gold" /> Delivered within 24 hours</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-brand-gold" /> Unlimited revisions</li>
                    </ul>
                    <button type="button" onClick={() => setShowPremiumModal(true)} disabled={premiumCooldown} className="w-full flex items-center justify-center gap-2 bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-lg transition-all cursor-pointer font-bold shadow-lg shadow-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed relative z-10">
                      <Sparkles className="w-3.5 h-3.5" /> {premiumCooldown ? "Request Sent ✓" : "Request Premium Draft"}
                    </button>
                    {/* Info tooltip */}
                    <div className="relative z-10 pt-1">
                      <button type="button" onClick={() => setShowPremiumInfo(!showPremiumInfo)} className="flex items-center gap-1 text-[9px] text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer">
                        <Info className="w-3 h-3" /> Sample premium clauses
                      </button>
                      {showPremiumInfo && (
                        <div className="mt-2 p-3 bg-brand-bg border border-brand-border rounded-lg text-[9px] text-brand-text-muted leading-relaxed space-y-1">
                          <p>• Drag-along & tag-along rights</p>
                          <p>• Anti-dilution protection clauses</p>
                          <p>• Non-compete & IP assignment</p>
                          <p>• Custom vesting schedules</p>
                          <p>• Liquidation preference terms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Request Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-brand-bg-lighter border-2 border-brand-gold/30 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" /> Premium Draft Request
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Our expert will contact you within <strong className="text-brand-gold">15 minutes</strong> during working hours (Mon-Fri, 10 AM – 7 PM IST) to understand your custom requirements and share pricing.
              </p>
            </div>

            <form onSubmit={handlePremiumSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Email Address *</label>
                <input type="email" required value={premiumForm.email} onChange={(e) => setPremiumForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Phone Number *</label>
                <input type="tel" required value={premiumForm.phone} onChange={(e) => setPremiumForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-brand-text-muted font-bold">Special Requests (Optional)</label>
                <textarea value={premiumForm.specialRequests} onChange={(e) => setPremiumForm(p => ({ ...p, specialRequests: e.target.value }))} placeholder="e.g. I need a drag-along clause, we are a fintech startup..." rows={3} className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 resize-none" />
              </div>

              {premiumError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {premiumError}
                </div>
              )}

              <button type="submit" disabled={premiumSubmitting} className="w-full bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-[10px] py-3 rounded-lg transition-all cursor-pointer font-bold shadow-lg shadow-brand-gold/10 disabled:opacity-50 flex items-center justify-center gap-2">
                {premiumSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-3.5 h-3.5" /> Submit Request</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {premiumSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="fixed bottom-6 right-6 z-[200] max-w-sm bg-emerald-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">✅ Request Received!</p>
              <p className="text-[10px] leading-relaxed opacity-90">Our expert will respond within 15 minutes during official working hours (Mon-Fri, 10 AM – 7 PM IST). Check your email and phone.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
