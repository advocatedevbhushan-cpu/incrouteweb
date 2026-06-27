import React, { useEffect, useState } from "react";
import { Building2, FileText, CalendarCheck, Clock, CheckCircle2, Loader2, Shield, TrendingUp, ChevronRight } from "lucide-react";

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
  const entities = data?.entities || [];

  // Calculate compliance health
  const totalCompliance = compliance.length;
  const completedCompliance = compliance.filter((c: any) => c.status === "COMPLETED").length;
  const complianceHealth = totalCompliance > 0 ? Math.round((completedCompliance / totalCompliance) * 100) : 100;

  // Entity status breakdown
  const activeEntities = entities.filter((e: any) => e.status === "ACTIVE" || e.status === "REGISTERED").length;
  const pendingEntities = entities.filter((e: any) => e.status === "PENDING" || e.status === "IN_PROGRESS").length;
  const dormantEntities = entities.filter((e: any) => e.status === "DORMANT" || e.status === "INACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Business Command Center
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Manage compliance, documents & growth from one platform.
        </p>
      </div>

      {/* Summary Stat Cards — like the screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => (window as any).__portalNav?.("entities")}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-left hover:border-[var(--accent)] transition-all cursor-pointer group">
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Incorporation</p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2 tracking-tight">{metrics.entities}/{metrics.entities || 0}</p>
          <p className="text-[11px] font-semibold text-[var(--success)] mt-1">Completed</p>
        </button>
        <button onClick={() => (window as any).__portalNav?.("compliance")}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-left hover:border-[var(--accent)] transition-all cursor-pointer group">
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ROC Compliance</p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2 tracking-tight">{metrics.compliance}</p>
          <p className="text-[11px] font-semibold text-[var(--accent)] mt-1">Upcoming</p>
        </button>
        <button onClick={() => (window as any).__portalNav?.("tax")}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-left hover:border-[var(--accent)] transition-all cursor-pointer group">
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">GST Filings</p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2 tracking-tight">{metrics.documents}</p>
          <p className="text-[11px] font-semibold text-[var(--warning)] mt-1">Due This Month</p>
        </button>
        <button onClick={() => (window as any).__portalNav?.("trademark")}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-left hover:border-[var(--accent)] transition-all cursor-pointer group">
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Trademarks</p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2 tracking-tight">{metrics.openTickets || 0}</p>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mt-1">Active</p>
        </button>
      </div>

      {/* Two-column layout: Upcoming Compliance + Entity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Compliance */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Upcoming Compliance</h3>
            <button onClick={() => (window as any).__portalNav?.("compliance")} className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {compliance.length === 0 ? (
            <p className="text-[12px] text-[var(--text-tertiary)] py-6 text-center">No pending compliance items ✓</p>
          ) : (
            <div className="space-y-0">
              {compliance.slice(0, 5).map((item: any, i: number) => {
                const dueDate = new Date(item.dueDate);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const dueLabel = daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `Due in ${daysLeft} days`;
                const dueColor = daysLeft < 0 ? "text-[#EF4444]" : daysLeft <= 7 ? "text-[var(--warning)]" : "text-[var(--accent)]";
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.title}</p>
                    <p className={`text-[11px] font-semibold ${dueColor}`}>{dueLabel}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Entity Overview */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Entity Overview</h3>
            <button onClick={() => (window as any).__portalNav?.("entities")} className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            {/* Donut chart placeholder */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent)" strokeWidth="12"
                  strokeDasharray={`${(activeEntities / Math.max(metrics.entities, 1)) * 238} 238`}
                  strokeLinecap="round" />
                {pendingEntities > 0 && (
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--gradient-end)" strokeWidth="12"
                    strokeDasharray={`${(pendingEntities / Math.max(metrics.entities, 1)) * 238} 238`}
                    strokeDashoffset={`-${(activeEntities / Math.max(metrics.entities, 1)) * 238}`}
                    strokeLinecap="round" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[18px] font-extrabold text-[var(--text-primary)]">{metrics.entities}</span>
                <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wider">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span className="text-[12px] text-[var(--text-secondary)]">Active</span>
                <span className="text-[12px] font-bold text-[var(--text-primary)] ml-auto">{activeEntities}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--gradient-end)]" />
                <span className="text-[12px] text-[var(--text-secondary)]">Upcoming</span>
                <span className="text-[12px] font-bold text-[var(--text-primary)] ml-auto">{pendingEntities}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-subtle)]" />
                <span className="text-[12px] text-[var(--text-secondary)]">Dormant</span>
                <span className="text-[12px] font-bold text-[var(--text-primary)] ml-auto">{dormantEntities}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Health Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Your Compliance Health</h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              {complianceHealth >= 90 ? "Everything looks good. Keep it up!" : complianceHealth >= 70 ? "A few items need attention." : "Action required on multiple filings."}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-extrabold tracking-tight ${complianceHealth >= 90 ? "text-[var(--success)]" : complianceHealth >= 70 ? "text-[var(--warning)]" : "text-[#EF4444]"}`}>
              {complianceHealth}%
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">Compliant</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${complianceHealth >= 90 ? "bg-[var(--success)]" : complianceHealth >= 70 ? "bg-[var(--warning)]" : "bg-[#EF4444]"}`}
            style={{ width: `${complianceHealth}%` }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.slice(0, 5).map((a: any, i: number) => (
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
        </div>
      )}

      {/* Empty state — new users */}
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
