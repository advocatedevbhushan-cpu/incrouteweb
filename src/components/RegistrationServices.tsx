import React, { useState, useEffect } from "react";
import { Building2, Check, Clock, ShieldAlert, Users, Award, ShieldCheck, Milestone, ArrowRight, CornerDownRight, Sparkles } from "lucide-react";
import { FirmOrder } from "../types";

interface RegistrationServicesProps {
  setActiveTab: (tab: string) => void;
  prefilledCompanyName?: string;
  prefilledEntityType?: string;
}

const entityCatalog = [
  {
    id: "pvt-ltd",
    name: "Private Limited Company (Pvt Ltd)",
    description: "The most popular registration structure for startups and medium businesses wanting custom equity, funding, and high credibility.",
    popular: true,
    minDirectors: "2 Directors (Minimum)",
    timeline: "7 - 10 working days",
    pricing: "₹999*",
    features: [
      "Separate legal entity status",
      "Limited liability security protection",
      "Easier to raise startup capital or bank loans",
      "Perpetual succession of equity structure",
      "Eligible for Startup tax exemptions schemes"
    ],
    documents: [
      "PAN Card of all Directors",
      "Proof of identity (Voter ID, Passport, or Aadhar)",
      "Bank Statement or Electricity bill of director",
      "Rental Deed / NOC from commercial site owner"
    ]
  },
  {
    id: "llp",
    name: "Limited Liability Partnership (LLP)",
    description: "Highly suitable for service professionals, real estate, and partners who want limited liability with reduced compliance overhead.",
    popular: false,
    minDirectors: "2 Designated Partners",
    timeline: "10 - 14 working days",
    pricing: "₹1499*",
    features: [
      "Operational flexibility with modular partnership agreement",
      "No corporate dividend taxation overheads",
      "No mandatory statutory audit unless turnover is high",
      "Separate legal status independent of partners"
    ],
    documents: [
      "ID & Address proof of all partners",
      "NOC from owner of registered premises",
      "Stamd/Notarized LLP Agreement",
      "PAN card of the partnership firm"
    ]
  },
  {
    id: "opc",
    name: "One Person Company (OPC)",
    description: "Perfect for sole proprietors who want a private limited company's liability shield while maintaining 100% control.",
    popular: false,
    minDirectors: "1 Director & 1 Nominee",
    timeline: "8 - 11 working days",
    pricing: "₹999*",
    features: [
      "Complete single-person control of the firm",
      "Limited liability benefit unlike sole proprietorship",
      "Eligible for standard startup registry perks",
      "Simple to transfer shareholdings later"
    ],
    documents: [
      "PAN and KYC of the sole shareholder",
      "PAN and KYC of the designated Nominee director",
      "Registered office electricity bill",
      "Consent form of Nominee (Form INC-3)"
    ]
  },
  {
    id: "partnership",
    name: "Partnership Firm",
    description: "A fast, straightforward partnership structure for local trade, shops, and small physical operations.",
    popular: false,
    minDirectors: "2 Partners (Minimum)",
    timeline: "3 - 5 working days",
    pricing: "₹499*",
    features: [
      "Easiest structured firm to start & low startup fee",
      "Minimum initial compliances",
      "Flexible profit share ratio",
      "Direct personal-tier taxation reporting"
    ],
    documents: [
      "Signed stamp-paper partnership deed proof",
      "PAN Card of partners",
      "Utility Bill containing office address descriptor",
      "NOC for workspace utility"
    ]
  },
  {
    id: "virtual-cfo",
    name: "Virtual CFO Services",
    description: "Premium institutional-grade financial leadership: corporate treasury engineering, modular financial analytics, cash flow optimization, and tax strategy by elite Chartered Accountants.",
    popular: false,
    minDirectors: "Chartered Accountant Lead",
    timeline: "Ongoing Retainer",
    pricing: "₹2,999*",
    features: [
      "Strategic cash flow architecture & modeling",
      "Treasury and bank reconciliation engineering",
      "Fundraising preparation and pitch compliance",
      "Tax strategy and regulatory audit defense",
      "Monthly board-level performance reports"
    ],
    documents: [
      "Latest corporate balance sheets",
      "Current statutory audit files",
      "GST registration certificates",
      "Corporate bank statements"
    ]
  },
  {
    id: "virtual-office",
    name: "Premium Virtual Office address",
    description: "Secure prestigious commercial corporate addresses in premier A-grade business districts (Bangalore, Mumbai, Delhi, Hyderabad) for GST and ROC compliance.",
    popular: false,
    minDirectors: "Prime Selected Cities",
    timeline: "2 - 3 working days",
    pricing: "₹999*",
    features: [
      "Instant commercial address trust credentials",
      "100% compliant with GST & ROC registry rules",
      "Secure digital mail scanning & weekly dispatch",
      "Access to premium on-demand meeting rooms",
      "Zero physical office lease liabilities"
    ],
    documents: [
      "PAN Card & Aadhaar of the applicant",
      "Proposed company name approval letter",
      "Details of the authorized signatory",
      "Existing business registration (optional)"
    ]
  },
  {
    id: "business-consultancy",
    name: "Executive Business Consultancy",
    description: "Bespoke operational scaling audits, modular business model stress-testing, strategic growth mapping, brand licensing coordination, and joint-venture architecture design.",
    popular: false,
    minDirectors: "Executive Consultant Lead",
    timeline: "Retainer / Project",
    pricing: "₹1,499*",
    features: [
      "Comprehensive commercial operational audit",
      "Bespoke joint-venture & partnership bylaws",
      "IP licensing & corporate structural mapping",
      "Market expansion strategy & feasibility report",
      "Strategic legal risk stress-testing"
    ],
    documents: [
      "Brief operational summary document",
      "Current organizational structures",
      "Target objectives and scaling milestones",
      "Existing contract agreements (if any)"
    ]
  }
];

const detailedCatalogData = {
  primary: [
    {
      title: "Private Limited Company (Pvt Ltd)",
      entails: "Full-spectrum structural design of authorized capital, custom Articles of Association (AOA) & Memorandum of Association (MOA), securing Director Identification Numbers (DIN/DSC), name reservation filings, and ROC spice-plus registry lodging.",
      benefits: "Complete separation of personal asset structures from company-tier civil liabilities. Enhances professional trust to raise startup venture capital, set up ESOP pools to retain talent, and secure permanent corporate succession.",
      timeline: "7 - 10 Days",
      complexity: "Premium Core"
    },
    {
      title: "Section 8 Non-Profit Organization",
      entails: "Securing specialized Central Government charitable operating licenses, drafting bespoke altruistic MOA/AOA clauses, installing zero dividend distribution restrictions, and registering internal trustee arrays.",
      benefits: "Entitles the enterprise to absolute corporate tax exemptions, allows receiving institutional philanthropy/foreign donations under regulatory laws, and builds peerless social credibility.",
      timeline: "15 - 20 Days",
      complexity: "Regulatory Elite"
    },
    {
      title: "Public Limited Corporation",
      entails: "Constructing robust corporate prospectus documents, establishing a minimum of 7 shareholders and 3 board directors, configuring public registry disclosures, and filing formal public incorporation articles.",
      benefits: "Grants maximum capacity to raise capital via public subscriptions, permits effortless share liquidations on public stock exchanges, and achieves state-level reputation metrics.",
      timeline: "20 - 25 Days",
      complexity: "Enterprise Class"
    }
  ],
  alternatives: [
    {
      title: "Limited Liability Partnership (LLP)",
      entails: "Drafting high-precision Partnership Agreements reflecting custom dynamic profit shares, issuing Designated Partner IDs (DPIN), registering with local state ROC departments, and generating partner bylaws.",
      benefits: "Isolates partners from liabilities arising from separate partner negligence. Eradicates corporate Dividend Distribution Tax (DDT) and saves statutory audit cost unless volume crosses limits.",
      timeline: "10 - 14 Days",
      complexity: "Agile Structural"
    },
    {
      title: "One Person Company (OPC)",
      entails: "Filing company reservation under single-director directives, preparing nominee successorship contracts (INC-3), and writing specialized corporate safety clauses for single shareholder ownership.",
      benefits: "Bestows absolute single-member control without exposing the individual to sole proprietorship risk, rendering transition into a full-scale multi-director Pvt Ltd seamless.",
      timeline: "8 - 11 Days",
      complexity: "Solo Elite Shield"
    },
    {
      title: "Registered Partnership",
      entails: "Preparing localized partnership deed agreements, executing stamp-duty verification, registering with State Registrar of Firms, and configuring mutual agency bylaws.",
      benefits: "Extremely cost-effective initialization cost with swift setup duration. Minimizes regulatory filing requirements whilst allowing partners to combine talent and capital reserves.",
      timeline: "3 - 5 Days",
      complexity: "Standard Compact"
    },
    {
      title: "Sole Proprietorship Configuration",
      entails: "Establishing legal trade certificate credentials, obtaining MSME Registrations, configuring tax credentials, and registering basic local commercial listings.",
      benefits: "100% control over operational decisions with direct pass-through taxation on individual marginal tiers. Zero standard corporate files or reporting fees.",
      timeline: "2 - 3 Days",
      complexity: "Low Overhead"
    }
  ],
  compliance: [
    {
      title: "Annual ROC Corporate Filings Suite",
      entails: "Coordinating mandatory financial statements (AOC-4) and general entity files (MGT-7), documenting official Board meeting resolutions, filing statutory KYC audits, and organizing company books.",
      benefits: "Prists the company in pristine standing with central registries, averting heavy daily penalty fees, sudden registry strike-offs, or management disqualifications.",
      timeline: "Ongoing Suite",
      complexity: "Statutory Duty"
    },
    {
      title: "Corporate Tax Alignment (GST, TDS & Payroll)",
      entails: "Activating regular Goods and Services tax profiles, provisioning Tax Deduction numbers (TAN) for payroll taxes, filing quarterly schedules, and designing employee benefit systems.",
      benefits: "Full defense against state tax examinations and audits. Authorizes inter-state trading structures and sets up statutory frameworks for hiring high-value talent.",
      timeline: "2 - 4 Days",
      complexity: "Financial Shield"
    },
    {
      title: "Pre-Audit Statutory Reconciliations",
      entails: "Pre-verifying trial ledger logs, checking physical invoice receipts, assessing past tax liability files, and generating a corporate audit safety balance score.",
      benefits: "Halves duration of physical statutory audits, catches bookkeeping leaks before tax officers inspect records, and ensures high credit rating points with lenders.",
      timeline: "5 - 7 Days",
      complexity: "Hardening Checks"
    },
    {
      title: "Intellectual Property & National Trademark Protection",
      entails: "Executing premium brand trademark search records, structuring standard class filings, registering brand IP forms, and defending logos against journal objections.",
      benefits: "Ensures legal monopoly over firm identity tokens, guards brand equity from copycat competitor activity, and formats the trademark as a valuable balance sheet asset.",
      timeline: "1 - 2 Days Filing",
      complexity: "Asset Protection"
    }
  ],
  consultancy: [
    {
      title: "Virtual CFO Services",
      entails: "Strategic cash flow architecture, corporate treasury engineering, modular financial analytics, fundraising preparation, and statutory audit representation managed by elite Chartered Accountants.",
      benefits: "Provides premium institutional-grade financial leadership and structural forecasting without the overheads of a full-time executive salary.",
      timeline: "Ongoing Suite",
      complexity: "C-Suite Strategic"
    },
    {
      title: "Premium Virtual Office Address",
      entails: "Securing premium commercial corporate addresses in premier A-grade business districts (Bangalore, Mumbai, Delhi NCR, Hyderabad) with customized mail dispatch, GST desk setup, and ROC verification compliance.",
      benefits: "Grants instant localized trust credentials and a professional regional corporate base without physical workspace lease liabilities.",
      timeline: "2 - 3 Days",
      complexity: "High-Tier Presence"
    },
    {
      title: "Executive Business Consultancy",
      entails: "Custom operational audits, modular business model stress-testing, strategic growth mapping, brand licensing coordination, and joint-venture architecture design.",
      benefits: "Accelerates scaling timelines, identifies commercial bottlenecks, and structures legal frameworks for complex partnership scaling.",
      timeline: "Modular / Retainer",
      complexity: "Elite Enterprise"
    }
  ]
};

import ContactFormWidget from "./ContactFormWidget";

export default function RegistrationServices({ 
  setActiveTab,
  prefilledCompanyName = "",
  prefilledEntityType = ""
}: RegistrationServicesProps) {
  const [selectedEntityId, setSelectedEntityId] = useState("pvt-ltd");
  const [catalogCategory, setCatalogCategory] = useState<"primary" | "alternatives" | "compliance" | "consultancy">("primary");
  const [latestBlog, setLatestBlog] = useState<any>(null);

  // Fetch featured insight
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/blog/posts");
        const data = await res.json();
        if (data.success && data.posts && data.posts.length > 0) {
          setLatestBlog(data.posts[0]);
        }
      } catch (err) {
        console.error("Failed to load featured insight:", err);
      }
    }
    fetchLatest();
  }, []);

  // Fee Calculator State
  const [calcEntity, setCalcEntity] = useState("pvt-ltd");
  const [calcDirectors, setCalcDirectors] = useState(2);
  const [calcCapital, setCalcCapital] = useState(100000);
  const [addOns, setAddOns] = useState({
    gst: false,
    trademark: false,
    startupIndia: false,
    virtualOffice: false,
    virtualCFO: false,
  });

  // Auto-scroll to onboarding form section when prefilled brand name is provided
  useEffect(() => {
    if (prefilledCompanyName) {
      setTimeout(() => {
        const onboardingForm = document.getElementById("onboarding-form-section");
        if (onboardingForm) {
          onboardingForm.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }, [prefilledCompanyName]);

  // Sync selectedEntityId when prefilledEntityType changes
  useEffect(() => {
    if (prefilledEntityType) {
      setSelectedEntityId(prefilledEntityType);
    }
  }, [prefilledEntityType]);

  const getCalculatorPricing = () => {
    let professionalFee = 999;
    let baseGovFee = 1500;
    let minDirectors = 2;

    if (calcEntity === "llp") {
      professionalFee = 1499;
      baseGovFee = 1000;
      minDirectors = 2;
    } else if (calcEntity === "opc") {
      professionalFee = 999;
      baseGovFee = 1200;
      minDirectors = 1;
    } else if (calcEntity === "partnership") {
      professionalFee = 499;
      baseGovFee = 300;
      minDirectors = 2;
    }

    // DIN/DSC Gov fees per Director above minimum
    const extraDirectors = Math.max(0, calcDirectors - minDirectors);
    const directorGovFee = extraDirectors * 500;

    // Capital stamp duties: 0.1% if above 1 Lakh
    const capitalStampDuty = calcCapital > 100000 ? Math.round((calcCapital - 100000) * 0.001) : 0;

    const govFee = baseGovFee + directorGovFee + capitalStampDuty;

    // Addons
    let addOnFee = 0;
    if (addOns.gst) addOnFee += 499;
    if (addOns.trademark) addOnFee += 1999;
    if (addOns.startupIndia) addOnFee += 1499;
    if (addOns.virtualOffice) addOnFee += 999;
    if (addOns.virtualCFO) addOnFee += 2999;

    const subtotal = professionalFee + govFee + addOnFee;
    const discount = Math.round(subtotal * 0.10); // 10% discount
    const total = subtotal - discount;

    return {
      professionalFee,
      govFee,
      addOnFee,
      discount,
      total,
    };
  };

  const pricing = getCalculatorPricing();
  const selectedEntity = entityCatalog.find((e) => e.id === selectedEntityId) || entityCatalog[0];

  return (
    <div className="space-y-12">
      {/* Intro Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-brand-border/60 pb-8 mb-4">
        {/* Left Column - Intro Header (8 Cols) */}
        <div className="lg:col-span-8 text-left space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5 animate-in fade-in slide-in-from-top-1 duration-200">
            <img src="/ashoka_lion_gold.png" className="w-5 h-5 rounded-full object-cover border border-brand-gold/40 bg-black" alt="Emblem" />
            Premium Suite & Incorporation Registrars
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-brand-text tracking-tight serif leading-tight">
            Make Private Limited Firm <br className="hidden sm:inline" />
            <span className="text-brand-gold italic font-normal">within Rs 999*</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted font-sans leading-relaxed max-w-2xl">
            Premier consultancy services for registration, statutory compliance, and integrated firm management for visionary entrepreneurs. Complete guidance without exorbitant overheads.
          </p>
        </div>

        {/* Right Column - Latest Blog Brief Spotlight (4 Cols) */}
        <div className="lg:col-span-4 w-full">
          {latestBlog && (
            <div 
              onClick={() => {
                setActiveTab("blog");
              }}
              className="bg-brand-bg-lighter border border-brand-border hover:border-brand-gold/30 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-xl shadow-black/5 hover:-translate-y-0.5 group relative overflow-hidden flex flex-col justify-between animate-in fade-in slide-in-from-right-1 duration-200"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-2xl rounded-full" />
              <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-brand-gold font-bold mb-2 relative z-10">
                <span>Featured Brief</span>
                <span className="bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20 flex items-center gap-1 font-bold">
                  Read Article
                </span>
              </div>
              <h4 className="text-sm font-semibold text-brand-text font-serif leading-snug group-hover:text-brand-gold transition-colors line-clamp-2 relative z-10">
                {latestBlog.title}
              </h4>
              <p className="text-[10px] text-brand-text-muted mt-1.5 leading-relaxed line-clamp-2 relative z-10">
                {latestBlog.subtitle}
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-brand-text-muted/70 mt-3 pt-2.5 border-t border-brand-border/40 relative z-10">
                <span>{latestBlog.author.split(" ")[0]}</span>
                <span>{latestBlog.date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Left - Entity Catalog Selector / Right - Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-[#9E896A] font-semibold font-mono pl-1">
            Choose Business Structure
          </div>
          <div className="space-y-4">
            {entityCatalog.map((entity) => {
              const worksAsSelected = selectedEntityId === entity.id;
              return (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntityId(entity.id)}
                  className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    worksAsSelected
                      ? "bg-brand-card border-brand-gold/40 shadow-xl shadow-brand-gold/5"
                      : "bg-brand-bg-lighter border-brand-border hover:border-[#9E896A]/30 hover:bg-brand-bg-lighter/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-light text-base tracking-wide transition-colors ${worksAsSelected ? "text-brand-gold font-serif" : "text-brand-text"}`}>
                        {entity.name}
                      </h4>
                      <p className="text-xs text-brand-text-muted line-clamp-2 mt-1.5 leading-relaxed">
                        {entity.description}
                      </p>
                    </div>
                    {entity.popular && (
                      <span className="text-[9px] uppercase tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-2 py-0.5 rounded font-bold font-mono shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Detail Pane & Quick Onboard Form (7 Cols) */}
        <div className="lg:col-span-7 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6">
          {selectedEntity.id === "pvt-ltd" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/pvt_ltd_corp.png" className="w-full h-full object-cover" alt="Private Limited corporate credibility" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Private Limited corporate credibility visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "llp" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/llp_partners.png" className="w-full h-full object-cover" alt="Limited Liability Partnership services" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Limited Liability Partnership services visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "opc" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/opc_director.png" className="w-full h-full object-cover" alt="One Person Company sole control" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">One Person Company sole control visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "partnership" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/partnership_firm.png" className="w-full h-full object-cover" alt="Partnership Firm agreements" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Partnership Firm agreements visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "virtual-cfo" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/virtual_cfo_analytics.png" className="w-full h-full object-cover" alt="Virtual CFO strategic analytics" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Virtual CFO strategic analytics visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "virtual-office" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/virtual_office_workspace.png" className="w-full h-full object-cover" alt="Virtual Office address workspace" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Virtual Office address workspace visual</span>
              </div>
            </div>
          )}
          {selectedEntity.id === "business-consultancy" && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative mb-4">
              <img src="/consultancy_strategy.png" className="w-full h-full object-cover" alt="Executive Business Consultancy growth" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-black/50 px-2 py-0.5 rounded border border-brand-gold/20">Executive Business Consultancy growth visual</span>
              </div>
            </div>
          )}

          <div className="border-b border-brand-border pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-2xl font-light text-brand-text tracking-wide serif">{selectedEntity.name}</h3>
              <div className="text-2xl font-normal text-brand-gold bg-brand-gold/5 px-4 py-1.5 rounded-lg border border-brand-gold/20 font-serif italic">
                {selectedEntity.pricing} <span className="text-xs text-brand-text-muted font-sans font-normal lowercase tracking-normal">estimated rate</span>
              </div>
            </div>
            <p className="text-brand-text-muted text-xs sm:text-sm mt-3 leading-relaxed font-sans">{selectedEntity.description}</p>
            <div className="mt-2.5 text-[10px] text-brand-text-muted/70 leading-relaxed font-sans italic">
              * Rates shown are estimated and may vary from time to time. The final binding cost will be declared after a direct consultation call or formally notified via email. Virtual Office address and utility charges change dynamically over time based on local municipality and regional demand; the given rate represents the minimum expected starting price.
            </div>
          </div>

          {/* Quick legal milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 flex items-center gap-3">
              <Users className="w-4 h-4 text-brand-gold shrink-0" />
              <div>
                <p className="text-[9px] font-mono text-brand-text-muted/70 uppercase tracking-widest">Requirement</p>
                <p className="text-xs font-semibold text-brand-text">{selectedEntity.minDirectors}</p>
              </div>
            </div>

            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-gold shrink-0" />
              <div>
                <p className="text-[9px] font-mono text-brand-text-muted/70 uppercase tracking-widest">Standard Duration</p>
                <p className="text-xs font-semibold text-brand-text">{selectedEntity.timeline}</p>
              </div>
            </div>
          </div>

          {/* Features and checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9E896A] tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4" /> Key Advantages
              </p>
              <ul className="space-y-2">
                {selectedEntity.features.map((feature, i) => (
                  <li key={i} className="text-xs text-brand-text/90 flex items-start gap-2 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-[#9E896A] tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                <Milestone className="w-4 h-4" /> Required Credentials
              </p>
              <ul className="space-y-2">
                {selectedEntity.documents.map((doc, i) => (
                  <li key={i} className="text-xs text-brand-text/90 flex items-start gap-2 leading-relaxed">
                    <CornerDownRight className="w-3.5 h-3.5 text-brand-text-muted/40 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Registration Onboarding Form */}
          <div 
            id="onboarding-form-section"
            className={`border-t border-brand-border/85 pt-6 mt-6 rounded-2xl transition-all duration-500 scroll-mt-20 ${
              prefilledCompanyName 
                ? "p-6 bg-brand-gold/5 border border-brand-gold/30 shadow-2xl shadow-brand-gold/5 ring-1 ring-brand-gold/10" 
                : ""
            }`}
          >
            {prefilledCompanyName && (
              <div className="mb-6 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/25 flex items-start gap-3 relative overflow-hidden animate-pulse">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 blur-xl rounded-full" />
                <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold bg-brand-gold/15 border border-brand-gold/30 px-2 py-0.5 rounded">
                    AI Pre-Approved Brand Ready
                  </span>
                  <h5 className="text-xs font-semibold text-brand-text tracking-wide mt-2 font-serif italic">
                    Let's Register "{prefilledCompanyName}"!
                  </h5>
                  <p className="text-[10px] text-brand-text-muted mt-1 leading-relaxed">
                    We have customized your onboarding checklist and prefilled the statutory consultation requirements for {selectedEntity.name} in the secure form below.
                  </p>
                </div>
              </div>
            )}

            <h4 className="text-xs font-semibold text-[#9E896A] uppercase tracking-widest mb-4 font-mono pl-1">
              Contact Us Regarding {selectedEntity.name}
            </h4>
            <ContactFormWidget initialMessage={prefilledCompanyName ? `I would like to onboard and register my brand "${prefilledCompanyName}" as a ${selectedEntity.name}.` : ""} />
          </div>
        </div>
      </div>

      {/* Interactive Pricing & Fee Calculator */}
      <div className="border-t border-brand-border/80 pt-16 mt-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded font-mono uppercase tracking-widest border border-brand-gold/15">
            Dynamic Budget Advisor
          </div>
          <h2 className="text-2xl sm:text-3.5xl font-light text-brand-text tracking-wide serif">
            Interactive Fee & <br className="hidden sm:inline" />
            <span className="text-brand-gold italic font-normal text-3xl sm:text-4xl">Formation Cost Calculator</span>
          </h2>
          <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-2xl mx-auto">
            Design your ideal incorporation parameters in real-time. Slide, toggle, and immediately audit professional fees against official stamp duties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Controls - Left side (7 cols) */}
          <div className="lg:col-span-7 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            {/* Entity Selector Row */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-semibold">
                1. Select Entity Structure
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "pvt-ltd", name: "Pvt Ltd" },
                  { id: "llp", name: "LLP" },
                  { id: "opc", name: "OPC" },
                  { id: "partnership", name: "Partnership" }
                ].map((ent) => (
                  <button
                    key={ent.id}
                    onClick={() => {
                      setCalcEntity(ent.id);
                      if (ent.id === "opc" && calcDirectors > 1) {
                        setCalcDirectors(1);
                      } else if (ent.id !== "opc" && calcDirectors < 2) {
                        setCalcDirectors(2);
                      }
                    }}
                    className={`px-4 py-3 rounded-xl border text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                      calcEntity === ent.id
                        ? "bg-brand-gold text-black border-brand-gold font-bold font-semibold"
                        : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text"
                    }`}
                  >
                    {ent.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Slider 1: Directors */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-semibold">
                    2. Directors / Partners
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-text bg-brand-bg border border-brand-border px-2 py-0.5 rounded">
                    {calcDirectors}
                  </span>
                </div>
                <input
                  type="range"
                  min={calcEntity === "opc" ? 1 : 2}
                  max={calcEntity === "opc" ? 1 : 10}
                  value={calcDirectors}
                  disabled={calcEntity === "opc"}
                  onChange={(e) => setCalcDirectors(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-gold"
                />
                <span className="text-[9px] text-brand-text-muted block font-mono">
                  {calcEntity === "opc" ? "* OPC allows exactly 1 Director" : "* Minimum 2 required by ROC rules"}
                </span>
              </div>

              {/* Slider 2: Share Capital */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-semibold">
                    3. Authorized Share Capital
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-text bg-brand-bg border border-brand-border px-2 py-0.5 rounded">
                    ₹{(calcCapital / 1000).toFixed(0)}K
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={1000000}
                  step={10000}
                  value={calcCapital}
                  onChange={(e) => setCalcCapital(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-gold"
                />
                <span className="text-[9px] text-brand-text-muted block font-mono">
                  * Higher capital incurs minor state stamp duty increases
                </span>
              </div>
            </div>

            {/* Addon checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-semibold">
                4. Select Strategic Add-ons
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { key: "gst", name: "GST Register", price: "₹499*" },
                  { key: "trademark", name: "Trademark File", price: "₹1,999*" },
                  { key: "startupIndia", name: "Startup India", price: "₹1,499*" },
                  { key: "virtualOffice", name: "Virtual Office Address", price: "₹999/mo*" },
                  { key: "virtualCFO", name: "Virtual CFO Consult", price: "₹2,999/mo*" }
                ].map((addon) => (
                  <div
                    key={addon.key}
                    onClick={() =>
                      setAddOns({
                        ...addOns,
                        [addon.key]: !addOns[addon.key as any]
                      } as any)
                    }
                    className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 ${
                      addOns[addon.key as any]
                        ? "bg-brand-gold/10 border-brand-gold shadow-lg shadow-brand-gold/15 scale-[1.02]"
                        : "bg-brand-bg border border-brand-border hover:border-brand-gold/45"
                    }`}
                  >
                    <span className={`text-[10px] font-mono tracking-wider transition-colors ${addOns[addon.key as any] ? "text-brand-gold font-bold" : "text-brand-text-muted"}`}>
                      {addon.name}
                    </span>
                    <span className="text-xs font-serif italic text-brand-text mt-2 block">
                      {addon.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Ledger - Right side (5 cols) */}
          <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
            
            <div className="space-y-6 relative z-10">
              <div className="border-b border-brand-border pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-light text-brand-text serif">Estimated Formation Cost</h3>
                  <p className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase">Breakdown Estimate Ledger</p>
                </div>
                <span className="text-[8px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider animate-pulse">
                  10% off applied
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-text-muted">* Professional Incorporation Fees</span>
                  <span className="font-mono text-brand-text">₹{pricing.professionalFee}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-text-muted">* Official ROC Stamp Duty & DIN</span>
                  <span className="font-mono text-brand-text">₹{pricing.govFee}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-text-muted">Selected Add-on Integrations</span>
                  <span className="font-mono text-brand-text">₹{pricing.addOnFee}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-brand-gold">
                  <span>Dynamic Consultancy Discount</span>
                  <span className="font-mono font-bold">-₹{pricing.discount}</span>
                </div>
              </div>

              {/* Estimate Disclaimer Callout */}
              <div className="mt-4 p-3.5 bg-brand-bg/65 border border-brand-gold/10 rounded-xl text-[10px] text-brand-text-muted leading-relaxed font-sans">
                <span className="text-brand-gold font-bold uppercase font-mono tracking-wider text-[8px] block mb-1">Estimated Rates & Dynamic Tariff Footnote</span>
                All presented rates are estimated and subject to change over time. The final binding cost will be declared after a direct consultation call or notified formally through email. Virtual Office address and utility acquisition tariffs change dynamically depending on selected cities and location-specific demands; the listed rate represents the minimum starting price to be expected.
              </div>
            </div>

            {/* Total Block */}
            <div className="border-t border-brand-border pt-6 mt-6 space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase">Total Estimated Cost</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-light text-brand-gold font-serif italic block">
                    ₹{pricing.total}*
                  </span>
                  <span className="text-[8px] text-brand-text-muted font-mono block tracking-wider uppercase mt-1">
                    *Estimated - Subject to call/email confirmation
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Pre-fill company name if desired and scroll to onboarding form
                  const nameInput = document.querySelector('input[type="text"]');
                  if (nameInput) {
                    nameInput.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-[10px] py-3 rounded transition-all cursor-pointer font-bold duration-300 shadow-lg shadow-brand-gold/5"
              >
                Onboard With This Budget <ArrowRight className="w-3 h-3 inline-block ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Service Catalog & Benefits Directory */}
      <div id="service-catalog-section" className="border-t border-brand-border/80 pt-16 mt-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded font-mono uppercase tracking-widest border border-brand-gold/15">
            Registry Master Directory
          </div>
          <h2 className="text-2xl sm:text-3.5xl font-light text-brand-text tracking-wide serif">
            Detailed Service Catalog & <br className="hidden sm:inline" />
            <span className="text-brand-gold italic font-normal text-3xl sm:text-4xl">Client Advantage Spectrum</span>
          </h2>
          <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-2xl mx-auto">
            Review detailed service breakdowns, regulatory scopes, and direct enterprise protection guidelines of our elite registry desks.
          </p>
        </div>

        {/* Detailed Catalog Navigation */}
        <div className="flex justify-center">
          <div className="bg-brand-bg-lighter border border-brand-border p-1 rounded-lg inline-flex items-center gap-2 flex-wrap justify-center">
            {[
              { id: "primary", label: "Primary Corporate", icon: Award },
              { id: "alternatives", label: "Alternate Entity", icon: Building2 },
              { id: "compliance", label: "Statutory Compliance", icon: ShieldCheck },
              { id: "consultancy", label: "Enterprise & Growth", icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = catalogCategory === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setCatalogCategory(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-brand-gold text-black font-bold shadow-md"
                      : "text-brand-text-muted hover:text-brand-text hover:bg-brand-bg"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Detailed Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {detailedCatalogData[catalogCategory].map((service, index) => (
            <div
              key={index}
              className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 hover:border-brand-gold/30 transition-all duration-305 flex flex-col justify-between hover:shadow-xl hover:shadow-brand-gold/5 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-brand-border/50 pb-3">
                  <h3 className="text-sm font-medium text-brand-text tracking-wide leading-tight group-hover:text-brand-gold transition-colors font-serif">
                    {service.title}
                  </h3>
                  <span className="text-[9px] font-mono uppercase bg-brand-gold/15 text-brand-gold border border-brand-gold/15 px-2 py-0.5 rounded shrink-0">
                    {service.timeline}
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <h4 className="text-[9px] font-medium text-[#9E896A] uppercase tracking-widest font-mono">
                      Scope & Entailment
                    </h4>
                    <p className="text-xs text-brand-text-muted font-sans mt-1.5 leading-relaxed">
                      {service.entails}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-medium text-brand-gold uppercase tracking-widest font-mono">
                      Client Core Advantage
                    </h4>
                    <p className="text-xs text-brand-text/90 font-sans mt-1.5 leading-relaxed">
                      {service.benefits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-brand-border/50 pt-4 mt-6 flex items-center justify-between text-[10px]">
                <span className="text-brand-text-muted font-mono uppercase text-[9px] tracking-wide">Desk Desk • {service.complexity}</span>
                <span 
                  onClick={() => {
                    // Try to match selecting the right item in the main wizard state
                    let correspondingId = "pvt-ltd";
                    if (service.title.includes("Limited Liability Partnership") || service.title.includes("LLP")) {
                      correspondingId = "llp";
                    } else if (service.title.includes("One Person")) {
                      correspondingId = "opc";
                    } else if (service.title.includes("Partnership")) {
                      correspondingId = "partnership";
                    }
                    setSelectedEntityId(correspondingId);
                    
                    // Smoothly scroll back up to dynamic onboarding configurator
                    const formHeading = document.querySelector("h1");
                    if (formHeading) {
                      formHeading.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-brand-gold hover:underline font-mono uppercase tracking-wider cursor-pointer flex items-center gap-1 font-bold"
                >
                  Configure Desk <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
