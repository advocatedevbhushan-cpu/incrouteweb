import React, { useState } from "react";
import { motion } from "motion/react";
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
  Scale
} from "lucide-react";

interface EntityType {
  id: string;
  name: string;
  icon: React.ReactNode;
  pricing: string;
  timeline: string;
  minCapital: string;
  liability: string;
  minMembers: number;
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
    pricing: "₹999*",
    timeline: "7-10 days",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    minMembers: 2,
    taxRate: "30%",
    bestFor: "Startups & Growing Businesses",
    advantages: [
      "Separate legal entity status protection",
      "Venture capital & equity funding eligibility",
      "Perpetual succession structure",
      "Startup India & DPIIT recognition advantages",
    ],
    considerations: ["Compliance-heavy reporting requirements", "Statutory audit mandatory every year"],
  },
  {
    id: "llp",
    name: "Limited Liability Partnership",
    icon: <Users className="w-6 h-6" />,
    pricing: "₹1,499*",
    timeline: "10-15 days",
    minCapital: "None",
    liability: "Limited",
    minMembers: 2,
    taxRate: "25%",
    bestFor: "Professionals & Service Providers",
    advantages: [
      "Lower tax rate with remuneration benefits",
      "Flexible internal management structure",
      "No mandatory minimum capital requirement",
      "No dividend distribution tax liabilities",
    ],
    considerations: ["Cannot raise VC/institutional funding", "Less appealing to corporate investors"],
  },
  {
    id: "nidhi",
    name: "Nidhi Company",
    icon: <DollarSign className="w-6 h-6" />,
    pricing: "₹2,999*",
    timeline: "15-20 days",
    minCapital: "₹5 Lakh",
    liability: "Limited",
    minMembers: 3,
    taxRate: "28%",
    bestFor: "Savings & Credit Groups",
    advantages: [
      "Specialized financial mutual benefit structure",
      "Highly secure internal member lending framework",
      "High statutory credibility and trust",
    ],
    considerations: ["Strictly restricted business scope rules", "Higher compliance checks"],
  },
  {
    id: "opc",
    name: "One Person Company",
    icon: <Shield className="w-6 h-6" />,
    pricing: "₹1,299*",
    timeline: "7-10 days",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    minMembers: 1,
    taxRate: "30%",
    bestFor: "Solo Entrepreneurs",
    advantages: [
      "100% single promoter control",
      "Complete separate legal entity protection",
      "Easy conversion to multi-director Pvt Ltd",
      "Corporate brand credibility and compliance",
    ],
    considerations: ["Cannot invite external shareholders", "Growth threshold conversion caps"],
  },
];

export default function EntityComparison({ entities = defaultEntities }: EntityComparisonProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>("pvt-ltd");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<"capital" | "timeline" | "tax" | null>(null);

  const sortedEntities = [...entities].sort((a, b) => {
    if (!filterCriteria) return 0;
    if (filterCriteria === "capital") {
      const aVal = a.minCapital.includes("Lakh") ? 100000 : 0;
      const bVal = b.minCapital.includes("Lakh") ? 100000 : 0;
      return aVal - bVal;
    }
    return 0;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Entity Intelligence
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Find Your Perfect <span className="text-brand-gold italic font-normal font-serif">Entity Structure.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Compare statutory entity types side-by-side to understand exact capital, cost, timeline, and liability margins.
        </p>
      </div>

      {/* Filter Button */}
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-bg-lighter border border-brand-border rounded-xl hover:border-brand-gold/50 text-xs text-brand-text font-semibold transition-all cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-brand-gold" />
          Sort by {filterCriteria ? filterCriteria : "..."}
        </button>
        {filterCriteria && (
          <button
            onClick={() => setFilterCriteria(null)}
            className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl hover:bg-red-950/40 text-red-400 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Filter Options */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2 flex-wrap"
        >
          {(["capital", "timeline", "tax"] as const).map((filter) => (
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
              {filter === "tax" && "📊 Tax Rate"}
            </button>
          ))}
        </motion.div>
      )}

      {/* Entity Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto text-left"
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
                {/* Header with Icon */}
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${isSelected ? "bg-brand-gold text-black border-brand-gold" : "bg-brand-bg border-brand-border text-brand-gold"}`}>
                    {entity.icon}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-brand-gold/15 p-1 rounded-full border border-brand-gold/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                    </motion.div>
                  )}
                </div>

                {/* Entity Name */}
                <h3 className="text-base font-bold text-brand-text font-sans">{entity.name}</h3>

                {/* Key Metrics */}
                <div className="space-y-2 text-[11px] font-mono border-t border-brand-border/60 pt-3">
                  <div className="flex items-center justify-between text-brand-text-muted">
                    <span>Setup Cost:</span>
                    <span className="font-bold text-brand-gold">{entity.pricing}</span>
                  </div>
                  <div className="flex items-center justify-between text-brand-text-muted">
                    <span>Timeline:</span>
                    <span className="font-bold text-brand-text">{entity.timeline}</span>
                  </div>
                  <div className="flex items-center justify-between text-brand-text-muted">
                    <span>Tax Rate:</span>
                    <span className="font-bold text-brand-gold">{entity.taxRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-brand-text-muted">
                    <span>Min Members:</span>
                    <span className="font-bold text-brand-text">{entity.minMembers}</span>
                  </div>
                </div>

                {/* Best For */}
                <p className="text-[10px] text-brand-text-muted italic bg-brand-bg border border-brand-border/60 p-2 rounded-lg font-sans">
                  {entity.bestFor}
                </p>
              </div>

              {/* Select Button */}
              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-mono uppercase tracking-widest text-[9px] mt-4 font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-gold text-black shadow"
                    : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-gold/45"
                }`}
              >
                {isSelected ? "Selected ✓" : "Compare"}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Detailed Comparison Panel */}
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
                    <h3 className="text-xl font-light text-brand-text serif">{entity.name} Framework</h3>
                    <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest">Best For: {entity.bestFor}</p>
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

                {/* Full Specs */}
                <div className="mt-6 pt-6 border-t border-brand-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Setup Cost", value: entity.pricing },
                    { label: "Timeline", value: entity.timeline },
                    { label: "Min Capital", value: entity.minCapital },
                    { label: "Liability Shield", value: entity.liability },
                  ].map((spec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="text-center p-3.5 bg-brand-bg border border-brand-border rounded-xl space-y-1"
                    >
                      <p className="text-[9px] text-brand-text-muted uppercase tracking-wider font-mono">{spec.label}</p>
                      <p className="text-xs font-bold text-brand-gold">{spec.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
