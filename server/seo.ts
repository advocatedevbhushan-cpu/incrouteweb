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

export const seoProfiles: Record<string, { title: string; description: string; keywords: string; ogImage?: string }> = {
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
    title: "Editorial & Compliance Insights Ledger | INCroute",
    description: "Explore statutory briefs, ROC filing warnings, tax advisory articles, and legal ledger insights managed by corporate advocates and chartered analysts.",
    keywords: "compliance blogs, ROC updates, GST changes, corporate law articles"
  },
  "/blog/": {
    title: "Editorial & Compliance Insights Ledger | INCroute",
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

function getBlogPosts(): any[] {
  try {
    const blogPath = path.join(process.cwd(), "blog-posts.json");
    if (fs.existsSync(blogPath)) {
      const data = JSON.parse(fs.readFileSync(blogPath, "utf-8"));
      return Array.isArray(data) ? data : data?.posts || [];
    }
  } catch {}
  return [];
}

export function injectSEOMetadata(html: string, route: string): string {
  let profile = seoProfiles[route];
  let dynamicSchema: any = null;
  let ogType = "website";
  let publishedTime = "";
  let authorName = "D Bhushan";
  let customOgImage = "";

  // 1. Check for Blog Post URL: /blog/:slug
  const blogMatch = route.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch && blogMatch[1] !== "") {
    const slug = blogMatch[1];
    const posts = getBlogPosts();
    const post = posts.find((p: any) => p.slug === slug || p.id === slug);

    if (post) {
      const title = `${post.title} | INCroute Editorial`;
      const desc = post.metaDescription || post.subtitle || post.content?.substring(0, 160)?.replace(/[#*`>]/g, "") || "Statutory compliance and corporate legal guide from INCroute.";
      const img = post.image ? (post.image.startsWith("http") ? post.image : `https://incroute.com${post.image}`) : "https://incroute.com/incroute_logo.png";
      customOgImage = img;
      ogType = "article";
      publishedTime = post.date || new Date().toISOString().split("T")[0];
      authorName = post.author || "D Bhushan";

      profile = {
        title,
        description: desc,
        keywords: `${post.category || "Company Registration"}, ${post.title}, Pvt Ltd compliance, ROC rules, startup guide India`,
        ogImage: img
      };

      dynamicSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://incroute.com/blog/${post.slug}/`
        },
        "headline": post.title,
        "description": desc,
        "image": [img],
        "datePublished": publishedTime,
        "dateModified": publishedTime,
        "author": {
          "@type": "Person",
          "name": authorName,
          "url": "https://incroute.com/about"
        },
        "publisher": {
          "@type": "Organization",
          "name": "INCroute",
          "logo": {
            "@type": "ImageObject",
            "url": "https://incroute.com/incroute_logo.png"
          }
        },
        "articleSection": post.category || "Company Registration"
      };
    }
  }

  // 2. Check for Service Detail URL: /services/:category/:serviceId
  if (!profile) {
    const serviceMatch = route.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
    if (serviceMatch) {
      const category = serviceMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const serviceId = serviceMatch[2];
      const cleanName = serviceNameMap[serviceId] || serviceId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      profile = {
        title: `${cleanName} Registration & Compliance | INCroute`,
        description: `Get professional, CA-backed services for ${cleanName} under ${category} category in India. Transparent fees & zero delays.`,
        keywords: `${cleanName}, ${category}, company registration, ROC, business filing`
      };
    } else {
      profile = seoProfiles[route] || seoProfiles["/"];
    }
  }

  let transformed = html.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);

  // Meta Description
  const descMeta = `<meta name="description" content="${profile.description.replace(/"/g, "&quot;")}" />`;
  if (transformed.includes('name="description"')) {
    transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
  } else {
    transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
  }

  // Meta Keywords
  const keywordsMeta = `<meta name="keywords" content="${profile.keywords.replace(/"/g, "&quot;")}" />`;
  if (transformed.includes('name="keywords"')) {
    transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
  } else {
    transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
  }

  // OpenGraph Tags
  const ogTitle = `<meta property="og:title" content="${profile.title.replace(/"/g, "&quot;")}" />`;
  const ogDesc = `<meta property="og:description" content="${profile.description.replace(/"/g, "&quot;")}" />`;
  const ogTypeMeta = `<meta property="og:type" content="${ogType}" />`;
  const ogImgUrl = customOgImage || profile.ogImage || "https://incroute.com/incroute_logo.png";
  const ogImageMeta = `<meta property="og:image" content="${ogImgUrl}" />`;
  const twitterCard = `<meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="${profile.title.replace(/"/g, "&quot;")}" />\n  <meta name="twitter:description" content="${profile.description.replace(/"/g, "&quot;")}" />\n  <meta name="twitter:image" content="${ogImgUrl}" />`;

  transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
  transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
  transformed = transformed.replace(/<meta property="og:image" content=".*?" \/>/gi, ogImageMeta);

  if (!transformed.includes('property="og:type"')) {
    transformed = transformed.replace("</head>", `  ${ogTypeMeta}\n</head>`);
  }

  if (ogType === "article" && publishedTime) {
    const articleMeta = `<meta property="article:published_time" content="${publishedTime}" />\n  <meta property="article:author" content="${authorName}" />`;
    transformed = transformed.replace("</head>", `  ${articleMeta}\n</head>`);
  }

  if (!transformed.includes('name="twitter:card"')) {
    transformed = transformed.replace("</head>", `  ${twitterCard}\n</head>`);
  }

  // Canonical Tag
  const canonicalUrl = `https://incroute.com${route === "/" ? "" : route}`;
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
  transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

  // Schema.org JSON-LD Structured Data
  const schemaData = dynamicSchema || schemas[route] || schemas["/"];
  const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
  transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

  return transformed;
}

// ─── Automated Dynamic Sitemap Generator & Search Engine Pinger ───
export function generateSitemapXml(): string {
  const posts = getBlogPosts().filter((p: any) => p.status === "published" || !p.status);
  const now = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "https://incroute.com/", priority: "1.0", changefreq: "weekly" },
    { loc: "https://incroute.com/services", priority: "0.9", changefreq: "weekly" },
    { loc: "https://incroute.com/catalog/", priority: "0.8", changefreq: "weekly" },
    { loc: "https://incroute.com/about", priority: "0.7", changefreq: "monthly" },
    { loc: "https://incroute.com/blog", priority: "0.9", changefreq: "daily" },
    { loc: "https://incroute.com/faq", priority: "0.8", changefreq: "weekly" },
    { loc: "https://incroute.com/tools", priority: "0.8", changefreq: "monthly" },
    { loc: "https://incroute.com/tools/name-checker/", priority: "0.8", changefreq: "monthly" },
    { loc: "https://incroute.com/tools/entity-comparison/", priority: "0.8", changefreq: "monthly" },
    { loc: "https://incroute.com/contact", priority: "0.7", changefreq: "monthly" },
    { loc: "https://incroute.com/company-registration-bangalore", priority: "0.8", changefreq: "weekly" },
    { loc: "https://incroute.com/company-registration-mumbai", priority: "0.8", changefreq: "weekly" },
    { loc: "https://incroute.com/company-registration-delhi", priority: "0.8", changefreq: "weekly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Static URLs
  for (const item of staticUrls) {
    xml += `  <url>\n    <loc>${item.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>\n`;
  }

  // Dynamic Blog URLs with Images for Google Image Search
  for (const post of posts) {
    const postUrl = `https://incroute.com/blog/${post.slug}/`;
    const postDate = post.date || now;
    const postImg = post.image ? (post.image.startsWith("http") ? post.image : `https://incroute.com${post.image}`) : "";

    xml += `  <url>\n    <loc>${postUrl}</loc>\n    <lastmod>${postDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n`;
    if (postImg) {
      xml += `    <image:image>\n      <image:loc>${postImg}</image:loc>\n      <image:title>${(post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  // Write to public/sitemap.xml
  try {
    const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(publicSitemap, xml, "utf-8");
  } catch (e: any) {
    console.warn("Could not write sitemap.xml to public folder:", e.message);
  }

  return xml;
}

// ─── Instant Search Engine Pinger (Google & IndexNow) ───
export async function pingSearchEngines(newUrl?: string): Promise<{ google: boolean; indexNow: boolean; error?: string }> {
  let googleSuccess = false;
  let indexNowSuccess = false;

  const sitemapUrl = "https://incroute.com/sitemap.xml";

  try {
    // 1. Ping Google Search Console
    const gRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    googleSuccess = gRes.ok || gRes.status === 200;
  } catch (e: any) {
    console.warn("Google sitemap ping note:", e.message);
  }

  try {
    // 2. Ping IndexNow for instant indexing on Bing, Yandex, Seznam
    const host = "incroute.com";
    const key = "incroute-instant-index";
    const keyLocation = `https://${host}/${key}.txt`;
    const urlList = newUrl ? [newUrl, sitemapUrl] : [sitemapUrl];

    const inRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList
      })
    });
    indexNowSuccess = inRes.ok || inRes.status === 200 || inRes.status === 202;
  } catch (e: any) {
    console.warn("IndexNow ping note:", e.message);
  }

  return { google: googleSuccess, indexNow: indexNowSuccess };
}
