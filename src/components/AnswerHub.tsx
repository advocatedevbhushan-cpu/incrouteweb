import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal, { ScrollRevealItem } from "./ScrollReveal";
import { useAppNavigate } from "../lib/useAppNavigate";
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Info,
  Scale,
  DollarSign
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "pvt-ltd" | "opc" | "llp" | "section8" | "general";
  q: string;
  bluf: string;
  inDepth: React.ReactNode;
}

interface AnswerHubProps {
  setActiveTab?: (tab: string) => void;
}

export default function AnswerHub({ setActiveTab }: AnswerHubProps) {
  const navigateToTab = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const categories = [
    { id: "all", label: "All Advisors" },
    { id: "pvt-ltd", label: "Pvt Ltd Company" },
    { id: "llp", label: "LLP Partnership" },
    { id: "opc", label: "OPC (One Person)" },
    { id: "section8", label: "Section 8 NGO" },
    { id: "general", label: "General & Tax" }
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      category: "pvt-ltd",
      q: "How long does online company registration take in India?",
      bluf: "Online Pvt Ltd company registration in India takes 7 to 10 working days. This timeline includes acquiring Digital Signature Certificates (DSC), obtaining name approvals via SPICe+ Part A, and submitting final SPICe+ Part B forms to the Registrar of Companies.",
      inDepth: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
            Under modern Ministry of Corporate Affairs (MCA) guidelines, the incorporation timeline is divided into three major milestones:
          </p>
          <div className="overflow-x-auto border border-brand-border rounded-xl">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-brand-bg-darker border-b border-brand-border text-brand-gold font-mono uppercase tracking-wider">
                  <th className="p-3">Phase / Step</th>
                  <th className="p-3">Deliverables</th>
                  <th className="p-3">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                <tr>
                  <td className="p-3 font-semibold text-brand-text">1. Digital Credentials Setup</td>
                  <td className="p-3 text-brand-text-muted">Class 3 DSC allocation & unique DIN pre-clearance.</td>
                  <td className="p-3 font-mono text-brand-gold">1-2 Working Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-brand-text">2. Spice+ Part A Name filing</td>
                  <td className="p-3 text-brand-text-muted">Official name approval and brand reservation by Central Registration Centre.</td>
                  <td className="p-3 font-mono text-brand-gold">2-3 Working Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-brand-text">3. SPICe+ Part B & COI Issuance</td>
                  <td className="p-3 text-brand-text-muted">Filing MOA, AOA, AGILE-PRO-S (GST/EPFO/ESIC), PAN & TAN allocations.</td>
                  <td className="p-3 font-mono text-brand-gold">3-5 Working Days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-3.5 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-text/90 leading-relaxed">
              <span className="font-bold text-brand-gold">GEO Fact:</span> Over 94% of our client applications secure SPICe+ approvals in a single filing sweep. Ensure lease utility bills are under 60 days old to avoid MCA resubmissions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "faq-2",
      category: "opc",
      q: "What documents are needed for online OPC registration?",
      bluf: "Online OPC registration requires the director's PAN card, Aadhaar card, photo, and bank statement (under 2 months old). The registered office requires a utility bill (electricity/water) and a signed No Objection Certificate (NOC) from the property owner.",
      inDepth: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
            Because a One Person Company (OPC) involves a single entrepreneur, the Companies Act, 2013 requires the nomination of a **Nominee Director** to ensure perpetual succession. Here is the documentation checklist:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-sans">
            <div className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-2">
              <h5 className="font-bold text-brand-text flex items-center gap-1.5 font-serif">
                <FileText className="w-3.5 h-3.5 text-brand-gold" /> Sole Founder & Nominee KYC
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-brand-text-muted">
                <li>PAN Card (Mandatory for Indian citizens)</li>
                <li>Aadhaar Card or Passport</li>
                <li>Latest Bank Statement (with matchable current address)</li>
                <li>Passport-size photographs (in digital JPG format)</li>
                <li>Signed Form INC-3 (Nominee Consent Letter)</li>
              </ul>
            </div>
            <div className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-2">
              <h5 className="font-bold text-brand-text flex items-center gap-1.5 font-serif">
                <Building2 className="w-3.5 h-3.5 text-brand-gold" /> Registered Office Venue Proof
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-brand-text-muted">
                <li>Electricity Bill or Gas Connection Bill (under 2 months)</li>
                <li>No Objection Certificate (NOC) signed by the legal landlord</li>
                <li>Rent Agreement (if rented premises) or Registry Copy</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => navigateToTab("services")}
            className="text-[10px] uppercase font-mono tracking-widest font-bold text-brand-gold hover:underline flex items-center gap-1 mt-2 cursor-pointer"
          >
            Start OPC Registration Panel <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )
    },
    {
      id: "faq-3",
      category: "llp",
      q: "Pvt Ltd vs LLP for startup: Which structure is best?",
      bluf: "Pvt Ltd is the best structure for raising venture capital, issuing ESOPs, and rapid scaling. Choose an LLP if you want limited liability with low annual compliance (audits are optional below ₹25L capital or ₹40L turnover) and do not need immediate funding.",
      inDepth: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
            Choosing between a Private Limited (Pvt Ltd) and a Limited Liability Partnership (LLP) dictates your business scaling capabilities. Review this corporate parameter comparison:
          </p>
          <div className="overflow-x-auto border border-brand-border rounded-xl">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-brand-bg-darker border-b border-brand-border text-brand-gold font-mono uppercase tracking-wider">
                  <th className="p-3">Corporate Criteria</th>
                  <th className="p-3">Private Limited (Pvt Ltd)</th>
                  <th className="p-3">Limited Liability Partnership (LLP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                <tr>
                  <td className="p-3 font-semibold text-brand-text">VC Funding Readiness</td>
                  <td className="p-3 text-brand-text-muted">Seamless share transfers, angel/VC favorite.</td>
                  <td className="p-3 text-brand-text-muted">Extremely complex; VC funding rarely supported.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-brand-text">Mandatory Audits</td>
                  <td className="p-3 text-brand-text-muted">Required annually regardless of size or sales.</td>
                  <td className="p-3 text-brand-text-muted">Optional unless capital &gt; ₹25L or turnover &gt; ₹40L.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-brand-text">ESOP Allotment</td>
                  <td className="p-3 text-brand-text-muted">Fully supported; ideal for key employee retention.</td>
                  <td className="p-3 text-brand-text-muted">Not supported on partnerships.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-brand-text">Annual Filing Overhead</td>
                  <td className="p-3 text-brand-text-muted">High (AOC-4, MGT-7, Audit fee, Director KYC).</td>
                  <td className="p-3 text-brand-text-muted">Minimal (Form 8 and Form 11 filings).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigateToTab("comparison")}
              className="px-4 py-2 border border-brand-gold/30 hover:border-brand-gold hover:bg-brand-gold/5 text-brand-gold text-[9px] font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Interactive Entity Tool
            </button>
          </div>
        </div>
      )
    },
    {
      id: "faq-4",
      category: "pvt-ltd",
      q: "What is the actual online Pvt Ltd registration price?",
      bluf: "The total online Pvt Ltd registration price starts at ₹5,999 (inclusive of professional fees, DSC for two directors, and government filing charges). The price varies by state depending on authorized share capital brackets and regional MCA stamp duty schedules.",
      inDepth: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
            We operate with absolute billing clarity. The statutory pricing breakdown is split into official registrar fees and advisory filing overheads:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-sans">
            <div className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-1.5">
              <h5 className="font-bold text-brand-text flex items-center gap-1 text-brand-gold font-serif">
                <DollarSign className="w-3.5 h-3.5" /> Government / Registrar Fees
              </h5>
              <ul className="space-y-1 text-brand-text-muted">
                <li>• Spice+ Part A Reservation: <span className="font-mono font-bold text-brand-text">₹1,000</span></li>
                <li>• Stamp duty for MOA & AOA: <span className="font-mono text-brand-text">₹500 - ₹2,500*</span></li>
                <li>• PAN & TAN allocations: <span className="font-mono text-brand-text">₹131</span></li>
                <li className="text-[9px] italic pt-1">*Stamp duty varies strictly by state. E.g. Delhi is ₹260; Madhya Pradesh is over ₹2,500.</li>
              </ul>
            </div>
            <div className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-1.5">
              <h5 className="font-bold text-brand-text flex items-center gap-1 text-brand-gold font-serif">
                <Scale className="w-3.5 h-3.5" /> Professional & Technical Support
              </h5>
              <ul className="space-y-1 text-brand-text-muted">
                <li>• 2 Class-3 Digital Signatures (DSC): <span className="font-mono text-brand-text">₹1,500</span></li>
                <li>• Complete SPICe+ Part B Preparation: <span className="font-mono text-brand-text">₹2,368</span></li>
                <li>• Professional Fee (CA/CS Audited): <span className="font-mono text-brand-text">₹1,000</span></li>
                <li className="font-bold text-brand-gold pt-1">Total Standard Package: ₹5,999</li>
              </ul>
            </div>
          </div>
          <div className="p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-lg flex items-center justify-between">
            <span className="text-[10px] text-brand-text font-mono">Calculate your state's exact stamp duty rate:</span>
            <button
              onClick={() => navigateToTab("tools")}
              className="text-[9px] uppercase font-mono bg-brand-gold text-black font-bold px-3 py-1.5 rounded hover:bg-white transition-colors cursor-pointer"
            >
              Open Stamp duty calculator
            </button>
          </div>
        </div>
      )
    },
    {
      id: "faq-5",
      category: "section8",
      q: "What are the tax exemptions for a Section 8 NGO?",
      bluf: "Section 8 NGOs enjoy 100% tax exemptions on donations under Section 12A and Section 80G of the Income Tax Act, 1961. The entity is also exempt from minimum capital criteria, stamp duty levies on incorporation, and corporate dividend distribution taxes.",
      inDepth: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
            Under Section 8 of the Companies Act, 2013, an NGO is formed to promote non-profit goals (charity, art, education, science, sports). Because of its statutory design, it secures powerful tax benefits:
          </p>
          <div className="space-y-3 text-[11px] font-sans">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-brand-text">Income Tax Exemption (Section 12A)</strong>
                <p className="text-brand-text-muted mt-0.5">100% exemption on non-commercial surplus accumulated for charitable objectives. Requires filing Form 10A within 3 months of incorporation.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-brand-text">Donor Tax Deductions (Section 80G)</strong>
                <p className="text-brand-text-muted mt-0.5">Allows company/individual donors to deduct 50% of their contributed amounts from taxable incomes. Boosts fundraising appeal significantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-brand-text">Corporate CSR Funding Eligibility (Section 135)</strong>
                <p className="text-brand-text-muted mt-0.5">Allows corporate giants to fulfill their mandatory 2% annual profit Corporate Social Responsibility (CSR) contributions by direct donation to your Section 8 foundation.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.bluf.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 text-left max-w-5xl mx-auto">
      
      {/* Search Hub Header */}
      <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Expert Knowledge Base
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Corporate Filing <span className="text-brand-gold italic font-normal">Knowledge Hub.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Instant answers to your registration, compliance, and filing questions — structured for clarity and backed by expert legal insight.
        </p>
      </ScrollReveal>

      {/* Interactive Search Tool */}
      <ScrollReveal 
        variant="fade-up" 
        delay={0.1}
        className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
        
        {/* Search Bar Input */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-brand-text-muted/40" />
          <input
            type="text"
            placeholder="Ask a filing question (e.g. 'incorporation speed', 'OPC documents', 'LLP capital')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-3 pl-12 text-sm text-brand-text placeholder-brand-text-muted/30 outline-none focus:border-brand-gold shadow-inner transition-colors duration-250"
          />
        </div>

        {/* Category Choice Row */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2 border-t border-brand-border/40">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[9px] font-mono tracking-wider uppercase px-4 py-2 rounded-lg transition-all duration-150 ${
                selectedCategory === cat.id
                  ? "bg-brand-gold text-black font-bold shadow-md shadow-brand-gold/15"
                  : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Accordion FAQ Loop */}
      <ScrollReveal 
        variant="fade" 
        staggerChildren={0.06}
        className="space-y-4"
      >
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <ScrollRevealItem 
              key={faq.id} 
              variant="fade-up"
              className={`bg-brand-bg-lighter border rounded-2xl transition-all duration-300 overflow-hidden ${
                isExpanded ? "border-brand-gold/45 shadow-lg shadow-brand-gold/5" : "border-brand-border hover:border-brand-border-hover"
              }`}
            >
              {/* Question Row Clicker */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 font-serif text-brand-text text-sm sm:text-base font-light transition-colors hover:text-brand-gold cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-brand-gold shrink-0" />
                  {faq.q}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-brand-gold shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-text-muted shrink-0" />
                )}
              </button>

              {/* Collapsible Panel */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 border-t border-brand-border/40 space-y-5">
                      
                      {/* BLUF (Bottom Line Up Front) AI Quick Answer Card */}
                      <div className="bg-brand-gold/5 border border-brand-gold/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 blur-xl rounded-full" />
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-brand-gold uppercase tracking-widest font-bold mb-2">
                          <Sparkles className="w-3.5 h-3.5" /> AI Quick Answer (BLUF)
                        </div>
                        <p className="text-xs text-brand-text font-serif leading-relaxed italic">
                          "{faq.bluf}"
                        </p>
                      </div>

                      {/* In-depth Advisory Panel */}
                      <div className="space-y-3">
                        <div className="text-[9px] font-mono text-[#9E896A] uppercase tracking-widest font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> In-Depth Advisory Notes
                        </div>
                        {faq.inDepth}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollRevealItem>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="py-12 text-center text-brand-text-muted italic font-serif bg-brand-bg-lighter border border-brand-border rounded-2xl">
            No dynamic advisory answers match your query. Try a general term like "Pvt Ltd" or "documents".
          </div>
        )}
      </ScrollReveal>

    </div>
  );
}
