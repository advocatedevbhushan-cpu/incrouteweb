import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, Zap, X, MapPin, Key, Cpu } from "lucide-react";

interface ActivityItem {
  id: string;
  name: string;
  city: string;
  action: string;
  timeAgo: string;
  type: "incorporation" | "trademark" | "compliance" | "tax" | "dsc";
}

const ACTIVITIES: ActivityItem[] = [
  { id: "1", name: "Vikram S.", city: "Bengaluru, KA", action: "incorporated a Private Limited Company", timeAgo: "2 mins ago", type: "incorporation" },
  { id: "dsc-1", name: "Siddharth K.", city: "Bengaluru, KA", action: "issued Class-3 Paperless DSC (FIPS Crypto Hardware Token)", timeAgo: "4 mins ago", type: "dsc" },
  { id: "2", name: "Dr. Sneha R.", city: "Mumbai, MH", action: "filed Trademark Registration (Class 44)", timeAgo: "7 mins ago", type: "trademark" },
  { id: "3", name: "Amit P.", city: "Hyderabad, TS", action: "filed Form INC-20A Commencement of Business", timeAgo: "11 mins ago", type: "compliance" },
  { id: "dsc-2", name: "Meera R.", city: "Mumbai, MH", action: "completed 15-Min Paperless Video e-KYC for Director DSC", timeAgo: "14 mins ago", type: "dsc" },
  { id: "4", name: "Ananya M.", city: "Delhi NCR", action: "booked a Free 1-on-1 CA Strategy Consultation", timeAgo: "18 mins ago", type: "tax" },
  { id: "5", name: "Raghav M.", city: "Pune, MH", action: "registered Limited Liability Partnership (LLP)", timeAgo: "23 mins ago", type: "incorporation" },
  { id: "6", name: "Karthik V.", city: "Chennai, TN", action: "appointed Statutory Auditor (Form ADT-1)", timeAgo: "34 mins ago", type: "compliance" },
];

export default function LiveActivityToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Cycle every 14 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setIsVisible(true);
      }, 800);
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;
  const current = ACTIVITIES[currentIndex];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-5 z-[997] pointer-events-none font-sans">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto max-w-[320px] sm:max-w-sm rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-100 dark:border-slate-800 p-3.5 shadow-2xl shadow-indigo-950/20 text-left flex items-start gap-3 relative"
          >
            {/* Pulsing Verified Icon */}
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md ${
              current.type === "dsc"
                ? "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/30 ring-2 ring-amber-400/30"
                : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
            }`}>
              {current.type === "dsc" && <Key className="w-4 h-4 text-white animate-pulse" />}
              {current.type === "incorporation" && <Zap className="w-4 h-4" />}
              {current.type === "trademark" && <ShieldCheck className="w-4 h-4" />}
              {current.type === "compliance" && <CheckCircle2 className="w-4 h-4" />}
              {current.type === "tax" && <SparklesIcon className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-white">
                <span>{current.name}</span>
                <span className="text-[10px] font-normal text-slate-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-indigo-500" /> {current.city}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                {current.action}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-400">{current.timeAgo} · Verified via MCA SPICe+</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer border-none bg-transparent"
              aria-label="Dismiss live activity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
