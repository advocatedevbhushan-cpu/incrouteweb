import React, { useEffect, useState, useCallback } from "react";
import { FileText, Plus, X, Send, Download, Eye, Trash2, Copy } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";
import jsPDF from "jspdf";

// Predefined service catalog for quick adding
const SERVICE_CATALOG = [
  { name: "Private Limited Company Registration", hsn: "998313", rate: 5999, description: "Complete Pvt Ltd incorporation including DSC, SPICe+ filing, PAN/TAN allocation" },
  { name: "LLP Registration", hsn: "998313", rate: 4999, description: "Limited Liability Partnership formation including DPIN, LLPIN allocation" },
  { name: "One Person Company (OPC)", hsn: "998313", rate: 4499, description: "Single director company incorporation with nominee" },
  { name: "GST Registration", hsn: "998313", rate: 1999, description: "GSTIN application and allocation with ARN tracking" },
  { name: "Trademark Registration (1 Class)", hsn: "998313", rate: 6999, description: "TM-A filing, Vienna classification, journal publication monitoring" },
  { name: "MSME / Udyam Registration", hsn: "998313", rate: 999, description: "Udyam certificate issuance with NIC code classification" },
  { name: "FSSAI Basic Registration", hsn: "998313", rate: 1999, description: "Food license for turnover up to ₹12 lakhs" },
  { name: "FSSAI State License", hsn: "998313", rate: 3999, description: "Food license for turnover ₹12L - ₹20Cr" },
  { name: "Annual ROC Filing (AOC-4 + MGT-7)", hsn: "998313", rate: 4999, description: "Financial statements and annual return filing" },
  { name: "DIR-3 KYC Filing", hsn: "998313", rate: 499, description: "Annual director KYC verification" },
  { name: "Income Tax Return Filing", hsn: "998313", rate: 2499, description: "ITR preparation and e-filing for companies" },
  { name: "TDS Return Filing (Quarterly)", hsn: "998313", rate: 1499, description: "Form 24Q/26Q preparation and filing" },
  { name: "ISO Certification Assistance", hsn: "998313", rate: 14999, description: "Documentation, audit support, and certification body coordination" },
  { name: "Digital Signature Certificate (DSC)", hsn: "998313", rate: 1499, description: "Class 3 DSC for 2 years validity" },
  { name: "Virtual Office Address (1 Year)", hsn: "998313", rate: 9999, description: "Registered office address with GST & ROC compliance" },
  { name: "Legal Document Drafting", hsn: "998313", rate: 2999, description: "MOA/AOA, agreements, NDAs, or policy documents" },
  { name: "Consultation Fee (Per Hour)", hsn: "998313", rate: 1500, description: "Expert advisory session with CA/CS" },
  { name: "Government Fee (At Actuals)", hsn: "998313", rate: 0, description: "Stamp duty, MCA fees, trademark filing fees — charged at actuals" },
];

interface LineItem {
  name: string;
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
}

interface Proforma {
  id: string;
  proformaNo: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  gstRate: number;
  validUntil: string;
  notes: string;
  status: string;
  createdAt: string;
}

export default function ProformaOps() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Form state
  const [form, setForm] = useState({
    clientId: "", validUntil: "", gstRate: "18",
    notes: "Terms & Conditions:\n1. Payment due within 7 days of acceptance\n2. GST extra as applicable\n3. Government fees charged at actuals\n4. Quotation valid for 15 days\n5. 50% advance required to start work",
    bankDetails: "Bank: ICICI Bank\nA/C Name: INCroute Services\nA/C No: 1234567890\nIFSC: ICIC0001234\nUPI: incroute@icici",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { name: "", description: "", hsn: "998313", quantity: 1, rate: 0 }
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/admin/proforma");
      setProformas(data.proformas || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients || []); };

  // Line item management
  const addLineItem = () => setLineItems([...lineItems, { name: "", description: "", hsn: "998313", quantity: 1, rate: 0 }]);
  const removeLineItem = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems]; (updated[idx] as any)[field] = value; setLineItems(updated);
  };
  const addFromCatalog = (svc: typeof SERVICE_CATALOG[0]) => {
    setLineItems([...lineItems.filter(i => i.name || i.rate > 0), { name: svc.name, description: svc.description, hsn: svc.hsn, quantity: 1, rate: svc.rate }]);
    setShowCatalog(false);
  };

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxAmount = Math.round(subtotal * Number(form.gstRate) / 100);
  const grandTotal = subtotal + taxAmount;

  // Create proforma
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = lineItems.filter(i => i.name && i.rate > 0);
    if (!form.clientId || validItems.length === 0) return;
    setSaving(true);
    try {
      const data = await api("/api/admin/proforma", {
        method: "POST",
        body: JSON.stringify({ ...form, lineItems: validItems }),
      });
      if (data.success) {
        setShowCreate(false);
        setLineItems([{ name: "", description: "", hsn: "998313", quantity: 1, rate: 0 }]);
        setForm({ ...form, clientId: "", validUntil: "" });
        fetchData();
      }
    } catch {} finally { setSaving(false); }
  };

  // Send proforma email
  const handleSend = async (id: string) => {
    setSending(true);
    try {
      const data = await api(`/api/admin/proforma/${id}/send`, { method: "POST" });
      if (data.success) { alert(`✅ Quotation sent to ${data.sentTo}`); fetchData(); }
      else alert(`❌ ${data.error}`);
    } catch { alert("Failed to send"); } finally { setSending(false); }
  };

  // Download PDF
  const handleDownloadPDF = (p: Proforma) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 20;
    let y = m;

    // Header
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pw, 38, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(212, 175, 55);
    doc.text("INCroute", m, 18);
    doc.setFontSize(8); doc.setTextColor(180, 180, 180);
    doc.text("CORPORATE REGISTRATIONS & COMPLIANCE", m, 26);
    doc.setFontSize(9); doc.text("GSTIN: 07AABCI1234A1Z5 | SAC: 998313", m, 32);
    doc.setFontSize(22); doc.setTextColor(255, 255, 255);
    doc.text("PROFORMA INVOICE", pw - m, 18, { align: "right" });
    doc.setFontSize(11); doc.setTextColor(212, 175, 55);
    doc.text(p.proformaNo, pw - m, 27, { align: "right" });
    doc.setFontSize(8); doc.setTextColor(180, 180, 180);
    doc.text(`Valid Until: ${new Date(p.validUntil).toLocaleDateString("en-IN")}`, pw - m, 33, { align: "right" });
    y = 48;

    // Client info
    doc.setFontSize(8); doc.setTextColor(130, 130, 130); doc.text("QUOTATION FOR", m, y); y += 5;
    doc.setFontSize(13); doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "bold");
    doc.text(p.clientName || "Client", m, y); y += 5;
    if (p.clientEmail) { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(p.clientEmail, m, y); y += 5; }
    y += 8;

    // Table header
    doc.setFillColor(245, 245, 245); doc.rect(m, y, pw - 2 * m, 8, "F");
    doc.setFontSize(7); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "bold");
    doc.text("#", m + 2, y + 5.5); doc.text("Service", m + 10, y + 5.5); doc.text("Description", m + 60, y + 5.5);
    doc.text("Qty", pw - 55, y + 5.5); doc.text("Rate", pw - 40, y + 5.5); doc.text("Amount", pw - m - 2, y + 5.5, { align: "right" });
    y += 10;

    // Items
    let items: any[] = []; try { items = JSON.parse(p.items); } catch {}
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(30, 30, 30);
    items.forEach((item: any, idx: number) => {
      if (y > 255) { doc.addPage(); y = m; }
      doc.setFont("helvetica", "bold"); doc.text(String(idx + 1), m + 2, y);
      doc.text(item.name?.substring(0, 28) || "", m + 10, y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
      if (item.description) doc.text(item.description.substring(0, 45), m + 10, y + 4);
      doc.setFontSize(9); doc.setTextColor(30, 30, 30);
      doc.text(String(item.quantity), pw - 55, y);
      doc.text(`₹${Number(item.rate).toLocaleString("en-IN")}`, pw - 40, y);
      doc.text(`₹${(item.quantity * item.rate).toLocaleString("en-IN")}`, pw - m - 2, y, { align: "right" });
      y += item.description ? 10 : 7;
    });

    // Totals
    y += 5; doc.setDrawColor(200, 200, 200); doc.line(pw - 80, y, pw - m, y); y += 7;
    doc.setFontSize(10); doc.text("Subtotal:", pw - 80, y); doc.text(`₹${Number(p.subtotal).toLocaleString("en-IN")}`, pw - m, y, { align: "right" }); y += 6;
    doc.text(`GST (${p.gstRate}%):`, pw - 80, y); doc.text(`₹${Number(p.tax).toLocaleString("en-IN")}`, pw - m, y, { align: "right" }); y += 7;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("Total:", pw - 80, y); doc.text(`₹${Number(p.total).toLocaleString("en-IN")}`, pw - m, y, { align: "right" });

    // Notes/Terms
    y += 15;
    if (y > 250) { doc.addPage(); y = m; }
    const notes = form.notes || ""; 
    try { const parsed = JSON.parse(p.items); } catch {}
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 100, 100);
    doc.text("TERMS & CONDITIONS", m, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(60, 60, 60);
    const noteLines = (p.notes || notes).split("\n");
    noteLines.forEach(line => { if (y > 275) { doc.addPage(); y = m; } doc.text(line, m, y); y += 4; });

    // Footer
    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text("This is a quotation and not a tax invoice. • INCroute Corporate Services • incroute.com", pw / 2, 287, { align: "center" });
    doc.save(`${p.proformaNo}.pdf`);
  };

  // Convert to invoice
  const convertToInvoice = async (id: string) => {
    if (!confirm("Convert this quotation to a tax invoice? The client will be billed.")) return;
    const data = await api(`/api/admin/proforma/${id}/convert`, { method: "POST" });
    if (data.success) { alert(`✅ Invoice ${data.invoiceNo} created`); fetchData(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Proforma Invoices & Quotations</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{proformas.length} quotations</p>
        </div>
        <button onClick={() => { setShowCreate(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Create Quotation
        </button>
      </div>

      {/* List */}
      {loading ? <Loading /> : proformas.length === 0 ? (
        <EmptyState icon={FileText} title="No quotations yet" description="Create a proforma invoice to send pricing quotations to clients." action={{ label: "Create Quotation", onClick: () => { setShowCreate(true); loadClients(); } }} />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Proforma #", "Client", "Amount", "Valid Until", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead><tbody>
            {proformas.map(p => (
              <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
                <td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{p.proformaNo}</td>
                <td className="px-4 py-3 text-[12px] font-semibold text-[var(--accent)]">{p.clientName || "—"}</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[var(--text-primary)]">₹{Number(p.total).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(p.validUntil).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button onClick={() => handleDownloadPDF(p)} title="Download PDF" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer"><Download className="w-3.5 h-3.5 text-[var(--text-secondary)]" /></button>
                  <button onClick={() => handleSend(p.id)} title="Email to Client" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer"><Send className="w-3.5 h-3.5 text-[var(--accent)]" /></button>
                  {p.status !== "ACCEPTED" && <button onClick={() => convertToInvoice(p.id)} title="Convert to Invoice" className="text-[9px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-semibold cursor-pointer hover:bg-[var(--success)] hover:text-white">→ Invoice</button>}
                </div></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}

      {/* ═══ CREATE QUOTATION MODAL ═══ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-4xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create Proforma Invoice / Quotation</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Add services from catalog or enter custom line items</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Client & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label>
                  <select required value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Valid Until *</label>
                  <input type="date" required value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">GST Rate</label>
                  <select value={form.gstRate} onChange={e => setForm({...form, gstRate: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none">
                    <option value="0">No Tax</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                  </select>
                </div>
              </div>

              {/* Add from catalog button */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowCatalog(!showCatalog)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-[var(--accent-soft)]">
                  <Copy className="w-3 h-3" /> Add from Service Catalog
                </button>
                <button type="button" onClick={addLineItem} className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--accent)]">
                  <Plus className="w-3 h-3" /> Custom Item
                </button>
              </div>

              {/* Service Catalog Picker */}
              {showCatalog && (
                <div className="border border-[var(--border-subtle)] rounded-xl max-h-[200px] overflow-y-auto">
                  {SERVICE_CATALOG.map((svc, i) => (
                    <button key={i} type="button" onClick={() => addFromCatalog(svc)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[var(--accent-soft)] border-b border-[var(--border-subtle)] last:border-0 cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[12px] font-medium text-[var(--text-primary)]">{svc.name}</p>
                          <p className="text-[9px] text-[var(--text-tertiary)]">{svc.description}</p>
                        </div>
                        <span className="text-[12px] font-bold text-[var(--accent)] shrink-0 ml-4">₹{svc.rate.toLocaleString("en-IN")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Line Items Table */}
              <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)]">
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[25%]">Service *</th>
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[30%]">Description</th>
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[10%]">HSN</th>
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[8%]">Qty</th>
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[12%]">Rate (₹)</th>
                    <th className="px-3 py-2 text-[9px] uppercase text-[var(--text-tertiary)] font-semibold w-[12%] text-right">Amount</th>
                    <th className="w-[3%]"></th>
                  </tr></thead>
                  <tbody>{lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-0">
                      <td className="px-2 py-1.5"><input type="text" value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} placeholder="Service name" className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                      <td className="px-2 py-1.5"><input type="text" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Brief description" className="w-full px-2 py-1.5 bg-transparent text-[11px] text-[var(--text-secondary)] outline-none" /></td>
                      <td className="px-2 py-1.5"><input type="text" value={item.hsn} onChange={e => updateItem(idx, "hsn", e.target.value)} className="w-full px-2 py-1.5 bg-transparent text-[11px] text-[var(--text-primary)] outline-none" /></td>
                      <td className="px-2 py-1.5"><input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                      <td className="px-2 py-1.5"><input type="number" min="0" value={item.rate || ""} onChange={e => updateItem(idx, "rate", Number(e.target.value))} placeholder="0" className="w-full px-2 py-1.5 bg-transparent text-[12px] text-[var(--text-primary)] outline-none" /></td>
                      <td className="px-3 py-1.5 text-[12px] font-semibold text-[var(--text-primary)] text-right">₹{(item.quantity * item.rate).toLocaleString("en-IN")}</td>
                      <td><button type="button" onClick={() => removeLineItem(idx)} className="text-red-400 hover:text-red-300 cursor-pointer p-1"><Trash2 className="w-3 h-3" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-[12px]">
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>GST ({form.gstRate}%)</span><span>₹{taxAmount.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between text-[var(--text-primary)] font-bold text-[14px] pt-2 border-t border-[var(--border-subtle)]"><span>Grand Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div>
                <label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Terms & Conditions / Notes</label>
                <textarea rows={5} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent)]" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <p className="text-[11px] text-[var(--text-tertiary)]">This is a quotation, not a tax invoice</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-[12px] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl cursor-pointer hover:bg-[var(--bg-surface-alt)]">Cancel</button>
                <button type="submit" disabled={saving || grandTotal <= 0} className="px-5 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-40 hover:bg-[var(--accent-deep)]">
                  {saving ? "Creating..." : `Create Quotation (₹${grandTotal.toLocaleString("en-IN")})`}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
