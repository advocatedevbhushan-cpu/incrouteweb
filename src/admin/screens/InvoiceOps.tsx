import React, { useEffect, useState, useCallback } from "react";
import { Receipt, Plus, X } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";

const STATUSES = ["ALL", "DRAFT", "PENDING", "SENT", "PAID", "OVERDUE", "CANCELLED"];
const fmtAmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

export default function InvoiceOps() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState<any>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ clientId: "", amount: "", tax: "", description: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

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

  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients || []); };
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { const data = await api("/api/admin/invoices", { method: "POST", body: JSON.stringify(form) }); if (data.success) { setShowAdd(false); setForm({ clientId: "", amount: "", tax: "", description: "", dueDate: "" }); fetchData(); } } catch {} finally { setSaving(false); } };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Revenue & Invoices</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} invoices</p></div>
        <button onClick={() => { setShowAdd(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Create Invoice</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={fmtAmt(totals.totalRevenue || 0)} color="var(--success)" />
        <StatCard label="Outstanding" value={fmtAmt(totals.outstanding || 0)} color="var(--warning)" />
        <StatCard label="Paid This Month" value={fmtAmt(totals.paidThisMonth || 0)} color="var(--accent)" />
        <StatCard label="Overdue" value={fmtAmt(totals.overdue || 0)} color="#EF4444" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search invoice, client..." />
        <div className="flex flex-wrap gap-1">{STATUSES.map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}</div>
      </div>
      {loading ? <Loading /> : invoices.length === 0 ? <EmptyState icon={Receipt} title="No invoices" description="Create your first invoice to start tracking revenue." action={{ label: "Create Invoice", onClick: () => { setShowAdd(true); loadClients(); } }} /> : (
        <><div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Invoice", "Client", "Amount", "Status", "Due", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{invoices.map(inv => (<tr key={inv.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
          <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)]">{inv.invoiceNo}</p>{inv.description && <p className="text-[9px] text-[var(--text-tertiary)] truncate max-w-[150px]">{inv.description}</p>}</td>
          <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{inv.clientName || "—"}</td>
          <td className="px-4 py-3 text-[12px] font-semibold text-[var(--text-primary)]">₹{Number(inv.total).toLocaleString()}</td>
          <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
          <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(inv.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
          <td className="px-4 py-3"><div className="flex gap-1">
            {inv.status === "PENDING" && <button onClick={() => updateStatus(inv.id, "SENT")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Send</button>}
            {(inv.status === "SENT" || inv.status === "OVERDUE") && <button onClick={() => updateStatus(inv.id, "PAID")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Mark Paid</button>}
          </div></td>
        </tr>))}</tbody></table></div></div><Pagination page={page} pages={pages} onPage={setPage} /></>
      )}
      {showAdd && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}><form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create Invoice</h3><button type="button" onClick={() => setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
        <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label><select required value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Select...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Amount (₹) *</label><input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none" /></div>
          <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Tax (₹)</label><input type="number" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none" /></div>
        </div>
        <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none" placeholder="Service description..." /></div>
        <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Due Date *</label><input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none" /></div>
        <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Creating..." : "Create Invoice"}</button>
      </form></div>)}
    </div>
  );
}
