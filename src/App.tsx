import React, { useState, useEffect, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";
import ScrollToTop from "./components/ScrollToTop";
import { motion, AnimatePresence } from "motion/react";
import { ComplianceEvent } from "./types";

// Code-split non-critical components (loaded after initial render)
const RegistrationServices = lazy(() => import("./components/RegistrationServices"));
const NameFeasibilityChecker = lazy(() => import("./components/NameFeasibilityChecker"));
const BlogPage = lazy(() => import("./components/BlogPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const AuthPortal = lazy(() => import("./components/AuthPortal"));
const Login = lazy(() => import("./components/Login"));
const CustomerDashboard = lazy(() => import("./components/CustomerDashboard"));
const PartnerDashboard = lazy(() => import("./components/PartnerDashboard"));
const PartnerCustomerDetail = lazy(() => import("./components/PartnerCustomerDetail"));
const ServiceCatalogInsights = lazy(() => import("./components/ServiceCatalogInsights"));
const StatutoryTools = lazy(() => import("./components/StatutoryTools"));
const AnimatedTimeline = lazy(() => import("./components/AnimatedTimeline"));
const EntityComparison = lazy(() => import("./components/EntityComparison"));
const ServiceImpactDashboard = lazy(() => import("./components/ServiceImpactDashboard"));
const ComplianceFlowchart = lazy(() => import("./components/ComplianceFlowchart"));
const PinnedTimeline = lazy(() => import("./components/PinnedTimeline"));
const TestimonialsSection = lazy(() => import("./components/TestimonialsSection"));
const TestimonialCarousel = lazy(() => import("./components/TestimonialCarousel"));
const ContactFormWidget = lazy(() => import("./components/ContactFormWidget"));
const LocalCityLanding = lazy(() => import("./components/LocalCityLanding"));
const AnswerHub = lazy(() => import("./components/AnswerHub"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
import { TAB_TO_ROUTE } from "./lib/routes";
import { useAuth } from "./lib/AuthContext";
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
  Check,
  X,
  UserCheck
} from "lucide-react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();



  // Reverse map: route path → tab name
  const ROUTE_TO_TAB: Record<string, string> = {};
  for (const [tab, route] of Object.entries(TAB_TO_ROUTE)) {
    ROUTE_TO_TAB[route] = tab;
  }

  const getTabFromPath = (): { tab: string; params: Record<string, string> } => {
    const path = location.pathname;

    // Check dynamic customer details route first
    const partnerCustomerMatch = path.match(/^\/dashboard\/partner\/customer\/([^/]+)\/?$/);
    if (partnerCustomerMatch) {
      return { tab: "dashboard-partner-customer-detail", params: { id: partnerCustomerMatch[1] } };
    }

    let matchedTab = "services";
    if (ROUTE_TO_TAB[path]) {
      matchedTab = ROUTE_TO_TAB[path];
    } else if (ROUTE_TO_TAB[path + "/"]) {
      matchedTab = ROUTE_TO_TAB[path + "/"];
    } else if (ROUTE_TO_TAB[path.replace(/\/$/, "")]) {
      matchedTab = ROUTE_TO_TAB[path.replace(/\/$/, "")];
    } else if (path === "/" || path === "") {
      matchedTab = "services";
    } else {
      const seg = path.split("/").filter(Boolean)[0];
      matchedTab = seg || "services";
    }

    return { tab: matchedTab, params: {} };
  };

  const [activeTab, setActiveTabState] = useState<string>(() => getTabFromPath().tab);
  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => getTabFromPath().params);
  const [showExpertModal, setShowExpertModal] = useState<boolean>(false);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const route = TAB_TO_ROUTE[tab] || `/${tab}/`;
    if (location.pathname !== route) {
      navigate(route);
    }
  };

  // Pathname sync useEffect relocated below state declarations to avoid reference errors

  // Route guarding and role redirection checking
  useEffect(() => {
    if (loading) return;

    // Wait until profile is fetched if a user is logged in
    if (user && !profile) return;

    const currentTab = getTabFromPath().tab;
    const isDashboardRoute = [
      "dashboard-customer",
      "dashboard-partner",
      "dashboard-partner-customer-detail"
    ].includes(currentTab);

    if (!user) {
      if (isDashboardRoute) {
        navigate("/login");
      }
    } else {
      // Wait for profile to load before redirecting — avoid premature redirects
      if (!profile) return;

      // Redirect authenticated user away from login pages
      if (currentTab === "login" || currentTab === "auth") {
        if (profile.role === "partner" || profile.role === "admin") {
          navigate("/dashboard/partner");
        } else {
          navigate("/dashboard/customer");
        }
      } 
      // Force correct role routing for dashboards
      else if (currentTab === "dashboard-customer" && profile.role !== "customer") {
        navigate("/dashboard/partner");
      } 
      else if ((currentTab === "dashboard-partner" || currentTab === "dashboard-partner-customer-detail") && profile.role === "customer") {
        navigate("/dashboard/customer");
      }
    }
  }, [user, profile, loading, location.pathname]);


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

  // Sync tab state when URL changes (browser back/forward)
  useEffect(() => {
    const { tab, params } = getTabFromPath();
    setActiveTabState(tab);
    setRouteParams(params);

    // Sync sub-routes: /services/:category/:serviceId/
    const serviceMatch = location.pathname.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
    if (serviceMatch) {
      setPrefilledEntityType(serviceMatch[2]);
    } else if (location.pathname === "/" || location.pathname === "/services" || location.pathname === "/services/") {
      setPrefilledEntityType("");
    }
  }, [location.pathname]);

  const SERVICE_CATEGORIES: Record<string, string> = {
    "pvt-ltd": "private-corporate",
    "llp": "alternative-entity",
    "opc": "private-corporate",
    "partnership": "alternative-entity",
    "section8": "private-corporate",
    "public-ltd": "private-corporate",
    "annual-compliance": "compliance",
    "gst-tax": "compliance",
    "virtual-cfo": "enterprise-growth",
    "virtual-office": "enterprise-growth",
    "terms-privacy": "legal-ip",
    "msme-registration": "compliance",
    "fssai-registration": "compliance",
    "return-filing": "compliance",
    "trademark-registration": "legal-ip",
    "trademark-objection": "legal-ip",
    "trademark-opposition": "legal-ip",
    "trademark-assignment": "legal-ip",
    "brand-protection": "legal-ip",
    "litigation-assistance": "legal-ip",
    "trademark-renewal": "legal-ip",
    "patent-filing": "legal-ip",
    "iso-certification": "compliance"
  };

  const handleServiceClick = (serviceId: string) => {
    const category = SERVICE_CATEGORIES[serviceId] || "general";
    navigate(`/services/${category}/${serviceId}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compliance Calendar State
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [calendarSearch, setCalendarSearch] = useState<string>("");


  // Fetch compliance calendar events
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const response = await fetch("/api/compliance/calendar");
        const data = await response.json();
        if (data.success && data.calendar) {
          setComplianceEvents(data.calendar);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("Failed parsing compliance items, using fallback:", err);
        // Fallback data when API is unavailable
        setComplianceEvents([
          { id: "1", service: "GST Filing", description: "Monthly GSTR-1 & GSTR-3B filings", dueDate: "11th and 20th of every month", type: "taxation", downloadUrl: "https://www.gst.gov.in/" },
          { id: "2", service: "Income Tax Audit", description: "Tax Audit Filing and assessment for entities", dueDate: "September 30th annually", type: "taxation", downloadUrl: "https://www.incometax.gov.in/iec/foportal/" },
          { id: "3", service: "ROC Annual Filing", description: "Form MGT-7 and Form AOC-4 Filing with Registrar", dueDate: "Within 30 and 60 days of AGM", type: "corporate", downloadUrl: "https://www.mca.gov.in/content/mca/global/en/help-guide/company-forms-download.html" },
          { id: "4", service: "TDS Returns", description: "Quarterly TDS Filings (Form 24Q, 26Q)", dueDate: "Last day of succeeding month of quarter", type: "taxation", downloadUrl: "https://www.tin-nsdl.com/services/etds-etcs/etds-index.html" },
          { id: "5", service: "EPF & ESIC Return", description: "Monthly social security statutory deposit and returns", dueDate: "15th of every month", type: "employment", downloadUrl: "https://www.epfindia.gov.in/" }
        ]);
      } finally {
        setLoadingCalendar(false);
      }
    }
    fetchCalendar();
  }, []);

  // Loading screen rendered after all hooks (avoids React hooks rules violation)
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-6 relative">
        <div className="executive-glow-1" />
        <div className="executive-glow-2" />
        <div className="executive-grid" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2.5">
            <img src="/incroute_logo.png" alt="Legiscorp" className="w-8 h-8 rounded-full object-cover border border-brand-gold/40" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-lg font-light font-serif text-brand-text tracking-widest">
              Legis<span className="text-brand-gold">corp</span>
            </span>
          </div>
          <div className="w-10 h-10 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-brand-text-muted uppercase tracking-widest">Loading portal&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-gold/30 selection:text-brand-text relative">
      <ScrollToTop />
      {/* Executive Backdrop Pattern Layers */}
      <div className="executive-glow-1" />
      <div className="executive-glow-2" />
      <div className="executive-grid" />

      {/* Decorative gold star — bottom right */}
      <div className="fixed bottom-24 right-6 z-0 pointer-events-none opacity-20 hidden md:block">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 0L44.5 35.5L80 40L44.5 44.5L40 80L35.5 44.5L0 40L35.5 35.5L40 0Z" fill="#C7A86B" />
        </svg>
      </div>

      {/* Navbar segment */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
        <AnimatePresence mode="wait">
          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
                  <img src="/incroute_logo.png" className="w-5 h-5 rounded-full object-cover border border-brand-gold/40 bg-black" alt="INCroute Logo" />
                  Static Statutory Calendars
                </div>
                <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
                  Global Compliance <span className="text-brand-gold italic font-normal">Calendars Tracker.</span>
                </h1>
                <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
                  Unified live schedule of state, federal, and local financial statutory obligations. Keep your company fully operational and liability-free.
                </p>
              </div>

               {/* Premium Pinned Compliance Timeline */}
               <PinnedTimeline
                 milestones={roadmapMilestones}
                 onDelegate={() => setActiveTab("contact")}
               />

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

          {activeTab === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthPortal />
            </motion.div>
          )}

          {activeTab === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Login />
            </motion.div>
          )}

          {activeTab === "dashboard-customer" && (
            <motion.div
              key="dashboard-customer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <CustomerDashboard />
            </motion.div>
          )}

          {activeTab === "dashboard-partner" && (
            <motion.div
              key="dashboard-partner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <PartnerDashboard />
            </motion.div>
          )}

          {activeTab === "dashboard-partner-customer-detail" && (
            <motion.div
              key="dashboard-partner-customer-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <PartnerCustomerDetail customerId={routeParams.id} />
            </motion.div>
          )}

          {/* 404 Fallback — show when no tab matches */}
          {!["services","compliance","blog","catalog","about","contact","name-checker","tools","faq","comparison","impact","flowchart","testimonials","timeline-viz","company-registration-bangalore","company-registration-mumbai","company-registration-delhi","auth","login","dashboard-customer","dashboard-partner","dashboard-partner-customer-detail"].includes(activeTab) && (
            <NotFoundPage />
          )}
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer segment */}
      <footer className="bg-brand-bg-darker border-t border-brand-border/70 py-12 md:py-16 text-brand-text-muted mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-7 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-center md:text-left">
            
            <div className="md:col-span-3 space-y-5">
              <div className="flex items-center gap-2.5 cursor-pointer font-sans justify-center md:justify-start" onClick={() => handleServiceClick("pvt-ltd")}>
                <div className="w-9 h-9 bg-brand-dark rounded-lg border border-brand-border overflow-hidden flex items-center justify-center">
                  <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
                </div>
                <div className="flex flex-col select-none">
                  <span className="text-lg font-bold text-brand-text tracking-wider uppercase leading-none">
                    INC<span className="text-brand-gold font-serif italic font-normal tracking-normal text-xl lowercase">route</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-sm mx-auto md:mx-0">
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
                <div className="space-y-2.5 flex flex-col items-center md:items-start">
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
                    className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none"
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
              <div className="space-y-2.5 text-xs font-sans flex flex-col items-center md:items-start">
                <a 
                  href="/company-registration-bangalore"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-bangalore"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none"
                >
                  Company Registration in Bangalore
                </a>
                <a 
                  href="/company-registration-mumbai"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-mumbai"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none"
                >
                  Company Registration in Mumbai
                </a>
                <a 
                  href="/company-registration-delhi"
                  onClick={(e) => { e.preventDefault(); setActiveTab("company-registration-delhi"); }}
                  className="hover:text-brand-gold cursor-pointer transition-colors duration-200 decoration-none"
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
              
              <div className="flex flex-wrap items-center gap-3 pt-1 justify-center md:justify-start">
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

              <div className="text-[10px] font-mono tracking-wider uppercase text-brand-text-muted pt-2 select-none">
                © {new Date().getFullYear()} INCROUTE. ALL RIGHTS RESERVED.
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Mobile Floating CTA */}
      <div className="mobile-floating-cta">
        <button
          onClick={() => {
            setActiveTab("services");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              const el = document.getElementById("service-catalog-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }}
          className="bg-[#2B5B84] text-white font-mono uppercase tracking-widest"
        >
          Start Registration
        </button>
        <button
          onClick={() => {
            setActiveTab("contact");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="bg-brand-gold text-black font-mono uppercase tracking-widest"
        >
          Request Callback
        </button>
      </div>

      {/* Desktop Floating CTA — bottom right */}
      {activeTab === "services" && (
        <div className="desktop-floating-cta">
          <button
            onClick={() => setShowExpertModal(true)}
            className="bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-[10px] font-bold px-5 py-3 rounded-lg shadow-lg shadow-brand-gold/20 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            Connect with our Expert
          </button>
        </div>
      )}

      {/* Expert Consultation Modal Overlay */}
      <AnimatePresence>
        {showExpertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative premium-card my-8"
            >
              <button
                onClick={() => setShowExpertModal(false)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                <div className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/25 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-brand-text font-serif">Connect with our Expert</h3>
                  <p className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase mt-0.5 font-bold">Direct Statutory & Incorporation Consultation</p>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <ContactFormWidget />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
