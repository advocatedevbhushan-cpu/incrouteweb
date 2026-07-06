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
const CustomerDashboard = lazy(() => import("./components/CustomerDashboard"));
const PartnerDashboard = lazy(() => import("./components/PartnerDashboard"));
const PartnerCustomerDetail = lazy(() => import("./components/PartnerCustomerDetail"));
const ClientPortal = lazy(() => import("./portal/ClientPortal"));
const PartnerPortal = lazy(() => import("./partner/PartnerPortal"));
const AdminPortal = lazy(() => import("./admin/AdminPortal"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const ServiceCatalogInsights = lazy(() => import("./components/ServiceCatalogInsights"));
const StatutoryTools = lazy(() => import("./components/StatutoryTools"));
const LegalPolicies = lazy(() => import("./components/LegalPolicies"));
const AnimatedTimeline = lazy(() => import("./components/AnimatedTimeline"));
const EntityComparison = lazy(() => import("./components/EntityComparison"));
const ServiceImpactDashboard = lazy(() => import("./components/ServiceImpactDashboard"));
const ComplianceFlowchart = lazy(() => import("./components/ComplianceFlowchart"));
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
  UserCheck,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  Linkedin,
  Twitter,
  Youtube,
  Instagram
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
      "dashboard-partner-customer-detail",
      "portal",
      "partner",
      "admin"
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
        if (profile.role === "admin") {
          navigate("/admin");
        } else if (profile.role === "partner") {
          navigate("/partner");
        } else {
          navigate("/portal");
        }
      } 
      else if (currentTab === "admin" && profile.role !== "admin") {
        navigate(profile.role === "partner" ? "/partner" : "/portal");
      }
      else if (currentTab === "partner" && profile.role !== "partner") {
        navigate(profile.role === "admin" ? "/admin" : "/portal");
      }
      else if (currentTab === "portal" && profile.role !== "customer") {
        navigate(profile.role === "admin" ? "/admin" : "/partner");
      }
      // Force correct role routing for dashboards
      else if (currentTab === "dashboard-customer" && profile.role !== "customer") {
        navigate(profile.role === "admin" ? "/admin" : "/partner");
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

  // Check if we're in a full-screen portal mode (portal/admin/partner have their own shell)
  const isFullScreenPortal = activeTab === "portal" || activeTab === "admin" || activeTab === "partner";

  // Check if user is authenticated for portal/admin access
  const isAuthenticated = (() => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      return !!token;
    } catch { return false; }
  })();

  // Redirect to login if trying to access portal/admin/partner without auth
  useEffect(() => {
    if (isFullScreenPortal && !isAuthenticated && !loading) {
      navigate("/login");
    }
  }, [activeTab, isAuthenticated, loading]);

  // If portal/admin is active, render without outer shell
  if (isFullScreenPortal) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
        {activeTab === "portal" ? <ClientPortal /> : activeTab === "partner" ? <PartnerPortal /> : <AdminPortal />}
      </Suspense>
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
              <div className="pb-4 w-full mt-2">
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

          {/* Terms, Policies & Compliance Center */}
          {activeTab === "policies" && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left"
            >
              <LegalPolicies />
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
              className="w-full compliance-section-bg relative"
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 w-full text-left relative z-10">
                <ComplianceCalendarSection />
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
          {!["services","compliance","blog","catalog","about","contact","name-checker","tools","faq","comparison","impact","flowchart","testimonials","timeline-viz","company-registration-bangalore","company-registration-mumbai","company-registration-delhi","auth","login","dashboard-customer","dashboard-partner","dashboard-partner-customer-detail","portal","partner","admin"].includes(activeTab) && (
            <NotFoundPage />
          )}
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer segment */}
      {/* Footer segment */}
      <footer className="footer-dark border-t border-slate-800/80 py-12 md:py-16 mt-auto text-slate-400 font-sans">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 md:gap-10 text-left">
            
            {/* Brand Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <img src="/incroute_logo.png" width="32" height="32" className="w-full h-full object-cover" alt="INCroute Logo" loading="lazy" />
                </div>
                <span className="text-[16px] font-extrabold text-white tracking-tight">
                  INC<span className="text-[#4F46E5] italic font-bold">route</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px]">
                India's most trusted platform for business compliance and governance. Simplifying compliance. Powering responsible growth.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[
                  { icon: Linkedin, link: "#" },
                  { icon: Twitter, link: "#" },
                  { icon: Youtube, link: "#" },
                  { icon: Instagram, link: "#" }
                ].map((s, i) => (
                  <a key={i} href={s.link} className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#4F46E5] hover:border-[#4F46E5] cursor-pointer transition-all duration-200">
                    <s.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Our Services Column */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Our Services</h4>
              <div className="space-y-2 text-[11px] font-medium text-slate-400">
                {[
                  { label: "Company Incorporation", tab: "services" },
                  { label: "Compliance Management", tab: "compliance" },
                  { label: "ROC Filings", tab: "services" },
                  { label: "GST & Taxation", tab: "services" },
                  { label: "Payroll & Labour Compliance", tab: "services" },
                  { label: "Audit & Assurance", tab: "services" }
                ].map(s => (
                  <p key={s.label} onClick={() => { setActiveTab(s.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white cursor-pointer transition-colors">{s.label}</p>
                ))}
              </div>
            </div>

            {/* Important Links Column */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Important Links</h4>
              <div className="space-y-2 text-[11px] font-medium text-slate-400">
                {[
                  { label: "About Us", tab: "about" },
                  { label: "Resources", tab: "faq" },
                  { label: "Careers", tab: "about" },
                  { label: "Pricing", tab: "pricing" },
                  { label: "Partner With Us", tab: "about" }
                ].map(s => (
                  <p key={s.label} onClick={() => { if(s.tab) setActiveTab(s.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white cursor-pointer transition-colors">{s.label}</p>
                ))}
              </div>
            </div>

            {/* Legal & Policies Column */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Legal & Policies</h4>
              <div className="space-y-2 text-[11px] font-medium text-slate-400 font-sans flex flex-col items-start gap-2">
                {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Disclaimer", "Sitemap"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setActiveTab("policies"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="block text-left hover:text-white cursor-pointer transition-colors border-none bg-transparent p-0 text-[11px] font-medium text-slate-400 outline-none"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Contact Us</h4>
              <div className="space-y-2.5 text-[11px] font-medium text-slate-400">
                <a href="mailto:hello@incroute.com" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-[#4F46E5] dark:text-[#9D85F2]" />
                  <span>hello@incroute.com</span>
                </a>
                <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-[#4F46E5] dark:text-[#9D85F2]" />
                  <span>+91 12345 67890</span>
                </a>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-slate-650" />
                  <span>Mon - Fri: 9:30 AM - 6:30 PM IST</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-650" />
                  <span>IncRoute Tech Pvt. Ltd. Bangalore, Karnataka, India</span>
                </div>
              </div>
            </div>

          </div>

          {/* Newsletter Stay Compliance-Ready Strip Block */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-800/40 items-center">
            
            {/* Stay Compliance-Ready Newsletter Card */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 text-left">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-wide">Stay Compliance-Ready</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                  Subscribe to get compliance updates and legal insights.
                </p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert("Successfully subscribed to compliance newsletter!"); }} className="relative flex items-center w-full md:w-72 shrink-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#4F46E5] text-xs text-slate-200 pl-3.5 pr-10 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors border-none cursor-pointer outline-none flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Compliance Certifications (Right of Newsletter) */}
            <div className="lg:col-span-5 flex flex-wrap items-center justify-center lg:justify-end gap-3 text-[10px] font-semibold text-slate-500 font-mono tracking-wider">
              <span className="flex items-center gap-1.5 border border-slate-850 px-2.5 py-1 rounded bg-slate-900/40">🛡 ISO 27001 Certified</span>
              <span className="flex items-center gap-1.5 border border-slate-850 px-2.5 py-1 rounded bg-slate-900/40">🔒 Bank-grade Security</span>
            </div>

          </div>

          {/* Copyright & Scroll Top Strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500 font-medium">© {new Date().getFullYear()} INCroute Tech Pvt. Ltd. All rights reserved.</span>
            <button
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
            >
              ▲
            </button>
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
          className="bg-[#4F46E5] text-white font-mono uppercase tracking-widest"
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
