import React from "react";
import { CheckSquare, Plus, Clock, AlertTriangle } from "lucide-react";

const tasks = [
  { id: "1", title: "Prepare AOC-4 for ABC Pvt Ltd", client: "ABC Private Limited", assignee: "CA Mehra", priority: "High", status: "In Progress", due: "Jul 28" },
  { id: "2", title: "Draft NDA for Verma Ventures", client: "Verma Ventures", assignee: "Adv. Sharma", priority: "Medium", status: "Pending", due: "Jul 5" },
  { id: "3", title: "File TDS Return Q1", client: "XYZ LLP", assignee: "Tax Team", priority: "High", status: "Under Review", due: "Jul 15" },
  { id: "4", title: "Trademark hearing prep — Class 9", client: "ABC Private Limited", assignee: "IP Team", priority: "Critical", status: "In Progress", due: "Jul 3" },
  { id: "5", title: "Upload incorporation docs — TechStart", client: "TechStart OPC", assignee: "CS Priya", priority: "Low", status: "Completed", due: "Jun 28" },
];

export default function TaskManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Task Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Internal operations tasks</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> Create Task</button>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Task", "Client", "Assignee", "Priority", "Status", "Due"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{tasks.map(t => (<tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
          <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)]">{t.title}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-secondary)]">{t.client}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{t.assignee}</td>
          <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: t.priority === "Critical" ? "#EF4444" : t.priority === "High" ? "var(--warning)" : "var(--accent)" }}>{t.priority}</span></td>
          <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: t.status === "Completed" ? "var(--success)" : t.status === "In Progress" ? "var(--accent)" : "var(--text-tertiary)" }}>{t.status}</span></td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{t.due}</td>
        </tr>))}</tbody></table></div>
      </div>
    </div>
  );
}
