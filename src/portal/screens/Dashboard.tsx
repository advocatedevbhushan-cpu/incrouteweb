import React, { useEffect, useState } from "react";
import { Building2, FileText, CalendarCheck, Clock, CheckCircle2, Loader2, Phone, Mail, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("incroute_access_token");
        const res = await fetch("/api/portal/dashboard", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await res.json();
        if (d.user) setData(d);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  const user = data?.user;
  const metrics = data?.metrics || { entities: 0, compliance: 0, documents: 0, openTickets: 0 };
  const compliance = data?.recentCompliance || [];
  const activities = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Welcome{user ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Your business at a glance</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Entities Managed", value: String(metrics.entities), icon: Building2, screen: "entities" },
          { label: "Pending Filings", value: String(metrics.compliance), icon: CalendarCheck, screen: "compliance" },
          { label: "Documents", value: String(metrics.documents), icon: FileText, screen: "documents" },
          { label: "Open Requests", value: String(metrics.openTickets), icon: Clock, screen: "support" },
        ].map((m, i) => (
          <button key={i} onClick={() => (window as any).__portalNav?.(m.screen)} aria-label={`${m.label}: ${m.value}`}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3 text-left hover:border-[var(--accent)] transition-colors cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{m.label}</span>
              <m.icon className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none">{m.value}</p>
          </button>
        ))}
      </div>

      {/* Upcoming Compliance */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Upcoming Compliance</h3>
        {compliance.length === 0 ? (
          <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No pending compliance items</p>
        ) : (
          <div className="space-y-3">
            {compliance.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "OVERDUE" ? "bg-[#EF4444]" : item.status === "PENDING" ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`} />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.title}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{item.entityName || ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--text-secondary)]">{new Date(item.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <span className={`text-[10px] font-semibold uppercase ${item.status === "OVERDUE" ? "text-[#EF4444]" : "text-[var(--accent)]"}`}>{item.status.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
        {activities.length === 0 ? (
          <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[var(--text-primary)] leading-snug">{a.title}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{new Date(a.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty state — getting started */}
      {metrics.entities === 0 && metrics.documents === 0 && (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--accent)] rounded-2xl p-8 text-center">
          <Building2 className="w-8 h-8 text-[var(--accent)] mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Welcome to INCroute</h3>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
            Your compliance dashboard will populate as your advisor sets up your entities and filings.
          </p>
        </div>
      )}
    </div>
  );
}
