import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, Sparkles, CheckCircle2, Clock, ArrowRight, FileText, 
  Building2, ShieldCheck, Zap, ChevronRight, Layers, HelpCircle
} from "lucide-react";
import { servicesRegistry, ServiceItem } from "../data/servicesRegistry";

interface ServicesHubPageProps {
  setActiveTab?: (tab: string) => void;
}

export default function ServicesHubPage({ setActiveTab }: ServicesHubPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "express" | "popular">("all");

  const categories = [
    { id: "all", label: "All Services" },
    { id: "private-corporate", label: "Company Incorporation" },
    { id: "compliance", label: "GST & Tax Compliance" },
    { id: "legal-ip", label: "Trademark & IP Protection" },
    { id: "alternative-entity", label: "Partnerships & NGOs" },
    { id: "enterprise-growth", label: "Enterprise Growth & CFO" },
  ];

  const filteredServices = useMemo(() => {
    return servicesRegistry.filter((item) => {
      // Category Filter
      const matchCategory =
        selectedCategory === "all" ||
        item.category === selectedCategory ||
        (selectedCategory === "private-corporate" && (item.category === "private-corporate" || item.category === "alternative-entity"));

      // Speed / Popular Filter
      const matchFilter =
        selectedFilter === "all" ||
        (selectedFilter === "popular" && item.popular) ||
        (selectedFilter === "express" && (item.timeline.includes("24") || item.timeline.includes("48") || item.timeline.includes("3–5") || item.timeline.includes("1–3")));

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.tagline && item.tagline.toLowerCase().includes(q));

      return matchCategory && matchFilter && matchSearch;
    });
  }, [selectedCategory, selectedFilter, searchQuery]);

  const handleCardClick = (item: ServiceItem) => {
    const cat = item.category || "general";
    navigate(`/services/${cat}/${item.id}/`);
    if (setActiveTab) {
      setActiveTab("service-detail");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] pb-20 space-y-12 font-sans text-left">
      
      {/* ─── Hero Header & Search Section ─── */}
      <section className="bg-gradient-to-b from-[var(--bg-surface)] via-[var(--bg-surface-alt)] to-[var(--bg-page)] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[var(--gradient-end)]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>40+ Verified MCA, GST & IP Services Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] font-display leading-tight">
            Corporate & Legal Services Hub
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">
            Search, filter, and explore dedicated statutory registration & compliance services. Every service is backed by experienced CAs and CSs.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto relative pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g., GST Registration, Private Limited, Trademark, FSSAI...)"
                className="w-full pl-12 pr-10 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none shadow-xl transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-[var(--bg-surface-alt)] px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Quick Stats Pill */}
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-3 px-1 font-mono">
              <span>Showing <strong>{filteredServices.length}</strong> of {servicesRegistry.length} services</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Online E-Filing</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Main Services Filter & Grid Container ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-subtle)]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-display ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] shadow-md shadow-[var(--accent)]/20 scale-[1.02]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Speed & Popular Filter Toggles */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1 font-mono">
              <Filter className="w-3.5 h-3.5 text-[var(--accent)]" /> Quick Filter:
            </span>
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === "all"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedFilter("popular")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFilter === "popular"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Most Popular
            </button>
            <button
              onClick={() => setSelectedFilter("express")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFilter === "express"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" /> Fast Express (&lt;48h)
            </button>
          </div>
        </div>

        {/* Service Cards Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-5 group relative"
              >
                {item.popular && (
                  <span className="absolute -top-3 right-6 px-2.5 py-0.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] text-[9px] font-extrabold rounded-full uppercase tracking-wider shadow-sm font-mono">
                    POPULAR
                  </span>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                      {item.category.replace("-", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {item.timeline}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-display">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 font-sans">
                    {item.description}
                  </p>

                  {/* Highlights */}
                  {item.keyAdvantages && item.keyAdvantages.length > 0 && (
                    <ul className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                      {item.keyAdvantages.slice(0, 2).map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 font-sans">{adv}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[var(--accent)]" /> {item.documents ? item.documents.length : 4} Docs Required
                  </span>
                  <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-display">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] space-y-4">
            <HelpCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">No services matched your search</h3>
            <p className="text-xs text-[var(--text-secondary)]">Try searching for keywords like "GST", "Trademark", "Pvt Ltd", or "FSSAI".</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedFilter("all"); }}
              className="px-4 py-2 bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)] text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* ─── Decision Helper Banner ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[var(--bg-surface-alt)] via-[var(--bg-surface)] to-[var(--bg-surface-alt)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-xl">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">AI Business Decision Helper</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">Undecided Which Entity Structure to Choose?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Compare Private Limited, LLP, OPC, and Proprietorship side-by-side or check brand name availability instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => { navigate("/tools/entity-comparison/"); if (setActiveTab) setActiveTab("comparison"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-5 py-3 bg-[var(--bg-surface-alt)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-bold rounded-xl transition-all cursor-pointer font-display"
            >
              Compare Entities
            </button>
            <button
              onClick={() => { navigate("/tools/name-checker/"); if (setActiveTab) setActiveTab("name-checker"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-5 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer font-display"
            >
              Check Company Name
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
