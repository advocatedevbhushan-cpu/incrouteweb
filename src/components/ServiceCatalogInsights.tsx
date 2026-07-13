import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppNavigate } from "../lib/useAppNavigate";
import {
  Building2, Shield, Star, Clock, Users, FileText, CheckCircle2,
  ArrowRight, ChevronDown, ChevronUp, Sparkles, Award, TrendingUp,
  Scale, Landmark, Database, Heart, AlertTriangle, Info, X, HelpCircle,
  Search, Lock
} from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  timeline: string;
  minCapital: string;
  liability: string;
  taxBenefit: string;
  badge: string;
  badgeColor: string;
  rating: number;
  icon: React.ComponentType<any>;
  image: string;
  description: string;
  about: string;
  advantages: string[];
  documents: string[];
  compliance: string[];
  clientAdvantage: string;
}

interface ServiceCatalogInsightsProps {
  setActiveTab?: (tab: string) => void;
}

const catalog: ServiceType[] = [
  {
    id: "pvt-ltd",
    name: "Private Limited Company",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    timeline: "7–10 Working Days",
    minCapital: "None (₹1L recommended)",
    liability: "Limited",
    taxBenefit: "Startup India",
    badge: "Most Popular",
    badgeColor: "bg-brand-gold text-black",
    rating: 5,
    icon: Building2,
    image: "/pvt_ltd_corp.webp",
    description: "The gold standard for startups and growing businesses. Offers limited liability, separate legal entity, and venture capital eligibility.",
    about: "A Private Limited Company (Pvt Ltd) is the most preferred business structure for startups and SMEs in India. Governed by the Companies Act 2013, it provides perpetual succession, credibility with investors, and the ability to raise external capital.",
    advantages: [
      "Separate legal entity status protecting personal assets from business debt",
      "Venture capital & equity funding eligibility via shares issuance",
      "Perpetual succession independent of owner changes or transfers",
      "Startup India & DPIIT recognition eligibility for 3-year tax holiday",
      "High credibility with banks, financial institutions, and global clients",
    ],
    documents: ["PAN Card & Aadhaar of all Directors", "Utility Bill for registered office", "NOC from property owner", "Form DIR-2 (Consent of Directors)", "Digital Signature Certificate (DSC)"],
    compliance: ["First Board Meeting within 30 days of incorporation", "Form 20A (Commencement of Business) within 180 days", "Annual ROC filings (AOC-4 & MGT-7)", "Director KYC updates annually"],
    clientAdvantage: "Best for founders who want to raise institutional funding, hire talent via ESOPs, or build a scalable brand with full legal protection.",
  },
  {
    id: "llp",
    name: "Limited Liability Partnership",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    timeline: "10–15 Working Days",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "Lower Tax Rate",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Users,
    image: "/llp_partners.webp",
    description: "Flexibility of a partnership with corporate liability protection. No minimum capital required.",
    about: "An LLP combines the operational flexibility of a partnership with the limited liability of a company. Governed under the LLP Act 2008, it is ideal for professional services, consultancies, and family businesses.",
    advantages: [
      "No minimum capital requirement or mandatory share subscription",
      "Partners protected from each other's misconduct or negligence",
      "No Dividend Distribution Tax (DDT) on profits distributed to partners",
      "Lower statutory audit threshold (optional up to ₹40L turnover)",
      "Flexible profit-sharing and internal management structure",
    ],
    documents: ["ID & Address proof of all partners", "NOC from registered office owner", "Stamped LLP Agreement", "DPIN of designated partners"],
    compliance: ["LLP Agreement filing (Form 3) within 30 days of setup", "Annual Return (Form 11)", "Statement of Accounts (Form 8)", "Income Tax Return annually"],
    clientAdvantage: "Best for professional firms, consultancies, and service businesses that want liability protection without heavy corporate compliance.",
  },
  {
    id: "opc",
    name: "One Person Company",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    timeline: "7–12 Working Days",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    taxBenefit: "Solo Corporate Tax",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Scale,
    image: "/opc_director.webp",
    description: "Solo founder? Get full corporate protection without a co-founder.",
    about: "OPC allows a single entrepreneur to operate a corporate entity with limited liability. It eliminates personal asset risk while granting corporate tax rates, bank financing, and a nominee director safety net.",
    advantages: [
      "100% ownership and control by one person (no co-founders needed)",
      "Complete separate legal entity protection for personal assets",
      "Lower corporate tax rates instead of individual slab rates",
      "Easier bank credit, corporate bank account, and loan eligibility",
      "Nominee director structure ensures seamless business continuity",
    ],
    documents: ["PAN & KYC of sole shareholder", "PAN & KYC of Nominee Director", "Registered office electricity bill", "Form INC-3 (Nominee Consent)"],
    compliance: ["First Board Meeting within 30 days", "Form 20A within 180 days", "Annual ROC filings", "Mandatory conversion to Pvt Ltd if turnover exceeds ₹2 Cr"],
    clientAdvantage: "Best for solo entrepreneurs, freelancers, and consultants who want corporate credibility and liability protection without a partner.",
  },
  {
    id: "partnership",
    name: "Partnership Firm",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    timeline: "3–5 Working Days",
    minCapital: "None",
    liability: "Unlimited",
    taxBenefit: "Deed Pass-through",
    badge: "",
    badgeColor: "",
    rating: 4.5,
    icon: Users,
    image: "/partnership_firm.webp",
    description: "Simple, fast, and cost-effective for small businesses and local ventures.",
    about: "A Partnership Firm is structured by a signed deed under the Partnership Act 1932. Partners share mutual agency, liabilities, and profits with minimal reporting and zero ROC compliance requirements.",
    advantages: [
      "Zero corporate registry fees or ROC filing overheads",
      "Fastest setup timeline — 3 to 5 days registration",
      "Minimal annual compliance burden and direct tax filings",
      "Direct profit pass-through to partners",
      "Flexible internal management structure defined by partners",
    ],
    documents: ["Signed stamp-paper Partnership Deed", "PAN Card of all partners", "Utility Bill for office address", "NOC from property owner"],
    compliance: ["Income Tax Return annually", "GST filing if turnover exceeds threshold", "No mandatory ROC filings"],
    clientAdvantage: "Best for small local businesses, traders, and family ventures that need a quick, low-cost legal structure without heavy compliance.",
  },
  {
    id: "section8",
    name: "Section 8 Company (NGO)",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    timeline: "15–20 Working Days",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "80G Exemption",
    badge: "NGO Special",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    rating: 5,
    icon: Heart,
    image: "/section8_ngo.webp",
    description: "Charitable non-profit status with full tax exemptions and donation eligibility.",
    about: "A Section 8 Company promotes charitable objectives — education, art, science, sports, or social welfare. It obtains a special central government license granting 12A & 80G tax exemptions and access to domestic and international donations.",
    advantages: [
      "12A & 80G tax exemption certificates on donor contributions",
      "Eligible for CSR funding from corporates and public organizations",
      "Receive foreign donations legally under FCRA registration",
      "High public trust and social credibility for charitable works",
      "No minimum capital requirement or dividend payout obligations",
    ],
    documents: ["PAN & Aadhaar of all Directors", "NOC from registered office landlord", "Charitable objectives declaration", "Rental deed copy"],
    compliance: ["Annual ROC filings (AOC-4, MGT-7)", "12A & 80G renewal filings", "FCRA compliance if receiving foreign funds", "Income Tax Return annually"],
    clientAdvantage: "Best for social entrepreneurs, educators, and welfare organizations who want institutional credibility and tax-exempt donation inflows.",
  },
  {
    id: "annual-compliance",
    name: "Annual Compliances Suite",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "Ongoing Support",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Penalty Shield",
    badge: "Compliance Special",
    badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    rating: 5,
    icon: FileText,
    image: "/annual_compliances.webp",
    description: "ROC filing, Director KYC, board minutes, and zero-penalty guarantee.",
    about: "Annual Compliances Suite keeps your company in pristine standing with ROC/MCA registries. It coordinates AOC-4, MGT-7, Director KYC updates, statutory balance sheet reconciliations, and board resolution books under dedicated Chartered Accountants.",
    advantages: [
      "Zero late penalty guarantee on all ROC/MCA filings",
      "Dedicated CA Lead assigned to handle financial reconciliation",
      "Statutory Board meeting minutes drafted and recorded",
      "Director KYC (DIR-3 KYC) filed annually to prevent registry lock",
      "Pristine company credit rating and registry standing maintained",
    ],
    documents: ["Last financial year balance sheets", "Current shareholding list", "Past board resolution books", "GST returns log"],
    compliance: ["Form AOC-4 (Financial Statements)", "Form MGT-7 (Annual Return)", "DIR-3 KYC for all Directors", "Board Meeting Minutes"],
    clientAdvantage: "Best for active companies that want to avoid ROC strike-off, director disqualification, and daily compounding penalties.",
  },
  {
    id: "gst-tax",
    name: "GST & Tax Registration",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Input Tax Credits",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Database,
    image: "/gst_tax_registration.webp",
    description: "GSTIN activation, MSME registration, and PAN/TAN drafting.",
    about: "GST and Statutory Tax Registrations allocate legal tax credentials for business operations. Secures GSTIN profiles, activates MSME certifications, drafts PAN/TAN profiles, and enables smooth inter-state commerce.",
    advantages: [
      "GSTIN profile activated within 3–5 working days",
      "Input Tax Credit (ITC) eligibility unlocked on raw business purchases",
      "MSME Udyam Registration to unlock priority corporate benefits",
      "PAN/TAN statutory drafts included for immediate bank access",
      "Inter-state commercial legal clearance to sell anywhere in India",
    ],
    documents: ["PAN Card & Aadhaar of applicant", "Bank statement / cancelled cheque", "Electricity bill of premises", "NOC from landlord"],
    compliance: ["Monthly GSTR-1 & GSTR-3B filings", "Quarterly TDS returns (Form 26Q)", "Annual GST reconciliation (GSTR-9)", "Income Tax Return"],
    clientAdvantage: "Best for any business that sells goods or services and needs to legally collect GST, claim input credits, and trade across state lines.",
  },
  {
    id: "virtual-cfo",
    name: "Virtual CFO Retainer",
    category: "Advisory",
    categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    timeline: "Monthly Retainer",
    minCapital: "—",
    liability: "Fiduciary",
    taxBenefit: "Treasury Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: TrendingUp,
    image: "/virtual_cfo_analytics.webp",
    description: "Cash flow modeling, treasury operations, and board performance reports.",
    about: "Virtual CFO Retainer provides institutional-grade corporate finance strategy without executive hiring costs. Structured under senior Chartered Accountants, it models cash flows, designs capital structures, runs audit controls, and prepares investor-ready financials.",
    advantages: [
      "Institutional cash flow architecture and burn-rate modeling",
      "Investor pitch deck financial forecasting and equity modeling",
      "Corporate treasury, banking, and strategic fund management",
      "Fiduciary tax defense, compliance audits, and representation support",
      "Monthly board performance metrics and statutory reports",
    ],
    documents: ["Latest corporate ledger files", "GST filings details", "Bank account dashboard access"],
    compliance: ["Monthly MIS reports", "Quarterly financial reviews", "Annual audit coordination", "Investor reporting"],
    clientAdvantage: "Best for funded startups and growing SMEs that need CFO-level financial oversight without the cost of a full-time executive hire.",
  },
  {
    id: "virtual-office",
    name: "Virtual Office Address",
    category: "Advisory",
    categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Lease Isolated",
    taxBenefit: "GST/ROC Compliant",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Landmark,
    image: "/virtual_office_workspace.webp",
    description: "GST & ROC compliant premium addresses with mail handling and on-demand meeting rooms.",
    about: "Virtual Office Address secures a legal corporate headquarters in premium commercial hubs — Bangalore, Mumbai, Delhi, Hyderabad — without office lease overheads. Includes certified NOCs, utility bills for GST/ROC registrations, and physical mail forwarding.",
    advantages: [
      "GST & ROC compliant registered business address",
      "Certified landlord NOC (No Objection Certificate) included",
      "Prime commercial city address for high brand credibility",
      "Physical mail scanning, forwarding, and digital updates",
      "On-demand board meeting room access for director meets",
    ],
    documents: ["PAN Card & Aadhaar of applicant", "Proposed brand registration letter", "Director KYC files"],
    compliance: ["Address update in ROC records if changed", "GST address amendment if required"],
    clientAdvantage: "Best for remote founders, freelancers, and startups that need a credible registered address for GST, ROC, and bank account opening without renting physical space.",
  },
  {
    id: "terms-privacy",
    name: "Terms of Service & Privacy Policy",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "Risk Mitigated",
    taxBenefit: "Liability Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: FileText,
    image: "/legal_policy_drafting.webp",
    description: "GDPR/CCPA compliant terms & policies tailored for websites/apps.",
    about: "Custom drafting of comprehensive Terms of Service (ToS) and Privacy Policy agreements. Designed specifically for your platform, website, or mobile application, ensuring compliance with global privacy regulations (GDPR, CCPA, IT Act 2000) and protecting your enterprise from customer/user disputes.",
    advantages: [
      "GDPR & CCPA Compliant global data policies",
      "User liability, digital trademark, and civil claim mitigation",
      "Intellectual property ownership protections for content/SaaS",
      "Bespoke dispute resolution terms and arbitration clauses",
      "Refund, subscription, and account termination safety clauses"
    ],
    documents: [
      "Business profile / Website or app URL",
      "Details of user data collected",
      "Payment gateway integration details",
      "Existing refund policy notes"
    ],
    compliance: [
      "Annual terms of service review",
      "Privacy policy updates on data capture shifts",
      "GDPR/CCPA audit alignment"
    ],
    clientAdvantage: "Protects website owners and SaaS startups from legal claims, limits liability, and complies with international privacy laws automatically."
  },
  {
    id: "msme-registration",
    name: "MSME (Udyam) Registration",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Govt Scheme Eligible",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Award,
    image: "/msme_udyam.webp",
    description: "Get government-backed Udyam MSME certification to unlock subsidies and loans.",
    about: "Government-backed Udyam MSME certification for micro, small, and medium enterprises. Registering your enterprise unlocks priority bank lending rates, subsidies on patents and barcodes, concessions on electricity bills, and robust legal protection against delayed business payments from corporate buyers.",
    advantages: [
      "Priority sector bank loans under MSME credit schemes",
      "Robust legal protection from enterprise payment delays (45-day rule)",
      "Concessions on commercial electricity bills and registrations",
      "Subsidies on patent, logo, and barcode filings",
      "Priority status and fee waivers for government tenders"
    ],
    documents: [
      "Aadhaar card of promoter",
      "PAN card of business or owner",
      "GSTIN (if applicable)",
      "Active Bank Account details"
    ],
    compliance: [
      "Annual MSME updates if investments change",
      "Company registration link alignment",
      "Tax return synchronization"
    ],
    clientAdvantage: "Unlocks government priority banking benefits and provides legal safety nets from commercial payment defaults."
  },
  {
    id: "fssai-registration",
    name: "FSSAI Registration",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "3–7 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Quality Standard",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: CheckCircle2,
    image: "/fssai_food_safety.webp",
    description: "Legally mandatory FSSAI food license for retail, kitchen, and preparation setups.",
    about: "An FSSAI Food Safety License is legally mandatory for any food business operator (FBO) in India dealing in manufacturing, processing, packaging, storage, transportation, retail, distribution, or restaurant/kitchen food safety operations.",
    advantages: [
      "Legally mandatory food safety license compliance (FSS Act 2006)",
      "Builds high consumer trust & brand quality validation",
      "Authorization for official FSSAI logo usage on packaging/menus",
      "Quality standards validation certificate for retail/e-commerce listings",
      "Protects food businesses from heavy registry audits and closure notices"
    ],
    documents: [
      "PAN & Aadhaar card of the operator",
      "Electricity bill of commercial kitchen/office",
      "NOC from registered property landlord",
      "List of food categories and ingredients used"
    ],
    compliance: [
      "FSSAI license renewal (1 to 5 years tenure options)",
      "Maintaining clean sanitary condition standards dynamically",
      "Support for official safety auditor reviews"
    ],
    clientAdvantage: "Legally registers your food business, avoiding heavy penal fees and showcasing verified safety standards to your customers."
  },
  {
    id: "return-filing",
    name: "Return Filing Services",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "Ongoing Support",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Input Credit Claim",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: FileText,
    image: "/tax_return_filing.webp",
    description: "Expert GSTR-1/3B filings, ITR, and TDS returns led by CAs.",
    about: "Ongoing GST returns (GSTR-1, GSTR-3B) and corporate/partnership Income Tax Return (ITR) filings managed by dedicated Chartered Accountants. Ensures maximum utilization of Input Tax Credits (ITC), clean tax reconciliation, and full compliance with Central Excise and GST Departments.",
    advantages: [
      "Accurate ITR filing under active tax brackets to minimize liability",
      "GST input tax credit claims maximized to reduce cash outflow",
      "Zero penalty compliance on delayed statutory filing dates",
      "TDS filing, certificate generation, and quarterly reconciliation",
      "Tax assessment defense support and representation by experienced CAs"
    ],
    documents: [
      "Bank statements for the financial year",
      "Purchase and Sales invoices logs",
      "Previous year's tax returns",
      "GST login credentials"
    ],
    compliance: [
      "Monthly GST returns (GSTR-1 & 3B)",
      "Quarterly TDS filings",
      "Annual ITR filing",
      "GST audit representation if threshold met"
    ],
    clientAdvantage: "Offloads complex tax filings to expert CAs, maximizes input tax savings, and prevents expensive tax notices."
  },
  {
    id: "trademark-registration",
    name: "Trademark Services Suite",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "2–3 Working Days (Filing)",
    minCapital: "—",
    liability: "IP Shielded",
    taxBenefit: "Intangible Asset",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Shield,
    image: "/trademark_brand.webp",
    description: "Exclusivity for your brand name & logo with expert legal opinions.",
    about: "Comprehensive brand protection including deep Trademark Search, Opinion Letters on registrability, official Class filing, and drafting replies to Office Actions. Our registered IP attorneys ensure your brand name, logo, or slogan secures absolute exclusivity and legal protection in India.",
    advantages: [
      "Brand name & logo absolute exclusivity under IP laws",
      "Deep conflict search reports across all 45 classes before filing",
      "Attorney Opinion letters on registry conflicts or objection risks",
      "Official TM Journal filing with immediate TM logo rights usage",
      "Office action replies coordination managed by registered patent attorneys"
    ],
    documents: [
      "Proposed logo (JPEG/PNG/SVG format)",
      "Brand name description",
      "User affidavit (if already in use)",
      "Power of Attorney for TM agent authorization"
    ],
    compliance: [
      "Monitoring TM journal for oppositions",
      "Replying to examination reports in 30 days",
      "TM renewal every 10 years"
    ],
    clientAdvantage: "Legally secures your brand name and logo exclusivity, preventing competitors from copying your identity."
  },
  {
    id: "trademark-objection",
    name: "Response to TM Objection",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "IP Defense",
    taxBenefit: "Asset Salvage",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Scale,
    image: "/trademark_defense.webp",
    description: "Defend Section 9 or Section 11 objections with case-law backings.",
    about: "Professional drafting of legal replies to trademark objections raised by the Registrar of Trademarks under Section 9 or Section 11 of the Trade Marks Act 1999. Our IP attorneys prepare a robust legal defense using relevant case laws and prior user evidence to secure brand registration.",
    advantages: [
      "Strong case law defenses and briefs tailored to registry concerns",
      "Trademark application salvage to prevent abandonment",
      "Evidentiary affidavit drafting for user date validation",
      "Objection status tracking and registry coordination",
      "Expert hearing preparation if required by the TM examiner"
    ],
    documents: [
      "Trademark application number",
      "Official Examination report from registrar",
      "Proof of brand usage (invoices, ads, domain)",
      "Bona fide usage documents"
    ],
    compliance: [
      "Submission within 30 days of report",
      "Hearing attendance if scheduled by registrar",
      "Affidavit execution"
    ],
    clientAdvantage: "Saves your trademark application from abandonment and defends your brand rights in front of the registry."
  },
  {
    id: "trademark-opposition",
    name: "Trademark Opposition",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "7–10 Working Days",
    minCapital: "—",
    liability: "IP Defense",
    taxBenefit: "Equity Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Scale,
    image: "/trademark_opposition.webp",
    description: "File TM-O notices or defend your registry status against competitors.",
    about: "Filing or defending Trademark Oppositions before the Trademark Registry. When a third party opposes your published trademark or a competitor tries to register a confusingly similar brand, our litigation attorneys draft the Notice of Opposition (TM-O) or Counter-Statement (TM-R) to protect your brand equity.",
    advantages: [
      "Competitor registration blocking via official TM-O filings",
      "Counter-statement drafting (TM-R) to defend your mark",
      "Notice of Opposition preparation backed by usage evidence",
      "Evidence submission and hearing defenses handled by advocates",
      "High-stake brand equity defense against corporate encroachment"
    ],
    documents: [
      "Opposing party application details",
      "Copy of TM Journal publication",
      "Prior registration certificates",
      "Legal power of attorney (POA)"
    ],
    compliance: [
      "Opposition within 4 months of TM Journal publication",
      "Counter-statement within 2 months of notice receipt",
      "Evidence leading within prescribed statutory timelines"
    ],
    clientAdvantage: "Blocks copycats from registering similar marks or defends your published trademark from malicious opposition."
  },
  {
    id: "trademark-assignment",
    name: "Trademark & IP Assignment",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "5–8 Working Days",
    minCapital: "—",
    liability: "Asset Secure",
    taxBenefit: "Capital Gains Structuring",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Shield,
    image: "/trademark_assignment.webp",
    description: "Draft deeds and update registry ownership (Form TM-P) safely.",
    about: "Legal drafting and filing of Trademark and Copyright Assignment Deeds to execute the transfer of ownership of intellectual property assets. Ideal for company restructuring, mergers, acquisitions, or individual-to-company asset transfers, ensuring full registry updates (Form TM-P).",
    advantages: [
      "Legal transfer of IP assets rights and goodwill",
      "Assignment Deed drafting by expert IP counsel",
      "Form TM-P registry filing for official title records",
      "Copyright transfer validation and deed execution",
      "Balance sheet asset structuring and valuation coordination"
    ],
    documents: [
      "Original TM/Copyright certificate",
      "Details of Assignor & Assignee",
      "Business valuation report (if any)",
      "Incorporation files of parties"
    ],
    compliance: [
      "Form TM-P filing with the TM Registry",
      "Stamp duty payment on deed transfer",
      "Company board resolutions recording the asset transfer"
    ],
    clientAdvantage: "Legally transfers intellectual property ownership between entities, ensuring complete title protection and balance sheet entry."
  },
  {
    id: "brand-protection",
    name: "Brand Protection & Monitoring",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "Ongoing Monitoring",
    minCapital: "—",
    liability: "IP Infringement Alert",
    taxBenefit: "Brand Equity Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Shield,
    image: "/brand_protection.webp",
    description: "Scan Trademark Journals and enforce brand rights online proactively.",
    about: "Continuous monitoring of the Trademark Journal, company registry, and online marketplaces to detect copycat brands or unauthorized usage of your IP. Includes drafting and serving Cease & Desist notices and taking administrative actions to remove infringing content.",
    advantages: [
      "Trademark Journal weekly scans and copycat alerts",
      "Cease & Desist legal notices drafted and served by counsel",
      "Marketplace counterfeit and copyright removal actions",
      "Domain name abuse and typo-squatting monitoring",
      "Proactive infringement prevention to safeguard equity"
    ],
    documents: [
      "Active registration certificates",
      "Logos and slogans list",
      "Details of suspected infringers",
      "Domain names portfolio"
    ],
    compliance: [
      "Weekly TM Journal scanning",
      "Quarterly marketplace audits",
      "Timely filing of cease and desist alerts"
    ],
    clientAdvantage: "Identifies copycat brand filings early so you can oppose them before they get registered, and keeps marketplaces clean of counterfeits."
  },
  {
    id: "litigation-assistance",
    name: "Litigation Assistance",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "As per Case Schedule",
    minCapital: "—",
    liability: "Legal Defense",
    taxBenefit: "Fiduciary Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Scale,
    image: "/litigation_assistance.webp",
    description: "Support for court proceedings, NCLT hearings, and legal notices.",
    about: "End-to-end legal support, litigation drafting, case research, and advisory services for commercial, contract, trademark, or shareholder disputes. Led by senior advocates, we prepare plaints, written statements, legal notices, and represent your company's interests before courts and tribunals.",
    advantages: [
      "High-court, NCLT, and district court representation by advocates",
      "Commercial contract disputes and shareholder defense advisory",
      "Bespoke legal research, case briefs, and written opinions",
      "Plaints, replies, appeals, and legal petition drafting",
      "Arbitration, mediation, and settlement audit coordination"
    ],
    documents: [
      "Disputed contract/agreement copy",
      "Chronology of dispute events",
      "Past communications / emails",
      "Existing court notices (if any)"
    ],
    compliance: [
      "Court filing timelines",
      "Summons responses tracking",
      "Advocate briefing schedules"
    ],
    clientAdvantage: "Secures premium corporate representation and robust drafting for contract, registry, or marketplace legal disputes."
  },
  {
    id: "trademark-renewal",
    name: "Trademark & License Renewal",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Ongoing Protection",
    taxBenefit: "Asset Preservation",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Clock,
    image: "/trademark_renewal.webp",
    description: "Renew marks (Form TM-R), FSSAI licenses, and prevent expiry risks.",
    about: "Timely renewal of trademarks (required every 10 years) and other commercial licenses (FSSAI, ISO, shop act). We file the necessary renewal applications (Form TM-R) with the registry, avoiding expiration, late filing penalties, or loss of proprietary brand rights.",
    advantages: [
      "Trademarks 10-year renewal filing and protection continuity",
      "Form TM-R filing coordination with the Trademark Registry",
      "Commercial license status checks and validity alerts",
      "Status tracking & new certificates retrieval support",
      "IP asset portfolio protection continuity"
    ],
    documents: [
      "Original registration certificate copy",
      "Application / License number",
      "Power of attorney documents",
      "Aadhaar/PAN of license holder"
    ],
    compliance: [
      "Form TM-R filing within 6 months before expiry",
      "FSSAI renewal annually or multi-year",
      "SLA updates tracking"
    ],
    clientAdvantage: "Prevents your trademark or licenses from expiring, avoiding heavy restoration fees or brand hijacking by competitors."
  },
  {
    id: "patent-filing",
    name: "Patent Drafting & Filing",
    category: "Legal & IP",
    categoryColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    timeline: "15–25 Working Days",
    minCapital: "—",
    liability: "IP Monopolized",
    taxBenefit: "Valuable IP Asset",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Award,
    image: "/patent_invention.webp",
    description: "Patentability searches, novelty checks, and specification drafting.",
    about: "End-to-end patent advisory including Freedom to Operate (FTO) search, patentability analysis, specification drafting (claims, description, drawings), and filing provisional or complete patent applications with the Indian Patent Office.",
    advantages: [
      "Freedom to Operate (FTO) reports to prevent infringement actions",
      "Patentability search & novelty checks across international databases",
      "Professional patent specification drafting by patent agents",
      "Provisional & Complete applications filing at the Patent Office",
      "Utility patents and industrial design patent registrations"
    ],
    documents: [
      "Invention Disclosure Form (IDF)",
      "Drawings/flowcharts of invention",
      "Prior art references (if any)",
      "Power of Attorney for patent agent"
    ],
    compliance: [
      "Response to First Examination Report (FER) within 6 months",
      "Patent maintenance fee annually after grant",
      "Form 27 working statement filing annually"
    ],
    clientAdvantage: "Legally secures proprietary technology/designs, granting you a 20-year monopoly and highly valuable balance sheet IP assets."
  },
  {
    id: "iso-certification",
    name: "ISO Certification Services",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    timeline: "5–7 Working Days",
    minCapital: "—",
    liability: "Quality Assured",
    taxBenefit: "Global Bid Eligible",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: CheckCircle2,
    image: "/iso_certification.webp",
    description: "Secure ISO 9001 or 27001 quality audit certificates easily.",
    about: "Provisioning of international ISO certifications (ISO 9001:2015 for Quality Management, ISO 27001 for Information Security, ISO 14001, etc.). We coordinate internal audits, compile mandatory quality manuals, and secure formal audit certifications from accredited bodies.",
    advantages: [
      "ISO 9001 / 27001 / 14001 quality certification mapping",
      "Accredited registrar/certification bodies coordination",
      "Audit preparation, quality manuals drafting & checklist support",
      "Conforms to global standards, unlocking corporate tender bids",
      "Enterprise operational safety & quality validation"
    ],
    documents: [
      "Company registration certificate",
      "Scope of business operations document",
      "Organization flow chart",
      "Standard operating procedures (SOPs)"
    ],
    compliance: [
      "Annual surveillance audits",
      "ISO manual updates on workflow changes",
      "Three-year renewal recertification"
    ],
    clientAdvantage: "Qualifies your company for large government/international tenders and validates operational safety and quality to global enterprise clients."
  }
];

const categoryFilters = ["All", "Incorporation", "Compliance", "Advisory", "Legal & IP"] as const;
type CategoryFilter = typeof categoryFilters[number];

const advantageSpectrum = [
  { icon: Shield, title: "Liability Protection", desc: "All our incorporation structures shield your personal assets from business liabilities — your home, savings, and investments stay safe." },
  { icon: TrendingUp, title: "Capital Readiness", desc: "Pvt Ltd and OPC structures are pre-configured for bank loans, venture capital, and government scheme eligibility from day one." },
  { icon: Award, title: "Regulatory Credibility", desc: "ROC-registered entities carry institutional trust with clients, vendors, and government departments that sole proprietorships cannot match." },
  { icon: FileText, title: "Tax Optimization", desc: "Corporate tax rates, partner remuneration deductions, and input tax credits are structured into your entity from the ground up." },
  { icon: CheckCircle2, title: "Zero Penalty Guarantee", desc: "Our compliance suite ensures all statutory deadlines are tracked and filed on time — eliminating daily compounding ROC penalties." },
  { icon: Users, title: "Dedicated Expert Assigned", desc: "Every engagement is handled by a dedicated corporate expert — not outsourced to junior staff or automated pipelines." },
];

const startingPrices: Record<string, string> = {
  "pvt-ltd": "₹4,999",
  "llp": "₹2,999",
  "opc": "₹3,999",
  "partnership": "₹1,499",
  "section8": "₹9,999",
  "annual-compliance": "₹999",
  "gst-tax": "₹999",
  "virtual-cfo": "Custom Pricing",
  "virtual-office": "₹999",
  "terms-privacy": "₹1,499",
  "msme-registration": "₹999",
  "fssai-registration": "₹1,999",
  "return-filing": "₹499",
  "trademark-registration": "₹4,999",
  "trademark-objection": "₹1,499",
  "trademark-opposition": "₹2,499",
  "trademark-assignment": "₹2,999",
  "brand-protection": "Custom Pricing",
  "litigation-assistance": "As per Case",
  "trademark-renewal": "₹2,999",
  "patent-filing": "₹9,999",
  "iso-certification": "₹3,999",
};

export default function ServiceCatalogInsights({ setActiveTab }: ServiceCatalogInsightsProps) {
  const navigateToTab = useAppNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [activeSection, setActiveSection] = useState<"advantages" | "documents" | "compliance">("advantages");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogViewMode, setCatalogViewMode] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(8);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Incorporation":
      case "Advisory":
        return "text-brand-gold bg-brand-gold/12 border-brand-gold/25";
      case "Compliance":
      case "Legal & IP":
      default:
        return "text-brand-blue bg-brand-blue/10 border-brand-blue/20";
    }
  };

  const filtered = catalog.filter(s => {
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openDetail = (service: ServiceType) => {
    setSelectedService(service);
    setActiveSection("advantages");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetail = () => {
    setSelectedService(null);
    setTimeout(() => {
      const el = document.getElementById("catalog-insights-top");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div id="catalog-insights-top" className="catalog-page-wrapper pt-6 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedService ? (
          /* Detailed Blueprint Page View */
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 max-w-5xl mx-auto text-left"
          >
            {/* Back Button Navigation Bar */}
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 relative z-10">
              <button
                onClick={closeDetail}
                className="flex items-center gap-2 text-xs font-semibold text-[#4F46E5] hover:text-[#3730A3] cursor-pointer transition-colors px-3.5 py-1.5 rounded-lg border border-indigo-500/10 bg-white/80 hover:bg-white hover:border-indigo-500/30 shadow-sm"
              >
                ← Back to Catalog
              </button>
              <span className="text-[10px] font-mono text-slate-400">
                Blueprint ID: {selectedService.id.toUpperCase()}
              </span>
            </div>
 
            {/* Split Page Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
              {/* Left Column: Cover Art & Metrics */}
              <div className="md:col-span-5 space-y-6">
                {/* Illustration Frame */}
                <div className="w-full rounded-2xl border border-indigo-500/10 bg-white/50 overflow-hidden shadow-md relative">
                  {/* Base background behind illustration */}
                  <div className="absolute inset-0 bg-white/20 z-0" />
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="w-full h-auto object-contain aspect-video md:aspect-auto relative z-[1]"
                  />
                  {/* Soft light vignette overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(255,255,255,0.7)_100%)] z-[2] pointer-events-none" />
                </div>
 
                {/* Key Metrics block */}
                <div className="bg-white/85 border border-indigo-500/10 rounded-2xl p-5 space-y-3 font-mono text-[11px] text-slate-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> Timeline:</span>
                    <span className="font-bold text-slate-700 font-sans">{selectedService.timeline}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Minimum Capital:</span>
                    <span className="font-bold text-slate-700 font-sans">{selectedService.minCapital}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Liability Shield:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${selectedService.liability === "Limited" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
                      {selectedService.liability}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax Benefit:</span>
                    <span className="font-bold text-[#4F46E5] font-sans">{selectedService.taxBenefit}</span>
                  </div>
                </div>
              </div>
 
              {/* Right Column: Descriptions & Details Tabs */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border ${getCategoryBadgeClass(selectedService.category)} font-bold`}>
                      {selectedService.category}
                    </span>
                    {selectedService.badge && (
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-600 text-white`}>
                        {selectedService.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#080F2A]">{selectedService.name}</h2>
                </div>
 
                <p className="text-xs text-slate-600 font-sans leading-relaxed border-l-2 border-indigo-500/30 pl-4">
                  {selectedService.about}
                </p>
 
                {/* Details Tab Switcher */}
                <div className="flex gap-1 bg-white/60 border border-indigo-500/10 rounded-xl p-1 w-fit">
                  {(["advantages", "documents", "compliance"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSection(tab)}
                      className={`text-[9px] font-mono uppercase tracking-widest px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold ${
                        activeSection === tab ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white shadow shadow-[#4F46E5]/15" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab === "advantages" ? "Key Advantages" : tab === "documents" ? "Documents" : "Compliance"}
                    </button>
                  ))}
                </div>
 
                {/* Tab content list frame */}
                <div className="bg-white/80 border border-indigo-500/10 rounded-xl p-5 min-h-[140px] shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeSection === "advantages" && (
                        <ul className="space-y-3">
                          {selectedService.advantages.map((adv, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-sans leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {activeSection === "documents" && (
                        <ul className="space-y-3">
                          {selectedService.documents.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-sans leading-relaxed">
                              <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {activeSection === "compliance" && (
                        <ul className="space-y-3">
                          {selectedService.compliance.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-sans leading-relaxed">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
 
                {/* Client Advantage Highlight */}
                <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                  <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-600 font-bold block mb-1">Client Advantage Spectrum</span>
                    <p className="text-xs text-slate-700 font-sans leading-relaxed">{selectedService.clientAdvantage}</p>
                  </div>
                </div>
 
                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-indigo-500/10">
                  <button
                    onClick={() => {
                      closeDetail();
                      navigateToTab("contact");
                    }}
                    className="px-5 py-3 border border-slate-200 hover:border-[#4F46E5] text-slate-600 hover:text-[#4F46E5] font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all cursor-pointer bg-transparent"
                  >
                    Consult Expert
                  </button>
                  <button
                    onClick={() => {
                      closeDetail();
                      navigateToTab("services");
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-mono uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg transition-all cursor-pointer font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Begin Onboarding <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Overview Catalog Cards Grid */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="relative text-center max-w-[820px] mx-auto space-y-5 pt-4 pb-2">
              
              {/* Left Side Illustration */}
              <div className="hidden xl:block absolute -left-48 top-4 z-10 glass-illustration-left pointer-events-none select-none">
                <div className="w-44 h-36 relative perspective-[800px]" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Outer glow aura */}
                  <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
                  
                  {/* Folder Back layer */}
                  <div className="absolute left-4 top-4 w-32 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-500/10 border border-white/40 shadow-md backdrop-blur-md" style={{ transform: 'rotateY(-15deg) rotateZ(-5deg)', transformStyle: 'preserve-3d' }}>
                    {/* Folder Tab */}
                    <div className="absolute -top-2 left-4 w-12 h-4 rounded-t-lg bg-indigo-500/20 border-t border-x border-white/40" />
                  </div>

                  {/* Document Stack sliding out */}
                  <div className="absolute left-8 top-1 w-24 h-28 rounded-xl bg-white/95 border border-slate-200 shadow-sm flex flex-col p-3 gap-2" style={{ transform: 'rotateY(-10deg) rotateZ(-2deg)' }}>
                    <div className="w-12 h-1.5 bg-indigo-200 rounded-full" />
                    <div className="w-16 h-1 bg-slate-100 rounded-full" />
                    <div className="w-14 h-1 bg-slate-100 rounded-full" />
                    <div className="w-10 h-1 bg-slate-100 rounded-full" />
                  </div>
                  <div className="absolute left-6 top-2 w-24 h-28 rounded-xl bg-white/80 border border-slate-200 shadow-sm flex flex-col p-3 gap-2" style={{ transform: 'rotateY(-12deg) rotateZ(-4deg)' }}>
                    <div className="w-10 h-1.5 bg-purple-200 rounded-full" />
                    <div className="w-14 h-1 bg-slate-100/80 rounded-full" />
                    <div className="w-12 h-1 bg-slate-100/80 rounded-full" />
                  </div>

                  {/* Folder Front layer */}
                  <div className="absolute left-2 top-8 w-34 h-22 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 border border-white/60 shadow-[0_8px_32px_rgba(31,41,95,0.06)] backdrop-blur-[8px]" style={{ transform: 'rotateY(-12deg) rotateZ(-5deg)' }} />

                  {/* Glassmorphic Shield in foreground */}
                  <div className="absolute bottom-1 right-2 w-16 h-20 bg-gradient-to-br from-[#4F46E5]/90 to-[#7C3AED]/90 border border-white/30 rounded-2xl shadow-[0_12px_24px_rgba(79,70,229,0.3)] flex items-center justify-center" style={{ transform: 'translateZ(40px)' }}>
                    <Shield className="w-8 h-8 text-white drop-shadow-md" />
                    {/* Glowing check inside shield */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold font-sans translate-y-1">✓</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side Illustration - Resized & Shifted Dark Dashboard Laptop */}
              <div className="hidden xl:block absolute -right-48 top-2 z-10 glass-illustration-right pointer-events-none select-none">
                <div className="w-[230px] h-[170px] relative perspective-[1000px]" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Outer glow aura */}
                  <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
                  
                  {/* Laptop Screen (tilted backward) */}
                  <div className="absolute left-[25px] top-1 w-[180px] h-[115px] bg-slate-900 border-[3.5px] border-slate-800 rounded-t-xl shadow-2xl overflow-hidden flex flex-col" style={{ transform: 'rotateY(14deg) rotateX(10deg)', transformStyle: 'preserve-3d' }}>
                    {/* Screen Content - Dashboard mock */}
                    <div className="flex-1 flex p-2 gap-2 bg-slate-950">
                      {/* Dashboard Sidebar */}
                      <div className="w-10 shrink-0 flex flex-col gap-1.5 border-r border-slate-800/60 pr-1.5">
                        <div className="w-full h-1 bg-[#4F46E5]/40 rounded-full" />
                        <div className="w-full h-1 bg-slate-800 rounded-full" />
                        <div className="w-full h-1 bg-slate-800 rounded-full" />
                        <div className="w-full h-1 bg-slate-800 rounded-full" />
                      </div>
                      
                      {/* Dashboard Charts Panel */}
                      <div className="flex-1 flex flex-col gap-1.5 justify-between">
                        {/* Upper Stats Row */}
                        <div className="flex justify-between gap-1">
                          <div className="w-full h-3.5 bg-[#4F46E5]/10 rounded border border-[#4F46E5]/20 flex items-center justify-center">
                            <div className="w-5 h-0.5 bg-[#4F46E5] rounded-full" />
                          </div>
                          <div className="w-full h-3.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-center">
                            <div className="w-4 h-0.5 bg-emerald-500 rounded-full" />
                          </div>
                        </div>
                        {/* Interactive Sparkline graph */}
                        <div className="flex-1 bg-slate-900/60 rounded border border-slate-800/80 p-1 flex items-end justify-between relative overflow-hidden">
                          <svg className="w-full h-full absolute inset-0 text-[#7C3AED]/40" viewBox="0 0 100 30" fill="none">
                            <path d="M0,25 Q15,10 30,20 T60,5 T90,15 T100,10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M0,25 Q15,10 30,20 T60,5 T90,15 T100,10 L100,30 L0,30 Z" fill="rgba(124, 92, 246, 0.05)" />
                          </svg>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] absolute top-1.5 right-6 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    {/* Glass sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-10 pointer-events-none" />
                  </div>

                  {/* Laptop Base (lying flat in perspective) */}
                  <div className="absolute left-1 top-[116px] w-[218px] h-[12px] bg-gradient-to-b from-slate-400 to-slate-500 rounded-b-md shadow-lg border-t border-slate-300 origin-top flex items-center justify-center" style={{ transform: 'rotateY(14deg) rotateX(55deg)' }}>
                    {/* Trackpad representation */}
                    <div className="w-12 h-1.5 bg-slate-600/30 rounded-sm border-t border-slate-500/20" />
                  </div>
                  
                  {/* Subtle laptop shadows */}
                  <div className="absolute left-7 top-[125px] w-[176px] h-2 bg-indigo-950/20 blur-sm rounded-full" style={{ transform: 'rotateY(14deg)' }} />
                </div>
              </div>

              {/* Exploration Badge Pill */}
              <div className="inline-flex justify-center">
                <span className="hero-pill-badge">
                  Explore Our Solutions
                </span>
              </div>
              
              <h1 className="text-[#080F2A] tracking-tight" style={{
                fontSize: 'clamp(42px, 5vw, 72px)',
                lineHeight: '0.95',
                fontWeight: 800,
                letterSpacing: '-0.04em'
              }}>
                Service Catalog &{" "}
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic" style={{
                  fontStyle: 'italic',
                  fontWeight: 800,
                  paddingRight: '0.15em',
                  display: 'inline-block'
                }}>
                  Client Advantage
                </span>{" "}
                Spectrum
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed max-w-2xl mx-auto font-medium">
                Deep domain expertise across 25+ services to start, manage, grow and scale your business with complete compliance and confidence.
              </p>
            </div>

            {/* Stats Strip */}
            <div className="w-full max-w-4xl mx-auto px-4">
              <div className="catalog-stats-strip py-4 px-6 sm:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-left">
                  {[
                    { icon: Building2, value: "25+", label: "Services Available" },
                    { icon: Users, value: "50+", label: "Businesses Supported" },
                    { icon: CheckCircle2, value: "Prompt", label: "Filing Support" },
                    { icon: Clock, value: "Dedicated", label: "Advisor Support" },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-3.5 py-1.5 px-1 flex-1 justify-center sm:justify-start w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[#4F46E5] shrink-0 border border-indigo-500/20">
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-[#080F2A] leading-none">{s.value}</p>
                          <p className="text-[11px] text-slate-500 mt-1.5 font-semibold leading-tight">{s.label}</p>
                        </div>
                      </div>
                      {i < 3 && (
                        <span className="hidden sm:inline-block w-[1px] h-8 bg-slate-200/80 self-center shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter and Search Action Row */}
            <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 relative z-10">
              
              {/* Category Filters (Scrolls horizontally on mobile, wraps on tablet) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {categoryFilters.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setVisibleCount(8); // reset pagination when category changes
                    }}
                    className={`category-pill px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      activeCategory === cat ? "active" : "text-slate-500 hover:text-[#4F46E5]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Search Bar & View Grid/List Toggle */}
              <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto">
                
                {/* Search Inputs */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(8); // reset pagination when query changes
                    }}
                    placeholder="Search a service..."
                    className="catalog-search-input pl-10 pr-4 py-2 w-full text-xs font-sans text-[#080F2A] outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold font-sans cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Grid/List View Toggles */}
                <div className="flex items-center gap-1.5 p-1 bg-white/60 border border-indigo-500/10 rounded-xl shadow-sm">
                  <button
                    onClick={() => setCatalogViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      catalogViewMode === "grid"
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white shadow-md shadow-[#4F46E5]/15"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="Grid View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setCatalogViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      catalogViewMode === "list"
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#635BFF] text-white shadow-md shadow-[#4F46E5]/15"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="List View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
              </div>
            </div>

            {/* Service Cards Grid / List */}
            <div className={
              catalogViewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto text-left"
                : "grid grid-cols-1 gap-6 max-w-5xl mx-auto text-left"
            }>
              {filtered.slice(0, visibleCount).map((service, idx) => {
                const Icon = service.icon;
                const price = startingPrices[service.id] || "₹999";
                
                if (catalogViewMode === "list") {
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="service-glass-card p-5 sm:p-6 relative group"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        
                        {/* Left: Glassy image box */}
                        <div className="w-full sm:w-48 shrink-0 relative aspect-[16/9] sm:aspect-auto sm:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50/50 via-slate-50 to-purple-50/50 border border-indigo-500/10 flex items-center justify-center">
                          {/* Background animated circles */}
                          <div className="absolute top-1 left-1 w-10 h-10 rounded-full bg-indigo-200/30 blur-md" />
                          <div className="absolute bottom-1 right-1 w-12 h-12 rounded-full bg-purple-200/30 blur-md" />
                          
                          <div className="w-16 h-10 rounded-lg bg-white/50 border border-white/60 shadow-sm flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#4F46E5]" />
                          </div>
                        </div>
                        
                        {/* Middle Content */}
                        <div className="flex-1 min-w-0 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <h3 onClick={() => openDetail(service)} className="text-sm font-bold text-[#080F2A] hover:text-[#4F46E5] transition-colors cursor-pointer">
                              {service.name}
                            </h3>
                            <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-[#4F46E5] border border-indigo-500/20">
                              {service.category}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                            {service.description}
                          </p>
                          
                          {/* Timeline / Starting Price metadata strip */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#4F46E5]" /> Timeline: <strong className="text-slate-600 font-sans">{service.timeline}</strong>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>
                              Price: <strong className="text-slate-500 font-sans font-semibold">Stated after consultation</strong>
                            </span>
                          </div>
                        </div>
                        
                        {/* Right: View Button */}
                        <button
                          onClick={() => openDetail(service)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-indigo-500/5 text-[#4F46E5] font-bold text-[11px] rounded-xl border border-indigo-500/10 cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap self-stretch sm:self-center justify-center"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        
                      </div>
                    </motion.div>
                  );
                }
                
                {/* Standard Grid Card */}
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="service-glass-card flex flex-col justify-between group relative"
                  >
                    
                    {/* Header: Full-width Image Banner */}
                    <div className="w-full h-[180px] overflow-hidden relative border-b border-indigo-500/10 shrink-0">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                          {service.category}
                        </span>
                        {service.badge && (
                          <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#4F46E5] text-white shadow-sm font-semibold">
                            {service.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-2.5 text-left">
                        <h3
                          onClick={() => openDetail(service)}
                          className="text-[13px] font-extrabold text-[#080F2A] group-hover:text-[#4F46E5] transition-colors font-sans cursor-pointer leading-snug line-clamp-2 min-h-[38px] flex items-center"
                          title={service.name}
                        >
                          {service.name}
                        </h3>
                        
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-sans font-light min-h-[48px]">
                          {service.description}
                        </p>
                      </div>
                      
                      {/* Info & Pricing Row */}
                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px]">
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                          <span className="text-slate-600 font-medium">{service.timeline}</span>
                        </span>
                        
                        <span className="text-slate-500 font-medium font-sans text-[10px]">
                          Stated after consultation
                        </span>
                      </div>
                      
                      {/* View details blueprint CTA */}
                      <button
                        onClick={() => openDetail(service)}
                        className="btn-view-blueprint w-full flex items-center justify-center gap-1.5"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Services Button */}
            {filtered.length > visibleCount && (
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-6 py-2.5 bg-white/80 hover:bg-white text-[#4F46E5] text-xs font-semibold rounded-full border border-indigo-500/15 hover:border-indigo-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/5 backdrop-blur-sm"
                >
                  Load More Services <ChevronDown className="w-4 h-4 text-[#4F46E5]" />
                </button>
              </div>
            )}

            {/* Client Advantage Spectrum */}
            <div className="max-w-5xl mx-auto space-y-8 pt-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-[#4F46E5] text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-widest font-mono">
                  <Award className="w-3.5 h-3.5 text-[#4F46E5]" /> Why Choose Incroute
                </div>
                <h2 className="text-3xl font-extrabold text-[#080F2A] tracking-tight">
                  The Client{" "}
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic">
                    Advantage Spectrum
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-sans max-w-lg mx-auto leading-relaxed font-medium">
                  Six core advantages every Incroute client receives — regardless of which service they choose.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {advantageSpectrum.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-md border border-indigo-500/10 rounded-2xl p-6 space-y-3 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300 group text-left"
                  >
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[#4F46E5] w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-[#080F2A]">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="bg-white/80 backdrop-blur-md border border-indigo-500/10 rounded-3xl p-8 sm:p-10 text-center space-y-5 relative overflow-hidden shadow-lg shadow-indigo-500/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-bold text-[#080F2A] tracking-tight">Ready to get started?</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-md mx-auto font-medium">
                    Pick your structure, upload your documents, and let Incroute handle the rest — end to end.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => navigateToTab("services")}
                      className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-500/20"
                    >
                      Start Registration <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigateToTab("contact")}
                      className="px-6 py-3 border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-200 cursor-pointer bg-transparent"
                    >
                      Talk to an Expert
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom trust strip */}
              <div className="catalog-trust-strip p-6 sm:p-8 mt-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
                  {[
                    { icon: Shield, title: "Expert Guidance", desc: "Consult directly with corporate lawyers & CA experts" },
                    { icon: Database, title: "Transparent Pricing", desc: "No hidden charges, zero obligation recommendations" },
                    { icon: Lock, title: "Secure & Reliable", desc: "Bank-grade file storage & encrypted communications" },
                    { icon: Users, title: "End-to-End Support", desc: "We manage preparation, registry lodging & filings" },
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col gap-2.5 flex-1 trust-strip-divider pr-4 md:pl-2">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[#4F46E5] shrink-0 border border-indigo-500/20">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h4 className="text-xs font-bold text-[#080F2A]">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-light">{item.desc}</p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
