import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Info, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [revealedCount, setRevealedCount] = useState(0);
  const totalSteps = milestones.length;

  // Auto-reveal cards one by one with a delay
  useEffect(() => {
    if (revealedCount >= totalSteps) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, revealedCount === 0 ? 300 : 800);

    return () => clearTimeout(timer);
  }, [revealedCount, totalSteps]);

  // Auto-scroll the container to show the latest card
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current && revealedCount > 1) {
      requestAnimationFrame(() => {
        scrollAreaRef.current?.scrollTo({
          left: scrollAreaRef.current.scrollWidth,
          behavior: "smooth",
        });
      });
    }
  }, [revealedCount]);

  // Navigation Arrows & Drag Scroll State
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const updateArrows = () => {
    if (scrollAreaRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateArrows();
    }, 100);
    return () => clearTimeout(timer);
  }, [revealedCount]);

  useEffect(() => {
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  const handleScroll = () => {
    updateArrows();
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollAreaRef.current) {
      const { clientWidth } = scrollAreaRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollAreaRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollAreaRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollAreaRef.current.offsetLeft);
    setScrollLeftState(scrollAreaRef.current.scrollLeft);
    setHasDragged(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollAreaRef.current) return;
    const x = e.pageX - scrollAreaRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplier for drag speed
    if (Math.abs(walk) > 5) {
      e.preventDefault();
      setHasDragged(true);
      scrollAreaRef.current.scrollLeft = scrollLeftState - walk;
    }
  };

  return (
    <div className="relative w-full py-4 overflow-hidden">
      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-brand-bg-lighter/90 backdrop-blur-sm border border-brand-border rounded-full px-4 py-2">
          {milestones.map((_, idx) => (
            <div
              key={idx}
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: idx < revealedCount ? 20 : 10,
                backgroundColor: idx < revealedCount ? "#C7A86B" : "#2A2D31",
              }}
            />
          ))}
          <span className="text-[9px] font-mono text-brand-text-muted ml-2">
            {revealedCount}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Horizontal card row — wrapped in a relative group container for absolute navigation chevrons */}
      <div className="relative w-full group">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-brand-bg-lighter/95 backdrop-blur-md border border-brand-gold/40 hover:border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black shadow-lg shadow-black/45 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-brand-bg-lighter/95 backdrop-blur-md border border-brand-gold/40 hover:border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black shadow-lg shadow-black/45 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full overflow-x-auto pb-4 ${isMouseDown ? "select-none" : ""}`}
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            cursor: isMouseDown ? "grabbing" : "grab"
          }}
        >
          <style>{`.pinned-scroll::-webkit-scrollbar { display: none; }`}</style>
          <div className="pinned-scroll flex gap-4 px-1" style={{ width: "max-content" }}>
            {milestones.slice(0, revealedCount).map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 80, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 1, 0.5, 1],
                  opacity: { duration: 0.4 },
                }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex-shrink-0 w-[280px] sm:w-[310px]"
              >
                {/* Gold accent on top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/60 rounded-t-2xl" />

                {/* Big step number background */}
                <span className="absolute -top-2 -right-2 text-[90px] font-bold text-brand-gold/[0.04] leading-none select-none pointer-events-none font-serif">
                  {idx + 1}
                </span>

                {/* Content */}
                <div className="relative z-10 space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {milestone.days}
                    </span>
                    <span className="text-[8px] font-mono text-brand-text-muted">
                      {idx + 1}/{totalSteps}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-brand-text leading-snug">
                    {milestone.title}
                  </h3>

                  <p className="text-[9px] font-mono text-brand-gold uppercase tracking-widest">
                    {milestone.form}
                  </p>

                  <p className="text-[11px] text-brand-text-muted leading-relaxed">
                    {milestone.description}
                  </p>

                  <div className="p-2.5 bg-brand-gold/5 border border-brand-gold/15 rounded-lg flex items-start gap-2">
                    <Info className="w-3 h-3 text-brand-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] text-brand-text/85 leading-relaxed">
                      <span className="font-bold text-brand-gold">Pro Tip: </span>
                      {milestone.tip}
                    </p>
                  </div>

                  <div className="p-2.5 compliance-penalty-card border rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <span className="text-[8px] uppercase font-mono tracking-wider font-bold text-red-400">Penalty</span>
                    </div>
                    <p className="text-[10px] compliance-penalty-text leading-relaxed">
                      {milestone.penalty}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      if (hasDragged) {
                        e.preventDefault();
                        return;
                      }
                      onDelegate();
                    }}
                    className="w-full text-[9px] font-mono uppercase tracking-widest font-bold py-2.5 rounded-xl border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black transition-colors cursor-pointer"
                  >
                    Delegate This Task <ArrowRight className="w-3 h-3 inline ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion indicator */}
      {revealedCount === totalSteps && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mt-3"
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-brand-gold uppercase tracking-widest">
            ✓ Full compliance timeline revealed
          </div>
        </motion.div>
      )}

      {/* Bottom progress bar */}
      <div className="mt-4">
        <div className="h-1 bg-brand-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-gold rounded-full"
            initial={false}
            animate={{ width: `${(revealedCount / totalSteps) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
