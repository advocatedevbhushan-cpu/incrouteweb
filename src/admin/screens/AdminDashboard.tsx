import React, { useEffect, useState } from "react";
import { Users, Building2, CalendarCheck, HelpCircle, Receipt, TrendingUp, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface DashboardStats {
  clients: number;
  entities: number;
  complianceTasks: number;
  openTickets: number;
  pendingInvoices: number;
  teamMembers: number;
  activeTasks: number;
}

interface OverdueItem {
  id: string;
  title: string;
  dueDate: string;
  assigneeId: string | null;
  entityName: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  details: string | null;
  createdAt: string;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdue, setOverdue] = useState<OverdueItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        setOverdue(data.overdueCompliance || []);
        setActivity(data.recentActivity || []);
      } else {
        setError(data.error || "Failed to load");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(1)}K`;
    return `₹${amt}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">{error}</p>
        <button onClick={fetchStats} className="mt-3 text-[12px] text-[var(--accent)] underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const metrics = [
    { label: "Total Clients", value: String(stats?.clients || 0), icon: Users, screen: "clients" },
    { label: "Active Entities", value: String(stats?.entities || 0), icon: Building2, screen: "clients" },
    { label: "Compliance Tasks", value: String(stats?.complianceTasks || 0), icon: CalendarCheck, screen: "compliance" },
    { label: "Open Tickets", value: String(stats?.openTickets || 0), icon: HelpCircle, screen: "tickets" },
    { label: "Pending Invoices", value: formatCurrency(stats?.pendingInvoices || 0), icon: Receipt, screen: "invoices" },
    { label: "Team Members", value: String(stats?.teamMembers || 0), icon: Users, screen: "team" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Operations Dashboard</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Overview of all platform activity</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
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
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)] font-semibold">
              {overdue.length} overdue
            </span>
          </div>
          {overdue.length === 0 ? (
            <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No overdue items — great job!</p>
          ) : (
            overdue.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />
                  <div>
                    <p className="text-[12px] font-medium text-[var(--text-primary)]">{item.title}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{item.entityName || "Unassigned"}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--warning)]">
                  {new Date(item.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No activity yet. Start adding clients and tasks.</p>
          ) : (
            <div className="space-y-2.5">
              {activity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                    <Clock className="w-3 h-3 text-[var(--accent)]" />
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] flex-1">{a.title}</p>
                  <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state CTA */}
      {(stats?.clients === 0) && (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--accent)] rounded-2xl p-8 text-center">
          <Building2 className="w-8 h-8 text-[var(--accent)] mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Get Started</h3>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
            Add your first client to start managing their compliance, documents, and tasks.
          </p>
          <button onClick={() => onNavigate("clients")} className="mt-4 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors">
            Add First Client
          </button>
        </div>
      )}
    </div>
  );
}
