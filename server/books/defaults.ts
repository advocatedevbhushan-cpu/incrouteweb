export const DEFAULT_ROLES = [
  { code: "ORGANISATION_OWNER", name: "Organisation Owner", allPermissions: true },
  { code: "DIRECTOR", name: "Director", permissions: ["dashboard.view", "sales.view", "purchases.view", "accountant.view", "gst.view", "reports.view", "documents.view", "audit.view"] },
  { code: "FINANCE_ADMIN", name: "Finance Admin", permissions: ["dashboard.view", "contacts.view", "contacts.manage", "items.view", "items.manage", "sales.view", "sales.manage", "sales.post", "purchases.view", "purchases.manage", "purchases.post", "banking.view", "banking.reconcile", "accountant.view", "accountant.post", "gst.view", "reports.view", "reports.export", "documents.view", "documents.manage", "approvals.action", "audit.view"] },
  { code: "ACCOUNTANT", name: "Accountant", permissions: ["dashboard.view", "contacts.view", "items.view", "sales.view", "sales.manage", "sales.post", "purchases.view", "purchases.manage", "purchases.post", "banking.view", "banking.reconcile", "accountant.view", "accountant.post", "accountant.lock_period", "gst.view", "reports.view", "reports.export", "documents.view", "documents.manage", "audit.view"] },
  { code: "AUDITOR", name: "Auditor", permissions: ["dashboard.view", "contacts.view", "items.view", "sales.view", "purchases.view", "banking.view", "accountant.view", "gst.view", "reports.view", "reports.export", "documents.view", "audit.view"] },
  { code: "SALES_USER", name: "Sales User", permissions: ["dashboard.view", "contacts.view", "contacts.manage", "items.view", "sales.view", "sales.manage", "documents.view"] },
  { code: "PURCHASE_USER", name: "Purchase User", permissions: ["dashboard.view", "contacts.view", "contacts.manage", "items.view", "purchases.view", "purchases.manage", "documents.view"] },
  { code: "COMPLIANCE_MANAGER", name: "Compliance Manager", permissions: ["dashboard.view", "gst.view", "reports.view", "reports.export", "documents.view", "documents.manage", "audit.view"] },
  { code: "READ_ONLY", name: "Read Only", permissions: ["dashboard.view", "contacts.view", "items.view", "sales.view", "purchases.view", "banking.view", "accountant.view", "gst.view", "reports.view", "documents.view", "audit.view"] },
] as const;

export const DEFAULT_UNITS = [
  ["NOS", "Numbers"], ["PCS", "Pieces"], ["KGS", "Kilograms"], ["MTR", "Metres"],
  ["LTR", "Litres"], ["BOX", "Boxes"], ["HRS", "Hours"], ["DAY", "Days"], ["MON", "Months"],
] as const;

export const DEFAULT_TAX_RATES = ["0", "0.1", "0.25", "1", "1.5", "3", "5", "6", "7.5", "12", "18", "28"] as const;

export const DEFAULT_ACCOUNTS = [
  ["1000", "Cash in Hand", "ASSET", "CASH", "DEBIT"],
  ["1010", "Bank Accounts", "ASSET", "BANK", "DEBIT"],
  ["1100", "Accounts Receivable", "ASSET", "ACCOUNTS_RECEIVABLE", "DEBIT"],
  ["1200", "Inventory", "ASSET", "INVENTORY", "DEBIT"],
  ["1300", "Input CGST", "ASSET", "INPUT_CGST", "DEBIT"],
  ["1310", "Input SGST", "ASSET", "INPUT_SGST", "DEBIT"],
  ["1320", "Input IGST", "ASSET", "INPUT_IGST", "DEBIT"],
  ["2000", "Accounts Payable", "LIABILITY", "ACCOUNTS_PAYABLE", "CREDIT"],
  ["2100", "Output CGST", "LIABILITY", "OUTPUT_CGST", "CREDIT"],
  ["2110", "Output SGST", "LIABILITY", "OUTPUT_SGST", "CREDIT"],
  ["2120", "Output IGST", "LIABILITY", "OUTPUT_IGST", "CREDIT"],
  ["3000", "Owner's Equity", "EQUITY", "OWNERS_EQUITY", "CREDIT"],
  ["4000", "Sales Revenue", "INCOME", "SALES", "CREDIT"],
  ["4010", "Service Revenue", "INCOME", "SERVICES", "CREDIT"],
  ["5000", "Cost of Goods Sold", "EXPENSE", "COST_OF_GOODS", "DEBIT"],
  ["6000", "General Expenses", "EXPENSE", "GENERAL", "DEBIT"],
  ["6010", "Professional Fees", "EXPENSE", "PROFESSIONAL_FEES", "DEBIT"],
  ["6020", "Bank Charges", "EXPENSE", "BANK_CHARGES", "DEBIT"],
] as const;

