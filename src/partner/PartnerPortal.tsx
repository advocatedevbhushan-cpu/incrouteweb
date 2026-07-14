import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";
import TimesheetWorkspace from "../components/TimesheetWorkspace";

const authHeaders = () => {
  const token = localStorage.getItem("incroute_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...opts?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function Loading() {
  return <div className="flex min-h-[45vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" /></div>;
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[12px] text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "COMPLETED" || status === "APPROVED" || status === "ACTIVE"
      ? "var(--success)"
      : status === "OVERDUE" || status === "REJECTED" || status === "BLOCKED"
        ? "#EF4444"
        : status === "PENDING" || status === "PENDING_DOCUMENTS"
          ? "var(--warning)"
          : "var(--accent)";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, onClick }: { label: string; value: string | number; icon: any; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-left transition-colors hover:border-[var(--accent)]">
      <Icon className="mb-2 h-4 w-4 text-[var(--accent)]" />
      <p className="text-[24px] font-extrabold leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
    </button>
  );
}

function Dashboard({ setScreen }: { setScreen: (screen: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/partner/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load partner dashboard" description={error} />;

  const stats = data?.stats || {};
  const clients = data?.clients || [];
  const tasks = data?.upcomingCompliance || [];
  const docs = data?.documentsForReview || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Partner Workspace</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">Assigned clients, documents, and compliance work in one place.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Assigned Clients" value={stats.clients || 0} icon={Users} onClick={() => setScreen("clients")} />
        <StatCard label="Open Services" value={stats.openServices || 0} icon={Building2} onClick={() => setScreen("clients")} />
        <StatCard label="Documents To Review" value={stats.documentsForReview || 0} icon={FileText} onClick={() => setScreen("documents")} />
        <StatCard label="Upcoming Compliance" value={stats.upcomingCompliance || 0} icon={CalendarCheck} onClick={() => setScreen("compliance")} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Priority Clients</h2>
            <button onClick={() => setScreen("clients")} className="text-[11px] font-semibold text-[var(--accent)]">View all</button>
          </div>
          {clients.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[var(--text-tertiary)]">No clients assigned yet.</p>
          ) : clients.slice(0, 5).map((client: any) => (
            <div key={client.id} className="flex items-center justify-between border-b border-[var(--border-subtle)] py-3 last:border-0">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">{client.companyName}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{client.contactName} · {client.contactEmail}</p>
              </div>
              <StatusBadge status={client.status} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Documents Needing Review</h2>
            <button onClick={() => setScreen("documents")} className="text-[11px] font-semibold text-[var(--accent)]">Review</button>
          </div>
          {docs.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[var(--text-tertiary)]">No pending document reviews.</p>
          ) : docs.slice(0, 5).map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between border-b border-[var(--border-subtle)] py-3 last:border-0">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{doc.title}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{doc.clientName} · {doc.folder || doc.category}</p>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <h2 className="mb-4 text-[15px] font-bold text-[var(--text-primary)]">Upcoming Compliance</h2>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-[var(--text-tertiary)]">No upcoming assigned compliance tasks.</p>
        ) : tasks.slice(0, 6).map((task: any) => (
          <div key={task.id} className="flex items-center justify-between border-b border-[var(--border-subtle)] py-3 last:border-0">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">{task.title}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{task.entityName || "Entity"} · {task.clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-[var(--text-secondary)]">{new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
              <StatusBadge status={task.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api("/api/partner/clients")
      .then((data) => setClients(data.clients || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load clients" description={error} />;

  const filtered = clients.filter((client) => `${client.companyName} ${client.contactName} ${client.contactEmail}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Assigned Clients</h1>
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{clients.length} client assignments</p>
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients..." className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] py-2 pl-8 pr-3 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Users} title="No assigned clients" description="Clients assigned to you by admin will appear here." /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((client) => (
            <div key={client.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--text-primary)]">{client.companyName}</h2>
                  <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{client.contactName} · {client.contactEmail}</p>
                </div>
                <StatusBadge status={client.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[var(--bg-surface-alt)] p-3"><p className="text-[16px] font-bold text-[var(--text-primary)]">{client.entityCount || 0}</p><p className="text-[9px] uppercase text-[var(--text-tertiary)]">Entities</p></div>
                <div className="rounded-xl bg-[var(--bg-surface-alt)] p-3"><p className="text-[16px] font-bold text-[var(--text-primary)]">{client.openServices || 0}</p><p className="text-[9px] uppercase text-[var(--text-tertiary)]">Services</p></div>
                <div className="rounded-xl bg-[var(--bg-surface-alt)] p-3"><p className="text-[16px] font-bold text-[var(--text-primary)]">{client.pendingDocuments || 0}</p><p className="text-[9px] uppercase text-[var(--text-tertiary)]">Docs</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api("/api/partner/documents")
      .then((data) => setDocs(data.documents || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    await api(`/api/partner/documents/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  };

  if (loading) return <Loading />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load documents" description={error} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Document Review</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{docs.length} documents from assigned clients</p>
      </div>
      {docs.length === 0 ? <EmptyState icon={FileText} title="No documents yet" description="Uploaded documents from your assigned clients will appear here." /> : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[var(--border-subtle)]">{["Document", "Client", "Folder", "Status", "Actions"].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{heading}</th>)}</tr></thead>
              <tbody>{docs.map((doc) => (
                <tr key={doc.id} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="px-4 py-3"><p className="text-[12px] font-semibold text-[var(--text-primary)]">{doc.title}</p><p className="text-[9px] text-[var(--text-tertiary)]">{doc.originalName || doc.fileName}</p></td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{doc.clientName}</td>
                  <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{doc.folder || doc.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(doc.id, "APPROVED")} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_12%,transparent)]">Approve</button>
                      <button onClick={() => updateStatus(doc.id, "REJECTED")} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/10">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Compliance() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/partner/compliance")
      .then((data) => setTasks(data.tasks || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load compliance work" description={error} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Compliance Work</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{tasks.length} assigned or client-linked tasks</p>
      </div>
      {tasks.length === 0 ? <EmptyState icon={CalendarCheck} title="No compliance tasks" description="Assigned compliance work will appear here." /> : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[var(--border-subtle)]">{["Task", "Client", "Due", "Priority", "Status"].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{heading}</th>)}</tr></thead>
            <tbody>{tasks.map((task) => (
              <tr key={task.id} className="border-b border-[var(--border-subtle)] last:border-0">
                <td className="px-4 py-3 text-[12px] font-semibold text-[var(--text-primary)]">{task.title}</td>
                <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{task.clientName || task.entityName || "Unassigned"}</td>
                <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="px-4 py-3 text-[11px] font-semibold text-[var(--warning)]">{task.priority}</td>
                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Profile() {
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("incroute_user") || "{}"); } catch { return {}; } })();
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Partner Profile</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">Your team account details.</p>
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="grid gap-3 text-[13px] sm:grid-cols-2">
          <p><span className="text-[var(--text-tertiary)]">Name:</span> <span className="font-semibold text-[var(--text-primary)]">{storedUser.firstName} {storedUser.lastName}</span></p>
          <p><span className="text-[var(--text-tertiary)]">Email:</span> <span className="font-semibold text-[var(--text-primary)]">{storedUser.email}</span></p>
          <p><span className="text-[var(--text-tertiary)]">Role:</span> <span className="font-semibold text-[var(--text-primary)]">{storedUser.role}</span></p>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "compliance", label: "Compliance", icon: CalendarCheck },
  { id: "timesheets", label: "Timesheets", icon: Clock },
  { id: "profile", label: "Profile", icon: Settings },
];

export default function PartnerPortal() {
  const [screen, setScreen] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("incroute_user") || "{}"); } catch { return {}; } })();

  const renderScreen = () => {
    switch (screen) {
      case "clients": return <Clients />;
      case "documents": return <Documents />;
      case "compliance": return <Compliance />;
      case "timesheets": return <TimesheetWorkspace mode="partner" />;
      case "profile": return <Profile />;
      default: return <Dashboard setScreen={setScreen} />;
    }
  };

  const signOut = () => {
    localStorage.removeItem("incroute_access_token");
    localStorage.removeItem("incroute_refresh_token");
    localStorage.removeItem("incroute_user");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed top-0 z-50 flex h-screen flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all lg:sticky lg:z-auto ${collapsed ? "w-[72px]" : "w-[260px]"} ${mobileOpen ? "left-0" : "-left-[260px] lg:left-0"}`}>
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full"><img src="/incroute_logo.png" className="h-full w-full object-cover" alt="INCroute Logo" /></div>
            {!collapsed && <div><p className="text-[15px] font-extrabold text-[var(--text-primary)]">INC<span className="text-[var(--accent)]">route</span></p><p className="text-[8px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Partner Portal</p></div>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-soft)] lg:flex">{collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = screen === item.id;
            return (
              <button key={item.id} onClick={() => { setScreen(item.id); setMobileOpen(false); }} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"} ${collapsed ? "justify-center px-2" : ""}`}>
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border-subtle)] p-4">
          {!collapsed && <div className="mb-3 min-w-0"><p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{storedUser.firstName || "Partner"}</p><p className="truncate text-[10px] text-[var(--text-tertiary)]">{storedUser.email}</p></div>}
          <button onClick={signOut} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium text-red-400 hover:bg-red-500/10 ${collapsed ? "justify-center px-2" : ""}`}>
            <LogOut className="h-4 w-4" /> {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-4 backdrop-blur-sm sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="hidden sm:block"><p className="text-[13px] font-semibold text-[var(--text-primary)]">Assigned Operations</p></div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]"><Clock className="h-3.5 w-3.5" /> Live workspace</div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1300px]">{renderScreen()}</div>
        </main>
      </div>
    </div>
  );
}
