import fs from "fs";
import path from "path";

export const serviceNameMap: Record<string, string> = {
  "pvt-ltd": "Private Limited Company (Pvt Ltd)",
  "llp": "Limited Liability Partnership (LLP)",
  "opc": "One Person Company (OPC)",
  "partnership": "Partnership Firm",
  "section8": "Section 8 Company (NGO)",
  "public-ltd": "Public Limited Company",
  "annual-compliance": "Annual Compliances Suite",
  "gst-tax": "GST & Tax Registration",
  "virtual-cfo": "Virtual CFO Retainer",
  "virtual-office": "Virtual Office Address",
  "terms-privacy": "Terms of Service & Privacy Policy",
  "msme-registration": "MSME (Udyam) Registration",
  "fssai-registration": "FSSAI Food License Registration",
  "return-filing": "Tax & Return Filing Services",
  "trademark-registration": "Trademark Services Suite",
  "trademark-objection": "Response to Trademark Objection",
  "trademark-opposition": "Trademark Opposition Services",
  "trademark-assignment": "Trademark & IP Assignment",
  "brand-protection": "Brand Protection & Monitoring",
  "litigation-assistance": "Corporate Litigation Assistance",
  "trademark-renewal": "Trademark & License Renewal",
  "patent-filing": "Patent Drafting & Filing",
  "iso-certification": "ISO Certification Services"
};

export const seoProfiles: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "INCroute | Premium Startup & Corporate Registrations in India",
    description: "INCroute is a premium corporate registration and compliance advisory platform. Launch and scale your Indian startup with professional guidance for Pvt Ltd, LLP, Section 8, and GST filings.",
    keywords: "company registration, private limited, LLP registration, India, ROC filings, GST, startup advisory, virtual CFO"
  },
  "/services": {
    title: "Statutory Incorporation Services | INCroute",
    description: "Premium end-to-end corporate registration services in India. Register Private Limited, LLP, One Person Company, Partnership, and Section 8 NGO seamlessly.",
    keywords: "Pvt Ltd company registration, LLP registration, OPC registration, NGO Section 8, company setup"
  },
  "/catalog/": {
    title: "Interactive Services Directory & Checklists | INCroute",
    description: "Explore the comprehensive statutory service catalog for Indian startups. Deep-dive into document requirements, legal advantages, and compliance checklists.",
    keywords: "incorporation checklist, startup documents, compliance catalog, business registration service list"
  },
  "/about": {
    title: "Meet the Corporate Expert - D Bhushan | INCroute",
    description: "Learn about D Bhushan, the founder and principal legal advisor behind INCroute. Experience startup legal architecture and corporate compliance informed by professional CA mentorship.",
    keywords: "D Bhushan, INCroute founder, corporate law consultant, startup legal architecture"
  },
  "/blog": {
    title: "LegisCorp Editorial & Compliance Insights Ledger | INCroute",
    description: "Explore statutory briefs, ROC filing warnings, tax advisory articles, and legal ledger insights managed by corporate advocates and chartered analysts.",
    keywords: "compliance blogs, ROC updates, GST changes, corporate law articles"
  },
  "/tools/name-checker/": {
    title: "AI-Powered Registrar Name Feasibility Auditor | INCroute",
    description: "Audit your proposed brand name against official Registrar (MCA) guidelines. Our dynamic auditor maps trade registry databases instantly for zero-conflict incorporation.",
    keywords: "company name search, MCA name checker, startup brand auditor, business name registry"
  },
  "/tools": {
    title: "Interactive Statutory Utilities & Draft Generators | INCroute",
    description: "Calculate stamp duty rates across states, compute estimated company setup costs, and generate live previews of legal draft documents instantly.",
    keywords: "stamp duty calculator, legal draft generator, company registration cost, statutory utilities"
  },
  "/testimonials": {
    title: "Founder Trust & Client Reflections Board | INCroute",
    description: "See reviews and testimonials from Indian startup founders and business owners who registered their companies and handled ROC annual compliance with INCroute.",
    keywords: "INCroute reviews, startup founder feedback, statutory filing client reviews"
  },
  "/contact": {
    title: "Schedule an Expert Corporate Consultation | INCroute",
    description: "Get in touch with our senior registrars and compliance specialists. Book your consultation for company registration, annual compliance, or taxation.",
    keywords: "contact INCroute, corporate consultation, talk to CA, hire startup lawyer"
  },
  "/compliance/flowchart/": {
    title: "Interactive Corporate Compliance Flowcharts | INCroute",
    description: "Visualize step-by-step statutory filing timelines and ROC compliance pipelines for Private Limited and LLP setups in India.",
    keywords: "compliance flowchart, ROC timeline, company registration pipeline"
  },
  "/tools/entity-comparison/": {
    title: "Corporate Entity Structural Comparisons | INCroute",
    description: "Compare Private Limited, LLP, OPC, Nidhi Company, Public Limited, Partnership, and Sole Proprietorship structures side-by-side on liability, funding readiness, audit requirements, and compliance metrics.",
    keywords: "Pvt Ltd vs LLP, OPC vs Partnership, compare business structures, startup entity type"
  },
  "/tools/impact-dashboard/": {
    title: "Filing Speeds & Statutory Impact Dashboard | INCroute",
    description: "Track live operational metrics, ROC filing speeds, and statutory SLA timelines managed by our senior corporate desk.",
    keywords: "ROC filing speed, compliance SLA, INCroute dashboard"
  },
  "/timeline-viz": {
    title: "Statutory Filing Timelines Dashboard | INCroute",
    description: "Track first-year statutory due dates, ROC filings, and calendar roadmaps to prevent compliance penalties.",
    keywords: "statutory calendar, ROC timelines, compliance dashboard"
  },
  "/company-registration-bangalore": {
    title: "Online Pvt Ltd Company Registration in Bangalore | INCroute",
    description: "Instant online Pvt Ltd company registration in Bangalore. Access Silicon Valley's premium incorporation desk. Get MCA name approval, DSC, and local CA assistance for Bangalore startups.",
    keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, how long does online company registration take, documents needed for online opc registration, Bangalore startup incorporation, company registration Bangalore"
  },
  "/company-registration-mumbai": {
    title: "Premium Pvt Ltd & LLP Registration in Mumbai | INCroute",
    description: "Fast online company registration and LLP setup in Mumbai BKC. Maharashtra stamp duty compliance, instant MCA name clearance, and expert corporate legal advisory under one roof.",
    keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, instant llp registration, cheapest company registration online, Mumbai corporate registry, company registration Mumbai"
  },
  "/company-registration-delhi": {
    title: "Elite Pvt Ltd & LLP Registration in Delhi NCR | INCroute",
    description: "Online Pvt Ltd company registration & instant LLP setup in Delhi, Gurgaon & Noida. High-speed MCA filing, zero office visits. Get your Certificate of Incorporation in 8 working days.",
    keywords: "online pvt ltd registration price, instant llp registration, how long does online company registration take, documents needed for online opc registration, Delhi company registration, Gurgaon company setup"
  },
  "/faq": {
    title: "Company Registration FAQs India — 48 Expert Answers on Pvt Ltd, LLP, GST, MSME, FSSAI | INCroute",
    description: "Get instant expert answers on company registration timelines, document checklists, Pvt Ltd vs LLP comparison, OPC registration costs, GST thresholds, MSME Udyam benefits, FSSAI food license, and trademark registration. Optimized for Google AI Overviews.",
    keywords: "how long does online company registration take, documents needed for online opc registration, pvt ltd vs llp for startup, online pvt ltd registration price, Section 8 NGO tax exemption, MSME registration benefits, FSSAI license India, company registration FAQ India, GST registration mandatory, trademark registration India"
  }
};

export const schemas: Record<string, any> = {
  "/": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "INCroute",
    "url": "https://incroute.com",
    "logo": "https://incroute.com/incroute_logo.png",
    "description": "Premium corporate registration and compliance advisory platform in India.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8707552183",
      "contactType": "customer service",
      "email": "info@incroute.com"
    }
  }
};

export function injectSEOMetadata(html: string, route: string): string {
  let profile = seoProfiles[route];

  if (!profile) {
    const serviceMatch = route.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
    if (serviceMatch) {
      const category = serviceMatch[1].replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const serviceId = serviceMatch[2];
      const cleanName = serviceNameMap[serviceId] || serviceId.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

      profile = {
        title: `${cleanName} Registration & Compliance | INCroute`,
        description: `Get professional, CA-backed services for ${cleanName} under ${category} category in India.`,
        keywords: `${cleanName}, ${category}, company registration, ROC, business filing`
      };
    } else {
      profile = seoProfiles["/"];
    }
  }

  let transformed = html.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);

  const descMeta = `<meta name="description" content="${profile.description}" />`;
  if (transformed.includes('name="description"')) {
    transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
  } else {
    transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
  }

  const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
  if (transformed.includes('name="keywords"')) {
    transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
  } else {
    transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
  }

  const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
  const ogDesc = `<meta property="og:description" content="${profile.description}" />`;

  if (transformed.includes('property="og:title"')) {
    transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
  } else {
    transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
  }

  if (transformed.includes('property="og:description"')) {
    transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
  } else {
    transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
  }

  const canonicalUrl = `https://incroute.com${route === "/" ? "" : route}`;
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
  transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

  const schemaData = schemas[route] || schemas["/"];
  const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
  transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

  return transformed;
}
