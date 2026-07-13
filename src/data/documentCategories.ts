export interface DocumentCategory {
  id: string;
  label: string;
}

export const documentCategories: DocumentCategory[] = [
  { id: "popular", label: "Popular" },
  { id: "incorporation", label: "Incorporation" },
  { id: "board", label: "Board & Governance" },
  { id: "contracts", label: "Contracts" },
  { id: "hr", label: "Human Resources" },
  { id: "compliance", label: "Compliance" },
  { id: "notices", label: "Notices" },
  { id: "finance", label: "Finance" },
  { id: "ip", label: "Intellectual Property" }
];
