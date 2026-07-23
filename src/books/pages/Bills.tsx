import React, { useEffect, useState } from "react";
import { BadgeIndianRupee, Building2, CheckCircle2, Eye, IndianRupee, Plus, ReceiptIndianRupee, Search, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import { booksApi, indianDate, inr } from "../api";
import type { BooksContact, BooksItem, BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader, Status } from "./Common";

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  status: string;
  subTotal?: string;
  inputCgst?: string;
  inputSgst?: string;
  inputIgst?: string;
  grandTotal: string;
  amountPaid: string;
  balanceDue: string;
  vendorName: string;
  vendorGstin?: string;
}

interface Expense {
  id: string;
  expenseDate: string;
  description: string;
  amount: string;
  taxAmount: string;
  status: string;
  vendorName?: string;
}

interface BillLine {
  itemId: string;
  description: string;
  hsnSac: string;
  quantity: string;
  unitPrice: string;
  gstRate: string;
}

interface BillDetail {
  bill: Bill & { vendorLegalName?: string; vendorPan?: string; vendorEmail?: string; vendorPhone?: string };
  lines: Array<{
    id: string;
    description: string;
    hsnSac: string;
    quantity: string;
    unitPrice: string;
    taxableAmount: string;
    gstRate: string;
    cgstAmount: string;
    sgstAmount: string;
    igstAmount: string;
    lineTotal: string;
  }>;
}

const day = () => new Date().toISOString().slice(0, 10);
const blankLine = (): BillLine => ({ itemId: "", description: "", hsnSac: "", quantity: "1", unitPrice: "0.00", gstRate: "18" });

export default function BillsPage({ organisation, onNavigate }: { organisation: BooksOrganisation; onNavigate: (route: string) => void }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<BooksContact[]>([]);
  const [items, setItems] = useState<BooksItem[]>([]);
  const [tab, setTab] = useState<"bills" | "expenses">("bills");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showBill, setShowBill] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [postTarget, setPostTarget] = useState<Bill | null>(null);
  const [payTarget, setPayTarget] = useState<Bill | null>(null);
  const [viewTarget, setViewTarget] = useState<BillDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [billForm, setBillForm] = useState({
    vendorId: "",
    billNumber: "",
    billDate: day(),
    dueDate: day(),
    placeOfSupply: organisation.gstin?.slice(0, 2) || "",
    lines: [blankLine()],
  });

  const [expenseForm, setExpenseForm] = useState({
    vendorId: "",
    expenseDate: day(),
    description: "",
    amount: "0.00",
  });

  const [payForm, setPayForm] = useState({
    paymentDate: day(),
    amount: "0.00",
    paymentMode: "BANK_TRANSFER",
    reference: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [records, contacts, masterItems] = await Promise.all([
        booksApi<{ bills: Bill[]; expenses: Expense[] }>(`/bills?organisationId=${organisation.id}`),
        booksApi<{ contacts: BooksContact[] }>(`/contacts?organisationId=${organisation.id}&type=VENDOR`),
        booksApi<{ items: BooksItem[] }>(`/items?organisationId=${organisation.id}`),
      ]);
      setBills(records.bills);
      setExpenses(records.expenses);
      setVendors(contacts.contacts);
      setItems(masterItems.items);
    } catch (cause: any) {
      setError(cause.message || "Unable to load purchase records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [organisation.id]);

  const selectVendor = (vendorId: string) => {
    const vendor = vendors.find((item) => item.id === vendorId);
    setBillForm((current) => ({
      ...current,
      vendorId,
      placeOfSupply: vendor?.placeOfSupply || current.placeOfSupply,
    }));
  };

  const updateLine = (index: number, updates: Partial<BillLine>) =>
    setBillForm((current) => ({
      ...current,
      lines: current.lines.map((line, i) => (i === index ? { ...line, ...updates } : line)),
    }));

  const selectItem = (index: number, itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    updateLine(
      index,
      item
        ? { itemId, description: item.name, hsnSac: item.hsnSac, unitPrice: String(item.purchasePrice), gstRate: String(item.gstRate || "0") }
        : { itemId }
    );
  };

  const createBill = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/bills", {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id, ...billForm }),
      });
      setShowBill(false);
      setBillForm({
        vendorId: "",
        billNumber: "",
        billDate: day(),
        dueDate: day(),
        placeOfSupply: organisation.gstin?.slice(0, 2) || "",
        lines: [blankLine()],
      });
      await load();
    } catch (cause: any) {
      setFormError(cause.message || "Unable to create bill");
    } finally {
      setSaving(false);
    }
  };

  const postBill = async () => {
    if (!postTarget) return;
    setSaving(true);
    setFormError("");
    try {
      await booksApi(`/bills/${postTarget.id}/post`, {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id }),
      });
      setPostTarget(null);
      await load();
    } catch (cause: any) {
      setFormError(cause.message || "Unable to post bill");
    } finally {
      setSaving(false);
    }
  };

  const recordVendorPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!payTarget) return;
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/bill-payments", {
        method: "POST",
        body: JSON.stringify({
          organisationId: organisation.id,
          billId: payTarget.id,
          paymentDate: payForm.paymentDate,
          amount: payForm.amount,
          paymentMode: payForm.paymentMode,
          reference: payForm.reference || null,
        }),
      });
      setPayTarget(null);
      await load();
    } catch (cause: any) {
      setFormError(cause.message || "Unable to record vendor payment");
    } finally {
      setSaving(false);
    }
  };

  const createExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/expenses", {
        method: "POST",
        body: JSON.stringify({
          organisationId: organisation.id,
          ...expenseForm,
          vendorId: expenseForm.vendorId || null,
        }),
      });
      setShowExpense(false);
      setExpenseForm({ vendorId: "", expenseDate: day(), description: "", amount: "0.00" });
      await load();
    } catch (cause: any) {
      setFormError(cause.message || "Unable to post expense");
    } finally {
      setSaving(false);
    }
  };

  const openBillDetail = async (billId: string) => {
    setLoadingDetail(true);
    setFormError("");
    try {
      const data = await booksApi<BillDetail>(`/bills/${billId}?organisationId=${organisation.id}`);
      setViewTarget(data);
    } catch (cause: any) {
      setFormError(cause.message || "Unable to load bill details");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <LoadingState label="Loading bills and expenses" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const shownBills = bills.filter((bill) =>
    [bill.billNumber, bill.vendorName, bill.status].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );
  const shownExpenses = expenses.filter((expense) =>
    [expense.description, expense.vendorName || "", expense.status].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="books-page">
      <PageHeader
        eyebrow="Purchases"
        title="Bills & expenses"
        description="Record vendor liabilities separately from immediately paid operating expenses."
        action={
          <div className="books-header-actions">
            <button className="books-secondary" onClick={() => setShowExpense(true)}>
              <WalletCards /> New expense
            </button>
            <button className="books-primary" onClick={() => setShowBill(true)}>
              <Plus /> New bill
            </button>
          </div>
        }
      />

      <div className="books-segmented">
        <button className={tab === "bills" ? "active" : ""} onClick={() => setTab("bills")}>
          Vendor bills <span>{bills.length}</span>
        </button>
        <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>
          Paid expenses <span>{expenses.length}</span>
        </button>
      </div>

      <section className="books-panel books-table-panel">
        <div className="books-table-toolbar">
          <div className="books-inline-search">
            <Search />
            <input placeholder={`Search ${tab}`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span>{tab === "bills" ? shownBills.length : shownExpenses.length} records</span>
        </div>

        {tab === "bills" ? (
          shownBills.length ? (
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Bill</th>
                    <th>Vendor</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th className="num">Total</th>
                    <th className="num">Balance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shownBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>
                        <button
                          className="books-link-button books-mono"
                          onClick={() => openBillDetail(bill.id)}
                          title="View Bill Details"
                        >
                          {bill.billNumber}
                        </button>
                      </td>
                      <td>
                        <strong>{bill.vendorName}</strong>
                        <small className="books-cell-sub">{bill.vendorGstin || "Unregistered"}</small>
                      </td>
                      <td>
                        {indianDate(bill.billDate)}
                        <small className="books-cell-sub">Due {indianDate(bill.dueDate)}</small>
                      </td>
                      <td>
                        <Status value={bill.status} />
                      </td>
                      <td className="num">
                        <strong>{inr(bill.grandTotal)}</strong>
                      </td>
                      <td className="num">{inr(bill.balanceDue)}</td>
                      <td>
                        <div className="books-row-actions">
                          <button title="View Bill" onClick={() => openBillDetail(bill.id)}>
                            <Eye />
                          </button>
                          {bill.status === "DRAFT" && (
                            <button
                              title="Post bill"
                              onClick={() => {
                                setPostTarget(bill);
                                setFormError("");
                              }}
                            >
                              <CheckCircle2 />
                            </button>
                          )}
                          {["POSTED", "PARTIALLY_PAID", "OVERDUE"].includes(bill.status) && (
                            <button
                              title="Record vendor payment"
                              onClick={() => {
                                setPayTarget(bill);
                                setPayForm({ paymentDate: day(), amount: bill.balanceDue, paymentMode: "BANK_TRANSFER", reference: "" });
                                setFormError("");
                              }}
                            >
                              <ReceiptIndianRupee />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="No vendor bills yet"
              description="Create a bill draft, review it, then post the payable and input GST."
              action={
                <button className="books-primary" onClick={() => setShowBill(true)}>
                  <Plus /> Create first bill
                </button>
              }
            />
          )
        ) : shownExpenses.length ? (
          <div className="books-table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {shownExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{indianDate(expense.expenseDate)}</td>
                    <td>
                      <strong>{expense.description}</strong>
                    </td>
                    <td>{expense.vendorName || "Direct expense"}</td>
                    <td>
                      <Status value={expense.status} />
                    </td>
                    <td className="num">
                      <strong>{inr(expense.amount)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={WalletCards}
            title="No paid expenses yet"
            description="Record an operating expense paid through cash. It posts immediately to the ledger."
            action={
              <button className="books-primary" onClick={() => setShowExpense(true)}>
                Record expense
              </button>
            }
          />
        )}
      </section>

      {/* Create Vendor Bill Modal */}
      {showBill && (
        <Modal title="Create vendor bill" description="This is saved as a draft until you post it." onClose={() => setShowBill(false)}>
          <form className="books-modal-form books-invoice-form" onSubmit={createBill}>
            {!vendors.length ? (
              <div className="books-prerequisite">
                <ShoppingCart />
                <div>
                  <strong>Add a vendor first</strong>
                  <p>Vendor identity and place of supply are required.</p>
                </div>
                <button
                  type="button"
                  className="books-secondary"
                  onClick={() => {
                    setShowBill(false);
                    onNavigate("vendors");
                  }}
                >
                  Open vendors
                </button>
              </div>
            ) : (
              <>
                <div className="books-form-grid">
                  <label>
                    <span>Vendor *</span>
                    <select required value={billForm.vendorId} onChange={(e) => selectVendor(e.target.value)}>
                      <option value="">Select vendor</option>
                      {vendors.map((vendor) => (
                        <option value={vendor.id} key={vendor.id}>
                          {vendor.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Vendor bill number *</span>
                    <input
                      required
                      placeholder="e.g. BILL-2026-001"
                      value={billForm.billNumber}
                      onChange={(e) => setBillForm({ ...billForm, billNumber: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Bill date *</span>
                    <input
                      type="date"
                      required
                      value={billForm.billDate}
                      onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Due date *</span>
                    <input
                      type="date"
                      min={billForm.billDate}
                      required
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Place of supply (State Code) *</span>
                    <input
                      maxLength={2}
                      required
                      placeholder="e.g. 29"
                      value={billForm.placeOfSupply}
                      onChange={(e) => setBillForm({ ...billForm, placeOfSupply: e.target.value.replace(/\D/g, "") })}
                    />
                  </label>
                </div>

                <div className="books-line-editor">
                  <div className="books-line-head">
                    <strong>Bill lines (Goods / Services)</strong>
                    <button type="button" onClick={() => setBillForm({ ...billForm, lines: [...billForm.lines, blankLine()] })}>
                      <Plus /> Add line
                    </button>
                  </div>
                  {billForm.lines.map((line, index) => (
                    <div className="books-line-row" key={index}>
                      <label>
                        <span>Item</span>
                        <select value={line.itemId} onChange={(e) => selectItem(index, e.target.value)}>
                          <option value="">Custom expense</option>
                          {items.map((item) => (
                            <option value={item.id} key={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="line-description">
                        <span>Description *</span>
                        <input
                          required
                          value={line.description}
                          onChange={(e) => updateLine(index, { description: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>HSN/SAC</span>
                        <input
                          value={line.hsnSac}
                          onChange={(e) => updateLine(index, { hsnSac: e.target.value.replace(/\D/g, "") })}
                        />
                      </label>
                      <label>
                        <span>Qty *</span>
                        <input required value={line.quantity} onChange={(e) => updateLine(index, { quantity: e.target.value })} />
                      </label>
                      <label>
                        <span>Rate *</span>
                        <input required value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: e.target.value })} />
                      </label>
                      <label>
                        <span>GST %</span>
                        <input required value={line.gstRate} onChange={(e) => updateLine(index, { gstRate: e.target.value })} />
                      </label>
                      <button
                        type="button"
                        className="books-delete-line"
                        disabled={billForm.lines.length === 1}
                        onClick={() => setBillForm({ ...billForm, lines: billForm.lines.filter((_, i) => i !== index) })}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>

                {formError && <p className="books-form-error">{formError}</p>}
                <footer>
                  <button type="button" className="books-secondary" onClick={() => setShowBill(false)}>
                    Cancel
                  </button>
                  <button className="books-primary" disabled={saving || !billForm.vendorId || !billForm.billNumber}>
                    {saving ? "Saving…" : "Save bill draft"}
                  </button>
                </footer>
              </>
            )}
          </form>
        </Modal>
      )}

      {/* Record Vendor Payment Modal */}
      {payTarget && (
        <Modal
          title={`Record payment for ${payTarget.billNumber}`}
          description={`Outstanding balance: ${inr(payTarget.balanceDue)}`}
          onClose={() => setPayTarget(null)}
        >
          <form className="books-modal-form" onSubmit={recordVendorPayment}>
            <div className="books-form-grid">
              <label><span>Vendor</span><input disabled value={payTarget.vendorName} /></label>
              <label><span>Payment date *</span><input type="date" required value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} /></label>
              <label><span>Payment mode *</span>
                <select value={payForm.paymentMode} onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </label>
              <label><span>Reference / UTR number</span><input placeholder="e.g. UTR12345678" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} /></label>
              <label className="span-2"><span>Amount to pay *</span>
                <div className="books-money-input"><IndianRupee /><input required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} /></div>
              </label>
            </div>
            {formError && <p className="books-form-error">{formError}</p>}
            <footer>
              <button type="button" className="books-secondary" onClick={() => setPayTarget(null)}>Cancel</button>
              <button className="books-primary" disabled={saving || !payForm.amount || payForm.amount === "0.00"}>{saving ? "Recording…" : "Record vendor payment"}</button>
            </footer>
          </form>
        </Modal>
      )}

      {/* Record Paid Expense Modal */}
      {showExpense && (
        <Modal title="Record paid expense" description="This posts immediately: debit expense, credit cash." onClose={() => setShowExpense(false)}>
          <form className="books-modal-form" onSubmit={createExpense}>
            <div className="books-form-grid">
              <label>
                <span>Vendor</span>
                <select value={expenseForm.vendorId} onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })}>
                  <option value="">No vendor</option>
                  {vendors.map((vendor) => (
                    <option value={vendor.id} key={vendor.id}>
                      {vendor.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date *</span>
                <input
                  type="date"
                  required
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                />
              </label>
              <label className="span-2">
                <span>Description *</span>
                <input
                  required
                  placeholder="e.g. Office Broadband bill"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </label>
              <label>
                <span>Amount *</span>
                <div className="books-money-input">
                  <IndianRupee />
                  <input required value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                </div>
              </label>
            </div>
            {formError && <p className="books-form-error">{formError}</p>}
            <footer>
              <button type="button" className="books-secondary" onClick={() => setShowExpense(false)}>
                Cancel
              </button>
              <button className="books-primary" disabled={saving || !expenseForm.description || !expenseForm.amount}>
                {saving ? "Posting…" : "Record & post expense"}
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {/* Post Confirmation Modal */}
      {postTarget && (
        <Modal
          title={`Post vendor bill ${postTarget.billNumber}?`}
          description="This creates the payable, expense and input-GST journal entry."
          onClose={() => setPostTarget(null)}
        >
          <div className="books-confirm">
            <span>
              <CheckCircle2 />
            </span>
            <div>
              <strong>{postTarget.vendorName}</strong>
              <p>{inr(postTarget.grandTotal)} will be posted to the locked double-entry ledger.</p>
            </div>
          </div>
          {formError && <p className="books-form-error">{formError}</p>}
          <footer className="books-modal-footer">
            <button className="books-secondary" onClick={() => setPostTarget(null)}>
              Keep draft
            </button>
            <button className="books-primary" disabled={saving} onClick={postBill}>
              {saving ? "Posting…" : "Post bill"}
            </button>
          </footer>
        </Modal>
      )}

      {/* Bill Detail View Drawer */}
      {viewTarget && (
        <Modal
          title={`Vendor Bill: ${viewTarget.bill.billNumber}`}
          description={`Vendor: ${viewTarget.bill.vendorName} (${viewTarget.bill.vendorGstin || "Unregistered"})`}
          onClose={() => setViewTarget(null)}
        >
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
              <div><span className="text-slate-400">Bill Date:</span> <strong className="block text-white mt-0.5">{indianDate(viewTarget.bill.billDate)}</strong></div>
              <div><span className="text-slate-400">Due Date:</span> <strong className="block text-white mt-0.5">{indianDate(viewTarget.bill.dueDate)}</strong></div>
              <div><span className="text-slate-400">Status:</span> <div className="mt-0.5"><Status value={viewTarget.bill.status} /></div></div>
              <div><span className="text-slate-400">Balance Due:</span> <strong className="block text-emerald-400 mt-0.5 font-mono">{inr(viewTarget.bill.balanceDue)}</strong></div>
            </div>

            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>HSN/SAC</th>
                    <th className="num">Qty</th>
                    <th className="num">Rate</th>
                    <th className="num">GST %</th>
                    <th className="num">Taxable</th>
                    <th className="num">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewTarget.lines.map((line) => (
                    <tr key={line.id}>
                      <td><strong>{line.description}</strong></td>
                      <td className="books-mono">{line.hsnSac || "—"}</td>
                      <td className="num">{line.quantity}</td>
                      <td className="num">{inr(line.unitPrice)}</td>
                      <td className="num">{line.gstRate}%</td>
                      <td className="num">{inr(line.taxableAmount)}</td>
                      <td className="num"><strong>{inr(line.lineTotal)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-sm">
              <span className="text-slate-400">Grand Total</span>
              <strong className="text-lg font-mono text-white">{inr(viewTarget.bill.grandTotal)}</strong>
            </div>

            <footer>
              <button className="books-secondary" onClick={() => setViewTarget(null)}>Close</button>
            </footer>
          </div>
        </Modal>
      )}
    </div>
  );
}
