import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Sparkles,
  Scale,
  Briefcase,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Info
} from "lucide-react";

interface EntityType {
  id: string;
  name: string;
  icon: React.ReactNode;
  timeline: string;
  minCapital: string;
  liability: string;
  minMembers: string;
  taxRate: string;
  bestFor: string;
  advantages: string[];
  considerations: string[];
}

interface EntityComparisonProps {
  entities?: EntityType[];
}

const defaultEntities: EntityType[] = [
  {
    id: "pvt-ltd",
    name: "Private Limited",
    icon: <Building2 className="w-6 h-6" />,
    timeline: "7-10 days",
    minCapital: "None (₹1L recommended)",
    liability: "Limited",
    minMembers: "2 Directors",
    taxRate: "22% - 25% (plus surcharge)",
    bestFor: "Startups & Growing Businesses looking to raise venture capital or equity funding",
    advantages: [
      "Separate legal entity status protecting personal assets",
      "Venture capital & equity funding eligibility (shares issuance)",
      "Perpetual succession structure (independent of owners/directors)",
      "High credibility among banks, customers, and vendors",
      "Eligible for Startup India & DPIIT recognition tax exemptions",
    ],
    considerations: [
      "Heavy annual compliance reporting requirements",
      "Mandatory statutory audit by a Chartered Accountant every year",
      "Higher setup and closure compliance requirements",
    ],
  },
  {
    id: "llp",
    name: "Limited Liability Partnership",
    icon: <Users className="w-6 h-6" />,
    timeline: "10-15 days",
    minCapital: "None",
    liability: "Limited",
    minMembers: "2 Partners",
    taxRate: "30% (remuneration allowed)",
    bestFor: "Service sectors, professional firms, and partnerships",
    advantages: [
      "Limited liability protection for partners without corporate complexity",
      "Flexible internal partnership agreement management",
      "No mandatory minimum capital requirement or auditing up to ₹40L turnover",
      "No Dividend Distribution Tax (DDT) on profits distributed to partners",
    ],
    considerations: [
      "Cannot raise institutional venture capital or issue shares",
      "Compounding daily late fees (₹100/day) on pending filings",
      "Requires minimum of two partners at all times",
    ],
  },
  {
    id: "opc",
    name: "One Person Company",
    icon: <Shield className="w-6 h-6" />,
    timeline: "7-10 days",
    minCapital: "None (₹1L recommended)",
    liability: "Limited",
    minMembers: "1 Member",
    taxRate: "22% - 25%",
    bestFor: "Solo entrepreneurs wanting corporate credibility",
    advantages: [
      "100% control with single owner (no co-founders required)",
      "Complete separate legal entity status protection",
      "Easier compliance than a full-scale Private Limited Company",
      "Seamless conversion to Pvt Ltd as scale grows",
    ],
    considerations: [
      "Cannot invite external shareholders or raise public equity",
      "Must appoint a nominee director during registration",
      "Mandatory conversion to Pvt Ltd if turnover exceeds ₹2 Crore",
    ],
  },
  {
    id: "nidhi",
    name: "Nidhi Company",
    icon: <DollarSign className="w-6 h-6" />,
    timeline: "15-20 days",
    minCapital: "₹10 Lakhs",
    liability: "Limited",
    minMembers: "7 Members",
    taxRate: "25% - 30%",
    bestFor: "Savings groups, credit societies, and mutual benefit funds",
    advantages: [
      "Specialized financial mutual benefit structure without RBI license",
      "Highly secure internal member lending framework (gold/property loans)",
      "Encourages savings habits and mutual thrift among members",
      "Lower registration threshold compared to NBFCs",
    ],
    considerations: [
      "Strictly restricted to lending/borrowing from registered members only",
      "Cannot advertise to public or conduct chit fund business",
      "Requires minimum of 200 members within 1 year of setup",
    ],
  },
  {
    id: "public-ltd",
    name: "Public Limited",
    icon: <Scale className="w-6 h-6" />,
    timeline: "20-25 days",
    minCapital: "₹5 Lakhs",
    liability: "Limited",
    minMembers: "7 Members",
    taxRate: "25% - 30%",
    bestFor: "Large scale enterprises aiming for public listing (IPO)",
    advantages: [
      "Can raise capital from public by issuing shares/debentures",
      "No restriction on maximum number of shareholders",
      "Shares are freely transferable on stock exchanges",
      "High stature and strong institutional reputation",
    ],
    considerations: [
      "Most rigorous and complex compliance framework",
      "Mandatory publication of financial results and board meetings",
      "High administrative, auditing, and maintenance costs",
    ],
  },
  {
    id: "partnership",
    name: "Partnership Firm",
    icon: <Briefcase className="w-6 h-6" />,
    timeline: "3-5 days",
    minCapital: "None",
    liability: "Unlimited",
    minMembers: "2 Partners",
    taxRate: "30%",
    bestFor: "Small local shops, trading, and low-risk partnerships",
    advantages: [
      "Extremely quick setup with basic partnership deed registration",
      "Minimal annual compliance filings and low operating costs",
      "Profits can be shared directly with partners on slab rates",
      "Easy dissolution when business needs to be closed",
    ],
    considerations: [
      "Unlimited personal liability for all business debts and partner acts",
      "No legal existence separate from the partners",
      "Cannot raise VC funding or easily obtain bank loans",
    ],
  },
  {
    id: "proprietorship",
    name: "Sole Proprietorship",
    icon: <Briefcase className="w-6 h-6" />,
    timeline: "2-3 days",
    minCapital: "None",
    liability: "Unlimited",
    minMembers: "1 Owner",
    taxRate: "Individual Slab Rate",
    bestFor: "Freelancers, single traders, and micro-consultancies",
    advantages: [
      "Absolute control over operations, profits, and decisions",
      "No corporate tax filings (filed under proprietor's personal PAN)",
      "Minimal compliance and zero statutory auditing for small turnovers",
      "Simplest and cheapest entity structure to initiate and exit",
    ],
    considerations: [
      "Unlimited personal liability—personal assets are at risk",
      "Entirely dependent on the life/capability of the single owner",
      "Cannot raise external equity capital",
    ],
  }
];

export default function EntityComparison({ entities = defaultEntities }: EntityComparisonProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "matrix" | "wizard">("cards");
  const [selectedEntity, setSelectedEntity] = useState<string | null>("pvt-ltd");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<"capital" | "timeline" | null>(null);

  // Wizard States
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const [wizardRecommendation, setWizardRecommendation] = useState<string | null>(null);

  const handleWizardAnswer = (key: string, value: string) => {
    const nextAnswers = { ...wizardAnswers, [key]: value };
    setWizardAnswers(nextAnswers);

    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    } else {
      // Calculate Recommendation
      let rec = "pvt-ltd";
      if (nextAnswers.funding === "mutual") {
        rec = "nidhi";
      } else if (nextAnswers.funding === "vc") {
        rec = nextAnswers.founders === "1" ? "opc" : "pvt-ltd";
      } else {
        // Bootstrap
        if (nextAnswers.founders === "1") {
          rec = nextAnswers.focus === "low" ? "proprietorship" : "opc";
        } else {
          rec = nextAnswers.focus === "low" ? "partnership" : "llp";
        }
      }
      setWizardRecommendation(rec);
      setWizardStep(3); // Result step
    }
  };

  const resetWizard = () => {
    setWizardAnswers({});
    setWizardStep(0);
    setWizardRecommendation(null);
  };

  const sortedEntities = [...entities].sort((a, b) => {
    if (!filterCriteria) return 0;
    if (filterCriteria === "timeline") {
      const getVal = (str: string) => Number(str.split("-")[0].replace(/[^0-9]/g, "")) || 0;
      return getVal(a.timeline) - getVal(b.timeline);
    }
    if (filterCriteria === "capital") {
      const getVal = (str: string) => {
        if (str.toLowerCase().includes("lakh")) return 100000;
        return 0;
      };
      return getVal(a.minCapital) - getVal(b.minCapital);
    }
    return 0;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Entity Intelligence Tool
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Find Your Perfect <span className="text-brand-gold italic font-normal font-serif">Entity Structure.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Compare statutory entity types side-by-side to understand exact capital, timelines, and liability shields.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center max-w-md mx-auto bg-brand-bg-lighter p-1 border border-brand-border rounded-xl">
        {(["cards", "matrix", "wizard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-wider rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-brand-gold text-black shadow-md font-extrabold"
                : "text-brand-text-muted hover:text-brand-text"
            }`}
          >
            {tab === "cards" && "🗂️ Cards"}
            {tab === "matrix" && "📊 Matrix"}
            {tab === "wizard" && "✨ Wizard"}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview Cards */}
      {activeTab === "cards" && (
        <div className="space-y-8">
          {/* Filter Bar */}
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-bg-lighter border border-brand-border rounded-xl hover:border-brand-gold/50 text-xs text-brand-text font-semibold transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-brand-gold" />
              Sort by: {filterCriteria ? (filterCriteria === "timeline" ? "Fastest Setup" : "Min. Capital") : "None"}
            </button>
            {filterCriteria && (
              <button
                onClick={() => setFilterCriteria(null)}
                className="p-2 bg-red-950/20 border border-red-500/20 rounded-xl hover:bg-red-950/40 text-red-400 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2 flex-wrap"
            >
              {(["timeline", "capital"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setFilterCriteria(filterCriteria === filter ? null : filter);
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    filterCriteria === filter
                      ? "bg-brand-gold text-black border-brand-gold"
                      : "bg-brand-bg-lighter border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-gold/45"
                  }`}
                >
                  {filter === "capital" && "💰 Capital Required"}
                  {filter === "timeline" && "⏱️ Fastest Setup"}
                </button>
              ))}
            </motion.div>
          )}

          {/* Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto text-left"
          >
            {sortedEntities.map((entity) => {
              const isSelected = selectedEntity === entity.id;
              return (
                <motion.div
                  key={entity.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, boxShadow: "0 15px 35px -12px rgba(197, 168, 128, 0.12)" }}
                  onClick={() => setSelectedEntity(entity.id)}
                  className={`cursor-pointer rounded-2xl border-2 transition-all p-5 flex flex-col justify-between h-full relative ${
                    isSelected
                      ? "bg-brand-gold/10 border-brand-gold shadow-lg shadow-brand-gold/5"
                      : "bg-brand-bg-lighter border-brand-border hover:border-brand-gold/30"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 blur-2xl rounded-full" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${isSelected ? "bg-brand-gold text-black border-brand-gold" : "bg-brand-bg border-brand-border text-brand-gold"}`}>
                        {entity.icon}
                      </div>
                      {isSelected && (
                        <div className="bg-brand-gold/15 p-1 rounded-full border border-brand-gold/30">
                          <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-brand-text font-sans">{entity.name}</h3>

                    <div className="space-y-2 text-[11px] font-mono border-t border-brand-border/60 pt-3">
                      <div className="flex items-center justify-between text-brand-text-muted">
                        <span>Timeline:</span>
                        <span className="font-bold text-brand-text">{entity.timeline}</span>
                      </div>
                      <div className="flex items-center justify-between text-brand-text-muted">
                        <span>Tax Rate:</span>
                        <span className="font-bold text-brand-gold">{entity.taxRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-brand-text-muted">
                        <span>Members/Owners:</span>
                        <span className="font-bold text-brand-text">{entity.minMembers}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-brand-text-muted leading-relaxed italic bg-brand-bg border border-brand-border/60 p-2 rounded-lg font-sans">
                      {entity.bestFor}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl font-mono uppercase tracking-widest text-[9px] mt-4 font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-gold text-black shadow"
                        : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-gold/45"
                    }`}
                  >
                    {isSelected ? "Selected ✓" : "View Framework"}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Detailed Info Panel */}
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left max-w-5xl mx-auto"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
              
              {(() => {
                const entity = entities.find((e) => e.id === selectedEntity);
                if (!entity) return null;

                return (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3.5 border-b border-brand-border pb-4">
                      <div className="p-3 rounded-xl bg-brand-gold/15 border border-brand-gold/25 text-brand-gold">
                        {entity.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-light text-brand-text serif">{entity.name} Incorporation Framework</h3>
                        <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest mt-0.5">Best For: {entity.bestFor}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Advantages */}
                      <div className="space-y-3.5">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-text">
                          <CheckCircle2 className="w-4.5 h-4.5 text-brand-gold" />
                          Key Statutory Advantages
                        </h4>
                        <ul className="space-y-2.5">
                          {entity.advantages.map((adv, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex gap-2.5 text-xs text-brand-text-muted font-sans leading-relaxed"
                            >
                              <span className="text-brand-gold font-bold shrink-0">•</span>
                              <span>{adv}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Considerations */}
                      <div className="space-y-3.5">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-text">
                          <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                          Statutory Considerations
                        </h4>
                        <ul className="space-y-2.5">
                          {entity.considerations.map((con, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 + 0.15 }}
                              className="flex gap-2.5 text-xs text-brand-text-muted font-sans leading-relaxed"
                            >
                              <span className="text-amber-500 font-bold shrink-0">!</span>
                              <span>{con}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Specs Footnotes */}
                    <div className="mt-6 pt-6 border-t border-brand-border/60 grid grid-cols-3 gap-4">
                      {[
                        { label: "Incorporation Timeline", value: entity.timeline },
                        { label: "Minimum Capital", value: entity.minCapital },
                        { label: "Liability Shield", value: entity.liability },
                      ].map((spec, i) => (
                        <div
                          key={i}
                          className="text-center p-3 bg-brand-bg border border-brand-border rounded-xl space-y-1"
                        >
                          <p className="text-[9px] text-brand-text-muted uppercase tracking-wider font-mono">{spec.label}</p>
                          <p className="text-xs font-bold text-brand-gold">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          <div className="text-center text-[10px] text-brand-text-muted max-w-md mx-auto">
            <Info className="w-3.5 h-3.5 inline mr-1 text-brand-gold" />
            Note: Incorporation stamp duties, government application fees, and statutory registration costs depend on the target state, business sector, and selected capital size.
          </div>
        </div>
      )}

      {/* Tab 2: Comparison Matrix Table */}
      {activeTab === "matrix" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 shadow-2xl max-w-7xl mx-auto overflow-hidden text-left"
        >
          <div className="flex items-center gap-2 border-b border-brand-border pb-4 mb-6">
            <Scale className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-light text-brand-text serif">Structure Side-by-Side Comparison</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-brand-text border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="p-3 text-left font-mono uppercase tracking-wider text-brand-text-muted w-44">Parameter</th>
                  {entities.map((e) => (
                    <th key={e.id} className="p-3 text-left font-semibold text-brand-gold border-l border-brand-border/40">
                      {e.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Timeline</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40">{e.timeline}</td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Min. Capital</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40 font-mono text-[11px]">{e.minCapital}</td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Liability Shield</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${e.liability === "Limited" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {e.liability}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Tax Rate</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40 font-mono text-[11px]">{e.taxRate}</td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Requirement</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40 text-[10px]">{e.minMembers}</td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Venture Capital</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40 text-[11px]">
                      {e.id === "pvt-ltd" && <span className="text-green-400 font-semibold">Perfect Fit</span>}
                      {e.id === "public-ltd" && <span className="text-green-400">Supported</span>}
                      {e.id === "opc" && <span className="text-amber-400">Convertible</span>}
                      {["llp", "nidhi", "partnership", "proprietorship"].includes(e.id) && <span className="text-brand-text-muted">Not Supported</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="p-3 font-semibold text-brand-text-muted">Compliances</td>
                  {entities.map((e) => (
                    <td key={e.id} className="p-3 border-l border-brand-border/40 text-[11px]">
                      {["pvt-ltd", "nidhi"].includes(e.id) && <span className="text-red-400">High (Audit+filings)</span>}
                      {e.id === "public-ltd" && <span className="text-red-500 font-semibold">Very High (AGM/filings)</span>}
                      {["llp", "opc"].includes(e.id) && <span className="text-amber-400">Medium</span>}
                      {["partnership", "proprietorship"].includes(e.id) && <span className="text-green-400 font-semibold">Low</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-[10px] text-brand-text-muted">
            <Info className="w-3.5 h-3.5 inline mr-1 text-brand-gold" />
            Note: Incorporation stamp duties, government application fees, and statutory registration costs depend on the target state, business sector, and selected capital size.
          </div>
        </motion.div>
      )}

      {/* Tab 3: Interactive Recommendation Wizard */}
      {activeTab === "wizard" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
          
          <div className="border-b border-brand-border pb-4 mb-6">
            <Sparkles className="w-5 h-5 text-brand-gold inline mr-2" />
            <h3 className="text-lg font-light text-brand-text serif inline-block">Entity Recommendation Wizard</h3>
            <p className="text-[10px] text-brand-text-muted font-sans mt-1">Answer 3 simple questions to find the most suitable business structure for your goals.</p>
          </div>

          <AnimatePresence mode="wait">
            {wizardStep === 0 && (
              <motion.div
                key="step-founders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-bold">Step 1 of 3</span>
                <h4 className="text-base font-semibold text-brand-text">How many founders or business partners are involved?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleWizardAnswer("founders", "1")}
                    className="p-5 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-2 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">Single Owner (Solo)</div>
                    <div className="text-xs text-brand-text-muted font-sans">1 founder who wants 100% control over decisions and management.</div>
                  </button>
                  <button
                    onClick={() => handleWizardAnswer("founders", "2+")}
                    className="p-5 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-2 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">2 or More Partners</div>
                    <div className="text-xs text-brand-text-muted font-sans">Multiple co-founders pooling resources, roles, or investments.</div>
                  </button>
                </div>
              </motion.div>
            )}

            {wizardStep === 1 && (
              <motion.div
                key="step-funding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-bold">Step 2 of 3</span>
                <h4 className="text-base font-semibold text-brand-text">What are your external funding expectations?</h4>
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <button
                    onClick={() => handleWizardAnswer("funding", "vc")}
                    className="p-4 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-1.5 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">Venture Capital / Seed Funding</div>
                    <div className="text-xs text-brand-text-muted font-sans">We intend to issue equity shares to angel investors, VCs, or incubation programs.</div>
                  </button>
                  <button
                    onClick={() => handleWizardAnswer("funding", "bootstrap")}
                    className="p-4 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-1.5 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">Bootstrap / Self-Financed</div>
                    <div className="text-xs text-brand-text-muted font-sans">We will run on personal funds, partner deposits, revenue, or standard bank business loans.</div>
                  </button>
                  <button
                    onClick={() => handleWizardAnswer("funding", "mutual")}
                    className="p-4 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-1.5 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">Mutual Credit / Savings Group</div>
                    <div className="text-xs text-brand-text-muted font-sans">We wish to run a micro-lending / credit framework strictly inside a closed group of members.</div>
                  </button>
                </div>
              </motion.div>
            )}

            {wizardStep === 2 && (
              <motion.div
                key="step-focus"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-bold">Step 3 of 3</span>
                <h4 className="text-base font-semibold text-brand-text">What is your priority regarding operational compliance?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleWizardAnswer("focus", "low")}
                    className="p-5 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-2 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">Minimal Overhead & Cost</div>
                    <div className="text-xs text-brand-text-muted font-sans">Keep compliance minimal. We want quick setup with very few annual filing duties.</div>
                  </button>
                  <button
                    onClick={() => handleWizardAnswer("focus", "trust")}
                    className="p-5 bg-brand-bg border border-brand-border hover:border-brand-gold/60 rounded-xl transition-all cursor-pointer text-left space-y-2 hover:bg-brand-gold/5"
                  >
                    <div className="font-bold text-brand-text font-sans">High Credibility & Protection</div>
                    <div className="text-xs text-brand-text-muted font-sans">Build trust, secure maximum limited liability protection, and establish corporate stature.</div>
                  </button>
                </div>
              </motion.div>
            )}

            {wizardStep === 3 && wizardRecommendation && (
              <motion.div
                key="step-result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center p-6 bg-brand-gold/10 border border-brand-gold/30 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-bold">Recommended Structure</span>
                  
                  {(() => {
                    const rec = entities.find((e) => e.id === wizardRecommendation);
                    if (!rec) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-3.5 rounded-full bg-brand-gold text-black">
                            {rec.icon}
                          </div>
                        </div>
                        <h4 className="text-2xl font-light text-brand-text serif">{rec.name}</h4>
                        <p className="text-xs text-brand-text-muted font-sans max-w-md mx-auto leading-relaxed">{rec.bestFor}</p>
                        
                        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto pt-2">
                          <div className="p-2.5 bg-brand-bg-lighter rounded-xl border border-brand-border">
                            <div className="text-[8px] text-brand-text-muted font-mono uppercase">Timeline</div>
                            <div className="text-xs font-bold text-brand-text font-mono">{rec.timeline}</div>
                          </div>
                          <div className="p-2.5 bg-brand-bg-lighter rounded-xl border border-brand-border">
                            <div className="text-[8px] text-brand-text-muted font-mono uppercase">Liability</div>
                            <div className="text-xs font-bold text-brand-text font-mono">{rec.liability}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-center pt-2">
                          <button
                            onClick={() => {
                              setSelectedEntity(rec.id);
                              setActiveTab("cards");
                            }}
                            className="px-4 py-2 bg-brand-gold text-black font-mono text-[10px] font-bold uppercase rounded-lg hover:bg-white transition-all cursor-pointer"
                          >
                            Explore Full Specifications
                          </button>
                          <button
                            onClick={resetWizard}
                            className="px-4 py-2 bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text font-mono text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restart
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
