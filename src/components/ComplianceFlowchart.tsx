import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Building2,
  DollarSign,
  Scale,
  Zap,
  ChevronRight,
  Sparkles,
  Heart,
  Shield
} from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  documents: string[];
  timeline: string;
  status: "pending" | "current" | "completed";
}

interface ComplianceFlowchartProps {
  currentStep?: string;
  onStepSelect?: (stepId: string) => void;
}

export default function ComplianceFlowchart({
  currentStep = "step1",
  onStepSelect,
}: ComplianceFlowchartProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>("step1");
  const [selectedPath, setSelectedPath] = useState<"pvt-ltd" | "llp" | "opc" | "section8">("pvt-ltd");

  const pvtLtdFlow: FlowStep[] = [
    {
      id: "step1",
      title: "Business Name Verification",
      description: "Verify trademark availability and lodge Reserve Unique Name (RUN) on MCA",
      icon: <FileText className="w-5 h-5 text-brand-gold" />,
      documents: ["Proposed Name Prefixes", "Promoter PAN & Aadhaar", "Sector Objectives"],
      timeline: "1-2 Working Days",
      status: "completed",
    },
    {
      id: "step2",
      title: "Prepare & Lodge SPICe+ (INC-32)",
      description: "Draft structural Memorandum (MOA) and Articles of Association (AOA) with director DIN allocations",
      icon: <Users className="w-5 h-5 text-brand-gold" />,
      documents: ["Form INC-32", "DIR-2 Promoter Consents", "Utility Bill Address Proof", "Owner Landlord NOC"],
      timeline: "2-3 Working Days",
      status: "current",
    },
    {
      id: "step3",
      title: "ROC Incorporation Approval",
      description: "Central Registration Centre (CRC) verifies documents and issues official Certificate of Incorporation (COI)",
      icon: <CheckCircle2 className="w-5 h-5 text-brand-gold" />,
      documents: ["Certificate of Incorporation (COI)", "Statutory PAN & TAN allotment"],
      timeline: "3-4 Working Days",
      status: "pending",
    },
    {
      id: "step4",
      title: "Activate Corporate Bank Account",
      description: "Set up a zero-balance corporate bank account using active COI and PAN credentials",
      icon: <DollarSign className="w-5 h-5 text-brand-gold" />,
      documents: ["COI Certificate", "Corporate PAN", "Board Resolution Draft", "Director Signatures"],
      timeline: "2-3 Working Days",
      status: "pending",
    },
    {
      id: "step5",
      title: "Statutory Auditor Appointment (ADT-1)",
      description: "Convene the first official board meeting of directors and formally appoint the company's statutory CA auditor",
      icon: <Building2 className="w-5 h-5 text-brand-gold" />,
      documents: ["First Board Minutes Book", "Form ADT-1 CA Consent", "Physical Share Certificates"],
      timeline: "Within 30 Days",
      status: "pending",
    },
    {
      id: "step6",
      title: "Commencement of Business (Form 20A)",
      description: "Subscribers deposit authorized share capital into bank and file commencement declaration with ROC",
      icon: <Zap className="w-5 h-5 text-brand-gold" />,
      documents: ["Form 20A MCA Submission", "Capital Bank Statement Proof"],
      timeline: "Within 180 Days",
      status: "pending",
    },
    {
      id: "step7",
      title: "Annual ROC & Financial Filings",
      description: "Submit annual financial audits (Form AOC-4) and shareholding registry logs (Form MGT-7)",
      icon: <Scale className="w-5 h-5 text-brand-gold" />,
      documents: ["Form AOC-4 Financials", "Form MGT-7 Registry Return", "Audited Balance Sheets"],
      timeline: "Yearly Statutory Duty",
      status: "pending",
    },
  ];

  const llpFlow: FlowStep[] = [
    {
      id: "step1",
      title: "Designated Partner ID & Name Clearance",
      description: "Acquire Digital Signature Certificates (DSC) and verify LLP name on MCA registry",
      icon: <FileText className="w-5 h-5 text-brand-gold" />,
      documents: ["Partner PAN & Aadhaar", "Proposed Brand Name Prefix", "LLP Sector details"],
      timeline: "1-2 Working Days",
      status: "completed",
    },
    {
      id: "step2",
      title: "Draft & Stamp LLP Agreement",
      description: "Structure designated profit-sharing ratios, DPINs, and execute state stamp duty payments",
      icon: <FileText className="w-5 h-5 text-brand-gold" />,
      documents: ["Stamped Partnership Agreement", "Stamp Duty State Receipt", "DSC Certificates"],
      timeline: "2-3 Working Days",
      status: "current",
    },
    {
      id: "step3",
      title: "Lodge Form FiLLiP (LLP Registration)",
      description: "Submit registration application to ROC containing registered office details and partner profiles",
      icon: <Users className="w-5 h-5 text-brand-gold" />,
      documents: ["Form FiLLiP MCA Lodgement", "Utility Bill of Address", "Landlord NOC proof"],
      timeline: "1-2 Working Days",
      status: "pending",
    },
    {
      id: "step4",
      title: "ROC Certificate of Registration",
      description: "ROC approves the application and issues the formal LLP Certificate of Registration",
      icon: <CheckCircle2 className="w-5 h-5 text-brand-gold" />,
      documents: ["LLP Certificate of Registration", "Firm Statutory PAN card"],
      timeline: "5-7 Working Days",
      status: "pending",
    },
    {
      id: "step5",
      title: "Open LLP Bank Account",
      description: "Set up the partnership's corporate bank account utilizing the registered LLP certificate",
      icon: <DollarSign className="w-5 h-5 text-brand-gold" />,
      documents: ["LLP Certificate", "Firm PAN Card", "Registered Office electricity bill"],
      timeline: "2-3 Working Days",
      status: "pending",
    },
    {
      id: "step6",
      title: "LLP Annual Returns (Form 8 & 11)",
      description: "File Statement of Solvency (Form 8) and Annual Partner Return (Form 11) yearly",
      icon: <Scale className="w-5 h-5 text-brand-gold" />,
      documents: ["Form 8 Accounts", "Form 11 Annual Return", "Audited Financials"],
      timeline: "Yearly Statutory Duty",
      status: "pending",
    },
  ];

  const opcFlow: FlowStep[] = [
    {
      id: "step1",
      title: "Secure Nominee Consent & DSC",
      description: "Appoint a Nominee Director and acquire Digital Signature Credentials (DSC)",
      icon: <Shield className="w-5 h-5 text-brand-gold" />,
      documents: ["Nominee Consent Form (INC-3)", "Promoter PAN & Aadhaar", "Nominee PAN & Aadhaar"],
      timeline: "1-2 Working Days",
      status: "completed",
    },
    {
      id: "step2",
      title: "File SPICe+ (INC-32) Application",
      description: "Lodge incorporation forms under single-director parameters with registered address lease contracts",
      icon: <Users className="w-5 h-5 text-brand-gold" />,
      documents: ["Form INC-32", "Property Landlord NOC", "Electricity Utility Bill copy"],
      timeline: "2-3 Working Days",
      status: "current",
    },
    {
      id: "step3",
      title: "Get OPC Incorporation Certificate",
      description: "ROC CRC registry issues formal OPC Certificate of Incorporation (COI) alongside unique Nominee record",
      icon: <CheckCircle2 className="w-5 h-5 text-brand-gold" />,
      documents: ["OPC Certificate of Incorporation", "PAN & TAN credentials"],
      timeline: "3-4 Working Days",
      status: "pending",
    },
    {
      id: "step4",
      title: "Activate Business Bank Account",
      description: "Open your sole corporate bank account and deposit initial subscription capital",
      icon: <DollarSign className="w-5 h-5 text-brand-gold" />,
      documents: ["COI Certificate", "Corporate PAN Card", "Initial Share Capital Proof"],
      timeline: "2-3 Working Days",
      status: "pending",
    },
    {
      id: "step5",
      title: "ADT-1 Statutory Auditor Appointment",
      description: "Appoint statutory Chartered Accountant to inspect and lock yearly accounting sheets",
      icon: <Building2 className="w-5 h-5 text-brand-gold" />,
      documents: ["Form ADT-1 CA Consent", "Statutory auditor details"],
      timeline: "Within 30 Days",
      status: "pending",
    },
    {
      id: "step6",
      title: "Commencement of Business (Form 20A)",
      description: "Submit certificate proof to ROC verifying capital subscription deposit in corporate account",
      icon: <Zap className="w-5 h-5 text-brand-gold" />,
      documents: ["Form 20A MCA Submission", "Corporate Bank Statement"],
      timeline: "Within 180 Days",
      status: "pending",
    },
    {
      id: "step7",
      title: "OPC Annual ROC Filing & Audits",
      description: "Complete annual compliance return logs. Convert to Pvt Ltd automatically if turnover scales past limits",
      icon: <Scale className="w-5 h-5 text-brand-gold" />,
      documents: ["AOC-4 Financial Balance", "MGT-7A Annual Return"],
      timeline: "Yearly Compliance Duty",
      status: "pending",
    },
  ];

  const section8Flow: FlowStep[] = [
    {
      id: "step1",
      title: "NGO Name Verification & DSC",
      description: "Reserve a non-profit unique brand name reflecting social welfare and acquire trustee Digital Signatures",
      icon: <Heart className="w-5 h-5 text-brand-gold" />,
      documents: ["Trustee PAN & Aadhaar", "Proposed NGO Brand Name", "Draft Charitable Objectives"],
      timeline: "1-2 Working Days",
      status: "completed",
    },
    {
      id: "step2",
      title: "Obtain Section 8 License (Form INC-12)",
      description: "Apply for a specialized non-profit operating license from the Regional Central Government Registrar",
      icon: <FileText className="w-5 h-5 text-brand-gold" />,
      documents: ["Form INC-12 License Application", "Estimated 3-Year NGO Financial Budget", "MOA & AOA drafts"],
      timeline: "7-10 Working Days",
      status: "current",
    },
    {
      id: "step3",
      title: "Draft Altruistic MOA & AOA Bylaws",
      description: "Formalize legal articles locking absolute zero dividend payouts and reinvestment of income to objectives",
      icon: <Scale className="w-5 h-5 text-brand-gold" />,
      documents: ["Altruistic Objective Clauses", "Trustee Code of Conduct Agreements"],
      timeline: "2-3 Working Days",
      status: "pending",
    },
    {
      id: "step4",
      title: "Lodge SPICe+ Registration Forms",
      description: "Submit complete SPICe+ forms with the active Section 8 license to secure incorporation",
      icon: <Users className="w-5 h-5 text-brand-gold" />,
      documents: ["Form INC-32 Incorporation", "NOC landlord verification", "Trustee identification records"],
      timeline: "3-4 Working Days",
      status: "pending",
    },
    {
      id: "step5",
      title: "Receive Section 8 NGO COI",
      description: "Central Registry issues the final Certificate of Incorporation confirming non-profit operational status",
      icon: <CheckCircle2 className="w-5 h-5 text-brand-gold" />,
      documents: ["Certificate of Incorporation (COI)", "Non-Profit PAN & TAN cards"],
      timeline: "2-3 Working Days",
      status: "pending",
    },
    {
      id: "step6",
      title: "Apply for 12A & 80G Tax Certificates",
      description: "Lodge applications with Income Tax department to activate absolute tax-exempt and donation credit status",
      icon: <DollarSign className="w-5 h-5 text-brand-gold" />,
      documents: ["Form 10A (12A Registration)", "Form 10G (80G Registration)", "NGO Activity report details"],
      timeline: "15-20 Working Days",
      status: "pending",
    },
    {
      id: "step7",
      title: "Statutory Audits & Fund Tracking",
      description: "Mandatory yearly audits tracking charitable receipt balances and filing statutory ROC returns",
      icon: <Building2 className="w-5 h-5 text-brand-gold" />,
      documents: ["Annual AOC-4 NGO Files", "MGT-7 compliance log", "Audited Donation statement reports"],
      timeline: "Yearly Compliance Duty",
      status: "pending",
    },
  ];

  const getFlowData = () => {
    switch (selectedPath) {
      case "llp":
        return llpFlow;
      case "opc":
        return opcFlow;
      case "section8":
        return section8Flow;
      default:
        return pvtLtdFlow;
    }
  };

  const flowData = getFlowData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Process Roadmap
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Compliance <span className="text-brand-gold italic font-normal font-serif">Flowchart & Pipeline.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Chronological sequence of statutory tasks required to successfully incorporate and maintain your corporate enterprise in pristine status.
        </p>
      </div>

      {/* Path Selector - Now with 4 elegant options */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { value: "pvt-ltd", label: "🏢 Private Limited", steps: 7 },
          { value: "llp", label: "👥 LLP", steps: 6 },
          { value: "opc", label: "🛡️ OPC Solo", steps: 7 },
          { value: "section8", label: "❤️ NGO Section 8", steps: 7 }
        ].map((path) => (
          <button
            key={path.value}
            onClick={() => {
              setSelectedPath(path.value as any);
              setExpandedStep("step1");
            }}
            className={`px-4.5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              selectedPath === path.value
                ? "bg-brand-gold text-black border-brand-gold shadow-md shadow-brand-gold/15"
                : "bg-brand-bg-lighter border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-gold/45"
            }`}
          >
            {path.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${selectedPath === path.value ? "bg-black/10 text-black" : "bg-brand-gold/15 text-brand-gold"}`}>
              {path.steps} Steps
            </span>
          </button>
        ))}
      </div>

      {/* Flowchart Grid List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-4 text-left animate-in fade-in duration-200"
      >
        {flowData.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <motion.div
                variants={stepVariants}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="cursor-pointer"
              >
                {/* Step Card */}
                <div
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 relative ${
                    isExpanded
                      ? "bg-brand-gold/10 border-brand-gold shadow-lg shadow-brand-gold/5"
                      : "bg-brand-bg-lighter border-brand-border hover:border-brand-gold/30"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 blur-xl rounded-full" />
                  
                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0">
                        {step.status === "completed" && (
                          <div className="w-9 h-9 rounded-full bg-brand-gold/15 border border-brand-gold flex items-center justify-center">
                            <CheckCircle2 className="w-4.5 h-4.5 text-brand-gold" />
                          </div>
                        )}
                        {step.status === "current" && (
                          <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-9 h-9 rounded-full bg-brand-gold/15 border-2 border-brand-gold flex items-center justify-center"
                          >
                            <div className="w-3 h-3 rounded-full bg-brand-gold" />
                          </motion.div>
                        )}
                        {step.status === "pending" && (
                          <div className="w-9 h-9 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-xs font-mono font-bold text-brand-text-muted">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-brand-text leading-snug group-hover:text-brand-gold">
                          {step.title}
                        </h3>
                        <p className="text-xs text-brand-text-muted leading-relaxed font-sans line-clamp-1 mt-0.5">
                          {step.description}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className="text-brand-gold shrink-0 bg-brand-bg border border-brand-border p-2 rounded-xl">
                        {step.icon}
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      className="shrink-0"
                    >
                      <ChevronRight className="w-4 h-4 text-brand-text-muted" />
                    </motion.div>
                  </div>

                  {/* Expanded Details Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-brand-border/60 space-y-4">
                          {/* Timeline info */}
                          <div className="flex items-center gap-2 p-3 bg-brand-bg border border-brand-border rounded-xl w-fit">
                            <span className="text-[10px] text-brand-text-muted font-mono uppercase">Timeline SLA:</span>
                            <span className="text-xs font-bold text-brand-gold font-mono">{step.timeline}</span>
                          </div>

                          {/* Required Documents */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider font-bold">
                              📄 Necessary Documentation
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {step.documents.map((doc, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex items-center gap-2 p-2 bg-brand-bg border border-brand-border rounded-xl"
                                >
                                  <span className="text-brand-gold font-bold text-xs shrink-0">•</span>
                                  <span className="text-[11px] text-brand-text/90 font-sans">{doc}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Action Button for active steps */}
                          {step.status === "current" && (
                            <button
                              type="button"
                              className="w-full py-2.5 bg-brand-gold text-black font-mono uppercase tracking-widest text-[9px] rounded-xl font-bold shadow-md shadow-brand-gold/10 hover:bg-white transition-all cursor-pointer mt-3"
                            >
                              Initialize Active Step <ArrowRight className="w-3 h-3 inline-block ml-1" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Connecting Pipeline connector */}
              {index < flowData.length - 1 && (
                <div className="flex justify-center -my-1">
                  <div className="w-[1.5px] h-5 bg-brand-gold/25" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </motion.div>

      {/* Footer Alert Info */}
      <div className="p-5 bg-brand-gold/5 border border-brand-gold/15 rounded-2xl max-w-3xl mx-auto flex gap-4 text-left">
        <AlertCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-brand-text text-sm mb-1">Strict Registry Deadlines Warning</p>
          <p className="text-xs text-brand-text-muted font-sans leading-relaxed">
            Registrar penalties accumulate on a daily compounding basis for late statutory filings. Incroute ensures all company books and regulatory forms are audited and lodged inside active SLAs automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
