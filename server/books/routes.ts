import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import {
  assertBalanced,
  assertPostingPeriodOpen,
  allocateCustomerPayment,
  buildCustomerPaymentPosting,
  buildExpensePosting,
  buildSalesInvoicePosting,
  buildVendorBillPosting,
  calculateGst,
  fromMinorUnits,
  summariseFinancialReports,
  toMinorUnits,
  type JournalLineDraft,
} from "./accounting";
import { DEFAULT_ACCOUNTS, DEFAULT_ROLES, DEFAULT_TAX_RATES, DEFAULT_UNITS } from "./defaults";
import { assertTenantScope, isPlatformAdminRole, standaloneOrganisationAccessKind, type TenantScope } from "./scope";

type ConnectionFactory = () => Promise<any>;
type PortalRequest = Request & { user?: { userId?: string; email?: string; role?: string } };

class BooksHttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");
const money = z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(?:\.\d{1,2})?$/.test(value), "Use a non-negative amount with at most two decimals");
const quantity = z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(?:\.\d{1,3})?$/.test(value) && Number(value) > 0, "Quantity must be positive with at most three decimals");
const gstRate = z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(?:\.\d{1,4})?$/.test(value) && Number(value) <= 100, "GST rate must be between 0 and 100");

const organisationSchema = z.object({
  ownershipScope: z.enum(["ADMIN_FIRM", "CLIENT_ENTITY", "OWN_ORGANISATION"]).optional(),
  sourceEntityId: z.string().max(30).optional().nullable(),
  legalName: z.string().trim().min(2).max(191),
  tradeName: z.string().trim().max(191).optional().nullable(),
  entityType: z.enum(["PRIVATE_LIMITED", "PUBLIC_LIMITED", "LLP", "OPC", "PARTNERSHIP", "PROPRIETORSHIP", "SECTION_8", "OTHER"]),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional().or(z.literal("")),
  tan: z.string().trim().toUpperCase().regex(/^[A-Z]{4}[0-9]{5}[A-Z]$/).optional().or(z.literal("")),
  cinLlpIn: z.string().trim().max(30).optional().or(z.literal("")),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).optional().or(z.literal("")),
  stateCode: z.string().regex(/^[0-9]{2}$/).optional().or(z.literal("")),
  reportingMethod: z.enum(["ACCRUAL", "CASH"]).default("ACCRUAL"),
  financialYearStartMonth: z.number().int().min(1).max(12).default(4),
  invoicePrefix: z.string().trim().toUpperCase().regex(/^[A-Z0-9/-]{1,20}$/).default("INV"),
  registeredAddress: z.object({
    line1: z.string().trim().min(2).max(191), line2: z.string().trim().max(191).optional(),
    city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100),
    postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
  }).optional().nullable(),
});

const contactSchema = z.object({
  organisationId: z.string().min(1).max(30),
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]),
  displayName: z.string().trim().min(2).max(191),
  legalName: z.string().trim().max(191).optional().nullable(),
  email: z.string().email().max(191).optional().or(z.literal("")), phone: z.string().trim().max(30).optional().or(z.literal("")),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).optional().or(z.literal("")),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional().or(z.literal("")),
  placeOfSupply: z.string().regex(/^[0-9]{2}$/).optional().or(z.literal("")),
  paymentTermsDays: z.number().int().min(0).max(365).default(0), openingBalance: money.default("0.00"),
  notes: z.string().max(5000).optional().nullable(),
});

const itemSchema = z.object({
  organisationId: z.string().min(1).max(30), type: z.enum(["GOODS", "SERVICE"]), name: z.string().trim().min(2).max(191),
  sku: z.string().trim().max(100).optional().or(z.literal("")), hsnSac: z.string().trim().regex(/^[0-9]{4,8}$/),
  unitId: z.string().min(1).max(30), taxRateId: z.string().max(30).optional().nullable(), sellingPrice: money.default("0.00"),
  purchasePrice: money.default("0.00"),
  openingStock: z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(?:\.\d{1,3})?$/.test(value)).default("0.000"),
  reorderPoint: z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(?:\.\d{1,3})?$/.test(value)).optional().nullable(),
});

const invoiceSchema = z.object({
  organisationId: z.string().min(1).max(30), customerId: z.string().min(1).max(30), branchId: z.string().max(30).optional().nullable(),
  invoiceDate: isoDate, dueDate: isoDate, placeOfSupply: z.string().regex(/^[0-9]{2}$/),
  supplyType: z.enum(["DOMESTIC", "EXPORT", "SEZ_WITH_PAYMENT", "SEZ_WITHOUT_PAYMENT"]).default("DOMESTIC"),
  reverseCharge: z.boolean().default(false), notes: z.string().max(5000).optional().nullable(), terms: z.string().max(5000).optional().nullable(),
  lines: z.array(z.object({
    itemId: z.string().max(30).optional().nullable(), description: z.string().trim().min(1).max(500),
    hsnSac: z.string().trim().regex(/^[0-9]{4,8}$/), quantity, unitPrice: money, discountAmount: money.default("0.00"), gstRate,
  })).min(1).max(100),
}).refine((value) => value.dueDate >= value.invoiceDate, { message: "Due date cannot be before invoice date", path: ["dueDate"] });

const paymentSchema = z.object({
  organisationId: z.string().min(1).max(30), invoiceId: z.string().min(1).max(30), paymentDate: isoDate,
  amount: money.refine((value) => toMinorUnits(value) > 0n, "Payment amount must be positive"),
  paymentMode: z.enum(["BANK_TRANSFER", "UPI", "CARD", "CHEQUE", "CASH", "OTHER"]),
  depositAccountId: z.string().max(30).optional().nullable(), reference: z.string().trim().max(191).optional().nullable(),
});

const billSchema = z.object({
  organisationId: z.string().min(1).max(30), vendorId: z.string().min(1).max(30), billNumber: z.string().trim().min(1).max(100),
  billDate: isoDate, dueDate: isoDate, placeOfSupply: z.string().regex(/^[0-9]{2}$/),
  lines: z.array(z.object({
    itemId: z.string().max(30).optional().nullable(), description: z.string().trim().min(1).max(500),
    hsnSac: z.string().trim().regex(/^[0-9]{4,8}$/).optional().or(z.literal("")), quantity, unitPrice: money, gstRate,
  })).min(1).max(100),
}).refine((value) => value.dueDate >= value.billDate, { message: "Due date cannot be before bill date", path: ["dueDate"] });

const expenseSchema = z.object({
  organisationId: z.string().min(1).max(30), vendorId: z.string().max(30).optional().nullable(), expenseDate: isoDate,
  description: z.string().trim().min(2).max(500), amount: money.refine((value) => toMinorUnits(value) > 0n, "Expense amount must be positive"),
});

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`.slice(0, 30);
}

function sqlDate(value: Date): string { return value.toISOString().slice(0, 10); }

function currentFiscalYear(startMonth: number) {
  const today = new Date();
  let year = today.getUTCFullYear();
  if (today.getUTCMonth() + 1 < startMonth) year -= 1;
  const start = new Date(Date.UTC(year, startMonth - 1, 1));
  const end = new Date(Date.UTC(year + 1, startMonth - 1, 0));
  return { label: `${year}-${String(year + 1).slice(-2)}`, startsOn: sqlDate(start), endsOn: sqlDate(end) };
}

function monthlyPeriods(startsOn: string) {
  const first = new Date(`${startsOn}T00:00:00.000Z`);
  return Array.from({ length: 12 }, (_, index) => {
    const start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + index, 1));
    const end = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + index + 1, 0));
    return { name: start.toLocaleString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }), startsOn: sqlDate(start), endsOn: sqlDate(end) };
  });
}

function parseQuantity(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
}

function lineTaxable(quantityValue: string, unitPrice: string, discount: string): string {
  const gross = (parseQuantity(quantityValue) * toMinorUnits(unitPrice) + 500n) / 1000n;
  const result = gross - toMinorUnits(discount);
  if (result < 0n) throw new BooksHttpError(400, "Line discount cannot exceed the line value", "INVALID_DISCOUNT");
  return fromMinorUnits(result);
}

function respondError(res: Response, error: any): void {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: error.issues.map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`).join("; "), code: "VALIDATION_ERROR" });
  } else if (error instanceof BooksHttpError) {
    res.status(error.status).json({ error: error.message, code: error.code });
  } else if (error?.code === "ER_NO_SUCH_TABLE" || String(error?.message || "").includes("doesn't exist")) {
    res.status(503).json({ error: "INCroute Books database migration has not been applied", code: "BOOKS_SCHEMA_REQUIRED" });
  } else if (error?.code === "ER_DUP_ENTRY") {
    res.status(409).json({ error: "A Books record with this number or unique value already exists", code: "BOOKS_DUPLICATE" });
  } else {
    console.error("INCroute Books request failed:", error);
    res.status(500).json({ error: "INCroute Books request failed", code: "BOOKS_INTERNAL_ERROR" });
  }
}

async function getUser(conn: any, userId: string) {
  const [rows]: any = await conn.query("SELECT id, email, firstName, lastName, role FROM `User` WHERE id = ? AND isActive = 1 LIMIT 1", [userId]);
  if (!rows.length) throw new BooksHttpError(401, "User account is not available", "USER_NOT_FOUND");
  return rows[0];
}

async function getScope(conn: any, userId: string, organisationId: string, permission?: string): Promise<TenantScope> {
  const [adminScopes]: any = await conn.query(
    `SELECT o.tenantId, o.id organisationId, ? userId, 'PLATFORM_ADMIN' roleCode
     FROM \`User\` u JOIN BooksOrganisation o ON o.id = ? AND o.status = 'ACTIVE'
     JOIN BooksTenant t ON t.id = o.tenantId AND t.status = 'ACTIVE'
     WHERE u.id = ? AND u.isActive = 1 AND u.role IN ('ADMIN','SUPER_ADMIN') LIMIT 1`,
    [userId, organisationId, userId],
  );
  if (adminScopes.length) {
    const scope = adminScopes[0] as TenantScope;
    assertTenantScope(scope);
    return scope;
  }
  const [rows]: any = await conn.query(
    `SELECT m.tenantId, m.organisationId, m.userId, r.code roleCode
     FROM BooksOrganisationMember m
     JOIN BooksRole r ON r.id = m.roleId AND r.tenantId = m.tenantId AND r.organisationId = m.organisationId
     JOIN BooksTenant t ON t.id = m.tenantId AND t.status = 'ACTIVE'
     JOIN BooksOrganisation o ON o.id = m.organisationId AND o.tenantId = m.tenantId AND o.status = 'ACTIVE'
     WHERE m.userId = ? AND m.organisationId = ? AND m.status = 'ACTIVE' LIMIT 1`, [userId, organisationId]);
  if (!rows.length) throw new BooksHttpError(403, "You do not have access to this organisation", "ORGANISATION_ACCESS_DENIED");
  const scope = rows[0] as TenantScope;
  assertTenantScope(scope);
  if (permission && !["ORGANISATION_OWNER", "PLATFORM_ADMIN"].includes(scope.roleCode)) {
    const [grants]: any = await conn.query(
      `SELECT 1 FROM BooksOrganisationMember m JOIN BooksRolePermission rp ON rp.roleId = m.roleId
       JOIN BooksPermission p ON p.id = rp.permissionId
       WHERE m.userId = ? AND m.organisationId = ? AND m.tenantId = ? AND m.status = 'ACTIVE' AND p.code = ? LIMIT 1`,
      [userId, organisationId, scope.tenantId, permission]);
    if (!grants.length) throw new BooksHttpError(403, "Your Books role does not allow this action", "PERMISSION_DENIED");
  }
  return scope;
}

async function writeAudit(conn: any, input: {
  scope: TenantScope; actorUserId: string; action: string; entityType: string; entityId: string;
  beforeData?: unknown; afterData?: unknown; ipAddress?: string | null; userAgent?: string | null;
}) {
  const [previous]: any = await conn.query("SELECT hash FROM BooksAuditLog WHERE tenantId = ? AND organisationId = ? ORDER BY createdAt DESC, id DESC LIMIT 1", [input.scope.tenantId, input.scope.organisationId]);
  const previousHash = previous[0]?.hash || null;
  const canonical = JSON.stringify({ tenantId: input.scope.tenantId, organisationId: input.scope.organisationId, actorUserId: input.actorUserId, action: input.action, entityType: input.entityType, entityId: input.entityId, beforeData: input.beforeData ?? null, afterData: input.afterData ?? null, previousHash });
  const hash = crypto.createHash("sha256").update(canonical).digest("hex");
  await conn.query(
    `INSERT INTO BooksAuditLog
      (id, tenantId, organisationId, actorUserId, action, entityType, entityId, beforeData, afterData, ipAddress, userAgent, hash, previousHash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [makeId("ba"), input.scope.tenantId, input.scope.organisationId, input.actorUserId, input.action, input.entityType, input.entityId,
      input.beforeData == null ? null : JSON.stringify(input.beforeData), input.afterData == null ? null : JSON.stringify(input.afterData),
      input.ipAddress || null, input.userAgent || null, hash, previousHash]);
}

async function seedOrganisation(conn: any, tenantId: string, organisationId: string) {
  const [permissionRows]: any = await conn.query("SELECT id, code FROM BooksPermission");
  const permissionMap = new Map<string, string>(permissionRows.map((row: any) => [row.code, row.id]));
  let ownerRoleId = "";
  for (const role of DEFAULT_ROLES) {
    const roleId = makeId("br");
    if (role.code === "ORGANISATION_OWNER") ownerRoleId = roleId;
    await conn.query("INSERT INTO BooksRole (id, tenantId, organisationId, name, code, isSystem) VALUES (?, ?, ?, ?, ?, 1)", [roleId, tenantId, organisationId, role.name, role.code]);
    const permissionIds = "allPermissions" in role && role.allPermissions
      ? permissionRows.map((row: any) => row.id)
      : ("permissions" in role ? role.permissions.map((code) => permissionMap.get(code)).filter(Boolean) : []);
    for (const permissionId of permissionIds) await conn.query("INSERT INTO BooksRolePermission (roleId, permissionId) VALUES (?, ?)", [roleId, permissionId]);
  }
  for (const [code, name] of DEFAULT_UNITS) await conn.query("INSERT INTO BooksUnit (id, tenantId, organisationId, code, name) VALUES (?, ?, ?, ?, ?)", [makeId("bu"), tenantId, organisationId, code, name]);
  for (const rate of DEFAULT_TAX_RATES) await conn.query("INSERT INTO BooksTaxRate (id, tenantId, organisationId, name, rate, taxType) VALUES (?, ?, ?, ?, ?, 'GST')", [makeId("bt"), tenantId, organisationId, `GST ${rate}%`, rate]);
  for (const [code, name, type, subType, normalBalance] of DEFAULT_ACCOUNTS) {
    await conn.query("INSERT INTO BooksAccount (id, tenantId, organisationId, code, name, type, subType, normalBalance, isSystem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)", [makeId("bc"), tenantId, organisationId, code, name, type, subType, normalBalance]);
  }
  if (!ownerRoleId) throw new Error("Owner role seed failed");
  return ownerRoleId;
}

async function accountMap(conn: any, scope: TenantScope): Promise<Record<string, string>> {
  const [accounts]: any = await conn.query("SELECT id, subType FROM BooksAccount WHERE tenantId = ? AND organisationId = ? AND isActive = 1", [scope.tenantId, scope.organisationId]);
  return Object.fromEntries(accounts.map((row: any) => [row.subType, row.id]));
}

async function ensureConfiguredTaxRates(conn: any, scope: TenantScope, rates: string[]): Promise<void> {
  const uniqueRates = [...new Set(rates.map(String))];
  const placeholders = uniqueRates.map(() => "?").join(",");
  const [rows]: any = await conn.query(
    `SELECT COUNT(DISTINCT rate) count FROM BooksTaxRate
     WHERE tenantId = ? AND organisationId = ? AND isActive = 1 AND rate IN (${placeholders})`,
    [scope.tenantId, scope.organisationId, ...uniqueRates],
  );
  if (Number(rows[0].count) !== uniqueRates.length) throw new BooksHttpError(400, "An invoice or bill line uses a GST rate that is not configured for this organisation");
}

async function requireOpenPeriod(conn: any, scope: TenantScope, postingDate: string): Promise<string> {
  const [periods]: any = await conn.query("SELECT id, fiscalYearId, startsOn, endsOn, status FROM BooksAccountingPeriod WHERE tenantId = ? AND organisationId = ? AND ? BETWEEN startsOn AND endsOn", [scope.tenantId, scope.organisationId, postingDate]);
  assertPostingPeriodOpen(postingDate, periods);
  return periods[0].fiscalYearId;
}

async function insertJournal(conn: any, input: { scope: TenantScope; fiscalYearId: string; sourceType: string; sourceId: string; entryNumber: string; entryDate: string; narration: string; userId: string; lines: JournalLineDraft[] }) {
  const totals = assertBalanced(input.lines);
  const journalId = makeId("bje");
  await conn.query(
    `INSERT INTO BooksJournalEntry
      (id, tenantId, organisationId, fiscalYearId, entryNumber, entryDate, sourceType, sourceId, narration, totalDebit, totalCredit, postedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [journalId, input.scope.tenantId, input.scope.organisationId, input.fiscalYearId, input.entryNumber, input.entryDate, input.sourceType, input.sourceId, input.narration, totals.debit, totals.credit, input.userId]);
  for (const line of input.lines) {
    await conn.query("INSERT INTO BooksJournalLine (id, tenantId, organisationId, journalEntryId, accountId, contactId, description, debit, credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [makeId("bjl"), input.scope.tenantId, input.scope.organisationId, journalId, line.accountId, line.contactId || null, line.description || null, line.debit, line.credit]);
  }
  return journalId;
}

export function registerBooksRoutes(app: Express, getConnection: ConnectionFactory): void {
  const writeAttempts = new Map<string, { startedAt: number; count: number }>();

  app.use("/api/portal/books", (req: PortalRequest, res, next) => {
    res.setHeader("Cache-Control", "no-store, private");
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
    const key = req.user?.userId || req.ip || "unknown";
    const now = Date.now();
    const current = writeAttempts.get(key);
    if (!current || now - current.startedAt > 60_000) { writeAttempts.set(key, { startedAt: now, count: 1 }); return next(); }
    current.count += 1;
    if (current.count > 120) return res.status(429).json({ error: "Too many Books write requests. Please wait a minute.", code: "BOOKS_RATE_LIMIT" });
    next();
  });

  app.get("/api/portal/books/bootstrap", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const user = await getUser(conn, userId);
      const [organisations]: any = isPlatformAdminRole(user.role)
        ? await conn.query(
          `SELECT o.id, o.tenantId, o.legalName, o.tradeName, o.entityType, o.pan, o.cinLlpIn, o.baseCurrency, o.reportingMethod,
                  o.sourceEntityId, CASE WHEN bom.userId IS NOT NULL THEN br.code ELSE 'PLATFORM_ADMIN' END roleCode,
                  CASE WHEN t.ownerUserId = ? THEN 'ADMIN_FIRM'
                       WHEN t.clientId IS NOT NULL THEN 'CLIENT_ORGANISATION'
                       ELSE 'PLATFORM_ORGANISATION' END accessKind,
                  (SELECT g.gstin FROM BooksGSTRegistration g WHERE g.tenantId = o.tenantId AND g.organisationId = o.id AND g.isDefault = 1 LIMIT 1) gstin,
                  (SELECT fy.label FROM BooksFiscalYear fy WHERE fy.tenantId = o.tenantId AND fy.organisationId = o.id AND fy.isCurrent = 1 LIMIT 1) fiscalYear
           FROM BooksOrganisation o JOIN BooksTenant t ON t.id = o.tenantId AND t.status = 'ACTIVE'
           LEFT JOIN BooksOrganisationMember bom ON bom.tenantId = o.tenantId AND bom.organisationId = o.id AND bom.userId = ? AND bom.status = 'ACTIVE'
           LEFT JOIN BooksRole br ON br.id = bom.roleId
           WHERE o.status = 'ACTIVE'
           ORDER BY CASE WHEN t.ownerUserId = ? THEN 0 WHEN t.clientId IS NOT NULL THEN 1 ELSE 2 END, o.legalName`,
          [userId, userId, userId])
        : await conn.query(
          `SELECT o.id, o.tenantId, o.legalName, o.tradeName, o.entityType, o.pan, o.cinLlpIn, o.baseCurrency, o.reportingMethod,
                  o.sourceEntityId, r.code roleCode, 'OWN_ORGANISATION' accessKind,
                  (SELECT g.gstin FROM BooksGSTRegistration g WHERE g.tenantId = o.tenantId AND g.organisationId = o.id AND g.isDefault = 1 LIMIT 1) gstin,
                  (SELECT fy.label FROM BooksFiscalYear fy WHERE fy.tenantId = o.tenantId AND fy.organisationId = o.id AND fy.isCurrent = 1 LIMIT 1) fiscalYear
           FROM BooksOrganisationMember m JOIN BooksOrganisation o ON o.id = m.organisationId AND o.tenantId = m.tenantId AND o.status = 'ACTIVE'
           JOIN BooksRole r ON r.id = m.roleId WHERE m.userId = ? AND m.status = 'ACTIVE' ORDER BY o.legalName`, [userId]);
      const [entities]: any = isPlatformAdminRole(user.role)
        ? await conn.query(
          `SELECT e.id, e.name, e.type, e.cin, e.pan, e.gstin, c.id clientId FROM Entity e JOIN Client c ON c.id = e.clientId
           WHERE e.status = 'ACTIVE' ORDER BY e.name`)
        : await conn.query(
          `SELECT e.id, e.name, e.type, e.cin, e.pan, e.gstin, c.id clientId FROM Entity e JOIN Client c ON c.id = e.clientId
           WHERE LOWER(c.contactEmail) = LOWER(?) AND e.status = 'ACTIVE' ORDER BY e.name`, [user.email]);
      res.json({ user, organisations, existingEntities: entities });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/organisations", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = organisationSchema.parse(req.body);
      conn = await getConnection(); await conn.beginTransaction();
      const user = await getUser(conn, userId);
      const platformAdmin = isPlatformAdminRole(user.role);
      const adminFirm = platformAdmin && data.ownershipScope === "ADMIN_FIRM";
      if (data.ownershipScope === "ADMIN_FIRM" && !platformAdmin) {
        throw new BooksHttpError(403, "Only an administrator can create a standalone admin firm", "ADMIN_FIRM_ACCESS_DENIED");
      }
      if (adminFirm && data.sourceEntityId) {
        throw new BooksHttpError(400, "An admin firm must be created separately from a client entity", "ADMIN_FIRM_ENTITY_CONFLICT");
      }
      let client: { id: string; companyName: string } | null = null;
      if (platformAdmin && data.sourceEntityId && !adminFirm) {
        const [entities]: any = await conn.query(
          "SELECT c.id, c.companyName FROM Entity e JOIN Client c ON c.id = e.clientId WHERE e.id = ? AND e.status = 'ACTIVE' LIMIT 1",
          [data.sourceEntityId],
        );
        if (!entities.length) throw new BooksHttpError(403, "The selected entity is not available to this account", "ENTITY_ACCESS_DENIED");
        client = entities[0];
      } else if (!adminFirm) {
        const [clients]: any = await conn.query("SELECT id, companyName FROM Client WHERE LOWER(contactEmail) = LOWER(?) LIMIT 1", [user.email]);
        client = clients[0] || null;
        if (data.sourceEntityId) {
          const [entities]: any = await conn.query("SELECT e.id FROM Entity e JOIN Client c ON c.id = e.clientId WHERE e.id = ? AND LOWER(c.contactEmail) = LOWER(?) LIMIT 1", [data.sourceEntityId, user.email]);
          if (!entities.length) throw new BooksHttpError(403, "The selected entity is not available to this account", "ENTITY_ACCESS_DENIED");
        }
      }
      let tenantId = "";
      const [tenants]: any = client
        ? await conn.query("SELECT id FROM BooksTenant WHERE clientId = ? AND status = 'ACTIVE' LIMIT 1 FOR UPDATE", [client.id])
        : await conn.query("SELECT id FROM BooksTenant WHERE ownerUserId = ? AND clientId IS NULL AND status = 'ACTIVE' LIMIT 1 FOR UPDATE", [userId]);
      if (tenants.length) tenantId = tenants[0].id;
      else {
        tenantId = makeId("bte");
        await conn.query(
          "INSERT INTO BooksTenant (id, clientId, ownerUserId, name) VALUES (?, ?, ?, ?)",
          [tenantId, client?.id || null, client ? null : userId, client?.companyName || `${user.firstName || user.email}'s firms`],
        );
      }
      const organisationId = makeId("bor");
      await conn.query(
        `INSERT INTO BooksOrganisation
          (id, tenantId, sourceEntityId, legalName, tradeName, entityType, pan, tan, cinLlpIn, reportingMethod, financialYearStartMonth, invoicePrefix, registeredAddress)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [organisationId, tenantId, data.sourceEntityId || null, data.legalName, data.tradeName || null, data.entityType, data.pan || null, data.tan || null,
          data.cinLlpIn || null, data.reportingMethod, data.financialYearStartMonth, data.invoicePrefix, data.registeredAddress ? JSON.stringify(data.registeredAddress) : null]);
      const ownerRoleId = await seedOrganisation(conn, tenantId, organisationId);
      await conn.query("INSERT INTO BooksOrganisationMember (id, tenantId, organisationId, userId, roleId, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')", [makeId("bom"), tenantId, organisationId, userId, ownerRoleId]);
      const branchId = makeId("bb");
      const stateCode = data.gstin?.slice(0, 2) || data.stateCode || null;
      await conn.query("INSERT INTO BooksBranch (id, tenantId, organisationId, name, code, stateCode, address, isHeadOffice) VALUES (?, ?, ?, 'Head Office', 'HO', ?, ?, 1)", [branchId, tenantId, organisationId, stateCode, data.registeredAddress ? JSON.stringify(data.registeredAddress) : null]);
      if (data.gstin && stateCode) await conn.query("INSERT INTO BooksGSTRegistration (id, tenantId, organisationId, branchId, gstin, legalName, tradeName, stateCode, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)", [makeId("bgst"), tenantId, organisationId, branchId, data.gstin, data.legalName, data.tradeName || null, stateCode]);
      const year = currentFiscalYear(data.financialYearStartMonth);
      const fiscalYearId = makeId("bfy");
      await conn.query("INSERT INTO BooksFiscalYear (id, tenantId, organisationId, label, startsOn, endsOn, isCurrent) VALUES (?, ?, ?, ?, ?, ?, 1)", [fiscalYearId, tenantId, organisationId, year.label, year.startsOn, year.endsOn]);
      for (const period of monthlyPeriods(year.startsOn)) await conn.query("INSERT INTO BooksAccountingPeriod (id, tenantId, organisationId, fiscalYearId, name, startsOn, endsOn) VALUES (?, ?, ?, ?, ?, ?, ?)", [makeId("bap"), tenantId, organisationId, fiscalYearId, period.name, period.startsOn, period.endsOn]);
      const scope: TenantScope = { tenantId, organisationId, userId, roleCode: "ORGANISATION_OWNER" };
      await writeAudit(conn, { scope, actorUserId: userId, action: "organisation.created", entityType: "organisation", entityId: organisationId, afterData: { legalName: data.legalName, entityType: data.entityType, sourceEntityId: data.sourceEntityId || null }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ organisation: {
        id: organisationId, tenantId, legalName: data.legalName, fiscalYear: year.label,
        accessKind: client ? "CLIENT_ORGANISATION" : standaloneOrganisationAccessKind(user.role),
      } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/dashboard", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      if (!organisationId) throw new BooksHttpError(400, "organisationId is required");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "dashboard.view");
      const params = [scope.tenantId, scope.organisationId];
      const [[sales]]: any = await conn.query(
        `SELECT COALESCE(SUM(balanceDue),0) receivables,
                COALESCE(SUM(CASE WHEN dueDate < CURDATE() AND balanceDue > 0 THEN balanceDue ELSE 0 END),0) overdueReceivables,
                COALESCE(SUM(CASE WHEN invoiceDate >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND status <> 'DRAFT' THEN subTotal ELSE 0 END),0) revenue
         FROM BooksInvoice WHERE tenantId = ? AND organisationId = ? AND status NOT IN ('DRAFT','CANCELLED','VOID')`, params);
      const [[purchases]]: any = await conn.query(
        `SELECT COALESCE(SUM(balanceDue),0) payables,
                COALESCE(SUM(CASE WHEN billDate >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND status <> 'DRAFT' THEN subTotal ELSE 0 END),0) billExpenses,
                (SELECT COALESCE(SUM(e.amount),0) FROM BooksExpense e
                 WHERE e.tenantId = ? AND e.organisationId = ? AND e.expenseDate >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND e.status = 'POSTED') directExpenses
         FROM BooksBill WHERE tenantId = ? AND organisationId = ? AND status NOT IN ('DRAFT','CANCELLED','VOID')`, [...params, ...params]);
      const [[cash]]: any = await conn.query(
        `SELECT COALESCE(SUM(jl.debit - jl.credit),0) bankAndCash FROM BooksJournalLine jl
         JOIN BooksAccount a ON a.id = jl.accountId AND a.tenantId = jl.tenantId AND a.organisationId = jl.organisationId
         WHERE jl.tenantId = ? AND jl.organisationId = ? AND a.subType IN ('CASH','BANK')`, params);
      const [[gst]]: any = await conn.query(
        `SELECT COALESCE(SUM(cgstTotal),0) outputCgst, COALESCE(SUM(sgstTotal),0) outputSgst, COALESCE(SUM(igstTotal),0) outputIgst
         FROM BooksInvoice WHERE tenantId = ? AND organisationId = ? AND status NOT IN ('DRAFT','CANCELLED','VOID')`, params);
      const [activity]: any = await conn.query("SELECT id, action, entityType, entityId, createdAt FROM BooksAuditLog WHERE tenantId = ? AND organisationId = ? ORDER BY createdAt DESC LIMIT 8", params);
      const [cashFlow]: any = await conn.query(
        `SELECT DATE_FORMAT(je.entryDate, '%Y-%m') month, COALESCE(SUM(jl.debit - jl.credit),0) net
         FROM BooksJournalLine jl JOIN BooksJournalEntry je ON je.id = jl.journalEntryId AND je.tenantId = jl.tenantId AND je.organisationId = jl.organisationId
         JOIN BooksAccount a ON a.id = jl.accountId AND a.tenantId = jl.tenantId AND a.organisationId = jl.organisationId
         WHERE jl.tenantId = ? AND jl.organisationId = ? AND a.subType IN ('CASH','BANK')
           AND je.entryDate >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
         GROUP BY DATE_FORMAT(je.entryDate, '%Y-%m') ORDER BY month`, params);
      const [compliance]: any = await conn.query(
        `SELECT ct.id, ct.title, ct.category, ct.dueDate, ct.status
         FROM BooksOrganisation o JOIN ComplianceTask ct ON ct.entityId = o.sourceEntityId
         WHERE o.tenantId = ? AND o.id = ? AND ct.status <> 'COMPLETED' ORDER BY ct.dueDate LIMIT 5`, params);
      const revenue = String(sales.revenue);
      const expenses = fromMinorUnits(toMinorUnits(String(purchases.billExpenses)) + toMinorUnits(String(purchases.directExpenses)));
      res.json({
        summary: {
          receivables: String(sales.receivables), overdueReceivables: String(sales.overdueReceivables), payables: String(purchases.payables),
          bankAndCash: String(cash.bankAndCash), revenue, expenses,
          profitLoss: fromMinorUnits(toMinorUnits(revenue) - toMinorUnits(expenses)),
          gstPayable: fromMinorUnits(toMinorUnits(String(gst.outputCgst)) + toMinorUnits(String(gst.outputSgst)) + toMinorUnits(String(gst.outputIgst))),
        },
        cashFlow: cashFlow.map((row: any) => ({ month: row.month, net: String(row.net) })), compliance, activity,
      });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/contacts", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "contacts.view");
      const requestedType = String(req.query.type || "").toUpperCase();
      const search = String(req.query.search || "").trim().slice(0, 100);
      const values: any[] = [scope.tenantId, scope.organisationId];
      let where = "tenantId = ? AND organisationId = ? AND isActive = 1";
      if (["CUSTOMER", "VENDOR"].includes(requestedType)) { where += " AND type IN (?, 'BOTH')"; values.push(requestedType); }
      if (search) { where += " AND (displayName LIKE ? OR legalName LIKE ? OR gstin LIKE ?)"; values.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      const [contacts]: any = await conn.query(
        `SELECT id, type, displayName, legalName, email, phone, gstin, pan, placeOfSupply, paymentTermsDays, openingBalance
         FROM BooksContact WHERE ${where} ORDER BY displayName LIMIT 250`, values);
      res.json({ contacts });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/contacts", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = contactSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "contacts.manage");
      const id = makeId("bco");
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO BooksContact
          (id, tenantId, organisationId, type, displayName, legalName, email, phone, gstin, pan, placeOfSupply, paymentTermsDays, openingBalance, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, scope.tenantId, scope.organisationId, data.type, data.displayName, data.legalName || null, data.email || null,
          data.phone || null, data.gstin || null, data.pan || null, data.placeOfSupply || null, data.paymentTermsDays, data.openingBalance, data.notes || null]);
      await writeAudit(conn, { scope, actorUserId: userId, action: "contact.created", entityType: "contact", entityId: id, afterData: data, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ contact: { id, ...data } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/items", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "items.view");
      const [items]: any = await conn.query(
        `SELECT i.id, i.type, i.name, i.sku, i.hsnSac, i.sellingPrice, i.purchasePrice, i.openingStock, i.reorderPoint,
                u.id unitId, u.code unitCode, u.name unitName, tr.id taxRateId, tr.name taxName, tr.rate gstRate
         FROM BooksItem i JOIN BooksUnit u ON u.id = i.unitId LEFT JOIN BooksTaxRate tr ON tr.id = i.taxRateId
         WHERE i.tenantId = ? AND i.organisationId = ? AND i.isActive = 1 ORDER BY i.name LIMIT 500`, [scope.tenantId, scope.organisationId]);
      const [units]: any = await conn.query("SELECT id, code, name FROM BooksUnit WHERE tenantId = ? AND organisationId = ? AND isActive = 1 ORDER BY name", [scope.tenantId, scope.organisationId]);
      const [taxRates]: any = await conn.query("SELECT id, name, rate FROM BooksTaxRate WHERE tenantId = ? AND organisationId = ? AND isActive = 1 ORDER BY rate", [scope.tenantId, scope.organisationId]);
      res.json({ items, units, taxRates });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/items", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = itemSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "items.manage");
      const [master]: any = await conn.query(
        `SELECT (SELECT COUNT(*) FROM BooksUnit WHERE id = ? AND tenantId = ? AND organisationId = ? AND isActive = 1) unitCount,
                (SELECT COUNT(*) FROM BooksTaxRate WHERE id = ? AND tenantId = ? AND organisationId = ? AND isActive = 1) taxCount`,
        [data.unitId, scope.tenantId, scope.organisationId, data.taxRateId || "", scope.tenantId, scope.organisationId]);
      if (!master[0].unitCount) throw new BooksHttpError(400, "Selected unit is not available to this organisation");
      if (data.taxRateId && !master[0].taxCount) throw new BooksHttpError(400, "Selected tax rate is not available to this organisation");
      const id = makeId("bit");
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO BooksItem
          (id, tenantId, organisationId, type, name, sku, hsnSac, unitId, taxRateId, sellingPrice, purchasePrice, openingStock, reorderPoint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, scope.tenantId, scope.organisationId, data.type, data.name, data.sku || null, data.hsnSac, data.unitId, data.taxRateId || null,
          data.sellingPrice, data.purchasePrice, data.openingStock, data.reorderPoint || null]);
      await writeAudit(conn, { scope, actorUserId: userId, action: "item.created", entityType: "item", entityId: id, afterData: data, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ item: { id, ...data } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/invoices", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "sales.view");
      const [invoices]: any = await conn.query(
        `SELECT i.id, i.invoiceNumber, i.invoiceDate, i.dueDate, i.status, i.grandTotal, i.amountPaid, i.balanceDue,
                c.displayName customerName, c.gstin customerGstin
         FROM BooksInvoice i JOIN BooksContact c ON c.id = i.customerId AND c.tenantId = i.tenantId AND c.organisationId = i.organisationId
         WHERE i.tenantId = ? AND i.organisationId = ? ORDER BY i.invoiceDate DESC, i.createdAt DESC LIMIT 500`,
        [scope.tenantId, scope.organisationId]);
      res.json({ invoices });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/invoices/:id", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "sales.view");
      const [invoices]: any = await conn.query(
        `SELECT i.*, c.displayName customerName, c.legalName customerLegalName, c.gstin customerGstin, c.pan customerPan,
                c.email customerEmail, c.phone customerPhone, o.legalName organisationName, o.tradeName organisationTradeName,
                o.pan organisationPan, o.registeredAddress,
                (SELECT g.gstin FROM BooksGSTRegistration g WHERE g.tenantId = i.tenantId AND g.organisationId = i.organisationId AND g.branchId = i.branchId AND g.isActive = 1 LIMIT 1) organisationGstin
         FROM BooksInvoice i JOIN BooksContact c ON c.id = i.customerId AND c.tenantId = i.tenantId AND c.organisationId = i.organisationId
         JOIN BooksOrganisation o ON o.id = i.organisationId AND o.tenantId = i.tenantId
         WHERE i.id = ? AND i.tenantId = ? AND i.organisationId = ? LIMIT 1`,
        [req.params.id, scope.tenantId, scope.organisationId]);
      if (!invoices.length) throw new BooksHttpError(404, "Invoice not found");
      const [lines]: any = await conn.query(
        `SELECT id, itemId, description, hsnSac, quantity, unitPrice, discountAmount, taxableAmount, gstRate,
                cgstAmount, sgstAmount, igstAmount, cessAmount, lineTotal
         FROM BooksInvoiceLine WHERE tenantId = ? AND organisationId = ? AND invoiceId = ? ORDER BY createdAt`,
        [scope.tenantId, scope.organisationId, req.params.id]);
      res.json({ invoice: invoices[0], lines });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/invoices", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = invoiceSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "sales.manage");
      await conn.beginTransaction();
      const [customers]: any = await conn.query(
        "SELECT id FROM BooksContact WHERE id = ? AND tenantId = ? AND organisationId = ? AND type IN ('CUSTOMER','BOTH') AND isActive = 1 LIMIT 1",
        [data.customerId, scope.tenantId, scope.organisationId]);
      if (!customers.length) throw new BooksHttpError(400, "Selected customer is not available to this organisation");
      const [orgRows]: any = await conn.query("SELECT invoicePrefix, nextInvoiceNumber FROM BooksOrganisation WHERE id = ? AND tenantId = ? FOR UPDATE", [scope.organisationId, scope.tenantId]);
      const org = orgRows[0];
      const invoiceNumber = `${org.invoicePrefix}-${String(org.nextInvoiceNumber).padStart(5, "0")}`;
      await conn.query("UPDATE BooksOrganisation SET nextInvoiceNumber = nextInvoiceNumber + 1 WHERE id = ? AND tenantId = ?", [scope.organisationId, scope.tenantId]);
      let branchId = data.branchId || "";
      if (!branchId) {
        const [defaultBranches]: any = await conn.query("SELECT id FROM BooksBranch WHERE tenantId = ? AND organisationId = ? AND isHeadOffice = 1 AND isActive = 1 LIMIT 1", [scope.tenantId, scope.organisationId]);
        branchId = defaultBranches[0]?.id;
      }
      const [branches]: any = await conn.query("SELECT id, stateCode FROM BooksBranch WHERE id = ? AND tenantId = ? AND organisationId = ? AND isActive = 1 LIMIT 1", [branchId, scope.tenantId, scope.organisationId]);
      if (!branches.length) throw new BooksHttpError(400, "A valid branch is required");
      if (!branches[0].stateCode && data.supplyType === "DOMESTIC") throw new BooksHttpError(409, "Configure the organisation state before creating a domestic GST invoice");
      const intraState = branches[0].stateCode === data.placeOfSupply;
      await ensureConfiguredTaxRates(conn, scope, data.lines.map((line) => line.gstRate));
      const calculated = data.lines.map((line) => {
        const taxableAmount = lineTaxable(line.quantity, line.unitPrice, line.discountAmount);
        const gst = data.supplyType === "EXPORT" || data.supplyType === "SEZ_WITHOUT_PAYMENT"
          ? calculateGst(taxableAmount, "0", false) : calculateGst(taxableAmount, line.gstRate, intraState);
        return { ...line, ...gst, taxableAmount, lineTotal: gst.total };
      });
      const sum = (field: keyof typeof calculated[number]) => fromMinorUnits(calculated.reduce((total, line) => total + toMinorUnits(String(line[field])), 0n));
      const subTotal = sum("taxableAmount");
      const cgstTotal = sum("cgst");
      const sgstTotal = sum("sgst");
      const igstTotal = sum("igst");
      const grandTotal = sum("lineTotal");
      const discountTotal = fromMinorUnits(calculated.reduce((total, line) => total + toMinorUnits(line.discountAmount), 0n));
      const invoiceId = makeId("binv");
      await conn.query(
        `INSERT INTO BooksInvoice
          (id, tenantId, organisationId, branchId, customerId, invoiceNumber, invoiceDate, dueDate, placeOfSupply, supplyType, reverseCharge,
           subTotal, discountTotal, cgstTotal, sgstTotal, igstTotal, grandTotal, balanceDue, notes, terms, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, scope.tenantId, scope.organisationId, branchId, data.customerId, invoiceNumber, data.invoiceDate, data.dueDate,
          data.placeOfSupply, data.supplyType, data.reverseCharge ? 1 : 0, subTotal, discountTotal, cgstTotal, sgstTotal, igstTotal,
          grandTotal, grandTotal, data.notes || null, data.terms || null, userId]);
      for (const line of calculated) {
        if (line.itemId) {
          const [items]: any = await conn.query("SELECT id FROM BooksItem WHERE id = ? AND tenantId = ? AND organisationId = ? AND isActive = 1 LIMIT 1", [line.itemId, scope.tenantId, scope.organisationId]);
          if (!items.length) throw new BooksHttpError(400, "An invoice line references an unavailable item");
        }
        await conn.query(
          `INSERT INTO BooksInvoiceLine
            (id, tenantId, organisationId, invoiceId, itemId, description, hsnSac, quantity, unitPrice, discountAmount,
             taxableAmount, gstRate, cgstAmount, sgstAmount, igstAmount, lineTotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [makeId("bil"), scope.tenantId, scope.organisationId, invoiceId, line.itemId || null, line.description, line.hsnSac, line.quantity,
            line.unitPrice, line.discountAmount, line.taxableAmount, line.gstRate, line.cgst, line.sgst, line.igst, line.lineTotal]);
      }
      await writeAudit(conn, { scope, actorUserId: userId, action: "invoice.draft_created", entityType: "invoice", entityId: invoiceId, afterData: { invoiceNumber, customerId: data.customerId, grandTotal }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ invoice: { id: invoiceId, invoiceNumber, status: "DRAFT", subTotal, cgstTotal, sgstTotal, igstTotal, grandTotal, balanceDue: grandTotal } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/invoices/:id/post", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.body?.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      if (!organisationId) throw new BooksHttpError(400, "organisationId is required");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "sales.post");
      await conn.beginTransaction();
      const [invoices]: any = await conn.query(
        `SELECT id, customerId, invoiceNumber, invoiceDate, status, subTotal, cgstTotal, sgstTotal, igstTotal, grandTotal
         FROM BooksInvoice WHERE id = ? AND tenantId = ? AND organisationId = ? FOR UPDATE`, [req.params.id, scope.tenantId, scope.organisationId]);
      if (!invoices.length) throw new BooksHttpError(404, "Invoice not found");
      const invoice = invoices[0];
      if (invoice.status !== "DRAFT") throw new BooksHttpError(409, "Only a draft invoice can be posted", "INVALID_INVOICE_STATUS");
      const entryDate = sqlDate(new Date(invoice.invoiceDate));
      const fiscalYearId = await requireOpenPeriod(conn, scope, entryDate);
      const accounts = await accountMap(conn, scope);
      for (const required of ["ACCOUNTS_RECEIVABLE", "SALES", "OUTPUT_CGST", "OUTPUT_SGST", "OUTPUT_IGST"]) {
        if (!accounts[required]) throw new BooksHttpError(409, `Required account ${required} is not configured`, "ACCOUNT_CONFIGURATION_REQUIRED");
      }
      const lines = buildSalesInvoicePosting({
        receivableAccountId: accounts.ACCOUNTS_RECEIVABLE, revenueAccountId: accounts.SALES, outputCgstAccountId: accounts.OUTPUT_CGST,
        outputSgstAccountId: accounts.OUTPUT_SGST, outputIgstAccountId: accounts.OUTPUT_IGST, contactId: invoice.customerId,
        invoiceNumber: invoice.invoiceNumber, taxable: String(invoice.subTotal), cgst: String(invoice.cgstTotal),
        sgst: String(invoice.sgstTotal), igst: String(invoice.igstTotal),
      });
      const journalId = await insertJournal(conn, {
        scope, fiscalYearId, sourceType: "SALES_INVOICE", sourceId: invoice.id, entryNumber: `JE-${invoice.invoiceNumber}`,
        entryDate, narration: `GST sales invoice ${invoice.invoiceNumber}`, userId, lines,
      });
      await conn.query("UPDATE BooksInvoice SET status = 'POSTED', postedAt = NOW(3), postedBy = ? WHERE id = ? AND tenantId = ? AND organisationId = ?", [userId, invoice.id, scope.tenantId, scope.organisationId]);
      await writeAudit(conn, { scope, actorUserId: userId, action: "invoice.posted", entityType: "invoice", entityId: invoice.id, beforeData: { status: "DRAFT" }, afterData: { status: "POSTED", journalId }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.json({ invoice: { id: invoice.id, invoiceNumber: invoice.invoiceNumber, status: "POSTED" }, journalEntryId: journalId });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/payments", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = paymentSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "sales.post");
      await conn.beginTransaction();
      const [invoices]: any = await conn.query(
        "SELECT id, customerId, invoiceNumber, status, balanceDue, amountPaid FROM BooksInvoice WHERE id = ? AND tenantId = ? AND organisationId = ? FOR UPDATE",
        [data.invoiceId, scope.tenantId, scope.organisationId]);
      if (!invoices.length) throw new BooksHttpError(404, "Invoice not found");
      const invoice = invoices[0];
      if (!["POSTED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)) throw new BooksHttpError(409, "Payments can only be recorded against posted unpaid invoices");
      if (toMinorUnits(data.amount) > toMinorUnits(String(invoice.balanceDue))) throw new BooksHttpError(400, "Payment cannot exceed the invoice balance");
      const fiscalYearId = await requireOpenPeriod(conn, scope, data.paymentDate);
      const accounts = await accountMap(conn, scope);
      const depositAccountId = data.depositAccountId || accounts.CASH;
      if (!depositAccountId || !accounts.ACCOUNTS_RECEIVABLE) throw new BooksHttpError(409, "Cash/bank and receivable accounts must be configured");
      const [deposit]: any = await conn.query("SELECT id FROM BooksAccount WHERE id = ? AND tenantId = ? AND organisationId = ? AND type = 'ASSET' AND isActive = 1 LIMIT 1", [depositAccountId, scope.tenantId, scope.organisationId]);
      if (!deposit.length) throw new BooksHttpError(400, "Selected deposit account is not available");
      await conn.query("SELECT id FROM BooksOrganisation WHERE id = ? AND tenantId = ? FOR UPDATE", [scope.organisationId, scope.tenantId]);
      const [countRows]: any = await conn.query("SELECT COUNT(*) count FROM BooksCustomerPayment WHERE tenantId = ? AND organisationId = ?", [scope.tenantId, scope.organisationId]);
      const paymentNumber = `PAY-${String(Number(countRows[0].count) + 1).padStart(5, "0")}`;
      const paymentId = makeId("bpay");
      await conn.query(
        `INSERT INTO BooksCustomerPayment
          (id, tenantId, organisationId, customerId, paymentNumber, paymentDate, amount, paymentMode, reference, status, postedAt, postedBy, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'POSTED', NOW(3), ?, ?)`,
        [paymentId, scope.tenantId, scope.organisationId, invoice.customerId, paymentNumber, data.paymentDate, data.amount, data.paymentMode, data.reference || null, userId, userId]);
      await conn.query("INSERT INTO BooksPaymentAllocation (id, tenantId, organisationId, paymentId, invoiceId, amount) VALUES (?, ?, ?, ?, ?, ?)", [makeId("bpa"), scope.tenantId, scope.organisationId, paymentId, invoice.id, data.amount]);
      const allocation = allocateCustomerPayment(String(invoice.balanceDue), String(invoice.amountPaid), data.amount);
      await conn.query("UPDATE BooksInvoice SET amountPaid = ?, balanceDue = ?, status = ? WHERE id = ? AND tenantId = ? AND organisationId = ?", [allocation.amountPaid, allocation.balanceDue, allocation.status, invoice.id, scope.tenantId, scope.organisationId]);
      const lines = buildCustomerPaymentPosting({ bankAccountId: depositAccountId, receivableAccountId: accounts.ACCOUNTS_RECEIVABLE, contactId: invoice.customerId, paymentNumber, amount: data.amount });
      const journalId = await insertJournal(conn, { scope, fiscalYearId, sourceType: "CUSTOMER_PAYMENT", sourceId: paymentId, entryNumber: `JE-${paymentNumber}`, entryDate: data.paymentDate, narration: `Payment for ${invoice.invoiceNumber}`, userId, lines });
      await writeAudit(conn, { scope, actorUserId: userId, action: "payment.posted", entityType: "customer_payment", entityId: paymentId, afterData: { paymentNumber, amount: data.amount, invoiceId: invoice.id, journalId }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ payment: { id: paymentId, paymentNumber, amount: data.amount, status: "POSTED" }, invoice: { id: invoice.id, status: allocation.status, balanceDue: allocation.balanceDue }, journalEntryId: journalId });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/bills", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "purchases.view");
      const [bills]: any = await conn.query(
        `SELECT b.id, b.billNumber, b.billDate, b.dueDate, b.status, b.subTotal, b.inputCgst, b.inputSgst, b.inputIgst,
                b.grandTotal, b.amountPaid, b.balanceDue, c.displayName vendorName, c.gstin vendorGstin
         FROM BooksBill b JOIN BooksContact c ON c.id = b.vendorId AND c.tenantId = b.tenantId AND c.organisationId = b.organisationId
         WHERE b.tenantId = ? AND b.organisationId = ? ORDER BY b.billDate DESC, b.createdAt DESC LIMIT 500`,
        [scope.tenantId, scope.organisationId]);
      const [expenses]: any = await conn.query(
        `SELECT e.id, e.expenseDate, e.description, e.amount, e.taxAmount, e.status, c.displayName vendorName
         FROM BooksExpense e LEFT JOIN BooksContact c ON c.id = e.vendorId AND c.tenantId = e.tenantId AND c.organisationId = e.organisationId
         WHERE e.tenantId = ? AND e.organisationId = ? ORDER BY e.expenseDate DESC, e.createdAt DESC LIMIT 500`,
        [scope.tenantId, scope.organisationId]);
      res.json({ bills, expenses });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/bills", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = billSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "purchases.manage");
      await conn.beginTransaction();
      const [vendors]: any = await conn.query("SELECT id FROM BooksContact WHERE id = ? AND tenantId = ? AND organisationId = ? AND type IN ('VENDOR','BOTH') AND isActive = 1 LIMIT 1", [data.vendorId, scope.tenantId, scope.organisationId]);
      if (!vendors.length) throw new BooksHttpError(400, "Selected vendor is not available to this organisation");
      const [branches]: any = await conn.query("SELECT id, stateCode FROM BooksBranch WHERE tenantId = ? AND organisationId = ? AND isHeadOffice = 1 AND isActive = 1 LIMIT 1", [scope.tenantId, scope.organisationId]);
      if (!branches.length) throw new BooksHttpError(409, "Head-office branch is not configured");
      if (!branches[0].stateCode) throw new BooksHttpError(409, "Configure the organisation state before creating a GST bill");
      const intraState = branches[0].stateCode === data.placeOfSupply;
      await ensureConfiguredTaxRates(conn, scope, data.lines.map((line) => line.gstRate));
      const calculated = data.lines.map((line) => {
        const taxableAmount = lineTaxable(line.quantity, line.unitPrice, "0.00");
        const gst = calculateGst(taxableAmount, line.gstRate, intraState);
        return { ...line, ...gst, taxableAmount, lineTotal: gst.total };
      });
      const sum = (field: keyof typeof calculated[number]) => fromMinorUnits(calculated.reduce((total, line) => total + toMinorUnits(String(line[field])), 0n));
      const subTotal = sum("taxableAmount"); const inputCgst = sum("cgst"); const inputSgst = sum("sgst"); const inputIgst = sum("igst"); const grandTotal = sum("lineTotal");
      const billId = makeId("bbil");
      await conn.query(
        `INSERT INTO BooksBill
          (id, tenantId, organisationId, vendorId, billNumber, billDate, dueDate, subTotal, inputCgst, inputSgst, inputIgst, grandTotal, balanceDue, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [billId, scope.tenantId, scope.organisationId, data.vendorId, data.billNumber, data.billDate, data.dueDate, subTotal, inputCgst, inputSgst, inputIgst, grandTotal, grandTotal, userId]);
      const accounts = await accountMap(conn, scope);
      if (!accounts.GENERAL) throw new BooksHttpError(409, "General expense account is not configured");
      for (const line of calculated) {
        if (line.itemId) {
          const [items]: any = await conn.query("SELECT id FROM BooksItem WHERE id = ? AND tenantId = ? AND organisationId = ? AND isActive = 1 LIMIT 1", [line.itemId, scope.tenantId, scope.organisationId]);
          if (!items.length) throw new BooksHttpError(400, "A bill line references an unavailable item");
        }
        await conn.query(
          `INSERT INTO BooksBillLine
            (id, tenantId, organisationId, billId, itemId, expenseAccountId, description, hsnSac, quantity, unitPrice,
             taxableAmount, gstRate, cgstAmount, sgstAmount, igstAmount, lineTotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [makeId("bbli"), scope.tenantId, scope.organisationId, billId, line.itemId || null, accounts.GENERAL, line.description,
            line.hsnSac || null, line.quantity, line.unitPrice, line.taxableAmount, line.gstRate, line.cgst, line.sgst, line.igst, line.lineTotal]);
      }
      await writeAudit(conn, { scope, actorUserId: userId, action: "bill.draft_created", entityType: "bill", entityId: billId, afterData: { billNumber: data.billNumber, vendorId: data.vendorId, grandTotal }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ bill: { id: billId, billNumber: data.billNumber, status: "DRAFT", grandTotal, balanceDue: grandTotal } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/bills/:id/post", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.body?.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "purchases.post");
      await conn.beginTransaction();
      const [bills]: any = await conn.query("SELECT id, vendorId, billNumber, billDate, status, subTotal, inputCgst, inputSgst, inputIgst FROM BooksBill WHERE id = ? AND tenantId = ? AND organisationId = ? FOR UPDATE", [req.params.id, scope.tenantId, scope.organisationId]);
      if (!bills.length) throw new BooksHttpError(404, "Bill not found");
      const bill = bills[0];
      if (bill.status !== "DRAFT") throw new BooksHttpError(409, "Only a draft bill can be posted", "INVALID_BILL_STATUS");
      const entryDate = sqlDate(new Date(bill.billDate));
      const fiscalYearId = await requireOpenPeriod(conn, scope, entryDate);
      const accounts = await accountMap(conn, scope);
      for (const required of ["GENERAL", "INPUT_CGST", "INPUT_SGST", "INPUT_IGST", "ACCOUNTS_PAYABLE"]) if (!accounts[required]) throw new BooksHttpError(409, `Required account ${required} is not configured`);
      const lines = buildVendorBillPosting({ expenseAccountId: accounts.GENERAL, inputCgstAccountId: accounts.INPUT_CGST, inputSgstAccountId: accounts.INPUT_SGST, inputIgstAccountId: accounts.INPUT_IGST, payableAccountId: accounts.ACCOUNTS_PAYABLE, contactId: bill.vendorId, billNumber: bill.billNumber, taxable: String(bill.subTotal), cgst: String(bill.inputCgst), sgst: String(bill.inputSgst), igst: String(bill.inputIgst) });
      const journalId = await insertJournal(conn, { scope, fiscalYearId, sourceType: "VENDOR_BILL", sourceId: bill.id, entryNumber: `JE-BILL-${bill.id.slice(-8)}`, entryDate, narration: `Vendor bill ${bill.billNumber}`, userId, lines });
      await conn.query("UPDATE BooksBill SET status = 'POSTED', postedAt = NOW(3), postedBy = ? WHERE id = ? AND tenantId = ? AND organisationId = ?", [userId, bill.id, scope.tenantId, scope.organisationId]);
      await writeAudit(conn, { scope, actorUserId: userId, action: "bill.posted", entityType: "bill", entityId: bill.id, beforeData: { status: "DRAFT" }, afterData: { status: "POSTED", journalId }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.json({ bill: { id: bill.id, billNumber: bill.billNumber, status: "POSTED" }, journalEntryId: journalId });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/expenses", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const data = expenseSchema.parse(req.body);
      conn = await getConnection();
      const scope = await getScope(conn, userId, data.organisationId, "purchases.post");
      await conn.beginTransaction();
      if (data.vendorId) {
        const [vendors]: any = await conn.query("SELECT id FROM BooksContact WHERE id = ? AND tenantId = ? AND organisationId = ? AND type IN ('VENDOR','BOTH') AND isActive = 1 LIMIT 1", [data.vendorId, scope.tenantId, scope.organisationId]);
        if (!vendors.length) throw new BooksHttpError(400, "Selected vendor is not available");
      }
      const fiscalYearId = await requireOpenPeriod(conn, scope, data.expenseDate);
      const accounts = await accountMap(conn, scope);
      if (!accounts.GENERAL || !accounts.CASH) throw new BooksHttpError(409, "General expense and cash accounts must be configured");
      const expenseId = makeId("bex");
      await conn.query(
        `INSERT INTO BooksExpense
          (id, tenantId, organisationId, vendorId, expenseAccountId, paidThroughAccountId, expenseDate, description, amount, taxAmount, status, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 'POSTED', ?)`,
        [expenseId, scope.tenantId, scope.organisationId, data.vendorId || null, accounts.GENERAL, accounts.CASH, data.expenseDate, data.description, data.amount, userId]);
      const lines = buildExpensePosting({ expenseAccountId: accounts.GENERAL, paidThroughAccountId: accounts.CASH, contactId: data.vendorId || null, description: data.description, amount: data.amount });
      const journalId = await insertJournal(conn, { scope, fiscalYearId, sourceType: "EXPENSE", sourceId: expenseId, entryNumber: `JE-EXP-${expenseId.slice(-8)}`, entryDate: data.expenseDate, narration: data.description, userId, lines });
      await writeAudit(conn, { scope, actorUserId: userId, action: "expense.posted", entityType: "expense", entityId: expenseId, afterData: { description: data.description, amount: data.amount, journalId }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit();
      res.status(201).json({ expense: { id: expenseId, ...data, status: "POSTED" }, journalEntryId: journalId });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/reports/trial-balance", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "reports.view");
      const asOf = req.query.asOf ? isoDate.parse(String(req.query.asOf)) : sqlDate(new Date());
      const [accounts]: any = await conn.query(
        `SELECT a.id, a.code, a.name, a.type, a.subType,
                COALESCE(SUM(CASE WHEN je.entryDate <= ? AND je.status = 'POSTED' THEN jl.debit ELSE 0 END),0) debit,
                COALESCE(SUM(CASE WHEN je.entryDate <= ? AND je.status = 'POSTED' THEN jl.credit ELSE 0 END),0) credit
         FROM BooksAccount a LEFT JOIN BooksJournalLine jl ON jl.accountId = a.id AND jl.tenantId = a.tenantId AND jl.organisationId = a.organisationId
         LEFT JOIN BooksJournalEntry je ON je.id = jl.journalEntryId AND je.tenantId = jl.tenantId AND je.organisationId = jl.organisationId
         WHERE a.tenantId = ? AND a.organisationId = ? AND a.isActive = 1
         GROUP BY a.id, a.code, a.name, a.type, a.subType ORDER BY a.code`, [asOf, asOf, scope.tenantId, scope.organisationId]);
      const debit = accounts.reduce((sum: bigint, account: any) => sum + toMinorUnits(String(account.debit)), 0n);
      const credit = accounts.reduce((sum: bigint, account: any) => sum + toMinorUnits(String(account.credit)), 0n);
      res.json({ asOf, accounts: accounts.map((account: any) => ({ ...account, debit: String(account.debit), credit: String(account.credit) })), totals: { debit: fromMinorUnits(debit), credit: fromMinorUnits(credit), balanced: debit === credit } });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/reports/financials", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const from = isoDate.parse(String(req.query.from || `${new Date().getFullYear()}-04-01`));
      const to = isoDate.parse(String(req.query.to || sqlDate(new Date())));
      if (to < from) throw new BooksHttpError(400, "Report end date cannot be before the start date");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "reports.view");
      const [profitLoss]: any = await conn.query(
        `SELECT a.id, a.code, a.name, a.type,
                COALESCE(SUM(CASE WHEN je.status = 'POSTED' AND je.entryDate BETWEEN ? AND ? THEN jl.debit ELSE 0 END),0) debit,
                COALESCE(SUM(CASE WHEN je.status = 'POSTED' AND je.entryDate BETWEEN ? AND ? THEN jl.credit ELSE 0 END),0) credit
         FROM BooksAccount a LEFT JOIN BooksJournalLine jl ON jl.accountId = a.id AND jl.tenantId = a.tenantId AND jl.organisationId = a.organisationId
         LEFT JOIN BooksJournalEntry je ON je.id = jl.journalEntryId AND je.tenantId = jl.tenantId AND je.organisationId = jl.organisationId
         WHERE a.tenantId = ? AND a.organisationId = ? AND a.type IN ('INCOME','EXPENSE') AND a.isActive = 1
         GROUP BY a.id, a.code, a.name, a.type ORDER BY a.code`, [from, to, from, to, scope.tenantId, scope.organisationId]);
      const [balanceSheet]: any = await conn.query(
        `SELECT a.id, a.code, a.name, a.type,
                COALESCE(SUM(CASE WHEN je.status = 'POSTED' AND je.entryDate <= ? THEN jl.debit ELSE 0 END),0) debit,
                COALESCE(SUM(CASE WHEN je.status = 'POSTED' AND je.entryDate <= ? THEN jl.credit ELSE 0 END),0) credit
         FROM BooksAccount a LEFT JOIN BooksJournalLine jl ON jl.accountId = a.id AND jl.tenantId = a.tenantId AND jl.organisationId = a.organisationId
         LEFT JOIN BooksJournalEntry je ON je.id = jl.journalEntryId AND je.tenantId = jl.tenantId AND je.organisationId = jl.organisationId
         WHERE a.tenantId = ? AND a.organisationId = ? AND a.type IN ('ASSET','LIABILITY','EQUITY') AND a.isActive = 1
         GROUP BY a.id, a.code, a.name, a.type ORDER BY a.code`, [to, to, scope.tenantId, scope.organisationId]);
      const totals = summariseFinancialReports(profitLoss, balanceSheet);
      const profitLossAmount = (row: any): bigint => row.type === "INCOME"
        ? toMinorUnits(String(row.credit)) - toMinorUnits(String(row.debit))
        : toMinorUnits(String(row.debit)) - toMinorUnits(String(row.credit));
      const balanceSheetAmount = (row: any): bigint => row.type === "ASSET"
        ? toMinorUnits(String(row.debit)) - toMinorUnits(String(row.credit))
        : toMinorUnits(String(row.credit)) - toMinorUnits(String(row.debit));
      res.json({ from, to,
        profitAndLoss: { rows: profitLoss.map((row: any) => ({ ...row, debit: String(row.debit), credit: String(row.credit), amount: fromMinorUnits(profitLossAmount(row)) })), totals: { income: totals.income, expenses: totals.expenses, netProfit: totals.netProfit } },
        balanceSheet: { rows: balanceSheet.map((row: any) => ({ ...row, debit: String(row.debit), credit: String(row.credit), amount: fromMinorUnits(balanceSheetAmount(row)) })), totals: { assets: totals.assets, liabilities: totals.liabilities, equity: totals.equity, currentPeriodEarnings: totals.netProfit, balanced: totals.balanceSheetBalanced } },
      });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/gst/summary", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      const from = isoDate.parse(String(req.query.from || `${new Date().getFullYear()}-04-01`));
      const to = isoDate.parse(String(req.query.to || sqlDate(new Date())));
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "gst.view");
      const [[outward]]: any = await conn.query(
        `SELECT COALESCE(SUM(subTotal),0) taxable, COALESCE(SUM(cgstTotal),0) cgst, COALESCE(SUM(sgstTotal),0) sgst,
                COALESCE(SUM(igstTotal),0) igst, COUNT(*) invoices,
                COALESCE(SUM(CASE WHEN c.gstin IS NOT NULL THEN 1 ELSE 0 END),0) b2b,
                COALESCE(SUM(CASE WHEN c.gstin IS NULL THEN 1 ELSE 0 END),0) b2c
         FROM BooksInvoice i JOIN BooksContact c ON c.id = i.customerId AND c.tenantId = i.tenantId AND c.organisationId = i.organisationId
         WHERE i.tenantId = ? AND i.organisationId = ? AND i.invoiceDate BETWEEN ? AND ? AND i.status NOT IN ('DRAFT','CANCELLED','VOID')`,
        [scope.tenantId, scope.organisationId, from, to]);
      const [[inward]]: any = await conn.query(
        `SELECT COALESCE(SUM(subTotal),0) taxable, COALESCE(SUM(inputCgst),0) cgst, COALESCE(SUM(inputSgst),0) sgst,
                COALESCE(SUM(inputIgst),0) igst, COUNT(*) bills
         FROM BooksBill WHERE tenantId = ? AND organisationId = ? AND billDate BETWEEN ? AND ? AND status NOT IN ('DRAFT','CANCELLED','VOID')`,
        [scope.tenantId, scope.organisationId, from, to]);
      const outputTax = toMinorUnits(String(outward.cgst)) + toMinorUnits(String(outward.sgst)) + toMinorUnits(String(outward.igst));
      const inputTax = toMinorUnits(String(inward.cgst)) + toMinorUnits(String(inward.sgst)) + toMinorUnits(String(inward.igst));
      res.json({ from, to,
        outward: { ...outward, taxable: String(outward.taxable), cgst: String(outward.cgst), sgst: String(outward.sgst), igst: String(outward.igst), totalTax: fromMinorUnits(outputTax) },
        inward: { ...inward, taxable: String(inward.taxable), cgst: String(inward.cgst), sgst: String(inward.sgst), igst: String(inward.igst), totalTax: fromMinorUnits(inputTax) },
        netPayable: fromMinorUnits(outputTax - inputTax),
      });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/periods", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId; const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection(); const scope = await getScope(conn, userId, organisationId, "accountant.view");
      const [periods]: any = await conn.query("SELECT id, name, startsOn, endsOn, status, lockedAt, lockedBy FROM BooksAccountingPeriod WHERE tenantId = ? AND organisationId = ? ORDER BY startsOn", [scope.tenantId, scope.organisationId]);
      res.json({ periods });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });

  app.post("/api/portal/books/periods/:id/lock", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId; const organisationId = String(req.body?.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection(); const scope = await getScope(conn, userId, organisationId, "accountant.lock_period");
      await conn.beginTransaction();
      const [periods]: any = await conn.query("SELECT id, name, startsOn, endsOn, status FROM BooksAccountingPeriod WHERE id = ? AND tenantId = ? AND organisationId = ? FOR UPDATE", [req.params.id, scope.tenantId, scope.organisationId]);
      if (!periods.length) throw new BooksHttpError(404, "Accounting period not found");
      if (periods[0].status === "LOCKED") throw new BooksHttpError(409, "Accounting period is already locked");
      if (sqlDate(new Date(periods[0].endsOn)) >= sqlDate(new Date())) throw new BooksHttpError(409, "Only a completed accounting period can be locked");
      await conn.query("UPDATE BooksAccountingPeriod SET status = 'LOCKED', lockedAt = NOW(3), lockedBy = ? WHERE id = ? AND tenantId = ? AND organisationId = ?", [userId, req.params.id, scope.tenantId, scope.organisationId]);
      await writeAudit(conn, { scope, actorUserId: userId, action: "accounting_period.locked", entityType: "accounting_period", entityId: req.params.id, beforeData: { status: periods[0].status }, afterData: { status: "LOCKED", name: periods[0].name }, ipAddress: req.ip, userAgent: req.headers["user-agent"] || null });
      await conn.commit(); res.json({ period: { ...periods[0], status: "LOCKED" } });
    } catch (error) { if (conn) try { await conn.rollback(); } catch {}; respondError(res, error); } finally { conn?.release(); }
  });

  app.get("/api/portal/books/audit", async (req: PortalRequest, res) => {
    let conn: any;
    try {
      const userId = req.user?.userId;
      const organisationId = String(req.query.organisationId || "");
      if (!userId) throw new BooksHttpError(401, "Not authenticated");
      conn = await getConnection();
      const scope = await getScope(conn, userId, organisationId, "audit.view");
      const [entries]: any = await conn.query(
        "SELECT id, actorUserId, action, entityType, entityId, afterData, hash, previousHash, createdAt FROM BooksAuditLog WHERE tenantId = ? AND organisationId = ? ORDER BY createdAt DESC LIMIT 250",
        [scope.tenantId, scope.organisationId]);
      res.json({ entries });
    } catch (error) { respondError(res, error); } finally { conn?.release(); }
  });
}
