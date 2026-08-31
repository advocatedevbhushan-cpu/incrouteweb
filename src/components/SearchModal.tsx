import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  ArrowRight, Building2, Calculator, CheckCircle2, ChevronRight, Clock, 
  FileText, Landmark, Search, ShieldCheck, Sparkles, X, Key, Lock, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { servicesRegistry } from "../data/servicesRegistry";

interface SearchServiceItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  tat?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  "private-corporate": "Company Registration",
  "alternative-entity": "Partnerships & Trusts",
  "enterprise-growth": "Enterprise & Growth",
  "compliance": "Tax & Compliance",
  "legal-ip": "Trademark & IP",
  "books": "Accounting Software",
  "tools": "AI Tools & Calculators"
};

const EXTRA_TOOL_SERVICES: SearchServiceItem[] = [
  { 
    id: "books", 
    title: "INCroute Books - Cloud Accounting", 
    category: "books", 
    categoryLabel: "Software", 
    description: "Full-fledged Zoho Books alternative with double-entry ledgers, banking & GST filing.", 
    tat: "Instant App", 
    badge: "SOFTWARE", 
    icon: Calculator,
    keywords: ["books", "accounting", "invoicing", "ledger", "zoho", "tally", "gst return"]
  },
  { 
    id: "name-checker", 
    title: "AI Brand Name Feasibility Checker", 
    category: "tools", 
    categoryLabel: "AI Tools", 
    description: "Instant MCA registry and Trademark Class 1-45 clearance score checker.", 
    tat: "Instant", 
    badge: "FREE TOOL", 
    icon: Sparkles,
    keywords: ["name checker", "trademark search", "mca name", "brand search", "company name"]
  },
  { 
    id: "compliance-health", 
    title: "Enterprise Compliance Health Score & Planner", 
    category: "tools", 
    categoryLabel: "Statutory Tools", 
    description: "Diagnostic compliance audit score, statutory calendar, and penalty calculator.", 
    tat: "Instant", 
    badge: "HEALTH TOOL", 
    icon: Activity,
    keywords: ["compliance health", "health score", "calendar", "due dates", "penalty calculator", "audit"]
  },
  { 
    id: "gst-calculator", 
    title: "GST Late Fee & Section 50 Interest Calculator", 
    category: "tools", 
    categoryLabel: "Tax Tools", 
    description: "Calculate GSTR-3B / GSTR-1 delay late fees (Sec 47) and net cash interest (Sec 50).", 
    tat: "Instant", 
    badge: "TAX TOOL", 
    icon: Calculator,
    keywords: ["gst calculator", "sec 50", "late fee", "interest", "gstr-3b", "gstr-1", "tax penalty"]
  }
];

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Unified list of all searchable services from registry + tools
  const allServices = useMemo<SearchServiceItem[]>(() => {
    const registryItems: SearchServiceItem[] = servicesRegistry.map((item) => {
      let icon = Building2;
      if (item.id.includes("dsc") || item.id.includes("signature")) icon = Key;
      else if (item.category === "compliance") icon = FileText;
      else if (item.category === "legal-ip") icon = ShieldCheck;
      else if (item.category === "enterprise-growth") icon = Sparkles;
      else if (item.id.includes("gst") || item.id.includes("tax") || item.id.includes("itr")) icon = Calculator;

      return {
        id: item.id,
        title: item.name,
        category: item.category,
        categoryLabel: CATEGORY_LABEL_MAP[item.category] || "Corporate Service",
        description: item.tagline || item.description,
        tat: item.timeline || "Express",
        badge: item.badge || (item.popular ? "POPULAR" : undefined),
        icon,
        keywords: [
          item.id,
          item.name.toLowerCase(),
          item.id.replace(/-/g, " "),
          ...(item.id.includes("dsc") ? ["dsc", "digital signature", "class 3", "usb token", "crypto token", "cca", "mca signing", "epass", "paperless dsc", "video kyc"] : []),
          ...(item.features ? item.features.map(f => f.toLowerCase()) : [])
        ]
      };
    });

    return [...registryItems, ...EXTRA_TOOL_SERVICES];
  }, []);

  // Scroll Lock & Lenis Suppression
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-lenis-prevent", "true");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-lenis-prevent");
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-lenis-prevent");
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.toLowerCase().trim();
  const filteredServices = allServices.filter((item) => {
    if (!q) return true;
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchDesc = item.description.toLowerCase().includes(q);
    const matchCategory = item.categoryLabel.toLowerCase().includes(q);
    const matchId = item.id.toLowerCase().includes(q);
    const matchKeywords = item.keywords?.some((kw) => kw.includes(q));

    return matchTitle || matchDesc || matchCategory || matchId || matchKeywords;
  });

  const handleSelectService = (item: SearchServiceItem) => {
    onClose();
    if (item.id === "books") {
      navigate("/books");
    } else if (item.id === "name-checker") {
      navigate("/tools/name-checker/");
    } else if (item.id === "compliance-health" || item.id === "gst-calculator") {
      navigate("/compliance");
    } else {
      navigate(`/services/${item.category}/${item.id}/`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      <div 
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/65 backdrop-blur-md pointer-events-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl glass-surface-elevated rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] overflow-hidden flex flex-col max-h-[80vh] text-left backdrop-blur-2xl"
        >
          {/* Input Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center gap-3 bg-[var(--bg-surface-alt)]/60">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search 40+ statutory services, DSC, GST, trademarks, or AI tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm sm:text-base font-medium font-sans"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--border-subtle)] rounded-lg">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="p-3 overflow-y-auto flex-1 space-y-1.5 text-left divide-y divide-[var(--border-subtle)]"
          >
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Search className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3 opacity-60" />
                <p className="text-sm font-bold text-[var(--text-primary)]">No matching services found</p>
                <p className="text-xs text-[var(--text-secondary)]">Try searching for "DSC", "Pvt Ltd", "GST", "Trademark", or "FSSAI".</p>
              </div>
            ) : (
              filteredServices.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectService(item)}
                    className="w-full pt-2 first:pt-0 p-3 rounded-2xl hover:bg-[var(--accent-soft)]/50 transition-all flex items-start gap-3.5 group cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-alt)] group-hover:bg-[var(--accent)] group-hover:text-white text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] transition-all shadow-xs">
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-[var(--accent-soft)] text-[var(--accent)] rounded border border-[var(--border-subtle)]">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono ml-auto hidden sm:inline-block">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>

                      {item.tat && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[var(--text-tertiary)] font-mono">
                          <Clock className="w-3 h-3 text-[var(--accent)]" />
                          <span>TAT: {item.tat}</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 sm:px-5 sm:py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/40 flex items-center justify-between text-[11px] text-[var(--text-tertiary)] font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              Showing <strong>{filteredServices.length}</strong> corporate services
            </span>
            <span className="hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded text-[10px] text-[var(--text-primary)]">ESC</kbd> to exit
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
