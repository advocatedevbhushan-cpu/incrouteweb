import React, { useEffect, useState, useCallback } from "react";
import { CalendarCheck, Plus, X, AlertTriangle } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, PriorityBadge, EmptyState, StatCard, api } from "../shared";

const CATEGORIES = ["ALL", "ROC", "GST", "INCOME_TAX", "DIN_KYC", "TRADEMARK", "BOARD_MEETING", "ANNUAL_FILING", "TDS", "EPF", "OTHER"];
const STATUSES = ["ALL", "PENDING", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "OVERDUE", "BLOCKED"];
const PRIORITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function ComplianceOps() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [entities, setEntities] = useState<any[]>([]);
  const [form, setForm] = useState({ entityId: "", title: "", category: "GST", dueDate: "", priority: "MEDIUM", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      const data = await api(`/api/admin/compliance?${params}`);
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.stats) setStats(data.stats);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/compliance/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };

  const loadEntities = async () => { const d = await api("/api/admin/clients"); const allEntities: any[] = []; for (const c of (d.clients || [])) { const detail = await api(`/api/admin/clients/${c.id}`); (detail.entities || []).forEach((e: any) => allEntities.push({ ...e, clientName: c.companyName })); } setEntities(allEntities); };

  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await api("/api/admin/compliance", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); fetchData(); } catch {} finally { setSaving(false); } };

  const isOverdue = (dueDate: string, status: string) => status !== "COMPLETED" && new Date(dueDate) < new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Compliance Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} compliance tasks</p></div>
        <button onClick={() => { setShowAdd(true); loadEntities(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Task</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Overdue" value={stats.overdue || 0} color="#EF4444" />
        <StatCard label="Pending" value={stats.pending || 0} color="var(--warning)" />
        <StatCard label="In Progress" value={stats.inProgress || 0} color="var(--accent)" />
        <StatCard label="Completed" value={stats.completed || 0} color="var(--success)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search task, entity, client..." />
        <div className="flex flex-wrap gap-1">
          {STATUSES.slice(0, 5).map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-2 py-1.5 text-[11px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] outline-none">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : tasks.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No compliance tasks" description="Add compliance tasks or they'll auto-generate when services are completed." action={{ label: "Add Task", onClick: () => { setShowAdd(true); loadEntities(); } }} />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Task", "Entity / Client", "Category", "Due Date", "Priority", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead>
          <tbody>{tasks.map(t => (
            <tr key={t.id} className={`border-b border-[var(--border-subtle)] last:border-0 transition-colors ${isOverdue(t.dueDate, t.status) ? "bg-[color-mix(in_srgb,#EF4444_4%,transparent)]" : "hover:bg-[var(--accent-soft)]"}`}>
              <td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)] max-w-[200px]">{t.title}</td>
              <td className="px-4 py-3"><p className="text-[11px] text-[var(--text-secondary)]">{t.entityName || "—"}</p><p className="text-[9px] text-[var(--text-tertiary)]">{t.clientName || ""}</p></td>
              <td className="px-4 py-3 text-[10px] text-[var(--text-tertiary)] uppercase">{t.category}</td>
              <td className="px-4 py-3"><span className={`text-[11px] ${isOverdue(t.dueDate, t.status) ? "text-[#EF4444] font-semibold" : "text-[var(--text-secondary)]"}`}>{isOverdue(t.dueDate, t.status) && "⚠ "}{new Date(t.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span></td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3"><StatusBadge status={isOverdue(t.dueDate, t.status) && t.status !== "OVERDUE" ? "OVERDUE" : t.status} /></td>
              <td className="px-4 py-3">
                {t.status !== "COMPLETED" && (
                  <div className="flex gap-1">
                    {t.status === "PENDING" && <button onClick={() => updateStatus(t.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Start</button>}
                    {t.status === "IN_PROGRESS" && <button onClick={() => updateStatus(t.id, "UNDER_REVIEW")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Review</button>}
                    {(t.status === "UNDER_REVIEW" || t.status === "OVERDUE") && <button onClick={() => updateStatus(t.id, "COMPLETED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Complete</button>}
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody></table></div></div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Add Compliance Task</h3><button type="button" onClick={() => setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Entity *</label><select required value={form.entityId} onChange={e => setForm({...form, entityId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"><option value="">Select entity...</option>{entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.clientName})</option>)}</select></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Task Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none">{CATEGORIES.filter(c => c !== "ALL").map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}</select></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Due Date *</label><input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Adding..." : "Add Compliance Task"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
