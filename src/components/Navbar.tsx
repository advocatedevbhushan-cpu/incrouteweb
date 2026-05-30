import React, { useState, useEffect } from "react";
import { Shield, Building2, Bell, CheckSquare, Sparkles, UserCheck, Menu, X, Sun, Moon, BookOpen } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setIsLightMode(isLight);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("light")) {
      document.documentElement.classList.remove("light");
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add("light");
      setIsLightMode(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/95 border-b border-brand-border backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("services")}>
            <div className="p-2 bg-brand-gold/10 rounded-lg border border-brand-gold/20 text-brand-gold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-light text-brand-text tracking-widest uppercase">
                Inc<span className="text-brand-gold font-serif italic font-normal text-xl lowercase">route</span>
              </span>
              <p className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase">Make it right</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === "services"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                  : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Firm Registrations
              </div>
            </button>

            <button
              onClick={() => setActiveTab("name-checker")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === "name-checker"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                  : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Name Feasibility
              </div>
            </button>

            <button
              onClick={() => setActiveTab("compliance")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === "compliance"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                  : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Compliance Roadmap
              </div>
            </button>

            <button
              onClick={() => setActiveTab("blog")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === "blog"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                  : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Insights Blog
              </div>
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === "contact"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                  : "text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Contact Us
              </div>
            </button>

            {/* Desktop Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-brand-text-muted hover:text-brand-gold hover:bg-brand-bg-lighter transition-colors ml-2 cursor-pointer"
              title={isLightMode ? "Switch to Midnight Theme" : "Switch to Marble Theme"}
            >
              {isLightMode ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-brand-gold" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-text-muted hover:text-brand-gold focus:outline-none cursor-pointer"
            >
              {isLightMode ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-brand-gold" />}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-border px-4 py-3 space-y-2">
          <button
            onClick={() => {
              setActiveTab("services");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-brand-text hover:bg-brand-bg-lighter hover:text-brand-gold flex items-center gap-3 cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-brand-text-muted" />
            Firm Registrations
          </button>
          
          <button
            onClick={() => {
              setActiveTab("name-checker");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-brand-text hover:bg-brand-bg-lighter hover:text-brand-gold flex items-center gap-3 cursor-pointer"
          >
            <Shield className="w-5 h-5 text-brand-text-muted" />
            Name Feasibility
          </button>
          
          <button
            onClick={() => {
              setActiveTab("compliance");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-brand-text hover:bg-brand-bg-lighter hover:text-brand-gold flex items-center gap-3 cursor-pointer"
          >
            <CheckSquare className="w-5 h-5 text-brand-text-muted" />
            Compliance Roadmap
          </button>

          <button
            onClick={() => {
              setActiveTab("blog");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-brand-text hover:bg-brand-bg-lighter hover:text-brand-gold flex items-center gap-3 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-brand-text-muted" />
            Insights Blog
          </button>

          <button
            onClick={() => {
              setActiveTab("contact");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-brand-text hover:bg-brand-bg-lighter hover:text-brand-gold flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-brand-text-muted" />
            Contact Us
          </button>
        </div>
      )}
    </nav>
  );
}
