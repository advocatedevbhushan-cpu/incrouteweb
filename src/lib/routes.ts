// Route definitions — single source of truth for all URLs
export const ROUTES = {
  home: "/",
  services: "/services/",
  serviceDetail: (slug: string) => `/services/${slug}/`,
  compliance: "/compliance/",
  blog: "/blog/",
  blogPost: (category: string, slug: string) => `/blog/${category}/${slug}/`,
  blogTag: (tag: string) => `/blog/tag/${tag}/`,
  knowledgeHub: "/knowledge-hub/",
  knowledgeCategory: (cat: string) => `/knowledge-hub/${cat}/`,
  knowledgeQuestion: (cat: string, slug: string) => `/knowledge-hub/${cat}/${slug}/`,
  catalog: "/catalog/",
  tools: "/tools/",
  toolDrafting: "/tools/document-drafting/",
  about: "/about/",
  contact: "/contact/",
  nameChecker: "/tools/name-checker/",
  comparison: "/tools/entity-comparison/",
  impact: "/tools/impact-dashboard/",
  flowchart: "/compliance/flowchart/",
} as const;

// Map old tab names to new routes (for migration)
export const TAB_TO_ROUTE: Record<string, string> = {
  services: ROUTES.home,
  compliance: ROUTES.compliance,
  blog: ROUTES.blog,
  catalog: ROUTES.catalog,
  about: ROUTES.about,
  contact: ROUTES.contact,
  "name-checker": ROUTES.nameChecker,
  tools: ROUTES.tools,
  faq: ROUTES.knowledgeHub,
  comparison: ROUTES.comparison,
  impact: ROUTES.impact,
  flowchart: ROUTES.flowchart,
  testimonials: "/testimonials/",
};

// Breadcrumb label map
export const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/services/": "Services",
  "/compliance/": "Compliance",
  "/blog/": "Blog",
  "/catalog/": "Catalog",
  "/about/": "About Us",
  "/contact/": "Contact",
  "/tools/": "Tools",
  "/tools/name-checker/": "Name Checker",
  "/tools/document-drafting/": "Document Drafting",
  "/tools/entity-comparison/": "Entity Comparison",
  "/tools/impact-dashboard/": "Impact Dashboard",
  "/knowledge-hub/": "Knowledge Hub",
  "/compliance/flowchart/": "Compliance Flowchart",
  "/testimonials/": "Testimonials",
};
