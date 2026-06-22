import React, { useEffect, useState, useCallback } from "react";
import { FileText, Plus, X, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";

const STATUSES = ["ALL", "DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED", "EXPIRED"];
const CATEGORIES = ["Incorporation", "GST", "ROC", "Trademark", "Legal", "Board Resolution", "Tax", "Agreement", "Certificate", "Other"];

export default function DocumentOps() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ clientId: "", title: "", category: "Incorporation", fileName: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const data = await api(`/api/admin/documents?${params}`);
      setDocs(data.documents || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.stats) setStats(data.stats);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/documents/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients || []); };
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await api("/api/admin/documents", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); setForm({ clientId: "", title: "", category: "Incorporation", fileName: "" }); fetchData(); } catch {} finally { setSaving(false); } };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Document Verification</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} documents</p></div>
        <button onClick={() => { setShowAdd(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Upload Document</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending Review" value={stats.underReview || 0} color="var(--warning)" />
        <StatCard label="Approved" value={stats.approved || 0} color="var(--success)" />
        <StatCard label="Rejected" value={stats.rejected || 0} color="#EF4444" />
        <StatCard label="Drafts" value={stats.draft || 0} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search document, client..." />
        <div className="flex flex-wrap gap-1">
          {STATUSES.slice(0, 5).map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
      </div>

      {loading ? <Loading /> : docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Documents uploaded by clients or admin will appear here for verification." action={{ label: "Upload Document", onClick: () => { setShowAdd(true); loadClients(); } }} />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Document", "Client", "Category", "Status", "Date", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead>
          <tbody>{docs.map(d => (
            <tr key={d.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
              <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)]">{d.title}</p><p className="text-[9px] text-[var(--text-tertiary)]">{d.fileName}</p></td>
              <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{d.clientName || "—"}</td>
              <td className="px-4 py-3 text-[10px] text-[var(--text-tertiary)] uppercase">{d.category}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {d.status === "UNDER_REVIEW" && (<>
                    <button onClick={() => updateStatus(d.id, "APPROVED")} title="Approve" className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--text-tertiary)] hover:text-[var(--success)] cursor-pointer"><CheckCircle2 className="w-4 h-4" /></button>
                    <button onClick={() => updateStatus(d.id, "REJECTED")} title="Reject" className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,#EF4444_12%,transparent)] text-[var(--text-tertiary)] hover:text-[#EF4444] cursor-pointer"><XCircle className="w-4 h-4" /></button>
                  </>)}
                  {d.status === "DRAFT" && <button onClick={() => updateStatus(d.id, "UNDER_REVIEW")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer">Submit for Review</button>}
                  {d.status === "APPROVED" && <button onClick={() => updateStatus(d.id, "PUBLISHED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer">Publish</button>}
                </div>
              </td>
            </tr>
          ))}</tbody></table></div></div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Upload Document</h3><button type="button" onClick={() => setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client</label><select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Document Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">File Name</label><input value={form.fileName} onChange={e => setForm({...form, fileName: e.target.value})} placeholder="document.pdf" className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Uploading..." : "Upload Document"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
