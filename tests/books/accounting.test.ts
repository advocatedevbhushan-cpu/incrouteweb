import assert from "node:assert/strict";
import test from "node:test";
import {
  assertBalanced,
  assertPostingPeriodOpen,
  allocateCustomerPayment,
  buildCreditNotePosting,
  buildCustomerPaymentPosting,
  buildExpensePosting,
  buildSalesInvoicePosting,
  buildVendorBillPosting,
  calculateGst,
  fromMinorUnits,
  reconciliationDifference,
  summariseFinancialReports,
  toMinorUnits,
} from "../../server/books/accounting";
import { assertTenantScope, isPlatformAdminRole, standaloneOrganisationAccessKind } from "../../server/books/scope";

test("money uses exact integer minor units", () => {
  assert.equal(toMinorUnits("123456789.09"), 12_345_678_909n);
  assert.equal(fromMinorUnits(12_345_678_909n), "123456789.09");
  assert.throws(() => toMinorUnits("1.001"), /Invalid money value/);
});

test("platform Books access recognises both administrative roles", () => {
  assert.equal(isPlatformAdminRole("ADMIN"), true);
  assert.equal(isPlatformAdminRole("SUPER_ADMIN"), true);
  assert.equal(isPlatformAdminRole("TEAM_MEMBER"), false);
  assert.equal(isPlatformAdminRole("CLIENT"), false);
  assert.equal(standaloneOrganisationAccessKind("ADMIN"), "ADMIN_FIRM");
  assert.equal(standaloneOrganisationAccessKind("SUPER_ADMIN"), "ADMIN_FIRM");
  assert.equal(standaloneOrganisationAccessKind("CLIENT"), "OWN_ORGANISATION");
});

test("intra-state GST splits into equal CGST and SGST", () => {
  assert.deepEqual(calculateGst("1000.00", "18", true), {
    taxable: "1000.00", cgst: "90.00", sgst: "90.00", igst: "0.00", totalTax: "180.00", total: "1180.00",
  });
});

test("inter-state GST applies IGST", () => {
  assert.deepEqual(calculateGst("999.99", "18", false), {
    taxable: "999.99", cgst: "0.00", sgst: "0.00", igst: "180.00", totalTax: "180.00", total: "1179.99",
  });
});

test("sales invoice posting is balanced", () => {
  const lines = buildSalesInvoicePosting({
    receivableAccountId: "ar", revenueAccountId: "sales", outputCgstAccountId: "cgst",
    outputSgstAccountId: "sgst", outputIgstAccountId: "igst", contactId: "customer",
    invoiceNumber: "INV-1", taxable: "1000.00", cgst: "90.00", sgst: "90.00", igst: "0.00",
  });
  assert.deepEqual(assertBalanced(lines), { debit: "1180.00", credit: "1180.00" });
  assert.equal(lines.length, 4);
});

test("customer payment debits bank and credits receivables", () => {
  const lines = buildCustomerPaymentPosting({
    bankAccountId: "bank", receivableAccountId: "ar", contactId: "customer", paymentNumber: "PAY-1", amount: "300.25",
  });
  assert.deepEqual(lines.map(({ accountId, debit, credit }) => ({ accountId, debit, credit })), [
    { accountId: "bank", debit: "300.25", credit: "0.00" },
    { accountId: "ar", debit: "0.00", credit: "300.25" },
  ]);
});

test("unbalanced journals are rejected", () => {
  assert.throws(() => assertBalanced([
    { accountId: "a", debit: "10.00", credit: "0.00" },
    { accountId: "b", debit: "0.00", credit: "9.99" },
  ]), /not balanced/);
});

test("locked periods reject posting", () => {
  const periods = [{ startsOn: "2026-04-01", endsOn: "2027-03-31", status: "LOCKED" }];
  assert.throws(() => assertPostingPeriodOpen("2026-07-13", periods), /locked/);
  assert.throws(() => assertPostingPeriodOpen("2027-04-01", periods), /outside configured/);
});

test("tenant scope requires tenant, organisation, user and role", () => {
  assert.doesNotThrow(() => assertTenantScope({ tenantId: "tenant-a", organisationId: "org-a", userId: "user-a", roleCode: "ACCOUNTANT" }));
  assert.throws(() => assertTenantScope({ tenantId: "tenant-a", organisationId: "org-a", userId: "user-a" }), /complete tenant/);
});

test("vendor bill debits expense and input GST, then credits payables", () => {
  const lines = buildVendorBillPosting({ expenseAccountId: "expense", inputCgstAccountId: "input-cgst", inputSgstAccountId: "input-sgst", inputIgstAccountId: "input-igst", payableAccountId: "ap", contactId: "vendor", billNumber: "B-1", taxable: "1000.00", cgst: "90.00", sgst: "90.00", igst: "0.00" });
  assert.deepEqual(assertBalanced(lines), { debit: "1180.00", credit: "1180.00" });
  assert.equal(lines.at(-1)?.accountId, "ap");
});

test("paid expense debits expense and credits cash", () => {
  const lines = buildExpensePosting({ expenseAccountId: "expense", paidThroughAccountId: "cash", description: "Office supplies", amount: "450.50" });
  assert.deepEqual(assertBalanced(lines), { debit: "450.50", credit: "450.50" });
});

test("payment allocation supports partial and full settlement", () => {
  assert.deepEqual(allocateCustomerPayment("1180.00", "0.00", "180.00"), { amountPaid: "180.00", balanceDue: "1000.00", status: "PARTIALLY_PAID" });
  assert.deepEqual(allocateCustomerPayment("1000.00", "180.00", "1000.00"), { amountPaid: "1180.00", balanceDue: "0.00", status: "PAID" });
  assert.throws(() => allocateCustomerPayment("100.00", "0.00", "100.01"), /cannot exceed/);
});

test("credit note posting reverses revenue, GST and receivables", () => {
  const lines = buildCreditNotePosting({ receivableAccountId: "ar", revenueAccountId: "sales", outputCgstAccountId: "cgst", outputSgstAccountId: "sgst", outputIgstAccountId: "igst", contactId: "customer", creditNoteNumber: "CN-1", taxable: "500.00", cgst: "45.00", sgst: "45.00", igst: "0.00" });
  assert.deepEqual(assertBalanced(lines), { debit: "590.00", credit: "590.00" });
  assert.equal(lines.at(-1)?.accountId, "ar");
});

test("bank reconciliation difference uses exact minor units", () => {
  assert.equal(reconciliationDifference("100000.10", "99999.99"), "0.11");
});

test("financial report totals preserve the accounting equation", () => {
  const totals = summariseFinancialReports(
    [{ type: "INCOME", debit: "0.00", credit: "1000.00" }, { type: "EXPENSE", debit: "400.00", credit: "0.00" }],
    [{ type: "ASSET", debit: "780.00", credit: "0.00" }, { type: "LIABILITY", debit: "0.00", credit: "180.00" }, { type: "EQUITY", debit: "0.00", credit: "0.00" }],
  );
  assert.deepEqual(totals, { income: "1000.00", expenses: "400.00", netProfit: "600.00", assets: "780.00", liabilities: "180.00", equity: "0.00", balanceSheetBalanced: true });
});
