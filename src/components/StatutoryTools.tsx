import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  FileText, 
  HelpCircle, 
  Download, 
  TrendingUp, 
  Building2, 
  Users, 
  Sparkles,
  ClipboardCheck,
  Briefcase,
  Layers,
  Scale
} from "lucide-react";

// India Stamp Duty Rates model (State-wise) - Covering all 28 States & 8 UTs
const STATE_STAMP_RATES: Record<string, { pvtLtdBase: number, pvtLtdPercent: number, llpBase: number }> = {
  "Andaman & Nicobar Islands": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Andhra Pradesh": { pvtLtdBase: 1000, pvtLtdPercent: 0.005, llpBase: 500 },
  "Arunachal Pradesh": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Assam": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Bihar": { pvtLtdBase: 1500, pvtLtdPercent: 0.003, llpBase: 750 },
  "Chandigarh": { pvtLtdBase: 1000, pvtLtdPercent: 0.0025, llpBase: 500 },
  "Chhattisgarh": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Dadra & Nagar Haveli and Daman & Diu": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Delhi": { pvtLtdBase: 500, pvtLtdPercent: 0.0015, llpBase: 200 },
  "Goa": { pvtLtdBase: 2000, pvtLtdPercent: 0.004, llpBase: 1000 },
  "Gujarat": { pvtLtdBase: 2000, pvtLtdPercent: 0.005, llpBase: 1000 },
  "Haryana": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Himachal Pradesh": { pvtLtdBase: 800, pvtLtdPercent: 0.002, llpBase: 400 },
  "Jammu & Kashmir": { pvtLtdBase: 800, pvtLtdPercent: 0.002, llpBase: 400 },
  "Jharkhand": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Karnataka": { pvtLtdBase: 2000, pvtLtdPercent: 0.005, llpBase: 1000 },
  "Kerala": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Ladakh": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Lakshadweep": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Madhya Pradesh": { pvtLtdBase: 2000, pvtLtdPercent: 0.005, llpBase: 1000 },
  "Maharashtra": { pvtLtdBase: 1000, pvtLtdPercent: 0.005, llpBase: 500 },
  "Manipur": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Meghalaya": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Mizoram": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Nagaland": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Odisha": { pvtLtdBase: 1000, pvtLtdPercent: 0.003, llpBase: 500 },
  "Puducherry": { pvtLtdBase: 800, pvtLtdPercent: 0.002, llpBase: 400 },
  "Punjab": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Rajasthan": { pvtLtdBase: 1500, pvtLtdPercent: 0.0035, llpBase: 700 },
  "Sikkim": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Tamil Nadu": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "Telangana": { pvtLtdBase: 1500, pvtLtdPercent: 0.004, llpBase: 750 },
  "Tripura": { pvtLtdBase: 500, pvtLtdPercent: 0.001, llpBase: 250 },
  "Uttar Pradesh": { pvtLtdBase: 1500, pvtLtdPercent: 0.003, llpBase: 750 },
  "Uttarakhand": { pvtLtdBase: 1000, pvtLtdPercent: 0.002, llpBase: 500 },
  "West Bengal": { pvtLtdBase: 1500, pvtLtdPercent: 0.0045, llpBase: 750 }
};

export default function StatutoryTools() {
  const [activeTab, setActiveTab] = useState<"calculator" | "generator">("calculator");

  // Calculator State
  const [calcState, setCalcState] = useState("Maharashtra");
  const [entityType, setEntityType] = useState("Pvt Ltd");
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);

  // Document Generator State
  const [selectedDoc, setSelectedDoc] = useState("noc");
  const [docFields, setDocFields] = useState({
    proposedName: "",
    ownerName: "",
    premisesAddress: "",
    applicantName: "",
    relationship: ""
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Trigger compilation loader when draft details are filled or modified
  React.useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [docFields, selectedDoc, calcState]);

  // Calculate fees
  const getCalculatedFees = () => {
    const govBaseFee = entityType === "Pvt Ltd" ? 1000 : entityType === "LLP" ? 500 : 800;
    const stateRules = STATE_STAMP_RATES[calcState] || STATE_STAMP_RATES["Maharashtra"];
    
    let stampDuty = 0;
    if (entityType === "Pvt Ltd" || entityType === "OPC") {
      stampDuty = stateRules.pvtLtdBase + (authorizedCapital * stateRules.pvtLtdPercent);
    } else {
      stampDuty = stateRules.llpBase + (authorizedCapital * 0.001);
    }

    const dscCost = entityType === "LLP" ? 1500 : 3000; // LLP usually requires 2 DSC, Pvt Ltd requires 2 DSC + Witness
    const panTanGovFee = 150;
    const professionalFee = entityType === "Pvt Ltd" ? 999 : entityType === "LLP" ? 1499 : 1299;
    
    const totalGovernmentFees = govBaseFee + stampDuty + panTanGovFee;
    const totalFinal = totalGovernmentFees + dscCost + professionalFee;

    return {
      govBaseFee,
      stampDuty: Math.round(stampDuty),
      dscCost,
      panTanGovFee,
      professionalFee,
      totalGovernmentFees: Math.round(totalGovernmentFees),
      totalFinal: Math.round(totalFinal)
    };
  };

  const fees = getCalculatedFees();

  // Helper to construct space placeholders where proper details can be filled
  const getFieldVal = (val: string, label: string) => {
    return val.trim() ? `${val.toUpperCase()}` : `____________________ [FILL ${label}]`;
  };

  const getPremisesVal = (val: string) => {
    return val.trim() ? val : "__________________________________________________ [FILL FULL OFFICE ADDRESS HERE]";
  };

  // Document Draft Templates
  const getNocTemplate = () => {
    const owner = getFieldVal(docFields.ownerName, "PROPERTY OWNER NAME");
    const address = getPremisesVal(docFields.premisesAddress);
    const applicant = getFieldVal(docFields.applicantName, "APPLICANT / FOUNDER A NAME");
    const relation = getFieldVal(docFields.relationship, "LEASE RELATIONSHIP (e.g. TENANT / PROMOTER)");
    const proposedName = getFieldVal(docFields.proposedName, "PROPOSED BRAND PREFIX");

    return `========================================================
                      NO OBJECTION CERTIFICATE
========================================================

TO WHOMSOEVER IT MAY CONCERN

I, ${owner}, sole owner and legal possessor of the commercial premises situated at:
${address}

Do hereby declare and state under no duress that:

1*. I am the absolute legal owner of the aforementioned property and have full authority to execute this No Objection Certificate.

2*. I have granted full authorization and license to ${applicant} in the capacity of ${relation} to utilize the registered commercial address of the property as the "Registered Office Address" of their proposed corporate entity under the name of:
   M/S ${proposedName} PRIVATE LIMITED / LLP

3*. I solemnly affirm that I have no objection to the Registrar of Companies (ROC), Ministry of Corporate Affairs, or statutory tax authorities registering the proposed company at this property location.

4*. I further declare that I have no financial interest, debt liability, or regulatory conflict with the operations of the proposed company.

Signed, Sealed, and Executed on this ______ Day of ____________, 2026*.

____________________________
(${owner})
Property Owner & Declarant
Landlord Signature`;
  };

  const getAgreementTemplate = () => {
    const applicant = getFieldVal(docFields.applicantName, "FOUNDER A NAME");
    const owner = getFieldVal(docFields.ownerName, "FOUNDER B NAME");
    const proposedName = getFieldVal(docFields.proposedName, "PROPOSED BRAND PREFIX");
    const state = calcState || "____________________ [FILL STATE]";

    return `========================================================
                    FOUNDERS' DRAFT CO-FOUNDER AGREEMENT
========================================================

THIS AGREEMENT is entered into this ______ Day of ____________, 2026* by and between:
1*. ${applicant} ("Founder A")
2*. ${owner} ("Founder B")

WHEREAS the Founders intend to incorporate and launch a business under the proposed brand prefix:
M/S ${proposedName} PRIVATE LIMITED ("The Company")

IT IS AGREED BY THE FOUNDERS AS FOLLOWS:

1*. EQUITY & SHAREHOLDING ALLOCATION (ESTIMATED):
   Upon incorporation, the authorized and paid-up share capital shall be distributed as follows:
   * Founder A (${applicant}): 60.00%* Shareholding (Estimated Cost/Allocation)
   * Founder B (${owner}): 40.00%* Shareholding (Estimated Cost/Allocation)

2*. RESPONSIBILITIES & DESIGNATION:
   * Founder A shall assume the role of Chief Executive Officer (CEO) managing core product development and day-to-day treasury operations.
   * Founder B shall assume the role of Chief Operating Officer (COO) overseeing commercial partnerships and legal statutory compliances.

3*. VESTING SCHEDULE (PROTECTION SHIELD):
   All founder shares shall vest over a 4*-year* period (48* months*), subject to a 1*-year* (12* months*) cliff. If a Founder departs before the cliff, their equity reverts automatically to the treasury pool.

4*. JURISDICTION & DISPUTE RESOLUTION:
   This agreement shall be governed and interpreted under the laws of India. Any statutory disputes shall be resolved through arbitration in ${state}.

IN WITNESS WHEREOF, the Founders have executed this draft:

____________________________            ____________________________
Founder A Signature                     Founder B Signature`;
  };

  const handleDownload = () => {
    const text = selectedDoc === "noc" ? getNocTemplate() : getAgreementTemplate();
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDoc === "noc" ? "registered_office_noc" : "founders_agreement_draft"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Premium Client Utilities
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Statutory Tools & <span className="text-brand-gold italic font-normal">Legal Utilities.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Interactive calculator for government stamp duties and an intelligent generator to build, preview, and download custom corporate document drafts.
        </p>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="flex justify-center">
        <div className="flex gap-1 bg-brand-bg border border-brand-border rounded-full p-1.5 shadow-lg">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "calculator"
                ? "bg-brand-gold text-black shadow-md shadow-brand-gold/15"
                : "text-brand-text-muted hover:text-brand-text"
            }`}
          >
            <Calculator className="w-4 h-4" /> Stamp Duty Calculator
          </button>
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "generator"
                ? "bg-brand-gold text-black shadow-md shadow-brand-gold/15"
                : "text-brand-text-muted hover:text-brand-text"
            }`}
          >
            <FileText className="w-4 h-4" /> Legal Draft Generator
          </button>
        </div>
      </div>

      {/* Interactive Utility Advisory Box */}
      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 text-xs text-brand-text flex items-start gap-3 shadow-md max-w-5xl mx-auto font-sans">
        <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-brand-gold uppercase tracking-wider block mb-1">Interactive Utility Advisory</span>
          <p className="text-brand-text-muted leading-relaxed">
            All prices and statutory fees displayed are strictly **Estimated Costs** marked with an asterisk (*). This tool serves as a reference **knowledge base** only. 
            The **final number can be declared on your mail or on call through an expert** to ensure 100% precision with your custom requirements.
          </p>
        </div>
      </div>

      {/* Content Panes */}
      <AnimatePresence mode="wait">
        {activeTab === "calculator" ? (
          <motion.div
            key="calc"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto"
          >
            {/* Left Inputs (7 cols) */}
            <div className="lg:col-span-7 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-brand-border pb-3">
                <h3 className="text-xl font-light text-brand-text serif flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-brand-gold" /> Fee Configuration
                </h3>
                <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest mt-1">Configure Company Share & Capital parameters</p>
              </div>

              <div className="space-y-4">
                {/* State selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">State / Union Territory</label>
                  <select
                    value={calcState}
                    onChange={(e) => setCalcState(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-3 text-xs text-brand-text outline-none focus:border-brand-gold"
                  >
                    {Object.keys(STATE_STAMP_RATES).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Entity type selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">Entity Framework</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pvt Ltd", "LLP", "OPC"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEntityType(type)}
                        className={`py-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          entityType === type
                            ? "bg-brand-gold/15 text-brand-gold border-brand-gold/45 shadow"
                            : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text"
                        }`}
                      >
                        {type === "Pvt Ltd" ? <Building2 className="w-4 h-4 inline-block mr-1.5" /> : type === "LLP" ? <Users className="w-4 h-4 inline-block mr-1.5" /> : <Scale className="w-4 h-4 inline-block mr-1.5" />}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Authorized Capital input slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-brand-gold font-bold">Proposed Authorized Capital* (Estimated Cost)</span>
                    <span className="text-brand-text font-bold">₹{authorizedCapital.toLocaleString()}*</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={authorizedCapital}
                    onChange={(e) => setAuthorizedCapital(Number(e.target.value))}
                    className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-gold"
                  />
                  <div className="flex justify-between text-[9px] text-brand-text-muted/60 font-mono">
                    <span>₹1,00,000* (Estimated Cost Min)</span>
                    <span>₹50,00,000* (Estimated Cost Mid)</span>
                    <span>₹1,00,00,000* (Estimated Cost Max)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Invoice Receipt Panel (5 cols) */}
            <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl rounded-full" />
              
              <div className="space-y-4 relative z-10">
                <div className="border-b border-brand-border pb-3 text-center">
                  <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded border border-brand-gold/20 uppercase tracking-widest font-bold">Statutory Receipt Draft</span>
                  <h4 className="text-lg font-light text-brand-text serif mt-2">{entityType} Incorporation cost*</h4>
                  <p className="text-[9px] text-brand-text-muted/60 font-mono tracking-wider">State Jurisdiction: {calcState}</p>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between text-brand-text-muted">
                    <span>ROC Registration Base fee* (Estimated Cost):</span>
                    <span>₹{fees.govBaseFee.toLocaleString()}*</span>
                  </div>
                  <div className="flex justify-between text-brand-text-muted">
                    <span>State Stamp Duty* (Estimated Cost):</span>
                    <span>₹{fees.stampDuty.toLocaleString()}*</span>
                  </div>
                  <div className="flex justify-between text-brand-text-muted">
                    <span>PAN/TAN application fee* (Estimated Cost):</span>
                    <span>₹{fees.panTanGovFee.toLocaleString()}*</span>
                  </div>
                  <div className="border-t border-brand-border/40 pt-2 flex justify-between text-brand-text font-semibold">
                    <span>Total Gov Statutory Fees* (Estimated Cost):</span>
                    <span className="text-brand-gold">₹{fees.totalGovernmentFees.toLocaleString()}*</span>
                  </div>

                  <div className="border-t border-brand-border/40 pt-3 flex justify-between text-brand-text-muted">
                    <span>Digital Signature Cost (DSC)* (Estimated Cost):</span>
                    <span>₹{fees.dscCost.toLocaleString()}*</span>
                  </div>
                  <div className="flex justify-between text-brand-text-muted">
                    <span>Incroute Professional Fee* (Estimated Cost):</span>
                    <span>₹{fees.professionalFee.toLocaleString()}*</span>
                  </div>

                  <div className="border-t border-brand-gold/30 border-dashed pt-4 mt-2 flex justify-between text-xs font-bold text-brand-text">
                    <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-brand-gold" /> Estimated Total Cost*:</span>
                    <span className="text-brand-gold text-sm font-bold">₹{fees.totalFinal.toLocaleString()}*</span>
                  </div>
                </div>

                <div className="bg-brand-bg border border-brand-border rounded-xl p-3.5 text-[9px] text-brand-text-muted/80 leading-relaxed font-sans mt-3">
                  <span className="font-bold text-brand-gold">Statutory Disclaimer:</span> Fees calculated above are automated estimates* based on current state stamp laws and MCA guidelines. Government portals may vary state-wise processing fees slightly.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto"
          >
            {/* Left Fields Form (5 cols) */}
            <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-6">
              <div className="border-b border-brand-border pb-3">
                <h3 className="text-xl font-light text-brand-text serif flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" /> Draft Credentials
                </h3>
                <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest mt-1">Configure draft variables</p>
              </div>

              <div className="space-y-4">
                {/* Template selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-brand-gold tracking-widest font-bold">Document Class</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc("noc")}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        selectedDoc === "noc"
                          ? "bg-brand-gold/15 text-brand-gold border-brand-gold/45 shadow"
                          : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text"
                      }`}
                    >
                      Office NOC
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc("founders")}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        selectedDoc === "founders"
                          ? "bg-brand-gold/15 text-brand-gold border-brand-gold/45 shadow"
                          : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text"
                      }`}
                    >
                      Founders' Deed
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-brand-text-muted tracking-wider">Proposed Corporate Name</label>
                    <input
                      type="text"
                      value={docFields.proposedName}
                      onChange={(e) => setDocFields({ ...docFields, proposedName: e.target.value })}
                      placeholder="e.g. INCROUTE TECHNOLOGIES"
                      className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-brand-text-muted tracking-wider">Primary Declarant / Founder A</label>
                    <input
                      type="text"
                      value={docFields.applicantName}
                      onChange={(e) => setDocFields({ ...docFields, applicantName: e.target.value })}
                      placeholder="e.g. RAJESH KUMAR"
                      className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-brand-text-muted tracking-wider">Property Owner / Founder B</label>
                    <input
                      type="text"
                      value={docFields.ownerName}
                      onChange={(e) => setDocFields({ ...docFields, ownerName: e.target.value })}
                      placeholder="e.g. ARYA SHARMA"
                      className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold"
                    />
                  </div>

                  {selectedDoc === "noc" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase text-brand-text-muted tracking-wider">Registered Address details</label>
                        <textarea
                          rows={3}
                          value={docFields.premisesAddress}
                          onChange={(e) => setDocFields({ ...docFields, premisesAddress: e.target.value })}
                          placeholder="e.g. Flat 402, Golden Heights Commercial Hub, Bandra East, Mumbai"
                          className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold font-sans resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase text-brand-text-muted tracking-wider">Applicant's Lease Relationship</label>
                        <select
                          value={docFields.relationship}
                          onChange={(e) => setDocFields({ ...docFields, relationship: e.target.value })}
                          className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Select / Leave Empty for Underline --</option>
                          <option value="Tenant">Tenant / Lessee</option>
                          <option value="Director">Director / Promoter</option>
                          <option value="Son/Daughter">Son / Daughter of owner</option>
                          <option value="Authorized User">Authorized Business User</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right live preview panel (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#0b0f19] border border-brand-gold/20 rounded-2xl overflow-hidden shadow-2xl relative min-h-[380px] flex flex-col">
                {/* Stamp Paper header block */}
                <div className="bg-[#131b2e] border-b border-brand-border px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-brand-gold font-bold">
                    <ClipboardCheck className="w-3.5 h-3.5 text-brand-gold" /> LIVE DRAFT CLEARANCE PREVIEW
                  </span>
                  <div className="flex gap-1.5 font-mono text-[9px] text-brand-text-muted">
                    {isGenerating ? (
                      <span className="text-brand-gold animate-pulse">● COMPILING DRAFT...</span>
                    ) : (
                      <span className="text-emerald-500">● SYNCED</span>
                    )}
                  </div>
                </div>

                {/* Preformatted Text block or compilation loader */}
                <div className="flex-1 relative min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0b0f19]/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20"
                      >
                        {/* Outer rotating ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-brand-gold/10 border-t-brand-gold animate-spin" />
                          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center animate-ping" />
                          <FileText className="w-6 h-6 text-brand-gold absolute" />
                        </div>

                        <div className="space-y-1 font-mono">
                          <p className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">Generating Live Preview...</p>
                          <p className="text-[9px] text-brand-text-muted">Inserting custom details and applying statutory structure</p>
                        </div>
                        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-brand-gold to-transparent animate-pulse" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 md:p-8 font-mono text-[9px] text-[#A6ADBA] leading-relaxed overflow-x-auto select-all max-h-[350px] overflow-y-auto whitespace-pre-wrap scrollbar-thin"
                      >
                        {selectedDoc === "noc" ? getNocTemplate() : getAgreementTemplate()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stamp Seal Watermark effect */}
                <div className="absolute right-8 bottom-16 opacity-[0.03] select-none pointer-events-none">
                  <Scale className="w-48 h-48 text-brand-gold" />
                </div>
              </div>

              {/* Download Draft CTA */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-[10px] px-5 py-3 rounded-lg transition-all cursor-pointer font-bold shadow-lg shadow-brand-gold/10"
                >
                  <Download className="w-4 h-4" /> Download Plain-Text Draft (.txt)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
