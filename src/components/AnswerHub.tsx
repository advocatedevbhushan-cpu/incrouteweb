import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal, { ScrollRevealItem } from "./ScrollReveal";
import { useAppNavigate } from "../lib/useAppNavigate";
import { FAQ_DATA, FAQ_CATEGORIES } from "../lib/faq-data";
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  BookOpen,
  ExternalLink
} from "lucide-react";

interface AnswerHubProps {
  setActiveTab?: (tab: string) => void;
}

/** Renders the detail string (with \n and • markers) into structured paragraphs and lists */
function DetailRenderer({ detail }: { detail: string }) {
  const blocks = detail.split("\n").filter(line => line.trim() !== "");

  return (
    <div className="space-y-2 text-[11px] font-sans text-brand-text-muted leading-relaxed">
      {blocks.map((line, i) => {
        const trimmed = line.trim();
        // Bullet points
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          const content = trimmed.replace(/^[•\-]\s*/, "");
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-brand-gold mt-0.5 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
            </div>
          );
        }
        // Numbered items (e.g. "1. Phase one")
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-brand-gold font-mono font-bold shrink-0">{trimmed.match(/^(\d+)\./)?.[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(trimmed.replace(/^\d+\.\s*/, "")) }} />
            </div>
          );
        }
        // Section headers (lines ending with colon)
        if (trimmed.endsWith(":") && trimmed.length < 80) {
          return (
            <p key={i} className="font-semibold text-brand-text pt-2 text-xs">
              {trimmed}
            </p>
          );
        }
        // Regular paragraph
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />
        );
      })}
    </div>
  );
}

/** Converts **bold** markers and text in parentheses to styled spans */
function formatBold(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-text font-semibold">$1</strong>');
}

export default function AnswerHub({ setActiveTab }: AnswerHubProps) {
  const navigateToTab = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  // Map FAQ_CATEGORIES for the filter buttons (exclude "all" count details — just use labels)
  const categories = useMemo(() => 
    FAQ_CATEGORIES.map(cat => ({ id: cat.id, label: cat.label, count: cat.count })),
    []
  );

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return FAQ_DATA.filter(faq => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch = !query || 
        faq.question.toLowerCase().includes(query) || 
        faq.bluf.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-12 text-left max-w-5xl mx-auto">
      
      {/* JSON-LD FAQPage Schema for crawlers (rendered in HTML for client-side SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_DATA.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.bluf
              }
            }))
          })
        }}
      />

      {/* Search Hub Header */}
      <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Expert Knowledge Base
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Corporate Filing <span className="text-brand-gold italic font-normal">Knowledge Hub.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          Instant answers to your registration, compliance, and filing questions — structured for clarity and backed by expert legal insight.
        </p>
      </ScrollReveal>

      {/* Interactive Search Tool */}
      <ScrollReveal 
        variant="fade-up" 
        delay={0.1}
        className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
        
        {/* Search Bar Input */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-brand-text-muted/40" />
          <input
            type="text"
            placeholder="Ask a filing question (e.g. 'incorporation speed', 'OPC documents', 'LLP capital')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-3 pl-12 text-sm text-brand-text placeholder-brand-text-muted/30 outline-none focus:border-brand-gold shadow-inner transition-colors duration-250"
          />
        </div>

        {/* Category Choice Row */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2 border-t border-brand-border/40">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[9px] font-mono tracking-wider uppercase px-4 py-2 rounded-lg transition-all duration-150 ${
                selectedCategory === cat.id
                  ? "bg-brand-gold text-black font-bold shadow-md shadow-brand-gold/15"
                  : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Accordion FAQ Loop — with Schema.org microdata for crawlers */}
      <ScrollReveal 
        variant="fade" 
        staggerChildren={0.06}
        className="space-y-4"
      >
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <ScrollRevealItem 
              key={faq.id} 
              variant="fade-up"
              className={`bg-brand-bg-lighter border rounded-2xl transition-all duration-300 overflow-hidden ${
                isExpanded ? "border-brand-gold/45 shadow-lg shadow-brand-gold/5" : "border-brand-border hover:border-brand-border-hover"
              }`}
            >
              {/* Semantic article wrapper with microdata for SEO crawlers */}
              <article itemScope itemType="https://schema.org/Question">
                {/* Question Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 font-serif text-brand-text text-sm sm:text-base font-light transition-colors hover:text-brand-gold cursor-pointer"
                  aria-expanded={isExpanded}
                  aria-controls={`answer-${faq.id}`}
                >
                  <span className="flex items-center gap-3" itemProp="name">
                    <HelpCircle className="w-5 h-5 text-brand-gold shrink-0" aria-hidden="true" />
                    {faq.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-brand-text-muted shrink-0" aria-hidden="true" />
                  )}
                </button>

                {/* Hidden answer text for crawlers (always in DOM, visually hidden when collapsed) */}
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="sr-only" aria-hidden="true">
                  <span itemProp="text">{faq.bluf}</span>
                </div>

                {/* Collapsible Answer Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`answer-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      role="region"
                      aria-labelledby={`question-${faq.id}`}
                    >
                    <div className="px-6 pb-6 pt-1 border-t border-brand-border/40 space-y-5">
                      
                      {/* BLUF Quick Answer Card */}
                      <div className="bg-brand-gold/5 border border-brand-gold/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 blur-xl rounded-full" />
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-brand-gold uppercase tracking-widest font-bold mb-2">
                          <Sparkles className="w-3.5 h-3.5" /> Quick Answer (BLUF)
                        </div>
                        <p className="text-xs text-brand-text font-serif leading-relaxed italic">
                          "{faq.bluf}"
                        </p>
                      </div>

                      {/* In-depth Detail */}
                      <div className="space-y-3">
                        <div className="text-[9px] font-mono text-[#9E896A] uppercase tracking-widest font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> In-Depth Advisory Notes
                        </div>
                        <DetailRenderer detail={faq.detail} />
                      </div>

                      {/* Related Questions */}
                      {faq.relatedIds.length > 0 && (
                        <div className="pt-3 border-t border-brand-border/30 space-y-2">
                          <p className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest">People also ask:</p>
                          <div className="flex flex-wrap gap-2">
                            {faq.relatedIds.slice(0, 3).map(refId => {
                              const related = FAQ_DATA.find(q => q.id === refId);
                              if (!related) return null;
                              return (
                                <button
                                  key={refId}
                                  onClick={() => setExpandedId(refId)}
                                  className="text-[10px] font-sans text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  {related.question.length > 50 ? related.question.slice(0, 50) + "…" : related.question}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Service CTA */}
                      <button
                        onClick={() => navigateToTab(faq.serviceLink.replace("/", ""))}
                        className="text-[10px] uppercase font-mono tracking-widest font-bold text-brand-gold hover:underline flex items-center gap-1.5 mt-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {faq.serviceName}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </article>
            </ScrollRevealItem>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="py-12 text-center text-brand-text-muted italic font-serif bg-brand-bg-lighter border border-brand-border rounded-2xl">
            No advisory answers match your query. Try a broader term like "Pvt Ltd", "GST", or "documents".
          </div>
        )}
      </ScrollReveal>

    </div>
  );
}
