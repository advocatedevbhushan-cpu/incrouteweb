import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Check, ArrowRight, ShieldCheck, Clock, FileText, Building2, 
  HelpCircle, Star, PhoneCall, Sparkles, ChevronDown, ChevronRight,
  Award, Lock, UserCheck, MapPin, CheckSquare, AlertCircle,
  Briefcase, Scale, Layers, CheckCircle2, HeartHandshake, FileCheck
} from "lucide-react";
import { servicesRegistry, getServiceById, TITLE_MAP, ServiceItem } from "../data/servicesRegistry";

interface Props {
  serviceId?: string;
  category?: string;
  setActiveTab?: (tab: string) => void;
}

export default function ServiceDetailPage({ serviceId: propServiceId, category: propCategory, setActiveTab }: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract directly from location.pathname as the ultimate ground truth if props/params are unpopulated
  // e.g. /services/compliance/gst-return-filing/ => category = "compliance", serviceId = "gst-return-filing"
  const match = location.pathname.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
  const targetCategory = propCategory || params.category || (match ? match[1] : "general");
  const targetServiceId = propServiceId || params.serviceId || (match ? match[2] : "pvt-ltd");

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPkg, setSelectedPkg] = useState<number>(1);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  // Lookup in central registry
  const registryEntry = getServiceById(targetServiceId);
  const titleInfo = TITLE_MAP[targetServiceId];

  // Derive human title from serviceId if missing
  const formattedTitle = targetServiceId
    .split("-")
    .map(w => {
      const lower = w.toLowerCase();
      if (lower === "gst" || lower === "gstr9" || lower === "itr" || lower === "roc" || lower === "dir3" || lower === "inc20a" || lower === "mca" || lower === "llp" || lower === "opc" || lower === "fssai" || lower === "msme" || lower === "iec" || lower === "iso" || lower === "posh" || lower === "nda" || lower === "cfo" || lower === "fcra") {
        return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");

  const service: ServiceItem = registryEntry || {
    id: targetServiceId,
    name: titleInfo ? titleInfo.name : formattedTitle,
    category: targetCategory,
    tagline: titleInfo ? titleInfo.tagline : "Professional Corporate Statutory Service by INCroute Advisors",
    image: "/pvt_ltd_corp.webp",
    timeline: "5–7 Working Days",
    minDirectors: "Corporate Advisor Lead",
    liability: "Statutory Compliance",
    detailedAbout: titleInfo
      ? titleInfo.description
      : `${formattedTitle} is an essential statutory compliance and legal execution service in India. Managed directly by INCroute's certified Chartered Accountants and Company Secretaries, this service ensures 100% adherence to Ministry of Corporate Affairs (MCA), Income Tax Department, and state regulatory guidelines. We handle all document drafting, secretarial verification, and government portal filings with zero query rejection.`,
    keyAdvantages: [
      `100% legal compliance under Indian statutory mandates`,
      `Verified document drafting by experienced CAs and CSs`,
      `Zero office visit required — fast 100% digital e-filing`,
      `Avoid heavy government late filing fees & department notices`,
      `Includes dedicated post-approval support & compliance advice`
    ],
    badge: "Verified Service",
    expert: "INCroute Team",
    rating: 5,
    description: titleInfo ? titleInfo.description : `Professional ${formattedTitle} handled by certified corporate advisors.`,
    popular: true,
    features: [
      "Statutory Document Drafting",
      "Government Portal E-Filing",
      "Dedicated Secretarial Manager"
    ],
    documents: [
      "PAN Card & Aadhaar Card of Directors / Business Owner",
      "Proof of Registered Business Premises (Electricity Bill / Rent Agreement)",
      "Landlord No Objection Certificate (NOC)",
      "Bank Account details / Cancelled Cheque"
    ]
  };

  const workflowSteps = [
    { title: "Document Scrutiny & Expert Consultation", desc: "Our team of CAs and CSs reviews your business documents to guarantee zero query rejection on government portals." },
    { title: "Statutory Drafting & Pre-Check", desc: "We prepare all necessary MOA, AOA, deeds, declarations, and legal forms tailored specifically to your entity." },
    { title: "Government Portal E-Filing", desc: "Official submission of applications (MCA, GST, DGFT, or IP India) with statutory clearance." },
    { title: "Certificate Issuance & Compliance Kit", desc: "Receive your official government registration certificate, allotment details, and post-approval compliance roadmap." }
  ];

  const packageScopes = [
    {
      name: "Basic Standard Scope",
      badge: "Standard",
      features: [
        "Complete Document Verification",
        "Statutory Application Drafting",
        "Government E-Filing Coordination",
        "Digital Certificate Delivery"
      ]
    },
    {
      name: "Founders Growth Scope",
      badge: "Recommended",
      popular: true,
      features: [
        "Everything in Basic Standard Scope",
        "Express Fast-Track Processing SLA",
        "Dedicated Chartered Accountant Manager",
        "MSME / Udyam Certificate Included",
        "INCroute Books Accounting Pass (1 Year)"
      ]
    },
    {
      name: "Complete Enterprise Suite",
      badge: "Enterprise",
      features: [
        "Everything in Founders Growth Scope",
        "Trademark Brand Application (1 Class)",
        "Founder NDA & Agreement Drafting",
        "Virtual Office Premises 1-Year Pass",
        "Priority Phone & Whatsapp Support"
      ]
    }
  ];

  const faqs = [
    {
      q: `What is the estimated turnaround time for ${service.name}?`,
      a: `The standard processing turnaround time is ${service.timeline}. INCroute experts initiate e-filing within 24 hours of receiving your completed documents.`
    },
    {
      q: `Is physical presence or travel required at government offices?`,
      a: "No, the entire process is 100% online and digital. You can securely upload digital copies of your documents from anywhere in India."
    },
    {
      q: `How does INCroute guarantee zero rejection rates?`,
      a: "Every application undergoes a mandatory 2-tier pre-scrutiny check by senior Chartered Accountants and Company Secretaries before portal submission, eliminating errors."
    }
  ];

  const handleConsultationClick = () => {
    if (setActiveTab) {
      setActiveTab("contact");
    } else {
      navigate("/contact/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] pb-16 space-y-12 font-sans">
      
      {/* ─── Hero Header Banner (Theme Cohesive) ─── */}
      <section className="bg-gradient-to-b from-[var(--bg-surface)] via-[var(--bg-surface-alt)] to-[var(--bg-page)] text-[var(--text-primary)] pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[var(--gradient-end)]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 text-left relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] flex-wrap">
            <button 
              onClick={() => {
                if (setActiveTab) setActiveTab("services");
                else navigate("/services/");
              }} 
              className="hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              Services & Solutions
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className="capitalize text-[var(--text-secondary)] font-medium">{service.category.replace("-", " ")}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className="text-[var(--accent)] font-semibold">{service.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Header Description */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> {service.badge || "Verified Service"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CA & CS Supervised
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight font-display">
                {service.name}
              </h1>
              
              <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl font-display">
                {service.tagline || service.description}
              </p>

              {/* "How INCroute Helps You" Core Value Proposition Card */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-3.5 shadow-md">
                <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest font-mono flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[var(--accent)]" /> How INCroute Helps & Simplifies This Process:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)] font-medium">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Pre-Scrutiny Check:</strong> 0% portal query rejection rate.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>End-to-End E-Filing:</strong> 100% online with zero office visits.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Dedicated CS Manager:</strong> Single point of contact for execution.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Compliance Roadmap:</strong> Free bank account & MSME onboarding.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right SLA & Advisor Consultation Box */}
            <div className="lg:col-span-4 bg-[var(--bg-surface-alt)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-xl space-y-5 text-left relative">
              <div>
                <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider block font-mono">Secretarial Advisory Service</span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mt-1">Free Initial Consultation</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Speak directly with a senior corporate compliance specialist to review your setup.</p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]"><Clock className="w-4 h-4 text-[var(--accent)]" /> Estimated SLA TAT</span>
                  <strong className="font-mono text-[var(--text-primary)] text-xs bg-[var(--accent-soft)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">{service.timeline}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]"><FileCheck className="w-4 h-4 text-emerald-400" /> Processing Mode</span>
                  <strong className="text-emerald-400 font-semibold">100% Online Digital</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]"><Award className="w-4 h-4 text-[var(--accent)]" /> Advisory Lead</span>
                  <strong className="text-[var(--text-primary)] font-semibold">INCroute Legal Desk</strong>
                </div>
              </div>

              <button
                onClick={handleConsultationClick}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] font-bold text-sm rounded-xl shadow-lg shadow-[var(--accent)]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                Consult Corporate Advisor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Body ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left">

        {/* ─── Section 1: Detailed About & Statutory Context ─── */}
        <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">What is {service.name}?</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Statutory Framework & Enterprise Regulatory Importance</p>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
            {service.detailedAbout}
          </p>
        </section>

        {/* ─── Section 2: Key Advantages ─── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">Key Statutory Advantages</h2>
            <p className="text-xs text-[var(--text-secondary)]">Why businesses mandate this compliance setup.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.keyAdvantages.map((adv, idx) => (
              <div key={idx} className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 rounded-2xl transition-all space-y-2 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed font-sans">{adv}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 3: Mandatory Document Checklist ─── */}
        <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">Interactive Mandatory Document Checklist</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Click items as you gather your digital copies for e-filing upload.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.documents.map((doc, idx) => {
              const isChecked = !!checkedDocs[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs font-semibold ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] hover:border-[var(--accent)]/30 text-[var(--text-primary)]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckSquare className={`w-4 h-4 shrink-0 ${isChecked ? "text-emerald-400" : "text-[var(--text-secondary)]"}`} />
                    <span className={isChecked ? "line-through opacity-80" : ""}>{doc}</span>
                  </span>
                  {isChecked && <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">READY</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Section 4: Step-by-Step Statutory Process ─── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">INCroute 4-Step Execution Process</h3>
            <p className="text-xs text-[var(--text-secondary)]">How your filing is executed smoothly from start to finish.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] space-y-3.5 relative shadow-sm">
                <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-subtle)] text-[var(--accent)] font-mono font-bold text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-display">{step.title}</h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 5: Service Scope Options ─── */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-display">Execution Scope Options</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Select the advisory scope suited for your business scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packageScopes.map((pkg, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPkg(idx)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                  selectedPkg === idx || pkg.popular
                    ? "bg-[var(--bg-surface)] border-[var(--accent)] shadow-xl ring-2 ring-[var(--accent)]/20"
                    : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent)]/30 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-display">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-subtle)] font-mono">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border-subtle)]">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-sans">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleConsultationClick}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-display ${
                    selectedPkg === idx || pkg.popular
                      ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] shadow-md hover:opacity-95"
                      : "bg-[var(--bg-surface-alt)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  Request Proposal for This Scope
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 6: FAQs ─── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">Frequently Asked Questions</h3>
            <p className="text-xs text-[var(--text-secondary)]">Secretarial & statutory clarifications for {service.name}.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center justify-between gap-4 cursor-pointer font-display"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[var(--accent)] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 7: Bottom Call-To-Action ─── */}
        <section className="bg-gradient-to-r from-[var(--bg-surface-alt)] via-[var(--bg-surface)] to-[var(--bg-surface-alt)] text-[var(--text-primary)] p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">Ready to Proceed with {service.name}?</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              Speak directly with an INCroute senior corporate advisor to verify your documents and receive a custom statutory execution plan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 flex-wrap relative z-10">
            <button
              onClick={handleConsultationClick}
              className="px-6 py-3.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-[var(--on-gradient-text)] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[var(--accent)]/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer font-display"
            >
              Consult Corporate Specialist <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
