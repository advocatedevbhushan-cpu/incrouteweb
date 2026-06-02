import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowRight, Info } from "lucide-react";

interface Milestone {
  days: string;
  title: string;
  form: string;
  description: string;
  penalty: string;
  tip: string;
}

interface PinnedTimelineProps {
  milestones: Milestone[];
  onDelegate: () => void;
}

export default function PinnedTimeline({ milestones, onDelegate }: PinnedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const totalSteps = milestones.length;

  // Manual scroll tracking — works regardless of parent overflow
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;

    // How far we've scrolled into the container
    // When top of container hits top of viewport, scrolled = 0
    // When bottom of container hits bottom of viewport, scrolled = 1
    const scrolled = -rect.top / (containerHeight - viewportHeight);
    const clamped = Math.max(0, Math.min(1, scrolled));

    setProgress(clamped);
    const step = Math.min(totalSteps - 1, Math.floor(clamped * totalSteps));
    setActiveStep(step);
  }, [totalSteps]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    // Tall container — creates the scroll distance
    <div ref={containerRef} style={{ height: `${totalSteps * 100}vh` }} className="relative">
      {/* Sticky card area — stays visible while scrolling through the tall container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full transition-transform duration-700"
            style={{
              background: "radial-gradient(circle, rgba(199,168,107,0.04) 0%, transparent 70%)",
              transform: `translate(-50%, -50%) scale(${1 + activeStep * 0.1})`,
            }}
          />
        </div>

        {/* Top pagination */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-brand-bg-lighter/90 backdrop-blur-sm border border-brand-border rounded-full px-4 py-2">
            {milestones.map((_, idx) => (
              <div
                key={idx}
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: activeStep === idx ? 24 : 10,
                  backgroundColor: activeStep === idx ? "#C7A86B" : idx < activeStep ? "rgba(199,168,107,0.4)" : "#2A2D31",
                }}
              />
            ))}
            <span className="text-[9px] font-mono text-brand-text-muted ml-2">
              {activeStep + 1}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Right progress bar */}
        <div className="absolute right-4 top-20 bottom-20 w-[2px] bg-brand-border rounded-full overflow-hidden z-20">
          <div
            className="w-full bg-brand-gold rounded-full origin-top transition-all duration-150"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        {/* Card area */}
        <div className="w-full max-w-2xl mx-auto px-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-7 sm:p-10 shadow-xl relative overflow-hidden"
            >
              {/* Gold sweep overlay */}
              <motion.div
                className="absolute inset-0 bg-brand-gold/[0.03] pointer-events-none"
                initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 0.5, delay: 0.05 }}
              />

              {/* Big step number */}
              <span className="absolute -top-4 -right-4 text-[140px] font-bold text-brand-gold/[0.04] leading-none select-none pointer-events-none font-serif">
                {activeStep + 1}
              </span>

              {/* Content */}
              <div className="relative z-10 space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    {milestones[activeStep].days}
                  </span>
                  <span className="text-[9px] font-mono text-brand-text-muted">
                    Step {activeStep + 1} of {totalSteps}
                  </span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 }}
                  className="text-2xl sm:text-3xl font-semibold text-brand-text leading-tight"
                >
                  {milestones[activeStep].title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[10px] font-mono text-brand-gold uppercase tracking-widest"
                >
                  {milestones[activeStep].form}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 }}
                  className="text-sm text-brand-text-muted leading-relaxed"
                >
                  {milestones[activeStep].description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 }}
                  className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex items-start gap-3"
                >
                  <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-text/85 leading-relaxed">
                    <span className="font-bold text-brand-gold">Pro Tip: </span>
                    {milestones[activeStep].tip}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 }}
                  className="p-4 compliance-penalty-card border rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-red-400">Penalty Warning</span>
                  </div>
                  <p className="text-xs compliance-penalty-text leading-relaxed">
                    {milestones[activeStep].penalty}
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44 }}
                  onClick={onDelegate}
                  className="w-full text-xs font-mono uppercase tracking-widest font-bold py-4 rounded-xl border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black transition-colors cursor-pointer"
                  style={{ minHeight: "48px" }}
                >
                  Delegate This Task <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[9px] font-mono text-brand-text-muted/60 uppercase tracking-widest animate-pulse">
            {activeStep < totalSteps - 1 ? "Scroll to continue ↓" : "✓ Timeline complete"}
          </span>
        </div>
      </div>
    </div>
  );
}
