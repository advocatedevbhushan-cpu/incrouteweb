import React, { useState, useEffect } from "react";
import { Phone, X, ArrowRight, Key, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeadlineItem {
  id: string;
  badge: string;
  badgeClass: string;
  pulseClass: string;
  icon: React.ComponentType<{ className?: string }>;
  boldText: string;
  subText: string;
  ctaText: string;
  ctaAction?: string;
}

const HEADLINES: HeadlineItem[] = [
  {
    id: "consultation",
    badge: "INCroute LIVE · 99.4% SLA",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pulseClass: "bg-emerald-400",
    icon: Sparkles,
    boldText: "Fast-Track Legal Desk Online",
    subText: "Free 1-on-1 Senior CA Consultation & Startup Legal Blueprint 2026.",
    ctaText: "Book Free Consultation",
    ctaAction: "consultation",
  },
  {
    id: "dsc",
    badge: "⚡ 15-MIN VIDEO e-KYC",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    pulseClass: "bg-amber-400",
    icon: Key,
    boldText: "Class-3 Digital Signature (DSC)",
    subText: "Paperless Video e-KYC Verification & Same-Day FIPS Crypto USB Hardware Token Dispatch.",
    ctaText: "Get Class-3 DSC",
    ctaAction: "dsc",
  },
  {
    id: "incorporation",
    badge: "🚀 7-10 DAYS ROC SLA",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    pulseClass: "bg-cyan-400",
    icon: Zap,
    boldText: "SPICe+ Company Incorporation",
    subText: "Private Limited & LLP Registration with Zero-Surprise Fixed Legal Fee Guarantee.",
    ctaText: "Start Company Setup",
    ctaAction: "incorporation",
  },
  {
    id: "trademark",
    badge: "🛡️ TRADEMARK 24H FILING",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    pulseClass: "bg-purple-400",
    icon: ShieldCheck,
    boldText: "Trademark & Brand Protection",
    subText: "Instant TM Class Application Number in 24 Hours with AI Similarity Search.",
    ctaText: "Protect Your Brand",
    ctaAction: "trademark",
  },
];

interface TopAnnouncementBarProps {
  onBookConsultation?: () => void;
  onSelectService?: (serviceId: string) => void;
}

export default function TopAnnouncementBar({ onBookConsultation, onSelectService }: TopAnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("incroute_top_announcement_dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  useEffect(() => {
    if (isDismissed) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("incroute_top_announcement_dismissed", "true");
  };

  if (isDismissed) return null;
  const current = HEADLINES[currentIndex];
  const IconComponent = current.icon;

  const handleCtaClick = () => {
    if (current.ctaAction === "consultation" && onBookConsultation) {
      onBookConsultation();
    } else if (current.ctaAction === "dsc" && onSelectService) {
      onSelectService("pvt-ltd");
    } else if (current.ctaAction === "trademark" && onSelectService) {
      onSelectService("trademark-registration");
    } else if (onBookConsultation) {
      onBookConsultation();
    }
  };

  return (
    <aside aria-label="Statutory Announcement" className="relative z-30 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-500/20 py-2 px-4 text-xs font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-left">
        {/* Animated Cycling Headline */}
        <div className="flex-1 min-w-[280px] overflow-hidden py-0.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2.5 flex-wrap"
            >
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border shadow-sm ${current.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${current.pulseClass}`} />
                <IconComponent className="w-3 h-3 shrink-0" />
                <span>{current.badge}</span>
              </span>

              <span className="text-slate-300 text-[11px] sm:text-xs leading-snug">
                <strong className="text-white font-bold">{current.boldText}</strong> — {current.subText}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right CTA Action Links */}
        <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
          <button
            onClick={handleCtaClick}
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1 font-bold cursor-pointer border-none bg-transparent p-0 transition-colors"
          >
            <span>{current.ctaText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <a
            href="tel:+918707552183"
            className="text-slate-300 hover:text-white flex items-center gap-1 font-bold no-underline hidden md:flex transition-colors"
          >
            <Phone className="w-3 h-3 text-indigo-400" />
            <span>CA Helpline: +91 87075 52183</span>
          </a>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer border-none bg-transparent ml-1"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

