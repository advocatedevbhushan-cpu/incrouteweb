import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, Sparkles } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  entityType: string;
  rating: number;
  content: string;
  approved: boolean;
  timestamp: string;
}

export default function TestimonialsSection() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Testimonials
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/testimonials");
      const data = await response.json();
      if (data.success && data.testimonials) {
        setList(data.testimonials);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Client Testimonials
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Founder Trust & <span className="text-brand-gold italic font-normal font-serif">Client Reflections.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          See what Indian startup founders and business owners are saying about our statutory filing speeds and elite CA/advocate review panels.
        </p>
      </div>

      <div className="border-b border-brand-border/60 pb-5 max-w-5xl mx-auto" />

      {/* Grid List View */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin mx-auto" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto text-left"
        >
          {list.map((review) => {
            return (
              <motion.div
                key={review.id}
                whileHover={{ y: -6, boxShadow: "0 15px 35px -12px rgba(197, 168, 128, 0.12)" }}
                className="p-5 rounded-2xl border-2 flex flex-col justify-between h-full relative transition-all duration-200 bg-brand-bg-lighter border-brand-border hover:border-brand-gold/30"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 blur-xl rounded-full" />
                
                <div className="space-y-4 relative z-10">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-brand-border"}`} 
                      />
                    ))}
                  </div>

                  {/* Content review text */}
                  <p className="text-xs text-brand-text/90 leading-relaxed font-sans font-light">
                    "{review.content}"
                  </p>
                </div>

                {/* Footer client identity details */}
                <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-brand-text">{review.name}</h4>
                    <p className="text-[10px] text-brand-text-muted leading-none font-sans font-light">{review.designation}</p>
                  </div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded">
                    {review.entityType}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {list.length === 0 && (
            <div className="col-span-full py-16 text-center text-brand-text-muted font-serif italic text-xs">
              No client testimonials present at this moment.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
