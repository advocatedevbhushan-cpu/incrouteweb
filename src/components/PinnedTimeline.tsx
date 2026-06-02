import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import Lenis from "lenis";

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

// Stagger variants for card children
const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.95,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerChildren = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const childVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function PinnedTimeline({ milestones, onDelegate }: PinnedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const totalSteps = milestones.length;

  // Global Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Track scroll progress within the pinned section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to active step
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const step = Math.min(totalSteps - 1, Math.floor(v * totalSteps));
    if (step !== activeStep) setActiveStep(step);
  });

  // Progress bar height (0% to 100%)
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const current = milestones[activeStep];

  return (
    <div className="relative">
      {/* Scroll height container — 100vh per step */}
      <div
        ref={containerRef}
        style={{ height: `${totalSteps * 100}vh` }}
        className="relative"
      >
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {/* Background depth effect */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
              style={{
                background: "radial-gradient(circle, var(--color-brand-gold) 0%, transparent 70%)",
              }}
              animate={{
                scale: 1 + activeStep * 0.08,
                x: activeStep % 2 === 0 ? -20 : 20,
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Progress indicator — top */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-2 bg-brand-bg-lighter/90 backdrop-blur-sm border border-brand-border rounded-full px-4 py-2">
              {milestones.map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    width: activeStep === idx ? 24 : 10,
                    backgroundColor: activeStep === idx ? "#C7A86B" : idx < activeStep ? "rgba(199,168,107,0.4)" : "#2A2D31",
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="h-2.5 rounded-full"
                />
              ))}
              <span className="text-[9px] font-mono text-brand-text-muted ml-2">
                {activeStep + 1}/{totalSteps}
              </span>
            </div>
          </div>

          {/* Vertical progress line — right */}
          <div className="absolute right-4 top-16 bottom-16 w-[2px] bg-brand-border rounded-full overflow-hidden z-20">
            <motion.div
              className="w-full bg-brand-gold rounded-full origin-top"
              style={{ height: progressHeight }}
            />
          </div>

          {/* Main card area */}
          <div className="w-full max-w-2xl mx-auto px-6 relative z-10" style={{ perspective: "1200px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ transformStyle: "preserve-3d" }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden"
              >
                {/* Clip-path reveal overlay */}
                <motion.div
                  className="absolute inset-0 bg-brand-gold/5 pointer-events-none"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Large background step number */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.04, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="absolute -top-4 -right-4 text-[160px] font-bold text-brand-gold leading-none select-none pointer-events-none font-serif"
                >
                  {activeStep + 1}
                </motion.span>

                {/* Content with stagger */}
                <motion.div
                  variants={staggerChildren}
                  initial="hidden"
                  animate="visible"
                  className="relative z-10 space-y-5"
                >
                  {/* Badge */}
                  <motion.div variants={childVariant} className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {current.days}
                    </span>
                    <span className="text-[9px] font-mono text-brand-text-muted">
                      Step {activeStep + 1} of {totalSteps}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    variants={childVariant}
                    className="text-2xl sm:text-3xl font-semibold text-brand-text leading-tight"
                  >
                    {current.title}
                  </motion.h3>

                  {/* Form */}
                  <motion.p variants={childVariant} className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">
                    {current.form}
                  </motion.p>

                  {/* Description */}
                  <motion.p variants={childVariant} className="text-sm text-brand-text-muted leading-relaxed">
                    {current.description}
                  </motion.p>

                  {/* Tip */}
                  <motion.div variants={childVariant} className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    <p className="text-xs text-brand-text/85 leading-relaxed">
                      <span className="font-bold text-brand-gold">Pro Tip: </span>
                      {current.tip}
                    </p>
                  </motion.div>

                  {/* Penalty */}
                  <motion.div variants={childVariant} className="p-4 compliance-penalty-card border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-red-400">Penalty Warning</span>
                    </div>
                    <p className="text-xs compliance-penalty-text leading-relaxed">
                      {current.penalty}
                    </p>
                  </motion.div>

                  {/* CTA */}
                  <motion.button
                    variants={childVariant}
                    onClick={onDelegate}
                    className="w-full text-xs font-mono uppercase tracking-widest font-bold py-4 rounded-xl border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black transition-all cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ minHeight: "48px" }}
                  >
                    Delegate This Task <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom scroll hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span className="text-[9px] font-mono text-brand-text-muted/60 uppercase tracking-widest">
              {activeStep < totalSteps - 1 ? "Scroll to continue ↓" : "Timeline complete ✓"}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
