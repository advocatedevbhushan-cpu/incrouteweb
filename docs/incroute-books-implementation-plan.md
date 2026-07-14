# INCroute Books technical implementation plan

Date: 13 July 2026  
Status: approved implementation baseline before application-code changes

## 1. Existing repository architecture

- Front end: React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router, Motion, Lucide and Recharts.
- Server: one Express/TypeScript process in `server.ts`; Vite middleware is used in development and the compiled front end is served by Express in production.
- Authentication: email/password authentication backed by the existing `User`, `Session` and `RefreshToken` tables. The browser sends a JWT bearer token. Portal, partner and admin API namespaces already have role-aware middleware.
- Database: MySQL through `mysql2/promise` and parameterised raw SQL. Prisma packages are installed but no Prisma schema is present, so Books should not introduce a second runtime ORM until the repository completes that migration.
- Storage: Cloudflare R2 through its S3-compatible client, with signed downloads for portal documents and local storage fallback for existing document workflows.
- Routing: the public site uses a tab-to-route bridge in `App.tsx`; `/portal`, `/partner` and `/admin` render full-screen shells. The client portal currently uses component state for its inner screens rather than URL-backed subroutes.
- UI/state: global CSS custom properties supply light/dark tokens; portal and admin modules use Tailwind utility classes. Server data is fetched directly with component-local React state. There is no global client data cache.
- Current portal modules: Overview, My Entities, Compliance, Documents, Trademarks, Legal, Tax & GST, Consultations, service invoices, Support, Notifications and Settings.
- Delivery: `npm run build` compiles the Vite client and bundles `server.ts` for Node. No `.openai/hosting.json` is present, so the project is not currently configured for Sites hosting.

## 2. Reusable INCroute components and services

- `AuthContext` and the `/api/auth` session contract for all Books routes.
- Existing `Client` and `Entity` records as optional onboarding sources; Books organisations will reference an existing entity without changing its compliance ownership.
- Existing portal shell interaction patterns, responsive sidebar, mobile drawer, theme tokens, status badges, search fields, empty states, loading patterns and notification affordances.
- Compliance data from `ComplianceTask`, surfaced inside the Books dashboard and calendar without duplicating tasks.
- Document storage and signed download services. Books adds organisation/transaction links while retaining existing R2 objects and document permissions.
- Existing audit conventions in `AuditLog`; financial audit records will additionally be append-only and organisation scoped.
- Existing logo, colour tokens and typography. Books receives its own dark-navy workspace treatment while remaining recognisably INCroute.

## 3. Required database changes

Books will use new `Books*` tables to prevent collisions with INCroute service billing, especially the existing `Invoice` table. IDs remain application-generated strings to match the current schema. All financial amounts use `DECIMAL`, never floating point.

### Ownership and configuration

- `BooksTenant`, linked to the existing `Client` where applicable.
- `BooksOrganisation`, optionally linked to an existing `Entity`.
- `BooksOrganisationMember`, `BooksRole`, `BooksPermission` and `BooksRolePermission`.
- `BooksBranch`, `BooksGSTRegistration`, `BooksFiscalYear`, `BooksAccountingPeriod`.
- Every organisation-owned table includes both `tenantId` and `organisationId`; indexes begin with those keys.

### Masters and transactions

- `BooksContact`, `BooksAddress`, `BooksUnit`, `BooksTaxRate`, `BooksItem`.
- `BooksAccount`, `BooksJournalEntry`, `BooksJournalLine`.
- `BooksEstimate`, `BooksInvoice`, `BooksInvoiceLine`, `BooksCreditNote`, `BooksCustomerPayment`, `BooksPaymentAllocation`.
- `BooksPurchaseOrder`, `BooksBill`, `BooksBillLine`, `BooksVendorPayment`, `BooksExpense`.
- `BooksBankAccount`, `BooksBankTransaction`, `BooksReconciliation`, `BooksInventoryMovement`.
- `BooksDocumentLink`, `BooksApproval`, `BooksWorkflowRule`, `BooksAuditLog`.

### Integrity rules

- Posted records are immutable through the application API; corrections create a reversal, credit note, debit note, cancellation or void event.
- Drafts never create journal rows.
- Posting and payment allocation run inside MySQL transactions with row locks on the source record and accounting period.
- Journal balance is checked in integer minor units by the accounting service before SQL insertion. The database also uses decimal columns and unique source/posting keys to prevent duplicate posting.
- Locked periods reject posting, editing and reversal requests within the locked date range.
- Tenant and organisation identifiers come from the authenticated membership context, not untrusted request-body values.

## 4. Proposed route structure

The existing `/portal` remains unchanged. URL-backed Books routes are added beneath it:

- `/portal/books` and `/portal/books/dashboard`
- `/portal/books/sales`, `/portal/books/invoices`, `/portal/books/customers`
- `/portal/books/purchases`, `/portal/books/bills`, `/portal/books/vendors`
- `/portal/books/items`, `/portal/books/banking`, `/portal/books/accountant`
- `/portal/books/gst`, `/portal/books/reports`, `/portal/books/documents`
- `/portal/books/settings`

Books navigation uses `history.pushState` through React Router so deep links, refresh, browser Back and Forward, and mobile navigation all work. Existing portal state screens continue to work during the transition.

## 5. Module boundaries

- `src/books`: Books workspace shell, route registry, shared tables/forms, pages and typed API client.
- `server/books`: authentication/membership scope, payload validation, permission checks, accounting engine, GST calculations, posting services, reports and route handlers.
- `migrations`: forward-only, idempotent MySQL migrations.
- `seeds`: deterministic Indian chart of accounts, units, GST rates, roles and permissions.
- `tests/books`: unit and service-level regression tests for financial invariants.

The pure accounting and GST functions will have no Express or database dependencies. This keeps balancing, tax rounding and status transitions directly testable.

## 6. Implementation order

1. Foundation: multi-tenant schema, seed data, membership scope, permissions, accounting/GST pure functions and tests.
2. Organisation onboarding and workspace shell: existing-entity selection, organisation creation, organisation/fiscal-year switchers and dashboard.
3. Masters: customers, vendors, addresses, items, units, tax rates and chart of accounts.
4. Sales: GST invoice drafts, posting, PDF generation, payments, allocations, credit notes and customer statements.
5. Purchases: bills, expenses, payments, debit/vendor credits and approvals.
6. Accountant: journals, ledger, trial balance, P&L, balance sheet, cash flow, locks and immutable audit trail.
7. Banking/GST/Documents: statement import, reconciliation, GST working reports/exports, document links/version access.
8. Hardening: complete permission matrix, rate limits, export protection, responsive/accessibility review and end-to-end acceptance tests.

Each phase must pass `npm run lint`, the Books tests and the production build before the next phase starts.

## 7. Initial implementation slice

The first runnable slice will include:

- Books route-aware shell and dashboard/onboarding states.
- Organisation selection from existing entities and new organisation creation.
- Database migration plus seed data for tenancy, configuration, masters, ledger, invoices, bills, banking, approvals and audit.
- Authenticated, organisation-scoped bootstrap/dashboard, organisation, contact, item and invoice endpoints.
- A double-entry posting service for GST sales invoices and customer payments.
- Unit tests covering ledger balance, GST split/interstate calculation, invoice posting shape, payment posting shape, period-lock rejection and tenant-scope requirements.

Subsequent transaction screens can build on these contracts without changing the ledger foundation.

## 8. Risks and missing dependencies

- The repository documents Prisma but currently operates through raw SQL and has no Prisma schema. Books will follow the working raw-SQL path; adding Prisma is a separate migration project.
- The current client stores access tokens in `localStorage`. Books reuses it for compatibility, but production hardening should move refresh/session credentials to secure, HTTP-only cookies.
- A development fallback JWT secret and fallback admin path exist in the current server. Production must provide a strong `JWT_SECRET`, disable fallback credentials and protect or remove setup/debug endpoints.
- Existing inner portal navigation is not URL-backed. The integration must add deep-link behaviour without breaking current state-based screens.
- There is no installed end-to-end browser test runner and no configured CI pipeline. Pure/unit tests can be added now; full browser tests need an agreed runner and test database.
- Live GST filing, bank feeds, payment gateways and e-invoicing require provider credentials and are intentionally outside the accounting MVP.
- Invoice PDF generation is available through jsPDF, but robust PDF regression checks will need stable font assets and a rendering baseline.
- The current MySQL instance and migration execution rights are external deployment dependencies. Migrations will be delivered but not applied without an authorised database target.
- Books cannot expose seed/demo transactions in production. Only configuration masters (roles, permissions, units, GST rates and chart-of-account templates) are seeded.

