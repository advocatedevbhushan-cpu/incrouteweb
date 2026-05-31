export interface ChecklistItem {
  id: string;
  name: string;
  required: boolean;
  status: "approved" | "pending" | "rejected";
  uploadedFile: string | null;
  size: string | null;
}

export interface ComplianceItem {
  id: string;
  name: string;
  status: "approved" | "pending" | "rejected";
  dueDate: string;
  description: string;
}

export interface ComplianceStatus {
  nextDue: string;
  alertCount: number;
  items: ComplianceItem[];
}

export interface OrderHistoryItem {
  date: string;
  activity: string;
}

export interface FirmOrder {
  id: string;
  companyName: string;
  firmType: string;
  status: "draft" | "name_approval" | "document_review" | "roc_filing" | "approved";
  stepProgress: number;
  createdAt: string;
  email: string;
  checklist: ChecklistItem[];
  complianceStatus: ComplianceStatus;
  history: OrderHistoryItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ComplianceEvent {
  id: string;
  service: string;
  description: string;
  dueDate: string;
  type: string;
  downloadUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  date: string;
  author: string;
  views: number;
  tags?: string[];
}

export interface NameCheckHistoryEntry {
  id: string;
  name: string;
  entityType: string;
  industry: string;
  score: number;
  checkedAt: string;
  report: {
    score: number;
    summary: string;
    conflicts: string[];
    checklist: { criterion: string; passed: boolean; reason: string }[];
    suggestions: string[];
  };
}
