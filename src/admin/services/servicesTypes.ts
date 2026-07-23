export interface AdminServiceItem {
  id: string;
  code: string;
  name: string;
  category: "Incorporation" | "Compliance" | "Registrations" | "GST Services" | "Taxation" | "Legal & Drafting" | "Trademark" | "Licences" | "Virtual Office" | "Accounting" | "Other Services";
  description: string;
  fullDescription?: string;
  basePrice: number;
  discountPrice?: number;
  gstRate: number; // e.g. 18
  govtFee: number;
  profFee: number;
  totalCalculatedPrice: number;
  priceDisplayType: "FIXED" | "STARTING_FROM" | "CUSTOM_QUOTE" | "CONTACT_FOR_PRICE";
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
  ordersCount: number;
  monthlyRevenue: number;
  popularityScore: number; // 0 to 100
  estimatedDays: number;
  isPopular?: boolean;
  department: string;
  defaultAssignee?: string;
  requiredDocuments: string[];
  workflowStages: { title: string; desc: string }[];
  checklistItems: { id: string; title: string; mandatory: boolean }[];
  lastUpdated: string;
  clientFacingTitle?: string;
  benefits?: string[];
  faqs?: { q: string; a: string }[];
}

export interface ServiceSummaryKpis {
  totalServices: number;
  activeServices: number;
  popularService: string;
  popularServiceOrdersShare: string;
  totalOrdersThisMonth: number;
  monthlyRevenue: number;
  revenueGrowthPercent: number;
  draftOrInactive: number;
}

export interface ServiceTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  gstRate: number;
  estimatedDays: number;
  requiredDocuments: string[];
  checklist: string[];
  workflowStages: { title: string; desc: string }[];
  defaultAssignee: string;
}
