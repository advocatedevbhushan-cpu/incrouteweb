import React from "react";
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const items = [
  { task: "GSTR-1 (June 2026)", due: "Jul 11, 2026", priority: "High", status: "Critical", entity: "ABC Pvt Ltd", assignee: "Tax Team" },
  { task: "MGT-7 Annual Return", due: "Jul 28, 2026", priority: "Medium", status: "Pending", entity: "ABC Pvt Ltd", assignee: "CA Mehra" },
  { task: "AOC-4 Financial Statements", due: "Aug 12, 2026", priority: "Medium", status: "Upcoming", entity: "ABC Pvt Ltd", assignee: "CA Mehra" },
  { task: "DIR-3 KYC", due: "Sep 30, 2026", priority: "Low", status: "Upcoming", entity: "ABC Pvt Ltd", assignee: "CS Priya" },
  { task: "GSTR-3B (July 2026)", due: "Aug 20, 2026", priority: "High", status: "Upcoming", entity: "XYZ LLP", assignee: "Tax Team" },
  { task: "LLP Form 8", due: "Oct 30, 2026", priority: "Medium", status: "Upcoming", entity: "XYZ LLP", assignee: "CA Mehra" },
  { task: "Trademark Renewal Class 42", due: "Oct 15, 2026", priority: "Medium", status: "Upcoming", entity: "ABC Pvt Ltd", assignee: "IP Team" },
  { task: "Board Meeting Q3", due: "Aug 30, 2026", priority: "Low", status: "Upcoming", entity: "ABC Pvt Ltd", assignee: "CS Priya" },
];

const statusIcon = (s: string) => s === "Critical" ? <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" /> : s === "Pending" ? <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />;

export default function Compliance() {
  if (items.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Calendar</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No upcoming filings</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><CalendarCheck className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No compliance tasks</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">When you have upcoming filings and deadlines, they'll appear here.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Compliance Calendar</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} upcoming filings and deadlines</p>
        </div>
        <div className="flex gap-2">
          {["All", "Critical", "Pending", "Upcoming"].map(f => (
            <button key={f} className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer">{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {["Task", "Entity", "Due Date", "Priority", "Status", "Assignee"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[var(--text-primary)]">{item.task}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{item.entity}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{item.due}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.priority === "High" ? "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]" : "bg-[var(--accent-soft)] text-[var(--text-tertiary)]"}`}>{item.priority}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[12px]">{statusIcon(item.status)} {item.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-tertiary)]">{item.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
