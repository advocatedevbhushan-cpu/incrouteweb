import React, { useState, useEffect } from "react";
import { Shield, Building2, Scale, FileText, Phone, Menu, X, Sun, Moon, BookOpen, Globe, Info, Database } from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import type { Lang } from "../lib/i18n";
import { motion } from "motion/react";

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

  const navActiveClass = (tab: string) =>
    activeTab === tab
      ? isLightMode
        ? "bg-[#efece6] text-[#111827] border border-[#dcd9d0] shadow-sm"
        : "bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
      : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter border border-transparent";

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/95 border-b border-brand-border backdrop-blur-md transition-colors duration-150 fast-transition transform-gpu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer font-sans" onClick={() => setActiveTab("services")}>
            <div className="p-2 bg-brand-dark rounded-lg border border-brand-border text-brand-gold flex items-center justify-center">
              <Scale className="w-5 h-5 text-brand-gold stroke-[2]" />
            </div>
            <div className="flex flex-col select-none">
              <span className="text-lg font-bold text-brand-text tracking-wider uppercase leading-none">
                INC<span className="text-brand-gold font-serif italic font-normal tracking-normal text-xl lowercase">route</span>
              </span>
              <p className="text-[8px] text-brand-text-muted font-mono tracking-widest uppercase mt-0.5">{t("footer_motto") as string}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { tab: "services", icon: Building2, label: t("nav_services") as string },
              { tab: "compliance", icon: FileText, label: t("nav_compliance") as string },
              { tab: "blog", icon: BookOpen, label: t("nav_blog") as string },
              { tab: "catalog", icon: Database, label: "Catalog" },
              { tab: "about", icon: Info, label: t("nav_about") as string },
              { tab: "contact", icon: Phone, label: t("nav_contact") as string },
            ].map((item) => {
              const isActive = activeTab === item.tab;
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`relative px-3.5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-150 transform-gpu cursor-pointer select-none outline-none ${
                    isActive
                      ? isLightMode
                        ? "text-[#111827]"
                        : "text-brand-gold"
                      : "text-brand-text-muted hover:text-brand-gold"
                  }`}
                >
                  {/* Gliding Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-full z-0 ${
                        isLightMode
                          ? "bg-[#efece6] border border-[#dcd9d0] shadow-sm"
                          : "bg-brand-gold/15 border border-brand-gold/25"
                      }`}
                    />
                  )}
                  {/* Label Content */}
                  <span className="relative z-10 flex items-center gap-1.5 pointer-events-none">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter border border-transparent transition-colors duration-150 fast-transition ml-1 cursor-pointer"
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "हिं" : "EN"}
            </button>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter transition-colors duration-150 fast-transition ml-1 cursor-pointer border border-transparent"
              title={isLightMode ? "Switch to Midnight Theme" : "Switch to Marble Light Theme"}
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-gold focus:outline-none fast-transition cursor-pointer text-xs font-mono font-bold"
            >
              {lang === "en" ? "हिं" : "EN"}
            </button>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-gold focus:outline-none fast-transition cursor-pointer"
            >
              {isLightMode ? (
                <Moon className="w-5 h-5 text-slate-700" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-text focus:outline-none fast-transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-border px-4 py-3 space-y-2 relative overflow-hidden">
          {[
            { tab: "services", icon: Building2, label: t("nav_services") as string },
            { tab: "compliance", icon: FileText, label: t("nav_compliance") as string },
            { tab: "blog", icon: BookOpen, label: t("nav_blog") as string },
            { tab: "catalog", icon: Database, label: "Catalog" },
            { tab: "about", icon: Info, label: t("nav_about") as string },
            { tab: "contact", icon: Phone, label: t("nav_contact") as string },
          ].map(({ tab, icon: Icon, label }) => {
            const isMobileActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                className={`relative w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold flex items-center gap-3 cursor-pointer transition-colors duration-150 outline-none select-none ${
                  isMobileActive ? "text-brand-gold font-bold" : "text-brand-text hover:text-brand-gold"
                }`}
              >
                {isMobileActive && (
                  <motion.div
                    layoutId="mobileNavActivePill"
                    className="absolute inset-0 rounded-md z-0 bg-brand-gold/10 border border-brand-gold/15"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3 pointer-events-none">
                  <Icon className="w-5 h-5 text-brand-text-muted" />
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
