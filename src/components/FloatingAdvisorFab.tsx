import React, { useState } from "react";
import { MessageSquare, Phone, X, Sparkles, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingAdvisorFabProps {
  setActiveTab?: (tab: string) => void;
}

export default function FloatingAdvisorFab({ setActiveTab }: FloatingAdvisorFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-[998] pointer-events-auto">
      
      {/* Expanded Quick Action Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-72 sm:w-80 bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-4 shadow-2xl space-y-3.5 text-left"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-display">CA & CS Support Desk</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[var(--text-primary)] font-display">Speak Directly with Expert CAs</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                Call +91 87075 52183 directly for instant registration & tax compliance guidance.
              </p>
            </div>

            <div className="pt-1 space-y-2">
              {/* Direct Phone Call Button */}
              <a
                href="tel:+918707552183"
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] text-xs font-bold rounded-xl shadow-md flex items-center justify-between cursor-pointer font-display hover:opacity-95 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Call +91 87075 52183
                </span>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded">Instant</span>
              </a>

              {/* Direct WhatsApp Button */}
              <a
                href="https://wa.me/918707552183?text=Hello%20INCroute%20Team%2C%20I%20need%20assistance%20with%20company%20registration"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer font-sans hover:border-[var(--accent)]/40 transition-all"
              >
                <span className="flex items-center gap-2 text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp +91 87075 52183
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Chat</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Call Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group px-4 py-3 bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 rounded-full shadow-2xl shadow-purple-950/20 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        
        <span className="text-xs font-bold text-[var(--text-primary)] font-display flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-[var(--accent)]" /> Call Support
        </span>

        <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-110 transition-transform">
          <Sparkles className="w-3 h-3" />
        </span>
      </button>

    </div>
  );
}
