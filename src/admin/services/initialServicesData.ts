import { AdminServiceItem, ServiceTemplateItem } from "./servicesTypes";

export const INITIAL_SERVICES: AdminServiceItem[] = [
  {
    id: "srv-01",
    code: "INC-PVT-01",
    name: "Private Limited Company Incorporation",
    category: "Incorporation",
    description: "End-to-end Private Limited company registration with 2 DSCs, SPICe+ MCA filing, PAN, TAN, and free bank account.",
    fullDescription: "Complete legal incorporation package for startups including name approval, MOA/AOA drafting, Digital Signature Certificates (DSC), Director Identification Numbers (DIN), and incorporation certificate from MCA.",
    basePrice: 1499,
    discountPrice: 1499,
    gstRate: 18,
    govtFee: 1000,
    profFee: 1499,
    totalCalculatedPrice: 2768,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 45,
    monthlyRevenue: 87500,
    popularityScore: 98,
    estimatedDays: 7,
    isPopular: true,
    department: "Corporate Secretarial",
    defaultAssignee: "Senior CS Associate",
    requiredDocuments: [
      "PAN Card of all Directors & Shareholders",
      "Aadhaar Card or Voter ID / Passport",
      "Bank Statement (latest 2 months)",
      "Registered Address Proof (Utility Bill + NOC)"
    ],
    workflowStages: [
      { title: "DSC & Name Clearance", desc: "Obtain Digital Signatures and submit RUN form to MCA." },
      { title: "MOA & AOA Drafting", desc: "Draft statutory Memorandum & Articles of Association." },
      { title: "SPICe+ MCA E-Filing", desc: "Submit statutory INC-32, INC-33, INC-34 to ROC." },
      { title: "COI Allotment & Bank Integration", desc: "Issuance of Certificate of Incorporation with CIN, PAN, TAN." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Collect director identity & address proofs", mandatory: true },
      { id: "chk-2", title: "Apply for Digital Signatures (DSC)", mandatory: true },
      { id: "chk-3", title: "Run name feasibility search on MCA portal", mandatory: true },
      { id: "chk-[#", title: "Execute SPICe+ Part B MCA submission", mandatory: true }
    ],
    lastUpdated: "2026-07-20",
    clientFacingTitle: "Private Limited Company Registration",
    benefits: [
      "Separate legal entity status",
      "Limited liability protection",
      "Easier to raise VC funding"
    ]
  },
  {
    id: "srv-02",
    code: "INC-LLP-02",
    name: "LLP Registration",
    category: "Incorporation",
    description: "Limited Liability Partnership registration with FiLLiP MCA filing and LLP Agreement drafting.",
    fullDescription: "Register an LLP with Ministry of Corporate Affairs (MCA). Includes RUN-LLP name reservation, FiLLiP statutory incorporation form, LLP Agreement drafting, and Form 3 filing.",
    basePrice: 1999,
    discountPrice: 1999,
    gstRate: 18,
    govtFee: 1500,
    profFee: 1999,
    totalCalculatedPrice: 3858,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 23,
    monthlyRevenue: 45977,
    popularityScore: 85,
    estimatedDays: 10,
    isPopular: false,
    department: "Corporate Secretarial",
    defaultAssignee: "Legal Manager",
    requiredDocuments: [
      "PAN Card & Aadhaar of Designated Partners",
      "Bank Statement of Partners",
      "Registered Address Utility Bill + Landlord NOC"
    ],
    workflowStages: [
      { title: "DSC & Name Reservation", desc: "Obtain Partner DSCs and reserve name via RUN-LLP." },
      { title: "FiLLiP Form Filing", desc: "File statutory FiLLiP incorporation form with MCA." },
      { title: "Form 3 LLP Agreement Submission", desc: "Execute stamp duty payment and file Form 3 within 30 days." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Verify partner PAN details", mandatory: true },
      { id: "chk-2", title: "Draft custom LLP Agreement", mandatory: true }
    ],
    lastUpdated: "2026-07-18",
    clientFacingTitle: "LLP Registration"
  },
  {
    id: "srv-03",
    code: "REG-GST-03",
    name: "GST Registration",
    category: "GST Services",
    description: "New GSTIN registration for businesses, e-commerce sellers, and proprietors.",
    fullDescription: "Complete GST Portal profile setup, REG-01 application filing, ARN tracking, e-KYC Aadhaar verification, and Form REG-06 certificate issuance.",
    basePrice: 999,
    discountPrice: 999,
    gstRate: 18,
    govtFee: 0,
    profFee: 999,
    totalCalculatedPrice: 1178,
    priceDisplayType: "FIXED",
    status: "ACTIVE",
    ordersCount: 32,
    monthlyRevenue: 31968,
    popularityScore: 92,
    estimatedDays: 4,
    isPopular: true,
    department: "Tax & GST Practice",
    defaultAssignee: "Tax Consultant",
    requiredDocuments: [
      "PAN & Aadhaar of Business Owner",
      "Cancelled Cheque / Bank Passbook Copy",
      "Proof of Business Premises (Electricity Bill + NOC)"
    ],
    workflowStages: [
      { title: "Premises Proof Audit", desc: "Review utility bills & NOC for zero query rejection." },
      { title: "REG-01 Application Lodgment", desc: "Upload documents to GST Portal and generate ARN." },
      { title: "Aadhaar e-KYC Verification", desc: "Biometric OTP verification of authorized signatory." },
      { title: "GSTIN Certificate Issuance", desc: "Download official Form REG-06 allotment certificate." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Audit premises utility bill address", mandatory: true },
      { id: "chk-2", title: "File REG-01 on GST portal", mandatory: true }
    ],
    lastUpdated: "2026-07-22",
    clientFacingTitle: "GST Registration"
  },
  {
    id: "srv-04",
    code: "CMP-ANN-04",
    name: "Annual Compliance Package",
    category: "Compliance",
    description: "Complete annual compliance management including ROC AOC-4, MGT-7, and DIR-3 KYC.",
    fullDescription: "Comprehensive compliance retainer for Private Limited and LLP entities. Includes drafting 4 quarterly board minutes, AGM notice, Form AOC-4 balance sheet, Form MGT-7 annual return, and DIR-3 KYC.",
    basePrice: 4999,
    discountPrice: 4999,
    gstRate: 18,
    govtFee: 1200,
    profFee: 4999,
    totalCalculatedPrice: 7098,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 18,
    monthlyRevenue: 89982,
    popularityScore: 78,
    estimatedDays: 15,
    isPopular: false,
    department: "Corporate Secretarial",
    defaultAssignee: "Compliance Head",
    requiredDocuments: [
      "Audited Financial Statements (Balance Sheet & P&L)",
      "Auditor's Report & Notes to Accounts",
      "Director KYC Identity Proofs"
    ],
    workflowStages: [
      { title: "Board Minutes & AGM Drafting", desc: "Draft statutory meeting minutes according to Secretarial Standards." },
      { title: "Form AOC-4 E-Filing", desc: "File financial statements with MCA." },
      { title: "Form MGT-7 E-Filing", desc: "File annual return with MCA." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Collect audited balance sheet", mandatory: true }
    ],
    lastUpdated: "2026-07-15",
    clientFacingTitle: "Annual ROC Compliance Package"
  },
  {
    id: "srv-05",
    code: "REG-MSM-05",
    name: "MSME Udyam Registration",
    category: "Registrations",
    description: "Government MSME / Udyam Certificate allotment for subsidies and collateral-free bank loans.",
    fullDescription: "Get official DPIIT aligned Udyam MSME certification from Ministry of Micro, Small and Medium Enterprises to unlock priority sector lending, lower bank interest rates, and 50% trademark fee rebates.",
    basePrice: 499,
    discountPrice: 499,
    gstRate: 18,
    govtFee: 0,
    profFee: 499,
    totalCalculatedPrice: 588,
    priceDisplayType: "FIXED",
    status: "ACTIVE",
    ordersCount: 15,
    monthlyRevenue: 7485,
    popularityScore: 65,
    estimatedDays: 1,
    isPopular: false,
    department: "Government Alliances",
    defaultAssignee: "Operations Executive",
    requiredDocuments: [
      "Aadhaar Card linked with Mobile Number",
      "Business PAN Card",
      "Bank Account Details"
    ],
    workflowStages: [
      { title: "Aadhaar Validation", desc: "OTP authentication on Udyam portal." },
      { title: "Udyam Certificate Generation", desc: "Instant issuance of Udyam Registration Certificate." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Validate mobile OTP for Aadhaar", mandatory: true }
    ],
    lastUpdated: "2026-07-21",
    clientFacingTitle: "MSME Udyam Certificate"
  },
  {
    id: "srv-06",
    code: "IPR-TM-06",
    name: "Trademark Registration",
    category: "Trademark",
    description: "Brand protection and trademark application (TM-A) filing across TM Classes 1-45.",
    fullDescription: "Secure exclusive legal rights to your brand name, slogan, and logo across India. Includes comprehensive TM class availability search, TM-A drafting, attorney sign-off, and ™ symbol usage right from day 1.",
    basePrice: 1499,
    discountPrice: 1499,
    gstRate: 18,
    govtFee: 4500,
    profFee: 1499,
    totalCalculatedPrice: 6268,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 12,
    monthlyRevenue: 17988,
    popularityScore: 82,
    estimatedDays: 2,
    isPopular: true,
    department: "Intellectual Property Practice",
    defaultAssignee: "IP Attorney",
    requiredDocuments: [
      "Brand Name & Logo File",
      "Applicant PAN & Address Proof",
      "MSME Certificate for 50% Govt Fee Waiver",
      "User Affidavit (if brand is already in use)"
    ],
    workflowStages: [
      { title: "Deep TM Class Search", desc: "Comprehensive search on IP India database to check similarity." },
      { title: "TM-A Application Drafting", desc: "Draft statutory application specifying goods/services class." },
      { title: "IP India Lodgment & Receipt", desc: "E-file application and generate government acknowledgement receipt." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Conduct phonetic TM search", mandatory: true }
    ],
    lastUpdated: "2026-07-19",
    clientFacingTitle: "Trademark Registration (TM-A)"
  },
  {
    id: "srv-07",
    code: "REG-IEC-07",
    name: "Import Export Code (IEC)",
    category: "Licences",
    description: "10-digit IEC license from DGFT for import/export of goods and IT services.",
    fullDescription: "Get official Import Export Code from Directorate General of Foreign Trade (DGFT) in 24 hours. Mandatory for foreign currency outward/inward remittances, Paypal/Stripe international payments, and customs clearance.",
    basePrice: 999,
    discountPrice: 999,
    gstRate: 18,
    govtFee: 500,
    profFee: 999,
    totalCalculatedPrice: 1678,
    priceDisplayType: "FIXED",
    status: "ACTIVE",
    ordersCount: 9,
    monthlyRevenue: 8991,
    popularityScore: 60,
    estimatedDays: 1,
    department: "Licensing Practice",
    defaultAssignee: "Trade Compliance Executive",
    requiredDocuments: [
      "PAN Card of Business / Entity",
      "Cancelled Cheque of Current Account",
      "Address Proof of Business Premises"
    ],
    workflowStages: [
      { title: "DGFT Portal Application", desc: "Fill e-IEC application on DGFT portal with digital key." },
      { title: "IEC Code Allotment", desc: "Receive 10-digit IEC Certificate." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Verify current bank account cancelled cheque", mandatory: true }
    ],
    lastUpdated: "2026-07-17",
    clientFacingTitle: "Import Export Code (IEC License)"
  },
  {
    id: "srv-08",
    code: "REG-FSS-08",
    name: "FSSAI Food License",
    category: "Licences",
    description: "Food safety registration & license for food businesses, restaurants, and cloud kitchens.",
    fullDescription: "Get official FSSAI Basic Registration, State License, or Central License from FoSCoS portal with 1 to 5 years validity.",
    basePrice: 1499,
    discountPrice: 1499,
    gstRate: 18,
    govtFee: 100,
    profFee: 1499,
    totalCalculatedPrice: 1868,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 8,
    monthlyRevenue: 11992,
    popularityScore: 55,
    estimatedDays: 5,
    department: "Licensing Practice",
    defaultAssignee: "Licensing Specialist",
    requiredDocuments: [
      "Photo ID of Proprietor / Director",
      "Proof of Premises Address",
      "Food Safety Management Plan"
    ],
    workflowStages: [
      { title: "FoSCoS Portal Lodgment", desc: "Submit Form A or Form B on FoSCoS portal." },
      { title: "FSSAI License Issuance", desc: "Receive 14-digit FSSAI License Number." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Verify food safety plan layout", mandatory: true }
    ],
    lastUpdated: "2026-07-16",
    clientFacingTitle: "FSSAI Food License Registration"
  },
  {
    id: "srv-09",
    code: "INC-OPC-09",
    name: "One Person Company (OPC) Registration",
    category: "Incorporation",
    description: "Single-founder corporate entity registration with limited liability protection.",
    fullDescription: "Incorporate a One Person Company with 1 Director, 1 Nominee, Digital Signature Certificate, SPICe+ Part A & B MCA approval, PAN, TAN, and official COI in 7-10 working days.",
    basePrice: 1499,
    discountPrice: 1499,
    gstRate: 18,
    govtFee: 1000,
    profFee: 1499,
    totalCalculatedPrice: 2768,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 11,
    monthlyRevenue: 16489,
    popularityScore: 70,
    estimatedDays: 7,
    department: "Corporate Secretarial",
    defaultAssignee: "Associate CS",
    requiredDocuments: [
      "PAN & Aadhaar of Director & Nominee",
      "INC-3 Nominee Consent Form",
      "Utility Bill + Landlord NOC"
    ],
    workflowStages: [
      { title: "DSC & INC-3 Consent", desc: "Obtain Digital Signature and nominee consent form." },
      { title: "SPICe+ MCA E-Filing", desc: "File statutory INC-32, INC-33, INC-34 with MCA." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Collect Nominee consent INC-3 form", mandatory: true }
    ],
    lastUpdated: "2026-07-14",
    clientFacingTitle: "One Person Company Registration"
  },
  {
    id: "srv-10",
    code: "INC-SEC8-10",
    name: "Section 8 NGO Company",
    category: "Incorporation",
    description: "Non-profit charitable corporate entity with Section 8 MCA license.",
    fullDescription: "Incorporate a Section 8 Non-Profit Company with MCA License (Form INC-12), MOA/AOA approval, 12A & 80G tax exemption guidance, and FCRA eligibility.",
    basePrice: 3999,
    discountPrice: 3999,
    gstRate: 18,
    govtFee: 2000,
    profFee: 3999,
    totalCalculatedPrice: 6718,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 5,
    monthlyRevenue: 19995,
    popularityScore: 50,
    estimatedDays: 14,
    department: "Corporate Secretarial",
    defaultAssignee: "Legal Head",
    requiredDocuments: [
      "PAN & Aadhaar of Minimum 2 Directors",
      "3-Year Estimate of Income & Expenditure",
      "Statement of Social Objects"
    ],
    workflowStages: [
      { title: "INC-12 License Application", desc: "Apply for Section 8 License from Central Government / ROC." },
      { title: "SPICe+ MCA Incorporation", desc: "Execute MOA/AOA drafting and receive COI." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Draft 3-year projected income/expenditure statement", mandatory: true }
    ],
    lastUpdated: "2026-07-12",
    clientFacingTitle: "Section 8 Non-Profit Registration"
  },
  {
    id: "srv-11",
    code: "TAX-ITR-11",
    name: "Income Tax E-Filing (ITR)",
    category: "Taxation",
    description: "Annual Income Tax Return filing for individuals, proprietors, and corporates.",
    fullDescription: "Expert ITR-1 to ITR-6 filing with AIS/26AS tax credit reconciliation, capital gains calculation, and CA verification.",
    basePrice: 999,
    discountPrice: 999,
    gstRate: 18,
    govtFee: 0,
    profFee: 999,
    totalCalculatedPrice: 1178,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    ordersCount: 28,
    monthlyRevenue: 27972,
    popularityScore: 88,
    estimatedDays: 2,
    department: "Tax & GST Practice",
    defaultAssignee: "Chartered Accountant",
    requiredDocuments: [
      "Form 16 / Form 16A",
      "Form 26AS & AIS Summary",
      "Bank Account Statements",
      "Investment Proofs (80C, 80D)"
    ],
    workflowStages: [
      { title: "AIS/26AS Audit", desc: "Reconcile tax credits and TDS records." },
      { title: "ITR Computation & E-Filing", desc: "File ITR on Income Tax portal and e-verify." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Reconcile AIS Form 26AS with Form 16", mandatory: true }
    ],
    lastUpdated: "2026-07-21",
    clientFacingTitle: "Income Tax Return (ITR) E-Filing"
  },
  {
    id: "srv-12",
    code: "ACC-BKS-12",
    name: "INCroute Books Cloud Accounting",
    category: "Accounting",
    description: "Cloud double-entry accounting software subscription with GST invoicing.",
    fullDescription: "1-Year subscription to INCroute Books standalone cloud accounting platform with automated general ledger, GSTR-1/3B sync, and bank feeds.",
    basePrice: 2999,
    discountPrice: 2999,
    gstRate: 18,
    govtFee: 0,
    profFee: 2999,
    totalCalculatedPrice: 3538,
    priceDisplayType: "FIXED",
    status: "ACTIVE",
    ordersCount: 14,
    monthlyRevenue: 41986,
    popularityScore: 75,
    isPopular: true,
    estimatedDays: 1,
    department: "Cloud Products",
    defaultAssignee: "Product Specialist",
    requiredDocuments: [
      "Business GSTIN & PAN Details"
    ],
    workflowStages: [
      { title: "Workspace Activation", desc: "Provision standalone accounting tenant workspace." }
    ],
    checklistItems: [
      { id: "chk-1", title: "Provision tenant database schema", mandatory: true }
    ],
    lastUpdated: "2026-07-22",
    clientFacingTitle: "INCroute Books Accounting Software"
  }
];

export const SERVICE_TEMPLATES: ServiceTemplateItem[] = [
  {
    id: "tmpl-01",
    name: "Private Limited Company Incorporation",
    category: "Incorporation",
    description: "Standard 2-Director Pvt Ltd incorporation template with SPICe+ Part A & B.",
    basePrice: 1499,
    gstRate: 18,
    estimatedDays: 7,
    requiredDocuments: ["PAN Card", "Aadhaar Card", "Bank Statement", "Utility Bill + NOC"],
    checklist: ["Collect director PAN/Aadhaar", "Apply for 2 DSCs", "Reserve RUN name", "Submit SPICe+ Part B"],
    workflowStages: [
      { title: "DSC & Name Clearance", desc: "Obtain Digital Signatures and submit RUN form." },
      { title: "MOA & AOA Drafting", desc: "Draft Memorandum & Articles of Association." },
      { title: "SPICe+ MCA E-Filing", desc: "Submit statutory INC-32, 33, 34 to ROC." }
    ],
    defaultAssignee: "CS Associate"
  },
  {
    id: "tmpl-02",
    name: "GST Registration",
    category: "GST Services",
    description: "REG-01 GSTIN application template with Aadhaar e-KYC.",
    basePrice: 999,
    gstRate: 18,
    estimatedDays: 4,
    requiredDocuments: ["PAN & Aadhaar", "Cancelled Cheque", "Electricity Bill + NOC"],
    checklist: ["Verify premises proof", "File REG-01", "Complete e-KYC"],
    workflowStages: [
      { title: "Audit Premises", desc: "Review NOC and utility bill." },
      { title: "File REG-01", desc: "Upload docs and generate ARN." }
    ],
    defaultAssignee: "Tax Consultant"
  },
  {
    id: "tmpl-03",
    name: "Trademark Registration (TM-A)",
    category: "Trademark",
    description: "TM Class 1-45 brand registration template.",
    basePrice: 1499,
    gstRate: 18,
    estimatedDays: 2,
    requiredDocuments: ["Brand Name/Logo", "Applicant PAN", "MSME Certificate"],
    checklist: ["Phonetic search", "Draft TM-A", "Upload MSME for 50% waiver"],
    workflowStages: [
      { title: "Class Search", desc: "Search IP India database." },
      { title: "File TM-A", desc: "Generate government receipt." }
    ],
    defaultAssignee: "IP Attorney"
  }
];
