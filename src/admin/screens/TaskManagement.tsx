import React, { useEffect, useState, useCallback } from "react";
import { CheckSquare, Plus, X } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, PriorityBadge, EmptyState, api } from "../shared";

const STATUSES = ["ALL", "PENDING", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "BLOCKED"];
const PRIORITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function TaskManagement() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", clientId: "", priority: "MEDIUM", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      const data = await api(`/api/admin/tasks?${params}`);
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter, priorityFilter]);

  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await api("/api/admin/tasks", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); setForm({ title: "", description: "", clientId: "", priority: "MEDIUM", dueDate: "" }); fetchData(); } catch {} finally { setSaving(false); } };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients || []); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Task Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} tasks</p></div>
        <button onClick={() => { setShowAdd(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Create Task</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." />
        <div className="flex flex-wrap gap-1">
          {STATUSES.slice(0, 5).map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-2 py-1.5 text-[11px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] outline-none">
          {PRIORITIES.map(p => <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks" description="Create internal tasks to track work across your team." action={{ label: "Create Task", onClick: () => { setShowAdd(true); loadClients(); } }} />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Task", "Client", "Priority", "Due", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead>
          <tbody>{tasks.map(t => (
            <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
              <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)] max-w-[250px] truncate">{t.title}</p>{t.description && <p className="text-[9px] text-[var(--text-tertiary)] truncate max-w-[200px]">{t.description}</p>}</td>
              <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{t.clientName || "Internal"}</td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3">
                {t.status !== "COMPLETED" && (
                  <div className="flex gap-1">
                    {t.status === "PENDING" && <button onClick={() => updateStatus(t.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Start</button>}
                    {t.status === "IN_PROGRESS" && <button onClick={() => updateStatus(t.id, "UNDER_REVIEW")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Review</button>}
                    {t.status === "UNDER_REVIEW" && <button onClick={() => updateStatus(t.id, "COMPLETED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Done</button>}
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody></table></div></div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create Task</h3><button type="button" onClick={() => setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none" /></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client</label><select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Internal (no client)</option>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Creating..." : "Create Task"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
