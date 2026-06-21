import React from "react";
import { Users, Building2, CalendarCheck, HelpCircle, Receipt, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Operations Dashboard</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Overview of all platform activity</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Clients", value: "247", icon: Users, screen: "clients" },
          { label: "Active Entities", value: "412", icon: Building2, screen: "clients" },
          { label: "Compliance Tasks", value: "89", icon: CalendarCheck, screen: "compliance" },
          { label: "Open Tickets", value: "14", icon: HelpCircle, screen: "tickets" },
          { label: "Pending Invoices", value: "₹4.2L", icon: Receipt, screen: "invoices" },
          { label: "Team Members", value: "23", icon: Users, screen: "team" },
        ].map((m, i) => (
          <button key={i} onClick={() => onNavigate(m.screen)} aria-label={`${m.label}: ${m.value}`}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 text-left hover:border-[var(--accent)] transition-colors cursor-pointer">
            <m.icon className="w-4 h-4 text-[var(--accent)] mb-2" aria-hidden="true" />
            <p className="text-[20px] font-extrabold text-[var(--text-primary)] leading-none">{m.value}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">{m.label}</p>
          </button>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue Compliance */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Overdue Compliance</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)] font-semibold">7 overdue</span>
          </div>
          {[
            { task: "GSTR-3B — XYZ LLP", due: "Jun 20 (1 day overdue)", assignee: "Tax Team" },
            { task: "DIN KYC — ABC Pvt Ltd", due: "Jun 15 (6 days overdue)", assignee: "CS Priya" },
            { task: "AOC-4 — Verma Ventures", due: "Jun 10 (11 days overdue)", assignee: "CA Mehra" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />
                <div>
                  <p className="text-[12px] font-medium text-[var(--text-primary)]">{item.task}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{item.assignee}</p>
                </div>
              </div>
              <span className="text-[10px] text-[var(--warning)]">{item.due}</span>
            </div>
          ))}
        </div>

        {/* Team Workload */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Team Workload</h3>
          {[
            { name: "CA Mehra", tasks: 18, capacity: 80 },
            { name: "CS Priya", tasks: 12, capacity: 55 },
            { name: "Tax Team", tasks: 24, capacity: 95 },
            { name: "IP Team", tasks: 8, capacity: 35 },
            { name: "Adv. Sharma", tasks: 6, capacity: 25 },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)] shrink-0">{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">{m.name}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{m.tasks} tasks</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)] mt-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.capacity}%`, background: m.capacity > 80 ? "var(--warning)" : "var(--accent)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
        <div className="space-y-2.5">
          {[
            { text: "New client onboarded: Verma Ventures Pvt. Ltd.", time: "10 min ago", icon: Users },
            { text: "GSTR-1 filed for ABC Pvt Ltd — May 2026", time: "1 hour ago", icon: CheckCircle2 },
            { text: "Trademark TM-2026-55678 moved to examination", time: "2 hours ago", icon: Clock },
            { text: "Invoice INV-2026-044 paid by XYZ LLP (₹14,999)", time: "3 hours ago", icon: Receipt },
            { text: "CS Priya completed DIN KYC for 3 entities", time: "5 hours ago", icon: TrendingUp },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0"><a.icon className="w-3 h-3 text-[var(--accent)]" /></div>
              <p className="text-[12px] text-[var(--text-secondary)] flex-1">{a.text}</p>
              <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
