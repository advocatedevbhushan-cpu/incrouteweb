import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "motion/react";
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
  const totalSteps = milestones.length;

  // Track scroll within the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map progress to step index robustly
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // progress 0-0.25 = step 0, 0.25-0.5 = step 1, etc.
    const step = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
    setActiveStep(step);
  });

  // Progress bar height mapped directly
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} style={{ height: `${totalSteps * 100}vh` }} className="relative">
      {/* Sticky viewport — pins while user scrolls through the tall container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(199,168,107,0.04) 0%, transparent 70%)" }}
            animate={{ scale: 1 + activeStep * 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Top pagination dots */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-brand-bg-lighter/90 backdrop-blur-sm border border-brand-border rounded-full px-4 py-2">
            {milestones.map((_, idx) => (
              <motion.div
                key={idx}
                animate={{
                  width: activeStep === idx ? 24 : 10,
                  backgroundColor: activeStep === idx ? "#C7A86B" : idx < activeStep ? "rgba(199,168,107,0.4)" : "#2A2D31",
                }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="h-2.5 rounded-full"
              />
            ))}
            <span className="text-[9px] font-mono text-brand-text-muted ml-2">
              {activeStep + 1}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Right progress bar */}
        <div className="absolute right-4 top-20 bottom-20 w-[2px] bg-brand-border rounded-full overflow-hidden z-20">
          <motion.div className="w-full bg-brand-gold rounded-full origin-top" style={{ height: progressHeight }} />
        </div>

        {/* Stacked cards — all pre-rendered, only active one visible */}
        <div className="w-full max-w-2xl mx-auto px-6 relative z-10" style={{ perspective: "1000px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 40, rotateX: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-7 sm:p-10 shadow-xl relative overflow-hidden"
            >
              {/* Clip-path gold sweep */}
              <motion.div
                className="absolute inset-0 bg-brand-gold/[0.03] pointer-events-none"
                initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />

              {/* Large faded step number */}
              <span className="absolute -top-4 -right-4 text-[140px] font-bold text-brand-gold/[0.04] leading-none select-none pointer-events-none font-serif">
                {activeStep + 1}
              </span>

              {/* Content */}
              <div className="relative z-10 space-y-5">
                {/* Badge row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    {milestones[activeStep].days}
                  </span>
                  <span className="text-[9px] font-mono text-brand-text-muted">
                    Step {activeStep + 1} of {totalSteps}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-2xl sm:text-3xl font-semibold text-brand-text leading-tight"
                >
                  {milestones[activeStep].title}
                </motion.h3>

                {/* Form */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-[10px] font-mono text-brand-gold uppercase tracking-widest"
                >
                  {milestones[activeStep].form}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="text-sm text-brand-text-muted leading-relaxed"
                >
                  {milestones[activeStep].description}
                </motion.p>

                {/* Tip */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex items-start gap-3"
                >
                  <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-text/85 leading-relaxed">
                    <span className="font-bold text-brand-gold">Pro Tip: </span>
                    {milestones[activeStep].tip}
                  </p>
                </motion.div>

                {/* Penalty */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
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

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  onClick={onDelegate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-xs font-mono uppercase tracking-widest font-bold py-4 rounded-xl border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black transition-colors cursor-pointer"
                  style={{ minHeight: "48px" }}
                >
                  Delegate This Task <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <span className="text-[9px] font-mono text-brand-text-muted/70 uppercase tracking-widest">
            {activeStep < totalSteps - 1 ? "Scroll to continue ↓" : "✓ Timeline complete"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
