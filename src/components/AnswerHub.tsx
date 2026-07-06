import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppNavigate } from "../lib/useAppNavigate";
import { FAQ_DATA } from "../lib/faq-data";
import { 
  HelpCircle, Search, Sparkles, ArrowRight, ChevronDown, ChevronUp, 
  BookOpen, ExternalLink, Calendar, FileText, Check, Award, Star, 
  ShieldCheck, RefreshCw, Layers, Compass, Clock, GraduationCap, 
  Percent, Building2, Lock, Plus, Minus, Send, Phone, ClipboardList, 
  ShieldAlert, Lightbulb, CheckSquare, MessageSquare, BookOpenCheck, Users
} from "lucide-react";

interface AnswerHubProps {
  setActiveTab?: (tab: string) => void;
}

// Circular bullet points & bold formatter for detailed content
function DetailRenderer({ detail }: { detail: string }) {
  const blocks = detail.split("\n").filter(line => line.trim() !== "");

  return (
    <div className="space-y-3 text-[11.5px] font-sans text-slate-500 leading-relaxed text-left">
      {blocks.map((line, i) => {
        const trimmed = line.trim();
        
        // Bullet lists
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          const content = trimmed.replace(/^[•\-]\s*/, "");
          return (
            <div key={i} className="flex items-start gap-2.5 pl-2">
              <span className="text-[#4F46E5] mt-1 shrink-0 text-xs">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
            </div>
          );
        }
        
        // Numbered list items
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-2.5 pl-2">
              <span className="text-[#4F46E5] font-mono font-bold shrink-0">{trimmed.match(/^(\d+)\./)?.[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(trimmed.replace(/^\d+\.\s*/, "")) }} />
            </div>
          );
        }
        
        // Block section headers
        if (trimmed.endsWith(":") && trimmed.length < 80) {
          return (
            <p key={i} className="font-extrabold text-[#080F2A] pt-3 text-xs">
              {trimmed}
            </p>
          );
        }
        
        // Standard text blocks
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />
        );
      })}
    </div>
  );
}

function formatBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\?/g, '<strong class="text-[#080F2A] font-extrabold">$1</strong>');
}

// Grouped Categories Mapping
const GROUPED_CATEGORIES = [
  { id: "all", label: "All Categories", count: FAQ_DATA.length, rawCategories: ["all"] },
  { id: "incorporation", label: "Incorporation", count: FAQ_DATA.filter(q => ["pvt-ltd", "opc", "llp", "msme"].includes(q.category)).length, rawCategories: ["pvt-ltd", "opc", "llp", "msme"] },
  { id: "compliance", label: "Compliance", count: FAQ_DATA.filter(q => ["roc"].includes(q.category)).length, rawCategories: ["roc"] },
  { id: "government", label: "Government Filings", count: FAQ_DATA.filter(q => ["fssai", "section8"].includes(q.category)).length, rawCategories: ["fssai", "section8"] },
  { id: "taxation", label: "Taxation", count: FAQ_DATA.filter(q => ["gst-tax"].includes(q.category)).length, rawCategories: ["gst-tax"] },
  { id: "legal", label: "Legal & IP", count: FAQ_DATA.filter(q => ["trademark", "general"].includes(q.category)).length, rawCategories: ["trademark", "general"] },
] as const;

export default function AnswerHub({ setActiveTab }: AnswerHubProps) {
  const navigateToTab = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"popular" | "recent">("popular");
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_DATA[0]?.id || null);
  const [faqLimit, setFaqLimit] = useState(8);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const faqAccordionRef = useRef<HTMLDivElement>(null);

  // Filter and sort items
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    // Find active categories mapped to current group
    const activeGroupMeta = GROUPED_CATEGORIES.find(g => g.id === selectedGroup);
    const validRawCategories = (activeGroupMeta ? activeGroupMeta.rawCategories : ["all"]) as readonly string[];

    let results = FAQ_DATA.filter(faq => {
      const matchesCategory = validRawCategories.includes("all") || validRawCategories.includes(faq.category);
      const matchesSearch = !query || 
        faq.question.toLowerCase().includes(query) || 
        faq.bluf.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });

    // Handle Recently Added subtab sorting
    if (activeSubTab === "recent") {
      results = [...results].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    }

    return results;
  }, [searchQuery, selectedGroup, activeSubTab]);

  const visibleFaqs = useMemo(() => filteredFaqs.slice(0, faqLimit), [filteredFaqs, faqLimit]);

  // Featured Resources Mapped to Real FAQ ids
  const featuredResources = [
    { id: "pvt-1", title: "Private Limited Company Registration", desc: "Step-by-step process, documents, fees & compliance.", icon: Building2, color: "text-[#4F46E5] bg-[#4F46E5]/10" },
    { id: "llp-4", title: "ROC Compliance Calendar", desc: "Never miss a deadline with our compliance calendar calendar.", icon: Calendar, color: "text-emerald-600 bg-emerald-500/10" },
    { id: "gen-1", title: "DIN & DSC Guide", desc: "Understanding Director Identification Number & Digital Signature.", icon: Lock, color: "text-purple-600 bg-purple-500/10" },
    { id: "gst-1", title: "GST Registration Made Simple", desc: "Eligibility, documents & registration process.", icon: ClipboardList, color: "text-teal-600 bg-teal-500/10" },
    { id: "gst-5", title: "Startup India Registration", desc: "Benefits, process & tax exemptions explained.", icon: Sparkles, color: "text-[#635BFF] bg-[#635BFF]/10" }
  ];

  const handleFeaturedCardClick = (id: string) => {
    setExpandedId(id);
    const targetFaq = FAQ_DATA.find(q => q.id === id);
    if (targetFaq) {
      const parentGroup = GROUPED_CATEGORIES.find(g => (g.rawCategories as readonly string[]).includes(targetFaq.category));
      if (parentGroup) {
        setSelectedGroup(parentGroup.id);
      }
    }
    faqAccordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickLink = (filterType: "group" | "search", val: string) => {
    if (filterType === "group") {
      setSelectedGroup(val);
      setSearchQuery("");
    } else {
      setSearchQuery(val);
      setSelectedGroup("all");
    }
    faqAccordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <div className="space-y-16 text-left w-full font-sans relative z-10 overflow-visible">
      
      {/* JSON-LD FAQPage Schema for SEO crawlers */}
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

      {/* Hero Section */}
      <div className="relative pt-8 pb-10 overflow-visible max-w-[820px] mx-auto w-full text-center space-y-4">
        {/* Left Side Illustration */}
        <div className="hidden xl:block absolute -left-48 top-4 z-10 glass-illustration-left pointer-events-none select-none">
          <div className="w-[176px] h-[144px] relative perspective-[800px]" style={{ transformStyle: 'preserve-3d' }}>
            {/* Outer glow aura */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
            
            {/* Folder Back layer */}
            <div className="absolute left-4 top-4 w-32 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-500/10 border border-white/40 shadow-md backdrop-blur-md" style={{ transform: 'rotateY(-15deg) rotateZ(-5deg)', transformStyle: 'preserve-3d' }}>
              {/* Folder Tab */}
              <div className="absolute -top-2 left-4 w-12 h-4 rounded-t-lg bg-indigo-500/20 border-t border-x border-white/40" />
            </div>

            {/* Document Stack sliding out */}
            <div className="absolute left-8 top-1 w-24 h-28 rounded-xl bg-white/95 border border-slate-200 shadow-sm flex flex-col p-3 gap-2" style={{ transform: 'rotateY(-10deg) rotateZ(-2deg)' }}>
              <div className="w-12 h-1.5 bg-indigo-200 rounded-full" />
              <div className="w-16 h-1 bg-slate-100 rounded-full" />
              <div className="w-14 h-1 bg-slate-100 rounded-full" />
              <div className="w-10 h-1 bg-slate-100 rounded-full" />
            </div>
            <div className="absolute left-6 top-2 w-24 h-28 rounded-xl bg-white/80 border border-slate-200 shadow-sm flex flex-col p-3 gap-2" style={{ transform: 'rotateY(-12deg) rotateZ(-4deg)' }}>
              <div className="w-10 h-1.5 bg-purple-200 rounded-full" />
              <div className="w-14 h-1 bg-slate-100/80 rounded-full" />
              <div className="w-12 h-1 bg-slate-100/80 rounded-full" />
            </div>

            {/* Folder Front layer */}
            <div className="absolute left-2 top-8 w-[136px] h-[88px] rounded-2xl bg-gradient-to-br from-white/70 to-white/30 border border-white/60 shadow-[0_8px_32px_rgba(31,41,95,0.06)] backdrop-blur-[8px]" style={{ transform: 'rotateY(-12deg) rotateZ(-5deg)' }} />

            {/* Glassmorphic Magnifying glass in foreground */}
            <div className="absolute bottom-1 right-2 w-16 h-16 bg-gradient-to-br from-[#4F46E5]/90 to-[#7C3AED]/90 border border-white/30 rounded-full shadow-[0_12px_24px_rgba(79,70,229,0.3)] flex items-center justify-center" style={{ transform: 'translateZ(40px)' }}>
              <Search className="w-7 h-7 text-white drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Right Side Illustration */}
        <div className="hidden xl:block absolute -right-48 top-2 z-10 glass-illustration-right pointer-events-none select-none">
          <div className="w-[176px] h-[144px] relative perspective-[800px]" style={{ transformStyle: 'preserve-3d' }}>
            {/* Outer glow aura */}
            <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
            
            {/* Document sheet */}
            <div className="absolute left-4 top-2 w-32 h-[104px] rounded-2xl bg-white border border-slate-200/80 shadow-md flex flex-col p-4 gap-2.5" style={{ transform: 'rotateY(15deg) rotateZ(5deg)', transformStyle: 'preserve-3d' }}>
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-16 h-1 bg-slate-100 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-slate-200 rounded" />
                <div className="w-12 h-1 bg-slate-100 rounded-full" />
              </div>
            </div>

            {/* Floating Lightbulb */}
            <div className="absolute -top-5 right-2 w-11 h-11 bg-white border border-yellow-200 rounded-full shadow-lg flex items-center justify-center animate-pulse z-20">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>

            {/* Glassmorphic Shield in foreground */}
            <div className="absolute bottom-1 right-2 w-16 h-20 bg-gradient-to-br from-[#7C3AED]/90 to-[#635BFF]/90 border border-white/30 rounded-2xl shadow-[0_12px_24px_rgba(124,58,237,0.3)] flex items-center justify-center animate-bounce" style={{ transform: 'translateZ(40px)', animationDuration: '3s' }}>
              <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold rounded-full border border-indigo-500/10 uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Knowledge That Empowers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black text-[#080F2A] tracking-[-0.045em] leading-[1.1]">
            Corporate Filing <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic font-black pr-3 pb-1.5 inline-block">Knowledge Hub.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl mx-auto leading-relaxed font-medium">
            Your one-stop destination for corporate compliance, filings, legal insights, and business registrations in India.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-16 overflow-visible">
        
        {/* Large Glass Search Panel */}
        <div className="bg-white/85 border border-indigo-500/10 rounded-3xl p-6 shadow-xl backdrop-blur-md w-full space-y-6">
          {/* Input bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword (e.g. &quot;Private Limited Company&quot;, &quot;DIN&quot;, &quot;ROC compliance&quot;, &quot;GST registration&quot;)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#4F46E5] rounded-2xl px-5 py-3.5 pl-12 text-xs text-[#080F2A] placeholder-slate-400 outline-none shadow-inner transition-colors font-medium"
            />
          </div>

          {/* Category Pills Choice - Rectangular Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 pt-4 border-t border-slate-100">
            {/* All Topics dropdown-like Card */}
            <button 
              onClick={() => { setSelectedGroup("all"); setFaqLimit(8); }}
              className={`flex flex-col justify-center px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${
                selectedGroup === "all"
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white border-[#4F46E5] shadow-md shadow-[#4F46E5]/15"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-extrabold font-sans">All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </div>
              <span className={`text-[9px] mt-0.5 font-light ${selectedGroup === "all" ? "text-indigo-100" : "text-slate-400"}`}>
                {FAQ_DATA.length} Articles
              </span>
            </button>

            {/* Other categories */}
            {GROUPED_CATEGORIES.slice(1).map((g) => {
              const isActive = selectedGroup === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => { setSelectedGroup(g.id); setFaqLimit(8); }}
                  className={`flex flex-col justify-center px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${
                    isActive 
                      ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white border-[#4F46E5] shadow-md shadow-[#4F46E5]/15"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <span className="text-[11px] font-extrabold font-sans block leading-snug">{g.label}</span>
                  <span className={`text-[9px] mt-0.5 block font-light leading-none ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                    {g.count} Articles
                  </span>
                </button>
              );
            })}
          </div>

          {/* Trust tags strip */}
          <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap pt-2 text-[10px] font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Expert Verified</span>
            <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-[#4F46E5]" /> Plain English</span>
            <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-[#4F46E5]" /> Updated Regularly</span>
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#4F46E5]" /> India Focused</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-[#4F46E5]" /> 100% Free</span>
          </div>
        </div>

        {/* Featured Resources Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-[#080F2A] tracking-tight font-sans">Featured Resources</h3>
            <button 
              onClick={() => handleQuickLink("group", "all")}
              className="flex items-center gap-1 text-[#4F46E5] hover:text-[#3730A3] font-bold text-xs transition-colors cursor-pointer"
            >
              View all articles <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {featuredResources.map((res) => {
              const Icon = res.icon;
              return (
                <div 
                  key={res.id}
                  onClick={() => handleFeaturedCardClick(res.id)}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-left flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className={`p-2.5 rounded-full ${res.color} w-fit`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-[#080F2A] group-hover:text-[#4F46E5] transition-colors leading-snug">{res.title}</h4>
                    <p className="text-[10px] text-slate-400 font-normal leading-normal">{res.desc}</p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="p-1 rounded bg-slate-50 text-slate-400 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accordion FAQ Loop & Sidebar grid */}
        <div ref={faqAccordionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-6">
          
          {/* Left Column: FAQ Accordion Panel (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            {/* Header & Subtabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-4">
              <h3 className="text-base font-black text-[#080F2A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#4F46E5]" /> FAQ Advisory Board
              </h3>
              
              <div className="bg-slate-100 p-0.5 rounded-xl flex gap-1 shadow-inner">
                <button 
                  onClick={() => setActiveSubTab("popular")}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer font-extrabold ${
                    activeSubTab === "popular" ? "bg-white text-[#080F2A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Popular Questions
                </button>
                <button 
                  onClick={() => setActiveSubTab("recent")}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer font-extrabold ${
                    activeSubTab === "recent" ? "bg-white text-[#080F2A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Recently Added
                </button>
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-4">
              {visibleFaqs.map((faq, index) => {
                const isExpanded = expandedId === faq.id;
                const formattedIndex = String(index + 1).padStart(2, "0");

                return (
                  <div 
                    key={faq.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                      isExpanded 
                        ? "border-indigo-500/25 bg-gradient-to-b from-indigo-500/5 to-white shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <article itemScope itemType="https://schema.org/Question">
                      {/* Header trigger */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 font-sans font-bold text-xs sm:text-sm text-[#080F2A] hover:text-[#4F46E5] transition-colors cursor-pointer outline-none"
                      >
                        <span className="flex items-center gap-3.5" itemProp="name">
                          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-mono font-bold shrink-0 ${
                            isExpanded ? "bg-[#4F46E5] text-white" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {formattedIndex}
                          </span>
                          {faq.question}
                        </span>
                        {isExpanded ? (
                          <Minus className="w-4 h-4 text-[#4F46E5] shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {/* SEO schema helper */}
                      <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="sr-only">
                        <span itemProp="text">{faq.bluf}</span>
                      </div>

                      {/* Collapse details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="px-5 pb-5 pt-1.5 border-t border-slate-100/50 space-y-4 text-left">
                              
                              {/* Quick Factors highlight card for Pvt Ltd (matching reference image) */}
                              {faq.id === "pvt-1" && (
                                <div className="bg-[#4F46E5]/5 border border-[#4F46E5]/15 rounded-xl p-4 space-y-2 text-left">
                                  <p className="text-[11px] font-extrabold text-[#080F2A]">Key factors that affect timeline:</p>
                                  <div className="space-y-1.5 pl-1 text-[10.5px] font-medium text-slate-600">
                                    <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" /> Name approval (1-2 working days)</p>
                                    <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" /> Document preparation & verification (2-3 working days)</p>
                                    <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" /> Government processing & certificate issuance (2-3 working days)</p>
                                  </div>
                                </div>
                              )}

                              {/* BLUF Highlight Card */}
                              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden text-left">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full" />
                                <div className="flex items-center gap-1 px-2.5 py-0.5 w-fit rounded bg-[#4F46E5]/10 border border-indigo-500/10 text-[#4F46E5] text-[8px] font-mono font-bold uppercase tracking-wider mb-2">
                                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> Quick Answer (BLUF)
                                </div>
                                <p className="text-xs font-semibold text-[#080F2A] leading-relaxed italic pr-4">
                                  "{faq.bluf}"
                                </p>
                              </div>

                              {/* Detailed renderer */}
                              <div className="space-y-2 pt-1">
                                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-[#4F46E5]" /> In-Depth Advisory Notes
                                </div>
                                <DetailRenderer detail={faq.detail} />
                              </div>

                              {/* Related items */}
                              {faq.relatedIds.length > 0 && (
                                <div className="pt-3 border-t border-slate-100/80 space-y-2 text-left">
                                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">People also ask:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {faq.relatedIds.slice(0, 3).map(refId => {
                                      const related = FAQ_DATA.find(q => q.id === refId);
                                      if (!related) return null;
                                      return (
                                        <button
                                          key={refId}
                                          onClick={() => setExpandedId(refId)}
                                          className="text-[10px] text-slate-400 hover:text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer font-medium font-sans"
                                        >
                                          <ArrowRight className="w-3 h-3 text-[#4F46E5]" />
                                          {related.question.length > 55 ? related.question.slice(0, 55) + "…" : related.question}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* External Service CTA */}
                              <div className="pt-2">
                                <button
                                  onClick={() => navigateToTab("services")}
                                  className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest font-bold text-[#4F46E5] hover:text-[#3F37C9] transition-all cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {faq.serviceName}
                                </button>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </article>
                  </div>
                );
              })}

              {filteredFaqs.length === 0 && (
                <div className="py-16 text-center text-slate-400 italic font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl font-sans">
                  No advisory answers match your query. Try searching for "Pvt Ltd", "GST", or "filings".
                </div>
              )}
            </div>

            {/* Pagination triggers */}
            {filteredFaqs.length > faqLimit && (
              <div className="flex justify-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setFaqLimit(l => l + 8)}
                  className="flex items-center gap-1 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[10px] font-bold text-slate-600 hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-all cursor-pointer uppercase tracking-wider font-sans shadow-sm"
                >
                  Load More Questions <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            
            {/* Quick Links Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm text-left space-y-4">
              <h4 className="text-[12px] font-black uppercase text-[#080F2A] tracking-wider mb-2 flex items-center gap-2">
                Quick Links
              </h4>
              
              <div className="flex flex-col gap-2">
                {[
                  { label: "Company Registration Process", icon: Building2, color: "text-[#4F46E5] bg-[#4F46E5]/10", action: () => handleQuickLink("group", "incorporation") },
                  { label: "Compliance Calendar", icon: Calendar, color: "text-purple-600 bg-purple-500/10", action: () => handleQuickLink("group", "compliance") },
                  { label: "ROC Filing Guide", icon: ClipboardList, color: "text-[#4F46E5] bg-[#4F46E5]/10", action: () => handleQuickLink("group", "compliance") },
                  { label: "Taxation & GST", icon: Percent, color: "text-purple-600 bg-purple-500/10", action: () => handleQuickLink("group", "taxation") },
                  { label: "Legal & Documentation", icon: FileText, color: "text-[#4F46E5] bg-[#4F46E5]/10", action: () => handleQuickLink("group", "legal") },
                  { label: "Director's Corner", icon: Users, color: "text-purple-600 bg-purple-500/10", action: () => handleQuickLink("search", "director") },
                  { label: "Startup Resources", icon: Sparkles, color: "text-[#4F46E5] bg-[#4F46E5]/10", action: () => handleQuickLink("search", "startup") },
                ].map((link, i) => {
                  const LinkIcon = link.icon;
                  return (
                    <button
                      key={i}
                      onClick={link.action}
                      className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-[#4F46E5] transition-colors text-left py-2 border-b border-slate-50 hover:border-indigo-500/10 cursor-pointer w-full group"
                    >
                      <div className={`p-1.5 rounded-lg ${link.color} shrink-0`}>
                        <LinkIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expert Help Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white space-y-4 relative overflow-hidden shadow-xl text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-xl rounded-full" />
              
              {/* Headset Client Rep Avatar overlay in bottom-right */}
              <div className="absolute bottom-2 right-2 opacity-25 select-none pointer-events-none">
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <div className="space-y-2 relative z-10">
                <h4 className="text-base font-black">Still have questions?</h4>
                <p className="text-[11px] text-indigo-50/80 leading-relaxed font-sans font-light">
                  Our compliance experts are here to help you navigate ROC filings and legal document structures.
                </p>
              </div>

              <div className="space-y-3 pt-2 relative z-10">
                <button 
                  onClick={() => { if (setActiveTab) setActiveTab("contact"); }}
                  className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans py-3 shadow-md shadow-black/5"
                >
                  Talk to an Expert <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 justify-center text-[10px] font-mono text-indigo-100 font-bold">
                  <Phone className="w-3.5 h-3.5" /> Call us: +91 888 888 1234
                </div>
              </div>
            </div>

            {/* Stats Card - Custom Colors */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm text-left space-y-4">
              <h4 className="text-[12px] font-black uppercase text-[#080F2A] tracking-wider mb-2">
                Knowledge Hub Stats
              </h4>
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#080F2A] block leading-none">50+</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase block mt-0.5">Expert Articles</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-500 border border-sky-100">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#080F2A] block leading-none">200+</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase block mt-0.5">FAQs Answered</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#080F2A] block leading-none">Weekly</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase block mt-0.5">Updated Content</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#080F2A] block leading-none">100%</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase block mt-0.5">Free Access</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Why thousands trust Incroute Knowledge Hub */}
        <div className="w-full pt-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h4 className="text-[12px] font-black uppercase text-[#080F2A] tracking-wider text-center mb-6">Why thousands trust Incroute Knowledge Hub</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
              <div className="space-y-2">
                <div className="p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 w-fit">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="text-[11px] font-black text-[#080F2A] font-sans">Expert Verified Content</h5>
                <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">Reviewed by legal & compliance experts.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 w-fit">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <h5 className="text-[11px] font-black text-[#080F2A] font-sans">Plain English Guides</h5>
                <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">Complex corporate topics explained simply.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 w-fit">
                  <Layers className="w-4 h-4" />
                </div>
                <h5 className="text-[11px] font-black text-[#080F2A] font-sans">Indian Laws Focused</h5>
                <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">Aligned with latest MCA, ROC & Govt. norms.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 w-fit">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h5 className="text-[11px] font-black text-[#080F2A] font-sans">Always Updated</h5>
                <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">Regularly updated with legal & regulatory changes.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 w-fit">
                  <Star className="w-4 h-4" />
                </div>
                <h5 className="text-[11px] font-black text-[#080F2A] font-sans">100% Free Access</h5>
                <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">No paywall. Corporate knowledge should be accessible.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card & engagement metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full pb-8">
          {/* Left card: Subscribe */}
          <div className="md:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white relative overflow-hidden shadow-xl text-left flex flex-col justify-between gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-xl rounded-full" />
            
            {/* Elegant transparent floating email envelope overlay in bottom right */}
            <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none select-none">
              <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <div className="space-y-2 relative z-10">
              <h4 className="text-lg font-black">Stay Updated. Stay Compliant.</h4>
              <p className="text-xs text-indigo-50/80 leading-relaxed font-sans font-light">
                Subscribe to get the latest compliance updates, legal changes, and expert insights.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative z-10 flex gap-2 w-full mt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white placeholder-indigo-200/50 outline-none transition-colors"
              />
              <button 
                type="submit"
                className="bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow flex items-center gap-1"
              >
                Subscribe Now <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <p className="text-[10px] text-emerald-300 font-mono font-bold mt-1">✓ Thank you for subscribing! Keep an eye on your inbox.</p>
            )}
          </div>

          {/* Right card: Engagement stats */}
          <div className="md:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="text-center space-y-2">
                <div className="inline-flex p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-[#080F2A] tracking-tight block">10,000+</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase block font-bold leading-none">Happy Readers</span>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-[#080F2A] tracking-tight block">500+</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase block font-bold leading-none">Topics Covered</span>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex p-2.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-[#080F2A] tracking-tight block">98%</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase block font-bold leading-none">Helpful Rate</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
