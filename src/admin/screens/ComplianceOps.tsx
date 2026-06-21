import React from "react";
import { CalendarCheck, AlertTriangle, Clock, CheckCircle2, Plus } from "lucide-react";

const tasks = [
  { id: "1", entity: "ABC Pvt Ltd", task: "GSTR-3B June", category: "GST", due: "Jul 20, 2026", priority: "High", status: "Pending", assignee: "Tax Team" },
  { id: "2", entity: "ABC Pvt Ltd", task: "MGT-7 Annual Return", category: "ROC", due: "Jul 28, 2026", priority: "Medium", status: "In Progress", assignee: "CA Mehra" },
  { id: "3", entity: "XYZ LLP", task: "LLP Form 8", category: "ROC", due: "Oct 30, 2026", priority: "Medium", status: "Pending", assignee: "CA Mehra" },
  { id: "4", entity: "ABC Pvt Ltd", task: "Board Meeting Q3", category: "Board Meeting", due: "Aug 30, 2026", priority: "Low", status: "Upcoming", assignee: "CS Priya" },
  { id: "5", entity: "TechStart OPC", task: "DIN KYC", category: "DIN KYC", due: "Sep 30, 2026", priority: "Medium", status: "Pending", assignee: "CS Priya" },
  { id: "6", entity: "ABC Pvt Ltd", task: "GSTR-1 July", category: "GST", due: "Aug 11, 2026", priority: "High", status: "Upcoming", assignee: "Tax Team" },
  { id: "7", entity: "GreenLeaf Foundation", task: "12A Renewal", category: "Annual Filing", due: "Jul 15, 2026", priority: "Critical", status: "Overdue", assignee: "CA Mehra" },
];

const statusIcon = (s: string) => s === "Overdue" ? <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" /> : s === "Pending" || s === "In Progress" ? <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> : s === "Completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> : <CalendarCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />;
const prColor = (p: string) => p === "Critical" ? "#EF4444" : p === "High" ? "var(--warning)" : p === "Medium" ? "var(--accent)" : "var(--text-tertiary)";

export default function ComplianceOps() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Operations</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{tasks.length} active compliance tasks across all entities</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> Add Task</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overdue", value: "1", color: "#EF4444" },
          { label: "Pending", value: "3", color: "var(--accent)" },
          { label: "In Progress", value: "1", color: "var(--warning)" },
          { label: "Upcoming", value: "2", color: "var(--text-tertiary)" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[var(--border-subtle)]">
              {["Entity", "Task", "Category", "Due Date", "Priority", "Status", "Assignee"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
            </tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{t.entity}</td>
                  <td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{t.task}</td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-tertiary)] uppercase">{t.category}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{t.due}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${prColor(t.priority)} 12%, transparent)`, color: prColor(t.priority) }}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-[11px]">{statusIcon(t.status)} {t.status}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-tertiary)]">{t.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
