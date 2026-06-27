import React, { useEffect, useState, useCallback } from "react";
import { Receipt, Plus, X, Send, Eye, Download, FileText, Trash2, Mail } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";
import jsPDF from "jspdf";

const STATUSES = ["ALL", "DRAFT", "PENDING", "SENT", "PAID", "OVERDUE", "CANCELLED"];
const fmtAmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

interface LineItem {
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
}

export default function InvoiceOps() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState<any>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create invoice modal
  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientId: "",
    dueDate: "",
    gstRate: "18",
    notes: "",
    bankDetails: "Bank: ICICI Bank\nA/C Name: INCroute Services\nA/C No: 1234567890\nIFSC: ICIC0001234",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", hsn: "", quantity: 1, rate: 0 }
  ]);

  // Send email modal
  const [showSend, setShowSend] = useState(false);
  const [sendInvoiceId, setSendInvoiceId] = useState("");
  const [sendForm, setSendForm] = useState({ recipientEmail: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const data = await api(`/api/admin/invoices?${params}`);
      setInvoices(data.invoices || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.totals) setTotals(data.totals);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const loadClients = async () => {
    const d = await api("/api/admin/clients");
    setClients(d.clients || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await api(`/api/admin/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchData();
  };

  // Line items helpers
  const addLineItem = () => setLineItems([...lineItems, { description: "", hsn: "", quantity: 1, rate: 0 }]);
  const removeLineItem = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));
  const updateLineItem = (idx: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = value;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = Math.round(subtotal * Number(createForm.gstRate) / 100);
  const grandTotal = subtotal + taxAmount;

  // Create invoice handler
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.every(i => !i.description || i.rate <= 0)) return;
    setSaving(true);
    try {
      const data = await api("/api/admin/invoices/create", {
        method: "POST",
        body: JSON.stringify({
          clientId: createForm.clientId,
          lineItems: lineItems.filter(i => i.description && i.rate > 0),
          notes: createForm.notes,
          bankDetails: createForm.bankDetails,
          dueDate: createForm.dueDate,
          gstRate: createForm.gstRate,
        }),
      });
      if (data.success) {
        setShowCreate(false);
        setLineItems([{ description: "", hsn: "", quantity: 1, rate: 0 }]);
        setCreateForm({ clientId: "", dueDate: "", gstRate: "18", notes: "", bankDetails: createForm.bankDetails });
        fetchData();
      }
    } catch {} finally { setSaving(false); }
  };

  // Send invoice email handler
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const data = await api(`/api/admin/invoices/${sendInvoiceId}/send`, {
        method: "POST",
        body: JSON.stringify(sendForm),
      });
      if (data.success) {
        setShowSend(false);
        setSendForm({ recipientEmail: "", subject: "", message: "" });
        fetchData();
        alert(`✅ Invoice sent to ${sendForm.recipientEmail || "client"}`);
      } else {
        alert(`❌ ${data.error || "Failed to send"}`);
      }
    } catch { alert("Network error"); } finally { setSending(false); }
  };

  // Preview invoice
  const handlePreview = async (id: string) => {
    const data = await api(`/api/admin/invoices/${id}`);
    if (data.invoice) { setPreviewInvoice(data.invoice); setShowPreview(true); }
  };

  // Download PDF
  const handleDownloadPDF = (invoice: any) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 20;
    let y = m;

    // Header bar
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pw, 35, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55);
    doc.text("INCroute", m, 18);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("CORPORATE REGISTRATIONS & COMPLIANCE", m, 25);
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pw - m, 16, { align: "right" });
    doc.setFontSize(11);
    doc.setTextColor(212, 175, 55);
    doc.text(invoice.invoiceNo || "", pw - m, 25, { align: "right" });
    y = 45;

    // Bill To
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text("BILL TO", m, y);
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.companyName || "Client", m, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (invoice.address) { doc.text(invoice.address, m, y); y += 4; }
    if (invoice.gstin) { doc.text(`GSTIN: ${invoice.gstin}`, m, y); y += 4; }
    if (invoice.contactEmail) { doc.text(invoice.contactEmail, m, y); y += 4; }

    // Dates (right side)
    const dateY = 45;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, pw - m, dateY, { align: "right" });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}`, pw - m, dateY + 5, { align: "right" });

    y = Math.max(y, 70) + 5;

    // Table header
    const cols = [m, m + 10, m + 80, m + 100, m + 118, m + 140];
    doc.setFillColor(245, 245, 245);
    doc.rect(m, y, pw - 2 * m, 8, "F");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    const headers = ["#", "Description", "HSN", "Qty", "Rate", "Amount"];
    headers.forEach((h, i) => doc.text(h, cols[i], y + 5.5));
    y += 10;

    // Line items
    let items: any[] = [];
    try { const parsed = JSON.parse(invoice.description); items = parsed.items || []; } catch {}

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    items.forEach((item: any) => {
      if (y > 260) { doc.addPage(); y = m; }
      doc.text(String(item.sno), cols[0], y);
      doc.text(String(item.description || "").substring(0, 40), cols[1], y);
      doc.text(item.hsn || "-", cols[2], y);
      doc.text(String(item.quantity), cols[3], y);
      doc.text(`₹${Number(item.rate).toLocaleString("en-IN")}`, cols[4], y);
      doc.text(`₹${Number(item.amount).toLocaleString("en-IN")}`, cols[5], y);
      y += 7;
    });

    // Totals
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(pw - 80, y, pw - m, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("Subtotal:", pw - 80, y);
    doc.text(`₹${Number(invoice.amount).toLocaleString("en-IN")}`, pw - m, y, { align: "right" });
    y += 6;
    let gstRate = 18;
    try { gstRate = JSON.parse(invoice.description).gstRate || 18; } catch {}
    doc.text(`GST (${gstRate}%):`, pw - 80, y);
    doc.text(`₹${Number(invoice.tax).toLocaleString("en-IN")}`, pw - m, y, { align: "right" });
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Total:", pw - 80, y);
    doc.text(`₹${Number(invoice.total).toLocaleString("en-IN")}`, pw - m, y, { align: "right" });

    // Bank details
    let bankDetails = "";
    try { bankDetails = JSON.parse(invoice.description).bankDetails || ""; } catch {}
    if (bankDetails) {
      y += 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("BANK DETAILS", m, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      bankDetails.split("\n").forEach((line: string) => { doc.text(line, m, y); y += 4.5; });
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business • INCroute Corporate Services • incroute.com", pw / 2, 285, { align: "center" });

    doc.save(`${invoice.invoiceNo || "Invoice"}.pdf`);
  };

  // Open send modal
  const openSendModal = (inv: any) => {
    setSendInvoiceId(inv.id);
    setSendForm({ recipientEmail: inv.contactEmail || "", subject: `Invoice ${inv.invoiceNo} from INCroute`, message: "" });
    setShowSend(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Revenue & Invoices</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} invoices</p>
        </div>
        <button onClick={() => { setShowCreate(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={fmtAmt(totals.totalRevenue || 0)} color="var(--success)" />
        <StatCard label="Outstanding" value={fmtAmt(totals.outstanding || 0)} color="var(--warning)" />
        <StatCard label="Paid This Month" value={fmtAmt(totals.paidThisMonth || 0)} color="var(--accent)" />
        <StatCard label="Overdue" value={fmtAmt(totals.overdue || 0)} color="#EF4444" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search invoice, client..." />
        <div className="flex flex-wrap gap-1">
          {STATUSES.map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
      </div>

      {/* Table */}
      {loading ? <Loading /> : invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices" description="Create your first invoice to start tracking revenue." action={{ label: "Create Invoice", onClick: () => { setShowCreate(true); loadClients(); } }} />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    {["Invoice", "Client", "Amount", "Status", "Due", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-medium text-[var(--text-primary)]">{inv.invoiceNo}</p>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{inv.clientName || "—"}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-[var(--text-primary)]">₹{Number(inv.total).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(inv.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handlePreview(inv.id)} title="Preview" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer"><Eye className="w-3.5 h-3.5 text-[var(--text-secondary)]" /></button>
                          <button onClick={() => handleDownloadPDF(inv)} title="Download PDF" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer"><Download className="w-3.5 h-3.5 text-[var(--text-secondary)]" /></button>
                          <button onClick={() => openSendModal(inv)} title="Send Email" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer"><Mail className="w-3.5 h-3.5 text-[var(--accent)]" /></button>
                          {inv.status === "PENDING" && <button onClick={() => updateStatus(inv.id, "SENT")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Send</button>}
                          {(inv.status === "SENT" || inv.status === "OVERDUE") && <button onClick={() => updateStatus(inv.id, "PAID")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Paid</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      {/* ═══ CREATE INVOICE MODAL (Zoho/Tally-style with line items) ═══ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreateInvoice} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-3xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create New Invoice</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Add line items, tax, and payment details</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Client & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label>
                  <select required value={createForm.clientId} onChange={e => setCreateForm({...createForm, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Due Date *</label>
                  <input type="date" required value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">GST Rate (%)</label>
                  <select value={createForm.gstRate} onChange={e => setCreateForm({...createForm, gstRate: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none">
                    <option value="0">No Tax (0%)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-[10px] text-[var(--accent)] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)]">
                        <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[40%]">Description *</th>
                        <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[15%]">HSN/SAC</th>
                        <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[12%]">Qty</th>
                        <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[18%]">Rate (₹)</th>
                        <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[12%] text-right">Amount</th>
                        <th className="w-[3%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-0">
                          <td className="px-2 py-1.5"><input type="text" placeholder="Service description" value={item.description} onChange={e => updateLineItem(idx, "description", e.target.value)} className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                          <td className="px-2 py-1.5"><input type="text" placeholder="998313" value={item.hsn} onChange={e => updateLineItem(idx, "hsn", e.target.value)} className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                          <td className="px-2 py-1.5"><input type="number" min="1" value={item.quantity} onChange={e => updateLineItem(idx, "quantity", Number(e.target.value))} className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                          <td className="px-2 py-1.5"><input type="number" min="0" value={item.rate || ""} onChange={e => updateLineItem(idx, "rate", Number(e.target.value))} className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" placeholder="0" /></td>
                          <td className="px-3 py-1.5 text-[12px] font-semibold text-[var(--text-primary)] text-right">₹{(item.quantity * item.rate).toLocaleString("en-IN")}</td>
                          <td className="px-1"><button type="button" onClick={() => removeLineItem(idx)} className="text-red-400 hover:text-red-300 cursor-pointer p-1" title="Remove"><Trash2 className="w-3 h-3" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-[12px]">
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>GST ({createForm.gstRate}%)</span><span>₹{taxAmount.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between text-[var(--text-primary)] font-bold text-[14px] pt-2 border-t border-[var(--border-subtle)]"><span>Grand Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
                </div>
              </div>

              {/* Bank Details & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Bank Details</label>
                  <textarea rows={4} value={createForm.bankDetails} onChange={e => setCreateForm({...createForm, bankDetails: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent)]" placeholder="Bank name, A/C number, IFSC..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Notes / Terms</label>
                  <textarea rows={4} value={createForm.notes} onChange={e => setCreateForm({...createForm, notes: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent)]" placeholder="Payment terms, late fee policy..." />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <p className="text-[11px] text-[var(--text-tertiary)]">Invoice will be saved as Draft</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-[12px] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl cursor-pointer hover:bg-[var(--bg-surface-alt)]">Cancel</button>
                <button type="submit" disabled={saving || grandTotal <= 0} className="px-5 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-40 hover:bg-[var(--accent-deep)]">
                  {saving ? "Creating..." : `Create Invoice (₹${grandTotal.toLocaleString("en-IN")})`}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ═══ SEND EMAIL MODAL ═══ */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSend(false)}>
          <form onSubmit={handleSendEmail} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--accent)]" /> Send Invoice</h3>
              <button type="button" onClick={() => setShowSend(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Recipient Email *</label>
              <input type="email" required value={sendForm.recipientEmail} onChange={e => setSendForm({...sendForm, recipientEmail: e.target.value})} placeholder="client@company.com" className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Subject</label>
              <input value={sendForm.subject} onChange={e => setSendForm({...sendForm, subject: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Personal Message (optional)</label>
              <textarea rows={3} value={sendForm.message} onChange={e => setSendForm({...sendForm, message: e.target.value})} placeholder="Hi, please find your invoice below..." className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent)]" />
            </div>
            <button type="submit" disabled={sending} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-3.5 h-3.5" /> {sending ? "Sending..." : "Send Invoice Email"}
            </button>
          </form>
        </div>
      )}

      {/* ═══ PREVIEW MODAL ═══ */}
      {showPreview && previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setShowPreview(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Preview Header */}
            <div className="bg-[#1a1a2e] px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-[20px] font-bold text-[#d4af37]">INCroute</h2>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Corporate Registrations & Compliance</p>
              </div>
              <div className="text-right">
                <p className="text-[22px] font-extrabold text-white">INVOICE</p>
                <p className="text-[13px] text-[#d4af37] mt-1">{previewInvoice.invoiceNo}</p>
              </div>
            </div>

            {/* Bill To & Meta */}
            <div className="px-8 py-5 flex justify-between border-b border-gray-100">
              <div>
                <p className="text-[9px] uppercase text-gray-400 tracking-wider font-semibold">Bill To</p>
                <p className="text-[15px] font-bold text-gray-900 mt-1">{previewInvoice.companyName || "Client"}</p>
                {previewInvoice.address && <p className="text-[11px] text-gray-500 mt-0.5">{previewInvoice.address}</p>}
                {previewInvoice.gstin && <p className="text-[10px] text-gray-500 mt-0.5">GSTIN: {previewInvoice.gstin}</p>}
              </div>
              <div className="text-right text-[11px] text-gray-500 space-y-1">
                <p>Date: {new Date(previewInvoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <p>Due: {new Date(previewInvoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-[10px] font-bold rounded-md ${previewInvoice.status === "PAID" ? "bg-green-100 text-green-800" : previewInvoice.status === "OVERDUE" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{previewInvoice.status}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="px-8 py-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-[9px] uppercase text-gray-400 tracking-wider">
                    <th className="py-2 px-2">#</th><th className="py-2 px-2">Description</th><th className="py-2 px-2 text-center">HSN</th><th className="py-2 px-2 text-center">Qty</th><th className="py-2 px-2 text-right">Rate</th><th className="py-2 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewInvoice.lineItems?.items || []).map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 text-[12px]">
                      <td className="py-2.5 px-2 text-gray-500">{item.sno}</td>
                      <td className="py-2.5 px-2 text-gray-800">{item.description}</td>
                      <td className="py-2.5 px-2 text-center text-gray-500">{item.hsn || "-"}</td>
                      <td className="py-2.5 px-2 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right text-gray-800">₹{Number(item.rate).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-900">₹{Number(item.amount).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-8 pb-4 flex justify-end">
              <div className="w-56 space-y-1.5 text-[12px]">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{Number(previewInvoice.amount).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST ({previewInvoice.lineItems?.gstRate || 18}%)</span><span>₹{Number(previewInvoice.tax).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-bold text-[15px] text-gray-900 pt-2 border-t border-gray-200"><span>Total</span><span>₹{Number(previewInvoice.total).toLocaleString("en-IN")}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setShowPreview(false)} className="text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">Close</button>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadPDF(previewInvoice)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-gray-100">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button onClick={() => { setShowPreview(false); openSendModal(previewInvoice); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a2e] text-[#d4af37] text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-[#2a2a4e]">
                  <Send className="w-3.5 h-3.5" /> Email to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
