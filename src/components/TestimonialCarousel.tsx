import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, Quote, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppNavigate } from "../lib/useAppNavigate";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  entityType: string;
  rating: number;
  content: string;
}

interface TestimonialCarouselProps {
  setActiveTab?: (tab: string) => void;
}

export default function TestimonialCarousel({ setActiveTab }: TestimonialCarouselProps) {
  const navigateToTab = useAppNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live testimonials from API
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        if (data.success && data.testimonials) {
          setTestimonials(data.testimonials.filter((t: any) => t.approved));
        }
      } catch (err) {
        console.error("Failed to load testimonials for carousel:", err);
      }
    }
    fetchTestimonials();
  }, []);

  // Auto-rotate every 2 seconds
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(testimonials.length, 1));
    }, 2000);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length > 1 && !isPaused) {
      startInterval();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonials.length, isPaused, startInterval]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleClick = () => {
    navigateToTab("testimonials");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex % testimonials.length];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-6 relative overflow-hidden cursor-pointer group hover:border-brand-gold/40 transition-all duration-200"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 blur-2xl rounded-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 relative z-10"
        >
          {/* Quote icon */}
          <Quote className="w-5 h-5 text-brand-gold/40" />

          {/* Content */}
          <p className="text-xs italic text-brand-text leading-relaxed font-serif line-clamp-3">
            "{current.content}"
          </p>

          {/* Rating + Author */}
          <div className="flex items-center justify-between pt-2 border-t border-brand-border/50">
            <div>
              <h4 className="text-xs font-bold text-brand-text">{current.name}</h4>
              <p className="text-[9px] text-brand-text-muted font-mono">
                {current.designation} • {current.entityType}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-3 relative z-10">
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                idx === currentIndex % testimonials.length
                  ? "bg-brand-gold w-3"
                  : "bg-brand-border"
              }`}
            />
          ))}
        </div>
      )}

      {/* Hover CTA */}
      <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <span className="text-[8px] font-mono uppercase tracking-widest text-brand-gold flex items-center gap-1">
          View All <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
}
