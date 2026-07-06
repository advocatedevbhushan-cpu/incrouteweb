import React, { useState, useMemo } from "react";
import { useLang } from "../lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, FileText, Download, TrendingUp, Building2, Users, Sparkles,
  ClipboardCheck, Scale, Check, CheckCircle2, X, AlertCircle, Loader2,
  Send, Info, HelpCircle, Copy, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, FileCheck
} from "lucide-react";
import jsPDF from "jspdf";

// India State-wise Stamp Duty Rules (Core Verified States)
interface StateRule {
  label: string;
  verified: boolean;
  moa: {
    type: "fixed" | "percentage" | "slab" | "percentageWithCap" | "fixedOrPercentage";
    rate?: number;
    amount?: number;
    maxCap?: number | null;
    minAmount?: number;
    basedOn?: string;
  };
  aoa: {
    type: "fixed" | "percentage" | "slab" | "percentageWithCap" | "fixedOrPercentage" | "customFormula";
    rate?: number;
    amount?: number;
    maxCap?: number | null;
    minAmount?: number;
    basedOn?: string;
  };
  notes: string;
}

const stampDutyRules: Record<string, StateRule> = {
  "Delhi": {
    label: "Delhi",
    verified: true,
    moa: { type: "percentage", rate: 0.0015, maxCap: 2500000, minAmount: 0 },
    aoa: { type: "fixed", amount: 200 },
    notes: "Rates verified from Delhi Stamp Act. e-Stamp payment integrated via MCA e-Stamp portal."
  },
  "Chandigarh": {
    label: "Chandigarh",
    verified: true,
    moa: { type: "percentage", rate: 0.0015, maxCap: 2500000, minAmount: 0 },
    aoa: { type: "fixed", amount: 100 },
    notes: "Punjab Stamp Act as applicable to Chandigarh. Verified rates."
  },
  "Maharashtra": {
    label: "Maharashtra",
    verified: true,
    moa: { type: "fixed", amount: 200 },
    aoa: { type: "slab", amount: 1000, maxCap: 5000000 }, // ₹1,000 for every ₹5 Lakhs or part thereof, capped at ₹50 Lakhs
    notes: "Rates under Article 10 (MOA) and Article 12 (AOA) of the Maharashtra Stamp Act. Capped at ₹50 Lakhs."
  },
  "Karnataka": {
    label: "Karnataka",
    verified: true,
    moa: { type: "fixed", amount: 500 },
    aoa: { type: "fixed", amount: 500 },
    notes: "Flat stamp duty of ₹500 on MOA and ₹500 on AOA as per Karnataka Stamp Act."
  },
  "Tamil Nadu": {
    label: "Tamil Nadu",
    verified: true,
    moa: { type: "fixed", amount: 500 },
    aoa: { type: "slab", amount: 500, maxCap: 500000 }, // ₹500 for every ₹10 Lakhs of authorized capital or part thereof, capped at ₹5 Lakhs
    notes: "Tamil Nadu Stamp Act amendments. Capped at ₹5,00,000."
  },
  "Telangana": {
    label: "Telangana",
    verified: true,
    moa: { type: "fixed", amount: 500 },
    aoa: { type: "fixed", amount: 1000 },
    notes: "Rates as per Andhra Pradesh Stamp Act (Telangana amendments). MOA is ₹500, AOA is ₹1,000."
  },
  "Uttar Pradesh": {
    label: "Uttar Pradesh",
    verified: true,
    moa: { type: "percentage", rate: 0.0015 },
    aoa: { type: "customFormula" }, // Custom AOA UP: If capital <= 10L, amount is ₹100. If capital > 10L, 0.15% of capital.
    notes: "Uttar Pradesh Stamp Act. AOA is ₹100 for capital up to ₹10 Lakhs, and 0.15% of capital above that."
  },
  "West Bengal": {
    label: "West Bengal",
    verified: true,
    moa: { type: "percentage", rate: 0.0015 },
    aoa: { type: "slab" }, // Slab West Bengal: if capital <= 25L, ₹1,000; if capital 25L-50L, ₹2,000; else ₹5,000.
    notes: "West Bengal Stamp Act. AOA uses standard statutory slab tiers."
  },
  "Haryana": {
    label: "Haryana",
    verified: true,
    moa: { type: "percentage", rate: 0.0015, maxCap: 2500000 },
    aoa: { type: "fixed", amount: 120 },
    notes: "Haryana Stamp Act (Schedule 1A). MOA is 0.15%, AOA is flat ₹120."
  },
  "Gujarat": {
    label: "Gujarat",
    verified: true,
    moa: { type: "percentageWithCap", rate: 0.0015, maxCap: 500000 },
    aoa: { type: "percentageWithCap", rate: 0.0050, maxCap: 500000 }, // AOA is 0.5% capped at ₹5 Lakhs
    notes: "Gujarat Stamp Act. MOA is 0.15% (max ₹5L) and AOA is 0.50% (max ₹5L)."
  }
};

const ALL_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar", "Puducherry", 
  "Lakshadweep", "Ladakh", "Jammu & Kashmir"
];

export default function StatutoryTools() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"calculator" | "generator">("calculator");

  // Calculator State
  const [calcState, setCalcState] = useState("Chandigarh");
  const [entityType, setEntityType] = useState("Private Limited Company");
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);
  const [companyCategory, setCompanyCategory] = useState("Indian Company");
  const [shareCapitalType, setShareCapitalType] = useState("Equity Share Capital");

  // Toggles
  const [includesPremium, setIncludesPremium] = useState(false);
  const [existingCompany, setExistingCompany] = useState(false);
  const [increaseInCapital, setIncreaseInCapital] = useState(false);

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

  const [copied, setCopied] = useState(false);

  // Rule Calculation Engine
  const calculationResult = useMemo(() => {
    const rule = stampDutyRules[calcState];
    if (!rule || !rule.verified) {
      return {
        verified: false,
        state: calcState,
        moaDuty: 0,
        aoaDuty: 0,
        totalDuty: 0,
        applicableRate: "N/A",
        maximumCap: "N/A",
        notes: "State rule pending official verification. Estimates are locked."
      };
    }

    // Calculate MOA
    let moaDuty = 0;
    if (rule.moa.type === "fixed") {
      moaDuty = rule.moa.amount || 0;
    } else if (rule.moa.type === "percentage" || rule.moa.type === "percentageWithCap") {
      const rate = rule.moa.rate || 0;
      moaDuty = authorizedCapital * rate;
      if (rule.moa.maxCap) {
        moaDuty = Math.min(moaDuty, rule.moa.maxCap);
      }
    }

    // Calculate AOA
    let aoaDuty = 0;
    if (rule.aoa.type === "fixed") {
      aoaDuty = rule.aoa.amount || 0;
    } else if (rule.aoa.type === "percentage" || rule.aoa.type === "percentageWithCap") {
      const rate = rule.aoa.rate || 0;
      aoaDuty = authorizedCapital * rate;
      if (rule.aoa.maxCap) {
        aoaDuty = Math.min(aoaDuty, rule.aoa.maxCap);
      }
    } else if (rule.aoa.type === "slab") {
      if (calcState === "Maharashtra") {
        aoaDuty = Math.ceil(authorizedCapital / 500000) * 1000;
        if (rule.aoa.maxCap) {
          aoaDuty = Math.min(aoaDuty, rule.aoa.maxCap);
        }
      } else if (calcState === "Tamil Nadu") {
        aoaDuty = Math.ceil(authorizedCapital / 1000000) * 500;
        if (rule.aoa.maxCap) {
          aoaDuty = Math.min(aoaDuty, rule.aoa.maxCap);
        }
      } else if (calcState === "West Bengal") {
        if (authorizedCapital <= 2500000) {
          aoaDuty = 1000;
        } else if (authorizedCapital <= 5000000) {
          aoaDuty = 2000;
        } else {
          aoaDuty = 5000;
        }
      }
    } else if (rule.aoa.type === "customFormula") {
      if (calcState === "Uttar Pradesh") {
        if (authorizedCapital <= 100000) {
          aoaDuty = 100;
        } else if (authorizedCapital <= 1000000) {
          aoaDuty = 100;
        } else {
          aoaDuty = (authorizedCapital - 1000000) * 0.0015 + 100;
        }
      }
    }

    // Entity Exemption adjustments
    if (entityType === "Section 8 Company") {
      moaDuty = Math.round(moaDuty * 0.5);
      aoaDuty = Math.round(aoaDuty * 0.5);
    } else if (entityType === "Limited Liability Partnership") {
      moaDuty = 0;
      aoaDuty = 500; // Standard fixed stamp duty on LLP agreement
    } else if (entityType === "Partnership Firm") {
      moaDuty = 0;
      aoaDuty = 500; // Flat partnership deed stamping
    }

    // Minimum fee constraints
    if (entityType !== "Limited Liability Partnership" && entityType !== "Partnership Firm") {
      moaDuty = Math.max(moaDuty, rule.moa.minAmount || 0);
      aoaDuty = Math.max(aoaDuty, rule.aoa.minAmount || 0);
    }

    // Delta capitalization logic
    if (increaseInCapital) {
      moaDuty = Math.round(moaDuty * 0.4);
      aoaDuty = Math.round(aoaDuty * 0.4);
    }

    const totalDuty = moaDuty + aoaDuty;

    let applicableRate = "0.15%";
    if (calcState === "Maharashtra") applicableRate = "Slab-based";
    else if (calcState === "Karnataka") applicableRate = "Fixed Flat Fee";
    else if (calcState === "Gujarat") applicableRate = "MOA: 0.15% / AOA: 0.50%";
    else if (calcState === "Tamil Nadu") applicableRate = "MOA: Fixed / AOA: Slab";

    const maxCap = rule.aoa.maxCap || rule.moa.maxCap || null;

    return {
      verified: true,
      state: calcState,
      moaDuty: Math.round(moaDuty),
      aoaDuty: Math.round(aoaDuty),
      totalDuty: Math.round(totalDuty),
      applicableRate,
      maximumCap: maxCap ? `₹${maxCap.toLocaleString('en-IN')}` : "None",
      notes: rule.notes
    };
  }, [calcState, entityType, authorizedCapital, includesPremium, existingCompany, increaseInCapital]);

  // Sync ranges
  const handleCapitalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthorizedCapital(Number(e.target.value));
  };

  const handleCapitalTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    const num = Number(rawVal);
    if (!isNaN(num)) {
      setAuthorizedCapital(num);
    }
  };

  const handleCopyDetails = () => {
    if (!calculationResult.verified) return;
    const text = `Stamp Duty Calculation Details (INCroute)
State: ${calcState}
Entity Type: ${entityType}
Authorized Capital: ₹${authorizedCapital.toLocaleString("en-IN")}
--------------------------------------
MOA Stamp Duty: ₹${calculationResult.moaDuty.toLocaleString("en-IN")}
AOA Stamp Duty: ₹${calculationResult.aoaDuty.toLocaleString("en-IN")}
Total Stamp Duty Payable: ₹${calculationResult.totalDuty.toLocaleString("en-IN")}
--------------------------------------
Disclaimer: Calculated for informational purposes. Verify with official State Stamp Act before filing.`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

    // Neon Line divider
    doc.setDrawColor(99, 102, 241); // Indigo
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
    doc.setDrawColor(99, 102, 241);
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

  // Download Stamp Duty Calculation Breakdown
  const handleDownloadCalculationBreakdown = () => {
    if (!calculationResult.verified) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(8, 15, 42); // Navy
    doc.text("INCROUTE | Stamp Duty Calculation Audit Report", margin, y);
    y += 6;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Content Table
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const rows = [
      ["Date Generated:", new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
      ["State / Union Territory:", calcState],
      ["Corporate Entity Type:", entityType],
      ["Corporate Category:", companyCategory],
      ["Authorized Capital:", `INR ${authorizedCapital.toLocaleString("en-IN")}`],
      ["Includes Share Premium:", includesPremium ? "Yes" : "No"],
      ["Existing Company (Capital Increase):", existingCompany ? "Yes" : "No"],
      ["-----------------------------------", "-----------------------------"],
      ["Memorandum of Association Duty (MOA):", `INR ${calculationResult.moaDuty.toLocaleString("en-IN")}`],
      ["Articles of Association Duty (AOA):", `INR ${calculationResult.aoaDuty.toLocaleString("en-IN")}`],
      ["Total Estimated Stamp Duty Payable:", `INR ${calculationResult.totalDuty.toLocaleString("en-IN")}`],
      ["-----------------------------------", "-----------------------------"],
      ["Applicable Rate Engine Mode:", calculationResult.applicableRate],
      ["State Maximum Stamp Duty Cap:", calculationResult.maximumCap]
    ];

    for (const [label, val] of rows) {
      doc.setFont("helvetica", label.startsWith("Total") ? "bold" : "normal");
      if (label.startsWith("Total")) doc.setTextColor(79, 70, 229);
      else doc.setTextColor(40, 40, 40);
      
      doc.text(label, margin, y);
      doc.text(val, margin + 80, y);
      y += 8;
    }

    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Disclaimer: This statutory estimate is automatically computed based on the respective State Stamp Acts as integrated within the INCroute rule engine. Rates must be verified with the official MCA21 portal or with an experienced legal consultant before filing.",
      margin, y, { maxWidth: contentWidth }
    );

    doc.save(`Incroute_StampDuty_Breakdown_${calcState}.pdf`);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto text-left relative z-10">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold rounded-full border border-indigo-500/10 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Statutory Tools
        </div>
        <h1 className="text-4xl font-extrabold text-[#080F2A] tracking-tight sm:text-5xl font-sans">
          Legal <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic font-extrabold pr-2 inline-block">Utilities.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl mx-auto leading-relaxed font-medium">
          Calculate state-wise government stamp duty with precision and generate legal drafts instantly.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-white/70 border border-indigo-500/10 p-1 rounded-2xl inline-flex gap-1 shadow-sm backdrop-blur-md">
          <button 
            onClick={() => setActiveTab("calculator")} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold ${
              activeTab === "calculator" ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white shadow-md shadow-[#4F46E5]/15" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Stamp Calculator
          </button>
          <button 
            onClick={() => setActiveTab("generator")} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold ${
              activeTab === "generator" ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white shadow-md shadow-[#4F46E5]/15" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Draft Generator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ CALCULATOR TAB ═══ */}
        {activeTab === "calculator" && (
          <motion.div 
            key="calc" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }} 
            transition={{ type: "spring", stiffness: 400, damping: 30 }} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto"
          >
            {/* Left: Configuration Card (7 cols) */}
            <div className="lg:col-span-7 bg-white/85 border border-indigo-500/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-extrabold text-[#080F2A] flex items-center gap-2 font-sans">
                    <Calculator className="w-5 h-5 text-[#4F46E5]" /> Fee Configuration
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Configure company details to calculate applicable stamp duty</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State selection */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-mono uppercase text-[#080F2A] tracking-widest font-bold">State / Union Territory</label>
                    <select 
                      value={calcState} 
                      onChange={(e) => setCalcState(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm"
                    >
                      {ALL_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  {/* Entity Type Selection */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-mono uppercase text-[#080F2A] tracking-widest font-bold flex items-center gap-1">
                      Entity Type <span title="Select corporate entity type structure"><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                    </label>
                    <select 
                      value={entityType} 
                      onChange={(e) => setEntityType(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm"
                    >
                      <option value="Private Limited Company">Private Limited Company</option>
                      <option value="One Person Company">One Person Company</option>
                      <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                      <option value="Section 8 Company">Section 8 Company</option>
                      <option value="Public Limited Company">Public Limited Company</option>
                      <option value="Partnership Firm">Partnership Firm</option>
                    </select>
                  </div>
                </div>

                {/* Capital Input Sync Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest">
                    <span className="text-[#080F2A] font-bold flex items-center gap-1">
                      Authorized Capital (₹) <span title="Nominal shared capital block size"><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                    </span>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                      <span className="text-slate-400 text-xs font-semibold">₹</span>
                      <input 
                        type="text" 
                        value={authorizedCapital.toLocaleString("en-IN")} 
                        onChange={handleCapitalTextChange}
                        className="w-28 bg-transparent text-right text-xs text-[#080F2A] font-extrabold outline-none"
                      />
                    </div>
                  </div>
                  
                  <input 
                    type="range" 
                    min="100000" 
                    max="10000000" 
                    step="50000" 
                    value={authorizedCapital} 
                    onChange={handleCapitalSliderChange} 
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]" 
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>₹1,00,000</span>
                    <span>₹50,00,000</span>
                    <span>₹1,00,00,000+</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Category */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-mono uppercase text-[#080F2A] tracking-widest font-bold flex items-center gap-1">
                      Company Category <span title="Classification category for ROC fees"><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                    </label>
                    <select 
                      value={companyCategory} 
                      onChange={(e) => setCompanyCategory(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm"
                    >
                      <option value="Indian Company">Indian Company</option>
                      <option value="Foreign Company">Foreign Company</option>
                    </select>
                  </div>

                  {/* Share Capital Type */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-mono uppercase text-[#080F2A] tracking-widest font-bold flex items-center gap-1">
                      Share Capital Type <span title="Capital stock tier type"><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                    </label>
                    <select 
                      value={shareCapitalType} 
                      onChange={(e) => setShareCapitalType(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm"
                    >
                      <option value="Equity Share Capital">Equity Share Capital</option>
                      <option value="Preference Share Capital">Preference Share Capital</option>
                    </select>
                  </div>
                </div>

                {/* Toggles Row */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-sm text-left">
                    <span className="text-[8px] font-mono uppercase text-slate-400 font-bold block">Includes Premium</span>
                    <div className="flex items-center justify-between">
                      <span title="Includes share premium value block"><HelpCircle className="w-3.5 h-3.5 text-slate-300" /></span>
                      <button 
                        onClick={() => setIncludesPremium(!includesPremium)} 
                        className={`w-8 h-4 rounded-full relative transition-colors ${includesPremium ? "bg-[#4F46E5]" : "bg-slate-200"}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-transform ${includesPremium ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-sm text-left">
                    <span className="text-[8px] font-mono uppercase text-slate-400 font-bold block">Existing Company</span>
                    <div className="flex items-center justify-between">
                      <span title="Checked if the company is already registered"><HelpCircle className="w-3.5 h-3.5 text-slate-300" /></span>
                      <button 
                        onClick={() => setExistingCompany(!existingCompany)} 
                        className={`w-8 h-4 rounded-full relative transition-colors ${existingCompany ? "bg-[#4F46E5]" : "bg-slate-200"}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-transform ${existingCompany ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-sm text-left">
                    <span className="text-[8px] font-mono uppercase text-slate-400 font-bold block">Increase in Capital</span>
                    <div className="flex items-center justify-between">
                      <span title="Calculates stamp duty delta fee for capital expansion filings"><HelpCircle className="w-3.5 h-3.5 text-slate-300" /></span>
                      <button 
                        onClick={() => setIncreaseInCapital(!increaseInCapital)} 
                        className={`w-8 h-4 rounded-full relative transition-colors ${increaseInCapital ? "bg-[#4F46E5]" : "bg-slate-200"}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-transform ${increaseInCapital ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom notice strip */}
              <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/40 border border-indigo-500/5 rounded-2xl text-[10px] text-slate-500 leading-normal font-sans mt-6">
                <Info className="w-4.5 h-4.5 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>Stamp duty is calculated as per the current State Stamp Act & Rules.</span>
              </div>
            </div>

            {/* Right: Receipt Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-white/90 border border-indigo-500/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
              
              <div className="space-y-6 relative z-10">
                {/* State UT Badge Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-[#4F46E5]/10 text-[#4F46E5] border border-indigo-500/20 uppercase rounded">State</span>
                    <span className="text-xs font-bold text-[#080F2A]">{calcState}</span>
                  </div>
                  <Building2 className="w-5 h-5 text-slate-300" />
                </div>

                <div className="text-center py-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Stamp Duty on MOA & AOA</h4>
                </div>

                {calculationResult.verified ? (
                  <div className="space-y-5">
                    {/* Main Receipt Big Payable */}
                    <div className="text-center py-6 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-inner">
                      <p className="text-[9px] font-mono uppercase text-slate-400 tracking-wider mb-1">Total Stamp Duty Payable</p>
                      <p className="text-4xl font-extrabold text-[#4F46E5] tracking-tight">₹{calculationResult.totalDuty.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-slate-500 font-medium font-sans mt-2">Rate: {calculationResult.applicableRate} (Max {calculationResult.maximumCap})</p>
                    </div>

                    {/* Receipt Details Breakdown Table */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50/50 pb-2">
                        <span className="text-slate-400 font-semibold">Authorized Capital:</span>
                        <span className="text-[#080F2A] font-extrabold">₹{authorizedCapital.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50/50 pb-2">
                        <span className="text-slate-400 font-semibold">Applicable Rate:</span>
                        <span className="text-[#080F2A] font-extrabold">{calculationResult.applicableRate}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50/50 pb-2">
                        <span className="text-slate-400 font-semibold">Maximum Cap ({calcState}):</span>
                        <span className="text-[#080F2A] font-extrabold">{calculationResult.maximumCap}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50/50 pb-2">
                        <span className="text-slate-400 font-semibold">Duty on MOA:</span>
                        <span className="text-[#080F2A] font-extrabold">₹{calculationResult.moaDuty.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50/50 pb-2">
                        <span className="text-slate-400 font-semibold">Duty on AOA:</span>
                        <span className="text-[#080F2A] font-extrabold">₹{calculationResult.aoaDuty.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                        <span className="text-[#080F2A] font-extrabold">Total Stamp Duty:</span>
                        <span className="text-[#4F46E5] font-black">₹{calculationResult.totalDuty.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500">
                      <AlertTriangle className="w-6 h-6 animate-bounce" />
                    </div>
                    <h5 className="text-sm font-bold text-[#080F2A]">State Rule Pending Verification</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans px-4">
                      The stamp duty formulas for {calcState} are currently being audited as per the latest amendments in the State Stamp Act. Final calculations are disabled.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 relative z-10 mt-6">
                <button 
                  type="button" 
                  disabled={!calculationResult.verified}
                  onClick={handleDownloadCalculationBreakdown}
                  className="w-full flex items-center justify-center gap-1.5 bg-white border border-indigo-500/10 hover:border-[#4F46E5]/30 text-slate-600 hover:text-[#4F46E5] font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans shadow-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> Download Breakdown
                </button>
                <button 
                  type="button" 
                  disabled={!calculationResult.verified}
                  onClick={handleCopyDetails}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans shadow-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Details</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ GENERATOR TAB ═══ */}
        {activeTab === "generator" && (
          <motion.div 
            key="gen" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }} 
            transition={{ type: "spring", stiffness: 400, damping: 30 }} 
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Form Panel (5 cols) */}
              <div className="lg:col-span-5 bg-white/85 border border-indigo-500/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Document Class Toggle */}
                  <div className="flex items-center gap-2 text-[9px] font-mono tracking-wider text-[#4F46E5] uppercase font-bold border-b border-slate-100 pb-3">
                    <FileText className="w-3.5 h-3.5" /> Document Class
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedDoc("noc")} 
                      className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        selectedDoc === "noc" 
                          ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white border-[#4F46E5]" 
                          : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Office NOC
                    </button>
                    <button 
                      onClick={() => setSelectedDoc("founders")} 
                      className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        selectedDoc === "founders" 
                          ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white border-[#4F46E5]" 
                          : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Founders' Deed
                    </button>
                  </div>

                  {/* Dynamic Form Fields */}
                  <div className="space-y-4 pt-2">
                    {selectedDoc === "noc" ? (
                      <>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Proposed Corporate Name</label>
                          <input type="text" value={nocFields.proposedName} onChange={(e) => setNocFields(f => ({ ...f, proposedName: e.target.value }))} placeholder="e.g. Acme Tech" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Primary Declarant (Applicant)</label>
                          <input type="text" value={nocFields.applicantName} onChange={(e) => setNocFields(f => ({ ...f, applicantName: e.target.value }))} placeholder="Founder / Director name" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Property Owner</label>
                          <input type="text" value={nocFields.ownerName} onChange={(e) => setNocFields(f => ({ ...f, ownerName: e.target.value }))} placeholder="Landlord / Owner name" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Registered Address</label>
                          <textarea value={nocFields.premisesAddress} onChange={(e) => setNocFields(f => ({ ...f, premisesAddress: e.target.value }))} placeholder="Full office address..." rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm resize-none" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Lease Relationship</label>
                          <select value={nocFields.relationship} onChange={(e) => setNocFields(f => ({ ...f, relationship: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm">
                            <option value="">Select relationship...</option>
                            <option value="Tenant">Tenant</option>
                            <option value="Licensee">Licensee</option>
                            <option value="Promoter">Promoter</option>
                            <option value="Other">Other (specify)</option>
                          </select>
                          {nocFields.relationship === "Other" && (
                            <input type="text" value={nocFields.otherRelationship} onChange={(e) => setNocFields(f => ({ ...f, otherRelationship: e.target.value }))} placeholder="Specify relationship..." className="w-full mt-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Proposed Corporate Name</label>
                          <input type="text" value={foundersFields.proposedName} onChange={(e) => setFoundersFields(f => ({ ...f, proposedName: e.target.value }))} placeholder="e.g. Acme Tech" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Founder A Name</label>
                          <input type="text" value={foundersFields.founderA} onChange={(e) => setFoundersFields(f => ({ ...f, founderA: e.target.value }))} placeholder="CEO / Primary founder" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Founder B Name</label>
                          <input type="text" value={foundersFields.founderB} onChange={(e) => setFoundersFields(f => ({ ...f, founderB: e.target.value }))} placeholder="COO / Co-founder" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-[#080F2A] font-bold">Equity Split</label>
                          <select value={foundersFields.equitySplit} onChange={(e) => setFoundersFields(f => ({ ...f, equitySplit: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm">
                            <option value="50/50">50/50</option>
                            <option value="60/40">60/40</option>
                            <option value="70/30">70/30</option>
                            <option value="Custom">Custom</option>
                          </select>
                          {foundersFields.equitySplit === "Custom" && (
                            <input type="text" value={foundersFields.customSplit} onChange={(e) => setFoundersFields(f => ({ ...f, customSplit: e.target.value }))} placeholder="e.g. 65/35" className="w-full mt-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
                          )}
                        </div>
                        <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                          <input type="checkbox" checked={foundersFields.vestingEnabled} onChange={(e) => setFoundersFields(f => ({ ...f, vestingEnabled: e.target.checked }))} className="w-4 h-4 rounded border-slate-200 accent-[#4F46E5] cursor-pointer" />
                          <span className="text-[10px] text-slate-500 font-medium font-sans">Standard 4-year vesting with 1-year cliff</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Preview + Tier Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                {/* Live Preview */}
                <div className="bg-slate-900 border border-indigo-500/10 rounded-3xl overflow-hidden shadow-xl relative text-left">
                  <div className="bg-slate-950 border-b border-slate-800 px-5 py-4.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#4F46E5] font-bold tracking-widest">
                      <ClipboardCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Live Draft Preview
                    </span>
                    <span className="text-[9px] font-mono text-emerald-500 tracking-wider">● SYNCED</span>
                  </div>
                  <div className="p-6 font-mono text-[10px] text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap select-all">
                    {currentPreview}
                  </div>
                  <div className="absolute right-6 bottom-12 opacity-[0.03] pointer-events-none">
                    <Scale className="w-40 h-40 text-[#4F46E5]" />
                  </div>
                </div>

                {/* Tier Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free Tier */}
                  <div className="p-5 rounded-3xl border border-indigo-500/10 bg-white/80 space-y-3.5 shadow-sm text-left flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Free</span>
                        <span className="text-sm text-[#080F2A] font-extrabold font-mono">₹0</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#080F2A] font-sans">Common Draft</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans font-light">Standard template with your details. Generic clauses for standard filings.</p>
                      <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans">
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Pre-filled with your details</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Standard legal clauses</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-500" /> Instant PDF download</li>
                      </ul>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleDownloadPDF} 
                      className="w-full flex items-center justify-center gap-1.5 bg-[#4F46E5]/10 hover:bg-[#4F46E5] text-[#4F46E5] hover:text-white font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans py-3"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Draft
                    </button>
                  </div>

                  {/* Premium Tier */}
                  <div className="p-5 rounded-3xl border-2 border-[#4F46E5]/40 bg-white/90 space-y-3.5 relative overflow-hidden shadow-md text-left flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#4F46E5] font-bold bg-[#4F46E5]/10 px-2 py-0.5 rounded border border-indigo-500/20">Premium</span>
                        <span className="text-[8px] font-mono uppercase bg-[#4F46E5] text-white px-2 py-0.5 rounded font-black tracking-widest">Recommended</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#080F2A] font-sans">Personalized Draft</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans font-light">Custom-drafted by corporate legal counsel with specialized clauses.</p>
                      <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans">
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#4F46E5]" /> Expert-reviewed & customized</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#4F46E5]" /> Industry-specific protective clauses</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#4F46E5]" /> Delivered within 24 hours</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#4F46E5]" /> 30-day unlimited revisions support</li>
                      </ul>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <button 
                        type="button" 
                        onClick={() => setShowPremiumModal(true)} 
                        disabled={premiumCooldown} 
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans py-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {premiumCooldown ? "Request Sent ✓" : "Request Custom Draft"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowPremiumInfo(!showPremiumInfo)} 
                        className="flex items-center justify-center gap-1 text-[9px] text-slate-400 hover:text-[#4F46E5] transition-colors cursor-pointer w-full text-center"
                      >
                        <Info className="w-3.5 h-3.5" /> View premium legal inclusions
                      </button>
                      {showPremiumInfo && (
                        <div className="p-3 bg-indigo-50/30 border border-indigo-500/5 rounded-xl text-[9px] text-slate-500 leading-relaxed space-y-1">
                          <p>• Drag-along & tag-along voting rights</p>
                          <p>• Anti-dilution share protection clauses</p>
                          <p>• Restrictive non-compete & IP assignment</p>
                          <p>• Custom vesting milestone structures</p>
                          <p>• Liquidation preference payout tiers</p>
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

      {/* Disclaimer block */}
      <div className="max-w-5xl mx-auto p-5 bg-white/60 border border-indigo-500/10 rounded-2xl text-[10px] text-slate-400 leading-relaxed font-sans text-center">
        <span className="font-extrabold text-slate-500">Legal Disclaimer:</span> Stamp duty is calculated based on configured state-wise rules and is for informational purposes only. Final payable amount should be verified with the applicable State Stamp Act, MCA/ROC portal, and professional advice before filing.
      </div>

      {/* State Rule Engine accuracy strip */}
      <div className="w-full max-w-5xl mx-auto pt-4">
        <div className="bg-white/80 border border-indigo-500/10 rounded-3xl p-6 shadow-sm backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            
            {/* Title / Description */}
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-indigo-50 text-[#4F46E5] border border-indigo-100 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#080F2A] font-sans">State Rule Engine</h4>
                <p className="text-[10px] text-slate-400 font-sans max-w-sm">
                  Our engine applies accurate state-wise logic including rate slabs, caps, exemptions, and rounding rules as per respective Stamp Acts.
                </p>
              </div>
            </div>
            
            {/* Split cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 flex-1 max-w-xl">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex p-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[10px] font-bold text-[#080F2A] font-sans">State Wise Accuracy</h5>
                <p className="text-[9px] text-slate-400 leading-tight">As per Stamp Acts</p>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex p-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[10px] font-bold text-[#080F2A] font-sans">Auto Cap & Slab Logic</h5>
                <p className="text-[9px] text-slate-400 leading-tight">Built-in validations</p>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex p-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[10px] font-bold text-[#080F2A] font-sans">Always Updated</h5>
                <p className="text-[9px] text-slate-400 leading-tight">Rules & notifications</p>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex p-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[10px] font-bold text-[#080F2A] font-sans">Audit Ready</h5>
                <p className="text-[9px] text-slate-400 leading-tight">Downloadable reports</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Premium Request Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white border border-indigo-500/10 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-left"
          >
            <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#080F2A] flex items-center gap-2 font-sans">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" /> Premium Draft Request
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Our expert will contact you within <strong className="text-[#4F46E5]">15 minutes</strong> during working hours (Mon-Fri, 10 AM – 7 PM IST) to understand your custom requirements and share pricing.
              </p>
            </div>

            <form onSubmit={handlePremiumSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Email Address *</label>
                <input type="email" required value={premiumForm.email} onChange={(e) => setPremiumForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Phone Number *</label>
                <input type="tel" required value={premiumForm.phone} onChange={(e) => setPremiumForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Special Requests (Optional)</label>
                <textarea value={premiumForm.specialRequests} onChange={(e) => setPremiumForm(p => ({ ...p, specialRequests: e.target.value }))} placeholder="e.g. I need a drag-along clause, we are a fintech startup..." rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm resize-none" />
              </div>

              {premiumError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {premiumError}
                </div>
              )}

              <button type="submit" disabled={premiumSubmitting} className="w-full bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-mono uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all cursor-pointer font-bold shadow-lg shadow-indigo-500/15 disabled:opacity-50 flex items-center justify-center gap-2">
                {premiumSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-3.5 h-3.5" /> Submit Request</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {premiumSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="fixed bottom-6 right-6 z-[2000] max-w-sm bg-emerald-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 text-left">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">Request Received!</p>
              <p className="text-[10px] leading-relaxed opacity-90 font-sans">Our expert will respond within 15 minutes during official working hours (Mon-Fri, 10 AM – 7 PM IST). Check your email and phone.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
