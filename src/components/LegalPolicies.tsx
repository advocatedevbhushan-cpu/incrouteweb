import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Lock, RefreshCw, AlertTriangle, Cookie, ShieldCheck, 
  Download, ChevronDown, ChevronUp, Mail, Phone, ExternalLink, 
  ShieldAlert, HelpCircle, MessageSquare, Info, Sparkles, Building2, ArrowRight
} from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import { useAppNavigate } from "../lib/useAppNavigate";

type PolicySection = "terms" | "privacy" | "refund" | "disclaimer" | "cookie" | "compliance";

export default function LegalPolicies() {
  const { lang } = useLang();
  const navigateToTab = useAppNavigate();
  const [activeSection, setActiveSection] = useState<PolicySection>("terms");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "refund", label: "Refund Policy", icon: RefreshCw },
    { id: "disclaimer", label: "Disclaimer", icon: AlertTriangle },
    { id: "cookie", label: "Cookie Policy", icon: Cookie },
    { id: "compliance", label: "Compliance Policy", icon: ShieldCheck },
  ] as const;

  const faqs = [
    {
      q: "Are these policies legally binding?",
      a: "Yes, by accessing our services, calculations, or drafts, you agree to comply with our Terms & Conditions and Privacy Policy. These document legal agreements between you and INCroute."
    },
    {
      q: "Can I request a refund?",
      a: "Government fees and stamp duties are strictly non-refundable once paid to department accounts. Professional/service fees may be refunded as per refund eligibility rules before filing initiation."
    },
    {
      q: "How is my data protected?",
      a: "We deploy standard secure sockets layer (SSL) transmission and encrypted databases to prevent unauthorized leaks. Shared only with statutory MCA/ROC portals for company filing details."
    },
    {
      q: "How can I contact the legal team?",
      a: "For all statutory compliance queries or policy concerns, reach out to our support team at info@incroute.com or raise a ticket from the contact desk."
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto text-left relative z-10 font-sans">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold rounded-full border border-indigo-500/10 uppercase tracking-widest font-mono">
          <ShieldAlert className="w-3.5 h-3.5" /> Legal Policies
        </div>
        <h1 className="text-4xl font-extrabold text-[#080F2A] tracking-tight sm:text-5xl">
          Terms, Policies & <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic font-extrabold pr-2 inline-block">Compliance.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
          Transparent legal terms, privacy, refunds, and compliance policies for our users and clients.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sidebar Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white/85 border border-indigo-500/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
            <h4 className="text-[10px] font-mono uppercase text-[#080F2A] tracking-wider font-bold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4F46E5]" /> On this page
            </h4>
            
            {/* Desktop Vertical Menu */}
            <div className="hidden lg:flex flex-col gap-1.5">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeSection === id
                      ? "bg-indigo-50/60 border-l-4 border-l-[#4F46E5] border-indigo-500/10 text-[#4F46E5]"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-[#4F46E5]" : "text-slate-400"}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Scrollable Menu */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 scrollbar-thin">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeSection === id
                      ? "bg-indigo-50 border-indigo-500/15 text-[#4F46E5]"
                      : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security Assurance Badge */}
          <div className="bg-white/70 border border-indigo-500/10 rounded-3xl p-5 shadow-sm backdrop-blur-sm text-left space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-[#4F46E5]" />
              <span className="text-[10px] font-mono uppercase text-[#080F2A] font-bold tracking-wider">Your trust matters</span>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-light">
              We follow industry best practices and applicable laws to keep your data and business secure.
            </p>
          </div>
        </div>

        {/* Center Column: Active Policy Content (6 cols) */}
        <div className="lg:col-span-6 bg-white/90 border border-indigo-500/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap gap-2 items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 text-[9px] font-mono bg-slate-50 border border-slate-200 rounded font-semibold text-slate-500">Last updated: May 20, 2024</span>
              <span className="px-2.5 py-0.5 text-[9px] font-mono bg-indigo-50 border border-indigo-100 rounded font-bold text-[#4F46E5]">Reviewed by legal team</span>
            </div>
            <button 
              onClick={() => alert("PDF download coming soon.")}
              className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>

          {/* Policy Text Reader */}
          <div className="space-y-6 font-sans text-xs text-slate-600 leading-relaxed max-h-[600px] overflow-y-auto pr-2">
            
            {activeSection === "terms" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">1. Terms & Conditions</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[#4F46E5] pb-2 border-b border-slate-50">
                  <span>1.1 Acceptance</span> • <span>1.2 Services</span> • <span>1.3 Obligations</span> • <span>1.4 Payments</span> • <span>1.5 Termination</span> • <span>1.6 Liability</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.1 Acceptance of Terms</h4>
                  <p>
                    By accessing or using INCroute's website and services, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree, please discontinue service usage.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.2 Description of Services</h4>
                  <p>
                    INCroute provides digital tools and resources to help users calculate government stamp duties, generate legal drafts, and access related compliance utilities. Services are provided "as is" and may be updated from time to time.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.3 User Obligations</h4>
                  <p>You agree to:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Provide accurate and complete information.</li>
                    <li>Use the services only for lawful purposes.</li>
                    <li>Maintain the confidentiality of your account credentials.</li>
                    <li>Not engage in any activity that disrupts or harms the platform or its users.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.4 Payments & Pricing</h4>
                  <p>
                    All fees are displayed in INR and are inclusive of applicable taxes unless stated otherwise. Stamp duty is calculated as per the respective State Stamp Acts and is payable to the government. Service fees (if any) are billed separately and are non-refundable except as stated in our Refund Policy.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.5 Term & Termination</h4>
                  <p>
                    We reserve the right to suspend or terminate access to our services at our sole discretion, without notice, for conduct that violates these Terms or is harmful to other users or business interests.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">1.6 Limitation of Liability</h4>
                  <p>
                    INCroute and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the statutory calculators, templates, or drafted agreements.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">2. Privacy Policy</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[#4F46E5] pb-2 border-b border-slate-50">
                  <span>2.1 Collection</span> • <span>2.2 Security</span> • <span>2.3 Sharing</span> • <span>2.4 Cookies</span> • <span>2.5 Rights</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">2.1 Information Collected</h4>
                  <p>
                    We collect personal information necessary to offer services, including names, email addresses, contact details, and corporate configuration data. We do not store sensitive payment details.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">2.2 Data Security</h4>
                  <p>
                    We deploy industry-standard secure socket layers (SSL) and database encryption keys to secure your data from unauthorized access, loss, or disclosure.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">2.3 Sharing with Government Portals</h4>
                  <p>
                    Your data is shared with government filing systems (MCA, ROC, state e-stamping gateways) only to complete filing and statutory procedures initiated by you.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">2.4 Cookie Usage</h4>
                  <p>
                    Cookies are deployed to maintain session persistence and remember calculator and drafting wizard configurations. You may adjust your browser options to reject cookies.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "refund" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">3. Refund Policy</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[#4F46E5] pb-2 border-b border-slate-50">
                  <span>3.1 Govt Fees</span> • <span>3.2 Service Fees</span> • <span>3.3 Deductions</span> • <span>3.4 Process</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">3.1 Government Fees & Stamp Duties</h4>
                  <p className="border-l-2 border-amber-500 pl-3 bg-amber-50/40 py-2 rounded text-slate-600">
                    <strong>Statutory Warning:</strong> Government fees, ROC registration fees, and state stamp duties are strictly non-refundable once paid to department accounts or state treasuries.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">3.2 Professional Service Fees</h4>
                  <p>
                    Professional/service fees are refundable as per refund eligibility rules before work starts. If a refund request is made after drafting has commenced, service deductions apply.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">3.3 Process</h4>
                  <p>
                    Refund requests must be sent to info@incroute.com with the purchase invoice number. Approved refunds are processed to the original payment channel within 7-10 business days.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "disclaimer" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">4. Disclaimer</h3>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">4.1 General Information</h4>
                  <p>
                    The tools, estimators, calculators, and drafts on the website are for general informational purposes only. They do not constitute formal legal advice or create an attorney-client relationship.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">4.2 Stamp Duty Estimates</h4>
                  <p>
                    While our state rule engine is updated regularly, final payable amount must be verified on the official MCA21 portal or State Stamp Act before filing. INCroute is not responsible for ROC objections or penalties.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">4.3 Government Discretion</h4>
                  <p>
                    Approvals for corporate registration depend entirely on the discretion of the Ministry of Corporate Affairs, Registrar of Companies, and other authorities.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "cookie" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">5. Cookie Policy</h3>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">5.1 What are Cookies?</h4>
                  <p>
                    Cookies are small text files placed on your device to keep the app operational.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">5.2 How We Use Cookies</h4>
                  <p>
                    We deploy essential session cookies (to store logged-in states) and preference cookies (to cache calculator state and drafting configurations).
                  </p>
                </div>
              </div>
            )}

            {activeSection === "compliance" && (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#080F2A]">6. Compliance Policy</h3>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">6.1 Statutory Filing Support</h4>
                  <p>
                    We facilitate timely preparation of filings. However, clients remain responsible for providing complete, accurate details to ensure compliance under the Companies Act 2013.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#080F2A]">6.2 Document Security</h4>
                  <p>
                    All uploaded registration files, ID proofs, and deeds are stored in secured database blocks and are purged post filing completion as per guidelines.
                  </p>
                </div>
              </div>
            )}

          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveSection(activeSection === "terms" ? "privacy" : "terms")}
              className="text-[#4F46E5] hover:text-[#3730A3] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Read full policy <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Highlights Card (3 cols) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white/85 border border-indigo-500/10 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4 text-left">
            <h4 className="text-[10px] font-mono uppercase text-[#080F2A] tracking-wider font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" /> Key Highlights
            </h4>

            {/* List items */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#080F2A]">
                  <div className="p-1 rounded bg-indigo-50 text-[#4F46E5] shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Service Scope</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-light pl-7">
                  Digital tools for stamp duty calculation, legal draft generation, and compliance utilities.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#080F2A]">
                  <div className="p-1 rounded bg-indigo-50 text-[#4F46E5] shrink-0">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <span>Payment Terms</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-light pl-7">
                  Stamp duty payable to the government. Service fees (if any) are non-refundable except as per policy.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#080F2A]">
                  <div className="p-1 rounded bg-indigo-50 text-[#4F46E5] shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span>Confidentiality</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-light pl-7">
                  We protect your data and do not sell or share personal information.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#080F2A]">
                  <div className="p-1 rounded bg-indigo-50 text-[#4F46E5] shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <span>Liability Limitation</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-light pl-7">
                  Services are provided "as is" without warranties. Our liability is limited to the extent permitted by law.
                </p>
              </div>
            </div>

            {/* Support CTA */}
            <div className="border-t border-slate-100 pt-4 space-y-2 mt-2">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block mb-1">Need Help?</span>
              <button 
                onClick={() => navigateToTab("contact")}
                className="w-full flex items-center justify-center gap-1 bg-white border border-slate-200 hover:border-[#4F46E5]/30 text-slate-600 hover:text-[#4F46E5] font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer font-sans py-3"
              >
                Contact Support <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Accordion FAQ Section */}
      <div className="max-w-5xl mx-auto bg-white/80 border border-indigo-500/10 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-between">
          
          {/* FAQ Left details */}
          <div className="md:max-w-xs space-y-2 text-left shrink-0">
            <div className="p-3 rounded-2xl bg-indigo-50 text-[#4F46E5] border border-indigo-100 shrink-0 w-fit">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-extrabold text-[#080F2A] font-sans">Have questions?</h4>
            <p className="text-xs text-slate-400 font-sans">
              Find answers to common questions about our policies.
            </p>
          </div>

          {/* Accordion List */}
          <div className="flex-1 space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm text-left transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 font-sans font-bold text-xs text-[#080F2A] hover:text-[#4F46E5] cursor-pointer outline-none text-left"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 pt-1.5 text-[11px] text-slate-500 font-sans leading-relaxed border-t border-slate-50/50">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer copyright segment */}
      <div className="pt-6 border-t border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-400 max-w-5xl mx-auto">
        <p>© 2026 INCroute. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveSection("terms")} className="hover:text-[#4F46E5] transition-colors cursor-pointer bg-transparent border-none p-0">Terms & Conditions</button>
          <span>•</span>
          <button onClick={() => setActiveSection("privacy")} className="hover:text-[#4F46E5] transition-colors cursor-pointer bg-transparent border-none p-0">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setActiveSection("compliance")} className="hover:text-[#4F46E5] transition-colors cursor-pointer bg-transparent border-none p-0">Compliance Policy</button>
        </div>
      </div>

    </div>
  );
}
