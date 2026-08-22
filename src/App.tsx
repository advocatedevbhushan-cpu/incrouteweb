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
const BooksApp = lazy(() => import("./books/BooksApp"));
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
const CareersForm = lazy(() => import("./components/CareersForm"));
const ServicesHubPage = lazy(() => import("./components/ServicesHubPage"));
import ServiceDetailPage from "./components/ServiceDetailPage";
const BooksLoginPage = lazy(() => import("./books/pages/BooksLoginPage"));
import WelcomeOfferModal from "./components/WelcomeOfferModal";
import LiveActivityToast from "./components/LiveActivityToast";
import TopAnnouncementBar from "./components/TopAnnouncementBar";
import FloatingAdvisorFab from "./components/FloatingAdvisorFab";
import { TAB_TO_ROUTE } from "./lib/routes";
import { useAuth } from "./lib/AuthContext";
import { useLenisScroll } from "./lib/useLenisScroll";
import MobileBottomDock from "./components/MobileBottomDock";
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

  // Initialize global butter-smooth momentum scroll
  useLenisScroll();



  // Reverse map: route path → tab name
  const ROUTE_TO_TAB: Record<string, string> = {};
  for (const [tab, route] of Object.entries(TAB_TO_ROUTE)) {
    ROUTE_TO_TAB[route] = tab;
  }

  const getTabFromPath = (): { tab: string; params: Record<string, string> } => {
    const path = location.pathname;
    const isBooksDomain = window.location.hostname.startsWith("books.");

    if (path === "/login" || path === "/login/" || path === "/auth" || path === "/auth/") {
      return { tab: path.includes("login") ? "login" : "auth", params: {} };
    }

    if (isBooksDomain || path.startsWith("/books") || path.startsWith("/portal/books") || path.startsWith("/admin/books")) {
      return { tab: "books", params: {} };
    }

    // Check dynamic customer details route first
    const partnerCustomerMatch = path.match(/^\/dashboard\/partner\/customer\/([^/]+)\/?$/);
    if (partnerCustomerMatch) {
      return { tab: "dashboard-partner-customer-detail", params: { id: partnerCustomerMatch[1] } };
    }

    const serviceDetailMatch = path.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
    if (serviceDetailMatch) {
      return { tab: "service-detail", params: { category: serviceDetailMatch[1], serviceId: serviceDetailMatch[2] } };
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
    if (tab === "home" || tab === "landing") {
      setActiveTabState("services");
      if (location.pathname !== "/") {
        navigate("/");
      }
      return;
    }
    if (tab === "services") {
      setActiveTabState("services");
      if (location.pathname !== "/services/" && location.pathname !== "/services") {
        navigate("/services/");
      }
      return;
    }
    setActiveTabState(tab);
    if (tab === "service-detail") {
      return;
    }
    const route = TAB_TO_ROUTE[tab] || `/${tab}/`;
    if (location.pathname !== route) {
      navigate(route);
    }
  };

  // Sync activeTab and routeParams whenever URL pathname changes
  useEffect(() => {
    const { tab, params } = getTabFromPath();
    setActiveTabState(tab);
    setRouteParams(params);
  }, [location.pathname]);

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
    // Private Corporate
    "pvt-ltd": "private-corporate",
    "opc": "private-corporate",
    "section8": "private-corporate",
    "public-ltd": "private-corporate",
    "producer-company": "private-corporate",
    "nidhi-company": "private-corporate",
    "indian-subsidiary": "private-corporate",

    // Alternative Entity
    "llp": "alternative-entity",
    "partnership": "alternative-entity",
    "sole-proprietorship": "alternative-entity",
    "trust-registration": "alternative-entity",
    "society-registration": "alternative-entity",
    "fcra-registration": "alternative-entity",
    "12a-80g-registration": "alternative-entity",
    "12aa-registration": "alternative-entity",

    // Enterprise Growth & Advisory
    "virtual-cfo": "enterprise-growth",
    "virtual-office": "enterprise-growth",
    "startup-grants": "enterprise-growth",
    "pitch-deck": "enterprise-growth",
    "seed-funding": "enterprise-growth",
    "cap-table-valuation": "enterprise-growth",

    // Compliance & Tax
    "annual-compliance": "compliance",
    "dsc-registration": "compliance",
    "gst-tax": "compliance",
    "gst-return-filing": "compliance",
    "gstr9-annual-return": "compliance",
    "gst-lut-filing": "compliance",
    "gst-notice-resolution": "compliance",
    "gst-foreigners": "compliance",
    "gst-amendment": "compliance",
    "gstr10-final-return": "compliance",
    "income-tax-efiling": "compliance",
    "business-tax-filing": "compliance",
    "itr-filing-individual": "compliance",
    "corporate-tax-itr": "compliance",
    "15ca-15cb-filing": "compliance",
    "tan-tds-filing": "compliance",
    "income-tax-notice": "compliance",
    "dir3-kyc": "compliance",
    "inc20a-commencement": "compliance",
    "secretarial-audit": "compliance",
    "board-minutes-drafting": "compliance",
    "change-company-name": "compliance",
    "increase-authorized-capital": "compliance",
    "director-change": "compliance",
    "change-registered-office": "compliance",
    "share-transfer-allotment": "compliance",
    "msme-registration": "compliance",
    "fssai-registration": "compliance",
    "return-filing": "compliance",
    "iso-certification": "compliance",
    "bookkeeping-ledger": "compliance",
    "mis-financial-reporting": "compliance",
    "import-export-code": "compliance",
    "shop-establishment-license": "compliance",
    "pf-esi-registration": "compliance",
    "professional-tax-license": "compliance",
    "posh-compliance": "compliance",

    // Legal & IP
    "terms-privacy": "legal-ip",
    "nda-agreement": "legal-ip",
    "founder-agreement": "legal-ip",
    "employment-contract": "legal-ip",
    "trademark-registration": "legal-ip",
    "trademark-objection": "legal-ip",
    "trademark-opposition": "legal-ip",
    "trademark-assignment": "legal-ip",
    "brand-protection": "legal-ip",
    "litigation-assistance": "legal-ip",
    "trademark-renewal": "legal-ip",
    "patent-filing": "legal-ip",
    "copyright-registration": "legal-ip",
    "logo-brand-ip": "legal-ip"
  };

  const handleServiceClick = (serviceId: string) => {
    const category = SERVICE_CATEGORIES[serviceId] || "general";
    navigate(`/services/${category}/${serviceId}/`);
    setActiveTabState("service-detail");
    setRouteParams({ category, serviceId });
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

  // Check if we're in a full-screen portal mode (portal/admin/partner/books have their own shell)
  const isBooksDomain = window.location.hostname.startsWith("books.");
  const isAuthRoute = activeTab === "login" || activeTab === "auth" || location.pathname.startsWith("/login") || location.pathname.startsWith("/auth");
  const isFullScreenPortal = !isAuthRoute && (activeTab === "portal" || activeTab === "admin" || activeTab === "partner" || activeTab === "books" || isBooksDomain);

  // Check if user is authenticated for portal/admin access
  const isAuthenticated = (() => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      return !!token;
    } catch { return false; }
  })();

  // Redirect to login if trying to access portal/admin/partner without auth (excluding books)
  useEffect(() => {
    if (isFullScreenPortal && !isAuthenticated && !loading) {
      const isBooksRoute = activeTab === "books" || isBooksDomain || location.pathname.startsWith("/books");
      if (!isBooksRoute && !location.pathname.startsWith("/login")) {
        const currentUrl = window.location.href;
        navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }
    }
  }, [isFullScreenPortal, isAuthenticated, loading, location.pathname, activeTab, isBooksDomain]);

  // If portal/admin/books is active, render without outer shell
  if (isFullScreenPortal) {
    const isBooksRoute = activeTab === "books" || isBooksDomain || location.pathname.startsWith("/books");

    if (isBooksRoute) {
      if (!isAuthenticated) {
        return (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <BooksLoginPage />
          </Suspense>
        );
      }

      let booksBasePath = "/books";
      if (isBooksDomain) booksBasePath = "";
      else if (location.pathname.startsWith("/portal/books")) booksBasePath = "/portal/books";
      else if (location.pathname.startsWith("/admin/books")) booksBasePath = "/admin/books";

      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
          <BooksApp basePath={booksBasePath} onExit={() => {
            if (isBooksDomain) window.location.href = "https://incroute.com";
            else navigate("/");
          }} />
        </Suspense>
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
      {/* Global Atmospheric Ambient Aura & Glass Depth System */}
      <div className="ambient-aura-layer fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
        <div className="ambient-orb ambient-orb-4" />
        <div className="ambient-mesh-grid" />
      </div>

      {/* Decorative brand star removed */}

      {/* Top Statutory Announcement Bar */}
      <TopAnnouncementBar 
        onBookConsultation={() => setShowExpertModal(true)}
        onSelectService={(sId) => handleServiceClick(sId)}
      />

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
            (location.pathname.startsWith("/services") || location.pathname.startsWith("/catalog")) ? (
              <motion.div
                key="services-hub-standalone"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col pt-0"
              >
                <ServicesHubPage setActiveTab={setActiveTab} />
              </motion.div>
            ) : (
              <motion.div
                key="services-landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-4"
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
            )
          )}

          {activeTab === "service-detail" && (
            <motion.div
              key={routeParams.serviceId || location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col pt-0"
            >
              <ServiceDetailPage 
                serviceId={routeParams.serviceId} 
                category={routeParams.category} 
                setActiveTab={setActiveTab} 
              />
            </motion.div>
          )}

          {activeTab === "name-checker" && (
            <motion.div
              key="name-checker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left space-y-12"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left relative z-10">
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
            >
              <ServiceImpactDashboard onEntitySelect={(entityId) => handleServiceClick(entityId)} />
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
            >
              <AboutPage setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {/* Careers Section */}
          {activeTab === "careers" && (
            <motion.div
              key="careers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Join Incroute
                </div>
                <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
                  Build the Future of <span className="text-brand-gold italic font-normal">Legal Tech.</span>
                </h1>
                <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
                  We are looking for passionate individuals to join our mission in simplifying compliance, incorporation, and corporate governance for startups across India.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
                {/* Left: Careers Roles Listing */}
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Open Positions</h3>
                  <div className="space-y-4">
                    {[
                      { title: "Legal & Compliance Associate", type: "Full-Time", location: "Bangalore / Remote", desc: "Assist clients with MCA filings, company incorporation documents, and compliance reviews." },
                      { title: "Full-Stack Software Engineer", type: "Full-Time", location: "Bangalore", desc: "Build robust frontend dashboards and automation engines for filing operations." },
                      { title: "Business Development Intern", type: "Internship (3-6 Months)", location: "Remote", desc: "Work closely with startup founders to guide them through our incorporation and tax offerings." }
                    ].map((job, idx) => (
                      <div key={idx} className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/30 rounded-2xl transition-all duration-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{job.title}</h4>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{job.type}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-semibold">{job.location}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">{job.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Apply Form */}
                <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 space-y-5">
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
                    Submit Your Application
                  </h3>
                  <CareersForm />
                </div>
              </div>
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left"
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
              <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left relative z-10">
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
          {!["services","service-detail","compliance","blog","catalog","about","contact","name-checker","tools","faq","comparison","impact","flowchart","testimonials","timeline-viz","company-registration-bangalore","company-registration-mumbai","company-registration-delhi","auth","login","dashboard-customer","dashboard-partner","dashboard-partner-customer-detail","portal","partner","admin","books","policies","careers"].includes(activeTab) && (
            <NotFoundPage />
          )}
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Enterprise Next-Gen Footer */}
      <footer className="bg-[#070D1B] border-t border-slate-800/80 pt-14 pb-12 mt-auto text-slate-400 font-sans relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366F1]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
          
          {/* Top Live Status & Trust Seals Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-10 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Systems Operational</span>
                <span className="text-slate-600">|</span>
                <span>INCroute Cloud 99.4% SLA Active</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-mono text-slate-400 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80">🛡️ ISO 27001 Certified</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80">🔒 256-Bit SSL Bank-Grade</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80">🇮🇳 DPIIT Recognized</span>
            </div>
          </div>

          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 md:gap-10 pt-10 text-left">
            
            {/* Brand Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-indigo-500/10 border border-slate-700/50">
                  <img src="/incroute_logo.png" width="32" height="32" className="w-full h-full object-cover" alt="INCroute Logo" loading="lazy" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  INC<span className="text-[#818CF8]">route</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[260px]">
                India's premier digital corporate compliance suite. Empowering founders, chartered accountants, and enterprises with real-time MCA governance and cloud accounting.
              </p>
              <div className="flex items-center gap-2.5 pt-2">
                {[
                  { icon: Linkedin, link: "#" },
                  { icon: Twitter, link: "#" },
                  { icon: Youtube, link: "#" },
                  { icon: Instagram, link: "#" }
                ].map((s, i) => (
                  <a key={i} href={s.link} className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#6366F1] hover:border-[#6366F1] cursor-pointer transition-all duration-200 shadow-sm">
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Incorporation & Registrations */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Incorporations</h4>
              <div className="space-y-2 text-xs font-medium text-slate-400 flex flex-col gap-1.5">
                {[
                  { label: "Private Limited Company", serviceId: "pvt-ltd" },
                  { label: "Limited Liability Partnership (LLP)", serviceId: "llp-registration" },
                  { label: "One Person Company (OPC)", serviceId: "opc-registration" },
                  { label: "Section 8 Micro-Finance / NGO", serviceId: "section-8-company" },
                  { label: "Public Limited Incorporation", serviceId: "public-ltd-company" },
                  { label: "Producer Company Setup", serviceId: "producer-company" }
                ].map(s => (
                  <p 
                    key={s.label} 
                    onClick={() => { 
                      if (s.serviceId) handleServiceClick(s.serviceId);
                    }} 
                    className="hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span>{s.label}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Compliance & Tools */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Statutory Portals</h4>
              <div className="space-y-2 text-xs font-medium text-slate-400 flex flex-col gap-1.5">
                {[
                  { label: "INCroute Books Accounting", tab: "books" },
                  { label: "Annual Compliance Audit", tab: "compliance" },
                  { label: "ROC Form Filings (MGT/AOC)", serviceId: "return-filing" },
                  { label: "GST & Tax Reconciliation", serviceId: "gst-tax" },
                  { label: "Company Name Feasibility Tool", tab: "name-checker" },
                  { label: "Service Impact Analytics", tab: "impact" }
                ].map(s => (
                  <p 
                    key={s.label} 
                    onClick={() => { 
                      if (s.serviceId) handleServiceClick(s.serviceId);
                      else if (s.tab) { setActiveTab(s.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }
                    }} 
                    className="hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {s.label}
                  </p>
                ))}
              </div>
            </div>

            {/* Legal & Company */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Company & Legal</h4>
              <div className="space-y-2 text-xs font-medium text-slate-400 flex flex-col items-start gap-2">
                {[
                  { label: "About INCroute", tab: "about" },
                  { label: "Knowledge Hub & FAQs", tab: "faq" },
                  { label: "Career Openings", tab: "careers" },
                  { label: "Privacy & Data Protection", tab: "policies" },
                  { label: "Terms of Service", tab: "policies" },
                  { label: "Refund & Cancellation Policy", tab: "policies" }
                ].map(s => (
                  <button 
                    key={s.label} 
                    onClick={() => { if(s.tab) setActiveTab(s.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="block text-left hover:text-indigo-400 cursor-pointer transition-colors border-none bg-transparent p-0 text-xs font-medium text-slate-400 outline-none"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Concierge Column */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Expert Concierge</h4>
              <div className="space-y-2.5 text-xs font-medium text-slate-400 flex flex-col gap-2">
                <a href="mailto:info@incroute.com" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:text-white transition-all cursor-pointer">
                  <Mail className="w-4 h-4 shrink-0 text-[#818CF8]" />
                  <span>info@incroute.com</span>
                </a>
                <a href="tel:+918707552183" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:text-white transition-all cursor-pointer">
                  <Phone className="w-4 h-4 shrink-0 text-[#38BDF8]" />
                  <span>+91 87075 52183</span>
                </a>
                <div className="flex items-center gap-2 text-slate-500 text-[11px] px-1">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                  <span>Mon - Sat: 9:30 AM - 6:30 PM IST</span>
                </div>
              </div>
            </div>

          </div>

          {/* Newsletter Subscription Strip */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#818CF8]" />
                <h4 className="text-sm font-bold text-white tracking-wide">Stay Corporate & Tax Compliance-Ready</h4>
              </div>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                Receive monthly regulatory digests on MCA notifications, GST amendments, and startup tax exemptions directly in your inbox.
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to INCroute Compliance Bulletins!"); }} className="relative flex items-center w-full lg:w-96 shrink-0">
              <input
                type="email"
                placeholder="Enter your official email address"
                required
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#6366F1] text-xs text-slate-100 pl-4 pr-12 py-3 rounded-2xl outline-none placeholder-slate-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 p-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-90 text-white rounded-xl transition-all border-none cursor-pointer outline-none flex items-center justify-center shadow-md shadow-indigo-500/20"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Copyright & Scroll Top Strip */}
          <div className="mt-10 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-500 font-medium">
              © {new Date().getFullYear()} INCroute Corporate Technologies Pvt. Ltd. All statutory trademarks and copyrights reserved.
            </span>
            <button
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none shadow-sm"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
            >
              ▲
            </button>
          </div>
        </div>
      </footer>

      {/* Next-Gen Mobile Bottom Dock (Phone users) */}
      <MobileBottomDock 
        setActiveTab={setActiveTab} 
        onOpenConsultationModal={() => setShowExpertModal(true)} 
      />

      {/* Floating CA/CS Advisor & Quick Help Desk (Desktop & Tablet) */}
      <FloatingAdvisorFab setActiveTab={setActiveTab} />

      {/* Live Social Proof Activity Toasts */}
      <LiveActivityToast />

      {/* Smart Welcome Lead Modal with Voucher & Blueprint PDF */}
      <WelcomeOfferModal onServiceSelect={(sId) => handleServiceClick(sId)} />
    </div>
  );
}
