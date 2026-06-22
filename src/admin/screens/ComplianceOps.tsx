import React, { useEffect, useState } from "react";
import { CalendarCheck, AlertTriangle, Clock, CheckCircle2, Plus, Loader2 } from "lucide-react";

interface ComplianceTask {
  id: string;
  entityId: string;
  title: string;
  category: string;
  dueDate: string;
  priority: string;
  status: string;
  assigneeId: string | null;
  entityName: string | null;
  entityType: string | null;
  clientName: string | null;
}

export default function ComplianceOps() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCompliance(); }, []);

  const fetchCompliance = async () => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/compliance", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch {} finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("incroute_access_token");
    await fetch(`/api/admin/compliance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status })
    });
    fetchCompliance();
  };

  const statusIcon = (s: string) => {
    if (s === "OVERDUE") return <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />;
    if (s === "COMPLETED") return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />;
    if (s === "IN_PROGRESS" || s === "UNDER_REVIEW") return <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />;
    return <CalendarCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />;
  };
  const prColor = (p: string) => p === "CRITICAL" ? "#EF4444" : p === "HIGH" ? "var(--warning)" : "var(--accent)";

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  const overdue = tasks.filter(t => t.status === "OVERDUE" || (t.status !== "COMPLETED" && new Date(t.dueDate) < new Date())).length;
  const pending = tasks.filter(t => t.status === "PENDING").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Operations</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{tasks.length} compliance tasks across all entities</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overdue", value: overdue, color: "#EF4444" },
          { label: "Pending", value: pending, color: "var(--accent)" },
          { label: "In Progress", value: inProgress, color: "var(--warning)" },
          { label: "Completed", value: completed, color: "var(--success)" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {tasks.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <CalendarCheck className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">No compliance tasks yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Tasks will appear when entities are added to clients</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[var(--border-subtle)]">
                {["Entity", "Task", "Category", "Due Date", "Priority", "Status", "Action"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
              </tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-[var(--text-secondary)]">{t.entityName || "—"}</p>
                      <p className="text-[9px] text-[var(--text-tertiary)]">{t.clientName || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{t.title}</td>
                    <td className="px-4 py-3 text-[10px] text-[var(--text-tertiary)] uppercase">{t.category}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{new Date(t.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-semibold" style={{ color: prColor(t.priority) }}>{t.priority}</span></td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-[11px]">{statusIcon(t.status)} {t.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3">
                      {t.status !== "COMPLETED" && (
                        <button onClick={() => updateStatus(t.id, t.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED")}
                          className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors">
                          {t.status === "PENDING" ? "Start" : "Complete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
