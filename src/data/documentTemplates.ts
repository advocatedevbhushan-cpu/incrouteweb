export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "number" | "currency" | "address" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  helperText?: string;
  defaultValue?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  isPopular?: boolean;
  description: string;
  icon: string;
  fields: FormField[];
}

// Helper list of templates to quickly generate the 100+ documents
const rawTemplates = [
  // POPULAR
  { id: "office-noc", title: "Office NOC", cat: "popular", desc: "No Objection Certificate for registered corporate office space.", icon: "Building2" },
  { id: "founders-deed", title: "Founder's Deed", cat: "popular", desc: "Founders' co-founder agreement containing equity allocation and vesting.", icon: "Users" },
  { id: "board-resolution", title: "Board Resolution", cat: "popular", desc: "Formal board of directors resolution record document.", icon: "FileText" },
  { id: "nda", title: "Non-Disclosure Agreement", cat: "popular", desc: "Standard mutual or unilateral confidentiality protection deed.", icon: "ShieldCheck" },
  { id: "employment-offer", title: "Employment Offer Letter", cat: "popular", desc: "Standard employment offer outlining designation, salary, and details.", icon: "FileText" },
  { id: "service-agreement", title: "Service Agreement", cat: "popular", desc: "Contract between client and service provider clarifying terms.", icon: "ClipboardCheck" },
  { id: "rent-agreement", title: "Rent or Lease Agreement", cat: "popular", desc: "Residential or commercial property lease agreement deed.", icon: "Building2" },
  { id: "legal-notice", title: "Legal Notice", cat: "popular", desc: "Statutory notice of breach demanding specific performance or claims.", icon: "Scale" },

  // INCORPORATION
  { id: "inc-founders-agmt", title: "Founder's Agreement", cat: "incorporation", desc: "Initial charter agreement outlining responsibilities.", icon: "Users" },
  { id: "inc-co-founder", title: "Co-Founder Agreement", cat: "incorporation", desc: "Co-founder operational and equity vesting agreement.", icon: "Users" },
  { id: "inc-mou", title: "Memorandum of Understanding", cat: "incorporation", desc: "Initial MOU for prospective business promoters.", icon: "FileText" },
  { id: "inc-sub-decl", title: "Subscriber Declaration", cat: "incorporation", desc: "Declaration by subscribers to MOA & AOA.", icon: "FileText" },
  { id: "inc-dir-consent", title: "Director Consent Letter", cat: "incorporation", desc: "Form DIR-2 consent to act as director of company.", icon: "CheckCircle2" },
  { id: "inc-office-decl", title: "Registered Office Declaration", cat: "incorporation", desc: "Declaration for commercial address verification.", icon: "Building2" },
  { id: "inc-auth-sig", title: "Authorized Signatory Letter", cat: "incorporation", desc: "Letter authorizing director for ROC/PAN applications.", icon: "FileText" },
  { id: "inc-name-decl", title: "Company Name Declaration", cat: "incorporation", desc: "Affidavit verifying proposed company name exclusivity.", icon: "FileText" },
  { id: "inc-promo-decl", title: "Promoter Declaration", cat: "incorporation", desc: "Declaration of compliance by incorporators.", icon: "FileText" },
  { id: "inc-first-board", title: "First Board Meeting Notice", cat: "incorporation", desc: "Notice convening initial director meeting.", icon: "Calendar" },
  { id: "inc-checklist", title: "Incorporation Document Checklist", cat: "incorporation", desc: "Listing PAN, TAN, MOA, KYC records required.", icon: "ClipboardCheck" },

  // BOARD & GOVERNANCE
  { id: "gov-shareholders", title: "Shareholders Agreement", cat: "board", desc: "Comprehensive SHA outlining investor relations.", icon: "Users" },
  { id: "gov-notice", title: "Board Meeting Notice", cat: "board", desc: "Notice to directors convening statutory board meeting.", icon: "Calendar" },
  { id: "gov-minutes", title: "Board Meeting Minutes", cat: "board", desc: "Minutes documenting resolutions passed in board meeting.", icon: "FileText" },
  { id: "gov-ord-res", title: "Ordinary Resolution", cat: "board", desc: "Draft for standard ordinary resolution items.", icon: "FileText" },
  { id: "gov-spec-res", title: "Special Resolution", cat: "board", desc: "Resolution draft requiring 75% shareholder approval.", icon: "FileText" },
  { id: "gov-dir-app", title: "Director Appointment Resolution", cat: "board", desc: "Board resolution appointing additional director.", icon: "CheckCircle2" },
  { id: "gov-dir-res", title: "Director Resignation Resolution", cat: "board", desc: "Board resolution accepting director resignation.", icon: "X" },
  { id: "gov-bank-ac", title: "Bank Account Opening Resolution", cat: "board", desc: "Resolution authorizing opening corporate account.", icon: "FileText" },
  { id: "gov-auth-sig", title: "Authorized Signatory Resolution", cat: "board", desc: "Board resolution designating signing authorities.", icon: "FileText" },
  { id: "gov-share-allot", title: "Share Allotment Resolution", cat: "board", desc: "Resolution detailing allotment of fresh shares.", icon: "FileText" },
  { id: "gov-office-chg", title: "Registered Office Change Resolution", cat: "board", desc: "Resolution to shift office within local limits.", icon: "Building2" },
  { id: "gov-auditor", title: "Auditor Appointment Resolution", cat: "board", desc: "Resolution to appoint statutory first auditors.", icon: "CheckCircle2" },
  { id: "gov-loan", title: "Loan Approval Resolution", cat: "board", desc: "Board resolution approving company borrowings.", icon: "FileText" },
  { id: "gov-rpt", title: "Related Party Transaction Resolution", cat: "board", desc: "Resolution approving transactions with key personnel.", icon: "FileText" },

  // CONTRACTS
  { id: "con-vendor", title: "Vendor Agreement", cat: "contracts", desc: "Standard supply and procurement vendor deed.", icon: "ClipboardCheck" },
  { id: "con-consultancy", title: "Consultancy Agreement", cat: "contracts", desc: "Agreement for hiring independent professional consultants.", icon: "FileText" },
  { id: "con-freelancer", title: "Freelancer Agreement", cat: "contracts", desc: "Agreement specifying deliverables and hourly payouts.", icon: "FileText" },
  { id: "con-partnership", title: "Partnership Agreement", cat: "contracts", desc: "Partnership deed for registration under Partnership Act.", icon: "Users" },
  { id: "con-mou", title: "MOU / Letter of Intent", cat: "contracts", desc: "MOU document outlining project coordination.", icon: "FileText" },
  { id: "con-noncompete", title: "Non-Compete Agreement", cat: "contracts", desc: "Deed protecting commercial client database and trade secrets.", icon: "ShieldCheck" },
  { id: "con-distributor", title: "Distribution Agreement", cat: "contracts", desc: "Exclusive channel partner distribution contract.", icon: "ClipboardCheck" },
  { id: "con-supply", title: "Supply Agreement", cat: "contracts", desc: "Agreement for bulk supply of merchant products.", icon: "ClipboardCheck" },
  { id: "con-commission", title: "Commission Agreement", cat: "contracts", desc: "Contract detailing variable performance payouts.", icon: "FileText" },
  { id: "con-marketing", title: "Marketing Agreement", cat: "contracts", desc: "Agreement for digital marketing & SEO services.", icon: "FileText" },
  { id: "con-software", title: "Software Development Agreement", cat: "contracts", desc: "Custom software development contract.", icon: "FileText" },
  { id: "con-website", title: "Website Development Agreement", cat: "contracts", desc: "Frontend/backend portal building agreement.", icon: "FileText" },
  { id: "con-maintenance", title: "Maintenance Agreement", cat: "contracts", desc: "SLA / AMC annual maintenance contract.", icon: "ClipboardCheck" },
  { id: "con-collaboration", title: "Business Collaboration Agreement", cat: "contracts", desc: "JV / alliance and strategic collaboration deed.", icon: "Users" },
  { id: "con-agency", title: "Agency Agreement", cat: "contracts", desc: "Appointment of marketing or sales agent.", icon: "Users" },
  { id: "con-sale-purchase", title: "Sale and Purchase Agreement", cat: "contracts", desc: "Agreement for commercial sale of goods/assets.", icon: "ClipboardCheck" },

  // HUMAN RESOURCES
  { id: "hr-employment-agmt", title: "Employment Agreement", cat: "hr", desc: "Standard employee contract with protective clauses.", icon: "FileText" },
  { id: "hr-appointment", title: "Appointment Letter", cat: "hr", desc: "Detailed letter issued post joining confirmation.", icon: "FileText" },
  { id: "hr-internship", title: "Internship Offer Letter", cat: "hr", desc: "Intern offer letter detailing stipend & certificate terms.", icon: "FileText" },
  { id: "hr-consultant", title: "Consultant Appointment Letter", cat: "hr", desc: "HR letter appointing specialist on retainer basis.", icon: "FileText" },
  { id: "hr-nda", title: "Employee NDA", cat: "hr", desc: "Confidentiality deed signed by employees on joining.", icon: "ShieldCheck" },
  { id: "hr-noncompete", title: "Employee Non-Compete Agreement", cat: "hr", desc: "Employee covenant preventing post-employment conflicts.", icon: "ShieldCheck" },
  { id: "hr-probation", title: "Probation Confirmation Letter", cat: "hr", desc: "Letter confirming completion of employee probation.", icon: "CheckCircle2" },
  { id: "hr-promotion", title: "Promotion Letter", cat: "hr", desc: "Promotion letter detailing new role and compensation.", icon: "FileText" },
  { id: "hr-revision", title: "Salary Revision Letter", cat: "hr", desc: "Statutory increment/salary hike confirmation letter.", icon: "FileText" },
  { id: "hr-warning", title: "Warning Letter", cat: "hr", desc: "Formal notice warning employee of breach or misconduct.", icon: "X" },
  { id: "hr-showcause", title: "Show Cause Notice", cat: "hr", desc: "HR notice asking for clarification on absenteeism/breach.", icon: "Scale" },
  { id: "hr-termination", title: "Termination Letter", cat: "hr", desc: "Letter terminating employment with notice/compensation.", icon: "X" },
  { id: "hr-resignation", title: "Resignation Acceptance Letter", cat: "hr", desc: "Acknowledgement and release post employee resignation.", icon: "CheckCircle2" },
  { id: "hr-experience", title: "Experience Letter", cat: "hr", desc: "Relieving-cum-experience certificate detailing tenure.", icon: "FileText" },
  { id: "hr-relieving", title: "Relieving Letter", cat: "hr", desc: "Letter releasing employee from statutory duties.", icon: "CheckCircle2" },
  { id: "hr-leave-policy", title: "Leave Policy", cat: "hr", desc: "Corporate leave, causal, sick & maternity policy.", icon: "ClipboardCheck" },
  { id: "hr-wfh-policy", title: "Work-from-Home Policy", cat: "hr", desc: "WFH / hybrid policy guidelines for employees.", icon: "ClipboardCheck" },
  { id: "hr-conduct-policy", title: "Employee Code of Conduct", cat: "hr", desc: "Bylaws & conduct guidelines for startup workers.", icon: "ClipboardCheck" },
  { id: "hr-conf-policy", title: "Confidentiality Policy", cat: "hr", desc: "Corporate data security and non-disclosure charter.", icon: "ShieldCheck" },

  // COMPLIANCE
  { id: "comp-gst-auth", title: "GST Authorization Letter", cat: "compliance", desc: "Board resolution/letter authorizing GST portal registration.", icon: "FileText" },
  { id: "comp-gst-consent", title: "GST Consent Letter", cat: "compliance", desc: "Consent from owner for GST address validation.", icon: "FileText" },
  { id: "comp-auth-decl", title: "Authorized Signatory Declaration", cat: "compliance", desc: "Declaration designating the primary user for filings.", icon: "FileText" },
  { id: "comp-pf-auth", title: "PF Authorization Letter", cat: "compliance", desc: "Letter authorizing executive for PF portal filings.", icon: "FileText" },
  { id: "comp-esic-auth", title: "ESIC Authorization Letter", cat: "compliance", desc: "Letter authorizing ESIC employer registration.", icon: "FileText" },
  { id: "comp-iec-auth", title: "IEC Authorization Letter", cat: "compliance", desc: "Importer-Exporter Code application authorization.", icon: "FileText" },
  { id: "comp-msme-decl", title: "MSME Declaration", cat: "compliance", desc: "Vendor declaration of MSME status under MSMED Act.", icon: "CheckCircle2" },
  { id: "comp-udyam", title: "Udyam Registration Declaration", cat: "compliance", desc: "Declaration for Udyam micro-enterprise profiling.", icon: "FileText" },
  { id: "comp-pt-auth", title: "Professional Tax Authorization", cat: "compliance", desc: "Letter authorizing PT registration filings.", icon: "FileText" },
  { id: "comp-shop-est", title: "Shop & Establishment Authorization", cat: "compliance", desc: "Authorization for local Gumasta/Shop license.", icon: "Building2" },
  { id: "comp-kyc-decl", title: "Bank KYC Declaration", cat: "compliance", desc: "Declaration for current bank account operations.", icon: "FileText" },
  { id: "comp-benefit-owner", title: "Beneficial Ownership Declaration", cat: "compliance", desc: "Significant Beneficial Owner (MGT-6) declaration.", icon: "FileText" },
  { id: "comp-rpt-disc", title: "Related Party Disclosure", cat: "compliance", desc: "Director disclosure of interest in corporate deals.", icon: "FileText" },
  { id: "comp-conflict", title: "Conflict of Interest Declaration", cat: "compliance", desc: "Statutory conflict disclosure under Companies Act.", icon: "Scale" },
  { id: "comp-decl", title: "Compliance Declaration", cat: "compliance", desc: "Declaration verifying general statutory compliances.", icon: "CheckCircle2" },
  { id: "comp-reg-check", title: "Statutory Register Checklist", cat: "compliance", desc: "Audit checklist of registers to maintain at office.", icon: "ClipboardCheck" },
  { id: "comp-ann-check", title: "Annual Compliance Checklist", cat: "compliance", desc: "Annual check for ROC, Taxation & Labor laws.", icon: "ClipboardCheck" },
  { id: "comp-dir-kyc", title: "Director KYC Reminder Letter", cat: "compliance", desc: "Notice regarding annual DIR-3 KYC compliance.", icon: "Calendar" },

  // NOTICES
  { id: "not-demand", title: "Payment Demand Notice", cat: "notices", desc: "Formal notice demanding settlement of outstanding dues.", icon: "Scale" },
  { id: "not-invoice", title: "Outstanding Invoice Notice", cat: "notices", desc: "Friendly yet firm outstanding payment reminder notice.", icon: "FileText" },
  { id: "not-breach", title: "Breach of Contract Notice", cat: "notices", desc: "Legal notice demanding rectification of contract breach.", icon: "Scale" },
  { id: "not-termination", title: "Termination Notice", cat: "notices", desc: "Notice terminating vendor or business partnership.", icon: "X" },
  { id: "not-rent-demand", title: "Rent Demand Notice", cat: "notices", desc: "Landlord notice demanding payment of overdue rent.", icon: "Building2" },
  { id: "not-eviction", title: "Eviction Notice", cat: "notices", desc: "Notice demanding tenant vacating on expiration/breach.", icon: "X" },
  { id: "not-cheque", title: "Cheque Dishonour Notice", cat: "notices", desc: "Section 138 statutory notice demanding payment.", icon: "Scale" },
  { id: "not-cease-desist", title: "Defamation Cease & Desist Notice", cat: "notices", desc: "Notice demanding removal of defamatory content.", icon: "Scale" },
  { id: "not-ip-infringe", title: "Intellectual Property Infringement Notice", cat: "notices", desc: "Notice demanding termination of trademark infringement.", icon: "ShieldCheck" },
  { id: "not-consumer", title: "Consumer Complaint Notice", cat: "notices", desc: "Pre-complaint statutory notice to service provider.", icon: "Scale" },
  { id: "not-misconduct", title: "Employment Misconduct Notice", cat: "notices", desc: "HR notice listing disciplinary misconduct allegations.", icon: "X" },
  { id: "not-showcause", title: "Show Cause Notice", cat: "notices", desc: "Notice requesting explanation prior to disciplinary action.", icon: "Scale" },
  { id: "not-recovery", title: "Recovery Notice", cat: "notices", desc: "Statutory notice of legal recovery filings.", icon: "Scale" },
  { id: "not-final-rem", title: "Final Payment Reminder", cat: "notices", desc: "Notice prior to initiation of legal recovery proceedings.", icon: "FileText" },
  { id: "not-arbitration", title: "Notice of Arbitration", cat: "notices", desc: "Notice invoking the arbitration clause under contract.", icon: "Scale" },
  { id: "not-perf", title: "Notice for Specific Performance", cat: "notices", desc: "Legal demand for specific action under agreement.", icon: "Scale" },
  { id: "not-refund", title: "Notice for Refund Demand", cat: "notices", desc: "Formal notice demanding refund for defective goods.", icon: "Scale" },

  // FINANCE
  { id: "fin-loan-agmt", title: "Loan Agreement", cat: "finance", desc: "Bilateral secure or unsecured loan agreement deed.", icon: "ClipboardCheck" },
  { id: "fin-promissory", title: "Promissory Note", cat: "finance", desc: "Unconditional promise to pay on demand or fixed date.", icon: "FileText" },
  { id: "fin-undertaking", title: "Payment Undertaking", cat: "finance", desc: "Statutory undertaking of payments schedule.", icon: "FileText" },
  { id: "fin-debt-ack", title: "Debt Acknowledgment", cat: "finance", desc: "Deed acknowledging outstanding commercial debt.", icon: "FileText" },
  { id: "fin-personal-gtd", title: "Personal Guarantee", cat: "finance", desc: "Guarantor personal guarantee for corporate borrowings.", icon: "ShieldCheck" },
  { id: "fin-corp-gtd", title: "Corporate Guarantee", cat: "finance", desc: "Guarantee deed between parent and subsidiary lender.", icon: "ShieldCheck" },
  { id: "fin-settlement", title: "Payment Settlement Agreement", cat: "finance", desc: "Agreement settling debts out of court.", icon: "ClipboardCheck" },
  { id: "fin-invoice-tc", title: "Invoice Terms & Conditions", cat: "finance", desc: "Standard legal disclaimer and billing policies.", icon: "FileText" },
  { id: "fin-dep-receipt", title: "Security Deposit Receipt", cat: "finance", desc: "Standard voucher verifying security deposit receipt.", icon: "CheckCircle2" },
  { id: "fin-adv-receipt", title: "Advance Payment Receipt", cat: "finance", desc: "Payment receipt verifying cash/transfer advance.", icon: "CheckCircle2" },
  { id: "fin-repayment", title: "Loan Repayment Schedule", cat: "finance", desc: "Schedule sheet details for EMI/interest payouts.", icon: "Calendar" },
  { id: "fin-term-sheet", title: "Investment Term Sheet", cat: "finance", desc: "Startup investment term sheet for equity fundraising.", icon: "FileText" },
  { id: "fin-share-sub", title: "Share Subscription Agreement", cat: "finance", desc: "SSA details for investor capital infusion.", icon: "ClipboardCheck" },
  { id: "fin-share-purch", title: "Share Purchase Agreement", cat: "finance", desc: "SPA details for secondary share sale transfers.", icon: "ClipboardCheck" },
  { id: "fin-convertible", title: "Convertible Note Agreement", cat: "finance", desc: "Startup seed funding convertible note deed.", icon: "ClipboardCheck" },

  // INTELLECTUAL PROPERTY
  { id: "ip-tm-assign", title: "Trademark Assignment Agreement", cat: "ip", desc: "Deed assigning ownership of registered trademark.", icon: "ShieldCheck" },
  { id: "ip-cop-assign", title: "Copyright Assignment Agreement", cat: "ip", desc: "Deed transferring copyright rights of works.", icon: "ShieldCheck" },
  { id: "ip-assign", title: "Intellectual Property Assignment", cat: "ip", desc: "Standard IP assignment deed for startup founders.", icon: "ShieldCheck" },
  { id: "ip-tm-auth", title: "Trademark Use Authorization", cat: "ip", desc: "Consent letter to utilize registered trademark logos.", icon: "FileText" },
  { id: "ip-brand-license", title: "Brand Licensing Agreement", cat: "ip", desc: "Agreement licensing brand rights to third parties.", icon: "ClipboardCheck" },
  { id: "ip-software-lic", title: "Software Licensing Agreement", cat: "ip", desc: "EULA / SAAS licensing and subscription contract.", icon: "ClipboardCheck" },
  { id: "ip-content-lic", title: "Content Licensing Agreement", cat: "ip", desc: "Agreement licensing video, text or media rights.", icon: "ClipboardCheck" },
  { id: "ip-invention", title: "Invention Assignment Agreement", cat: "ip", desc: "Assigning employee/vendor inventions to company.", icon: "ShieldCheck" },
  { id: "ip-terms", title: "Website Terms of Use", cat: "ip", desc: "Standard legal terms of service for startup portal.", icon: "FileText" },
  { id: "ip-privacy", title: "Privacy Policy", cat: "ip", desc: "GDPR & DPDP Act compliant privacy policy code.", icon: "FileText" },
  { id: "ip-cookie", title: "Cookie Policy", cat: "ip", desc: "Cookie tracking preferences disclosure policy.", icon: "FileText" },
  { id: "ip-refund", title: "Refund Policy", cat: "ip", desc: "E-commerce refund, cancellation & return rules.", icon: "FileText" },
  { id: "ip-disclaimer", title: "Disclaimer", cat: "ip", desc: "Website legal liability disclaimer text.", icon: "FileText" },
  { id: "ip-dpa", title: "Data Processing Agreement", cat: "ip", desc: "Data protection agreement for vendors handling user data.", icon: "ClipboardCheck" },
  { id: "ip-confidentiality", title: "Confidentiality & IP Agreement", cat: "ip", desc: "Combined employee confidentiality and IP covenant.", icon: "ShieldCheck" }
];

// 7 CORE TEMPLATES FIELDS SCHEMA
const coreFields: Record<string, FormField[]> = {
  "office-noc": [
    { id: "proposedName", label: "Proposed Company Name", type: "text", required: true, placeholder: "e.g. Acme Tech Pvt Ltd" },
    { id: "applicantName", label: "Applicant or Director Name", type: "text", required: true, placeholder: "Enter director's name" },
    { id: "ownerName", label: "Property Owner Name", type: "text", required: true, placeholder: "Enter landlord's full name" },
    { id: "premisesAddress", label: "Full Registered Office Address", type: "textarea", required: true, placeholder: "Enter full premises address..." },
    { id: "relationship", label: "Legal Relationship", type: "select", required: true, options: ["Tenant", "Licensee", "Promoter", "Family Member", "Authorized Occupant"], placeholder: "Select relationship..." },
    { id: "otherRelationship", label: "Specify Relationship (If Other)", type: "text", required: false, placeholder: "Specify relationship..." },
    { id: "propertyDescription", label: "Property Description", type: "text", required: false, placeholder: "e.g. Flat No. 402, 4th Floor", helperText: "Optional detailed block details" },
    { id: "docDate", label: "Date of Execution", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { id: "docPlace", label: "Place of Execution", type: "text", required: true, placeholder: "e.g. New Delhi" }
  ],
  "founders-deed": [
    { id: "proposedName", label: "Proposed Brand Prefix", type: "text", required: true, placeholder: "e.g. Acme Tech" },
    { id: "founderA", label: "Founder A Name", type: "text", required: true, placeholder: "CEO / Primary Founder" },
    { id: "founderB", label: "Founder B Name", type: "text", required: true, placeholder: "COO / Co-Founder" },
    { id: "equitySplit", label: "Equity Split Ratio", type: "select", required: true, options: ["50/50", "60/40", "70/30", "Custom"], defaultValue: "50/50" },
    { id: "customSplit", label: "Custom Ratio (e.g. 65/35)", type: "text", required: false, placeholder: "e.g. 65/35" },
    { id: "vestingEnabled", label: "Enable 4-Year Vesting with 1-Year Cliff", type: "checkbox", required: false, defaultValue: "true" },
    { id: "docDate", label: "Date of Agreement", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { id: "docPlace", label: "Place of Execution", type: "text", required: true, placeholder: "e.g. Mumbai" }
  ],
  "board-resolution": [
    { id: "companyName", label: "Company Name", type: "text", required: true, placeholder: "e.g. Acme Technologies Private Limited" },
    { id: "companyCin", label: "Corporate Identification Number (CIN)", type: "text", required: true, placeholder: "e.g. U72900DL2024PTC123456" },
    { id: "premisesAddress", label: "Registered Office Address", type: "textarea", required: true, placeholder: "Registered corporate address" },
    { id: "meetingDate", label: "Meeting Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { id: "meetingTime", label: "Meeting Time", type: "text", required: true, placeholder: "e.g. 11:00 AM" },
    { id: "meetingLocation", label: "Meeting Location", type: "text", required: true, placeholder: "e.g. Registered Office address" },
    { id: "resolutionType", label: "Resolution Type", type: "select", required: true, options: ["Ordinary Resolution", "Special Resolution"], defaultValue: "Ordinary Resolution" },
    { id: "resolutionSubject", label: "Resolution Subject Description", type: "textarea", required: true, placeholder: "Describe what is being resolved..." },
    { id: "authorizedPerson", label: "Authorized Person Name", type: "text", required: true, placeholder: "Who is authorized to file this?" },
    { id: "directorNames", label: "Director Names (comma separated)", type: "text", required: true, placeholder: "e.g. John Doe, Sarah Smith" },
    { id: "chairpersonName", label: "Chairperson Name", type: "text", required: true, placeholder: "Who presided over the meeting?" },
    { id: "docDate", label: "Effective Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] }
  ],
  "nda": [
    { id: "disclosingParty", label: "Disclosing Party Name", type: "text", required: true, placeholder: "Disclosing entity / person" },
    { id: "receivingParty", label: "Receiving Party Name", type: "text", required: true, placeholder: "Receiving entity / person" },
    { id: "purposeOfDisclosure", label: "Purpose of Disclosure", type: "text", required: true, placeholder: "e.g. evaluating a prospective investment/JV" },
    { id: "confidentialDescription", label: "Confidential Information Description", type: "textarea", required: true, placeholder: "e.g. source code, proprietary algorithms, financial metrics" },
    { id: "effectiveDate", label: "Effective Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { id: "period", label: "Confidentiality Term", type: "select", required: true, options: ["2 Years", "3 Years", "5 Years", "Indefinite"], defaultValue: "3 Years" },
    { id: "governingLaw", label: "Governing Law State", type: "text", required: true, placeholder: "e.g. Delhi", defaultValue: "India" },
    { id: "jurisdiction", label: "Jurisdiction City", type: "text", required: true, placeholder: "e.g. New Delhi" },
    { id: "ndaType", label: "NDA Structure Type", type: "select", required: true, options: ["One-Way NDA", "Mutual NDA"], defaultValue: "Mutual NDA" }
  ],
  "employment-offer": [
    { id: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Employer Entity" },
    { id: "candidateName", label: "Candidate Name", type: "text", required: true, placeholder: "Full Name of Employee" },
    { id: "designation", label: "Designation Offered", type: "text", required: true, placeholder: "e.g. Senior Software Engineer" },
    { id: "department", label: "Department", type: "text", required: true, placeholder: "e.g. Engineering" },
    { id: "joiningDate", label: "Joining Date", type: "date", required: true },
    { id: "workLocation", label: "Work Location Office", type: "text", required: true, placeholder: "e.g. Bangalore" },
    { id: "employmentType", label: "Employment Type", type: "select", required: true, options: ["Full-Time Employee", "Part-Time Employee", "Contract Retainer"], defaultValue: "Full-Time Employee" },
    { id: "probation", label: "Probation Period", type: "select", required: true, options: ["No Probation", "3 Months", "6 Months"], defaultValue: "6 Months" },
    { id: "salary", label: "Salary Offered (Annual CTC in INR)", type: "number", required: true, placeholder: "e.g. 1200000" },
    { id: "reportingManager", label: "Reporting Manager", type: "text", required: true, placeholder: "Name and Designation of Manager" },
    { id: "noticePeriod", label: "Notice Period Duration", type: "select", required: true, options: ["15 Days", "30 Days", "60 Days", "90 Days"], defaultValue: "60 Days" },
    { id: "benefits", label: "Additional Benefits", type: "textarea", required: false, placeholder: "e.g. Health Insurance, Performance Bonus" },
    { id: "offerValidity", label: "Offer Validity Expiration Date", type: "date", required: true }
  ],
  "service-agreement": [
    { id: "providerName", label: "Service Provider Name", type: "text", required: true, placeholder: "Consultant / Agency Entity" },
    { id: "clientName", label: "Client Name", type: "text", required: true, placeholder: "Client Corporate Name" },
    { id: "scope", label: "Detailed Scope of Services", type: "textarea", required: true, placeholder: "Describe the tasks/services to be rendered..." },
    { id: "joiningDate", label: "Start Date of Agreement", type: "date", required: true },
    { id: "endDate", label: "End Date of Agreement", type: "date", required: false, placeholder: "Leave blank if perpetual" },
    { id: "salary", label: "Service Fee Amount (INR)", type: "number", required: true, placeholder: "Service fee per milestone/month" },
    { id: "paymentTerms", label: "Payment Schedule Terms", type: "select", required: true, options: ["Within 15 days of Invoice", "Within 30 days of Invoice", "Prepaid Advance"], defaultValue: "Within 30 days of Invoice" },
    { id: "deliverables", label: "Milestone Deliverables", type: "textarea", required: true, placeholder: "List key delivery targets..." },
    { id: "noticePeriod", label: "Notice Period for Termination", type: "select", required: true, options: ["15 Days", "30 Days", "60 Days"], defaultValue: "30 Days" },
    { id: "governingLaw", label: "Governing Law State", type: "text", required: true, placeholder: "e.g. Karnataka", defaultValue: "India" },
    { id: "jurisdiction", label: "Jurisdiction City", type: "text", required: true, placeholder: "e.g. Bangalore" }
  ],
  "rent-agreement": [
    { id: "ownerName", label: "Landlord Name", type: "text", required: true, placeholder: "Full Name of Owner" },
    { id: "applicantName", label: "Tenant Name", type: "text", required: true, placeholder: "Full Name of Tenant" },
    { id: "premisesAddress", label: "Full Leased Property Address", type: "textarea", required: true, placeholder: "Address of rental unit" },
    { id: "monthlyRent", label: "Monthly Rent Amount (INR)", type: "number", required: true, placeholder: "Monthly rental amount" },
    { id: "deposit", label: "Security Deposit Amount (INR)", type: "number", required: true, placeholder: "Interest-free refundable deposit" },
    { id: "joiningDate", label: "Lease Start Date", type: "date", required: true },
    { id: "leaseTerm", label: "Lease Term Duration", type: "select", required: true, options: ["11 Months", "2 Years", "3 Years", "5 Years"], defaultValue: "11 Months" },
    { id: "rentDueDay", label: "Rent Due Date (Day of Month)", type: "number", required: true, placeholder: "e.g. 5", defaultValue: "5" },
    { id: "maintenance", label: "Maintenance Charges Covered By", type: "select", required: true, options: ["Included in Rent", "Paid Separately by Tenant"], defaultValue: "Included in Rent" },
    { id: "lockin", label: "Lock-in Period", type: "select", required: true, options: ["None", "3 Months", "6 Months", "1 Year"], defaultValue: "None" },
    { id: "noticePeriod", label: "Termination Notice Period", type: "select", required: true, options: ["1 Month", "2 Months", "3 Months"], defaultValue: "1 Month" },
    { id: "permittedUse", label: "Permitted Use of Property", type: "select", required: true, options: ["Commercial Office Space", "Residential Use", "Retail Shop"], defaultValue: "Commercial Office Space" },
    { id: "jurisdiction", label: "Governing Jurisdiction City", type: "text", required: true, placeholder: "City local courts" }
  ],
  "legal-notice": [
    { id: "applicantName", label: "Sender (Notice Issuer)", type: "text", required: true, placeholder: "Client name" },
    { id: "premisesAddress", label: "Sender Full Address", type: "textarea", required: true, placeholder: "Notice issuer address" },
    { id: "ownerName", label: "Recipient (Defaulting Party)", type: "text", required: true, placeholder: "Full Name of recipient" },
    { id: "propertyDescription", label: "Recipient Full Address", type: "text", required: true, placeholder: "Recipient physical location address" },
    { id: "proposedName", label: "Notice Subject Subject line", type: "text", required: true, placeholder: "e.g. Demanding recovery of unpaid invoices" },
    { id: "factualBackground", label: "Factual Background details", type: "textarea", required: true, placeholder: "Describe details of contract, invoice and default..." },
    { id: "breachCause", label: "Nature of Breach / Default", type: "textarea", required: true, placeholder: "What clause was violated or how long payment is overdue..." },
    { id: "salary", label: "Unpaid / Claim Amount (INR)", type: "number", required: false, placeholder: "e.g. 500000" },
    { id: "complianceDeadline", label: "Compliance Period (Days)", type: "select", required: true, options: ["7 Days", "15 Days", "30 Days"], defaultValue: "15 Days" },
    { id: "advocateName", label: "Advocate / Representative Name", type: "text", required: true, placeholder: "Advocate name issuing notice" },
    { id: "docPlace", label: "Place of Notice", type: "text", required: true, placeholder: "e.g. Hyderabad" },
    { id: "docDate", label: "Date of Notice", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] }
  ]
};

// Generic fields fallback for any other template
const genericFields = (title: string): FormField[] => [
  { id: "firstParty", label: "First Party Name", type: "text", required: true, placeholder: "Initiating Company / Individual" },
  { id: "secondParty", label: "Second Party Name", type: "text", required: true, placeholder: "Recipient / Counterparty Name" },
  { id: "companyName", label: "Proposed Company Name (If any)", type: "text", required: false, placeholder: "e.g. Acme Brands Pvt Ltd" },
  { id: "effectiveDate", label: "Effective Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
  { id: "governingLaw", label: "Governing Law / State", type: "text", required: true, defaultValue: "India", placeholder: "e.g. Maharashtra" },
  { id: "docPlace", label: "Execution Place", type: "text", required: true, placeholder: "e.g. Mumbai" },
  { id: "detailedPurpose", label: "Special Clause / Purpose Description", type: "textarea", required: false, placeholder: "Describe the core arrangement or obligations in 1-2 paragraphs..." }
];

export const documentTemplates: DocumentTemplate[] = rawTemplates.map((t) => {
  const isCore = !!coreFields[t.id];
  const isPop = t.cat === "popular";
  const cat = isPop ? "popular" : t.cat;

  return {
    id: t.id,
    title: t.title,
    category: cat,
    isPopular: isPop || rawTemplates.some(p => p.cat === "popular" && p.id === t.id),
    description: t.desc,
    icon: t.icon,
    fields: isCore ? coreFields[t.id] : genericFields(t.title)
  };
});
