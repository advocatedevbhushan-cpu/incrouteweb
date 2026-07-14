# INCroute Books implementation status

## Delivered in this phase

- URL-backed Books workspaces under `/portal/books/*` and `/admin/books/*`, integrated with the authenticated client and admin portals.
- Responsive dark-navy navigation, organisation and financial-year context, quick create, light/dark mode, loading/error/empty states and confirmation dialogs.
- Existing-entity selection plus standalone admin-firm onboarding that does not require a Client record.
- Tenant, organisation, branch/GSTIN, fiscal year, monthly period, membership, role and action-permission schema.
- Indian units, GST rates, role permissions and chart-of-accounts seed masters. No demo transactions are seeded.
- Customer and vendor masters.
- Goods and services masters with HSN/SAC, units, GST and stock configuration.
- GST invoice drafts, explicit posting, exact paise/GST calculations and balanced double-entry journals.
- Full and partial customer-payment allocation with receivable and cash/bank ledger updates.
- Branded invoice PDF generation.
- Vendor-bill drafts and posting to expense, input GST and accounts payable.
- Immediately paid expenses posted to expense and cash ledgers.
- Dashboard using posted records only, linked INCroute compliance tasks and real audit activity.
- Trial balance, profit and loss, balance sheet, GST working summary and CSV exports.
- Append-only, hash-chained organisation audit events.
- Completed-period locking and server-side posting rejection for locked periods.
- Exact-arithmetic tests for ledger balance, GST, invoice/payment/bill/expense/credit-note posting shapes, payment allocation, reconciliation differences, period locks and tenant scope.

## Deliberately not enabled yet

- Live GST filing, GSTR-2B provider synchronisation, e-invoicing/e-way-bill providers.
- Automatic bank feeds and automatic reconciliation.
- Payroll and AI accounting.
- Quotations, recurring transactions, sales/purchase orders, delivery challans and the credit/debit-note user workflows.
- Books attachment UI and transaction document versioning; the schema and existing R2 document service are ready for the next phase.
- Customer/vendor external sign-in portals and advanced approval-rule editors.
- Browser end-to-end automation, because this repository has no configured E2E runner or isolated test database.

## Deployment gates

1. Apply the Books migration and reference seed to an authorised MySQL target.
2. Set a strong production `JWT_SECRET` and remove/disable existing fallback setup/debug access.
3. Run `npm run test:books`, `npm run lint` and `npm run build`.
4. Complete role-matrix, migration rollback rehearsal, PDF visual baseline and browser acceptance checks against a non-production database.
