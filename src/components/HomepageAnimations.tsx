import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { CalendarCheck, FileText, Shield, HelpCircle, Receipt, Users, CheckCircle2, Clock, Building2, TrendingUp } from "lucide-react";

// ─── REDUCED MOTION HOOK ───
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── 1. ROTATING BUSINESS INSIGHT ───
const INSIGHTS = [
  "Track ROC, GST and trademark updates in one place.",
  "Upload documents once. Access them anytime.",
  "Know what's pending before it becomes urgent.",
  "Manage incorporation, compliance and advisory from one platform.",
  "Get notified before deadlines — not after penalties.",
  "One dashboard for your entire business lifecycle.",
];

export function RotatingInsight() {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % INSIGHTS.length), 2500);
    return () => clearInterval(timer);
  }, [reduced]);

  if (reduced) return <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] mt-3 max-w-lg">{INSIGHTS[0]}</p>;

  return (
    <div className="h-[22px] sm:h-[24px] mt-3 overflow-hidden relative max-w-lg">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] absolute inset-x-0"
        >
          {INSIGHTS[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}


// ─── 2. DASHBOARD PREVIEW WITH ANIMATED HIGHLIGHTS ───
const MODULES = [
  { icon: CalendarCheck, label: "Compliance Health", tip: "Track pending filings and deadlines across all entities", gradient: "from-indigo-500 to-purple-500" },
  { icon: FileText, label: "Document Vault", tip: "Securely store and verify business documents", gradient: "from-blue-500 to-cyan-500" },
  { icon: Shield, label: "Trademark Tracking", tip: "Monitor application status from filing to registration", gradient: "from-violet-500 to-fuchsia-500" },
  { icon: HelpCircle, label: "Support Center", tip: "Resolve client queries with priority-based routing", gradient: "from-amber-500 to-orange-500" },
  { icon: Receipt, label: "Invoicing", tip: "Generate, send and track payment status", gradient: "from-emerald-500 to-teal-500" },
  { icon: Users, label: "Advisory Team", tip: "Dedicated advisor for every client engagement", gradient: "from-rose-500 to-pink-500" },
];

export function DashboardPreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % MODULES.length), 2200);
    return () => clearInterval(timer);
  }, [reduced, inView]);

  return (
    <div ref={ref} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {MODULES.map((m, i) => {
          const active = i === activeIdx && !reduced;
          return (
            <motion.div
              key={m.label}
              animate={active ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`relative bg-[var(--bg-surface)] rounded-2xl p-4 text-center cursor-default transition-all duration-300 border ${active ? "border-[var(--accent)] shadow-[0_8px_32px_-8px_rgba(108,124,255,0.25)]" : "border-[var(--border-subtle)] shadow-sm"}`}
            >
              <div className={`w-10 h-10 mx-auto mb-2.5 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? `bg-gradient-to-br ${m.gradient} shadow-lg` : "bg-[var(--accent-soft)]"}`}>
                <m.icon className={`w-5 h-5 transition-colors duration-300 ${active ? "text-white" : "text-[var(--accent)]"}`} />
              </div>
              <p className={`text-[11px] font-semibold transition-colors duration-300 leading-tight ${active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{m.label}</p>
            </motion.div>
          );
        })}
      </div>
      {/* Feature description */}
      <div className="h-[44px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <p className="text-[12px] text-[var(--text-primary)] font-medium">{MODULES[activeIdx].tip}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 3. PROCESS FLOW ANIMATION ───
const STEPS = [
  { label: "Choose Service", icon: Building2 },
  { label: "Upload Documents", icon: FileText },
  { label: "Expert Processing", icon: Users },
  { label: "Track Progress", icon: TrendingUp },
  { label: "Completion", icon: CheckCircle2 },
];

export function ProcessFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setInterval(() => setActiveStep(i => (i + 1) % STEPS.length), 2000);
    return () => clearInterval(timer);
  }, [reduced, inView]);

  return (
    <div ref={ref} className="flex items-center justify-between gap-1 sm:gap-2 max-w-2xl mx-auto py-6">
      {STEPS.map((step, i) => {
        const active = i <= activeStep;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <motion.div
                animate={{ scale: i === activeStep ? 1.1 : 1, opacity: active ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${active ? "bg-[var(--accent-soft)] border border-[var(--accent)]" : "bg-[var(--bg-surface)] border border-[var(--border-subtle)]"}`}
              >
                <step.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`} />
              </motion.div>
              <p className={`text-[9px] sm:text-[10px] font-medium text-center transition-colors duration-300 ${active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>{step.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-[2px] flex-1 max-w-[40px] rounded-full overflow-hidden bg-[var(--border-subtle)]">
                <motion.div animate={{ width: i < activeStep ? "100%" : "0%" }} transition={{ duration: 0.4 }} className="h-full bg-[var(--accent)]" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}


// ─── 4. COMPLIANCE CALENDAR PREVIEW ───
const REMINDERS = [
  { text: "GST Return due in 5 days", icon: CalendarCheck, urgency: "warning", color: "from-amber-500 to-orange-500" },
  { text: "ROC filing due in 18 days", icon: FileText, urgency: "info", color: "from-blue-500 to-indigo-500" },
  { text: "Trademark renewal upcoming", icon: Shield, urgency: "info", color: "from-violet-500 to-purple-500" },
  { text: "Board meeting pending", icon: Users, urgency: "warning", color: "from-rose-500 to-pink-500" },
  { text: "TDS return due in 12 days", icon: Receipt, urgency: "info", color: "from-emerald-500 to-teal-500" },
  { text: "DIR-3 KYC due Sep 30", icon: CheckCircle2, urgency: "info", color: "from-cyan-500 to-blue-500" },
];

export function CompliancePreview() {
  const [visibleIdx, setVisibleIdx] = useState(0);
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setInterval(() => setVisibleIdx(i => (i + 1) % REMINDERS.length), 3000);
    return () => clearInterval(timer);
  }, [reduced, inView]);

  const getVisible = () => {
    const items = [];
    for (let i = 0; i < 3; i++) items.push(REMINDERS[(visibleIdx + i) % REMINDERS.length]);
    return items;
  };

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CalendarCheck className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[var(--text-primary)]">Upcoming Deadlines</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">Auto-tracked for all entities</p>
        </div>
      </div>
      <AnimatePresence mode="popLayout">
        {getVisible().map((item, i) => (
          <motion.div
            key={`${item.text}-${visibleIdx}-${i}`}
            initial={reduced ? {} : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? {} : { opacity: 0, x: 16 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="flex items-center gap-3 px-4 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
              <item.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[var(--text-primary)] font-medium">{item.text}</p>
            </div>
            {item.urgency === "warning" && <span className="w-2 h-2 rounded-full bg-[var(--warning)] shrink-0 animate-pulse" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── 5. TRUST METRICS COUNTER ───
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || started || !startOnView) return;
    setStarted(true);
    if (reduced) {
      setCount(end);
      return;
    }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration, started, startOnView, reduced]);

  return { count, ref };
}

export function TrustMetrics() {
  const businesses = useCountUp(50);
  const documents = useCountUp(200);
  const filings = useCountUp(100);
  const categories = useCountUp(15);

  const metrics = [
    { label: "Businesses Served", ...businesses },
    { label: "Documents Managed", ...documents },
    { label: "Compliance Filings", ...filings },
    { label: "Service Categories", ...categories },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {metrics.map(m => (
        <div key={m.label} ref={m.ref} className="text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tabular-nums">{m.count.toLocaleString()}+</p>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── 6. SCROLL REVEAL WRAPPER ───
export function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children helper
export function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = usePrefersReducedMotion();

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
