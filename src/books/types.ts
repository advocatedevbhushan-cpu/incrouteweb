export interface BooksOrganisation {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName?: string | null;
  entityType: string;
  pan?: string | null;
  cinLlpIn?: string | null;
  gstin?: string | null;
  baseCurrency: string;
  reportingMethod: "ACCRUAL" | "CASH";
  sourceEntityId?: string | null;
  roleCode: string;
  accessKind?: "ADMIN_FIRM" | "CLIENT_ORGANISATION" | "PLATFORM_ORGANISATION" | "OWN_ORGANISATION";
  fiscalYear?: string | null;
}

export interface ExistingEntity {
  id: string;
  name: string;
  type: string;
  cin?: string | null;
  pan?: string | null;
  gstin?: string | null;
}

export interface BooksBootstrap {
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
  organisations: BooksOrganisation[];
  existingEntities: ExistingEntity[];
}

export interface BooksContact {
  id: string;
  type: "CUSTOMER" | "VENDOR" | "BOTH";
  displayName: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  pan?: string | null;
  placeOfSupply?: string | null;
  paymentTermsDays: number;
  openingBalance: string;
}

export interface BooksItem {
  id: string;
  type: "GOODS" | "SERVICE";
  name: string;
  sku?: string | null;
  hsnSac: string;
  sellingPrice: string;
  purchasePrice: string;
  openingStock: string;
  reorderPoint?: string | null;
  unitId: string;
  unitCode: string;
  unitName: string;
  taxRateId?: string | null;
  taxName?: string | null;
  gstRate?: string | null;
}

export interface BooksInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  grandTotal: string;
  amountPaid: string;
  balanceDue: string;
  customerName: string;
  customerGstin?: string | null;
}
