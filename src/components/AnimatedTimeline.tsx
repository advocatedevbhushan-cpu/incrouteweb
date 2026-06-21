import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, AlertTriangle, Lightbulb, CheckCircle2, Clock } from "lucide-react";

interface TimelineItem {
  days: string;
  title: string;
  form: string;
  description: string;
  penalty: string;
  tip: string;
}

interface AnimatedTimelineProps {
  items: TimelineItem[];
}

export default function AnimatedTimeline({ items }: AnimatedTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="w-full py-12 px-4">
      {/* Timeline Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-gold bg-clip-text text-transparent mb-4 display-font">
          Compliance Journey Timeline
        </h2>
        <p className="text-brand-text-muted text-sm max-w-2xl mx-auto font-sans leading-relaxed">
          Follow your business through every critical compliance milestone. Each deadline carries important penalties and strategic timing.
        </p>
      </motion.div>

      {/* Timeline Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-4"
      >
        {items.map((item, index) => (
          <motion.div key={index} variants={itemVariants}>
            {/* Timeline Item */}
            <div className="relative">
              {/* Connector Line */}
              {index < items.length - 1 && (
                <div className="absolute left-8 top-24 w-0.5 h-8 bg-gradient-to-b from-brand-blue to-brand-gold opacity-40" />
              )}

              {/* Main Card */}
              <motion.button
                onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex gap-6 items-start group">
                  {/* Timeline Dot */}
                  <motion.div
                    animate={expandedIndex === index ? { scale: 1.2 } : { scale: 1 }}
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 font-mono ${
                      expandedIndex === index
                        ? "bg-brand-blue text-brand-gold border-brand-gold shadow-lg shadow-brand-gold/15"
                        : "bg-brand-bg-lighter border-brand-border text-brand-text-muted group-hover:border-brand-gold group-hover:text-brand-gold"
                    }`}
                  >
                    <span>
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Card Content */}
                  <div className="flex-1 pt-2">
                    <div
                      className={`p-6 rounded-2xl border transition-all duration-300 ${
                        expandedIndex === index
                          ? "bg-brand-bg-lighter border-brand-gold/45 shadow-xl shadow-brand-gold/5"
                          : "bg-brand-bg-lighter/85 border-brand-border group-hover:border-brand-gold/30"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-brand-gold" />
                            <span className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest font-mono">
                              {item.days}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-brand-text mb-1 font-sans">{item.title}</h3>
                          <p className="text-xs text-brand-text-muted font-sans font-light">{item.form}</p>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="pt-1.5"
                        >
                          <ChevronDown className="w-5 h-5 text-brand-gold flex-shrink-0" />
                        </motion.div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedIndex === index && (
                          <motion.div
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-6 pt-6 border-t border-brand-border"
                          >
                            {/* Description */}
                            <div className="mb-6 text-left">
                              <h4 className="text-[10px] font-semibold text-brand-text uppercase tracking-widest mb-2 font-mono">
                                What you need to do
                              </h4>
                              <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-light">{item.description}</p>
                            </div>

                            {/* Penalty Alert */}
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="mb-4 p-4 bg-red-500/5 border border-red-500/15 rounded-xl flex gap-3 text-left"
                            >
                              <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] font-semibold text-red-600 uppercase tracking-widest mb-1 font-mono">
                                  Penalty for Delay
                                </p>
                                <p className="text-xs text-red-950 font-sans leading-relaxed">{item.penalty}</p>
                              </div>
                            </motion.div>

                            {/* Pro Tip */}
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex gap-3 text-left"
                            >
                              <Lightbulb className="w-4.5 h-4.5 text-brand-gold flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] font-semibold text-brand-gold uppercase tracking-widest mb-1 font-mono">
                                  Pro Tip
                                </p>
                                <p className="text-xs text-brand-text-muted font-sans leading-relaxed">{item.tip}</p>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 p-6 bg-gradient-to-r from-brand-blue/5 to-brand-gold/5 border border-brand-border rounded-2xl max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-gold" />
          <p className="text-brand-text font-semibold text-sm font-sans">
            Plan ahead and we'll help you meet every deadline!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
