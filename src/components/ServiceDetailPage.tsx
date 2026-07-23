import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Check, ArrowRight, ShieldCheck, Clock, FileText, Building2, 
  HelpCircle, Star, PhoneCall, Sparkles, ChevronDown, ChevronRight,
  Award, Lock, Calculator, UserCheck, MapPin, CheckSquare, AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface ServiceMetadata {
  id: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  startingPrice: string;
  statutoryFee: string;
  tat: string;
  documentsNeeded: string[];
  workflowSteps: { title: string; desc: string }[];
  packages: {
    name: string;
    price: string;
    popular?: boolean;
    features: string[];
  }[];
  faqs: { q: string; a: string }[];
}

const STATE_STAMP_DUTY_RATES: Record<string, { fee: number; note: string }> = {
  "Delhi": { fee: 1000, note: "Includes ₹1,000 MOA/AOA stamp duty" },
  "Maharashtra": { fee: 2000, note: "Includes ₹1,000 MOA + ₹1,000 AOA stamp duty" },
  "Karnataka": { fee: 2000, note: "Includes ₹1,000 MOA + ₹1,000 AOA stamp duty" },
  "Tamil Nadu": { fee: 1500, note: "Includes ₹750 MOA + ₹750 AOA stamp duty" },
  "Telangana": { fee: 1500, note: "Includes ₹750 MOA + ₹750 AOA stamp duty" },
  "Gujarat": { fee: 1000, note: "Includes ₹500 MOA + ₹500 AOA stamp duty" },
  "Uttar Pradesh": { fee: 1500, note: "Includes ₹750 MOA + ₹750 AOA stamp duty" },
  "West Bengal": { fee: 1500, note: "Includes ₹750 MOA + ₹750 AOA stamp duty" },
  "Haryana": { fee: 1000, note: "Includes ₹500 MOA + ₹500 AOA stamp duty" }
};

const SERVICE_REGISTRY: Record<string, ServiceMetadata> = {
  "pvt-ltd": {
    id: "pvt-ltd",
    category: "private-corporate",
    title: "Private Limited Company Registration",
    tagline: "India's Most Trusted Business Structure for Startups & Raised Capital",
    description: "Incorporate your Private Limited Company with 2 Directors, Digital Signature Certificates (DSC), SPICe+ Part A & B MCA approval, PAN, TAN, and free bank account opening in 7-10 working days.",
    startingPrice: "₹1,499",
    statutoryFee: "+ Govt stamp duty & RUN fee",
    tat: "7 - 10 Days",
    documentsNeeded: [
      "PAN Card of all Directors & Shareholders",
      "Aadhaar Card or Voter ID / Passport",
      "Bank Statement / Electricity Bill (latest 2 months)",
      "Passport Size Photographs",
      "Registered Office Address Proof (Utility Bill + NOC)"
    ],
    workflowSteps: [
      { title: "DSC & Name Feasibility Approval", desc: "Obtain Digital Signatures and reserve company name via RUN / SPICe+ Part A." },
      { title: "MOA & AOA Secretarial Drafting", desc: "Draft Memorandum of Association & Articles of Association tailored for your business." },
      { title: "SPICe+ MCA E-Filing", desc: "Submit statutory INC-32, INC-33, INC-34, and AGILE-PRO-S forms to ROC." },
      { title: "Certificate of Incorporation & Bank Account", desc: "Receive COI with CIN, PAN, TAN, and instant bank account integration." }
    ],
    packages: [
      {
        name: "Basic Incorporation",
        price: "₹1,499",
        features: ["2 DSC for Directors", "1 Name Approval (RUN)", "MOA & AOA Drafting", "COI + PAN + TAN Allotment", "Standard Support"]
      },
      {
        name: "Startup Founders Edition",
        price: "₹4,999",
        popular: true,
        features: ["Everything in Basic", "2 DSC + DIN for Directors", "Share Certificates & Stat Register", "INC-20A Commencement Filing", "GST Registration Included", "Dedicated Secretarial Manager"]
      },
      {
        name: "Complete Enterprise Suite",
        price: "₹9,999",
        features: ["Everything in Founders Edition", "Trademark Application (1 Class)", "1-Year INCroute Books Accounting", "Virtual Office 1-Year Pass", "Founder Legal NDA & Terms Draft"]
      }
    ],
    faqs: [
      { q: "How many minimum directors are required for Private Limited?", a: "A minimum of 2 directors and 2 shareholders are required. The director and shareholder can be the exact same individuals." },
      { q: "Is physical presence required at ROC office?", a: "No, the entire process is 100% digital and online. You do not need to physically visit any government center." },
      { q: "Is minimum capital mandatory?", a: "No, there is no minimum paid-up capital requirement to incorporate a Private Limited Company in India." }
    ]
  },
  "llp": {
    id: "llp",
    category: "alternative-entity",
    title: "Limited Liability Partnership (LLP) Registration",
    tagline: "Combine Limited Liability Protection with Operational Partnership Flexibility",
    description: "Register your LLP with Ministry of Corporate Affairs (MCA). Includes RUN-LLP name reservation, FiLLiP statutory incorporation form, LLP Agreement drafting, and Form 3 filing.",
    startingPrice: "₹1,999",
    statutoryFee: "+ Govt Stamp Duty",
    tat: "8 - 12 Days",
    documentsNeeded: [
      "PAN Card & Aadhaar of Designated Partners",
      "Bank Statement of Partners",
      "Registered Address Electricity Bill + Landlord NOC",
      "Partnership Agreement terms & profit sharing ratio"
    ],
    workflowSteps: [
      { title: "Partner DSC & Name Reservation", desc: "Obtain Digital Signatures and reserve LLP name via RUN-LLP." },
      { title: "FiLLiP Incorporation Filing", desc: "File statutory FiLLiP form with Registrar of Companies." },
      { title: "LLP Agreement Drafting", desc: "Draft statutory LLP agreement defining rights, duties, and profit ratios." },
      { title: "Form 3 MCA Submission", desc: "Execute stamp duty payment and file Form 3 within 30 days of COI." }
    ],
    packages: [
      {
        name: "Standard LLP",
        price: "₹1,999",
        features: ["2 Partner DSCs", "LLP Name Reservation", "COI + PAN + TAN Allotment", "Draft LLP Agreement"]
      },
      {
        name: "Growth LLP Suite",
        price: "₹4,499",
        popular: true,
        features: ["Everything in Standard", "Form 3 Stamp Duty & Filing", "MSME Udyam Certificate", "GST Registration", "Dedicated Tax Advisor"]
      }
    ],
    faqs: [
      { q: "What is the difference between LLP and Partnership?", a: "An LLP provides limited liability protection to partners (personal assets protected), whereas partners in a traditional partnership firm have unlimited personal liability." }
    ]
  },
  "opc": {
    id: "opc",
    category: "private-corporate",
    title: "One Person Company (OPC) Registration",
    tagline: "Full Corporate Status for Solo Founders with 100% Equity Ownership",
    description: "Incorporate a One Person Company with 1 Director, 1 Nominee, Digital Signature Certificate, SPICe+ Part A & B MCA approval, PAN, TAN, and official COI in 7-10 working days.",
    startingPrice: "₹1,499",
    statutoryFee: "+ Govt Stamp Duty",
    tat: "7 - 10 Days",
    documentsNeeded: [
      "PAN Card & Aadhaar of Solo Director & Nominee",
      "Bank Statement of Director",
      "Nominee Consent Form (INC-3)",
      "Registered Address Electricity Bill + Landlord NOC"
    ],
    workflowSteps: [
      { title: "DSC & Nominee Consent", desc: "Obtain Digital Signature and INC-3 nominee consent." },
      { title: "SPICe+ MCA E-Filing", desc: "File statutory INC-32, INC-33, INC-34 with MCA." },
      { title: "COI Allotment", desc: "Receive official Certificate of Incorporation with CIN, PAN, and TAN." }
    ],
    packages: [
      {
        name: "OPC Basic",
        price: "₹1,499",
        features: ["1 DSC for Director", "1 Name Approval", "INC-3 Nominee Form", "COI + PAN + TAN Allotment"]
      },
      {
        name: "OPC Founders Suite",
        price: "₹4,499",
        popular: true,
        features: ["Everything in Basic", "INC-20A Commencement Filing", "GST Registration", "MSME Certificate", "INCroute Books Software"]
      }
    ],
    faqs: [
      { q: "Can a foreigner start an OPC in India?", a: "Yes, an NRI or foreign national who stays in India for at least 120 days in the preceding financial year can form an OPC." }
    ]
  },
  "section8": {
    id: "section8",
    category: "nonprofit",
    title: "Section 8 NGO Company Registration",
    tagline: "India's Recognized Non-Profit Corporate Structure for Social Enterprises",
    description: "Incorporate a Section 8 Non-Profit Company with MCA License (Form INC-12), MOA/AOA approval, 12A & 80G tax exemption guidance, and FCRA eligibility.",
    startingPrice: "₹3,999",
    statutoryFee: "+ Govt License Fee",
    tat: "12 - 15 Days",
    documentsNeeded: [
      "PAN & Aadhaar of Minimum 2 Directors",
      "3-Year Estimate of Income & Expenditure",
      "Statement of Objects & Social Welfare Program",
      "Registered Office Utility Bill + Landlord NOC"
    ],
    workflowSteps: [
      { title: "Name Reservation (RUN)", desc: "Reserve name ending with Foundation, Forum, Council, or Association." },
      { title: "INC-12 License Application", desc: "Apply for Section 8 License from Central Government / ROC." },
      { title: "SPICe+ MCA Incorporation", desc: "Execute MOA/AOA drafting and receive COI." }
    ],
    packages: [
      {
        name: "Section 8 License & Incorporation",
        price: "₹3,999",
        popular: true,
        features: ["2 Director DSCs", "INC-12 Section 8 License", "MOA & AOA Drafting", "COI + PAN + TAN", "80G/12A Guidance"]
      }
    ],
    faqs: [
      { q: "Can Section 8 company pay dividends to directors?", a: "No, Section 8 companies are strictly non-profit; all income must be reinvested into social objects." }
    ]
  },
  "virtual-office": {
    id: "virtual-office",
    category: "private-corporate",
    title: "Virtual Office Address for MCA & GST Registration",
    tagline: "Get Premium Commercial Business Address for Company & GST Registration",
    description: "Rent a 100% MCA and GST-compliant virtual office address in prime commercial hubs across Bangalore, Mumbai, Delhi-NCR, Hyderabad, and Chennai with mail forwarding & NOC.",
    startingPrice: "₹899/mo",
    statutoryFee: "Billed annually",
    tat: "24 Hours Delivery",
    documentsNeeded: [
      "Company / Proprietor PAN Card",
      "Authorized Signatory ID Proof",
      "Director Passport Photograph"
    ],
    workflowSteps: [
      { title: "City & Hub Selection", desc: "Choose prime commercial location across top metro cities in India." },
      { title: "Verification & Documentation", desc: "Review NOC, Rent Agreement, and Utility Bill for GST/MCA compliance." },
      { title: "Instant Document Issuance", desc: "Receive digital notarized Rent Agreement & Owner NOC in 24 hours." }
    ],
    packages: [
      {
        name: "Mailing Address",
        price: "₹899/mo",
        features: ["Prime Commercial Address", "Mail & Courier Receipt", "Digital Notification", "Desk Access Available"]
      },
      {
        name: "GST & MCA Registration Pass",
        price: "₹1,499/mo",
        popular: true,
        features: ["100% GST & MCA Compliant", "Notarized Rent Agreement", "Electricity Bill & NOC", "GST Inspector On-Site Support Guarantee"]
      }
    ],
    faqs: [
      { q: "Is virtual office address accepted for GST registration?", a: "Yes, our virtual office addresses come with 100% valid Rent Agreements, Electricity Bills, and Landlord NOCs verified for GST inspection." }
    ]
  },
  "gst-tax": {
    id: "gst-tax",
    category: "compliance",
    title: "GST Registration Services",
    tagline: "Get Official GSTIN Allotted Under GST Council Mandate",
    description: "New GST Registration for Proprietorships, Companies, Firms, and E-Commerce sellers. Complete GST Portal profile setup, REG-01 filing, ARN tracking, and GSTIN certificate issuance.",
    startingPrice: "₹999",
    statutoryFee: "+ Zero Govt Fee",
    tat: "3 - 5 Days",
    documentsNeeded: [
      "PAN & Aadhaar of Business Owner / Authorized Signatory",
      "Cancelled Cheque / Bank Passbook Copy",
      "Proof of Business Premises (Electricity Bill / Rent Agreement + NOC)",
      "Board Resolution / Authorization Letter"
    ],
    workflowSteps: [
      { title: "Document Verification", desc: "Our GST experts review premises proof and address NOC for zero query rejection." },
      { title: "REG-01 Application Filing", desc: "Upload statutory documents to GST Common Portal and generate ARN." },
      { title: "Aadhaar Authentication", desc: "Instant e-KYC biometric OTP verification of authorized signatory." },
      { title: "GSTIN Certificate Download", desc: "Obtain official Form REG-06 GSTIN allotment certificate." }
    ],
    packages: [
      {
        name: "Basic GST Allotment",
        price: "₹999",
        features: ["REG-01 Filing", "ARN Generation & Tracking", "Aadhaar e-KYC Support", "GSTIN Certificate Issuance"]
      },
      {
        name: "GST + Invoicing Suite",
        price: "₹2,499",
        popular: true,
        features: ["Everything in Basic", "1-Year INCroute Books GST Invoicing", "GSTR-1 & GSTR-3B First Month Filing", "E-Way Bill Portal Setup"]
      }
    ],
    faqs: [
      { q: "Is GST mandatory for online e-commerce sellers?", a: "Yes, GST registration is mandatory for all e-commerce sellers selling goods online regardless of annual turnover." }
    ]
  },
  "trademark-registration": {
    id: "trademark-registration",
    category: "legal-ip",
    title: "Trademark Registration (TM Class 1-45)",
    tagline: "Secure Exclusive Rights to Your Brand Name, Slogan & Logo Across India",
    description: "Protect your brand identity from competitors and counterfeiters. Complete TM Class Search, TM-A application drafting, attorney verification, and official IP India e-filing with ™ symbol usage right from day 1.",
    startingPrice: "₹1,499",
    statutoryFee: "+ Govt Fee (₹4,500 for Startups/Individual, ₹9,000 for Corporate)",
    tat: "1 Working Day Filing",
    documentsNeeded: [
      "Brand Name / Logo Graphic Asset",
      "Applicant PAN & ID Proof",
      "MSME / Startup India Certificate (for 50% govt fee waiver)",
      "User Affidavit (if brand is already in use)"
    ],
    workflowSteps: [
      { title: "Deep TM Class Search", desc: "Verify trademark availability across statutory TM databases to avoid objections." },
      { title: "TM-A Application Drafting", desc: "Draft statutory application specifying international NICE classification." },
      { title: "Official IP India E-Filing", desc: "File TM-A application with Controller General of Patents, Designs & Trademarks." },
      { title: "TM Receipt & ™ Symbol Allotment", desc: "Receive government application number and legally use ™ symbol immediately." }
    ],
    packages: [
      {
        name: "TM Filing Basic",
        price: "₹1,499",
        features: ["Deep Brand Clearance Search", "TM Class 1-45 Advisory", "TM-A Application Filing", "Official Government Receipt"]
      },
      {
        name: "TM Protection Shield",
        price: "₹3,499",
        popular: true,
        features: ["Everything in Basic", "Objection Risk Analysis Report", "Legal Power of Attorney (TM-48)", "1-Year Trademark Watch Service", "Dedicated IP Attorney"]
      }
    ],
    faqs: [
      { q: "When can I start using the ™ symbol?", a: "You can legally use the ™ symbol immediately after receiving your government TM application acknowledgement receipt (within 24 hours)." }
    ]
  }
};

export default function ServiceDetailPage() {
  const { category, serviceId } = useParams();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPkg, setSelectedPkg] = useState<number>(1);
  const [selectedState, setSelectedState] = useState<string>("Delhi");
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const service = SERVICE_REGISTRY[serviceId || ""] || {
    id: serviceId || "service-detail",
    category: category || "general",
    title: (serviceId || "Corporate Service").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    tagline: "Professional Corporate Statutory Service by INCroute Advisors",
    description: "Complete statutory compliance, document drafting, secretarial verification, and official government filing handled by certified CAs and CSs.",
    startingPrice: "₹1,499",
    statutoryFee: "+ Govt fees",
    tat: "5 - 7 Days",
    documentsNeeded: ["PAN & Aadhaar Card of Directors / Proprietor", "Address Proof of Business Premises", "Bank Account Proof / Cancelled Cheque", "Passport Size Photograph"],
    workflowSteps: [
      { title: "Expert Consultation & Document Check", desc: "Verify eligibility and review statutory address & identity proofs." },
      { title: "Government Portal Filing", desc: "Draft statutory forms and execute official e-filing with MCA / GST / TM registry." },
      { title: "Certificate Issuance", desc: "Receive official government registration certificate & statutory approval." }
    ],
    packages: [
      { name: "Standard Package", price: "₹1,499", features: ["Statutory Application Drafting", "Government Filing", "Standard Support"] },
      { name: "Premium Enterprise", price: "₹3,999", popular: true, features: ["Everything in Standard", "Express 24-Hour Processing", "Dedicated Account Manager", "Free Accounting Software License"] }
    ],
    faqs: [
      { q: "How long does government approval take?", a: "Government processing turnaround times typically range from 3 to 10 working days depending on state jurisdiction and authority department workloads." }
    ]
  };

  const currentDuty = STATE_STAMP_DUTY_RATES[selectedState] || STATE_STAMP_DUTY_RATES["Delhi"];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] pb-16 space-y-12">
      {/* Header Breadcrumbs */}
      <section className="bg-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 flex-wrap">
            <button onClick={() => navigate("/services/")} className="hover:underline cursor-pointer">Services</button>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="capitalize">{service.category.replace("-", " ")}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-white font-semibold">{service.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Fast-Track Processing
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {service.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-medium">
                {service.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                {service.description}
              </p>
            </div>

            <div className="lg:col-span-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-5">
              <div>
                <small className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Starting Professional Fee</small>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{service.startingPrice}</span>
                  <span className="text-xs text-indigo-400 font-mono">{service.statutoryFee}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> Estimated TAT</span>
                  <strong className="font-mono text-white">{service.tat}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Government Filing</span>
                  <strong className="text-emerald-400 font-semibold">100% Online</strong>
                </div>
              </div>

              <button
                onClick={() => navigate("/contact")}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left">

        {/* State Stamp Duty & Govt Fee Calculator Widget */}
        {(service.id === "pvt-ltd" || service.id === "llp" || service.id === "opc" || service.id === "section8") && (
          <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl border border-indigo-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interactive Stamp Duty & Govt Fee Estimator</h3>
                  <p className="text-xs text-slate-300">Select your state of incorporation to view exact MCA government stamp duty rates.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.keys(STATE_STAMP_DUTY_RATES).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block font-mono">Professional Fee</span>
                <strong className="text-xl font-bold text-indigo-400">{service.startingPrice}</strong>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block font-mono">Govt Stamp Duty ({selectedState})</span>
                <strong className="text-xl font-bold text-emerald-400">₹{currentDuty.fee.toLocaleString("en-IN")}</strong>
              </div>
              <div className="p-4 bg-indigo-600/30 rounded-xl border border-indigo-500/50">
                <span className="text-slate-300 block font-mono">Estimated Total</span>
                <strong className="text-xl font-bold text-white">₹{(parseInt(service.startingPrice.replace(/[^0-9]/g, "")) + currentDuty.fee).toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentDuty.note}. Zero hidden portal surge charges.</span>
            </p>
          </section>
        )}

        {/* Package Matrix */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Select Statutory Package</h2>
            <p className="text-xs sm:text-sm text-slate-500">Transparent pricing with zero hidden charges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.packages.map((pkg, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPkg(idx)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                  selectedPkg === idx || pkg.popular
                    ? "bg-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/20"
                    : "bg-white/80 border-slate-200 hover:border-indigo-200 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-600">{pkg.price}</div>
                  <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate("/contact")}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedPkg === idx || pkg.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  Select Package
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Mandatory Document Checklist */}
        <section className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Interactive Document Checklist</h3>
              <p className="text-xs text-slate-500">Scan & upload digital copies once. Click to check off items as you gather them.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.documentsNeeded.map((doc, idx) => {
              const isChecked = !!checkedDocs[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs font-semibold ${
                    isChecked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-white border-slate-200/80 hover:border-indigo-300 text-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckSquare className={`w-4 h-4 shrink-0 ${isChecked ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className={isChecked ? "line-through opacity-80" : ""}>{doc}</span>
                  </span>
                  {isChecked && <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">READY</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Workflow */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Statutory Process & Execution Timeline</h3>
            <p className="text-xs text-slate-500">How your service is processed by INCroute compliance experts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {service.workflowSteps.map((step, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-900 pt-1">{step.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Statutory & secretarial clarifications.</p>
          </div>

          <div className="space-y-3">
            {service.faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
