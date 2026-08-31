import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/PublicLayout";
import ServiceDetailRoute from "./components/ServiceDetailRoute";
import PartnerCustomerDetailRoute from "./components/PartnerCustomerDetailRoute";
import { useAuth } from "./lib/AuthContext";
import { useTabNavigation } from "./lib/useTabNavigation";

// ─── Lazy-loaded public page components ───
const ServicesHubPage = lazy(() => import("./components/ServicesHubPage"));
const ServiceDetailPage = lazy(() => import("./components/ServiceDetailPage"));
const RegistrationServices = lazy(() => import("./components/RegistrationServices"));
const NameFeasibilityChecker = lazy(() => import("./components/NameFeasibilityChecker"));
const BlogPage = lazy(() => import("./components/BlogPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const ContactFormWidget = lazy(() => import("./components/ContactFormWidget"));
const CustomerDashboard = lazy(() => import("./components/CustomerDashboard"));
const PartnerDashboard = lazy(() => import("./components/PartnerDashboard"));
const PartnerCustomerDetail = lazy(() => import("./components/PartnerCustomerDetail"));
const ClientPortal = lazy(() => import("./portal/ClientPortal"));
const PartnerPortal = lazy(() => import("./partner/PartnerPortal"));
const AdminPortal = lazy(() => import("./admin/AdminPortal"));
const BooksApp = lazy(() => import("./books/BooksApp"));
const BooksLoginPage = lazy(() => import("./books/pages/BooksLoginPage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const AuthPortal = lazy(() => import("./components/AuthPortal"));
const ServiceCatalogInsights = lazy(() => import("./components/ServiceCatalogInsights"));
const StatutoryTools = lazy(() => import("./components/StatutoryTools"));
const LegalPolicies = lazy(() => import("./components/LegalPolicies"));
const AnimatedTimeline = lazy(() => import("./components/AnimatedTimeline"));
const EntityComparison = lazy(() => import("./components/EntityComparison"));
const ServiceImpactDashboard = lazy(() => import("./components/ServiceImpactDashboard"));
const ComplianceFlowchart = lazy(() => import("./components/ComplianceFlowchart"));
const TestimonialsSection = lazy(() => import("./components/TestimonialsSection"));
const LocalCityLanding = lazy(() => import("./components/LocalCityLanding"));
const AnswerHub = lazy(() => import("./components/AnswerHub"));
const ComplianceCalendarSection = lazy(() => import("./components/ComplianceCalendarSection"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const CareersForm = lazy(() => import("./components/CareersForm"));

// ─── Compliance calendar data (static fallback + roadmap) ───
const roadmapMilestones = [
  {
    days: "30 Days",
    title: "First Board Meeting & Share Allocation",
    form: "Board Resolution & Form INC-22A (KYC)",
    description: "Convening the first board of directors meeting to adopt basic bylaws and issue share certificates to initial subscribers.",
    penalty: "₹50,000 penalty on directors and risk of registry warnings if share certificates are not dispatched within 60 days of incorporation.",
    tip: "Ensure you open a corporate bank account immediately to deposit the subscribed share capital!",
  },
  {
    days: "60 Days",
    title: "Auditor Appointment & LLP Deed",
    form: "Form ADT-1 (Auditor Appointment) or Form 3 (LLP Agreement)",
    description: "Appointing the statutory auditor of the company (Form ADT-1) or filing the stamped LLP partnership agreement with ROC (Form 3).",
    penalty: "₹300 per day recurring late filing fees on LLP partners, and daily compounding penalties on Pvt Ltd companies.",
    tip: "We can stamp and draft your custom LLP Partnership agreements for you automatically!",
  },
  {
    days: "180 Days",
    title: "Commencement of Business Certificate",
    form: "Form 20A (Commencement of Business Declaration)",
    description: "Filing a declaration with the ROC proving that subscribers have deposited their capital subscription into the company bank account.",
    penalty: "₹50,000 flat penalty plus ROC registry will strike-off the company automatically if not filed within 180 days of registry!",
    tip: "You cannot trade or start operations until Form 20A is approved!",
  },
  {
    days: "1 Year",
    title: "Annual ROC Filings AOC-4 & MGT-7",
    form: "Form AOC-4 (Financials) & Form MGT-7 (Annual Return)",
    description: "Filing the audited balance sheet, profit & loss statement, and current director profiles with the Central Registrar annually.",
    penalty: "₹100 per day flat penalty per form indefinitely, leading to directors being whitelisted as disqualified.",
    tip: "Keep clean invoices to ensure your statutory auditor can complete your balance sheet inside 30 days of the AGM!",
  },
];

// ─── Loading spinner (shown during lazy-load) ───
function PageSpinner({ accent }: { accent?: string }) {
  const color = accent || "var(--accent, #d4af37)";
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: color, borderTopColor: "transparent" }} />
    </div>
  );
}

function PortalSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Route Guard: redirects unauthenticated users and enforces role access ───
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isBooksDomain = typeof window !== "undefined" && window.location.hostname.startsWith("books.");

  useEffect(() => {
    if (loading) return;
    if (user && !profile) return;

    const path = location.pathname;
    const isDashboardRoute = ["/portal", "/partner", "/admin", "/books"].some((p) => path.startsWith(p)) || path.startsWith("/dashboard/");

    if (!user && isDashboardRoute && !path.startsWith("/books") && !isBooksDomain) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`, { replace: true });
    }
  }, [user, profile, loading, location.pathname]);

  return <>{children}</>;
}

// ─── Role-based redirect: sends logged-in users to their correct portal ───
function RoleRedirect() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;
  if (user && !profile) return <PageSpinner />;

  // Not logged in → show login
  if (!user) return <LoginPage />;

  // Logged in → redirect to role's portal
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.role === "partner") return <Navigate to="/partner" replace />;
  return <Navigate to="/portal" replace />;
}

// ─── Books portal (renders without outer shell) ───
function BooksRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isBooksDomain = typeof window !== "undefined" && window.location.hostname.startsWith("books.");

  if (loading) return <PortalSpinner />;

  if (!user) {
    return (
      <Suspense fallback={<PortalSpinner />}>
        <BooksLoginPage />
      </Suspense>
    );
  }

  let booksBasePath = "/books";
  if (isBooksDomain) booksBasePath = "";
  else if (location.pathname.startsWith("/portal/books")) booksBasePath = "/portal/books";
  else if (location.pathname.startsWith("/admin/books")) booksBasePath = "/admin/books";

  return (
    <Suspense fallback={<PortalSpinner />}>
      <BooksApp
        basePath={booksBasePath}
        onExit={() => {
          if (isBooksDomain) window.location.href = "https://incroute.com";
          else navigate("/");
        }}
      />
    </Suspense>
  );
}

// ─── Full-screen portal wrappers (render without outer shell) ───
function AdminRoute() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (profile && profile.role !== "admin") {
      navigate(profile.role === "partner" ? "/partner" : "/portal");
    }
  }, [user, profile, loading]);

  if (loading || !user) return <PortalSpinner />;
  return (
    <Suspense fallback={<PortalSpinner />}>
      <AdminPortal />
    </Suspense>
  );
}

function PartnerRoute() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (profile && profile.role !== "partner") {
      navigate(profile.role === "admin" ? "/admin" : "/portal");
    }
  }, [user, profile, loading]);

  if (loading || !user) return <PortalSpinner />;
  return (
    <Suspense fallback={<PortalSpinner />}>
      <PartnerPortal />
    </Suspense>
  );
}

function PortalRoute() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (profile && profile.role !== "customer") {
      navigate(profile.role === "admin" ? "/admin" : "/partner");
    }
  }, [user, profile, loading]);

  if (loading || !user) return <PortalSpinner />;
  return (
    <Suspense fallback={<PortalSpinner />}>
      <ClientPortal />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════════
// App — top-level route definitions
// ═══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <RouteGuard>
      <ScrollToTop />
      <Routes>
        {/* ─── Auth routes (no shell) ─── */}
        <Route path="/login" element={<RoleRedirect />} />
        <Route path="/auth" element={
          <Suspense fallback={<PageSpinner />}>
            <AuthPortal />
          </Suspense>
        } />

        {/* ─── Full-screen portals (no shell) ─── */}
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/partner" element={<PartnerRoute />} />
        <Route path="/portal" element={<PortalRoute />} />

        {/* ─── Books portal ─── */}
        <Route path="/books/*" element={<BooksRoute />} />
        <Route path="/portal/books/*" element={<BooksRoute />} />
        <Route path="/admin/books/*" element={<BooksRoute />} />

        {/* ─── Partner customer detail (full-screen) ─── */}
        <Route path="/dashboard/partner/customer/:id" element={<PartnerCustomerDetailRoute />} />

        {/* ─── Public pages (with Navbar, Footer, MobileDock shell) ─── */}
        <Route element={<PublicLayout />}>
          {/* Home / Services */}
          <Route path="/" element={
            <Suspense fallback={<PageSpinner />}>
              <RegistrationServices />
            </Suspense>
          } />

          {/* Services Hub (catalog listing) */}
          <Route path="/services" element={
            <Suspense fallback={<PageSpinner />}>
              <ServicesHubPage />
            </Suspense>
          } />

          {/* Service Detail */}
          <Route path="/services/:category/:serviceId" element={
            <Suspense fallback={<PageSpinner />}>
              <ServiceDetailRoute />
            </Suspense>
          } />

          {/* Blog */}
          <Route path="/blog" element={
            <Suspense fallback={<PageSpinner />}>
              <BlogPage />
            </Suspense>
          } />

          {/* About */}
          <Route path="/about" element={
            <Suspense fallback={<PageSpinner />}>
              <AboutPage />
            </Suspense>
          } />

          {/* Contact */}
          <Route path="/contact" element={
            <Suspense fallback={<PageSpinner />}>
              <ContactFormWidget />
            </Suspense>
          } />

          {/* Tools */}
          <Route path="/tools" element={
            <Suspense fallback={<PageSpinner />}>
              <StatutoryTools />
            </Suspense>
          } />

          {/* Tools — Name Checker */}
          <Route path="/tools/name-checker" element={
            <Suspense fallback={<PageSpinner />}>
              <NameFeasibilityChecker />
            </Suspense>
          } />

          {/* Tools — Entity Comparison */}
          <Route path="/tools/entity-comparison" element={
            <Suspense fallback={<PageSpinner />}>
              <EntityComparison />
            </Suspense>
          } />

          {/* Tools — Impact Dashboard */}
          <Route path="/tools/impact-dashboard" element={
            <Suspense fallback={<PageSpinner />}>
              <ServiceImpactDashboard />
            </Suspense>
          } />

          {/* Knowledge Hub / FAQ */}
          <Route path="/knowledge-hub" element={
            <Suspense fallback={<PageSpinner />}>
              <AnswerHub />
            </Suspense>
          } />

          {/* Compliance */}
          <Route path="/compliance" element={
            <Suspense fallback={<PageSpinner />}>
              <ComplianceCalendarSection />
            </Suspense>
          } />

          {/* Compliance Flowchart */}
          <Route path="/compliance/flowchart" element={
            <Suspense fallback={<PageSpinner />}>
              <ComplianceFlowchart />
            </Suspense>
          } />

          {/* Catalog */}
          <Route path="/catalog" element={
            <Suspense fallback={<PageSpinner />}>
              <ServiceCatalogInsights />
            </Suspense>
          } />

          {/* Testimonials */}
          <Route path="/testimonials" element={
            <Suspense fallback={<PageSpinner />}>
              <TestimonialsSection />
            </Suspense>
          } />

          {/* Policies */}
          <Route path="/policies" element={
            <Suspense fallback={<PageSpinner />}>
              <LegalPolicies />
            </Suspense>
          } />

          {/* Careers */}
          <Route path="/careers" element={
            <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 w-full text-left space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
                  ✨ Join Incroute
                </div>
                <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
                  Build the Future of <span className="text-brand-gold italic font-normal">Legal Tech.</span>
                </h1>
                <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
                  We are looking for passionate individuals to join our mission in simplifying compliance, incorporation, and corporate governance for startups across India.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Open Positions</h3>
                  <div className="space-y-4">
                    {[
                      { title: "Legal & Compliance Associate", type: "Full-Time", location: "Bangalore / Remote", desc: "Assist clients with MCA filings, company incorporation documents, and compliance reviews." },
                      { title: "Full-Stack Software Engineer", type: "Full-Time", location: "Bangalore", desc: "Build robust frontend dashboards and automation engines for filing operations." },
                      { title: "Business Development Intern", type: "Internship (3-6 Months)", location: "Remote", desc: "Work closely with startup founders to guide them through our incorporation and tax offerings." },
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
                <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 space-y-5">
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
                    Submit Your Application
                  </h3>
                  <Suspense fallback={<PageSpinner />}>
                    <CareersForm />
                  </Suspense>
                </div>
              </div>
            </div>
          } />

          {/* Local City Landing Pages */}
          <Route path="/company-registration-bangalore" element={
            <Suspense fallback={<PageSpinner />}>
              <LocalCityLanding cityId="bangalore" />
            </Suspense>
          } />
          <Route path="/company-registration-mumbai" element={
            <Suspense fallback={<PageSpinner />}>
              <LocalCityLanding cityId="mumbai" />
            </Suspense>
          } />
          <Route path="/company-registration-delhi" element={
            <Suspense fallback={<PageSpinner />}>
              <LocalCityLanding cityId="delhi" />
            </Suspense>
          } />

          {/* 404 */}
          <Route path="*" element={
            <Suspense fallback={<PageSpinner />}>
              <NotFoundPage />
            </Suspense>
          } />
        </Route>
      </Routes>
    </RouteGuard>
  );
}
