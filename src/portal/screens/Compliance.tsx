import React, { useEffect, useState } from "react";
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";

interface CompTask { id: string; title: string; dueDate: string; priority: string; status: string; entityName: string | null; category: string; assigneeId: string | null; }
const statusIcon = (s: string) => s === "OVERDUE" ? <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" /> : s === "COMPLETED" ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> : <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />;

export default function Compliance() {
  const [items, setItems] = useState<CompTask[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/portal/compliance", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.tasks) setItems(d.tasks); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  if (items.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Calendar</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No upcoming filings</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><CalendarCheck className="w-6 h-6 text-[var(--accent)]" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No compliance tasks</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">When you have upcoming filings and deadlines, they'll appear here.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Calendar</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} upcoming filings and deadlines</p></div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Task", "Entity", "Due Date", "Priority", "Status"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
      <tbody>{items.map(item => (
        <tr key={item.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
          <td className="px-5 py-3.5 text-[13px] font-medium text-[var(--text-primary)]">{item.title}</td>
          <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{item.entityName || "—"}</td>
          <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{new Date(item.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
          <td className="px-5 py-3.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.priority === "HIGH" || item.priority === "CRITICAL" ? "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]" : "bg-[var(--accent-soft)] text-[var(--text-tertiary)]"}`}>{item.priority}</span></td>
          <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-[12px]">{statusIcon(item.status)} {item.status.replace(/_/g, " ")}</span></td>
        </tr>
      ))}</tbody></table></div></div>
    </div>
  );
}
