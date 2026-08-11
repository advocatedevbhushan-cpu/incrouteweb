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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-sm md:hidden pointer-events-auto">
      
      {/* Advisory Popover Card */}
      <AnimatePresence>
        {showAdvisoryMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="mb-3.5 w-full bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-[28px] p-4 sm:p-5 shadow-2xl shadow-purple-950/25 space-y-3.5 text-left relative overflow-hidden"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-display tracking-tight">INCroute Advisory Desk</span>
              </div>
              <button
                onClick={() => setShowAdvisoryMenu(false)}
                className="w-7 h-7 rounded-full bg-[var(--bg-surface-alt)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Advisory Options */}
            <div className="space-y-2.5">
              
              {/* WhatsApp Corporate Advisory */}
              <a
                href="https://wa.me/918707552183?text=Hello%20INCroute%20Team%2C%20I%20need%20assistance%20with%20company%20registration"
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowAdvisoryMenu(false)}
                className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-[var(--text-primary)] rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] font-display">WhatsApp Advisory</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">+91 87075 52183</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </a>

              {/* Request Advisory Callback */}
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
                    <h5 className="text-xs font-bold font-display">Request Expert Callback</h5>
                    <p className="text-[10px] opacity-90 font-mono">15-Min Free Consultation</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uniform Mobile Bottom Dock */}
      <div className="bg-[var(--bg-surface)]/85 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-full px-6 py-2.5 shadow-2xl shadow-purple-950/20 flex items-center justify-between transition-all">
        
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer active:scale-90 ${
            isHomeActive ? "text-[var(--accent)] scale-105" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Services Catalog */}
        <button
          onClick={handleServicesClick}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer active:scale-90 ${
            isServicesActive ? "text-[var(--accent)] scale-105" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Services</span>
        </button>

        {/* Advisory (Uniform Phone Icon) */}
        <button
          onClick={() => setShowAdvisoryMenu(!showAdvisoryMenu)}
          aria-label="Corporate Advisory Menu"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer active:scale-90 ${
            showAdvisoryMenu ? "text-[var(--accent)] scale-105" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <PhoneCall className="w-5 h-5" />
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
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer active:scale-90 ${
            isToolsActive ? "text-[var(--accent)] scale-105" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span>AI Tools</span>
        </button>

      </div>
    </div>
  );
}
