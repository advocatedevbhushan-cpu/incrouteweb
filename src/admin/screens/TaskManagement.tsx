import React, { useEffect, useState } from "react";
import { CheckSquare, Plus, Loader2, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  clientName: string | null;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/tasks", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("incroute_access_token");
      await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form)
      });
      setShowAdd(false); setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" }); fetchTasks();
    } catch {} finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("incroute_access_token");
    await fetch(`/api/admin/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status })
    });
    fetchTasks();
  };

  const priorityColor = (p: string) => p === "CRITICAL" ? "#EF4444" : p === "HIGH" ? "var(--warning)" : "var(--accent)";
  const statusColor = (s: string) => s === "COMPLETED" ? "var(--success)" : s === "IN_PROGRESS" ? "var(--accent)" : "var(--text-tertiary)";

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Task Management</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{tasks.length} tasks</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Task
        </button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create Task</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Title</label>
              <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      {tasks.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <CheckSquare className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">No tasks yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Task", "Client", "Priority", "Status", "Due", "Action"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead>
          <tbody>{tasks.map(t => (
            <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
              <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)] max-w-[250px] truncate">{t.title}</td>
              <td className="px-5 py-3.5 text-[11px] text-[var(--text-secondary)]">{t.clientName || "—"}</td>
              <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: priorityColor(t.priority) }}>{t.priority}</span></td>
              <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: statusColor(t.status) }}>{t.status.replace(/_/g, " ")}</span></td>
              <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}</td>
              <td className="px-5 py-3.5">
                {t.status !== "COMPLETED" && (
                  <button onClick={() => updateStatus(t.id, t.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED")}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors">
                    {t.status === "PENDING" ? "Start" : "Complete"}
                  </button>
                )}
              </td>
            </tr>
          ))}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
