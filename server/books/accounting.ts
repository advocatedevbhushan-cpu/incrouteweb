export type MoneyInput = string | number | bigint;

export interface JournalLineDraft {
  accountId: string;
  contactId?: string | null;
  description?: string;
  debit: string;
  credit: string;
}

export interface GstBreakdown {
  taxable: string;
  cgst: string;
  sgst: string;
  igst: string;
  totalTax: string;
  total: string;
}

const DECIMAL_PATTERN = /^-?\d+(?:\.\d{1,2})?$/;
const RATE_PATTERN = /^\d+(?:\.\d{1,4})?$/;

export function toMinorUnits(value: MoneyInput): bigint {
  if (typeof value === "bigint") return value;
  const raw = typeof value === "number" ? value.toFixed(2) : String(value).trim();
  if (!DECIMAL_PATTERN.test(raw)) throw new Error(`Invalid money value: ${raw}`);
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = unsigned.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  return negative ? -minor : minor;
}

export function fromMinorUnits(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 100n;
  const fraction = String(absolute % 100n).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

function parseRate(rate: string | number): bigint {
  const raw = String(rate).trim();
  if (!RATE_PATTERN.test(raw)) throw new Error(`Invalid tax rate: ${raw}`);
  const [whole, fraction = ""] = raw.split(".");
  return BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, "0"));
}

function roundDivide(numerator: bigint, denominator: bigint): bigint {
  if (numerator < 0n) return -roundDivide(-numerator, denominator);
  return (numerator + denominator / 2n) / denominator;
}

function taxMinor(taxableMinor: bigint, scaledPercent: bigint): bigint {
  return roundDivide(taxableMinor * scaledPercent, 1_000_000n);
}

export function calculateGst(
  taxableAmount: MoneyInput,
  rate: string | number,
  intraState: boolean,
): GstBreakdown {
  const taxable = toMinorUnits(taxableAmount);
  if (taxable < 0n) throw new Error("Taxable amount cannot be negative");
  const scaledRate = parseRate(rate);
  if (scaledRate > 1_000_000n) throw new Error("GST rate cannot exceed 100%");

  const cgst = intraState ? taxMinor(taxable, scaledRate / 2n) : 0n;
  const sgst = intraState ? taxMinor(taxable, scaledRate / 2n) : 0n;
  const igst = intraState ? 0n : taxMinor(taxable, scaledRate);
  const totalTax = cgst + sgst + igst;

  return {
    taxable: fromMinorUnits(taxable),
    cgst: fromMinorUnits(cgst),
    sgst: fromMinorUnits(sgst),
    igst: fromMinorUnits(igst),
    totalTax: fromMinorUnits(totalTax),
    total: fromMinorUnits(taxable + totalTax),
  };
}

export function assertBalanced(lines: JournalLineDraft[]): { debit: string; credit: string } {
  if (lines.length < 2) throw new Error("A journal entry requires at least two lines");
  let debit = 0n;
  let credit = 0n;

  for (const line of lines) {
    const lineDebit = toMinorUnits(line.debit);
    const lineCredit = toMinorUnits(line.credit);
    if (lineDebit < 0n || lineCredit < 0n) throw new Error("Journal amounts cannot be negative");
    if ((lineDebit === 0n) === (lineCredit === 0n)) {
      throw new Error("Each journal line must contain exactly one positive debit or credit");
    }
    debit += lineDebit;
    credit += lineCredit;
  }

  if (debit !== credit) {
    throw new Error(`Journal entry is not balanced: debit ${fromMinorUnits(debit)}, credit ${fromMinorUnits(credit)}`);
  }
  return { debit: fromMinorUnits(debit), credit: fromMinorUnits(credit) };
}

export function buildSalesInvoicePosting(input: {
  receivableAccountId: string;
  revenueAccountId: string;
  outputCgstAccountId: string;
  outputSgstAccountId: string;
  outputIgstAccountId: string;
  contactId: string;
  invoiceNumber: string;
  taxable: MoneyInput;
  cgst: MoneyInput;
  sgst: MoneyInput;
  igst: MoneyInput;
}): JournalLineDraft[] {
  const taxable = toMinorUnits(input.taxable);
  const cgst = toMinorUnits(input.cgst);
  const sgst = toMinorUnits(input.sgst);
  const igst = toMinorUnits(input.igst);
  if ([taxable, cgst, sgst, igst].some((amount) => amount < 0n)) {
    throw new Error("Invoice posting amounts cannot be negative");
  }
  const total = taxable + cgst + sgst + igst;
  const description = `GST invoice ${input.invoiceNumber}`;
  const lines: JournalLineDraft[] = [
    { accountId: input.receivableAccountId, contactId: input.contactId, description, debit: fromMinorUnits(total), credit: "0.00" },
    { accountId: input.revenueAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(taxable) },
  ];
  if (cgst > 0n) lines.push({ accountId: input.outputCgstAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(cgst) });
  if (sgst > 0n) lines.push({ accountId: input.outputSgstAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(sgst) });
  if (igst > 0n) lines.push({ accountId: input.outputIgstAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(igst) });
  assertBalanced(lines);
  return lines;
}

export function buildCustomerPaymentPosting(input: {
  bankAccountId: string;
  receivableAccountId: string;
  contactId: string;
  paymentNumber: string;
  amount: MoneyInput;
}): JournalLineDraft[] {
  const amount = toMinorUnits(input.amount);
  if (amount <= 0n) throw new Error("Payment amount must be positive");
  const description = `Customer payment ${input.paymentNumber}`;
  const lines: JournalLineDraft[] = [
    { accountId: input.bankAccountId, contactId: input.contactId, description, debit: fromMinorUnits(amount), credit: "0.00" },
    { accountId: input.receivableAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(amount) },
  ];
  assertBalanced(lines);
  return lines;
}

export function buildVendorBillPosting(input: {
  expenseAccountId: string;
  inputCgstAccountId: string;
  inputSgstAccountId: string;
  inputIgstAccountId: string;
  payableAccountId: string;
  contactId: string;
  billNumber: string;
  taxable: MoneyInput;
  cgst: MoneyInput;
  sgst: MoneyInput;
  igst: MoneyInput;
}): JournalLineDraft[] {
  const taxable = toMinorUnits(input.taxable);
  const cgst = toMinorUnits(input.cgst);
  const sgst = toMinorUnits(input.sgst);
  const igst = toMinorUnits(input.igst);
  if ([taxable, cgst, sgst, igst].some((amount) => amount < 0n)) throw new Error("Bill posting amounts cannot be negative");
  const description = `Vendor bill ${input.billNumber}`;
  const lines: JournalLineDraft[] = [
    { accountId: input.expenseAccountId, contactId: input.contactId, description, debit: fromMinorUnits(taxable), credit: "0.00" },
  ];
  if (cgst > 0n) lines.push({ accountId: input.inputCgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(cgst), credit: "0.00" });
  if (sgst > 0n) lines.push({ accountId: input.inputSgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(sgst), credit: "0.00" });
  if (igst > 0n) lines.push({ accountId: input.inputIgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(igst), credit: "0.00" });
  lines.push({ accountId: input.payableAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(taxable + cgst + sgst + igst) });
  assertBalanced(lines);
  return lines;
}

export function buildExpensePosting(input: {
  expenseAccountId: string;
  paidThroughAccountId: string;
  contactId?: string | null;
  description: string;
  amount: MoneyInput;
}): JournalLineDraft[] {
  const amount = toMinorUnits(input.amount);
  if (amount <= 0n) throw new Error("Expense amount must be positive");
  const lines: JournalLineDraft[] = [
    { accountId: input.expenseAccountId, contactId: input.contactId || null, description: input.description, debit: fromMinorUnits(amount), credit: "0.00" },
    { accountId: input.paidThroughAccountId, contactId: input.contactId || null, description: input.description, debit: "0.00", credit: fromMinorUnits(amount) },
  ];
  assertBalanced(lines);
  return lines;
}

export function allocateCustomerPayment(currentBalance: MoneyInput, currentPaid: MoneyInput, payment: MoneyInput) {
  const balance = toMinorUnits(currentBalance);
  const paid = toMinorUnits(currentPaid);
  const amount = toMinorUnits(payment);
  if (amount <= 0n) throw new Error("Payment amount must be positive");
  if (amount > balance) throw new Error("Payment cannot exceed the outstanding balance");
  const balanceDue = balance - amount;
  return {
    amountPaid: fromMinorUnits(paid + amount),
    balanceDue: fromMinorUnits(balanceDue),
    status: balanceDue === 0n ? "PAID" : "PARTIALLY_PAID",
  } as const;
}

export function reconciliationDifference(statementEndingBalance: MoneyInput, bookEndingBalance: MoneyInput): string {
  return fromMinorUnits(toMinorUnits(statementEndingBalance) - toMinorUnits(bookEndingBalance));
}

export function summariseFinancialReports(
  profitAndLossRows: Array<{ type: string; debit: MoneyInput; credit: MoneyInput }>,
  balanceSheetRows: Array<{ type: string; debit: MoneyInput; credit: MoneyInput }>,
) {
  const movement = (row: { debit: MoneyInput; credit: MoneyInput }, normal: "DEBIT" | "CREDIT") => normal === "DEBIT"
    ? toMinorUnits(row.debit) - toMinorUnits(row.credit)
    : toMinorUnits(row.credit) - toMinorUnits(row.debit);
  const total = (rows: typeof profitAndLossRows, type: string, normal: "DEBIT" | "CREDIT") => rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + movement(row, normal), 0n);
  const income = total(profitAndLossRows, "INCOME", "CREDIT");
  const expenses = total(profitAndLossRows, "EXPENSE", "DEBIT");
  const assets = total(balanceSheetRows, "ASSET", "DEBIT");
  const liabilities = total(balanceSheetRows, "LIABILITY", "CREDIT");
  const equity = total(balanceSheetRows, "EQUITY", "CREDIT");
  const netProfit = income - expenses;
  return {
    income: fromMinorUnits(income), expenses: fromMinorUnits(expenses), netProfit: fromMinorUnits(netProfit),
    assets: fromMinorUnits(assets), liabilities: fromMinorUnits(liabilities), equity: fromMinorUnits(equity),
    balanceSheetBalanced: assets === liabilities + equity + netProfit,
  };
}

export function buildCreditNotePosting(input: {
  receivableAccountId: string;
  revenueAccountId: string;
  outputCgstAccountId: string;
  outputSgstAccountId: string;
  outputIgstAccountId: string;
  contactId: string;
  creditNoteNumber: string;
  taxable: MoneyInput;
  cgst: MoneyInput;
  sgst: MoneyInput;
  igst: MoneyInput;
}): JournalLineDraft[] {
  const taxable = toMinorUnits(input.taxable);
  const cgst = toMinorUnits(input.cgst);
  const sgst = toMinorUnits(input.sgst);
  const igst = toMinorUnits(input.igst);
  if ([taxable, cgst, sgst, igst].some((amount) => amount < 0n)) throw new Error("Credit note amounts cannot be negative");
  const description = `Credit note ${input.creditNoteNumber}`;
  const lines: JournalLineDraft[] = [
    { accountId: input.revenueAccountId, contactId: input.contactId, description, debit: fromMinorUnits(taxable), credit: "0.00" },
  ];
  if (cgst > 0n) lines.push({ accountId: input.outputCgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(cgst), credit: "0.00" });
  if (sgst > 0n) lines.push({ accountId: input.outputSgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(sgst), credit: "0.00" });
  if (igst > 0n) lines.push({ accountId: input.outputIgstAccountId, contactId: input.contactId, description, debit: fromMinorUnits(igst), credit: "0.00" });
  lines.push({ accountId: input.receivableAccountId, contactId: input.contactId, description, debit: "0.00", credit: fromMinorUnits(taxable + cgst + sgst + igst) });
  assertBalanced(lines);
  return lines;
}

export function assertPostingPeriodOpen(
  postingDate: string,
  periods: Array<{ startsOn: string | Date; endsOn: string | Date; status: string }>,
): void {
  const date = postingDate.slice(0, 10);
  const period = periods.find((candidate) => {
    const start = new Date(candidate.startsOn).toISOString().slice(0, 10);
    const end = new Date(candidate.endsOn).toISOString().slice(0, 10);
    return date >= start && date <= end;
  });
  if (!period) throw new Error("Posting date is outside configured accounting periods");
  if (period.status !== "OPEN") throw new Error("The accounting period is locked");
}
