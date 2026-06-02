import React, { useState, useEffect } from "react";
import { Building2, Check, Clock, ShieldAlert, Users, Award, ShieldCheck, Milestone, ArrowRight, CornerDownRight, Sparkles, Search, Lock, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Star, Shield, Database, Landmark, TrendingUp, Scale, FileText, Heart, X, ArrowLeft } from "lucide-react";
import { FirmOrder } from "../types";
import { motion } from "motion/react";
import { useLang } from "../lib/LanguageContext";
import { useAppNavigate } from "../lib/useAppNavigate";
const getTranslatedService = (service: any, lang: string) => {
  if (lang !== "hi") return service;

  const translationsMap: Record<string, any> = {
    "pvt-ltd": {
      name: "प्राइवेट लिमिटेड कंपनी (Pvt Ltd)",
      timeline: "7–10 वर्किंग दिन",
      minDirectors: "न्यूनतम 2 डायरेक्टर",
      description: "स्टार्टअप्स और बढ़ते व्यवसायों के लिए सबसे लोकप्रिय संरचना।",
      badge: "सबसे लोकप्रिय",
      features: [
        "अलग कानूनी पहचान (Separate Legal Entity)",
        "सीमित दायित्व सुरक्षा (Limited Liability)",
        "निवेशक पूँजी जुटाना बेहद आसान"
      ],
      detailedAbout: "एक प्राइवेट लिमिटेड कंपनी (Pvt Ltd) भारत में स्टार्टअप और छोटे-मध्यम उद्योगों के लिए सबसे पसंदीदा बिजनेस संरचना है। यह लिमिटेड लायबिलिटी प्रोटेक्शन, अलग कानूनी पहचान और वेंचर कैपिटल फंड जुटाने की सुविधा प्रदान करती है। यह कंपनी अधिनियम 2013 के तहत कॉर्पोरेट मामलों के मंत्रालय (MCA) द्वारा पंजीकृत की जाती है।",
      keyAdvantages: [
        "अलग कानूनी पहचान (Separate Legal Entity)",
        "लिमिटेड लायबिलिटी सुरक्षा (Limited Liability)",
        "स्टार्टअप फंडिंग जुटाने में बेहद आसान",
        "स्थायित्व और निरंतरता (Perpetual Succession)",
        "स्टार्टअप इंडिया योजना के लिए योग्य"
      ],
      documents: [
        "पैन कार्ड (PAN Card)",
        "आधार कार्ड / पासपोर्ट",
        "बिजली/पानी का बिल (Utility Bill)",
        "बैंक स्टेटमेंट (Bank Statement)",
        "प्रॉपर्टी ओनर से एनओसी (NOC)"
      ]
    },
    "llp": {
      name: "लिमिटेड लायबिलिटी पार्टनरशिप (LLP)",
      timeline: "8–12 वर्किंग दिन",
      minDirectors: "न्यूनतम 2 पार्टनर्स",
      description: "कम प्रशासनिक नियमों के साथ साझेदारी का सबसे आधुनिक रूप।",
      badge: "पसंदीदा विकल्प",
      features: [
        "पार्टनर्स का सीमित दायित्व (Limited Liability)",
        "अलग कानूनी पहचान (Separate Legal Entity)",
        "कोई न्यूनतम पूंजी आवश्यकता नहीं"
      ],
      detailedAbout: "लिमिटेड लायबिलिटी पार्टनरशिप (LLP) पारंपरिक पार्टनरशिप फर्म और प्राइवेट लिमिटेड कंपनी का एक बेहतरीन मिश्रण है। यह पार्टनर्स को लिमिटेड लायबिलिटी प्रदान करती है जबकि इसके संचालन के नियम अत्यंत लचीले होते हैं।",
      keyAdvantages: [
        "पार्टनर्स का सीमित दायित्व (Limited Liability)",
        "कम ऑडिट और कम्प्लायंस का खर्च",
        "कोई न्यूनतम पूंजी आवश्यकता नहीं",
        "पार्टनरशिप एग्रीमेंट में लचीलापन",
        "अलग कानूनी पहचान (Separate Legal Entity)"
      ],
      documents: [
        "पैन कार्ड (PAN Card)",
        "आधार कार्ड / वोटर आईडी",
        "बिजली/पानी का बिल (Utility Bill)",
        "बैंक स्टेटमेंट (Bank Statement)",
        "पार्टनरशिप एग्रीमेंट ड्राफ्ट"
      ]
    },
    "opc": {
      name: "वन पर्सन कंपनी (OPC)",
      timeline: "7–10 वर्किंग दिन",
      minDirectors: "1 डायरेक्टर और 1 नॉमिनी",
      description: "एकल संस्थापकों के लिए सीमित दायित्व वाली कंपनी।",
      badge: "एकल फाउंडर्स हेतु",
      features: [
        "100% नियंत्रण एवं स्वामित्व",
        "सीमित दायित्व सुरक्षा (Limited Liability)",
        "अलग कानूनी पहचान (Separate Legal Entity)"
      ],
      detailedAbout: "वन पर्सन कंपनी (OPC) एक व्यक्ति को एक कंपनी संरचना बनाने की अनुमति देती है। यह एकल स्वामित्व (Proprietorship) के नियंत्रण को कॉर्पोरेट संरचना के फायदों के साथ जोड़ती है।",
      keyAdvantages: [
        "100% नियंत्रण एवं पूर्ण स्वामित्व",
        "सीमित दायित्व सुरक्षा (Limited Liability)",
        "अलग कानूनी पहचान (Separate Legal Entity)",
        "सालाना कम्प्लायंस में छूट",
        "बैंक लोन मिलने में आसानी"
      ],
      documents: [
        "पैन कार्ड (PAN Card)",
        "आधार कार्ड / वोटर आईडी",
        "बिजली/पानी का बिल (Utility Bill)",
        "बैंक स्टेटमेंट (Bank Statement)",
        "नॉमिनी की सहमति (Nominee Consent)"
      ]
    },
    "partnership": {
      name: "पार्टनरशिप फर्म (Partnership)",
      timeline: "3–5 वर्किंग दिन",
      minDirectors: "न्यूनतम 2 पार्टनर्स",
      description: "छोटे व्यापारियों के लिए सरल और त्वरित बिज़नेस पार्टनरशिप।",
      badge: "त्वरित पंजीकरण",
      features: [
        "न्यूनतम सालाना कम्प्लायंस",
        "पार्टनरशिप डीड के साथ आसान संचालन",
        "कम शुरुआती सेटअप लागत"
      ],
      detailedAbout: "पार्टनरशिप फर्म भारत में बिज़नेस शुरू करने के सबसे पुराने और सरल तरीकों में से एक है। इसमें दो या दो से अधिक व्यक्ति आपस में मुनाफा बांटने की सहमति के साथ व्यापार शुरू करते हैं।",
      keyAdvantages: [
        "बहुत कम सालाना कम्प्लायंस",
        "आसान पार्टनरशिप डीड द्वारा संचालन",
        "शुरुआती सेटअप की कम लागत",
        "त्वरित पंजीकरण प्रक्रिया",
        "आसान बिज़नेस बंद करने की प्रक्रिया"
      ],
      documents: [
        "पैन कार्ड (PAN Card)",
        "पार्टनर्स के आधार कार्ड",
        "बिजली/पानी का बिल (Utility Bill)",
        "साझेदारी विलेख (Partnership Deed)",
        "एनओसी (NOC)"
      ]
    },
    "section8": {
      name: "सेक्शन 8 एनजीओ (Section 8 NGO)",
      timeline: "15–20 वर्किंग दिन",
      minDirectors: "न्यूनतम 2 डायरेक्टर्स",
      description: "धर्मार्थ या सामाजिक कार्यों के लिए गैर-लाभकारी संस्था (NGO)।",
      badge: "गैर-लाभकारी संस्था",
      features: [
        "इनकम टैक्स में छूट (80G/12A)",
        "प्रीमियम क्रेडिबिलिटी",
        "नाम के पीछे 'Limited' लगाना जरूरी नहीं"
      ],
      detailedAbout: "सेक्शन 8 कंपनी एक गैर-लाभकारी संगठन (NGO) है जिसकी स्थापना कला, विज्ञान, धर्मार्थ, शिक्षा या पर्यावरण संरक्षण के लिए की जाती है। इसका कोई भी मुनाफा सदस्यों को लाभांश (Dividend) के रूप में नहीं बांटा जाता।",
      keyAdvantages: [
        "इनकम टैक्स में बड़ी छूट (80G/12A)",
        "विदेशी अनुदान (FCRA) के लिए योग्य",
        "प्रीमियम क्रेडिबिलिटी",
        "नाम के पीछे 'Limited' लगाना जरूरी नहीं",
        "सरकारी अनुदान के लिए प्राथमिक पात्रता"
      ],
      documents: [
        "पैन कार्ड (PAN Card)",
        "आधार कार्ड / वोटर आईडी",
        "बिजली/पानी का बिल (Utility Bill)",
        "संस्था के उद्देश्य (MOA/AOA)",
        "3 साल का अनुमानित बजट"
      ]
    },
    "virtual-cfo": {
      name: "वर्चुअल सीएफओ सेवाएं (Virtual CFO)",
      timeline: "सालाना / मासिक सब्सक्रिप्शन",
      minDirectors: "कस्टम आवर्ती सेवाएं",
      description: "स्टार्टअप्स के लिए पार्ट-टाइम सीए (CA) वित्तीय सलाहकार सेवाएं।",
      badge: "हाई ग्रोथ हेतु",
      features: [
        "टैक्स प्लानिंग और सेविंग सलाह",
        "नियमित बुककीपिंग एवं जीएसटी रिटर्न",
        "इन्वेस्टर रिपोर्टिंग एवं कैश-फ्लो मैनेजमेंट"
      ],
      detailedAbout: "वर्चुअल सीएफओ सेवाएं छोटे व्यवसायों और स्टार्टअप्स को एक पूर्ण-कालिक सीएफओ की भारी लागत के बिना एक वरिष्ठ वित्तीय सलाहकार (CA) की विशेषज्ञता प्रदान करती हैं।",
      keyAdvantages: [
        "टैक्स प्लानिंग और लीगल सेविंग सलाह",
        "नियमित बुककीपिंग एवं जीएसटी कम्प्लायंस",
        "कैश-फ्लो और वर्किंग कैपिटल मैनेजमेंट",
        "इन्वेस्टर रिपोर्टिंग एवं बोर्ड मीटिंग्स सपोर्ट",
        "वित्तीय जोखिमों से पूर्ण सुरक्षा"
      ],
      documents: [
        "कंपनी रजिस्ट्रेशन सर्टिफिकेट",
        "पिछले 6 महीने का बैंक स्टेटमेंट",
        "जीएसटी लॉगिन क्रेडेंशियल",
        "मौजूदा बुककीपिंग डेटा",
        "टैन/पैन क्रेडेंशियल्स"
      ]
    }
  };

  const tVal = translationsMap[service.id];
  if (!tVal) return service;

  return {
    ...service,
    ...tVal
  };
};

interface RegistrationServicesProps {
  setActiveTab?: (tab: string) => void;
  prefilledCompanyName?: string;
  prefilledEntityType?: string;
}

const serviceCatalog = [
  {
    id: "pvt-ltd",
    name: "Private Limited Company",
    category: "private-corporate",
    pricing: "₹999*",
    timeline: "7–10 Working Days",
    minDirectors: "2 Directors minimum",
    minDirectorsNumber: "2",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    taxBenefit: "Startup India",
    detailedAbout: "A Private Limited Company (Pvt Ltd) is the most preferred business structure for startups and SMEs in India. It offers limited liability protection, separate legal entity status, and the ability to raise venture capital. Governed by the Companies Act 2013 and registered with the Ministry of Corporate Affairs (MCA), it provides perpetual succession and credibility with investors, banks, and clients.",
    keyAdvantages: [
      "Separate legal entity status",
      "Limited liability protection",
      "Easier to raise startup capital",
      "Perpetual succession",
      "Startup India eligibility"
    ],
    badge: "Most Popular",
    expert: "D Bhushan",
    rating: 5,
    description: "The gold standard for startups and growing businesses.",
    popular: true,
    features: [
      "Separate legal entity status",
      "Limited liability protection",
      "Easier to raise startup capital"
    ],
    documents: [
      "PAN Card",
      "Aadhaar / Passport",
      "Utility Bill",
      "Bank Statement",
      "NOC from property owner"
    ]
  },
  {
    id: "llp",
    name: "Limited Liability Partnership",
    category: "alternative-entity",
    pricing: "₹1,499*",
    timeline: "10–15 Working Days",
    minDirectors: "2 Partners minimum",
    minDirectorsNumber: "2",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "Lower Tax Rate",
    detailedAbout: "A Limited Liability Partnership (LLP) offers the benefits of limited liability to its partners while allowing them the flexibility of organizing their internal structure as a partnership. It is governed under the Limited Liability Partnership Act 2008 and is highly popular among professional consultancies, service providers, and small family enterprises.",
    keyAdvantages: [
      "No minimum capital requirement",
      "Separate legal entity protection",
      "Lower compliance burden",
      "Flexible profit distribution",
      "Tax benefits on partner remuneration"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 5,
    description: "Flexibility of a partnership with corporate protection.",
    popular: false,
    features: [
      "No minimum capital requirement",
      "Pass-through taxation",
      "Lower compliance burden"
    ],
    documents: [
      "ID & Address proof of all partners",
      "NOC from owner of registered premises",
      "Stamped/Notarized LLP Agreement",
      "PAN card of the partnership firm"
    ]
  },
  {
    id: "opc",
    name: "One Person Company",
    category: "private-corporate",
    pricing: "₹1,299*",
    timeline: "7–12 Working Days",
    minDirectors: "1 Director minimum",
    minDirectorsNumber: "1",
    minCapital: "₹1 Lakh",
    liability: "Limited",
    taxBenefit: "Solo Corporate Tax",
    detailedAbout: "One Person Company (OPC) is a revolutionary structure that allows a single entrepreneur to operate a corporate entity with limited liability protection. It is a refinement of sole proprietorship, eliminating personal asset liabilities while granting standard corporate tax rates and bank financing capabilities.",
    keyAdvantages: [
      "100% control by solo founder",
      "Limited liability protection",
      "Separate legal entity status",
      "Easier bank credit lines",
      "Nominee director safety net"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 4.8,
    description: "Solo founder? Get full corporate protection alone.",
    popular: false,
    features: [
      "Single founder structure",
      "Limited liability protection",
      "Corporate tax rates"
    ],
    documents: [
      "PAN and KYC of the sole shareholder",
      "PAN and KYC of the designated Nominee director",
      "Registered office electricity bill",
      "Consent form of Nominee (Form INC-3)"
    ]
  },
  {
    id: "partnership",
    name: "Partnership Firm",
    category: "alternative-entity",
    pricing: "₹799*",
    timeline: "3–5 Working Days",
    minDirectors: "2 Partners minimum",
    minDirectorsNumber: "2",
    minCapital: "None",
    liability: "Unlimited",
    taxBenefit: "Deed Pass-through",
    detailedAbout: "A Partnership Firm is a popular form of business constitution in India for small-scale ventures. It is structured by a signed partnership deed under the Partnership Act 1932. Partners share mutual agency, liabilities, and direct profits with minimal reporting and zero ROC corporate compliance requirements.",
    keyAdvantages: [
      "Zero corporate registry fees",
      "Minimal reporting compliance",
      "Extremely fast setup desk",
      "Direct profit pass-through",
      "Mutual agency collaboration"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 4.5,
    description: "Simple, fast, and cost-effective for small businesses.",
    popular: false,
    features: [
      "Minimal compliance requirements",
      "Easy and fast formation",
      "Flexible profit sharing"
    ],
    documents: [
      "Signed stamp-paper partnership deed proof",
      "PAN Card of partners",
      "Utility Bill containing office address descriptor",
      "NOC for workspace utility"
    ]
  },
  {
    id: "section8",
    name: "Section 8 Company (NGO)",
    category: "private-corporate",
    pricing: "₹2,499*",
    timeline: "15–20 Working Days",
    minDirectors: "2 Directors minimum",
    minDirectorsNumber: "2",
    minCapital: "None",
    liability: "Limited",
    taxBenefit: "80G Exemption",
    detailedAbout: "A Section 8 Company is structured for promoting charitable objectives like art, commerce, science, education, sports, and social welfare. It obtains a special license from the central government, giving high public credibility, full tax exemptions, and access to domestic/international donations.",
    keyAdvantages: [
      "Charitable non-profit status",
      "12A & 80G tax benefits",
      "No minimum capital limits",
      "High social credibility",
      "Easy domestic/international donation flow"
    ],
    badge: "NGO Special",
    expert: "D Bhushan",
    rating: 5,
    description: "Charitable non-profit status with tax exemptions.",
    popular: false,
    features: [
      "Charitable non-profit status",
      "12A & 80G tax exemptions",
      "High social credibility"
    ],
    documents: [
      "PAN Card & Aadhaar of all Directors",
      "NOC from registered office landlord",
      "Charitable objectives declaration",
      "Rental deed copy"
    ]
  },
  {
    id: "public-ltd",
    name: "Public Limited Company",
    category: "private-corporate",
    pricing: "₹4,999*",
    timeline: "20–25 Working Days",
    minDirectors: "3 Directors minimum",
    minDirectorsNumber: "3",
    minCapital: "₹5 Lakh",
    liability: "Limited",
    taxBenefit: "Listing Eligible",
    detailedAbout: "A Public Limited Company is standard for large-scale operations requiring heavy institutional and public equity capital. Governed under ROC registries, it allows unlimited shareholders, clean transferable shares, high bank creditworthiness, and eligibility for secondary stock exchange listings.",
    keyAdvantages: [
      "Raise large public capital",
      "Freely transferable shares",
      "Unlimited shareholder structure",
      "High creditworthiness with banks",
      "Stock exchange listing eligibility"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 5,
    description: "Raise public capital with unlimited shareholders.",
    popular: false,
    features: [
      "Raise public capital",
      "Transferable shares",
      "Unlimited shareholders"
    ],
    documents: [
      "PAN Card & Aadhaar of all 7+ subscribers",
      "NOC from landlord of premises",
      "Form DIR-2 consent of directors",
      "Initial share capital allotment ledger"
    ]
  },
  {
    id: "annual-compliance",
    name: "Annual Compliances Suite",
    category: "compliance",
    pricing: "₹2,999*",
    timeline: "Ongoing Support",
    minDirectors: "CA Lead Advisory",
    minDirectorsNumber: "CA Lead",
    minCapital: "None",
    liability: "Statutory",
    taxBenefit: "Penalty Shield",
    detailedAbout: "Annual Compliances Suite protects companies in active standing with ROC/MCA registries. It coordinates mandatory financial filing forms (AOC-4, MGT-7), Director KYC updates, statutory balance sheets reconciliations, and board resolution books under elite Chartered Accountants.",
    keyAdvantages: [
      "ROC filings coordination",
      "Zero late penalty guarantees",
      "Pristine company credit rating",
      "Statutory Board books setup",
      "Dedicated CA Lead assigned"
    ],
    badge: "Compliance Special",
    expert: "D Bhushan",
    rating: 5,
    description: "ROC filing, Director KYC, and board meeting minutes.",
    popular: false,
    features: [
      "ROC filing (AOC-4, MGT-7)",
      "Director KYC updates",
      "Mandatory board meetings docs"
    ],
    documents: [
      "Last financial year balance sheets",
      "Current shareholding list",
      "Past board resolution books",
      "GST returns log"
    ]
  },
  {
    id: "gst-tax",
    name: "GST & Tax Registration",
    category: "compliance",
    pricing: "₹499*",
    timeline: "3–5 Working Days",
    minDirectors: "CA Lead Advisory",
    minDirectorsNumber: "CA Lead",
    minCapital: "None",
    liability: "Statutory",
    taxBenefit: "Input Tax Credits",
    detailedAbout: "GST and Statutory Tax Registrations allocate legal tax credentials for business operations. It secures dynamic Goods & Services Tax profiles, activates MSME certifications for government credit benefits, drafts statutory PAN/TAN profiles, and enables smooth inter-state commerce.",
    keyAdvantages: [
      "GSTIN profile activation",
      "MSME certifications advantages",
      "PAN/TAN statutory drafts",
      "Input tax credit eligibility",
      "Inter-state commerce legal clearance"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 4.9,
    description: "GSTIN activation, MSME registration, and PAN/TAN.",
    popular: false,
    features: [
      "GSTIN activation",
      "MSME registration",
      "PAN/TAN drafting support"
    ],
    documents: [
      "PAN Card & Aadhaar of applicant",
      "Bank statement / canceled cheque copy",
      "Electricity bill of premises",
      "NOC from landlord"
    ]
  },
  {
    id: "virtual-cfo",
    name: "Virtual CFO Retainer",
    category: "enterprise-growth",
    pricing: "₹4,999/mo*",
    timeline: "Monthly Retainer",
    minDirectors: "CA Lead Advisory",
    minDirectorsNumber: "CA Lead",
    minCapital: "None",
    liability: "Fiduciary",
    taxBenefit: "Treasury Shield",
    detailedAbout: "Virtual CFO Retainer provides institutional-grade corporate finance strategies without executive hiring liabilities. Structured under senior chartered accountants, it models detailed cash flows, designs capital structures, runs statutory audit controls, and represents management in investor meetings.",
    keyAdvantages: [
      "Institutional cash modeling",
      "Investor pitch preparation",
      "Corporate treasury controls",
      "Fiduciary tax defense",
      "Detailed board performance metrics"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 5,
    description: "Cash flow modeling, treasury operations, and performance reports.",
    popular: false,
    features: [
      "Cash flow modeling",
      "Treasury operations",
      "Board performance reports"
    ],
    documents: [
      "Latest corporate ledger files",
      "GST filings details",
      "Bank accounts dashboard access"
    ]
  },
  {
    id: "virtual-office",
    name: "Virtual Office Address",
    category: "enterprise-growth",
    pricing: "₹999/mo*",
    timeline: "2–3 Working Days",
    minDirectors: "Selected Prime Sites",
    minDirectorsNumber: "Prime Sites",
    minCapital: "None",
    liability: "Lease Isolated",
    taxBenefit: "GST/ROC Compliant",
    detailedAbout: "Virtual Office Address secures legal corporate headquarters in premium commercial hubs (Bangalore, Mumbai, Delhi, Hyderabad) without office lease overheads. It provides certified NOCs, utility bills for GST/ROC registrations, physical mail forwardings, and on-demand board meeting space.",
    keyAdvantages: [
      "GST & ROC compliant address",
      "Certified landlord NOCs",
      "Prime localized trust credentials",
      "Secure physical mail dispatch",
      "Lease liability isolation"
    ],
    badge: "",
    expert: "D Bhushan",
    rating: 4.8,
    description: "GST & ROC compliant addresses with scan/forward support.",
    popular: false,
    features: [
      "GST & ROC compliant addresses",
      "Mail handling & scan",
      "On-demand meeting rooms access"
    ],
    documents: [
      "PAN Card & Aadhaar of applicant",
      "Proposed brand registration letter",
      "Director KYC files"
    ]
  }
];

const entityCatalog = serviceCatalog;

const detailedCatalogData = {
  primary: [
    {
      title: "Private Limited Company (Pvt Ltd)",
      entails: "Full-spectrum structural design of authorized capital, custom Articles of Association (AOA) & Memorandum of Association (MOA), securing Director Identification Numbers (DIN/DSC), name reservation filings, and ROC spice-plus registry lodging.",
      benefits: "Complete separation of personal asset structures from company-tier civil liabilities. Enhances professional trust to raise startup venture capital, set up ESOP pools to retain talent, and secure permanent corporate succession.",
      timeline: "7 - 10 Days",
      complexity: "Premium Core"
    },
    {
      title: "Section 8 Non-Profit Organization",
      entails: "Securing specialized Central Government charitable operating licenses, drafting bespoke altruistic MOA/AOA clauses, installing zero dividend distribution restrictions, and registering internal trustee arrays.",
      benefits: "Entitles the enterprise to absolute corporate tax exemptions, allows receiving institutional philanthropy/foreign donations under regulatory laws, and builds peerless social credibility.",
      timeline: "15 - 20 Days",
      complexity: "Regulatory Elite"
    },
    {
      title: "Public Limited Corporation",
      entails: "Constructing robust corporate prospectus documents, establishing a minimum of 7 shareholders and 3 board directors, configuring public registry disclosures, and filing formal public incorporation articles.",
      benefits: "Grants maximum capacity to raise capital via public subscriptions, permits effortless share liquidations on public stock exchanges, and achieves state-level reputation metrics.",
      timeline: "20 - 25 Days",
      complexity: "Enterprise Class"
    }
  ],
  alternatives: [
    {
      title: "Limited Liability Partnership (LLP)",
      entails: "Drafting high-precision Partnership Agreements reflecting custom dynamic profit shares, issuing Designated Partner IDs (DPIN), registering with local state ROC departments, and generating partner bylaws.",
      benefits: "Isolates partners from liabilities arising from separate partner negligence. Eradicates corporate Dividend Distribution Tax (DDT) and saves statutory audit cost unless volume crosses limits.",
      timeline: "10 - 14 Days",
      complexity: "Agile Structural"
    },
    {
      title: "One Person Company (OPC)",
      entails: "Filing company reservation under single-director directives, preparing nominee successorship contracts (INC-3), and writing specialized corporate safety clauses for single shareholder ownership.",
      benefits: "Bestows absolute single-member control without exposing the individual to sole proprietorship risk, rendering transition into a full-scale multi-director Pvt Ltd seamless.",
      timeline: "8 - 11 Days",
      complexity: "Solo Elite Shield"
    },
    {
      title: "Registered Partnership",
      entails: "Preparing localized partnership deed agreements, executing stamp-duty verification, registering with State Registrar of Firms, and configuring mutual agency bylaws.",
      benefits: "Extremely cost-effective initialization cost with swift setup duration. Minimizes regulatory filing requirements whilst allowing partners to combine talent and capital reserves.",
      timeline: "3 - 5 Days",
      complexity: "Standard Compact"
    },
    {
      title: "Sole Proprietorship Configuration",
      entails: "Establishing legal trade certificate credentials, obtaining MSME Registrations, configuring tax credentials, and registering basic local commercial listings.",
      benefits: "100% control over operational decisions with direct pass-through taxation on individual marginal tiers. Zero standard corporate files or reporting fees.",
      timeline: "2 - 3 Days",
      complexity: "Low Overhead"
    }
  ],
  compliance: [
    {
      title: "Annual ROC Corporate Filings Suite",
      entails: "Coordinating mandatory financial statements (AOC-4) and general entity files (MGT-7), documenting official Board meeting resolutions, filing statutory KYC audits, and organizing company books.",
      benefits: "Prists the company in pristine standing with central registries, averting heavy daily penalty fees, sudden registry strike-offs, or management disqualifications.",
      timeline: "Ongoing Suite",
      complexity: "Statutory Duty"
    },
    {
      title: "Corporate Tax Alignment (GST, TDS & Payroll)",
      entails: "Activating regular Goods and Services tax profiles, provisioning Tax Deduction numbers (TAN) for payroll taxes, filing quarterly schedules, and designing employee benefit systems.",
      benefits: "Full defense against state tax examinations and audits. Authorizes inter-state trading structures and sets up statutory frameworks for hiring high-value talent.",
      timeline: "2 - 4 Days",
      complexity: "Financial Shield"
    },
    {
      title: "Pre-Audit Statutory Reconciliations",
      entails: "Pre-verifying trial ledger logs, checking physical invoice receipts, assessing past tax liability files, and generating a corporate audit safety balance score.",
      benefits: "Halves duration of physical statutory audits, catches bookkeeping leaks before tax officers inspect records, and ensures high credit rating points with lenders.",
      timeline: "5 - 7 Days",
      complexity: "Hardening Checks"
    },
    {
      title: "Intellectual Property & National Trademark Protection",
      entails: "Executing premium brand trademark search records, structuring standard class filings, registering brand IP forms, and defending logos against journal objections.",
      benefits: "Ensures legal monopoly over firm identity tokens, guards brand equity from copycat competitor activity, and formats the trademark as a valuable balance sheet asset.",
      timeline: "1 - 2 Days Filing",
      complexity: "Asset Protection"
    }
  ],
  consultancy: [
    {
      title: "Virtual CFO Services",
      entails: "Strategic cash flow architecture, corporate treasury engineering, modular financial analytics, fundraising preparation, and statutory audit representation managed by elite Chartered Accountants.",
      benefits: "Provides premium institutional-grade financial leadership and structural forecasting without the overheads of a full-time executive salary.",
      timeline: "Ongoing Suite",
      complexity: "C-Suite Strategic"
    },
    {
      title: "Premium Virtual Office Address",
      entails: "Securing premium commercial corporate addresses in premier A-grade business districts (Bangalore, Mumbai, Delhi NCR, Hyderabad) with customized mail dispatch, GST desk setup, and ROC verification compliance.",
      benefits: "Grants instant localized trust credentials and a professional regional corporate base without physical workspace lease liabilities.",
      timeline: "2 - 3 Days",
      complexity: "High-Tier Presence"
    },
    {
      title: "Executive Business Consultancy",
      entails: "Custom operational audits, modular business model stress-testing, strategic growth mapping, brand licensing coordination, and joint-venture architecture design.",
      benefits: "Accelerates scaling timelines, identifies commercial bottlenecks, and structures legal frameworks for complex partnership scaling.",
      timeline: "Modular / Retainer",
      complexity: "Elite Enterprise"
    }
  ]
};

import ContactFormWidget from "./ContactFormWidget";

export default function RegistrationServices({ 
  setActiveTab,
  prefilledCompanyName = "",
  prefilledEntityType = ""
}: RegistrationServicesProps) {
  const navigateToTab = useAppNavigate();
  const [selectedEntityId, setSelectedEntityId] = useState("pvt-ltd");
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedServices, setSavedServices] = useState<string[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [formShake, setFormShake] = useState(false);
  const [nameBlurred, setNameBlurred] = useState(false);
  const [latestBlog, setLatestBlog] = useState<any>(null);

  // Fetch featured insight
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/blog/posts");
        const data = await res.json();
        if (data.success && data.posts && data.posts.length > 0) {
          setLatestBlog(data.posts[0]);
        }
      } catch (err) {
        console.error("Failed to load featured insight:", err);
      }
    }
    fetchLatest();
  }, []);

  // Fee Calculator State
  const [calcEntity, setCalcEntity] = useState("pvt-ltd");
  const [calcDirectors, setCalcDirectors] = useState(2);
  const [calcCapital, setCalcCapital] = useState(100000);
  const [addOns, setAddOns] = useState({
    gst: false,
    trademark: false,
    startupIndia: false,
    virtualOffice: false,
    virtualCFO: false,
  });

  // Name Checker State
  const [checkName, setCheckName] = useState("");
  const [checkIndustry, setCheckIndustry] = useState("Manufacturing");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [checkReport, setCheckReport] = useState<any>(null);

  const handleCheckName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkName.trim()) {
      setFormShake(true);
      setNameBlurred(true);
      setTimeout(() => setFormShake(false), 500);
      return;
    }

    setIsCheckingName(true);
    setCheckReport(null);
    setNameBlurred(false);
    
    // Simulate a highly premium deep-database check for 1.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const response = await fetch("/api/consult/name-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: checkName, 
          entityType: calcEntity === "pvt-ltd" ? "Private Limited Company" : calcEntity === "llp" ? "Limited Liability Partnership" : calcEntity === "opc" ? "One Person Company" : "Partnership Firm", 
          industry: checkIndustry 
        })
      });
      const data = await response.json();
      if (data.success && data.report) {
        setCheckReport(data.report);
      }
    } catch (err) {
      console.error("Name clearance check failed:", err);
    } finally {
      setIsCheckingName(false);
    }
  };

  // Auto-scroll to onboarding form section when prefilled brand name is provided
  useEffect(() => {
    if (prefilledCompanyName) {
      setTimeout(() => {
        const onboardingForm = document.getElementById("onboarding-form-section");
        if (onboardingForm) {
          onboardingForm.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }, [prefilledCompanyName]);

  // Sync selectedEntityId when prefilledEntityType changes
  useEffect(() => {
    if (prefilledEntityType) {
      setSelectedEntityId(prefilledEntityType);
      setCalcEntity(prefilledEntityType);
      setViewMode("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [prefilledEntityType]);

  const getCalculatorPricing = () => {
    let professionalFee = 999;
    let baseGovFee = 1500;
    let minDirectors = 2;

    if (calcEntity === "llp") {
      professionalFee = 1499;
      baseGovFee = 1000;
      minDirectors = 2;
    } else if (calcEntity === "opc") {
      professionalFee = 999;
      baseGovFee = 1200;
      minDirectors = 1;
    } else if (calcEntity === "partnership") {
      professionalFee = 499;
      baseGovFee = 300;
      minDirectors = 2;
    }

    // DIN/DSC Gov fees per Director above minimum
    const extraDirectors = Math.max(0, calcDirectors - minDirectors);
    const directorGovFee = extraDirectors * 500;

    // Capital stamp duties: 0.1% if above 1 Lakh
    const capitalStampDuty = calcCapital > 100000 ? Math.round((calcCapital - 100000) * 0.001) : 0;

    const govFee = baseGovFee + directorGovFee + capitalStampDuty;

    // Addons
    let addOnFee = 0;
    if (addOns.gst) addOnFee += 499;
    if (addOns.trademark) addOnFee += 1999;
    if (addOns.startupIndia) addOnFee += 1499;
    if (addOns.virtualOffice) addOnFee += 999;
    if (addOns.virtualCFO) addOnFee += 2999;

    const subtotal = professionalFee + govFee + addOnFee;
    const discount = Math.round(subtotal * 0.10); // 10% discount
    const total = subtotal - discount;

    return {
      professionalFee,
      govFee,
      addOnFee,
      discount,
      total,
    };
  };

  const { lang } = useLang();
  const activeCatalog = serviceCatalog.map((s) => getTranslatedService(s, lang));
  const pricing = getCalculatorPricing();
  const selectedEntity = activeCatalog.find((e) => e.id === selectedEntityId) || activeCatalog[0];

  return (
    <div className="space-y-12">
      {viewMode === "grid" ? (
        <>
          {/* Animated Premium Dark Hero Card Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full premium-hero-card border rounded-3xl p-8 sm:p-12 pb-16 sm:pb-24 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[420px]"
          >
            {/* Subtle decorative glow backdrops */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-gold/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1e2d5a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            
            <div className="space-y-5 sm:space-y-6 relative z-10 max-w-3xl text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/25 uppercase tracking-widest font-mono">
                <span className="text-brand-gold font-bold">#</span> Premium Legal-Tech Platform
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight serif">
                Architecting India's <br />
                Finest Entity <span className="text-brand-gold italic font-normal font-serif">Within ₹999*</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-xl">
                A state-of-the-art legal-tech environment where premium company formation meets absolute CA-backed compliance. Trusted by 2,000+ ambitious startup founders.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById("service-catalog-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-3 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition transform-gpu cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center gap-2"
                >
                  Explore Services <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => navigateToTab("compliance")}
                  className="px-5 py-3 border border-slate-500 hover:border-brand-gold text-white hover:text-brand-gold font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition transform-gpu cursor-pointer bg-transparent"
                >
                  Compliance Roadmap
                </button>
              </div>
            </div>
            
            {/* Expert Covered Badge (Bottom Right) */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-10 hidden md:block">
              <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl">
                <div className="text-right flex flex-col justify-center">
                  <p className="text-[7.5px] text-slate-400 font-mono tracking-wider uppercase">Expert Covered</p>
                  <p className="text-xs text-white font-bold tracking-wide">100% Satisfaction Guarantee</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center text-black shadow-inner shadow-black/10 shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Animated Overlapping Feasibility Advisor Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl mx-auto z-20 px-2 sm:px-6 mt-[-20px] sm:mt-[-35px] pb-6"
          >
            <div className="premium-advisor-card border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2 text-[9px] font-mono tracking-wider text-[#9E896A] uppercase font-bold text-left pl-1">
                <Search className="w-3.5 h-3.5 text-brand-gold" /> Registrar Name Feasibility Advisor
              </div>
              
              {/* Search form controls */}
              <form onSubmit={handleCheckName} className={`grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end ${formShake ? "form-shake" : ""}`}>
                {/* Business name input */}
                <div className="md:col-span-5 text-left relative">
                  <div className="floating-label-group relative">
                    <input
                      id="proposed-business-name"
                      type="text"
                      placeholder=" "
                      value={checkName}
                      onChange={(e) => setCheckName(e.target.value)}
                      onBlur={() => setNameBlurred(true)}
                      onFocus={() => setNameBlurred(false)}
                      className={`w-full premium-advisor-input rounded-xl px-4 pt-5 pb-2 text-xs outline-none transition-all font-sans pr-10 ${
                        nameBlurred && !checkName.trim() ? "!border-[#C74A4A]" : ""
                      }`}
                    />
                    <label htmlFor="proposed-business-name" className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-brand-gold" /> Proposed Business Name
                    </label>
                    {checkName.trim().length >= 2 && (
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#2C8C5A" opacity="0.15"/>
                        <path d="M5 8l2 2 4-4" stroke="#2C8C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {nameBlurred && !checkName.trim() && (
                    <span className="input-error-tooltip show">Business name is required</span>
                  )}
                </div>
                
                {/* Entity structure select */}
                <div className="md:col-span-3 text-left">
                  <div className="floating-label-group relative">
                    <select
                      id="entity-type-select"
                      value={calcEntity}
                      onChange={(e) => {
                        setCalcEntity(e.target.value);
                        setSelectedEntityId(e.target.value);
                      }}
                      className="w-full premium-advisor-input rounded-xl px-4 pt-5 pb-2 pr-10 text-xs outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="pvt-ltd">Private Limited Company</option>
                      <option value="llp">Limited Liability Partnership</option>
                      <option value="opc">One Person Company</option>
                      <option value="partnership">Partnership Firm</option>
                    </select>
                    <label htmlFor="entity-type-select">Entity Type</label>
                    <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                {/* Industry/Sector select */}
                <div className="md:col-span-3 text-left">
                  <div className="floating-label-group relative">
                    <select
                      id="industry-select"
                      value={checkIndustry}
                      onChange={(e) => setCheckIndustry(e.target.value)}
                      className="w-full premium-advisor-input rounded-xl px-4 pt-5 pb-2 pr-10 text-xs outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="Technology & Software Services">Technology & Software Services</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Finance & Consulting Services">Finance & Consulting Services</option>
                      <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Real Estate & Construction">Real Estate & Construction</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Agriculture & Agritech">Agriculture & Agritech</option>
                      <option value="Logistics & Transportation">Logistics & Transportation</option>
                      <option value="Media & Entertainment">Media & Entertainment</option>
                      <option value="Travel & Hospitality">Travel & Hospitality</option>
                      <option value="Textile & Apparel">Textile & Apparel</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Energy & Renewable Resources">Energy & Renewable Resources</option>
                      <option value="Banking & Financial Services">Banking & Financial Services</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Telecommunications">Telecommunications</option>
                      <option value="Legal Services">Legal Services</option>
                      <option value="Advertising & Marketing">Advertising & Marketing</option>
                      <option value="Sports & Fitness">Sports & Fitness</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Environmental & Waste Management">Environmental & Waste Management</option>
                      <option value="Mining & Metals">Mining & Metals</option>
                      <option value="Aerospace & Defence">Aerospace & Defence</option>
                      <option value="Blockchain & Web3">Blockchain & Web3</option>
                      <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                      <option value="Gaming & Esports">Gaming & Esports</option>
                      <option value="Event Management">Event Management</option>
                      <option value="Interior Design & Architecture">Interior Design & Architecture</option>
                      <option value="Import & Export Trading">Import & Export Trading</option>
                      <option value="Printing & Packaging">Printing & Packaging</option>
                      <option value="Security Services">Security Services</option>
                      <option value="Non-Profit & Social Enterprise">Non-Profit & Social Enterprise</option>
                      <option value="Chemicals & Petrochemicals">Chemicals & Petrochemicals</option>
                      <option value="Jewellery & Precious Metals">Jewellery & Precious Metals</option>
                      <option value="Freelancing & Professional Services">Freelancing & Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                    <label htmlFor="industry-select">Industry</label>
                    <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                {/* Form submit search trigger */}
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    disabled={isCheckingName}
                    aria-label="Check name availability"
                    className="w-full h-11 bg-brand-gold hover:bg-black text-black hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-gold/10 font-bold"
                  >
                    {isCheckingName ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Search className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </form>
              
              {/* Interactive clearance ledger */}
              {checkReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="border-t border-brand-border/60 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                  <div className="flex flex-col items-center justify-center p-5 bg-brand-bg-lighter rounded-xl border border-brand-border/60 shadow-sm min-h-[120px]">
                    <span className="text-[8px] uppercase tracking-widest text-[#9E896A] font-bold font-mono mb-1">Suitability Score</span>
                    <div className="text-center">
                      <span className="text-4xl font-light text-red-500 font-serif italic block leading-none">
                        {checkReport.score}
                      </span>
                      <span className="text-[9px] text-brand-text-muted font-mono tracking-wider block mt-1">out of 100</span>
                    </div>
                  </div>
                  
                  <div className="text-left space-y-3 bg-red-50/20 p-4.5 rounded-xl border border-red-500/10">
                    <span className="text-[8px] uppercase tracking-widest text-red-500 font-bold font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" /> Issues Found
                    </span>
                    <ul className="space-y-1.5">
                      {checkReport.conflicts.map((conf: string, i: number) => (
                        <li key={i} className="text-xs text-brand-text-muted flex items-start gap-1.5 leading-relaxed font-sans">
                          <span className="text-red-500 text-sm font-bold leading-none shrink-0 mt-0.5">•</span>
                          <span>{conf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-left space-y-3 bg-emerald-50/25 p-4.5 rounded-xl border border-emerald-500/10">
                    <span className="text-[8px] uppercase tracking-widest text-emerald-600 font-bold font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Suggestions
                    </span>
                    <ul className="space-y-1.5">
                      {checkReport.suggestions.map((sug: string, i: number) => (
                        <li key={i} className="text-xs text-brand-text font-semibold flex items-center gap-2 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Animated 4 Trust Metrics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto px-2 sm:px-6 pb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(197, 168, 128, 0.2)", borderColor: "rgba(197, 168, 128, 0.4)" }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 text-left flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-xl w-fit mb-4 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text tracking-wide">100% CA Verified</h4>
                  <p className="text-xs text-brand-text-muted font-sans mt-2 leading-relaxed">
                    Expert Advocates & Chartered Accountants review all filings.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(197, 168, 128, 0.2)", borderColor: "rgba(197, 168, 128, 0.4)" }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 text-left flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div className="p-2.5 bg-brand-gold/10 text-[#c5a880] rounded-xl w-fit mb-4 flex items-center justify-center">
                  <Star className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text tracking-wide">4.9/5 Trust Rating</h4>
                  <p className="text-xs text-brand-text-muted font-sans mt-2 leading-relaxed">
                    Trusted by 2,000+ Indian startup founders and SMEs nationwide.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(197, 168, 128, 0.2)", borderColor: "rgba(197, 168, 128, 0.4)" }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 text-left flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div className="p-2.5 bg-brand-gold/10 text-[#c5a880] rounded-xl w-fit mb-4 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text tracking-wide">2-Hour Response SLA</h4>
                  <p className="text-xs text-brand-text-muted font-sans mt-2 leading-relaxed">
                    Dedicated corporate law and compliance experts assigned instantly.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(197, 168, 128, 0.2)", borderColor: "rgba(197, 168, 128, 0.4)" }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 text-left flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div className="p-2.5 bg-brand-gold/10 text-[#c5a880] rounded-xl w-fit mb-4 flex items-center justify-center">
                  <Database className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text tracking-wide">MCA Sync Live</h4>
                  <p className="text-xs text-brand-text-muted font-sans mt-2 leading-relaxed">
                    Seamless corporate registry database checks and live MCA filings.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Category Pills Navigation & Services Cards Grid */}
          <div id="service-catalog-section" className="flex flex-col gap-6 w-full max-w-5xl mx-auto pt-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border/60 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-brand-text">
                  {lang === "hi" ? "सेवा प्रकार के अनुसार खोजें" : "Browse by Service Type"}
                </h2>
                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                  {lang === "hi" ? "अपने व्यावसायिक लक्ष्यों के लिए सही संरचना चुनें" : "Select the right structure for your business goals"}
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-bold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 rounded-full">
                {activeCatalog.filter(s => activeCategory === "all" || s.category === activeCategory).length} {lang === "hi" ? "सेवाएं उपलब्ध" : "services available"}
              </span>
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {[
                { id: "all", label: lang === "hi" ? "सभी सेवाएं" : "All Services", icon: Scale },
                { id: "private-corporate", label: lang === "hi" ? "प्राइवेट कॉर्पोरेट" : "Private Corporate", icon: Building2 },
                { id: "alternative-entity", label: lang === "hi" ? "वैकल्पिक इकाई" : "Alternative Entity", icon: Landmark },
                { id: "compliance", label: lang === "hi" ? "सालाना कम्प्लायंस" : "Compliance", icon: FileText },
                { id: "enterprise-growth", label: lang === "hi" ? "बिजनेस ग्रोथ" : "Enterprise & Growth", icon: TrendingUp }
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                   <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl border transition-all duration-150 fast-transition flex-shrink-0 text-xs font-semibold cursor-pointer ${
                      isActive
                        ? "bg-brand-gold text-black border-brand-gold shadow-md shadow-brand-gold/10 font-bold"
                        : "bg-brand-bg-lighter border-brand-border text-brand-text-muted hover:border-brand-gold/50 hover:bg-brand-bg"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-brand-gold/80"}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {activeCatalog
                .filter((s) => activeCategory === "all" || s.category === activeCategory)
                .slice(0, showAllServices ? undefined : 6)
                .map((service, index) => {
                  const isSaved = savedServices.includes(service.id);
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 18, scale: 0.995 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.38, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -6, boxShadow: "0 15px 35px -12px rgba(10, 17, 40, 0.15)", borderColor: "rgba(197, 168, 128, 0.4)" }}
                      onClick={() => {
                        setSelectedEntityId(service.id);
                        setCalcEntity(service.id);
                        setViewMode("detail");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="premium-service-card border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full group relative transition-all duration-150 fast-transition premium-card transform-gpu cursor-pointer"
                    >
                      {/* Card Header section (Deep navy in light mode, obsidian dark in dark mode) */}
                      <div className="relative card-header-bg p-6 shrink-0 text-left">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-gold/30 blur-2xl"></div>
                        </div>
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="space-y-1">
                            {service.badge && (
                              <span className="inline-block bg-brand-gold text-black text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                                {service.badge}
                              </span>
                            )}
                            <div className="font-serif text-xl font-bold text-brand-gold leading-snug">
                              {service.name}
                            </div>
                            <div className="text-[10px] text-slate-300 font-sans uppercase tracking-wider mt-1">
                              {service.category === "private-corporate" ? "Private Corporate Entity" :
                               service.category === "alternative-entity" ? "Alternative Entity Structure" :
                               service.category === "compliance" ? "Compliance & Statutory" :
                               service.category === "enterprise-growth" ? "Enterprise & Growth Service" :
                               "Business Entity"}
                            </div>
                          </div>
                          
                          {/* Heart item toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSaved) {
                                  setSavedServices(savedServices.filter(id => id !== service.id));
                              } else {
                                  setSavedServices([...savedServices, service.id]);
                              }
                            }}
                                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-150 fast-transition border border-white/10 cursor-pointer"
                                  aria-label="Save service to favorites"
                          >
                                  <Heart className={`w-4 h-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-white"}`} />
                          </button>
                        </div>

                        {/* Metadata timeline details */}
                        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2 text-[10px] text-slate-200 font-mono">
                          <span className="whitespace-nowrap flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                            <Clock className="w-3.5 h-3.5 text-brand-gold" /> {service.timeline}
                          </span>
                          <span className="whitespace-nowrap flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                            <Users className="w-3.5 h-3.5 text-brand-gold" /> {service.minDirectors}
                          </span>
                        </div>
                      </div>

                      {/* Card Body details */}
                      <div className="p-5 flex flex-col flex-grow justify-between space-y-4 text-left">
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded font-mono">
                            {service.category.replace("-", " ")}
                          </span>
                          <h3 className="font-serif text-[17px] font-bold text-brand-text leading-snug group-hover:text-brand-gold transition-colors duration-150 fast-transition mt-1">
                            {service.name}
                          </h3>
                          <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-light">
                            {service.description}
                          </p>
                        </div>

                        {/* Bullet Points */}
                        <div className="space-y-2 pt-1 border-t border-brand-border/60 border-dashed">
                          {service.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-brand-text-muted font-sans leading-relaxed">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer consultant details */}
                        <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-brand-bg-darker text-brand-gold flex items-center justify-center border border-brand-border shadow-sm shrink-0">
                              <Scale className="w-3.5 h-3.5 text-brand-gold" />
                            </div>
                            <span className="text-[10px] text-brand-text-muted font-semibold font-sans">{service.expert}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                          
                          {/* View Details action */}
                          <div
                            className="text-xs font-bold text-brand-text hover:text-brand-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-150 fast-transition transform-gpu font-sans"
                          >
                            View Details <ChevronRight className="w-4 h-4 text-brand-gold" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* View All / Show Less toggle */}
            {activeCatalog.filter((s) => activeCategory === "all" || s.category === activeCategory).length > 6 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="flex items-center gap-2 px-6 py-3 border border-brand-gold/40 hover:border-brand-gold hover:bg-brand-gold/10 text-brand-gold font-mono uppercase tracking-widest text-[10px] font-bold rounded-xl transition-all duration-150 fast-transition cursor-pointer"
                >
                  {showAllServices ? (
                    <>Show Less</>
                  ) : (
                    <>View All Services <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Service Detail Page */}
          <div className="space-y-8 animate-in fade-in duration-300 text-left max-w-5xl mx-auto">
            {/* Header back & save panel */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-bg-lighter border border-brand-border text-brand-text-muted hover:text-brand-text text-xs font-semibold cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-brand-text-muted" /> Back to Services
              </button>
              
              <button
                onClick={() => {
                  const isSaved = savedServices.includes(selectedEntity.id);
                  if (isSaved) {
                    setSavedServices(savedServices.filter(id => id !== selectedEntity.id));
                  } else {
                    setSavedServices([...savedServices, selectedEntity.id]);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-bg-lighter border border-brand-border text-brand-text-muted hover:text-brand-text text-xs font-semibold cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <Heart className={`w-4 h-4 transition-colors ${savedServices.includes(selectedEntity.id) ? "fill-red-500 text-red-500 border-red-500" : "text-brand-text-muted"}`} /> 
                {savedServices.includes(selectedEntity.id) ? "Saved Service" : "Save Service"}
              </button>
            </div>

            {/* Animated Premium Dark Header Banner for Detail View */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full premium-hero-card border rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              {/* Subtle decorative glow backdrops */}
              <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-gold/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#1e2d5a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
              
              <div className="space-y-4 relative z-10 text-left">
                {/* Category and inline tags inside banner */}
                <div className="flex flex-wrap items-center gap-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                  <span className="bg-brand-gold text-black px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                    {selectedEntity.category.replace("-", " ")}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-gold" /> {selectedEntity.timeline}</span>
                  <span className="text-slate-500">|</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-brand-gold" /> {selectedEntity.minDirectors}</span>
                </div>

                {/* Entity Name */}
                <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight serif leading-tight">
                  {selectedEntity.name}
                </h1>
                
                {/* Description Quote */}
                <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl font-light italic">
                  “{selectedEntity.description}”
                </p>
              </div>
            </motion.div>

            {/* Quick Specs Cards row (4 boxes) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[
                { label: "MIN DIRECTORS", val: selectedEntity.minDirectorsNumber || "2" },
                { label: "MIN CAPITAL", val: selectedEntity.minCapital || "₹1 Lakh" },
                { label: "LIABILITY", val: selectedEntity.liability || "Limited" },
                { label: "TAX BENEFIT", val: selectedEntity.taxBenefit || "Startup India" }
              ].map((spec, idx) => (
                <div key={idx} className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-4 text-center shadow-sm">
                  <span className="text-[8px] font-mono tracking-widest text-brand-text-muted font-bold block mb-1.5">{spec.label}</span>
                  <span className="text-base font-serif italic text-brand-text font-bold leading-none block">{spec.val}</span>
                </div>
              ))}
            </div>

            {/* Detailed Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
              
              {/* Left Column (col-span-7) */}
              <div className="lg:col-span-7 space-y-8 flex flex-col justify-between">
                {/* About Paragraph */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold font-serif text-brand-text tracking-wide">About This Service</h3>
                  <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed font-sans font-light">
                    {selectedEntity.detailedAbout || `A ${selectedEntity.name} is a highly professional and legally complaint corporate setup structured to protect founders, partners, and investors. Formulated under central ministry guidelines, it offers distinct credentials, liability isolation, and a structured legal standing for doing commercial business in India.`}
                  </p>
                </div>

                {/* Key Advantages Checklist Grid */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold font-serif text-brand-text tracking-wide">Key Advantages</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedEntity.keyAdvantages || selectedEntity.features).map((adv, i) => (
                      <div key={i} className="bg-brand-bg-lighter border border-brand-border rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow transition-shadow">
                        <div className="p-1 bg-brand-gold/10 text-brand-gold rounded-md mt-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-semibold text-brand-text font-sans leading-snug">{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Documents Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold font-serif text-brand-text tracking-wide">Required Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedEntity.documents || [
                      "PAN Card",
                      "Aadhaar / Passport",
                      "Utility Bill",
                      "Bank Statement",
                      "NOC from property owner"
                    ]).map((doc, i) => (
                      <div key={i} className="bg-brand-bg-lighter border border-brand-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow transition-shadow">
                        <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg shrink-0">
                          <FileText className="w-4 h-4 text-brand-gold" />
                        </div>
                        <span className="text-xs font-semibold text-brand-text font-sans leading-snug">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Expert Banner */}
                <div className="bg-brand-bg-lighter border border-brand-border/40 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-4">
                  <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-full bg-brand-bg-darker text-brand-gold flex items-center justify-center border border-brand-border shadow-sm shrink-0">
                      <Scale className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-serif text-sm font-bold text-brand-text">{selectedEntity.expert || "D Bhushan"}</span>
                        <span className="bg-brand-gold/10 text-[#9E896A] border border-[#9E896A]/30 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                          Super Expert
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted font-sans mt-0.5">
                        {selectedEntity.category === "compliance" || selectedEntity.id === "virtual-cfo" ? "Chartered Accountant & Corporate Law Specialist" : "Corporate Law Specialist"}
                      </p>
                      <p className="text-[9px] text-brand-text-muted/70 font-mono tracking-wider uppercase mt-0.5">
                        INCROUTE REGISTERED EXPERT
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <div className="bg-brand-bg border border-brand-border/60 px-4 py-2 rounded-xl text-[10px] font-mono text-brand-text-muted shadow-sm">
                      Response: <span className="font-bold text-brand-text">Within 2 hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Cost Calculator (col-span-5) */}
              <div className="lg:col-span-5 bg-brand-bg-lighter border border-brand-border rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
                {/* Price Display header */}
                <div className="flex justify-between items-center border-b border-brand-border pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-serif font-bold text-brand-text leading-none">
                      Professional Fees
                    </span>
                    <span className="text-[10px] text-brand-text-muted font-sans leading-relaxed">
                      Calculated based on entity type, directors & capital
                    </span>
                  </div>
                  <span className="bg-[#E8F3EB] text-[#3B6E4C] font-mono font-bold text-[9px] px-2.5 py-1 rounded-md tracking-wider uppercase">
                    {selectedEntity.timeline.replace("Working Days", "WORKING DAYS").replace("–", "-")}
                  </span>
                </div>

                {/* Directors slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-brand-text-muted">
                      <Users className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                        Directors / Partners
                      </span>
                    </div>
                    <span className="font-mono text-brand-text text-xs font-bold">
                      {calcDirectors} <span className="text-[9px] text-brand-text-muted font-normal">(Min: {calcEntity === "opc" ? 1 : 2})</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={calcEntity === "opc" ? 1 : 2}
                    max={calcEntity === "opc" ? 1 : 15}
                    value={calcDirectors}
                    disabled={calcEntity === "opc"}
                    onChange={(e) => setCalcDirectors(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-brand-border accent-[#c5a880] rounded-lg appearance-none cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[9px] text-brand-text-muted font-mono">
                    <span>{calcEntity === "opc" ? 1 : 2}</span>
                    <span>{calcEntity === "opc" ? 1 : 15}</span>
                  </div>
                </div>

                {/* Capital slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-brand-text-muted">
                      <Landmark className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                        Share Capital
                      </span>
                    </div>
                    <span className="font-mono text-brand-text text-xs font-bold">
                      ₹{(calcCapital / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={10000000}
                    step={100000}
                    value={calcCapital}
                    onChange={(e) => setCalcCapital(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-[#c5a880] focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[9px] text-brand-text-muted font-mono">
                    <span>₹1L</span>
                    <span>₹1Cr</span>
                  </div>
                </div>

                {/* Optional addons checklists */}
                <div className="space-y-3">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                    Optional Add-ons
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: "gst", name: "GST Registration", price: "+₹499" },
                      { key: "trademark", name: "Trademark Filing", price: "+₹1,999" },
                      { key: "startupIndia", name: "Startup India", price: "+₹1,499" },
                      { key: "virtualOffice", name: "Virtual Office", price: "+₹999/mo" },
                      { key: "virtualCFO", name: "Virtual CFO", price: "+₹2,999/mo" }
                    ].map((addon) => (
                      <div
                        key={addon.key}
                        onClick={() =>
                          setAddOns({
                            ...addOns,
                            [addon.key]: !addOns[addon.key as any]
                          } as any)
                        }
                        className="flex items-center justify-between py-1 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addOns[addon.key as any] || false}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-[#c5a880] focus:ring-[#c5a880] w-4 h-4 cursor-pointer bg-white"
                          />
                          <span className="text-xs font-sans font-medium text-brand-text">{addon.name}</span>
                        </div>
                        <span className="text-xs font-serif font-bold text-[#c5a880]">{addon.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ledger */}
                <div className="space-y-2 pt-3 border-t border-brand-border/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-text-muted font-sans">Professional Fee</span>
                    <span className="font-serif font-bold text-brand-text italic text-[11px]">As per consultation</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-text-muted font-sans">Government & Stamp Duties</span>
                    <span className="font-serif font-bold text-brand-text">₹{pricing.govFee}</span>
                  </div>
                  {pricing.addOnFee > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-text-muted font-sans">Add-ons Total</span>
                      <span className="font-serif font-bold text-brand-text">+₹{pricing.addOnFee}</span>
                    </div>
                  )}
                </div>

                {/* Estimated total and onboard button */}
                <div className="border-t border-brand-border/60 pt-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-serif font-extrabold text-brand-text">Estimated Total</span>
                    <span className="text-[9px] text-brand-text-muted font-sans">*Final quote after consultation</span>
                  </div>
                  <span className="text-2.5xl font-serif font-bold text-[#c5a880]">
                    ₹{pricing.total}
                  </span>
                </div>

                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="w-full bg-[#0a1128] hover:bg-[#c5a880] text-white hover:text-slate-900 py-3.5 rounded-xl transition-all cursor-pointer font-bold text-sm font-sans tracking-wide shadow-lg shadow-[#0a1128]/10 flex items-center justify-center gap-1.5 duration-300"
                >
                  Onboard With This Budget <ChevronRight className="w-4 h-4 ml-1 stroke-[2.5]" />
                </button>

                {/* Secure seal */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-text-muted font-sans pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3B6E4C] shrink-0" />
                  <span>TLS 1.3 Encrypted · 256-bit SSL</span>
                </div>
              </div>
            </div>

            {/* Centered Glassmorphic Intake Form Modal */}
            {showOnboardModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  onClick={() => setShowOnboardModal(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
                />

                {/* Form Box */}
                <div className="relative w-full max-w-lg bg-brand-bg-lighter border border-brand-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden subtle-glow animate-in zoom-in-95 duration-250 z-10 text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />
                  
                  <button 
                    onClick={() => setShowOnboardModal(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-text-muted hover:text-brand-text cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-brand-text serif">Start Your Incorporation</h3>
                        <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest mt-0.5">{selectedEntity.name} Desk</p>
                      </div>
                    </div>

                    <div className="border-t border-brand-border pt-4">
                      <ContactFormWidget initialMessage={`I would like to onboard and register my business structure as a ${selectedEntity.name}. Directors: ${calcDirectors}, Authorized Share Capital: ₹${calcCapital.toLocaleString()}. Addons: ${Object.keys(addOns).filter(k => addOns[k as any]).join(", ") || "None"}.`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
