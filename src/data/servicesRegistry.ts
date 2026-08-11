export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  timeline: string;
  image?: string;
  minDirectors?: string;
  liability?: string;
  taxBenefit?: string;
  detailedAbout: string;
  keyAdvantages: string[];
  badge?: string;
  expert?: string;
  rating?: number;
  description: string;
  popular?: boolean;
  features: string[];
  documents: string[];
}

export const TITLE_MAP: Record<string, { name: string; tagline: string; description: string }> = {
  // Corporate Incorporation
  "pvt-ltd": {
    name: "Private Limited Company Registration",
    tagline: "India's Most Trusted Corporate Structure for Startups & Raised Capital",
    description: "Incorporate your Private Limited Company with 2 Directors, Digital Signatures (DSC), SPICe+ Part A & B MCA approval, PAN, TAN, and free bank account opening."
  },
  "llp": {
    name: "Limited Liability Partnership (LLP) Registration",
    tagline: "Combine Limited Liability Protection with Operational Partnership Flexibility",
    description: "Register your LLP with Ministry of Corporate Affairs (MCA). Includes RUN-LLP name reservation, FiLLiP statutory incorporation form, and LLP Agreement drafting."
  },
  "opc": {
    name: "One Person Company (OPC) Registration",
    tagline: "Full Corporate Status for Solo Founders with 100% Equity Ownership",
    description: "Incorporate a One Person Company with 1 Director, 1 Nominee, Digital Signature Certificate, SPICe+ Part A & B MCA approval, PAN, and TAN."
  },
  "partnership": {
    name: "Partnership Firm Registration",
    tagline: "Simple & Cost-Effective Business Setup for Co-Founders",
    description: "Structure a registered partnership firm under the Indian Partnership Act 1932. Includes partnership deed drafting, stamp paper execution, and PAN allotment."
  },
  "sole-proprietorship": {
    name: "Sole Proprietorship Business Setup",
    tagline: "Simplest Business Entry Point for Solo Entrepreneurs & Freelancers",
    description: "Establish your sole proprietorship business via MSME Udyam, GST, or Shop Act registrations for direct commercial bank account opening."
  },
  "section8": {
    name: "Section 8 NGO Company Registration",
    tagline: "India's Recognized Non-Profit Corporate Structure for Social Welfare",
    description: "Incorporate a Section 8 Non-Profit Company with Central Government INC-12 License, MOA/AOA approval, and 12A & 80G tax exemption guidance."
  },
  "producer-company": {
    name: "Producer Company Registration",
    tagline: "Corporate Structure for Agricultural Cooperatives & Farmer Collectives",
    description: "Incorporate a Producer Company under Companies Act 2013 for agricultural producers, farmers, and rural collectives."
  },
  "nidhi-company": {
    name: "Nidhi Company Registration",
    tagline: "Mutual Benefit Finance Entity for Savings & Lending Cooperatives",
    description: "Incorporate a Nidhi Company under MCA guidelines to cultivate savings habits and provide mutual benefit loans among members."
  },
  "public-ltd": {
    name: "Public Limited Company Registration",
    tagline: "Large-Scale Enterprise Structure Capable of Raising Public Capital",
    description: "Incorporate a Public Limited Company with minimum 3 Directors and 7 Shareholders for enterprise scale, stock exchange listing, and public capital."
  },
  "indian-subsidiary": {
    name: "Indian Subsidiary Company (FDI Incorporation)",
    tagline: "Establish a 100% Foreign Direct Investment Corporate Entity in India",
    description: "Incorporate an Indian Subsidiary for foreign parent companies, foreign nationals, or NRIs under RBI FDI regulations and MCA fast-track approval."
  },
  "virtual-office": {
    name: "Virtual Office Address for MCA & GST",
    tagline: "Prime Commercial Address for Company & GST Registration in Top Metros",
    description: "Rent a 100% MCA and GST-compliant virtual office address in prime business hubs across Bangalore, Mumbai, Delhi-NCR, Hyderabad, and Chennai."
  },

  // GST & Tax Compliances
  "gst-tax": {
    name: "GST Registration Services",
    tagline: "Get Official 15-Digit GSTIN Allotted Under GST Council Mandate",
    description: "Complete GST Portal profile setup, REG-01 application filing, e-KYC biometric verification, query response, and Form REG-06 GSTIN certificate issuance."
  },
  "gst-return-filing": {
    name: "GST Return Filing (GSTR-1 & GSTR-3B)",
    tagline: "Timely Monthly & Quarterly GST Compliance & Input Tax Credit (ITC) Matching",
    description: "Complete sales and purchase ledger reconciliation, GSTR-1 outward filing, GSTR-3B tax payment, and 2B ITC reconciliation by expert GST accountants."
  },
  "gstr9-annual-return": {
    name: "GSTR-9 & GSTR-9C Annual Return Filing",
    tagline: "Annual GST Financial Audit & Reconciliation Statement for Registered Businesses",
    description: "Comprehensive annual GST audit, turnover reconciliation, and statutory GSTR-9 return & GSTR-9C audit statement filing before GST tax authorities."
  },
  "gst-lut-filing": {
    name: "GST LUT Form Filing (Export Without Tax)",
    tagline: "Export Goods & Services Internationally Without Paying IGST Upfront",
    description: "File annual Letter of Undertaking (LUT) on the GST portal to export goods and services without cash outflow of IGST."
  },
  "gst-notice-resolution": {
    name: "GST Department Notice & Summons Resolution",
    tagline: "Expert CA Representation for GST Audit Queries, Mismatches & Demand Notices",
    description: "Draft professional legal replies to ASMT-10, DRC-01, and SCN department notices, and represent your business before GST tax authorities."
  },
  "income-tax-efiling": {
    name: "Income Tax Return (ITR) E-Filing",
    tagline: "Accurate Tax Filing for Individuals, Directors, Professionals & Businesses",
    description: "Filing of ITR-1, ITR-2, ITR-3, ITR-4, ITR-5, or ITR-6 with maximum tax savings, Form 26AS/AIS reconciliation, and fast refund processing."
  },
  "business-tax-filing": {
    name: "Corporate & Corporate Firm Tax Return Filing",
    tagline: "Statutory Income Tax Returns (ITR-5 / ITR-6) for Companies & LLPs",
    description: "Comprehensive business tax computation, tax audit report (Form 3CA/3CB-3CD) filing, and corporate income tax return submission."
  },
  "annual-compliance": {
    name: "ROC Annual Filing (AOC-4 & MGT-7)",
    tagline: "Mandatory Annual Financials & Annual Return Filings with MCA",
    description: "Complete secretarial drafting of Form AOC-4 (Balance Sheet & P&L) and Form MGT-7/MGT-7A (Annual Return) to avoid heavy ₹100/day MCA late penalties."
  },
  "dir3-kyc": {
    name: "DIR-3 KYC Director Verification",
    tagline: "Mandatory Annual Director Identification Number (DIN) Verification",
    description: "Annual DIR-3 KYC e-form filing or web-KYC OTP verification for all active DIN holders to prevent DIN deactivation."
  },
  "inc20a-commencement": {
    name: "Commencement of Business (Form INC-20A)",
    tagline: "Mandatory Declaration Required Within 180 Days of Incorporation",
    description: "File Form INC-20A declaration with ROC proving deposit of subscriber capital into company bank account to legally commence business operations."
  },
  "secretarial-audit": {
    name: "Secretarial Audit & Corporate Governance",
    tagline: "Independent Verification of Statutory Compliance & MCA Register Maintenance",
    description: "Comprehensive secretarial audit under Section 204 of Companies Act 2013, statutory register maintenance, and board governance review."
  },
  "change-company-name": {
    name: "MCA Company Name Change",
    tagline: "Rebrand Your Existing Company / LLP with MCA Name Reservation",
    description: "Change existing company or LLP name via RUN name application, special board resolution drafting, MGT-14 filing, and INC-24 new COI allotment."
  },
  "director-change": {
    name: "Director Addition & Resignation (DIR-12)",
    tagline: "Add New Directors or Process Director Resignations on MCA Portal",
    description: "Draft board resolutions, DIR-2 consent forms, resignation letters, and file Form DIR-12 with ROC within statutory deadlines."
  },
  "increase-authorized-capital": {
    name: "Increase Authorized Capital (Form SH-7)",
    tagline: "Expand Share Capital Ceiling to Issue New Shares to Investors",
    description: "Pass EGM special resolution, alter Memorandum of Association (Clause V), and file Form SH-7 with ROC to increase authorized share capital."
  },
  "change-registered-office": {
    name: "Registered Office Address Change (INC-22)",
    tagline: "Change Registered Address Within City, State, or ROC Jurisdiction",
    description: "File Form INC-22 with ROC for office address relocation, complete with rent agreements, utility bill proofs, and board resolutions."
  },
  "share-transfer-allotment": {
    name: "Share Transfer & Allotment (PAS-3 & SH-4)",
    tagline: "Execute Share Allotment to Investors or Transfer Equity Between Shareholders",
    description: "Draft share subscription agreements, execute SH-4 stamp duty payments, issue share certificates, and file Form PAS-3 with ROC."
  },

  // Government Licenses & Trade Registrations
  "fssai-registration": {
    name: "FSSAI Food License Registration",
    tagline: "Mandatory Food Safety Certification for Kitchens, Restaurants & Food Sellers",
    description: "Obtain official 14-digit FSSAI Food Safety Registration or License (Basic, State, Central) for onboarding on Swiggy, Zomato, and selling food."
  },
  "import-export-code": {
    name: "Import Export Code (IEC) Registration",
    tagline: "10-Digit DGFT License Required for International Imports & Exports",
    description: "Get your lifetime 10-digit Import Export Code allotment from DGFT to clear customs and handle foreign currency export payments."
  },
  "msme-registration": {
    name: "MSME / Udyam Certificate",
    tagline: "Unlock Collateral-Free Loans, Govt Subsidies & Tender Privileges",
    description: "Official Udyam MSME Registration under Ministry of MSME. Provides collateral-free bank loans (CGTMSE), lower interest rates, and 50% IP subsidies."
  },
  "shop-establishment-license": {
    name: "Shop & Commercial Establishment License",
    tagline: "Local Municipal License for Shops, Offices & Commercial Workspaces",
    description: "Obtain mandatory Shop & Establishment registration under state labour laws to operate commercial premises and open bank accounts."
  },
  "pf-esi-registration": {
    name: "EPF & ESIC Social Security Registration",
    tagline: "Employee Provident Fund & State Insurance Statutory Registration",
    description: "Obtain EPFO code and ESIC registration for employee social security, monthly return filings, and labour law compliance."
  },
  "professional-tax-license": {
    name: "Professional Tax (PT) License",
    tagline: "State-Level Tax Enrolment & Registration for Employers & Professionals",
    description: "Obtain Professional Tax Enrolment Certificate (PTEC) & Registration Certificate (PTRC) for employer payroll deductions."
  },
  "iso-certification": {
    name: "ISO Quality Certification (9001 / 27001)",
    tagline: "International Quality & Information Security Certification",
    description: "Provision of ISO 9001:2015 (Quality) and ISO 27001 (Information Security) certifications from accredited bodies for global tender eligibility."
  },
  "posh-compliance": {
    name: "POSH Act Policy & Workplace Compliance",
    tagline: "Internal Complaints Committee (ICC) Setup & POSH Compliance Policy",
    description: "Draft statutory Prevention of Sexual Harassment (POSH) policies, constitute Internal Complaints Committees, and conduct employee awareness sessions."
  },

  // Trademark & IP
  "trademark-registration": {
    name: "Trademark Registration (TM Class 1-45)",
    tagline: "Protect Your Brand Name, Logo & Slogan Across India",
    description: "Deep TM availability search, TM-A application drafting, MSME 50% fee subsidy advice, and e-filing with Controller General of Patents."
  },
  "trademark-objection": {
    name: "Trademark Objection Reply (MIS-R)",
    tagline: "Legal Defense Reply to Trademark Examination Report Objections",
    description: "Draft professional legal response to Section 9 (distinctiveness) or Section 11 (similar mark) examination objections raised by IP India registry."
  },
  "trademark-opposition": {
    name: "Trademark Opposition & Hearing Defense",
    tagline: "Represent Your Trademark in Hearing Arguments & Opposition Notices",
    description: "File counter-statements (Form TM-O), evidence in support of application, and represent your brand in formal hearings before the TM Registrar."
  },
  "copyright-registration": {
    name: "Copyright Registration",
    tagline: "Protect Software Code, Literary Works, Artistic Logos & Creative Assets",
    description: "File copyright application with Copyright Office to secure legal ownership over software code, website content, books, or creative assets."
  },
  "patent-filing": {
    name: "Patent Drafting & Provisional Application Filing",
    tagline: "Monopolize Novel Tech Inventions, Hardware Designs & Patent Claims",
    description: "Novelty search, Freedom to Operate (FTO) reports, provisional/complete specification drafting, and filing with Indian Patent Office."
  },

  // Enterprise Growth
  "virtual-cfo": {
    name: "Virtual CFO & Financial Advisory",
    tagline: "Senior CA Financial Leadership, MIS Dashboards & Unit Economics Control",
    description: "Senior-level Virtual CFO services for growing startups. Includes cash flow forecasting, MIS dashboards, tax optimization, and investor pitch support."
  },
  "startup-grants": {
    name: "Startup India Recognition & Tax Exemption",
    tagline: "DPIIT Recognition & Section 80-IAC 3-Year Income Tax Exemption",
    description: "Apply for official DPIIT Startup India recognition certificate, self-certification under 9 labour laws, and 80-IAC tax exemption certificate."
  },
  "12a-80g-registration": {
    name: "12A & 80G Tax Exemption Certificates for NGOs",
    tagline: "Provide 50% Tax Deductions to Donors & Claim Complete NGO Income Exemption",
    description: "Obtain Form 10A / 10AB provisional and final 12A & 80G certificates from Income Tax Department for non-profit entities."
  },
  "fcra-registration": {
    name: "FCRA Foreign Contribution Registration",
    tagline: "MHA License Required for NGOs to Receive Foreign Grants & Donations",
    description: "Apply for Foreign Contribution Regulation Act (FCRA) prior permission or 5-year registration certificate from Ministry of Home Affairs."
  }
};

export const servicesRegistry: ServiceItem[] = [
  {
    id: "pvt-ltd",
    name: "Private Limited Company Registration",
    category: "private-corporate",
    tagline: "India's Most Trusted Corporate Structure for Startups & Raised Capital",
    timeline: "7–10 Working Days",
    minDirectors: "2 Directors minimum",
    liability: "Limited Liability",
    taxBenefit: "Startup India 80-IAC",
    detailedAbout: "A Private Limited Company (Pvt Ltd) is India's premier corporate structure for startups, tech ventures, and growing SMEs. Governed by the Companies Act 2013 and Ministry of Corporate Affairs (MCA), it provides separate legal entity status, limited personal liability, perpetual succession, and the ability to raise institutional VC funding.",
    keyAdvantages: [
      "Separate legal entity status distinct from directors",
      "Limited personal liability protection for shareholders",
      "Easier to raise venture capital and angel funding",
      "Perpetual succession — company survives changes in leadership",
      "100% eligibility for Startup India tax exemptions (80-IAC)"
    ],
    badge: "Most Popular",
    expert: "INCroute Team",
    rating: 5,
    description: "The gold standard for startups and growing businesses.",
    popular: true,
    features: [
      "Separate legal entity status",
      "Limited liability protection",
      "Easier to raise startup capital"
    ],
    documents: [
      "PAN Card of all Directors & Shareholders",
      "Aadhaar Card or Passport / Voter ID",
      "Bank Statement / Utility Bill (latest 2 months)",
      "Passport size photographs",
      "Registered Office Proof (Electricity Bill + Landlord NOC)"
    ]
  },
  {
    id: "llp",
    name: "Limited Liability Partnership (LLP) Registration",
    category: "alternative-entity",
    tagline: "Combine Limited Liability Protection with Operational Partnership Flexibility",
    timeline: "10–15 Working Days",
    minDirectors: "2 Partners minimum",
    liability: "Limited Liability",
    taxBenefit: "Pass-Through Taxation",
    detailedAbout: "A Limited Liability Partnership (LLP) offers the benefits of limited liability protection while allowing partners internal operational flexibility. Governed under the Limited Liability Partnership Act 2008, it is highly popular for service businesses, professional agencies, CAs, lawyers, and consulting firms.",
    keyAdvantages: [
      "No mandatory minimum paid-up capital requirement",
      "Separate legal entity status protecting partner personal assets",
      "Significantly lower annual compliance burden than companies",
      "Flexible profit distribution without dividend distribution tax",
      "Tax deduction benefits on partner salaries and interest"
    ],
    badge: "Recommended",
    expert: "INCroute Team",
    rating: 5,
    description: "Flexibility of a partnership with corporate protection.",
    popular: false,
    features: [
      "No minimum capital requirement",
      "Pass-through internal governance",
      "Lower statutory compliance burden"
    ],
    documents: [
      "ID & Address proof of all designated partners",
      "NOC from owner of registered premises",
      "Stamped & Notarized LLP Partnership Agreement",
      "PAN card of all designated partners"
    ]
  },
  {
    id: "opc",
    name: "One Person Company (OPC) Registration",
    category: "private-corporate",
    tagline: "Full Corporate Status for Solo Founders with 100% Equity Ownership",
    timeline: "7–12 Working Days",
    minDirectors: "1 Director minimum",
    liability: "Limited Liability",
    taxBenefit: "Solo Corporate Tax",
    detailedAbout: "One Person Company (OPC) allows a single entrepreneur to operate a corporate entity with limited liability. Introduced under Companies Act 2013, it eliminates personal liability risk while providing full corporate tax benefits, credibility, and bank credit access.",
    keyAdvantages: [
      "100% equity ownership & single-founder control",
      "Limited liability protection for personal assets",
      "Separate legal corporate identity",
      "Simpler annual compliances compared to regular Pvt Ltd",
      "Nominee director mechanism ensuring seamless continuity"
    ],
    badge: "Solo Founders",
    expert: "INCroute Team",
    rating: 4.8,
    description: "Solo founder? Get full corporate protection alone.",
    popular: false,
    features: [
      "Single founder corporate structure",
      "Limited personal liability protection",
      "Corporate tax rates & bank credibility"
    ],
    documents: [
      "PAN and Aadhaar of the sole Director",
      "PAN and Aadhaar of the designated Nominee director",
      "Registered office electricity bill",
      "Signed Consent Form of Nominee (Form INC-3)"
    ]
  },
  {
    id: "gst-return-filing",
    name: "GST Return Filing (GSTR-1 & GSTR-3B)",
    category: "compliance",
    tagline: "Timely Monthly & Quarterly GST Compliance & Input Tax Credit (ITC) Matching",
    timeline: "Monthly / Quarterly",
    minDirectors: "GST Accountant Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Maximized ITC Claim",
    detailedAbout: "Complete GST return filing services by certified tax accountants. Includes invoice ledger reconciliation, GSTR-1 outward sales reporting, GSTR-3B tax payment computation, 2B ITC reconciliation, and avoiding heavy late filing penalties on the GST Common Portal.",
    keyAdvantages: [
      "Maximize Input Tax Credit (ITC) with automated 2B invoice reconciliation",
      "Prevent GSTIN cancellation or blocking of e-way bill portals",
      "Avoid heavy ₹50/day late filing penalties under GST Act",
      "Expert assistance in resolving supplier ITC mismatches",
      "Dedicated tax manager for monthly compliance management"
    ],
    badge: "Monthly Compliance",
    expert: "INCroute Tax Team",
    rating: 4.9,
    description: "Timely GSTR-1 & GSTR-3B filing with 2B ITC reconciliation.",
    popular: true,
    features: [
      "GSTR-1 Outward Sales Filing",
      "GSTR-3B Tax Computation & Filing",
      "GSTR-2B Input Tax Credit Reconciliation"
    ],
    documents: [
      "Sales & Outward Supply Invoices",
      "Purchase Invoices & Debit/Credit Notes",
      "GST Portal Login Credentials",
      "Bank Account Statement for month"
    ]
  },
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship Business Setup",
    category: "alternative-entity",
    tagline: "Simplest Business Entry Point for Solo Entrepreneurs & Freelancers",
    timeline: "3–5 Working Days",
    minDirectors: "1 Proprietor",
    liability: "Unlimited Liability",
    taxBenefit: "Individual Slab Rate",
    detailedAbout: "A Sole Proprietorship is the simplest, most popular unorganized business structure in India for single-owner operations, consultants, and local trade. Setup requires obtaining official government registrations like MSME Udyam, GST, or Shop Act to open a current bank account in the business firm name.",
    keyAdvantages: [
      "Zero compliance overhead — no mandatory annual MCA filings",
      "100% single owner decision control and profit retention",
      "Quickest 3-day turnaround time for bank account opening",
      "Lowest initial capital & registration cost",
      "Easy to convert later into a Private Limited Company or LLP"
    ],
    badge: "Easiest Setup",
    expert: "INCroute Team",
    rating: 4.7,
    description: "Simplest structure for single founders & freelancers.",
    popular: true,
    features: [
      "Single proprietor ownership",
      "MSME Udyam registration included",
      "Current bank account opening assistance"
    ],
    documents: [
      "PAN Card & Aadhaar Card of Proprietor",
      "Utility Bill (Electricity/Gas) of Business Premises",
      "Rent Agreement / Ownership Proof + NOC",
      "Passport size Photograph"
    ]
  },
  {
    id: "partnership",
    name: "Partnership Firm Registration",
    category: "alternative-entity",
    tagline: "Simple & Cost-Effective Business Setup for Co-Founders",
    timeline: "3–7 Working Days",
    minDirectors: "2 Partners minimum",
    liability: "Unlimited Joint Liability",
    taxBenefit: "Flat 30% Tax Rate",
    detailedAbout: "A Partnership Firm under the Indian Partnership Act 1932 is formed by two or more partners executing a legal Partnership Deed. It allows partners to pool resources, share operational responsibilities, and distribute profits according to agreed terms with minimal statutory disclosures.",
    keyAdvantages: [
      "Customizable Partnership Deed defining roles & profit shares",
      "No mandatory minimum capital requirement",
      "Lower registration and compliance cost compared to corporate entities",
      "Deduction benefits on partner interest and salary payments",
      "Fast execution via Registrar of Firms (ROF) notarization"
    ],
    badge: "Co-Founder Entry",
    expert: "INCroute Legal Team",
    rating: 4.8,
    description: "Traditional partnership for 2+ co-founders.",
    popular: false,
    features: [
      "Partnership Deed Drafting",
      "ROF Notarization & Registration",
      "Firm PAN Card Allotment"
    ],
    documents: [
      "PAN Card & Aadhaar Card of all Partners",
      "Address Proof of Business Premises (Utility Bill)",
      "NOC from Property Owner",
      "Partnership Deed Executed on Stamp Paper"
    ]
  },
  {
    id: "section8",
    name: "Section 8 NGO Company Registration",
    category: "private-corporate",
    tagline: "India's Recognized Non-Profit Corporate Structure for Social Welfare",
    timeline: "15–20 Working Days",
    minDirectors: "2 Directors minimum",
    liability: "Limited Liability",
    taxBenefit: "12A & 80G Tax Exemption",
    detailedAbout: "A Section 8 Company is registered under the Companies Act 2013 for promoting commerce, art, science, education, research, charity, or environmental protection. Profits are applied solely toward social objectives without paying dividends to members, granting high corporate credibility for CSR grants.",
    keyAdvantages: [
      "High corporate credibility for receiving corporate CSR funds",
      "Eligible for complete Income Tax exemption under 12A & 80G",
      "No minimum capital requirement & no micro-stamp duty on MOA/AOA",
      "Exempted from using 'Limited' or 'Private Limited' in company name",
      "Perpetual corporate entity status distinct from founders"
    ],
    badge: "Non-Profit",
    expert: "INCroute NGO Desk",
    rating: 4.9,
    description: "Gold standard structure for social enterprises & NGOs.",
    popular: false,
    features: [
      "Central Govt INC-12 License",
      "MOA & AOA Non-Profit Drafting",
      "CSR & Donation Eligibility"
    ],
    documents: [
      "PAN & Aadhaar of minimum 2 Directors & Shareholders",
      "Social Objective Project Plan & 3-Year Estimated Budget",
      "Registered Office Proof (Electricity Bill + NOC)",
      "Digital Signature Certificates (DSC)"
    ]
  },
  {
    id: "producer-company",
    name: "Producer Company Registration",
    category: "private-corporate",
    tagline: "Corporate Structure for Agricultural Cooperatives & Farmer Collectives",
    timeline: "15–25 Working Days",
    minDirectors: "5 Directors minimum",
    liability: "Limited Liability",
    taxBenefit: "Agri Tax Concessions",
    detailedAbout: "A Producer Company is a body corporate formed by primary agricultural producers, farmers, milk collectors, or handloom artisans under Section 378B of the Companies Act 2013. It combines the benefits of corporate governance with cooperative mutual assistance.",
    keyAdvantages: [
      "Enables small farmers to scale production & direct market access",
      "Eligible for NABARD & SFAC government agricultural subsidies",
      "100% tax exemption on agricultural income under IT Act",
      "Patronage bonus & dividend distribution to producer members",
      "Limited liability protection for all participating farmers"
    ],
    badge: "Agri Cooperatives",
    expert: "INCroute Agri Desk",
    rating: 4.8,
    description: "Empowering agricultural collectives & farmer groups.",
    popular: false,
    features: [
      "Minimum 10 Producer Members / 5 Directors",
      "NABARD & SFAC Subsidy Eligibility",
      "Corporate MCA Farmer Structure"
    ],
    documents: [
      "7/12 Land Extract or Khasra/Khatoni agri proof of 10 members",
      "PAN Card & Aadhaar Card of all 5 Directors",
      "Registered Office Proof & NOC",
      "DSC of all proposed Directors"
    ]
  },
  {
    id: "nidhi-company",
    name: "Nidhi Company Registration",
    category: "private-corporate",
    tagline: "Mutual Benefit Finance Entity for Savings & Lending Cooperatives",
    timeline: "15–20 Working Days",
    minDirectors: "3 Directors minimum",
    liability: "Limited Liability",
    taxBenefit: "Mutual Exemption",
    detailedAbout: "A Nidhi Company is a non-banking financial entity registered under Section 406 of the Companies Act 2013 and Nidhi Rules 2014. It cultivates the habit of thrift and savings among its members, accepting deposits from and lending exclusively to its registered members.",
    keyAdvantages: [
      "No RBI approval required — governed directly under MCA Nidhi Rules",
      "Secured lending against gold, property, and fixed deposits",
      "Cultivates mutual financial assistance and local community credit",
      "Limited liability corporate structure for member funds",
      "Lower capital entry threshold compared to regular NBFC licenses"
    ],
    badge: "Community Finance",
    expert: "INCroute NBFC Desk",
    rating: 4.7,
    description: "Mutual savings & lending entity without RBI NBFC license.",
    popular: false,
    features: [
      "Minimum 3 Directors & 7 Shareholders",
      "Member-only Deposit & Loan Structure",
      "MCA NDH Form Compliance Setup"
    ],
    documents: [
      "PAN Card & Aadhaar Card of 3 Directors & 7 Shareholders",
      "Net Owned Funds Certificate & Registered Office Proof",
      "DSC of all Directors",
      "Bank Statements & Passport Photos"
    ]
  },
  {
    id: "public-ltd",
    name: "Public Limited Company Registration",
    category: "private-corporate",
    tagline: "Large-Scale Enterprise Structure Capable of Raising Public Capital",
    timeline: "15–25 Working Days",
    minDirectors: "3 Directors minimum",
    liability: "Limited Liability",
    taxBenefit: "Enterprise Surcharge Rates",
    detailedAbout: "A Public Limited Company is a corporate entity formed by minimum 3 Directors and 7 Shareholders. It offers maximum capital expansion capability, public stock exchange listing potential (NSE/BSE), and institutional debt credibility for large enterprise projects.",
    keyAdvantages: [
      "Unlimited capability to issue shares & raise public equity",
      "Freely transferable shares without restrictive transfer clauses",
      "Maximum prestige and credibility with institutional banks & vendors",
      "Eligible for IPO listing on BSE, NSE, or SME exchanges",
      "Perpetual succession & large enterprise scale governance"
    ],
    badge: "Enterprise Scale",
    expert: "INCroute Corporate Desk",
    rating: 4.9,
    description: "Enterprise scale structure for public listing & large capital.",
    popular: false,
    features: [
      "Minimum 3 Directors & 7 Shareholders",
      "Freely Transferable Shares",
      "IPO & Stock Exchange Ready"
    ],
    documents: [
      "PAN & Aadhaar of all 3 Directors & 7 Shareholders",
      "Registered Office Utility Bill + Landlord NOC",
      "Digital Signatures (DSC) for all Directors",
      "MOA & AOA Public Drafts"
    ]
  },
  {
    id: "indian-subsidiary",
    name: "Indian Subsidiary Company (FDI Incorporation)",
    category: "private-corporate",
    tagline: "Establish a 100% Foreign Direct Investment Corporate Entity in India",
    timeline: "10–15 Working Days",
    minDirectors: "2 Directors (1 Resident)",
    liability: "Limited Liability",
    taxBenefit: "FDI Tax Slabs",
    detailedAbout: "An Indian Subsidiary allows foreign parent companies, foreign nationals, or NRIs to incorporate a 100% Foreign Direct Investment (FDI) company in India under the fast-track MCA SPICe+ process and RBI Automatic Route guidelines.",
    keyAdvantages: [
      "100% FDI permitted under RBI Automatic Route for most sectors",
      "Full corporate limited liability status in India",
      "Repatriation of profits & dividends back to foreign parent company",
      "Access to India's 1.4B market & technical talent pool",
      "Single-window approval for PAN, TAN, GST, and corporate bank account"
    ],
    badge: "FDI Fast-Track",
    expert: "INCroute Global Desk",
    rating: 5,
    description: "Fast-track incorporation for foreign companies & NRIs.",
    popular: true,
    features: [
      "100% Foreign Direct Investment (FDI)",
      "Apostille & Embassy Attestation Support",
      "RBI & MCA Statutory Compliance"
    ],
    documents: [
      "Apostilled / Notarized Passport of Foreign Director/Shareholder",
      "Board Resolution from Foreign Parent Company",
      "Proof of Registered Premises in India + NOC",
      "Address Proof of Local Resident Director in India"
    ]
  },
  {
    id: "virtual-office",
    name: "Virtual Office Address for MCA & GST",
    category: "enterprise-growth",
    tagline: "Prime Commercial Address for Company & GST Registration in Top Metros",
    timeline: "24–48 Hours",
    minDirectors: "Instant Access",
    liability: "100% Compliant",
    taxBenefit: "Zero Office Capex",
    detailedAbout: "Get a 100% MCA and GST-compliant virtual office address in prime commercial business hubs across Bangalore, Mumbai, Delhi-NCR, Hyderabad, Chennai, Pune, and Kolkata. Includes official Rent Agreement, Landlord NOC, Utility Bill, and mail handling.",
    keyAdvantages: [
      "Save 90% on commercial real estate rent & office lease capex",
      "100% verified for GST department physical inspection & MCA COI",
      "Includes Rent Agreement, NOC, and Utility Bill in your firm name",
      "Prime business address in top tier-1 metro business parks",
      "Dedicated mail forwarding & desk space allocation for verification"
    ],
    badge: "Instant Approval",
    expert: "INCroute Property Desk",
    rating: 4.9,
    description: "Prime business address for GST & MCA in top metro hubs.",
    popular: true,
    features: [
      "GST & MCA Compliant NOC & Rent Agreement",
      "Metro Business Hub Locations",
      "Mail Forwarding & Desk Verification"
    ],
    documents: [
      "PAN Card & Aadhaar Card of Authorized Representative",
      "Incorporation Certificate / Proposed Business Name",
      "GSTIN details (if existing entity)"
    ]
  },
  {
    id: "gst-tax",
    name: "GST Registration Services",
    category: "compliance",
    tagline: "Get Official 15-Digit GSTIN Allotted Under GST Council Mandate",
    timeline: "3–5 Working Days",
    minDirectors: "GST Tax Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Input Tax Credit Claims",
    detailedAbout: "Complete GST Portal profile setup, REG-01 application submission, e-KYC biometric verification coordination, query response, and Form REG-06 GSTIN certificate issuance by expert GST tax consultants.",
    keyAdvantages: [
      "Mandatory for B2B supply, inter-state trade, and e-commerce selling",
      "Claim Input Tax Credit (ITC) on all business purchases and expenses",
      "Enhance business credibility with verified 15-digit GSTIN",
      "Seamless registration for Regular, Composition, or SEZ units",
      "Avoid heavy penalties for operating without GSTIN above thresholds"
    ],
    badge: "Essential Tax",
    expert: "INCroute GST Desk",
    rating: 5,
    description: "Official 15-digit GSTIN allotment for regular & composition units.",
    popular: true,
    features: [
      "Form REG-01 Application E-Filing",
      "Biometric e-KYC & Officer Query Handling",
      "Form REG-06 GSTIN Certificate Allotment"
    ],
    documents: [
      "PAN Card & Aadhaar of Business Owner / Directors",
      "Proof of Registered Premises (Electricity Bill / Rent Agreement)",
      "Landlord No Objection Certificate (NOC)",
      "Cancelled Cheque / Bank Account Details"
    ]
  },
  {
    id: "gstr9-annual-return",
    name: "GSTR-9 & GSTR-9C Annual Return Filing",
    category: "compliance",
    tagline: "Annual GST Financial Audit & Reconciliation Statement for Registered Businesses",
    timeline: "7–10 Working Days",
    minDirectors: "Senior CA Lead",
    liability: "Audit Compliance",
    taxBenefit: "Tax Leakage Prevention",
    detailedAbout: "Comprehensive annual GST audit, turnover reconciliation, and statutory GSTR-9 return & GSTR-9C audit statement filing before GST tax authorities to prevent demand notices and reconciliations mismatch penalties.",
    keyAdvantages: [
      "Complete reconciliation of GSTR-1, GSTR-3B, and Audited Financial Statements",
      "Identify and rectify unclaimed Input Tax Credit (ITC) before annual deadline",
      "Prevent tax department audits, ASMT-10 notices, and demand orders",
      "Professional CA certification of turnover reconciliation",
      "Peace of mind with zero mismatch liability"
    ],
    badge: "Annual Audit",
    expert: "INCroute Audit Desk",
    rating: 4.9,
    description: "Annual GST audit & GSTR-9/9C reconciliation by CAs.",
    popular: false,
    features: [
      "GSTR-1 vs 3B vs 2B Mismatch Audit",
      "Turnover & Tax Ledger Reconciliation",
      "GSTR-9 & 9C Certification E-Filing"
    ],
    documents: [
      "Audited Balance Sheet & P&L Statement",
      "Monthly GSTR-1 & 3B Filed Summary",
      "GST Portal Login Credentials",
      "Purchase & Sales Register Data"
    ]
  },
  {
    id: "gst-lut-filing",
    name: "GST LUT Form Filing (Export Without Tax)",
    category: "compliance",
    tagline: "Export Goods & Services Internationally Without Paying IGST Upfront",
    timeline: "24–48 Hours",
    minDirectors: "Instant E-Filing",
    liability: "Statutory Exemption",
    taxBenefit: "Zero IGST Outflow",
    detailedAbout: "File annual Letter of Undertaking (LUT) under Form GST RFD-11 on the GST portal to export goods and services internationally without paying IGST upfront, maintaining healthy business working capital.",
    keyAdvantages: [
      "Save cash working capital by avoiding upfront 18% IGST payment on exports",
      "Valid for full financial year across all international exports",
      "Eliminates lengthy tax refund claim procedures with tax authorities",
      "Fast 24-hour ARN allotment on GST portal",
      "Essential for IT exporters, freelancers, and merchant exporters"
    ],
    badge: "Exporters Special",
    expert: "INCroute Export Desk",
    rating: 4.9,
    description: "Export goods & services without paying IGST upfront.",
    popular: true,
    features: [
      "Form GST RFD-11 E-Filing",
      "Instant ARN & Exemption Letter Allotment",
      "Annual Financial Year Exemption"
    ],
    documents: [
      "GSTIN Credentials & PAN Card",
      "Details of 2 Independent Witnesses",
      "Export IEC Code (if applicable)"
    ]
  },
  {
    id: "income-tax-efiling",
    name: "Income Tax Return (ITR) E-Filing",
    category: "compliance",
    tagline: "Accurate Tax Filing for Individuals, Directors, Professionals & Businesses",
    timeline: "1–3 Working Days",
    minDirectors: "Tax Expert Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Maximized Refund",
    detailedAbout: "Filing of ITR-1, ITR-2, ITR-3, ITR-4, ITR-5, or ITR-6 with maximum tax savings, Form 26AS/AIS reconciliation, deduction claims (80C, 80D, 80G), and fast refund processing by certified tax experts.",
    keyAdvantages: [
      "Maximize tax refund by claiming all eligible deductions & exemptions",
      "Complete Form 26AS, AIS, and TIS income reconciliation",
      "Avoid late filing fee of up to ₹5,000 under Section 234F",
      "Essential for home loan approvals, visa applications, and credit cards",
      "Dedicated tax expert to review capital gains & foreign assets"
    ],
    badge: "Essential Filing",
    expert: "INCroute Tax Desk",
    rating: 5,
    description: "Maximize tax refunds & Form 26AS/AIS reconciliation.",
    popular: true,
    features: [
      "Form 26AS & AIS Reconciliation",
      "Maximized Deduction Claims",
      "Instant E-Verification Assistance"
    ],
    documents: [
      "Form 16 / Form 16A from Employer / Clients",
      "Bank Account Statements & Interest Certificates",
      "Investment Proofs (PPF, ELSS, Insurance, NPS)",
      "PAN Card & Aadhaar Card"
    ]
  },
  {
    id: "business-tax-filing",
    name: "Corporate & Corporate Firm Tax Return Filing",
    category: "compliance",
    tagline: "Statutory Income Tax Returns (ITR-5 / ITR-6) for Companies & LLPs",
    timeline: "5–7 Working Days",
    minDirectors: "Senior CA Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Loss Carry Forward",
    detailedAbout: "Comprehensive business tax computation, tax audit report (Form 3CA/3CB-3CD) filing, MAT computation, and corporate income tax return submission under IT Act 1961 for Private Limited Companies, LLPs, and Firms.",
    keyAdvantages: [
      "Safely carry forward business & capital losses up to 8 assessment years",
      "100% compliance with Section 44AB tax audit statutory thresholds",
      "Accurate computation of Minimum Alternate Tax (MAT) / 115BAA concessional rate",
      "Avoid 1% per month interest under Section 234A/B/C for late payment",
      "Verified CA audit reports and electronic signatures"
    ],
    badge: "Corporate Tax",
    expert: "INCroute Audit Desk",
    rating: 4.9,
    description: "Corporate tax return (ITR-5/6) & Form 3CD tax audit by CAs.",
    popular: false,
    features: [
      "ITR-5 & ITR-6 Corporate E-Filing",
      "Form 3CA/3CD Tax Audit Reports",
      "Loss Carry-Forward Optimization"
    ],
    documents: [
      "Audited Balance Sheet & Profit & Loss Statement",
      "Form 26AS, AIS, and TDS Certificates",
      "Bank Account Statements & Loan Registers",
      "Digital Signature Certificate (DSC) of Director"
    ]
  },
  {
    id: "annual-compliance",
    name: "ROC Annual Filing (AOC-4 & MGT-7)",
    category: "compliance",
    tagline: "Mandatory Annual Financials & Annual Return Filings with MCA",
    timeline: "5–7 Working Days",
    minDirectors: "Company Secretary Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Clean Compliance Rating",
    detailedAbout: "Complete secretarial drafting of Form AOC-4 (Balance Sheet & P&L) and Form MGT-7/MGT-7A (Annual Return) to avoid heavy ₹100/day MCA late penalties and director disqualification under Section 164.",
    keyAdvantages: [
      "Avoid heavy MCA late fees of ₹100 per day per form with zero cap",
      "Prevent Director DIN disqualification & company status update to Strike-Off",
      "Draft mandatory Board Reports, MGT-9, and AGM Notices",
      "Maintain active, good-standing status on MCA Master Data portal",
      "Seamless execution by certified Practicing Company Secretaries (PCS)"
    ],
    badge: "Mandatory Annual",
    expert: "INCroute Secretarial Desk",
    rating: 4.9,
    description: "File AOC-4 & MGT-7 to avoid ₹100/day MCA penalties.",
    popular: true,
    features: [
      "Form AOC-4 Financial Statement E-Filing",
      "Form MGT-7 / MGT-7A Annual Return E-Filing",
      "Board Report & AGM Notice Secretarial Drafting"
    ],
    documents: [
      "Audited Financial Statements (Balance Sheet & P&L)",
      "Auditor's Report & Notes to Accounts",
      "List of Shareholders & Share Transfer Register",
      "DSC of active Director & Practicing CS"
    ]
  },
  {
    id: "dir3-kyc",
    name: "DIR-3 KYC Director Verification",
    category: "compliance",
    tagline: "Mandatory Annual Director Identification Number (DIN) Verification",
    timeline: "24–48 Hours",
    minDirectors: "Instant E-Filing",
    liability: "DIN Active Status",
    taxBenefit: "Prevent DIN Deactivation",
    detailedAbout: "Annual DIR-3 KYC e-form filing or web-KYC OTP verification for all active DIN holders to prevent DIN deactivation and a steep ₹5,000 government penalty under MCA rules.",
    keyAdvantages: [
      "Prevent DIN status deactivation to 'Deactivated due to non-filing of DIR-3 KYC'",
      "Avoid flat ₹5,000 MCA late fee penalty per director",
      "Instant web-KYC OTP verification for recurring directors",
      "Essential for signing annual MCA forms and board resolutions",
      "Fast 24-hour approval & SRN receipt generation"
    ],
    badge: "Director Mandatory",
    expert: "INCroute Secretarial Desk",
    rating: 4.9,
    description: "Annual DIN verification to avoid ₹5,000 MCA penalty.",
    popular: true,
    features: [
      "Web-KYC Dual OTP Verification",
      "DIR-3 KYC E-Form Filing with DSC",
      "Instant SRN Receipt Allotment"
    ],
    documents: [
      "PAN Card & Aadhaar Card of Director",
      "Mobile Number & Personal Email ID (for OTPs)",
      "Proof of Personal Address (Utility Bill / Passport)",
      "Digital Signature Certificate (if e-form required)"
    ]
  },
  {
    id: "inc20a-commencement",
    name: "Commencement of Business (Form INC-20A)",
    category: "compliance",
    tagline: "Mandatory Declaration Required Within 180 Days of Incorporation",
    timeline: "24–48 Hours",
    minDirectors: "Fast E-Filing",
    liability: "Statutory Clearance",
    taxBenefit: "Commence Operations",
    detailedAbout: "File Form INC-20A declaration with ROC proving deposit of subscriber capital into the company bank account within 180 days of incorporation to legally commence business operations and exercise borrowing powers.",
    keyAdvantages: [
      "Mandatory requirement before initiating business operations or loans",
      "Avoid heavy MCA late fees and company strike-off proceedings",
      "Allows seamless filing of subsequent MCA forms and share allotments",
      "100% online verification of bank deposit proof",
      "Practicing CA/CS certification included"
    ],
    badge: "Post-Incorporation",
    expert: "INCroute Secretarial Desk",
    rating: 4.8,
    description: "File within 180 days of incorporation to start operations.",
    popular: true,
    features: [
      "Form INC-20A Declaration E-Filing",
      "Bank Share Capital Verification",
      "Practicing CS Certification"
    ],
    documents: [
      "Bank Statement showing subscriber capital deposit",
      "Certificate of Incorporation (COI)",
      "Registered Office Photo with Director",
      "DSC of Director"
    ]
  },
  {
    id: "fssai-registration",
    name: "FSSAI Food License Registration",
    category: "compliance",
    tagline: "Mandatory Food Safety Certification for Kitchens, Restaurants & Food Sellers",
    timeline: "3–7 Working Days",
    minDirectors: "Food Safety Lead",
    liability: "Statutory License",
    taxBenefit: "Swiggy/Zomato Onboarding",
    detailedAbout: "Obtain official 14-digit FSSAI Food Safety Registration or License (Basic, State, Central) for onboarding on Swiggy, Zomato, Amazon, and operating food manufacturing, cloud kitchens, restaurants, or retail outlets.",
    keyAdvantages: [
      "Mandatory 14-digit FBO license number for food packaging & menus",
      "Required for instant onboarding on Swiggy, Zomato & Blinkit",
      "Build consumer trust with verified FSSAI food safety mark",
      "Custom application for Basic (up to 12L), State (up to 20Cr), or Central",
      "Avoid heavy health department fines & premises closure notices"
    ],
    badge: "Food Operators",
    expert: "INCroute FSSAI Desk",
    rating: 4.9,
    description: "Obtain 14-digit FSSAI license for cloud kitchens & restaurants.",
    popular: true,
    features: [
      "FSSAI FoSCoS Portal E-Filing",
      "Basic, State & Central License Options",
      "14-Digit FSSAI Certificate Allotment"
    ],
    documents: [
      "PAN Card & Aadhaar Card of Food Business Operator (FBO)",
      "Proof of Premises Address (Rent Agreement / Utility Bill)",
      "List of Food Categories / Products to be manufactured or sold",
      "Blueprint / Layout Plan of Premises (for State/Central)"
    ]
  },
  {
    id: "import-export-code",
    name: "Import Export Code (IEC) Registration",
    category: "compliance",
    tagline: "10-Digit DGFT License Required for International Imports & Exports",
    timeline: "24–48 Hours",
    minDirectors: "Instant Allotment",
    liability: "Lifetime Validity",
    taxBenefit: "Global Trade Access",
    detailedAbout: "Get your lifetime 10-digit Import Export Code (IEC) allotment from the Directorate General of Foreign Trade (DGFT) to clear Indian customs, send international shipments, and receive foreign currency export payments.",
    keyAdvantages: [
      "Lifetime validity — zero annual renewal fee required",
      "Mandatory 10-digit code for clearing customs and bank Forex payments",
      "Unlocks export incentive schemes like RoDTEP, MEIS, and SEIS",
      "No compliance returns required solely for holding IEC",
      "Fast 24-hour online DGFT portal allotment"
    ],
    badge: "Global Trade",
    expert: "INCroute DGFT Desk",
    rating: 5,
    description: "Lifetime 10-digit DGFT code for international import/export.",
    popular: true,
    features: [
      "DGFT E-IEC Online Application",
      "Instant 10-Digit IEC Certificate Allotment",
      "Lifetime Validity Access"
    ],
    documents: [
      "PAN Card of Business Entity / Proprietor",
      "Aadhaar / Voter ID / Passport of Applicant",
      "Cancelled Cheque / Bank Certificate of Entity",
      "Proof of Business Address (Utility Bill / Rent Agreement)"
    ]
  },
  {
    id: "msme-registration",
    name: "MSME / Udyam Certificate",
    category: "compliance",
    tagline: "Unlock Collateral-Free Loans, Govt Subsidies & Tender Privileges",
    timeline: "24 Hours",
    minDirectors: "Instant Allotment",
    liability: "Government Perks",
    taxBenefit: "50% IP Subsidies",
    detailedAbout: "Official Udyam MSME Registration under Ministry of MSME. Provides collateral-free bank loans (CGTMSE), lower interest rate concessions, 50% discount on trademark fees, and tender privileges for micro, small, and medium enterprises.",
    keyAdvantages: [
      "50% discount on government fees for Trademark & Patent applications",
      "Eligible for collateral-free credit under CGTMSE scheme",
      "1% interest rate exemption on bank overdrafts & enterprise loans",
      "Protection against delayed payments under MSMED Act 45-day rule",
      "Exemption from EMD security deposits in government tenders"
    ],
    badge: "Govt Subsidies",
    expert: "INCroute MSME Desk",
    rating: 5,
    description: "Unlock collateral-free bank loans & 50% TM fee discounts.",
    popular: true,
    features: [
      "Udyam Portal Registration",
      "Instant Certificate Download",
      "Lifetime MSME Recognition"
    ],
    documents: [
      "Aadhaar Card linked with Mobile Number",
      "PAN Card of Business / Proprietor",
      "GSTIN (if applicable)",
      "Bank Account Details"
    ]
  },
  {
    id: "shop-establishment-license",
    name: "Shop & Commercial Establishment License",
    category: "compliance",
    tagline: "Local Municipal License for Shops, Offices & Commercial Workspaces",
    timeline: "3–5 Working Days",
    minDirectors: "Municipal Desk",
    liability: "Labour Compliance",
    taxBenefit: "Bank Account Opening",
    detailedAbout: "Obtain mandatory Shop & Commercial Establishment registration (Gumasta License / Shop Act) under state labor department rules to operate commercial premises, employ staff, and open current bank accounts.",
    keyAdvantages: [
      "Mandatory legal proof of business operations for commercial premises",
      "Primary document accepted by banks for opening commercial bank accounts",
      "Regulates employee working hours, weekly off, and workplace safety",
      "Avoid municipal inspector queries and spot penalty notices",
      "Seamless online state portal registration"
    ],
    badge: "Local Premises",
    expert: "INCroute Labour Desk",
    rating: 4.8,
    description: "Mandatory municipal registration for shops & commercial offices.",
    popular: false,
    features: [
      "State Labour Department E-Filing",
      "Shop Act / Gumasta Certificate Allotment",
      "Commercial Premises Legal Clearance"
    ],
    documents: [
      "PAN & Aadhaar of Proprietor / Partners / Directors",
      "Address Proof of Shop/Office (Utility Bill)",
      "Rent Agreement + Landlord NOC",
      "Photo of Shop/Office Entrance with Nameboard"
    ]
  },
  {
    id: "pf-esi-registration",
    name: "EPF & ESIC Social Security Registration",
    category: "compliance",
    tagline: "Employee Provident Fund & State Insurance Statutory Registration",
    timeline: "3–5 Working Days",
    minDirectors: "Payroll Lead",
    liability: "Statutory Compliance",
    taxBenefit: "Employee Retention",
    detailedAbout: "Obtain EPFO code and ESIC registration for employee social security, monthly return filings, medical benefits, and labor law compliance when staff count crosses statutory thresholds.",
    keyAdvantages: [
      "Mandatory compliance for entities employing 10+ (ESIC) or 20+ (EPF) staff",
      "Provide health insurance & retirement savings to your workforce",
      "Avoid heavy labour court penalties & damages under PF/ESI Acts",
      "Single-window Shram Suvidha portal registration",
      "Monthly ECR return filing assistance"
    ],
    badge: "Labor Compliance",
    expert: "INCroute Payroll Desk",
    rating: 4.8,
    description: "Obtain EPFO & ESIC employer registration for payroll.",
    popular: false,
    features: [
      "Shram Suvidha Portal Setup",
      "EPFO Code & ESIC Employer Registration",
      "Monthly ECR Filing Guidance"
    ],
    documents: [
      "Certificate of Incorporation / Registration Proof",
      "PAN Card & Aadhaar Card of Directors / Partners",
      "List of Employees with Joining Dates & Salaries",
      "Cancelled Cheque & Premises Address Proof"
    ]
  },
  {
    id: "professional-tax-license",
    name: "Professional Tax (PT) License",
    category: "compliance",
    tagline: "State-Level Tax Enrolment & Registration for Employers & Professionals",
    timeline: "3–5 Working Days",
    minDirectors: "Tax Lead",
    liability: "State Tax Mandate",
    taxBenefit: "Payroll Deductions",
    detailedAbout: "Obtain Professional Tax Enrolment Certificate (PTEC) & Registration Certificate (PTRC) for employer payroll deductions under state commercial tax department mandates.",
    keyAdvantages: [
      "Mandatory for employing staff or carrying on trade in non-exempt states",
      "PTEC for business entity & PTRC for deducting tax from employee salaries",
      "Avoid monthly 1.25% interest & non-filing penalties",
      "Essential for corporate bank compliance & audit readiness",
      "Fast state-specific portal execution"
    ],
    badge: "State Tax",
    expert: "INCroute Tax Desk",
    rating: 4.7,
    description: "PTEC & PTRC registration for employer payroll deductions.",
    popular: false,
    features: [
      "PTEC Enrolment Certificate",
      "PTRC Employer Registration",
      "State Tax Return Filing Support"
    ],
    documents: [
      "Entity PAN Card & Incorporation Certificate",
      "PAN & Aadhaar of Directors / Proprietor",
      "Address Proof of Business Premises",
      "Bank Account Details & Employee List"
    ]
  },
  {
    id: "trademark-registration",
    name: "Trademark Registration (TM Class 1-45)",
    category: "legal-ip",
    tagline: "Protect Your Brand Name, Logo & Slogan Across India",
    timeline: "24 Hours TM-A (12-18 Months Final ®)",
    minDirectors: "IP Attorney Lead",
    liability: "Exclusive Ownership",
    taxBenefit: "50% MSME Fee Subsidy",
    detailedAbout: "Deep TM availability search, TM-A application drafting, MSME 50% government fee subsidy advice, and e-filing with Controller General of Patents, Designs and Trademarks. Start using ™ symbol within 24 hours.",
    keyAdvantages: [
      "Start using ™ symbol on your brand name & logo immediately after filing",
      "Monopolize exclusive brand ownership across India for 10 years (renewable)",
      "Prevent competitors, copiers, and fraudsters from hijacking your brand name",
      "Crucial intangible asset for venture valuation & Amazon Brand Registry",
      "50% government fee subsidy for Startups & MSMEs (Govt fee ₹4,500 vs ₹9,000)"
    ],
    badge: "Brand Protection",
    expert: "INCroute IP Attorney Desk",
    rating: 5,
    description: "Protect your brand name & logo. Use ™ symbol within 24 hrs.",
    popular: true,
    features: [
      "Deep AI Trademark Availability Search",
      "Form TM-A E-Filing & ™ Allotment",
      "10-Year Exclusive Brand Protection"
    ],
    documents: [
      "Brand Logo Image / Brand Name Text",
      "PAN Card & Aadhaar of Applicant / Directors",
      "MSME / Udyam Certificate (for 50% Govt fee discount)",
      "Signed Power of Attorney (Form TM-48)"
    ]
  },
  {
    id: "trademark-objection",
    name: "Trademark Objection Reply (MIS-R)",
    category: "legal-ip",
    tagline: "Legal Defense Reply to Trademark Examination Report Objections",
    timeline: "3–5 Working Days",
    minDirectors: "Senior IP Attorney",
    liability: "Objection Clearance",
    taxBenefit: "Protect ™ Status",
    detailedAbout: "Draft professional legal response to Section 9 (distinctiveness) or Section 11 (similar mark) examination objections raised by IP India registry examiners to restore your application to accepted/advertised status.",
    keyAdvantages: [
      "Drafted by experienced Trademark Attorneys with statutory case precedents",
      "Prevent application abandonment (Form TM-O / Section 21 defense)",
      "Detailed judicial citation supporting brand distinctiveness",
      "Must be filed within 30 days of Examination Report issuance",
      "Restores TM status to 'Accepted & Advertised' in Journal"
    ],
    badge: "Legal Defense",
    expert: "INCroute IP Attorney Desk",
    rating: 4.9,
    description: "Expert legal reply to TM Section 9 & 11 Examination Reports.",
    popular: true,
    features: [
      "Examination Report Legal Scrutiny",
      "Statutory Legal Reply Drafting with Case Laws",
      "IP India Portal Submission"
    ],
    documents: [
      "Trademark Examination Report from IP India",
      "Proof of Prior Brand Usage (Invoices, Social Media, Bills)",
      "Power of Attorney (Form TM-48)",
      "TM Application Number"
    ]
  },
  {
    id: "trademark-opposition",
    name: "Trademark Opposition & Hearing Defense",
    category: "legal-ip",
    tagline: "Represent Your Trademark in Hearing Arguments & Opposition Notices",
    timeline: "Hearing Scheduled",
    minDirectors: "Senior IP Counsel",
    liability: "Hearing Representation",
    taxBenefit: "Brand Defense",
    detailedAbout: "File counter-statements (Form TM-O), evidence in support of application under Rule 45/46, and represent your brand in formal virtual/physical hearings before the Trademark Registrar.",
    keyAdvantages: [
      "Senior IP Advocate representation before Registrar of Trademarks",
      "Draft comprehensive Counter-Statement (Form TM-O)",
      "Evidentiary affidavits demonstrating market goodwill and user continuous use",
      "Defend against competitor third-party oppositions",
      "Final path to securing official registered ® certificate"
    ],
    badge: "Advocate Hearing",
    expert: "INCroute IP Counsel",
    rating: 4.9,
    description: "Advocate representation in TM hearings & opposition notices.",
    popular: false,
    features: [
      "Form TM-O Counter-Statement Drafting",
      "Rule 45/46 Evidentiary Affidavit",
      "Virtual Hearing Legal Representation"
    ],
    documents: [
      "Notice of Opposition received",
      "Historical Brand Invoices & Advertisement Proofs",
      "CA Certified Sales Turnover Certificate",
      "Power of Attorney"
    ]
  },
  {
    id: "copyright-registration",
    name: "Copyright Registration",
    category: "legal-ip",
    tagline: "Protect Software Code, Literary Works, Artistic Logos & Creative Assets",
    timeline: "30–60 Days",
    minDirectors: "Copyright Attorney",
    liability: "Lifetime + 60 Years",
    taxBenefit: "IP Asset Valuation",
    detailedAbout: "File copyright applications with the Copyright Office (Government of India) to secure legal ownership over software source code, website design, literary books, musical compositions, or artistic logos.",
    keyAdvantages: [
      "Monopoly protection for author lifetime + 60 years",
      "Prima facie evidence of legal ownership in court disputes",
      "Prevents software code piracy & unauthorized copying",
      "Required for licensing revenue & intellectual asset valuation",
      "Covers software source code, artwork, audio, and video"
    ],
    badge: "Code & Creative",
    expert: "INCroute IP Desk",
    rating: 4.8,
    description: "Protect software source code, website artwork & literary works.",
    popular: false,
    features: [
      "Copyright Diary Number Allotment",
      "Source Code & Artwork Submission",
      "Government Copyright Certificate"
    ],
    documents: [
      "Source Code / Artwork / Work Copies",
      "NOC from Author / Creator",
      "PAN Card & Aadhaar of Applicant",
      "Power of Attorney"
    ]
  },
  {
    id: "patent-filing",
    name: "Patent Drafting & Provisional Application Filing",
    category: "legal-ip",
    tagline: "Monopolize Novel Tech Inventions, Hardware Designs & Patent Claims",
    timeline: "7–15 Working Days",
    minDirectors: "Patent Attorney Lead",
    liability: "20-Year Monopoly",
    taxBenefit: "80-IAC R&D Perks",
    detailedAbout: "Patent availability search, Freedom to Operate (FTO) reports, provisional/complete specification drafting, and e-filing with the Indian Patent Office to secure priority date for novel hardware, biotech, or software inventions.",
    keyAdvantages: [
      "Secure 20-year exclusive legal monopoly over novel tech inventions",
      "Establishes official international priority date (Form 1 / Form 2)",
      "Essential for attracting deep-tech VC investments & R&D grants",
      "Includes Patentability Search & Claim Drafting by Patent Agents",
      "80% government fee rebate for Startups and Educational Institutions"
    ],
    badge: "Deep Tech",
    expert: "INCroute Patent Desk",
    rating: 5,
    description: "Secure priority date & 20-year monopoly over novel inventions.",
    popular: false,
    features: [
      "Prior Art Novelty Search",
      "Provisional/Complete Specification Drafting",
      "Patent Office E-Filing (Form 1 & 2)"
    ],
    documents: [
      "Invention Disclosure Form (Technical Description & Diagrams)",
      "ID & Address Proof of Inventor & Applicant",
      "MSME / Startup India Certificate (for 80% fee discount)",
      "Form 26 Power of Attorney"
    ]
  },
  {
    id: "virtual-cfo",
    name: "Virtual CFO & Financial Advisory",
    category: "enterprise-growth",
    tagline: "Senior CA Financial Leadership, MIS Dashboards & Unit Economics Control",
    timeline: "Monthly Retainer",
    minDirectors: "Senior CA Lead",
    liability: "Financial Control",
    taxBenefit: "Unit Economics Control",
    detailedAbout: "Senior-level Virtual CFO services for growing startups. Includes cash flow forecasting, MIS monthly dashboards, statutory compliance oversight, tax optimization, and investor pitch deck financial modeling.",
    keyAdvantages: [
      "Senior CA guidance at 1/5th the cost of a full-time CFO",
      "Monthly MIS reporting & cash burn runway optimization",
      "Cap table management, ESOP planning & investor reporting",
      "Complete oversight of GST, TDS, ROC, and Tax Audit compliances",
      "Unit economics tuning to achieve profitability & Series-A readiness"
    ],
    badge: "Scale Startups",
    expert: "INCroute CFO Desk",
    rating: 5,
    description: "Senior CA financial leadership, MIS & burn runway control.",
    popular: true,
    features: [
      "Monthly MIS & Cash Flow Forecasting",
      "Cap Table & Unit Economics Control",
      "Compliance & Investor Governance Oversight"
    ],
    documents: [
      "Historical Financial Statements & Accounting Books",
      "Bank Statements & Cap Table Details",
      "Existing GST/TDS Return Data"
    ]
  },
  {
    id: "startup-grants",
    name: "Startup India Recognition & Tax Exemption",
    category: "enterprise-growth",
    tagline: "DPIIT Recognition & Section 80-IAC 3-Year Income Tax Exemption",
    timeline: "5–10 Working Days",
    minDirectors: "Startup Specialist",
    liability: "Government Perks",
    taxBenefit: "3-Year 100% Tax Exemption",
    detailedAbout: "Apply for official DPIIT Startup India recognition certificate, self-certification under 9 labour & 3 environmental laws, Section 80-IAC 3-consecutive-year 100% income tax exemption certificate, and Angel Tax exemption.",
    keyAdvantages: [
      "100% Income Tax exemption for 3 consecutive years under Section 80-IAC",
      "Exemption from Angel Tax under Section 56(2)(viib)",
      "Self-certification compliance under 9 labour and 3 environmental laws",
      "Fast-track patent application examination & 80% fee rebate",
      "Access to ₹10,000 Crore Fund of Funds & Seed Fund Scheme"
    ],
    badge: "Startup India",
    expert: "INCroute Startup Desk",
    rating: 5,
    description: "DPIIT recognition & 80-IAC 3-year 100% income tax exemption.",
    popular: true,
    features: [
      "DPIIT Portal Application Submission",
      "Section 80-IAC Tax Exemption Application",
      "Pitch Deck & Innovation Write-Up Scrutiny"
    ],
    documents: [
      "Certificate of Incorporation (Pvt Ltd or LLP)",
      "Pitch Deck / Business Model & Innovation Note",
      "PAN Card of Entity",
      "Website / Mobile App Link (if active)"
    ]
  },
  {
    id: "12a-80g-registration",
    name: "12A & 80G Tax Exemption Certificates for NGOs",
    category: "enterprise-growth",
    tagline: "Provide 50% Tax Deductions to Donors & Claim Complete NGO Income Exemption",
    timeline: "10–15 Working Days",
    minDirectors: "NGO Specialist Lead",
    liability: "Tax Clearance",
    taxBenefit: "50% Donor Tax Deduction",
    detailedAbout: "Obtain Form 10A / 10AB provisional and final 12A & 80G tax exemption certificates from the Income Tax Department for Section 8 companies, Trusts, and Societies.",
    keyAdvantages: [
      "80G Certificate gives 50% tax deduction benefit to donors, boosting donations",
      "12A Certificate grants complete 100% tax exemption on NGO income & surplus",
      "Essential eligibility for receiving Corporate CSR grants & foreign funds",
      "Valid nationwide across all tax jurisdictions in India",
      "Includes Income Tax Portal Form 10A e-filing"
    ],
    badge: "NGO Essential",
    expert: "INCroute NGO Desk",
    rating: 4.9,
    description: "50% donor tax deduction (80G) & complete NGO income exemption (12A).",
    popular: false,
    features: [
      "Form 10A / 10AB E-Filing",
      "Provisional & Final 12A/80G Allotment",
      "CSR Grant Eligibility Setup"
    ],
    documents: [
      "Registration Certificate / COI of Trust / Section 8 / Society",
      "Trust Deed / MOA & AOA with NGO clauses",
      "PAN Card of NGO Entity",
      "3-Year Activity Report & Financial Accounts (if existing)"
    ]
  },
  {
    id: "fcra-registration",
    name: "FCRA Foreign Contribution Registration",
    category: "enterprise-growth",
    tagline: "MHA License Required for NGOs to Receive Foreign Grants & Donations",
    timeline: "30–60 Days",
    minDirectors: "Senior NGO Counsel",
    liability: "MHA License",
    taxBenefit: "Foreign Grant Access",
    detailedAbout: "Apply for Foreign Contribution Regulation Act (FCRA) prior permission or 5-year registration certificate from the Ministry of Home Affairs (MHA) for non-profit entities to legally receive foreign funds, grants, and international aid.",
    keyAdvantages: [
      "Mandatory legal clearance for receiving foreign grants & international donations",
      "5-Year renewable MHA license for non-profits",
      "Enables opening of designated FCRA bank account at SBI Main Branch New Delhi",
      "Prevents heavy MHA penalties and frozen bank accounts",
      "Expert scrutiny of NGO activity reports and audit books"
    ],
    badge: "MHA Foreign Grant",
    expert: "INCroute NGO Counsel",
    rating: 4.9,
    description: "MHA approval required for NGOs to receive foreign grants.",
    popular: false,
    features: [
      "MHA FCRA Portal E-Filing",
      "SBI Main Branch New Delhi FCRA Account Assistance",
      "5-Year MHA Registration License"
    ],
    documents: [
      "NGO Registration Certificate & Trust Deed / MOA",
      "12A & 80G Exemption Certificates",
      "PAN Card & Aadhaar of all Governing Body Members",
      "3-Year Audited Financial Statements & Activity Reports"
    ]
  }
];

export function getServiceById(serviceId: string): ServiceItem | undefined {
  const found = servicesRegistry.find(s => s.id === serviceId);
  if (found) return found;

  const titleEntry = TITLE_MAP[serviceId];
  if (titleEntry) {
    return {
      id: serviceId,
      name: titleEntry.name,
      category: "general",
      tagline: titleEntry.tagline,
      timeline: "5–7 Working Days",
      minDirectors: "Corporate Advisor Lead",
      liability: "Statutory Compliance",
      detailedAbout: `${titleEntry.name} is an essential business compliance and execution service managed directly by INCroute's certified Chartered Accountants and Company Secretaries. We handle all document drafting, secretarial verification, and official government portal filings with zero query rejection.`,
      keyAdvantages: [
        "100% legal compliance under Indian statutory mandates",
        "Verified document drafting by experienced CAs and CSs",
        "Zero office visit required — fast 100% digital e-filing",
        "Avoid heavy government late filing fees & department notices",
        "Includes dedicated post-approval support & compliance advice"
      ],
      description: titleEntry.description,
      popular: true,
      features: [
        "Statutory Application Drafting",
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
  }

  return undefined;
}
