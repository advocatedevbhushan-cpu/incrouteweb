import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, Globe, Menu, X, Sun, Moon, ArrowRight, Search, 
  Building2, ShieldCheck, TrendingUp, FileText, Landmark, Clock, 
  Scale, Lock, Award, Milestone, Users, Sparkles, PhoneCall, ChevronRight,
  Calculator
} from "lucide-react";
import { useTheme } from "../lib/useTheme";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/AuthContext";
import SearchModal from "./SearchModal";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MegaItem {
  title: string;
  badge?: string;
  tab: string;
  serviceId?: string;
}

interface MegaSubCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MegaItem[];
}

interface MegaCategory {
  id: string;
  label: string;
  activeTabs: string[];
  advisoryText?: string;
  subCategories: MegaSubCategory[];
}

const SERVICE_CATEGORIES: Record<string, string> = {
  // Private Corporate
  "pvt-ltd": "private-corporate",
  "opc": "private-corporate",
  "section8": "private-corporate",
  "public-ltd": "private-corporate",
  "producer-company": "private-corporate",
  "nidhi-company": "private-corporate",
  "indian-subsidiary": "private-corporate",

  // Alternative Entity
  "llp": "alternative-entity",
  "partnership": "alternative-entity",
  "sole-proprietorship": "alternative-entity",
  "trust-registration": "alternative-entity",
  "society-registration": "alternative-entity",
  "fcra-registration": "alternative-entity",
  "12a-80g-registration": "alternative-entity",
  "12aa-registration": "alternative-entity",

  // Enterprise Growth & Advisory
  "virtual-cfo": "enterprise-growth",
  "virtual-office": "enterprise-growth",
  "startup-grants": "enterprise-growth",
  "pitch-deck": "enterprise-growth",
  "seed-funding": "enterprise-growth",
  "cap-table-valuation": "enterprise-growth",

  // Compliance & Tax
  "annual-compliance": "compliance",
  "gst-tax": "compliance",
  "gst-return-filing": "compliance",
  "gstr9-annual-return": "compliance",
  "gst-lut-filing": "compliance",
  "gst-notice-resolution": "compliance",
  "gst-foreigners": "compliance",
  "gst-amendment": "compliance",
  "gstr10-final-return": "compliance",
  "income-tax-efiling": "compliance",
  "business-tax-filing": "compliance",
  "itr-filing-individual": "compliance",
  "corporate-tax-itr": "compliance",
  "15ca-15cb-filing": "compliance",
  "tan-tds-filing": "compliance",
  "income-tax-notice": "compliance",
  "dir3-kyc": "compliance",
  "inc20a-commencement": "compliance",
  "secretarial-audit": "compliance",
  "board-minutes-drafting": "compliance",
  "change-company-name": "compliance",
  "increase-authorized-capital": "compliance",
  "director-change": "compliance",
  "change-registered-office": "compliance",
  "share-transfer-allotment": "compliance",
  "msme-registration": "compliance",
  "fssai-registration": "compliance",
  "return-filing": "compliance",
  "iso-certification": "compliance",
  "bookkeeping-ledger": "compliance",
  "mis-financial-reporting": "compliance",
  "import-export-code": "compliance",
  "shop-establishment-license": "compliance",
  "pf-esi-registration": "compliance",
  "professional-tax-license": "compliance",
  "posh-compliance": "compliance",

  // Legal & IP
  "terms-privacy": "legal-ip",
  "nda-agreement": "legal-ip",
  "founder-agreement": "legal-ip",
  "employment-contract": "legal-ip",
  "trademark-registration": "legal-ip",
  "trademark-objection": "legal-ip",
  "trademark-opposition": "legal-ip",
  "trademark-assignment": "legal-ip",
  "brand-protection": "legal-ip",
  "litigation-assistance": "legal-ip",
  "trademark-renewal": "legal-ip",
  "patent-filing": "legal-ip",
  "copyright-registration": "legal-ip",
  "logo-brand-ip": "legal-ip"
};

const MASTER_SERVICES_CATEGORY: MegaCategory = {
  id: "all-services",
  label: "Services & Solutions",
  activeTabs: ["services", "catalog", "compliance", "tools", "name-checker"],
  advisoryText: "Prefer to speak with a statutory corporate advisor first?",
  subCategories: [
    {
      id: "company",
      label: "Company Incorporation",
      icon: Building2,
      items: [
        { title: "Private Limited Company", badge: "✨", tab: "services", serviceId: "pvt-ltd" },
        { title: "Limited Liability Partnership (LLP)", tab: "services", serviceId: "llp" },
        { title: "One Person Company (OPC)", tab: "services", serviceId: "opc" },
        { title: "Sole Proprietorship", tab: "services", serviceId: "sole-proprietorship" },
        { title: "Partnership Firm", tab: "services", serviceId: "partnership" },
        { title: "Section 8 NGO Company", tab: "services", serviceId: "section8" },
        { title: "Producer Company", tab: "services", serviceId: "producer-company" },
        { title: "Nidhi Company", tab: "services", serviceId: "nidhi-company" },
        { title: "Indian Subsidiary", tab: "services", serviceId: "indian-subsidiary" },
        { title: "Public Limited Company", tab: "services", serviceId: "public-ltd" },
        { title: "Virtual Office Address", badge: "✨", tab: "services", serviceId: "virtual-office" },
      ]
    },
    {
      id: "gst",
      label: "GST & Tax Compliances",
      icon: FileText,
      items: [
        { title: "GST Registration", badge: "✨", tab: "services", serviceId: "gst-tax" },
        { title: "GST Return Filing (GSTR-1 & 3B)", tab: "services", serviceId: "gst-return-filing" },
        { title: "GSTR-9 Annual Return", tab: "services", serviceId: "gstr9-annual-return" },
        { title: "GST LUT Form Filing", tab: "services", serviceId: "gst-lut-filing" },
        { title: "Income Tax E-Filing (ITR)", tab: "services", serviceId: "income-tax-efiling" },
        { title: "Business Tax Return Filing", tab: "services", serviceId: "business-tax-filing" },
        { title: "ROC Annual Filing (AOC-4 & MGT-7)", tab: "services", serviceId: "annual-compliance" },
        { title: "DIR-3 KYC Verification", tab: "services", serviceId: "dir3-kyc" },
        { title: "Commencement of Business (INC-20A)", tab: "services", serviceId: "inc20a-commencement" },
      ]
    },
    {
      id: "tm",
      label: "Trademark & Intellectual Property",
      icon: ShieldCheck,
      items: [
        { title: "Trademark Registration", badge: "✨", tab: "services", serviceId: "trademark-registration" },
        { title: "AI Brand Name Feasibility", badge: "FREE", tab: "name-checker" },
        { title: "Trademark Objection Reply", tab: "services", serviceId: "trademark-objection" },
        { title: "Trademark Hearing & Watch", tab: "services", serviceId: "trademark-opposition" },
        { title: "Copyright Registration", tab: "services", serviceId: "copyright-registration" },
        { title: "Patent Filing Advisory", tab: "services", serviceId: "patent-filing" },
      ]
    },
    {
      id: "licenses",
      label: "Government Trade Licenses",
      icon: Award,
      items: [
        { title: "FSSAI Food License", tab: "services", serviceId: "fssai-registration" },
        { title: "Import Export Code (IEC)", tab: "services", serviceId: "import-export-code" },
        { title: "MSME / Udyam Certificate", tab: "services", serviceId: "msme-registration" },
        { title: "Shop & Establishment License", tab: "services", serviceId: "shop-establishment-license" },
        { title: "PF & ESI Registration", tab: "services", serviceId: "pf-esi-registration" },
        { title: "Professional Tax (PT) License", tab: "services", serviceId: "professional-tax-license" },
      ]
    },
    {
      id: "aitools",
      label: "AI Tools & Cloud Software",
      icon: Sparkles,
      items: [
        { title: "AI Brand Name Feasibility", badge: "FREE", tab: "name-checker" },
        { title: "INCroute Books Accounting Software", badge: "APP", tab: "books" },
        { title: "Business Calculators & Utilities", tab: "tools" },
        { title: "Entity Structure Matrix (Pvt vs LLP)", tab: "comparison" },
        { title: "Service Impact Analytics", tab: "impact" },
      ]
    }
  ]
};

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const nav = (e: React.MouseEvent, tab: string, serviceId?: string) => {
    e.preventDefault();
    setMobileOpen(false);
    setOpenDropdown(null);

    // If a specific serviceId is passed, route directly to /services/:category/:serviceId/
    if (serviceId) {
      const category = SERVICE_CATEGORIES[serviceId] || "general";
      navigate(`/services/${category}/${serviceId}/`);
      setActiveTab("services");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const routeMap: Record<string, string> = {
      services: "/services/",
      catalog: "/catalog/",
      compliance: "/compliance/",
      tools: "/tools/",
      "name-checker": "/tools/name-checker/",
      comparison: "/tools/entity-comparison/",
      impact: "/tools/impact-dashboard/",
      flowchart: "/compliance/flowchart/",
      faq: "/knowledge-hub/",
      contact: "/contact/",
      about: "/about/",
      blog: "/blog/",
      policies: "/policies/",
      careers: "/careers/",
      books: "/books",
      login: "/login"
    };

    const route = routeMap[tab] || `/${tab}/`;
    navigate(route);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={`site-header sticky top-0 z-[1000] transition-all duration-250 h-[72px] flex items-center ${
        scrolled
          ? "scrolled-nav border-b border-[rgba(91,108,255,0.10)] shadow-[0_1px_12px_rgba(91,108,255,0.06)]"
          : "border-b border-transparent"
      } ${mobileOpen ? "mobile-menu-open" : ""}`}
    >
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">

        {/* ─── Left: Logo ─── */}
        <a href="/" onClick={(e) => nav(e, "services")} className="flex items-center gap-2.5 shrink-0 cursor-pointer logo-wrapper">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <img src="/incroute_logo.png" width="36" height="36" className="w-full h-full object-cover" alt="INCroute Logo" />
          </div>
          <div className="flex flex-col select-none leading-none">
            <span className="text-[16px] font-extrabold logo-text-inc tracking-tight">
              INC<span className="logo-text-route font-bold italic">route</span>
            </span>
            <div className="flex items-center gap-1 mt-[3px]">
              <span className="h-[1px] w-3.5 bg-[#6B6F86] opacity-30" />
              <span className="text-[8px] logo-tagline tracking-[0.18em] uppercase font-semibold">Make It Right</span>
              <span className="h-[1px] w-3.5 bg-[#6B6F86] opacity-30" />
            </div>
          </div>
        </a>

        {/* ─── Center: Master Services Mega Menu ─── */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-4">
          <MegaNavDropdown
            category={MASTER_SERVICES_CATEGORY}
            open={openDropdown === "all-services"}
            onOpen={() => setOpenDropdown("all-services")}
            onClose={() => setOpenDropdown(null)}
            onNav={nav}
            activeTab={activeTab}
          />

          <NavLink onClick={(e) => nav(e, "books")} active={activeTab === "books"}>INCroute Books</NavLink>
          <NavLink onClick={(e) => nav(e, "about")} active={activeTab === "about"}>About</NavLink>
          <NavLink onClick={(e) => nav(e, "blog")} active={activeTab === "blog"}>Blog</NavLink>
        </div>

        {/* ─── Right: Action Utilities ─── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <button
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search tools and services"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all text-xs font-semibold cursor-pointer shrink-0 shadow-xs"
            title="Search Services (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Search Services</span>
            <kbd className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded">Ctrl+K</kbd>
          </button>

          {/* Login — secondary */}
          <a
            href="/login"
            onClick={(e) => nav(e, "login")}
            className="hidden sm:flex items-center nav-login-btn cursor-pointer whitespace-nowrap px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors shrink-0"
          >
            Login
          </a>

          {/* Book Consultation — primary CTA */}
          <a
            href="/contact"
            onClick={(e) => nav(e, "contact")}
            className="hidden sm:flex items-center book-consultation-button cursor-pointer whitespace-nowrap gap-1.5 shrink-0 shadow-[0_0_20px_rgba(196,146,53,0.25)] hover:shadow-[0_0_25px_rgba(196,146,53,0.4)] transition-all text-[13px] px-4 py-2"
          >
            Book Consultation <ArrowRight className="w-3.5 h-3.5 cta-arrow" />
          </a>

          {/* Mobile hamburger for < 1024px displays */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Universal Search Modal Command Palette */}
        <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      </div>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[64px] sm:top-[72px] left-0 right-0 border-b border-[var(--border-subtle)] overflow-hidden lg:hidden z-50 shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
            style={{ background: "var(--bg-page)" }}
          >
            <div className="p-4 space-y-2 max-h-[75vh] overflow-y-auto text-left">
              {/* Mobile Master Accordion */}
              <MobileMegaAccordion category={MASTER_SERVICES_CATEGORY} activeTab={activeTab} onNav={nav} />

              <MobileLink onClick={(e) => nav(e, "books")} active={activeTab === "books"}>INCroute Books</MobileLink>
              <MobileLink onClick={(e) => nav(e, "about")} active={activeTab === "about"}>About</MobileLink>
              <MobileLink onClick={(e) => nav(e, "blog")} active={activeTab === "blog"}>Blog</MobileLink>

              <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] space-y-2">
                <a href="/login" onClick={(e) => nav(e, "login")} className="block w-full text-center py-3 border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-[13px] rounded-xl cursor-pointer">Login</a>
                <a href="/contact" onClick={(e) => nav(e, "contact")} className="block w-full text-center py-3 bg-[var(--accent)] text-[var(--on-gradient-text)] font-semibold text-[13px] rounded-xl cursor-pointer">Book Consultation</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─── Sub-components ─── */

function NavLink({ children, onClick, active }: { children: string; onClick: (e: React.MouseEvent) => void; active: boolean }) {
  return (
    <a href="#" onClick={onClick} className={`nav-link px-2.5 py-2 cursor-pointer whitespace-nowrap text-[13px] font-semibold transition-colors ${active ? "text-[var(--accent)] font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
      {children}
    </a>
  );
}

function MegaNavDropdown({
  category,
  open,
  onOpen,
  onClose,
  onNav,
  activeTab
}: {
  category: MegaCategory;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNav: (e: React.MouseEvent, tab: string, serviceId?: string) => void;
  activeTab: string;
}) {
  const [selectedSubId, setSelectedSubId] = useState(category.subCategories[0]?.id || "");

  useEffect(() => {
    if (open && category.subCategories.length > 0) {
      setSelectedSubId(category.subCategories[0].id);
    }
  }, [open, category]);

  const activeSub = category.subCategories.find(s => s.id === selectedSubId) || category.subCategories[0];
  const isTopActive = category.activeTabs.includes(activeTab);

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      {/* Top Level Nav Button */}
      <button
        onClick={onOpen}
        className={`nav-link flex items-center gap-1 px-2.5 2xl:px-3 py-2 cursor-pointer whitespace-nowrap text-[13px] font-semibold transition-all relative ${
          isTopActive || open ? "text-[var(--accent)] font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        {(isTopActive || open) && (
          <span className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" />
        )}
        <span>{category.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[var(--accent)]" : ""}`} />
      </button>

      {/* Mega Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 xl:-left-6 2xl:left-0 pt-2 z-[1100]"
          >
            <div
              className="w-[780px] border border-[rgba(108,124,255,0.18)] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col"
              style={{ background: "var(--bg-page)" }}
            >
              {/* 2-Pane Main Section */}
              <div className="flex min-h-[340px]">
                {/* Left Sidebar Pane */}
                <div className="w-[270px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 space-y-1">
                  {category.subCategories.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSelected = sub.id === activeSub.id;
                    return (
                      <button
                        key={sub.id}
                        onMouseEnter={() => setSelectedSubId(sub.id)}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-[var(--accent-soft)] text-[var(--accent)] border-l-[3px] border-[var(--accent)] font-bold shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <SubIcon className={`w-4 h-4 ${isSelected ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-[var(--accent)] translate-x-0.5" : "text-[var(--text-tertiary)] opacity-30"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Right Content Pane */}
                <div className="flex-1 p-5 bg-[var(--bg-page)] overflow-y-auto max-h-[380px] text-left space-y-4">
                  {/* Header Title */}
                  <h4 className="text-[13px] font-extrabold text-[var(--accent)] tracking-tight flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2.5">
                    {activeSub.label} <ChevronRight className="w-3.5 h-3.5" />
                  </h4>

                  {/* Services Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {activeSub.items.map((item, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => onNav(e, item.tab, item.serviceId)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--accent-soft)] text-[12.5px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-1.5 group-hover:text-[var(--accent)] transition-colors">
                          {item.title}
                          {item.badge && (
                            <span className="text-[10px] text-amber-500 font-extrabold">{item.badge}</span>
                          )}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Advisory Callout Bar */}
              <div className="border-t border-[var(--border-subtle)] bg-[var(--accent-soft)] px-5 py-3 flex items-center justify-between text-xs font-semibold shrink-0">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <PhoneCall className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>{category.advisoryText || "Prefer to talk to a business advisor first?"}</span>
                </div>
                <a
                  href="/contact"
                  onClick={(e) => onNav(e, "contact")}
                  className="text-[var(--accent)] hover:underline font-extrabold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  Book a call back <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileLink({ children, onClick, active }: { children: string; onClick: (e: React.MouseEvent) => void; active: boolean }) {
  return (
    <a href="#" onClick={onClick} className={`block px-4 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-colors ${active ? "bg-[var(--accent-soft)] text-[var(--accent)] nav-link-active" : "text-[var(--text-primary)] hover:bg-[var(--accent-soft)] nav-link-inactive"}`}>
      {children}
    </a>
  );
}

function MobileMegaAccordion({ category, activeTab, onNav }: { category: MegaCategory; activeTab: string; onNav: (e: React.MouseEvent, tab: string, serviceId?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeSubId, setActiveSubId] = useState(category.subCategories[0]?.id || "");
  const isActive = category.activeTabs.includes(activeTab);

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium cursor-pointer transition-colors ${isActive ? "text-[var(--accent)] font-bold" : "text-[var(--text-primary)]"}`}>
        <span>{category.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180 text-[var(--accent)] text-[var(--accent)]" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-[var(--border-subtle)] pt-2">
          {/* Sub-category selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {category.subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubId(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeSubId === sub.id
                    ? "bg-[var(--accent)] text-[var(--on-gradient-text)]"
                    : "bg-[var(--accent-soft)] text-[var(--text-secondary)]"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub items */}
          <div className="space-y-1 bg-[var(--bg-page)] p-2 rounded-xl border border-[var(--border-subtle)]">
            {(category.subCategories.find(s => s.id === activeSubId) || category.subCategories[0])?.items.map((item, idx) => (
              <a
                key={idx}
                href="#"
                onClick={(e) => onNav(e, item.tab, item.serviceId)}
                className="block px-3 py-2 rounded-lg text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer"
              >
                {item.title} {item.badge && <span className="text-[10px] text-amber-500 font-bold">{item.badge}</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
