import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, IndianRupee, Plus, ReceiptIndianRupee, Search, Send, Trash2, WalletCards } from "lucide-react";
import { jsPDF } from "jspdf";
import { booksApi, indianDate, inr } from "../api";
import type { BooksContact, BooksInvoice, BooksItem, BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader, Status } from "./Common";

interface InvoiceLineForm { itemId: string; description: string; hsnSac: string; quantity: string; unitPrice: string; discountAmount: string; gstRate: string }
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (value: string, days: number) => { const date = new Date(`${value}T00:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const emptyLine = (): InvoiceLineForm => ({ itemId: "", description: "", hsnSac: "", quantity: "1", unitPrice: "0.00", discountAmount: "0.00", gstRate: "18" });

export default function InvoicesPage({ organisation, onNavigate }:{ organisation: BooksOrganisation; onNavigate: (route: string) => void }) {
  const [invoices, setInvoices] = useState<BooksInvoice[]>([]);
  const [customers, setCustomers] = useState<BooksContact[]>([]);
  const [items, setItems] = useState<BooksItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [postTarget, setPostTarget] = useState<BooksInvoice | null>(null);
  const [payTarget, setPayTarget] = useState<BooksInvoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ customerId: "", invoiceDate: today(), dueDate: addDays(today(), 30), placeOfSupply: organisation.gstin?.slice(0, 2) || "", supplyType: "DOMESTIC", notes: "", terms: "Payment due as per agreed terms.", lines: [emptyLine()] });
  const [payment, setPayment] = useState({ amount: "", paymentDate: today(), paymentMode: "BANK_TRANSFER", reference: "" });

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [invoiceData, contactData, itemData] = await Promise.all([
        booksApi<{ invoices: BooksInvoice[] }>(`/invoices?organisationId=${encodeURIComponent(organisation.id)}`),
        booksApi<{ contacts: BooksContact[] }>(`/contacts?organisationId=${encodeURIComponent(organisation.id)}&type=CUSTOMER`),
        booksApi<{ items: BooksItem[] }>(`/items?organisationId=${encodeURIComponent(organisation.id)}`),
      ]);
      setInvoices(invoiceData.invoices); setCustomers(contactData.contacts); setItems(itemData.items);
    } catch (cause: any) { setError(cause.message || "Unable to load invoices"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [organisation.id]);
  const filtered = invoices.filter((invoice) => [invoice.invoiceNumber, invoice.customerName, invoice.status].some((value) => value.toLowerCase().includes(search.toLowerCase())));
  const estimate = useMemo(() => form.lines.reduce((total, line) => total + Math.max(0, Number(line.quantity || 0) * Number(line.unitPrice || 0) - Number(line.discountAmount || 0)) * (1 + Number(line.gstRate || 0) / 100), 0), [form.lines]);

  const updateLine = (index: number, updates: Partial<InvoiceLineForm>) => setForm((current) => ({ ...current, lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...updates } : line) }));
  const selectItem = (index: number, itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    updateLine(index, item ? { itemId, description: item.name, hsnSac: item.hsnSac, unitPrice: String(item.sellingPrice), gstRate: String(item.gstRate || "0") } : { itemId });
  };
  const selectCustomer = (customerId: string) => {
    const customer = customers.find((entry) => entry.id === customerId);
    setForm((current) => ({ ...current, customerId, placeOfSupply: customer?.placeOfSupply || current.placeOfSupply }));
  };

  const createInvoice = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFormError("");
    try {
      await booksApi("/invoices", { method: "POST", body: JSON.stringify({ organisationId: organisation.id, ...form, reverseCharge: false }) });
      setShowCreate(false); setForm({ customerId: "", invoiceDate: today(), dueDate: addDays(today(), 30), placeOfSupply: organisation.gstin?.slice(0,2) || "", supplyType: "DOMESTIC", notes: "", terms: "Payment due as per agreed terms.", lines: [emptyLine()] }); await load();
    } catch (cause: any) { setFormError(cause.message || "Unable to create invoice"); }
    finally { setSaving(false); }
  };
  const postInvoice = async () => {
    if (!postTarget) return; setSaving(true); setFormError("");
    try { await booksApi(`/invoices/${postTarget.id}/post`, { method: "POST", body: JSON.stringify({ organisationId: organisation.id }) }); setPostTarget(null); await load(); }
    catch (cause: any) { setFormError(cause.message || "Unable to post invoice"); }
    finally { setSaving(false); }
  };
  const recordPayment = async (event: React.FormEvent) => {
    event.preventDefault(); if (!payTarget) return; setSaving(true); setFormError("");
    try { await booksApi("/payments", { method: "POST", body: JSON.stringify({ organisationId: organisation.id, invoiceId: payTarget.id, ...payment }) }); setPayTarget(null); await load(); }
    catch (cause: any) { setFormError(cause.message || "Unable to record payment"); }
    finally { setSaving(false); }
  };

  const downloadPdf = async (invoice: BooksInvoice) => {
    setFormError("");
    try {
      const data = await booksApi<{ invoice: any; lines: any[] }>(`/invoices/${invoice.id}?organisationId=${encodeURIComponent(organisation.id)}`);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const navy: [number, number, number] = [12, 24, 48];
      const violet: [number, number, number] = [102, 81, 240];
      doc.setFillColor(...navy); doc.rect(0, 0, 210, 34, "F");
      doc.setTextColor(255,255,255); doc.setFont("helvetica", "bold"); doc.setFontSize(19); doc.text("INCroute Books", 16, 15);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text("ACCOUNTS · COMPLIANCE · CORPORATE RECORDS", 16, 22);
      doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text("TAX INVOICE", 194, 16, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(data.invoice.invoiceNumber, 194, 23, { align: "right" });
      doc.setTextColor(...navy); doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text(data.invoice.organisationTradeName || data.invoice.organisationName, 16, 46);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(`GSTIN: ${data.invoice.organisationGstin || "Not registered"}`, 16, 52); doc.text(`PAN: ${data.invoice.organisationPan || "Not set"}`, 16, 57);
      doc.setFont("helvetica", "bold"); doc.text("BILL TO", 16, 70); doc.setFont("helvetica", "normal"); doc.text(data.invoice.customerName, 16, 76); doc.text(`GSTIN: ${data.invoice.customerGstin || "Unregistered"}`, 16, 81);
      doc.setFont("helvetica", "bold"); doc.text("Invoice date", 128, 46); doc.text("Due date", 128, 54); doc.text("Place of supply", 128, 62);
      doc.setFont("helvetica", "normal"); doc.text(indianDate(data.invoice.invoiceDate), 194, 46, { align: "right" }); doc.text(indianDate(data.invoice.dueDate), 194, 54, { align: "right" }); doc.text(data.invoice.placeOfSupply, 194, 62, { align: "right" });
      let y = 94;
      doc.setFillColor(243,244,248); doc.rect(14, y - 7, 182, 9, "F"); doc.setFont("helvetica", "bold"); doc.text("Description", 17, y - 1); doc.text("HSN/SAC", 98, y - 1); doc.text("Qty", 126, y - 1); doc.text("Rate", 151, y - 1, { align: "right" }); doc.text("Amount", 192, y - 1, { align: "right" });
      doc.setFont("helvetica", "normal");
      for (const line of data.lines) {
        y += 10;
        if (y > 252) { doc.addPage(); y = 24; }
        doc.text(String(line.description).slice(0, 48), 17, y); doc.text(String(line.hsnSac), 98, y); doc.text(String(line.quantity), 126, y); doc.text(inr(line.unitPrice).replace("₹", "Rs. "), 151, y, { align: "right" }); doc.text(inr(line.lineTotal).replace("₹", "Rs. "), 192, y, { align: "right" });
        doc.setDrawColor(232,234,240); doc.line(14, y + 4, 196, y + 4);
      }
      y += 16; const labelX = 140; const valueX = 192;
      const totalLine = (label: string, value: any, bold = false) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.text(label, labelX, y); doc.text(inr(value).replace("₹", "Rs. "), valueX, y, { align: "right" }); y += 7; };
      totalLine("Taxable value", data.invoice.subTotal); if (Number(data.invoice.cgstTotal)) totalLine("CGST", data.invoice.cgstTotal); if (Number(data.invoice.sgstTotal)) totalLine("SGST", data.invoice.sgstTotal); if (Number(data.invoice.igstTotal)) totalLine("IGST", data.invoice.igstTotal); doc.setDrawColor(...violet); doc.line(labelX, y - 3, valueX, y - 3); totalLine("Invoice total", data.invoice.grandTotal, true);
      doc.setFillColor(247,247,252); doc.roundedRect(14, 270, 182, 13, 2, 2, "F"); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(80,86,102); doc.text("Generated from INCroute Books · This is a computer-generated tax invoice.", 105, 278, { align: "center" });
      doc.save(`${data.invoice.invoiceNumber}.pdf`);
    } catch (cause: any) { setFormError(cause.message || "Unable to generate invoice PDF"); }
  };

  if (loading) return <LoadingState label="Loading GST invoices" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div className="books-page">
    <PageHeader eyebrow="Sales" title="GST invoices" description="Draft, post, collect and export invoices without weakening the ledger trail." action={<button className="books-primary" onClick={() => setShowCreate(true)}><Plus />New GST invoice</button>} />
    {formError && !showCreate && !postTarget && !payTarget && <p className="books-page-error">{formError}</p>}
    <section className="books-panel books-table-panel"><div className="books-table-toolbar"><div className="books-inline-search"><Search /><input aria-label="Search invoices" placeholder="Search invoice, customer or status" value={search} onChange={(event) => setSearch(event.target.value)} /></div><span>{filtered.length} invoices</span></div>
      {filtered.length ? <div className="books-table-wrap"><table className="books-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Dates</th><th>Status</th><th className="num">Total</th><th className="num">Balance</th><th>Actions</th></tr></thead><tbody>{filtered.map((invoice) => <tr key={invoice.id}><td><strong className="books-mono">{invoice.invoiceNumber}</strong></td><td><strong>{invoice.customerName}</strong><small className="books-cell-sub">{invoice.customerGstin || "Unregistered"}</small></td><td><span>{indianDate(invoice.invoiceDate)}</span><small className="books-cell-sub">Due {indianDate(invoice.dueDate)}</small></td><td><Status value={invoice.status}/></td><td className="num"><strong>{inr(invoice.grandTotal)}</strong></td><td className="num"><strong>{inr(invoice.balanceDue)}</strong></td><td><div className="books-row-actions">{invoice.status === "DRAFT" && <button title="Post invoice" onClick={() => { setPostTarget(invoice); setFormError(""); }}><Send /></button>}{["POSTED","PARTIALLY_PAID","OVERDUE"].includes(invoice.status) && <button title="Record payment" onClick={() => { setPayTarget(invoice); setPayment({ amount: invoice.balanceDue, paymentDate: today(), paymentMode: "BANK_TRANSFER", reference: "" }); setFormError(""); }}><WalletCards /></button>}<button title="Download PDF" onClick={() => downloadPdf(invoice)}><Download /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={ReceiptIndianRupee} title="No invoices yet" description="Create a GST invoice draft. It will affect the ledger only after you explicitly post it." action={<button className="books-primary" onClick={() => setShowCreate(true)}><Plus />Create first invoice</button>} />}
    </section>

    {showCreate && <Modal title="Create GST invoice" description="This saves as a draft. Posting is a separate controlled action." onClose={() => setShowCreate(false)}><form className="books-modal-form books-invoice-form" onSubmit={createInvoice}>
      {!customers.length || !items.length ? <div className="books-prerequisite"><FileText /><div><strong>Complete invoice masters first</strong><p>{!customers.length ? "Add a customer. " : ""}{!items.length ? "Add an item or service." : ""}</p></div><button type="button" className="books-secondary" onClick={() => { setShowCreate(false); onNavigate(!customers.length ? "customers" : "items"); }}>Open {!customers.length ? "customers" : "items"}</button></div> : <>
      <div className="books-form-grid">
        <label className="span-2"><span>Customer *</span><select required value={form.customerId} onChange={(e) => selectCustomer(e.target.value)}><option value="">Select customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.displayName}</option>)}</select></label>
        <label><span>Invoice date *</span><input type="date" required value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} /></label>
        <label><span>Due date *</span><input type="date" min={form.invoiceDate} required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
        <label><span>Place of supply *</span><input maxLength={2} required value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value.replace(/\D/g, "") })} /></label>
        <label><span>Supply treatment</span><select value={form.supplyType} onChange={(e) => setForm({ ...form, supplyType: e.target.value })}><option value="DOMESTIC">Domestic</option><option value="EXPORT">Export</option><option value="SEZ_WITH_PAYMENT">SEZ with tax</option><option value="SEZ_WITHOUT_PAYMENT">SEZ without tax</option></select></label>
      </div>
      <div className="books-line-editor"><div className="books-line-head"><strong>Invoice lines</strong><button type="button" onClick={() => setForm({ ...form, lines: [...form.lines, emptyLine()] })}><Plus />Add line</button></div>{form.lines.map((line, index) => <div className="books-line-row" key={index}>
        <label><span>Item / service</span><select value={line.itemId} onChange={(e) => selectItem(index, e.target.value)}><option value="">Custom line</option>{items.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label className="line-description"><span>Description *</span><input required value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} /></label>
        <label><span>HSN/SAC *</span><input required minLength={4} maxLength={8} value={line.hsnSac} onChange={(e) => updateLine(index, { hsnSac: e.target.value.replace(/\D/g, "") })} /></label>
        <label><span>Qty *</span><input required inputMode="decimal" value={line.quantity} onChange={(e) => updateLine(index, { quantity: e.target.value })} /></label>
        <label><span>Rate *</span><input required inputMode="decimal" value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: e.target.value })} /></label>
        <label><span>GST %</span><input required inputMode="decimal" value={line.gstRate} onChange={(e) => updateLine(index, { gstRate: e.target.value })} /></label>
        <button type="button" className="books-delete-line" disabled={form.lines.length === 1} onClick={() => setForm({ ...form, lines: form.lines.filter((_, lineIndex) => lineIndex !== index) })} aria-label="Remove line"><Trash2 /></button>
      </div>)}</div>
      <div className="books-invoice-total"><span>Estimated invoice total</span><strong>{inr(estimate)}</strong><small>Final tax is calculated server-side using exact paise rounding.</small></div>
      <div className="books-form-grid"><label className="span-2"><span>Notes</span><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label></div>
      {formError && <p className="books-form-error">{formError}</p>}<footer><button type="button" className="books-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="books-primary" disabled={saving || !form.customerId || !form.placeOfSupply}>{saving ? "Saving draft…" : "Save draft"}</button></footer></>}
    </form></Modal>}

    {postTarget && <Modal title={`Post ${postTarget.invoiceNumber}?`} description="Posting creates an immutable, balanced journal entry. The draft will no longer be directly editable." onClose={() => setPostTarget(null)}><div className="books-confirm"><span><CheckCircle2 /></span><div><strong>{postTarget.customerName}</strong><p>{inr(postTarget.grandTotal)} will debit Accounts Receivable and credit Revenue and Output GST.</p></div></div>{formError && <p className="books-form-error">{formError}</p>}<footer className="books-modal-footer"><button className="books-secondary" onClick={() => setPostTarget(null)}>Keep draft</button><button className="books-primary" onClick={postInvoice} disabled={saving}>{saving ? "Posting…" : "Post to ledger"}</button></footer></Modal>}

    {payTarget && <Modal title={`Record payment for ${payTarget.invoiceNumber}`} description={`Outstanding balance ${inr(payTarget.balanceDue)}`} onClose={() => setPayTarget(null)}><form className="books-modal-form" onSubmit={recordPayment}><div className="books-form-grid">
      <label><span>Amount *</span><div className="books-money-input"><IndianRupee /><input required inputMode="decimal" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} /></div></label>
      <label><span>Payment date *</span><input type="date" required value={payment.paymentDate} onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })} /></label>
      <label><span>Mode *</span><select value={payment.paymentMode} onChange={(e) => setPayment({ ...payment, paymentMode: e.target.value })}><option value="BANK_TRANSFER">Bank transfer</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="CHEQUE">Cheque</option><option value="CASH">Cash</option><option value="OTHER">Other</option></select></label>
      <label><span>Reference</span><input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></label>
    </div>{formError && <p className="books-form-error">{formError}</p>}<footer><button type="button" className="books-secondary" onClick={() => setPayTarget(null)}>Cancel</button><button className="books-primary" disabled={saving || !payment.amount}>{saving ? "Posting payment…" : "Record & post payment"}</button></footer></form></Modal>}
  </div>;
}

