import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppNavigate } from "../lib/useAppNavigate";
import {
  Building2, Shield, Star, Clock, Users, FileText, CheckCircle2,
  ArrowRight, ChevronDown, ChevronUp, Sparkles, Award, TrendingUp,
  Scale, Landmark, Database, Heart, AlertTriangle, Info,
} from "lucide-react";

const catalog = [
  {
    id: "pvt-ltd",
    name: "Private Limited Company",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pricing: "₹999*",
    timeline: "7–10 Working Days",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    taxBenefit: "Startup India",
    badge: "Most Popular",
    badgeColor: "bg-brand-gold text-black",
    rating: 5,
    icon: Building2,
    description: "The gold standard for startups and growing businesses. Offers limited liability, separate legal entity, and venture capital eligibility.",
    about: "A Private Limited Company (Pvt Ltd) is the most preferred business structure for startups and SMEs in India. Governed by the Companies Act 2013, it provides perpetual succession, credibility with investors, and the ability to raise external capital.",
    advantages: [
      "Separate legal entity — personal assets fully protected",
      "Raise venture capital and issue ESOPs",
      "Perpetual succession regardless of ownership changes",
      "Startup India & DPIIT recognition eligibility",
      "High credibility with banks, clients, and investors",
    ],
    documents: ["PAN Card & Aadhaar of all Directors", "Utility Bill for registered office", "NOC from property owner", "Form DIR-2 (Consent of Directors)", "Digital Signature Certificate (DSC)"],
    compliance: ["First Board Meeting within 30 days", "Form 20A within 180 days", "Annual ROC filings (AOC-4, MGT-7)", "Director KYC annually"],
    clientAdvantage: "Best for founders who want to raise funding, hire talent via ESOPs, or build a scalable brand with full legal protection.",
  },
  {
    id: "llp",
    name: "Limited Liability Partnership",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pricing: "₹1,499*",
    timeline: "10–15 Working Days",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "Lower Tax Rate",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Users,
    description: "Flexibility of a partnership with corporate liability protection. No minimum capital required.",
    about: "An LLP combines the operational flexibility of a partnership with the limited liability of a company. Governed under the LLP Act 2008, it is ideal for professional services, consultancies, and family businesses.",
    advantages: [
      "No minimum capital requirement",
      "Partners protected from each other's negligence",
      "No Dividend Distribution Tax (DDT)",
      "Lower statutory audit threshold",
      "Flexible profit-sharing structure",
    ],
    documents: ["ID & Address proof of all partners", "NOC from registered office owner", "Stamped LLP Agreement", "DPIN of designated partners"],
    compliance: ["LLP Agreement filing (Form 3) within 30 days", "Annual Return (Form 11)", "Statement of Accounts (Form 8)", "Income Tax Return annually"],
    clientAdvantage: "Best for professional firms, consultancies, and service businesses that want liability protection without heavy corporate compliance.",
  },
  {
    id: "opc",
    name: "One Person Company",
    category: "Incorporation",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pricing: "₹1,299*",
    timeline: "7–12 Working Days",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    taxBenefit: "Solo Corporate Tax",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Scale,
    description: "Solo founder? Get full corporate protection without a co-founder.",
    about: "OPC allows a single entrepreneur to operate a corporate entity with limited liability. It eliminates personal asset risk while granting corporate tax rates, bank financing, and a nominee director safety net.",
    advantages: [
      "100% ownership and control by one person",
      "Limited liability — personal assets protected",
      "Corporate tax rates instead of individual slab",
      "Easier bank credit and loan eligibility",
      "Nominee director ensures business continuity",
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
    pricing: "₹799*",
    timeline: "3–5 Working Days",
    minCapital: "None",
    liability: "Unlimited",
    taxBenefit: "Deed Pass-through",
    badge: "",
    badgeColor: "",
    rating: 4.5,
    icon: Users,
    description: "Simple, fast, and cost-effective for small businesses and local ventures.",
    about: "A Partnership Firm is structured by a signed deed under the Partnership Act 1932. Partners share mutual agency, liabilities, and profits with minimal reporting and zero ROC compliance requirements.",
    advantages: [
      "Zero corporate registry fees",
      "Fastest setup — 3 to 5 days",
      "Minimal annual compliance burden",
      "Direct profit pass-through to partners",
      "Flexible internal management structure",
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
    pricing: "₹2,499*",
    timeline: "15–20 Working Days",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "80G Exemption",
    badge: "NGO Special",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    rating: 5,
    icon: Heart,
    description: "Charitable non-profit status with full tax exemptions and donation eligibility.",
    about: "A Section 8 Company promotes charitable objectives — education, art, science, sports, or social welfare. It obtains a special central government license granting 12A & 80G tax exemptions and access to domestic and international donations.",
    advantages: [
      "12A & 80G tax exemption certificates",
      "Eligible for CSR funding from corporates",
      "Receive foreign donations under FCRA",
      "High public trust and social credibility",
      "No minimum capital requirement",
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
    pricing: "₹2,999*",
    timeline: "Ongoing Support",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Penalty Shield",
    badge: "Compliance Special",
    badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    rating: 5,
    icon: FileText,
    description: "ROC filing, Director KYC, board minutes, and zero-penalty guarantee.",
    about: "Annual Compliances Suite keeps your company in pristine standing with ROC/MCA registries. It coordinates AOC-4, MGT-7, Director KYC updates, statutory balance sheet reconciliations, and board resolution books under dedicated Chartered Accountants.",
    advantages: [
      "Zero late penalty guarantee on all ROC filings",
      "Dedicated CA Lead assigned to your account",
      "Statutory Board meeting minutes drafted",
      "Director KYC (DIR-3 KYC) filed annually",
      "Pristine company credit rating maintained",
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
    pricing: "₹499*",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Input Tax Credits",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Database,
    description: "GSTIN activation, MSME registration, and PAN/TAN drafting.",
    about: "GST and Statutory Tax Registrations allocate legal tax credentials for business operations. Secures GSTIN profiles, activates MSME certifications, drafts PAN/TAN profiles, and enables smooth inter-state commerce.",
    advantages: [
      "GSTIN profile activated within 3–5 days",
      "Input Tax Credit (ITC) eligibility unlocked",
      "MSME Udyam Registration for government benefits",
      "PAN/TAN statutory drafts included",
      "Inter-state commerce legal clearance",
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
    pricing: "₹4,999/mo*",
    timeline: "Monthly Retainer",
    minCapital: "—",
    liability: "Fiduciary",
    taxBenefit: "Treasury Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: TrendingUp,
    description: "Cash flow modeling, treasury operations, and board performance reports.",
    about: "Virtual CFO Retainer provides institutional-grade corporate finance strategy without executive hiring costs. Structured under senior Chartered Accountants, it models cash flows, designs capital structures, runs audit controls, and prepares investor-ready financials.",
    advantages: [
      "Institutional cash flow architecture",
      "Investor pitch deck financial modeling",
      "Corporate treasury and fund management",
      "Fiduciary tax defense and audit representation",
      "Monthly board performance metrics and reports",
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
    pricing: "₹999/mo*",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Lease Isolated",
    taxBenefit: "GST/ROC Compliant",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Landmark,
    description: "GST & ROC compliant premium addresses with mail handling and on-demand meeting rooms.",
    about: "Virtual Office Address secures a legal corporate headquarters in premium commercial hubs — Bangalore, Mumbai, Delhi, Hyderabad — without office lease overheads. Includes certified NOCs, utility bills for GST/ROC registrations, and physical mail forwarding.",
    advantages: [
      "GST & ROC compliant registered address",
      "Certified landlord NOC included",
      "Prime city address for brand credibility",
      "Physical mail scanning and forwarding",
      "On-demand board meeting room access",
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
    pricing: "Custom Quote",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "Risk Mitigated",
    taxBenefit: "Liability Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: FileText,
    description: "GDPR/CCPA compliant terms & policies tailored for websites/apps.",
    about: "Custom drafting of comprehensive Terms of Service (ToS) and Privacy Policy agreements. Designed specifically for your platform, website, or mobile application, ensuring compliance with global privacy regulations (GDDR, CCPA, IT Act 2000) and protecting your enterprise from customer/user disputes.",
    advantages: [
      "GDPR & CCPA Compliant framework",
      "User liability and civil claim mitigation",
      "Intellectual property ownership protections",
      "Bespoke dispute resolution terms",
      "Refund and account termination clauses"
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
    pricing: "Custom Quote",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Govt Scheme Eligible",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Award,
    description: "Get government-backed Udyam MSME certification to unlock subsidies and loans.",
    about: "Government-backed Udyam MSME certification for micro, small, and medium enterprises. Registering your enterprise unlocks priority bank lending rates, subsidies on patents and barcodes, concessions on electricity bills, and robust legal protection against delayed business payments from corporate buyers.",
    advantages: [
      "Priority sector bank loans under MSME credit schemes",
      "Robust legal protection from enterprise payment delays",
      "Concessions on commercial electricity bills",
      "Subsidies on patent and barcode filings",
      "Priority status for government tenders"
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
    pricing: "Custom Quote",
    timeline: "3–7 Working Days",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Quality Standard",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: CheckCircle2,
    description: "Legally mandatory FSSAI food license for retail, kitchen, and preparation setups.",
    about: "An FSSAI Food Safety License is legally mandatory for any food business operator (FBO) in India dealing in manufacturing, processing, packaging, storage, transportation, retail, distribution, or restaurant/kitchen food safety operations.",
    advantages: [
      "Legally mandatory food safety license compliance",
      "Builds high consumer trust & brand validation",
      "Authorization for official FSSAI logo usage",
      "Quality standards validation certificate",
      "Protects food businesses from registry audits"
    ],
    documents: [
      "PAN & Aadhaar card of the operator",
      "Electricity bill of commercial kitchen/office",
      "NOC from registered property landlord",
      "List of food categories and ingredients used"
    ],
    compliance: [
      "FSSAI license renewal (1 to 5 years tenure)",
      "Maintaining clean sanitary condition standards",
      "Support for official safety auditor checks"
    ],
    clientAdvantage: "Legally registers your food business, avoiding heavy penal fees and showcasing verified safety standards to your customers."
  },
  {
    id: "return-filing",
    name: "Return Filing Services",
    category: "Compliance",
    categoryColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    pricing: "Custom Quote",
    timeline: "Ongoing Support",
    minCapital: "—",
    liability: "Statutory",
    taxBenefit: "Input Credit Claim",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: FileText,
    description: "Expert GSTR-1/3B filings, ITR, and TDS returns led by CAs.",
    about: "Ongoing GST returns (GSTR-1, GSTR-3B) and corporate/partnership Income Tax Return (ITR) filings managed by dedicated Chartered Accountants. Ensures maximum utilization of Input Tax Credits (ITC), clean tax reconciliation, and full compliance with Central Excise and GST Departments.",
    advantages: [
      "Accurate ITR filing under active tax brackets",
      "GST input tax credit claims maximized",
      "Zero penalty compliance on delayed filings",
      "TDS filing and quarterly reconciliation",
      "Tax assessment defense support by CAs"
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
    pricing: "Custom Quote",
    timeline: "2–3 Working Days (Filing)",
    minCapital: "—",
    liability: "IP Shielded",
    taxBenefit: "Intangible Asset",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Shield,
    description: "Exclusivity for your brand name & logo with expert legal opinions.",
    about: "Comprehensive brand protection including deep Trademark Search, Opinion Letters on registrability, official Class filing, and drafting replies to Office Actions. Our registered IP attorneys ensure your brand name, logo, or slogan secures absolute exclusivity and legal protection in India.",
    advantages: [
      "Brand name & logo absolute exclusivity",
      "Deep conflict search reports across classes",
      "Attorney Opinion letters on registry issues",
      "Official TM Journal filing",
      "Office action replies coordination"
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
    pricing: "Custom Quote",
    timeline: "3–5 Working Days",
    minCapital: "—",
    liability: "IP Defense",
    taxBenefit: "Asset Salvage",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Scale,
    description: "Defend Section 9 or Section 11 objections with case-law backings.",
    about: "Professional drafting of legal replies to trademark objections raised by the Registrar of Trademarks under Section 9 or Section 11 of the Trade Marks Act 1999. Our IP attorneys prepare a robust legal defense using relevant case laws and prior user evidence to secure brand registration.",
    advantages: [
      "Strong case law defenses and briefs",
      "Trademark application salvage",
      "Evidentiary affidavit drafting for user date",
      "Objection status tracking",
      "Expert hearing preparation if required"
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
    pricing: "Custom Quote",
    timeline: "7–10 Working Days",
    minCapital: "—",
    liability: "IP Defense",
    taxBenefit: "Equity Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Scale,
    description: "File TM-O notices or defend your registry status against competitors.",
    about: "Filing or defending Trademark Oppositions before the Trademark Registry. When a third party opposes your published trademark or a competitor tries to register a confusingly similar brand, our litigation attorneys draft the Notice of Opposition (TM-O) or Counter-Statement (TM-R) to protect your brand equity.",
    advantages: [
      "Competitor registration blocking via TM-O",
      "Counter-statement drafting (TM-R)",
      "Notice of Opposition preparation",
      "Evidence submission and hearing defenses",
      "High-stake brand equity defense"
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
    pricing: "Custom Quote",
    timeline: "5–8 Working Days",
    minCapital: "—",
    liability: "Asset Secure",
    taxBenefit: "Capital Gains Structuring",
    badge: "",
    badgeColor: "",
    rating: 4.8,
    icon: Shield,
    description: "Draft deeds and update registry ownership (Form TM-P) safely.",
    about: "Legal drafting and filing of Trademark and Copyright Assignment Deeds to execute the transfer of ownership of intellectual property assets. Ideal for company restructuring, mergers, acquisitions, or individual-to-company asset transfers, ensuring full registry updates (Form TM-P).",
    advantages: [
      "Legal transfer of IP assets rights",
      "Assignment Deed drafting by experts",
      "Form TM-P registry filing",
      "Copyright transfer validation",
      "Balance sheet asset structuring"
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
    pricing: "Custom Quote",
    timeline: "Ongoing Monitoring",
    minCapital: "—",
    liability: "IP Infringement Alert",
    taxBenefit: "Brand Equity Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Shield,
    description: "Scan Trademark Journals and enforce brand rights online proactively.",
    about: "Continuous monitoring of the Trademark Journal, company registry, and online marketplaces to detect copycat brands or unauthorized usage of your IP. Includes drafting and serving Cease & Desist notices and taking administrative actions to remove infringing content.",
    advantages: [
      "Trademark Journal weekly scans and alerts",
      "Cease & Desist legal notices served",
      "Marketplace counterfeit removal actions",
      "Domain name abuse monitoring",
      "Proactive infringement prevention"
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
    pricing: "Custom Quote",
    timeline: "As per Case Schedule",
    minCapital: "—",
    liability: "Legal Defense",
    taxBenefit: "Fiduciary Shield",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Scale,
    description: "Support for court proceedings, NCLT hearings, and legal notices.",
    about: "End-to-end legal support, litigation drafting, case research, and advisory services for commercial, contract, trademark, or shareholder disputes. Led by senior advocates, we prepare plaints, written statements, legal notices, and represent your company's interests before courts and tribunals.",
    advantages: [
      "High-court and NCLT representation",
      "Commercial contract disputes advocacy",
      "Bespoke legal research & opinion briefs",
      "Plaints & replies drafting",
      "Arbitration and settlement audits"
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
    pricing: "Custom Quote",
    timeline: "2–3 Working Days",
    minCapital: "—",
    liability: "Ongoing Protection",
    taxBenefit: "Asset Preservation",
    badge: "",
    badgeColor: "",
    rating: 4.9,
    icon: Clock,
    description: "Renew marks (Form TM-R), FSSAI licenses, and prevent expiry risks.",
    about: "Timely renewal of trademarks (required every 10 years) and other commercial licenses (FSSAI, ISO, shop act). We file the necessary renewal applications (Form TM-R) with the registry, avoiding expiration, late filing penalties, or loss of proprietary brand rights.",
    advantages: [
      "Trademarks 10-year renewal filing",
      "Form TM-R filing coordination with registry",
      "Commercial license status checks",
      "Status tracking & certificates retrieval",
      "Asset protection continuity"
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
    pricing: "Custom Quote",
    timeline: "15–25 Working Days",
    minCapital: "—",
    liability: "IP Monopolized",
    taxBenefit: "Valuable IP Asset",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: Award,
    description: "Patentability searches, novelty checks, and specification drafting.",
    about: "End-to-end patent advisory including Freedom to Operate (FTO) search, patentability analysis, specification drafting (claims, description, drawings), and filing provisional or complete patent applications with the Indian Patent Office.",
    advantages: [
      "Freedom to Operate (FTO) reports",
      "Patentability search & novelty checks",
      "Professional specification drafting",
      "Provisional & Complete applications filing",
      "Utility and design patent filings"
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
    pricing: "Custom Quote",
    timeline: "5–7 Working Days",
    minCapital: "—",
    liability: "Quality Assured",
    taxBenefit: "Global Bid Eligible",
    badge: "",
    badgeColor: "",
    rating: 5,
    icon: CheckCircle2,
    description: "Secure ISO 9001 or 27001 quality audit certificates easily.",
    about: "Provisioning of international ISO certifications (ISO 9001:2015 for Quality Management, ISO 27001 for Information Security, ISO 14001, etc.). We coordinate internal audits, compile mandatory quality manuals, and secure formal audit certifications from accredited bodies.",
    advantages: [
      "ISO 9001 / 27001 / 14001 certification path",
      "Accredited certification bodies coordination",
      "Audit preparation & checklist support",
      "Global tender eligibility",
      "Enterprise quality validation"
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
  { icon: Users, title: "Dedicated Expert Assigned", desc: "Every engagement is handled by D Bhushan personally — not outsourced to junior staff or automated pipelines." },
];

interface ServiceCatalogInsightsProps {
  setActiveTab?: (tab: string) => void;
}

export default function ServiceCatalogInsights({ setActiveTab }: ServiceCatalogInsightsProps) {
  const navigateToTab = useAppNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"advantages" | "documents" | "compliance">("advantages");

  const filtered = catalog.filter(s => activeCategory === "All" || s.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    setActiveSection("advantages");
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
          <Sparkles className="w-3.5 h-3.5" /> Detailed Service Intelligence
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Service Catalog &{" "}
          <span className="text-brand-gold italic font-normal">Client Advantage Spectrum.</span>
        </h1>
        <p className="text-sm text-brand-text-muted font-sans leading-relaxed max-w-xl mx-auto">
          Every service we offer — broken down by documents required, compliance obligations, pricing, and the exact client advantage it delivers.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categoryFilters.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest font-bold border transition-all duration-150 fast-transition cursor-pointer ${
              activeCategory === cat
                ? "bg-brand-gold text-black border-brand-gold"
                : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Cards */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {filtered.map((service, idx) => {
          const isExpanded = expandedId === service.id;
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`bg-brand-bg-lighter border rounded-2xl overflow-hidden transition-all duration-200 ${
                isExpanded ? "border-brand-gold/40 shadow-xl shadow-brand-gold/5" : "border-brand-border hover:border-brand-gold/25"
              }`}
            >
              {/* Card Header — always visible */}
              <button
                onClick={() => toggleExpand(service.id)}
                className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${isExpanded ? "bg-brand-gold text-black border-brand-gold" : "bg-brand-bg border-brand-border text-brand-gold group-hover:bg-brand-gold/10"}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Title block */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm font-semibold tracking-wide transition-colors ${isExpanded ? "text-brand-gold" : "text-brand-text group-hover:text-brand-gold"}`}>
                        {service.name}
                      </h3>
                      {service.badge && (
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${service.badgeColor}`}>
                          {service.badge}
                        </span>
                      )}
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${service.categoryColor}`}>
                        {service.category}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-muted font-sans leading-relaxed line-clamp-1">{service.description}</p>
                  </div>
                </div>

                {/* Right meta + toggle */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-brand-text-muted">
                    <div className="text-center">
                      <div className="text-brand-gold font-bold text-sm">{service.pricing}</div>
                      <div className="uppercase tracking-wider">Starting</div>
                    </div>
                    <div className="text-center">
                      <div className="text-brand-text font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />{service.timeline}</div>
                      <div className="uppercase tracking-wider">Timeline</div>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-brand-gold shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-brand-text-muted shrink-0" />
                  }
                </div>
              </button>

              {/* Expanded Detail Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-brand-border/60 px-5 sm:px-6 pb-6 pt-5 space-y-6">
                      {/* Quick stats row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Starting Price", value: service.pricing },
                          { label: "Timeline", value: service.timeline },
                          { label: "Min. Capital", value: service.minCapital },
                          { label: "Tax Benefit", value: service.taxBenefit },
                        ].map((stat, i) => (
                          <div key={i} className="bg-brand-bg border border-brand-border rounded-xl p-3 text-center space-y-0.5">
                            <div className="text-[8px] font-mono uppercase tracking-widest text-brand-text-muted">{stat.label}</div>
                            <div className="text-xs font-bold text-brand-gold">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* About */}
                      <p className="text-xs text-brand-text-muted font-sans leading-relaxed border-l-2 border-brand-gold/30 pl-4">
                        {service.about}
                      </p>

                      {/* Tab switcher */}
                      <div className="flex gap-1 bg-brand-bg border border-brand-border rounded-xl p-1 w-fit">
                        {(["advantages", "documents", "compliance"] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveSection(tab)}
                            className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                              activeSection === tab ? "bg-brand-gold text-black" : "text-brand-text-muted hover:text-brand-text"
                            }`}
                          >
                            {tab === "advantages" ? "Key Advantages" : tab === "documents" ? "Documents" : "Compliance"}
                          </button>
                        ))}
                      </div>

                      {/* Tab content */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSection}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                        >
                          {activeSection === "advantages" && (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {service.advantages.map((adv, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-brand-text-muted font-sans">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                                  {adv}
                                </li>
                              ))}
                            </ul>
                          )}
                          {activeSection === "documents" && (
                            <ul className="space-y-2">
                              {service.documents.map((doc, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-brand-text-muted font-sans">
                                  <FileText className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          )}
                          {activeSection === "compliance" && (
                            <ul className="space-y-2">
                              {service.compliance.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-brand-text-muted font-sans">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Client Advantage callout */}
                      <div className="flex items-start gap-3 p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl">
                        <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-brand-gold font-bold block mb-1">Client Advantage</span>
                          <p className="text-xs text-brand-text/90 font-sans leading-relaxed">{service.clientAdvantage}</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => navigateToTab("services")}
                          className="flex items-center gap-2 bg-brand-gold text-black font-mono uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-lg hover:bg-white transition-all cursor-pointer font-bold shadow-md shadow-brand-gold/10"
                        >
                          Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Client Advantage Spectrum */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
            <Award className="w-3 h-3" /> Why Choose Incroute
          </div>
          <h2 className="text-2xl font-light text-brand-text serif">
            The Client <span className="text-brand-gold italic font-normal">Advantage Spectrum.</span>
          </h2>
          <p className="text-xs text-brand-text-muted font-sans max-w-lg mx-auto leading-relaxed">
            Six core advantages every Incroute client receives — regardless of which service they choose.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantageSpectrum.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-3 hover:border-brand-gold/30 transition-colors group premium-card"
            >
              <div className="p-2.5 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-brand-gold w-fit group-hover:bg-brand-gold group-hover:text-black transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-brand-text">{item.title}</h4>
              <p className="text-xs text-brand-text-muted font-sans leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="premium-hero-card border rounded-2xl p-8 sm:p-10 text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-light text-white serif">Ready to get started?</h3>
            <p className="text-sm text-slate-300 font-sans max-w-md mx-auto">
              Pick your structure, upload your documents, and let Incroute handle the rest — end to end.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={() => navigateToTab("services")}
                className="px-6 py-3 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center gap-2"
              >
                Start Registration <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigateToTab("contact")}
                className="px-6 py-3 border border-slate-500 hover:border-brand-gold text-white hover:text-brand-gold font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition cursor-pointer bg-transparent"
              >
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
