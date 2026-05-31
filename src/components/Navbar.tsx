import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Building2, 
  Scale, 
  FileText, 
  Phone, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Globe, 
  Info, 
  Database, 
  Calculator, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  MessageSquare,
  ChevronDown,
  Sparkles,
  ClipboardCheck,
  Award,
  HelpCircle
} from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import type { Lang } from "../lib/i18n";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLightMode, setIsLightMode] = useState(true);
  const { lang, setLang, t } = useLang();

  // Active Dropdowns State for hover triggers on desktop
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const handleNavClick = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  useEffect(() => {
    // Check initial mode
    const isLight = document.documentElement.classList.contains("light");
    setIsLightMode(isLight);
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove("light");
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add("light");
      setIsLightMode(true);
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  // Helper to check if any child of a dropdown is active
  const isDropdownActive = (tabs: string[]) => tabs.includes(activeTab);

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/95 border-b border-brand-border backdrop-blur-md transition-colors duration-150 transform-gpu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <a href="/" className="flex items-center gap-2.5 cursor-pointer font-sans" onClick={(e) => handleNavClick(e, "services")}>
            <div className="p-2 bg-brand-dark rounded-lg border border-brand-border text-brand-gold flex items-center justify-center">
              <Scale className="w-5 h-5 text-brand-gold stroke-[2]" />
            </div>
            <div className="flex flex-col select-none">
              <span className="text-lg font-bold text-brand-text tracking-wider uppercase leading-none">
                INC<span className="text-brand-gold font-serif italic font-normal tracking-normal text-xl lowercase">route</span>
              </span>
              <p className="text-[8px] text-brand-text-muted font-mono tracking-widest uppercase mt-0.5">{t("footer_motto") as string}</p>
            </div>
          </a>

          {/* Desktop Navigation Links - Organized into Dropdowns */}
          <div className="hidden lg:flex items-center space-x-1">
            
            {/* Dropdown 1: Solutions */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu("solutions")}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-150 transform-gpu flex items-center gap-1 cursor-pointer outline-none ${
                  isDropdownActive(["services", "catalog", "tools"])
                    ? isLightMode ? "text-[#111827]" : "text-brand-gold"
                    : "text-brand-text-muted hover:text-brand-gold"
                }`}
              >
                {isDropdownActive(["services", "catalog", "tools"]) && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-full z-0 ${
                      isLightMode ? "bg-[#efece6] border border-[#dcd9d0]" : "bg-brand-gold/15 border border-brand-gold/25"
                    }`}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 pointer-events-none">
                  <Building2 className="w-3.5 h-3.5" />
                  Solutions
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </span>
              </button>

              <AnimatePresence>
                {hoveredMenu === "solutions" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-60 rounded-2xl bg-brand-bg-lighter border border-brand-border p-2 shadow-2xl backdrop-blur-md"
                  >
                    {[
                      { tab: "services", icon: Building2, title: "Services Panel", desc: "Start statutory incorporations" },
                      { tab: "catalog", icon: Database, title: "Detailed Catalog", desc: "Document rules & advantages" },
                      { tab: "tools", icon: Calculator, title: "Interactive Utilities", desc: "Calculators & draft generators" }
                    ].map((sub) => (
                      <a
                        key={sub.tab}
                        href={sub.tab === "services" ? "/" : `/${sub.tab}`}
                        onClick={(e) => { handleNavClick(e, sub.tab); setHoveredMenu(null); }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 hover:bg-brand-gold/10 group cursor-pointer ${
                          activeTab === sub.tab ? "bg-brand-gold/5" : ""
                        }`}
                      >
                        <div className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-brand-gold shrink-0 mt-0.5">
                          <sub.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left space-y-0.5 min-w-0">
                          <span className={`text-[11px] font-bold block ${activeTab === sub.tab ? "text-brand-gold" : "text-brand-text group-hover:text-brand-gold"}`}>
                            {sub.title}
                          </span>
                          <span className="text-[9px] text-brand-text-muted leading-tight block truncate">{sub.desc}</span>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown 2: Intelligence */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu("intelligence")}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-150 transform-gpu flex items-center gap-1 cursor-pointer outline-none ${
                  isDropdownActive(["flowchart", "comparison", "impact", "compliance"])
                    ? isLightMode ? "text-[#111827]" : "text-brand-gold"
                    : "text-brand-text-muted hover:text-brand-gold"
                }`}
              >
                {isDropdownActive(["flowchart", "comparison", "impact", "compliance"]) && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-full z-0 ${
                      isLightMode ? "bg-[#efece6] border border-[#dcd9d0]" : "bg-brand-gold/15 border border-brand-gold/25"
                    }`}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 pointer-events-none">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Statutory Hub
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </span>
              </button>

              <AnimatePresence>
                {hoveredMenu === "intelligence" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-64 rounded-2xl bg-brand-bg-lighter border border-brand-border p-2 shadow-2xl backdrop-blur-md"
                  >
                    {[
                      { tab: "flowchart", icon: Zap, title: "Compliance Flowchart", desc: "Step-by-step setup pipelines" },
                      { tab: "comparison", icon: BarChart3, title: "Entity Comparison", desc: "Side-by-side structural specs" },
                      { tab: "impact", icon: TrendingUp, title: "Impact Dashboard", desc: "Timeline & growth visualizations" },
                      { tab: "compliance", icon: FileText, title: "Due Date Tracker", desc: "Static statutory calendars" }
                    ].map((sub) => (
                      <a
                        key={sub.tab}
                        href={`/${sub.tab}`}
                        onClick={(e) => { handleNavClick(e, sub.tab); setHoveredMenu(null); }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 hover:bg-brand-gold/10 group cursor-pointer ${
                          activeTab === sub.tab ? "bg-brand-gold/5" : ""
                        }`}
                      >
                        <div className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-brand-gold shrink-0 mt-0.5">
                          <sub.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left space-y-0.5 min-w-0">
                          <span className={`text-[11px] font-bold block ${activeTab === sub.tab ? "text-brand-gold" : "text-brand-text group-hover:text-brand-gold"}`}>
                            {sub.title}
                          </span>
                          <span className="text-[9px] text-brand-text-muted leading-tight block truncate">{sub.desc}</span>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown 3: Reputation */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu("reputation")}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-150 transform-gpu flex items-center gap-1 cursor-pointer outline-none ${
                  isDropdownActive(["blog", "testimonials", "faq"])
                    ? isLightMode ? "text-[#111827]" : "text-brand-gold"
                    : "text-brand-text-muted hover:text-brand-gold"
                }`}
              >
                {isDropdownActive(["blog", "testimonials", "faq"]) && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-full z-0 ${
                      isLightMode ? "bg-[#efece6] border border-[#dcd9d0]" : "bg-brand-gold/15 border border-brand-gold/25"
                    }`}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 pointer-events-none">
                  <Award className="w-3.5 h-3.5" />
                  Insights
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </span>
              </button>

              <AnimatePresence>
                {hoveredMenu === "reputation" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-56 rounded-2xl bg-brand-bg-lighter border border-brand-border p-2 shadow-2xl backdrop-blur-md"
                  >
                    {[
                      { tab: "blog", icon: BookOpen, title: "Knowledge Base", desc: "Expert statutory articles" },
                      { tab: "faq", icon: HelpCircle, title: "Answer Hub", desc: "Filing & compliance Q&A" },
                      { tab: "testimonials", icon: MessageSquare, title: "Client Reflections", desc: "Founder feedback & reviews" }
                    ].map((sub) => (
                      <a
                        key={sub.tab}
                        href={`/${sub.tab}`}
                        onClick={(e) => { handleNavClick(e, sub.tab); setHoveredMenu(null); }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 hover:bg-brand-gold/10 group cursor-pointer ${
                          activeTab === sub.tab ? "bg-brand-gold/5" : ""
                        }`}
                      >
                        <div className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-brand-gold shrink-0 mt-0.5">
                          <sub.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left space-y-0.5 min-w-0">
                          <span className={`text-[11px] font-bold block ${activeTab === sub.tab ? "text-brand-gold" : "text-brand-text group-hover:text-brand-gold"}`}>
                            {sub.title}
                          </span>
                          <span className="text-[9px] text-brand-text-muted leading-tight block truncate">{sub.desc}</span>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Links */}
            {[
              { tab: "about", icon: Info, label: t("nav_about") as string },
              { tab: "contact", icon: Phone, label: t("nav_contact") as string },
            ].map((item) => {
              const isActive = activeTab === item.tab;
              const Icon = item.icon;
              return (
                <a
                  key={item.tab}
                  href={`/${item.tab}`}
                  onClick={(e) => handleNavClick(e, item.tab)}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-150 transform-gpu cursor-pointer select-none outline-none ${
                    isActive
                      ? isLightMode ? "text-[#111827]" : "text-brand-gold"
                      : "text-brand-text-muted hover:text-brand-gold"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-full z-0 ${
                        isLightMode ? "bg-[#efece6] border border-[#dcd9d0]" : "bg-brand-gold/15 border border-brand-gold/25"
                      }`}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 pointer-events-none">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </a>
              );
            })}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-gold hover:bg-brand-gold/10 border border-transparent transition-colors duration-150 ml-1 cursor-pointer"
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "हिं" : "EN"}
            </button>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-brand-text-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors duration-150 ml-1 cursor-pointer border border-transparent"
              title={isLightMode ? "Switch to Midnight Theme" : "Switch to Marble Light Theme"}
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </button>
          </div>

          {/* Mobile menu toggle buttons */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-gold focus:outline-none cursor-pointer text-xs font-mono font-bold"
            >
              {lang === "en" ? "हिं" : "EN"}
            </button>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-gold focus:outline-none cursor-pointer"
            >
              {isLightMode ? (
                <Moon className="w-5 h-5 text-slate-700" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-text focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu - Displays as fully organized sub-collapsible sections */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-bg border-b border-brand-border px-4 py-4 space-y-3 relative overflow-y-auto max-h-[80vh] text-left">
          {/* Solutions Category */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold pl-3 block mb-1">Solutions</span>
            {[
              { tab: "services", icon: Building2, label: "Services Dashboard" },
              { tab: "catalog", icon: Database, label: "Detailed Catalog" },
              { tab: "tools", icon: Calculator, label: "Interactive Tools" }
            ].map(({ tab, icon: Icon, label }) => (
              <a
                key={tab}
                href={tab === "services" ? "/" : `/${tab}`}
                onClick={(e) => { handleNavClick(e, tab); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                  activeTab === tab ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25" : "text-brand-text hover:text-brand-gold"
                }`}
              >
                <Icon className="w-4 h-4 text-brand-text-muted" />
                {label}
              </a>
            ))}
          </div>

          {/* Statutory Hub Category */}
          <div className="space-y-1.5 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold pl-3 block mb-1">Statutory Hub</span>
            {[
              { tab: "flowchart", icon: Zap, label: "Compliance Flowchart" },
              { tab: "comparison", icon: BarChart3, label: "Entity Comparison" },
              { tab: "impact", icon: TrendingUp, label: "Impact Dashboard" },
              { tab: "compliance", icon: FileText, label: "Due Date Tracker" }
            ].map((item) => {
              const tab = item.tab;
              const Icon = item.icon || FileText;
              const label = item.label || "Due Date Tracker";
              return (
                <a
                  key={tab}
                  href={`/${tab}`}
                  onClick={(e) => { handleNavClick(e, tab); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                    activeTab === tab ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25" : "text-brand-text hover:text-brand-gold"
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-text-muted" />
                  {label}
                </a>
              );
            })}
          </div>

          {/* Insights Category */}
          <div className="space-y-1.5 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold pl-3 block mb-1">Insights</span>
            {[
              { tab: "blog", icon: BookOpen, label: "Knowledge Base Articles" },
              { tab: "faq", icon: HelpCircle, label: "Answer Hub" },
              { tab: "testimonials", icon: MessageSquare, label: "Client Reflections" }
            ].map(({ tab, icon: Icon, label }) => (
              <a
                key={tab}
                href={`/${tab}`}
                onClick={(e) => { handleNavClick(e, tab); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                  activeTab === tab ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25" : "text-brand-text hover:text-brand-gold"
                }`}
              >
                <Icon className="w-4 h-4 text-brand-text-muted" />
                {label}
              </a>
            ))}
          </div>

          {/* Corporate Links */}
          <div className="space-y-1.5 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold pl-3 block mb-1">Corporate</span>
            {[
              { tab: "about", icon: Info, label: t("nav_about") as string },
              { tab: "contact", icon: Phone, label: t("nav_contact") as string },
            ].map(({ tab, icon: Icon, label }) => (
              <a
                key={tab}
                href={`/${tab}`}
                onClick={(e) => { handleNavClick(e, tab); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                  activeTab === tab ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25" : "text-brand-text hover:text-brand-gold"
                }`}
              >
                <Icon className="w-4 h-4 text-brand-text-muted" />
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
