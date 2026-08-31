import React, { useState, createContext, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Breadcrumb from "./Breadcrumb";
import TopAnnouncementBar from "./TopAnnouncementBar";
import MobileBottomDock from "./MobileBottomDock";
import FloatingAdvisorFab from "./FloatingAdvisorFab";
import LiveActivityToast from "./LiveActivityToast";
import WelcomeOfferModal from "./WelcomeOfferModal";
import { useTabNavigation } from "../lib/useTabNavigation";
import {
  Sparkles,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Phone,
  Clock,
  Send,
} from "lucide-react";

// ─── Service-click context so footer / mobile-dock can navigate to detail pages ───
interface ServiceClickCtx {
  handleServiceClick: (serviceId: string) => void;
}
const ServiceClickContext = createContext<ServiceClickCtx>({
  handleServiceClick: () => {},
});
export const useServiceClick = () => useContext(ServiceClickContext);

// ─── Service → Category mapping (moved from App.tsx) ───
export const SERVICE_CATEGORIES: Record<string, string> = {
  "pvt-ltd": "private-corporate",
  opc: "private-corporate",
  section8: "private-corporate",
  "public-ltd": "private-corporate",
  "producer-company": "private-corporate",
  "nidhi-company": "private-corporate",
  "indian-subsidiary": "private-corporate",
  llp: "alternative-entity",
  partnership: "alternative-entity",
  "sole-proprietorship": "alternative-entity",
  "trust-registration": "alternative-entity",
  "society-registration": "alternative-entity",
  "fcra-registration": "alternative-entity",
  "12a-80g-registration": "alternative-entity",
  "12aa-registration": "alternative-entity",
  "virtual-cfo": "enterprise-growth",
  "virtual-office": "enterprise-growth",
  "startup-grants": "enterprise-growth",
  "pitch-deck": "enterprise-growth",
  "seed-funding": "enterprise-growth",
  "cap-table-valuation": "enterprise-growth",
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
  dir3: "compliance",
  inc20a: "compliance",
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
  "logo-brand-ip": "legal-ip",
};

export default function PublicLayout() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useTabNavigation();
  const [showExpertModal, setShowExpertModal] = useState(false);

  const handleServiceClick = (serviceId: string) => {
    const category = SERVICE_CATEGORIES[serviceId] || "general";
    navigate(`/services/${category}/${serviceId}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ServiceClickContext.Provider value={{ handleServiceClick }}>
      <div className="min-h-screen text-brand-text flex flex-col selection:bg-brand-gold/30 selection:text-brand-text relative homepage-shell">
        {/* Global Atmospheric Ambient Aura */}
        <div className="ambient-aura-layer fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
          <div className="ambient-orb ambient-orb-4" />
          <div className="ambient-mesh-grid" />
        </div>

        {/* Top Statutory Announcement Bar */}
        <TopAnnouncementBar
          onBookConsultation={() => setShowExpertModal(true)}
          onSelectService={(sId) => handleServiceClick(sId)}
        />

        {/* Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Main content — child routes render here */}
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          <Outlet />
        </main>

        {/* ─── Footer ─── */}
        <footer className="bg-[#070D1B] border-t border-slate-800/80 pt-14 pb-12 mt-auto text-slate-400 font-sans relative overflow-hidden">
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
                  {[{ icon: Linkedin, link: "#" }, { icon: Twitter, link: "#" }, { icon: Youtube, link: "#" }, { icon: Instagram, link: "#" }].map((s, i) => (
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
                    { label: "Producer Company Setup", serviceId: "producer-company" },
                  ].map((s) => (
                    <p
                      key={s.label}
                      onClick={() => { if (s.serviceId) handleServiceClick(s.serviceId); }}
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
                    { label: "Service Impact Analytics", tab: "impact" },
                  ].map((s) => (
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
                    { label: "Refund & Cancellation Policy", tab: "policies" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { if (s.tab) setActiveTab(s.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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

        {/* Mobile Bottom Dock (Phone users) */}
        <MobileBottomDock setActiveTab={setActiveTab} onOpenConsultationModal={() => setShowExpertModal(true)} />

        {/* Floating CA/CS Advisor & Quick Help Desk (Desktop & Tablet) */}
        <FloatingAdvisorFab setActiveTab={setActiveTab} />

        {/* Live Social Proof Activity Toasts */}
        <LiveActivityToast />

        {/* Smart Welcome Lead Modal */}
        <WelcomeOfferModal onServiceSelect={(sId) => handleServiceClick(sId)} />
      </div>
    </ServiceClickContext.Provider>
  );
}
