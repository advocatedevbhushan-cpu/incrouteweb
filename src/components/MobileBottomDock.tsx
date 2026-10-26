import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Grid, Wrench, PhoneCall, MessageSquare, FileText, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MobileBottomDockProps {
  setActiveTab: (tab: string) => void;
  onOpenConsultationModal?: () => void;
}

export default function MobileBottomDock({ setActiveTab, onOpenConsultationModal }: MobileBottomDockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdvisoryMenu, setShowAdvisoryMenu] = useState(false);

  const currentPath = location.pathname;

  const handleHomeClick = () => {
    setShowAdvisoryMenu(false);
    setActiveTab("services");
    if (currentPath !== "/") {
      navigate("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServicesClick = () => {
    setShowAdvisoryMenu(false);
    setActiveTab("services");
    if (currentPath !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      const el = document.getElementById("service-catalog-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    }, 150);
  };

  const isHomeActive = currentPath === "/" || currentPath === "";
  const isServicesActive = currentPath.startsWith("/services") || currentPath.startsWith("/catalog");
  const isToolsActive = currentPath.startsWith("/tools");

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-sm md:hidden pointer-events-auto">
      {/* Overlay backdrop when popover is open */}
      <AnimatePresence>
        {showAdvisoryMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdvisoryMenu(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs -z-10"
          />
        )}
      </AnimatePresence>

      {/* Advisory Popover Card */}
      <AnimatePresence>
        {showAdvisoryMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="mb-3.5 w-full bg-[var(--bg-surface)]/98 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-3 text-left relative overflow-hidden"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-display tracking-tight">INCroute Advisory Concierge</span>
              </div>
              <button
                onClick={() => setShowAdvisoryMenu(false)}
                className="w-7 h-7 rounded-full bg-[var(--bg-surface-alt)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Advisory Options */}
            <div className="space-y-2">
              {/* Direct Phone Line */}
              <a
                href="tel:+918707552183"
                onClick={() => setShowAdvisoryMenu(false)}
                className="w-full p-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 text-[var(--text-primary)] rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] font-display">Direct Phone Call</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">+91 87075 52183</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Call</span>
              </a>

              {/* WhatsApp Corporate Advisory */}
              <a
                href="https://wa.me/918707552183?text=Hello%20INCroute%20Team%2C%20I%20need%20assistance%20with%20company%20registration"
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowAdvisoryMenu(false)}
                className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-[var(--text-primary)] rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] font-display">WhatsApp Chat</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">Instant Priority Response</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </a>

              {/* Request Advisory Callback / Book Consultation */}
              <button
                onClick={() => {
                  setShowAdvisoryMenu(false);
                  if (onOpenConsultationModal) {
                    onOpenConsultationModal();
                  } else {
                    setActiveTab("contact");
                    navigate("/contact/");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="w-full p-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-[var(--accent)]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 text-[var(--on-gradient-text)] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold font-display">Book 1-on-1 Consultation</h5>
                    <p className="text-[10px] opacity-90 font-mono">30-Min Senior CA Advisory</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uniform Mobile Bottom Dock Bar */}
      <div className="bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-full px-5 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all">
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer relative py-1 px-3 rounded-full ${
            isHomeActive ? "text-[var(--accent)] font-bold bg-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Services Catalog */}
        <button
          onClick={handleServicesClick}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer relative py-1 px-3 rounded-full ${
            isServicesActive ? "text-[var(--accent)] font-bold bg-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Services</span>
        </button>

        {/* Advisory */}
        <button
          onClick={() => setShowAdvisoryMenu(!showAdvisoryMenu)}
          aria-label="Corporate Advisory Menu"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer relative py-1 px-3 rounded-full ${
            showAdvisoryMenu ? "text-[var(--accent)] font-bold bg-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Advisory</span>
        </button>

        {/* AI Tools */}
        <button
          onClick={() => {
            setShowAdvisoryMenu(false);
            setActiveTab("name-checker");
            navigate("/tools/name-checker/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer relative py-1 px-3 rounded-full ${
            isToolsActive ? "text-[var(--accent)] font-bold bg-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>AI Tools</span>
        </button>
      </div>
    </div>
  );
}
