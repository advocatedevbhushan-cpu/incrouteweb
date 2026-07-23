import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Calculator, CheckCircle2, ChevronRight, Clock, FileText, Landmark, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface SearchServiceItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  tat?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_SEARCH_SERVICES: SearchServiceItem[] = [
  // Business Incorporation
  { id: "pvt-ltd", title: "Private Limited Company", category: "private-corporate", categoryLabel: "Company Registration", description: "Most popular structure for startups seeking venture capital and limited liability.", tat: "7 - 10 Days", badge: "POPULAR", icon: Building2 },
  { id: "llp", title: "Limited Liability Partnership (LLP)", category: "alternative-entity", categoryLabel: "Company Registration", description: "Flexible business structure with lower compliance cost for partners.", tat: "8 - 12 Days", icon: ShieldCheck },
  { id: "opc", title: "One Person Company (OPC)", category: "private-corporate", categoryLabel: "Company Registration", description: "Corporate structure for single founders with 100% control.", tat: "7 - 10 Days", icon: Building2 },
  { id: "sole-proprietorship", title: "Sole Proprietorship", category: "alternative-entity", categoryLabel: "Registration", description: "Simplest entity form registered via MSME / GST for micro-businesses.", tat: "2 - 3 Days", icon: FileText },
  { id: "partnership", title: "Partnership Firm", category: "alternative-entity", categoryLabel: "Registration", description: "Deed registration & ROF filing for co-founders.", tat: "4 - 7 Days", icon: FileText },
  { id: "section8", title: "Section 8 NGO Company", category: "private-corporate", categoryLabel: "NGO Registration", description: "Non-profit entity registration under Companies Act 2013.", tat: "12 - 15 Days", icon: ShieldCheck },
  { id: "public-ltd", title: "Public Limited Company", category: "private-corporate", categoryLabel: "Corporate", description: "Entity structure capable of raising capital from public equity.", tat: "15 - 20 Days", icon: Building2 },
  { id: "virtual-office", title: "Virtual Office Address", category: "enterprise-growth", categoryLabel: "Growth Tools", description: "GST and ROC compliant premium business addresses in top metro cities.", tat: "Instant", badge: "FEATURED", icon: Sparkles },

  // GST & Tax Compliances
  { id: "gst-tax", title: "GST Registration", category: "compliance", categoryLabel: "Tax & GST", description: "New GSTIN allotment for regular, composition, and SEZ units.", tat: "3 - 5 Days", badge: "POPULAR", icon: FileText },
  { id: "gst-return-filing", title: "GST Return Filing (GSTR-1 & GSTR-3B)", category: "compliance", categoryLabel: "Tax & GST", description: "Monthly & quarterly statutory GST returns filing with automated ITC matching.", tat: "Monthly", icon: Calculator },
  { id: "gstr9-annual-return", title: "GSTR-9 Annual Return", category: "compliance", categoryLabel: "Tax & GST", description: "Yearly GST reconciliation and GSTR-9/9C statutory audit filing.", tat: "Annual", icon: Landmark },
  { id: "income-tax-efiling", title: "Income Tax E-Filing (ITR)", category: "compliance", categoryLabel: "Income Tax", description: "ITR-1 to ITR-7 filing for individuals, firms, and companies.", tat: "2 - 4 Days", icon: Landmark },
  { id: "annual-compliance", title: "ROC Annual Compliance (AOC-4 & MGT-7)", category: "compliance", categoryLabel: "ROC Filings", description: "Mandatory corporate secretarial filing with Registrar of Companies.", tat: "Annual", icon: ShieldCheck },

  // IP & Trademarks
  { id: "trademark-registration", title: "Trademark Registration", category: "legal-ip", categoryLabel: "Trademark & IP", description: "Protect your brand name, logo, and slogan under TM Class 1-45.", tat: "1 Day Filing", badge: "ESSENTIAL", icon: ShieldCheck },
  { id: "name-checker", title: "AI Brand Name Feasibility", category: "tools", categoryLabel: "AI Tools", description: "Instant MCA and TM database clearance score checker.", tat: "Instant", badge: "FREE TOOL", icon: Sparkles },
  { id: "trademark-objection", title: "Trademark Objection Reply", category: "legal-ip", categoryLabel: "Trademark & IP", description: "Legal reply drafting by IP attorneys for TM examination reports.", tat: "3 - 5 Days", icon: FileText },

  // Licenses & Regulatory
  { id: "fssai-registration", title: "FSSAI Food License", category: "compliance", categoryLabel: "Licenses", description: "Basic, State, and Central FSSAI license for food businesses.", tat: "5 - 10 Days", icon: CheckCircle2 },
  { id: "import-export-code", title: "Import Export Code (IEC)", category: "compliance", categoryLabel: "Licenses", description: "10-digit DGFT code for cross-border trade & international business.", tat: "1 - 2 Days", icon: Clock },
  { id: "msme-registration", title: "MSME / Udyam Certificate", category: "compliance", categoryLabel: "Licenses", description: "Government MSME registration for collateral-free loans & subsidies.", tat: "Same Day", icon: ShieldCheck },

  // Cloud Software
  { id: "books", title: "INCroute Books - Cloud Accounting", category: "books", categoryLabel: "Software", description: "Full-fledged Zoho Books alternative with double-entry ledgers, banking & GST filing.", tat: "Instant App", badge: "SOFTWARE", icon: Calculator },
];

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // Open trigger handled externally if passed
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filteredServices = ALL_SEARCH_SERVICES.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectService = (item: SearchServiceItem) => {
    onClose();
    if (item.id === "books") {
      navigate("/books");
    } else if (item.id === "name-checker") {
      navigate("/tools/name-checker/");
    } else {
      navigate(`/services/${item.category}/${item.id}/`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Input Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search services, incorporations, GST, trademarks, or tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-white border border-slate-200 rounded-md shadow-xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="p-3 overflow-y-auto flex-1 space-y-1.5 text-left divide-y divide-slate-100">
            {filteredServices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">No matching services found</p>
                <p className="text-xs text-slate-400">Try searching for "Pvt Ltd", "GST", "Trademark", or "Books".</p>
              </div>
            ) : (
              filteredServices.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectService(item)}
                    className="p-3 rounded-xl hover:bg-indigo-50/70 transition-all duration-150 cursor-pointer group flex items-start justify-between gap-4 border border-transparent hover:border-indigo-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      {item.tat && (
                        <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {item.tat}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Showing {filteredServices.length} corporate services
            </span>
            <span className="text-[11px]">Press <strong className="font-semibold text-slate-600">Enter</strong> to select</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
