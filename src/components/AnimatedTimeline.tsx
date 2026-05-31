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
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Compliance Journey Timeline
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                <div className="absolute left-8 top-24 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30" />
              )}

              {/* Main Card */}
              <motion.button
                onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left"
              >
                <div className="flex gap-6 items-start group">
                  {/* Timeline Dot */}
                  <motion.div
                    animate={expandedIndex === index ? { scale: 1.3 } : { scale: 1 }}
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      expandedIndex === index
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 border-purple-400 shadow-lg shadow-purple-500/50"
                        : "bg-gray-800 border-gray-600 group-hover:border-blue-500"
                    }`}
                  >
                    <span className={expandedIndex === index ? "text-white" : "text-gray-300"}>
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Card Content */}
                  <div className="flex-1 pt-2">
                    <div
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        expandedIndex === index
                          ? "bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/50 shadow-xl shadow-purple-500/20"
                          : "bg-gray-900/50 border-gray-700 group-hover:border-blue-500/50"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                              {item.days}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-400">{item.form}</p>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-purple-400 flex-shrink-0" />
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
                            className="mt-6 pt-6 border-t border-gray-700"
                          >
                            {/* Description */}
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                What you need to do
                              </h4>
                              <p className="text-gray-400 leading-relaxed">{item.description}</p>
                            </div>

                            {/* Penalty Alert */}
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3"
                            >
                              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-1">
                                  Penalty for Delay
                                </p>
                                <p className="text-sm text-red-200">{item.penalty}</p>
                              </div>
                            </motion.div>

                            {/* Pro Tip */}
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3"
                            >
                              <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-1">
                                  Pro Tip
                                </p>
                                <p className="text-sm text-green-200">{item.tip}</p>
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
        className="text-center mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="text-gray-300 font-semibold">
            Plan ahead and we'll help you meet every deadline!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
