import React, { useState, useEffect } from "react";
import { ChevronDown, Globe, Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import { useTheme } from "../lib/useTheme";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser } = useAuth();

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

  const nav = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    setActiveTab(tab);
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  const isActive = (tabs: string[]) => tabs.includes(activeTab);

  return (
    <nav
      className={`site-header sticky top-0 z-[1000] transition-all duration-250 h-[72px] flex items-center ${
        scrolled
          ? "scrolled-nav border-b border-[rgba(91,108,255,0.10)] shadow-[0_1px_12px_rgba(91,108,255,0.06)]"
          : "border-b border-transparent"
      } ${mobileOpen ? "mobile-menu-open" : ""}`}
    >
      <div className="w-full max-w-[1320px] mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between h-full">

        {/* ─── Left: Logo + Nav ─── */}
        <div className="flex items-center gap-8">
          {/* Logo */}
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

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Solutions — dropdown */}
            <NavDropdown
              label="Solutions"
              active={isActive(["services", "catalog", "tools", "name-checker", "comparison", "impact"])}
              open={openDropdown === "solutions"}
              onOpen={() => setOpenDropdown("solutions")}
              onClose={() => setOpenDropdown(null)}
            >
              <DropdownItem onClick={(e) => nav(e, "services")} title="All Services" desc="Incorporation, compliance & advisory" active={activeTab === "services"} />
              <DropdownItem onClick={(e) => nav(e, "catalog")} title="Service Catalog" desc="Detailed pricing & documentation" active={activeTab === "catalog"} />
              <DropdownItem onClick={(e) => nav(e, "tools")} title="Business Tools" desc="Calculators, checkers & utilities" active={activeTab === "tools"} />
              <DropdownItem onClick={(e) => nav(e, "name-checker")} title="Name Feasibility" desc="AI-powered brand name check" active={activeTab === "name-checker"} />
            </NavDropdown>

            {/* Resources — dropdown */}
            <NavDropdown
              label="Resources"
              active={isActive(["faq", "contact", "compliance", "flowchart"])}
              open={openDropdown === "resources"}
              onOpen={() => setOpenDropdown("resources")}
              onClose={() => setOpenDropdown(null)}
            >
              <DropdownItem onClick={(e) => nav(e, "faq")} title="Knowledge Center" desc="FAQs and guides" active={activeTab === "faq"} />
              <DropdownItem onClick={(e) => nav(e, "compliance")} title="Compliance Tracker" desc="Statutory deadline calendar" active={activeTab === "compliance"} />
              <DropdownItem onClick={(e) => nav(e, "contact")} title="Contact" desc="Get in touch with our team" active={activeTab === "contact"} />
            </NavDropdown>

            {/* About */}
            <NavLink onClick={(e) => nav(e, "about")} active={activeTab === "about"}>About</NavLink>

            {/* Blog */}
            <NavLink onClick={(e) => nav(e, "blog")} active={activeTab === "blog"}>Blog</NavLink>
          </div>
        </div>

        {/* ─── Right: Utilities ─── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language */}
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            aria-label="Switch language"
            className="flex items-center gap-1 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer text-[12px] font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "हिं" : "EN"}
          </button>

          {/* Login — secondary */}
          <a
            href="/login"
            onClick={(e) => nav(e, "login")}
            className="hidden lg:flex items-center nav-login-btn cursor-pointer whitespace-nowrap"
          >
            Login
          </a>

          {/* Book Consultation — primary CTA */}
          <a
            href="/contact"
            onClick={(e) => nav(e, "contact")}
            className="hidden lg:flex items-center book-consultation-button cursor-pointer whitespace-nowrap gap-1.5"
          >
            Book Consultation <ArrowRight className="w-3.5 h-3.5 cta-arrow" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
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
            <div className="p-4 space-y-1 max-h-[75vh] overflow-y-auto">
              {/* Solutions accordion */}
              <MobileAccordion label="Solutions" items={[
                { label: "All Services", tab: "services" },
                { label: "Service Catalog", tab: "catalog" },
                { label: "Business Tools", tab: "tools" },
                { label: "Name Feasibility", tab: "name-checker" },
              ]} activeTab={activeTab} onNav={nav} />

              {/* Resources accordion */}
              <MobileAccordion label="Resources" items={[
                { label: "Knowledge Center", tab: "faq" },
                { label: "Compliance Tracker", tab: "compliance" },
                { label: "Contact", tab: "contact" },
              ]} activeTab={activeTab} onNav={nav} />

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
    <a href="#" onClick={onClick} className={`nav-link px-4 py-2 cursor-pointer whitespace-nowrap ${active ? "active-nav" : "inactive-nav"}`}>
      {children}
    </a>
  );
}

function NavDropdown({ label, active, open, onOpen, onClose, children }: { label: string; active: boolean; open: boolean; onOpen: () => void; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className={`nav-link flex items-center gap-1 px-4 py-2 cursor-pointer whitespace-nowrap ${active ? "active-nav" : "inactive-nav"}`}>
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 pt-2 z-50"
          >
            <div className="w-[280px] border border-[rgba(108,124,255,0.12)] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-1.5 space-y-0.5 bg-[var(--bg-page)]" style={{ background: "var(--bg-page)", backdropFilter: "none" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ onClick, title, desc, active }: { onClick: (e: React.MouseEvent) => void; title: string; desc: string; active: boolean }) {
  return (
    <a href="#" onClick={onClick} className={`block px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${active ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--accent-soft)]"}`}>
      <p className={`text-[13px] font-medium ${active ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{title}</p>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{desc}</p>
    </a>
  );
}

function MobileLink({ children, onClick, active }: { children: string; onClick: (e: React.MouseEvent) => void; active: boolean }) {
  return (
    <a href="#" onClick={onClick} className={`block px-4 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-colors ${active ? "bg-[var(--accent-soft)] text-[var(--accent)] nav-link-active" : "text-[var(--text-primary)] hover:bg-[var(--accent-soft)] nav-link-inactive"}`}>
      {children}
    </a>
  );
}

function MobileAccordion({ label, items, activeTab, onNav }: { label: string; items: { label: string; tab: string }[]; activeTab: string; onNav: (e: React.MouseEvent, tab: string) => void }) {
  const [open, setOpen] = useState(false);
  const isActive = items.some(i => i.tab === activeTab);
  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium cursor-pointer transition-colors ${isActive ? "text-[var(--accent)] nav-link-active" : "text-[var(--text-primary)] nav-link-inactive"}`}>
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-0.5">
          {items.map(item => (
            <a key={item.tab} href="#" onClick={(e) => onNav(e, item.tab)} className={`block px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${activeTab === item.tab ? "bg-[var(--accent-soft)] text-[var(--accent)] nav-link-active" : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] nav-link-inactive"}`}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
