import React from "react";
import { Building2, FileText, CalendarCheck, Clock, Shield, TrendingUp, CheckCircle2, AlertTriangle, Phone, Mail, MessageSquare } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Good Morning, Rohit</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">ABC Private Limited · <span className="text-[var(--success)] font-medium">96% Compliant</span></p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold">Compliance: Healthy</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Entities Managed", value: "3", icon: Building2, delta: "+1 this quarter", screen: "entities" },
          { label: "Upcoming Filings", value: "5", icon: CalendarCheck, delta: "2 due this week", screen: "compliance" },
          { label: "Documents Available", value: "47", icon: FileText, delta: "+3 new", screen: "documents" },
          { label: "Open Requests", value: "2", icon: Clock, delta: "1 pending response", screen: "support" },
        ].map((m, i) => (
          <button key={i} onClick={() => (window as any).__portalNav?.(m.screen)} aria-label={`${m.label}: ${m.value}`} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3 text-left hover:border-[var(--accent)] transition-colors cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{m.label}</span>
              <m.icon className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none">{m.value}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{m.delta}</p>
          </button>
        ))}
      </div>

      {/* Upcoming Compliance + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Compliance */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Upcoming Compliance</h3>
            <span className="text-[11px] text-[var(--accent)] font-medium cursor-pointer">View All</span>
          </div>
          <div className="space-y-3">
            {[
              { task: "MGT-7 Annual Return", due: "Jul 28, 2026", status: "pending", assignee: "CA Mehra" },
              { task: "AOC-4 Financial Statements", due: "Aug 12, 2026", status: "upcoming", assignee: "CA Mehra" },
              { task: "GSTR-1 (June)", due: "Jul 11, 2026", status: "critical", assignee: "Tax Team" },
              { task: "DIR-3 KYC", due: "Sep 30, 2026", status: "upcoming", assignee: "CS Priya" },
              { task: "Trademark Renewal - Class 42", due: "Oct 15, 2026", status: "upcoming", assignee: "IP Team" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "critical" ? "bg-[var(--warning)]" : item.status === "pending" ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`} />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.task}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{item.assignee}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--text-secondary)]">{item.due}</p>
                  <span className={`text-[10px] font-semibold uppercase ${item.status === "critical" ? "text-[var(--warning)]" : item.status === "pending" ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Health */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Compliance Health</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-[120px] h-[120px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--success)" strokeWidth="3" strokeDasharray="84.8 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">96%</span>
                <span className="text-[9px] text-[var(--text-tertiary)]">Healthy</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 w-full text-center">
              {[
                { label: "Completed", value: "12", color: "var(--success)" },
                { label: "Pending", value: "3", color: "var(--accent)" },
                { label: "Critical", value: "1", color: "var(--warning)" },
                { label: "Upcoming", value: "5", color: "var(--text-tertiary)" },
              ].map((s, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-[18px] font-bold text-[var(--text-primary)]">{s.value}</p>
                  <p className="text-[10px] font-medium" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities + Relationship Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: "GST Return (GSTR-3B) filed for May 2026", time: "2 hours ago", icon: CheckCircle2, color: "var(--success)" },
              { text: "Trademark application submitted — Class 9", time: "Yesterday", icon: Shield, color: "var(--accent)" },
              { text: "Board Resolution uploaded — Q2 FY26", time: "2 days ago", icon: FileText, color: "var(--accent)" },
              { text: "Legal consultation completed — NDA Review", time: "3 days ago", icon: TrendingUp, color: "var(--text-tertiary)" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${a.color} 12%, transparent)` }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[var(--text-primary)] leading-snug">{a.text}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Manager */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Your Advisor</h3>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-lg font-bold">A</div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">Aakash Mehra</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">Senior Compliance Advisor</p>
            </div>
            <div className="w-full space-y-2 pt-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer hover:bg-[var(--accent-deep)] transition-colors">
                <Phone className="w-3.5 h-3.5" /> Schedule Call
              </button>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-medium rounded-xl cursor-pointer hover:bg-[var(--accent-soft)] transition-colors">
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-medium rounded-xl cursor-pointer hover:bg-[var(--accent-soft)] transition-colors">
                  <MessageSquare className="w-3 h-3" /> Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
