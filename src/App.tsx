import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";
import ScrollToTop from "./components/ScrollToTop";
import RegistrationServices from "./components/RegistrationServices";
import { motion, AnimatePresence } from "motion/react";
import NameFeasibilityChecker from "./components/NameFeasibilityChecker";
import BlogPage from "./components/BlogPage";
import AboutPage from "./components/AboutPage";
import ServiceCatalogInsights from "./components/ServiceCatalogInsights";
import StatutoryTools from "./components/StatutoryTools";
import AnimatedTimeline from "./components/AnimatedTimeline";
import EntityComparison from "./components/EntityComparison";
import ServiceImpactDashboard from "./components/ServiceImpactDashboard";
import ComplianceFlowchart from "./components/ComplianceFlowchart";
import TestimonialsSection from "./components/TestimonialsSection";
import TestimonialCarousel from "./components/TestimonialCarousel";
import { ComplianceEvent } from "./types";
import { initAuth } from "./lib/firebase";
import ContactFormWidget from "./components/ContactFormWidget";
import LocalCityLanding from "./components/LocalCityLanding";
import AnswerHub from "./components/AnswerHub";
import { TAB_TO_ROUTE } from "./lib/routes";
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  Building2, 
  ArrowRight, 
  Award, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Loader2,
  CheckSquare,
  AlertCircle,
  Info,
  Scale,
  ShieldCheck,
  Check
} from "lucide-react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Reverse map: route path → tab name
  const ROUTE_TO_TAB: Record<string, string> = {};
  for (const [tab, route] of Object.entries(TAB_TO_ROUTE)) {
    ROUTE_TO_TAB[route] = tab;
  }

  const getTabFromPath = (): string => {
    const path = location.pathname;
    // Exact match
    if (ROUTE_TO_TAB[path]) return ROUTE_TO_TAB[path];
    // Try with trailing slash
    if (ROUTE_TO_TAB[path + "/"]) return ROUTE_TO_TAB[path + "/"];
    // Try without trailing slash
    if (ROUTE_TO_TAB[path.replace(/\/$/, "")]) return ROUTE_TO_TAB[path.replace(/\/$/, "")];
    // Default
    if (path === "/" || path === "") return "services";
    // Fallback: use first segment
    const seg = path.split("/").filter(Boolean)[0];
    return seg || "services";
  };

  const [activeTab, setActiveTabState] = useState<string>(getTabFromPath);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const route = TAB_TO_ROUTE[tab] || `/${tab}/`;
    if (location.pathname !== route) {
      navigate(route);
    }
  };

  // Sync tab state when URL changes (browser back/forward)
  useEffect(() => {
    setActiveTabState(getTabFromPath());
  }, [location.pathname]);

  // Roadmap State
  const [selectedMilestone, setSelectedMilestone] = useState(0);

  const roadmapMilestones = [
    {
      days: "30 Days",
      title: "First Board Meeting & Share Allocation",
      form: "Board Resolution & Form INC-22A (KYC)",
      description: "Convening the first board of directors meeting to adopt basic bylaws and issue share certificates to initial subscribers.",
      penalty: "₹50,000 penalty on directors and risk of registry warnings if share certificates are not dispatched within 60 days of incorporation.",
      tip: "Ensure you open a corporate bank account immediately to deposit the subscribed share capital!"
    },
    {
      days: "60 Days",
      title: "Auditor Appointment & LLP Deed",
      form: "Form ADT-1 (Auditor Appointment) or Form 3 (LLP Agreement)",
      description: "Appointing the statutory auditor of the company (Form ADT-1) or filing the stamped LLP partnership agreement with ROC (Form 3).",
      penalty: "₹300 per day recurring late filing fees on LLP partners, and daily compounding penalties on Pvt Ltd companies.",
      tip: "We can stamp and draft your custom LLP Partnership agreements for you automatically!"
    },
    {
      days: "180 Days",
      title: "Commencement of Business Certificate",
      form: "Form 20A (Commencement of Business Declaration)",
      description: "Filing a declaration with the ROC proving that subscribers have deposited their capital subscription into the company bank account.",
      penalty: "₹50,000 flat penalty plus ROC registry will strike-off the company automatically if not filed within 180 days of registry!",
      tip: "You cannot trade or start operations until Form 20A is approved!"
    },
    {
      days: "1 Year",
      title: "Annual ROC Filings AOC-4 & MGT-7",
      form: "Form AOC-4 (Financials) & Form MGT-7 (Annual Return)",
      description: "Filing the audited balance sheet, profit & loss statement, and current director profiles with the Central Registrar annually.",
      penalty: "₹100 per day flat penalty per form indefinitely, leading to directors being whitelisted as disqualified.",
      tip: "Keep clean invoices to ensure your statutory auditor can complete your balance sheet inside 30 days of the AGM!"
    }
  ];

  // Prefilled state to pass to RegistrationServices
  const [prefilledName, setPrefilledName] = useState<string>("");
  const [prefilledEntityType, setPrefilledEntityType] = useState<string>("");

  const handleServiceClick = (serviceId: string) => {
    setActiveTab("services");
    // Reset first so the useEffect always fires even if same service is clicked again
    setPrefilledEntityType("");
    setTimeout(() => {
      setPrefilledEntityType(serviceId);
    }, 0);
  };

  // Compliance Calendar State
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [calendarSearch, setCalendarSearch] = useState<string>("");

  useEffect(() => {
    initAuth();
  }, []);

  // Fetch compliance calendar events
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const response = await fetch("/api/compliance/calendar");
        const data = await response.json();
        if (data.success && data.calendar) {
          setComplianceEvents(data.calendar);
        }
      } catch (err) {
        console.error("Failed parsing compliance items:", err);
      } finally {
        setLoadingCalendar(false);
      }
    }
    fetchCalendar();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-gold/30 selection:text-brand-text relative">
      <ScrollToTop />
      {/* Executive Backdrop Pattern Layers */}
      <div className="executive-glow-1" />
      <div className="executive-glow-2" />
      <div className="executive-grid" />

      {/* Navbar segment */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <RegistrationServices 
                setActiveTab={setActiveTab} 
                prefilledCompanyName={prefilledName}
                prefilledEntityType={prefilledEntityType}
              />
              {/* Live Testimonial Carousel */}
              <div className="mt-12">
                <TestimonialCarousel setActiveTab={setActiveTab} />
              </div>
            </motion.div>
          )}

          {activeTab === "name-checker" && (
            <motion.div
              key="name-checker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <NameFeasibilityChecker 
                onOnboard={(brandName, entityType) => {
                  setPrefilledName(brandName);
                  // Map the user selected entity structure to standard catalog IDs
                  let mappedId = "pvt-ltd";
                  if (entityType) {
                    const lowerEntity = entityType.toLowerCase();
                    if (lowerEntity.includes("llp")) {
                      mappedId = "llp";
                    } else if (lowerEntity.includes("one person") || lowerEntity.includes("opc")) {
                      mappedId = "opc";
                    } else if (lowerEntity.includes("partnership")) {
                      mappedId = "partnership";
                    }
                  }
                  setPrefilledEntityType(mappedId);
                  setActiveTab("services");
                }}
              />
            </motion.div>
          )}

          {/* Contact Us Section */}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Reach Out To Us
                </div>
                <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
                  Expert Legal <span className="text-brand-gold italic font-normal">Consultation.</span>
                </h1>
                <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
                  Our registrars and compliance specialists are ready to guide you through your enterprise registration journey.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
                {/* Left Column: Form Intake */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-10 space-y-5">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <h3 className="text-xl font-light text-brand-text font-serif tracking-wide flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-brand-gold" /> Write to Us
                    </h3>
                  </div>

                  <ContactFormWidget />
                </div>

                {/* Right Column: Information & Map */}
                <div className="space-y-8">
                  <div className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
                    
                    <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-light text-brand-text serif">Direct Support</h3>
                      <p className="text-brand-text-muted font-sans text-sm">
                        Get in touch with our experts.
                      </p>
                    </div>
                    
                    <div className="space-y-6 relative z-10 mt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-brand-bg border border-brand-border text-brand-gold shrink-0">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-semibold mb-1">Contact Channels</h4>
                          <p className="text-sm text-brand-text-muted leading-relaxed font-sans mt-0.5">
                            Phone: +91 8707552183<br />
                            Email: info@incroute.com<br />
                            Hours: Mon-Fri, 9:00 AM - 6:00 PM IST
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights Blog Section */}
          {activeTab === "blog" && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <BlogPage />
            </motion.div>
          )}

          {/* Service Catalog */}
          {activeTab === "catalog" && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServiceCatalogInsights setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {/* Statutory Tools & Utilities */}
          {activeTab === "tools" && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <StatutoryTools />
            </motion.div>
          )}

          {/* Compliance Flowchart Visualization */}
          {activeTab === "flowchart" && (
            <motion.div
              key="flowchart"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ComplianceFlowchart />
            </motion.div>
          )}

          {/* Entity Comparison Visualization */}
          {activeTab === "comparison" && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <EntityComparison />
            </motion.div>
          )}

          {/* Service Impact Dashboard */}
          {activeTab === "impact" && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServiceImpactDashboard />
            </motion.div>
          )}

          {/* Animated Timeline Visualization */}
          {activeTab === "timeline-viz" && (
            <motion.div
              key="timeline-viz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedTimeline items={roadmapMilestones} />
            </motion.div>
          )}

          {/* Testimonials tab routing */}
          {activeTab === "testimonials" && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TestimonialsSection />
            </motion.div>
          )}

          {/* About Us Section */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AboutPage setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {/* Local City Landing Pages */}
          {activeTab === "company-registration-bangalore" && (
            <motion.div
              key="bangalore"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LocalCityLanding cityId="bangalore" setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "company-registration-mumbai" && (
            <motion.div
              key="mumbai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LocalCityLanding cityId="mumbai" setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "company-registration-delhi" && (
            <motion.div
              key="delhi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LocalCityLanding cityId="delhi" setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {/* Answer Hub */}
          {activeTab === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnswerHub setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {/* Compliance Calendars Section */}
          {activeTab === "compliance" && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
                  <img src="/ashoka_lion_gold.png" className="w-5 h-5 rounded-full object-cover border border-brand-gold/40 bg-black" alt="Emblem" />
                  Static Statutory Calendars
                </div>
                <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
                  Global Compliance <span className="text-brand-gold italic font-normal">Calendars Tracker.</span>
                </h1>
                <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
                  Unified live schedule of state, federal, and local financial statutory obligations. Keep your company fully operational and liability-free.
                </p>
              </div>

               {/* Premium Scroll-Driven Parallax Timeline */}
               <div className="max-w-5xl mx-auto space-y-8">
                 <div className="text-center space-y-3">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
                     First-Year Statutory Roadmap
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-light text-brand-text serif">
                     Post-Incorporation <span className="text-brand-gold italic font-normal">Compliance Timeline.</span>
                   </h3>
                   <p className="text-xs text-brand-text-muted font-sans max-w-lg mx-auto leading-relaxed">
                     Critical milestones every founder must complete after incorporation — miss one and face compounding penalties.
                   </p>
                 </div>

                 {/* 3D Perspective Timeline */}
                 <div className="relative" style={{ perspective: "1200px" }}>
                   {/* Central vertical line */}
                   <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-gold/60 via-brand-gold/30 to-transparent -translate-x-1/2 hidden md:block" />

                   <div className="space-y-0 md:space-y-0">
                     {roadmapMilestones.map((milestone, idx) => {
                       const isLeft = idx % 2 === 0;
                       const isActive = selectedMilestone === idx;
                       return (
                         <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 40, rotateX: -8 }}
                           animate={{ opacity: 1, y: 0, rotateX: 0 }}
                           transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                           className={`relative flex items-start md:items-center gap-4 md:gap-0 py-4 md:py-6 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                           style={{ transformStyle: "preserve-3d" }}
                         >
                           {/* Timeline node */}
                           <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-20">
                             <motion.button
                               onClick={() => setSelectedMilestone(idx)}
                               whileHover={{ scale: 1.3 }}
                               whileTap={{ scale: 0.9 }}
                               className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 cursor-pointer shadow-lg ${
                                 isActive
                                   ? "bg-brand-gold text-black border-brand-gold shadow-brand-gold/30"
                                   : idx < selectedMilestone
                                   ? "bg-brand-gold/20 text-brand-gold border-brand-gold/50"
                                   : "bg-brand-bg-lighter text-brand-text-muted border-brand-border hover:border-brand-gold/50"
                               }`}
                             >
                               {idx + 1}
                             </motion.button>
                           </div>

                           {/* Content card */}
                           <motion.div
                             onClick={() => setSelectedMilestone(idx)}
                             whileHover={{ scale: 1.02, rotateY: isLeft ? 2 : -2 }}
                             className={`ml-14 md:ml-0 md:w-[calc(50%-3rem)] cursor-pointer transition-all duration-300 ${
                               isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                             }`}
                             style={{ transformStyle: "preserve-3d" }}
                           >
                             <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                               isActive
                                 ? "bg-brand-bg-lighter border-brand-gold shadow-lg shadow-brand-gold/10"
                                 : "bg-brand-bg-lighter/50 border-brand-border hover:border-brand-gold/40"
                             }`}>
                               {/* Days badge */}
                               <div className="flex items-center justify-between mb-3">
                                 <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${
                                   isActive
                                     ? "bg-brand-gold/15 text-brand-gold border-brand-gold/30"
                                     : "bg-brand-bg text-brand-text-muted border-brand-border"
                                 }`}>
                                   {milestone.days}
                                 </span>
                                 {isActive && (
                                   <motion.div
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"
                                   />
                                 )}
                               </div>

                               {/* Title */}
                               <h4 className={`text-sm font-semibold mb-2 transition-colors ${
                                 isActive ? "text-brand-gold" : "text-brand-text"
                               }`}>
                                 {milestone.title}
                               </h4>

                               {/* Form tag */}
                               <p className="text-[10px] text-brand-text-muted font-mono leading-relaxed mb-3">
                                 {milestone.form}
                               </p>

                               {/* Expandable detail panel */}
                               {isActive && (
                                 <motion.div
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: "auto" }}
                                   exit={{ opacity: 0, height: 0 }}
                                   transition={{ duration: 0.3 }}
                                   className="space-y-3 pt-3 border-t border-brand-border/50"
                                 >
                                   <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                                     {milestone.description}
                                   </p>

                                   {/* Tip */}
                                   <div className="p-3 bg-brand-gold/5 border border-brand-gold/15 rounded-lg flex items-start gap-2">
                                     <Info className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                                     <p className="text-[10px] text-brand-text/85 leading-relaxed">
                                       <span className="font-bold text-brand-gold">Pro Tip: </span>
                                       {milestone.tip}
                                     </p>
                                   </div>

                                   {/* Penalty warning */}
                                   <div className="p-3 compliance-penalty-card border rounded-lg">
                                     <div className="flex items-center gap-1.5 mb-1.5">
                                       <AlertCircle className="w-3 h-3 text-red-400" />
                                       <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-red-400">Penalty</span>
                                     </div>
                                     <p className="text-[10px] compliance-penalty-text leading-relaxed">
                                       {milestone.penalty}
                                     </p>
                                   </div>

                                   <button
                                     type="button"
                                     onClick={(e) => { e.stopPropagation(); setActiveTab("contact"); }}
                                     className="w-full text-[9px] font-mono uppercase tracking-widest font-bold py-2.5 rounded-lg border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black transition-all cursor-pointer"
                                   >
                                     Delegate This Task <ArrowRight className="w-3 h-3 inline ml-1" />
                                   </button>
                                 </motion.div>
                               )}
                             </div>
                           </motion.div>
                         </motion.div>
                       );
                     })}
                   </div>
                 </div>
               </div>

              {/* Live Calendars Tracker Search */}
              <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-6">
                
                {/* Search & Filter Header Tool */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border">
                  {/* Search Bar Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/50" />
                    <input
                      type="text"
                      placeholder="Search standard compliance duties (e.g. ROC, GST, TDS, EPF)..."
                      value={calendarSearch}
                      onChange={(e) => setCalendarSearch(e.target.value)}
                      className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold"
                    />
                  </div>

                  {/* Filter Choices */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-mono mr-1.5">Category:</span>
                    {[
                      { id: "all", name: "All Duties" },
                      { id: "taxation", name: "Taxation & GST" },
                      { id: "corporate", name: "ROC & Corporate" },
                      { id: "employment", name: "Labor & Payroll" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterType(cat.id)}
                        className={`text-[10px] font-mono tracking-wider uppercase px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                          filterType === cat.id
                            ? "bg-brand-gold text-black font-semibold"
                            : "bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid representation */}
                {loadingCalendar ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-gold mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complianceEvents
                      .filter((ev) => {
                        const matchesCategory = filterType === "all" || ev.type === filterType;
                        const matchesSearch =
                          ev.service.toLowerCase().includes(calendarSearch.toLowerCase()) ||
                          ev.description.toLowerCase().includes(calendarSearch.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="p-5 bg-brand-bg-lighter border border-brand-border rounded-xl hover:border-brand-gold/30 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[9px] uppercase font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15">
                                {ev.type}
                              </span>
                              <span className="text-[10px] font-mono text-brand-text-muted font-bold">{ev.dueDate}</span>
                            </div>
                            
                            <h4 className="text-sm font-semibold text-brand-text tracking-wide">{ev.service}</h4>
                            <p className="text-xs text-brand-text-muted leading-relaxed font-sans">{ev.description}</p>
                          </div>

                          <div className="border-t border-brand-border/60 pt-3 mt-4 flex items-center justify-between text-[10px]">
                            <span className="text-brand-text-muted font-mono uppercase">Statutory Duty</span>
                            {ev.downloadUrl ? (
                              <a
                                href={ev.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-gold hover:underline flex items-center gap-1 font-semibold"
                              >
                                Access Official Portal <ArrowRight className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-brand-text-muted italic">Template Unavailable</span>
                            )}
                          </div>
                        </div>
                      ))}

                    {complianceEvents.filter((ev) => {
                      const matchesCategory = filterType === "all" || ev.type === filterType;
                      const matchesSearch =
                        ev.service.toLowerCase().includes(calendarSearch.toLowerCase()) ||
                        ev.description.toLowerCase().includes(calendarSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    }).length === 0 && (
                      <div className="col-span-full py-12 text-center text-brand-text-muted italic font-serif">
                        No statutory compliance events match your current filter credentials.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer segment */}
      <footer className="bg-brand-bg-darker border-t border-brand-border/70 py-12 md:py-16 text-brand-text-muted mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-3 space-y-5">
              <div className="flex items-center gap-2.5 cursor-pointer font-sans" onClick={() => handleServiceClick("pvt-ltd")}>
                <div className="p-2 bg-brand-dark rounded-lg border border-brand-border text-brand-gold flex items-center justify-center">
                  <Scale className="w-5 h-5 text-brand-gold stroke-[2]" />
                </div>
                <div className="flex flex-col select-none">
                  <span className="text-lg font-bold text-brand-text tracking-wider uppercase leading-none">
                    INC<span className="text-brand-gold font-serif italic font-normal tracking-normal text-xl lowercase">route</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-sm">
                Premium corporate registration and compliance advisory platform for startups, SMEs, and professionals in India.
              </p>
              <div className="text-[10px] font-mono tracking-widest text-[#9E896A] font-semibold uppercase pt-1">
                MAKE IT RIGHT
              </div>
            </div>

            {/* Column 2: Our Services */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-serif text-sm font-bold text-brand-text tracking-wide uppercase">
                Our Services
              </h4>
              <div className="grid grid-cols-1 gap-y-2.5 text-xs font-sans">
                <div className="space-y-2.5 flex flex-col items-start">
                  <div 
                    onClick={() => handleServiceClick("pvt-ltd")}
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200"
                  >
                    Private Limited Company
                  </div>
                  <div 
                    onClick={() => handleServiceClick("opc")}
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200"
                  >
                    One Person Company
                  </div>
                  <div 
                    onClick={() => handleServiceClick("section8")}
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200"
                  >
                    Section 8 NGO / Foundation
                  </div>
                  <div 
                    onClick={() => handleServiceClick("llp")}
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200"
                  >
                    Limited Liability Partnership
                  </div>
                  <a
                    href="/faq"
                    onClick={(e) => { e.preventDefault(); setActiveTab("faq"); }}
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none text-left"
                  >
                    Answer Hub (FAQ)
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Service Locations */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-serif text-sm font-bold text-brand-text tracking-wide uppercase">
                Service Locations
              </h4>
              <div className="space-y-2.5 text-xs font-sans flex flex-col items-start">
                <a 
                  href="/company-registration-bangalore"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-bangalore"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none text-left"
                >
                  Company Registration in Bangalore
                </a>
                <a 
                  href="/company-registration-mumbai"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-mumbai"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none text-left"
                >
                  Company Registration in Mumbai
                </a>
                <a 
                  href="/company-registration-delhi"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-delhi"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none text-left"
                >
                  Company Registration in Delhi NCR
                </a>
              </div>
            </div>

            {/* Column 4: Security & Trust */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-serif text-sm font-bold text-brand-text tracking-wide uppercase">
                Security & Trust
              </h4>
              <p className="text-xs text-brand-text-muted font-sans leading-relaxed">
                All filings are handled by registered advocates and chartered accountants. Your data is protected with TLS 1.3 encryption and 256-bit SSL.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* TLS Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-semibold text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TLS 1.3 Certified</span>
                </div>
                
                {/* SSL Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-[10px] font-semibold text-brand-gold">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                  <span>256-bit SSL</span>
                </div>
              </div>

              <div className="text-[10px] font-mono tracking-wider uppercase text-brand-text-muted/65 pt-2 select-none">
                © {new Date().getFullYear()} INCROUTE. ALL RIGHTS RESERVED.
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Mobile Floating CTA */}
      <div className="mobile-floating-cta">
        <button
          onClick={() => setActiveTab("services")}
          className="bg-[#2B5B84] text-white font-mono uppercase tracking-widest"
        >
          Start Registration
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className="bg-brand-gold text-black font-mono uppercase tracking-widest"
        >
          Request Callback
        </button>
      </div>
    </div>
  );
}
