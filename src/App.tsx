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
const ClientPortal = lazy(() => import("./portal/ClientPortal"));
const AdminPortal = lazy(() => import("./admin/AdminPortal"));
const LoginPage = lazy(() => import("./components/LoginPage"));
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
const ComplianceCalendarSection = lazy(() => import("./components/ComplianceCalendarSection"));
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
  const [prefilledMessage, setPrefilledMessage] = useState<string>("");

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
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <img src="/incroute_logo.png" alt="INCroute Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col select-none leading-none">
              <span className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight">
                INC<span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] font-bold italic">route</span>
              </span>
              <div className="flex items-center gap-1 mt-[3px]">
                <span className="h-[1px] w-3.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-50" />
                <span className="text-[8px] text-[var(--text-tertiary)] tracking-[0.18em] uppercase font-semibold">Make It Right</span>
                <span className="h-[1px] w-3.5 bg-gradient-to-r from-[var(--gradient-end)] to-[var(--gradient-start)] opacity-50" />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-brand-text-muted uppercase tracking-widest">Loading portal&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-brand-text flex flex-col selection:bg-brand-gold/30 selection:text-brand-text relative homepage-shell">
      <ScrollToTop />
      {/* Executive Backdrop Pattern Layers */}
      <div className="executive-glow-1" />
      <div className="executive-glow-2" />
      <div className="executive-grid" />
      <div className="hero-gradient-bg" />

      {/* Decorative brand star — bottom right */}
      <div className="fixed bottom-24 right-6 z-0 pointer-events-none opacity-20 hidden md:block">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 0L44.5 35.5L80 40L44.5 44.5L40 80L35.5 44.5L0 40L35.5 35.5L40 0Z" fill="var(--color-brand-gold)" />
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
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
        <AnimatePresence mode="wait">
          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-4"
            >
              <RegistrationServices 
                setActiveTab={setActiveTab} 
                prefilledCompanyName={prefilledName}
                prefilledEntityType={prefilledEntityType}
              />
              {/* Live Testimonial Carousel */}
              <div className="pb-12 w-full mt-8">
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
                onConsultExpert={(brandName, entityType) => {
                  setPrefilledName(brandName);
                  setPrefilledMessage(`Hi, I checked my proposed business name "${brandName}" (${entityType}) using the AI Feasibility Advisor and would like to proceed with registration. Please help me with the next steps.`);
                  setActiveTab("contact");
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left space-y-12"
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

                  <ContactFormWidget initialMessage={prefilledMessage} />
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="w-full catalog-section-bg relative"
            >
              <div className="catalog-mesh" />
              <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left relative z-10">
                <ServiceCatalogInsights setActiveTab={setActiveTab} />
              </div>
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left space-y-12"
            >
              <ComplianceCalendarSection />
            </motion.div>
          )}

          {activeTab === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full"
            >
              <LoginPage setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "dashboard-customer" && (
            <motion.div
              key="dashboard-customer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
            >
              <PartnerCustomerDetail customerId={routeParams.id} />
            </motion.div>
          )}

          {activeTab === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full"
            >
              <LoginPage setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "dashboard-customer" && (
            <motion.div
              key="dashboard-customer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
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
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
            >
              <PartnerCustomerDetail customerId={routeParams.id} />
            </motion.div>
          )}

          {activeTab === "portal" && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <ClientPortal />
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <AdminPortal />
            </motion.div>
          )}

          {/* 404 Fallback — show when no tab matches */}
          {!["services","compliance","blog","catalog","about","contact","name-checker","tools","faq","comparison","impact","flowchart","testimonials","timeline-viz","company-registration-bangalore","company-registration-mumbai","company-registration-delhi","auth","login","dashboard-customer","dashboard-partner","dashboard-partner-customer-detail","portal","admin"].includes(activeTab) && (
            <NotFoundPage />
          )}
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer segment */}
      <footer className="bg-[#0B0E1A] border-t border-[rgba(108,124,255,0.1)] py-10 md:py-14 text-[#8B8FA8] mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
            
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden">
                  <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
                </div>
                <span className="text-[16px] font-extrabold text-white tracking-tight">
                  INC<span className="text-[#6C7CFF] italic font-bold">route</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6B7094] leading-relaxed">
                India's most trusted platform for business incorporation, compliance & advisory.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {["f", "in", "x", "✉"].map((s, i) => (
                  <div key={i} className="w-7 h-7 rounded-lg bg-[#1A1E30] flex items-center justify-center text-[10px] text-[#8B8FA8] hover:text-[#6C7CFF] hover:bg-[#1E2338] cursor-pointer transition-colors">{s}</div>
                ))}
              </div>
            </div>

            {/* Our Services */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Our Services</h4>
              <div className="space-y-2 text-[11px]">
                {["Company Incorporation", "Compliance Management", "GST Services", "ROC Filings", "Trademark Registration", "Legal Advisory"].map(s => (
                  <p key={s} className="hover:text-[#6C7CFF] cursor-pointer transition-colors">{s}</p>
                ))}
              </div>
            </div>

            {/* Important Links */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Important Links</h4>
              <div className="space-y-2 text-[11px]">
                {["About Us", "Blog", "Resources", "Pricing", "Careers", "Contact Us"].map(s => (
                  <p key={s} className="hover:text-[#6C7CFF] cursor-pointer transition-colors">{s}</p>
                ))}
              </div>
            </div>

            {/* Legal & Policies */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Legal & Policies</h4>
              <div className="space-y-2 text-[11px]">
                {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Disclaimer"].map(s => (
                  <p key={s} className="hover:text-[#6C7CFF] cursor-pointer transition-colors">{s}</p>
                ))}
              </div>
            </div>

            {/* Registered Office */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Registered Office</h4>
              <div className="space-y-2 text-[11px]">
                <p>INCroute Corporate Solutions Pvt. Ltd.</p>
                <p>B-901, Sector 63, Noida,</p>
                <p>Uttar Pradesh - 201301, India</p>
                <p className="pt-1">Email: support@incroute.com</p>
                <p>Phone: +91 870 755 2183</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-[#1A1E30] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-[#5A5E78]">© {new Date().getFullYear()} INCroute Corporate Solutions Pvt. Ltd. All rights reserved.</p>
            <div className="w-8 h-8 rounded-full bg-[#6C7CFF] flex items-center justify-center cursor-pointer hover:bg-[#5563E8] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <ArrowRight className="w-3.5 h-3.5 text-white -rotate-90" />
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
      {/* Decorative brand star removed — clean layout */}
    </div>
  );
}
