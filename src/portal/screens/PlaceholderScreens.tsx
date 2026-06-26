import React from "react";
import { Scale, Shield, Database, Users, Receipt, HelpCircle, Bell, Settings, Plus, Download, ChevronRight, Clock, CheckCircle2, AlertTriangle, Phone, FileText, FolderOpen, Building2 } from "lucide-react";

/* ─── EMPTY STATE ─── */
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<any>; title: string; description: string; action?: { label: string; onClick?: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">{description}</p>
      {action && (
        <button onClick={action.onClick} className="mt-5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />{action.label}
        </button>
      )}
    </div>
  );
}

/* ─── LEGAL MATTERS ─── */
export function Legal() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Legal Matters" subtitle="0 active matters" />
      <EmptyState icon={Scale} title="No legal matters" description="When your admin assigns legal cases or consultations, they'll appear here." action={{ label: "Request Consultation" }} />
    </div>
  );
}

/* ─── TRADEMARK TRACKING ─── */
export function Trademark() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Trademark Tracking" subtitle="0 applications" />
      <EmptyState icon={Shield} title="No trademarks tracked" description="When you file trademarks through INCroute, track their progress here." action={{ label: "Start Trademark" }} />
    </div>
  );
}

/* ─── TAX & GST ─── */
export function TaxGST() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Tax & GST" subtitle="GST registrations, returns and tax filings" />
      <EmptyState icon={Database} title="No tax filings yet" description="Your GST returns, ITR filings, and tax liabilities will appear here once assigned by your admin." />
    </div>
  );
}

/* ─── CONSULTATIONS ─── */
export function Consultations() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Consultations" subtitle="No sessions scheduled" action={<ActionBtn label="Book Consultation" />} />
      <EmptyState icon={Users} title="No consultations yet" description="Schedule your first advisory session with our compliance and legal experts." action={{ label: "Book First Session" }} />
    </div>
  );
}

/* ─── INVOICES ─── */
export function Invoices() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Invoices" subtitle="No invoices" />
      <EmptyState icon={Receipt} title="No invoices yet" description="Your billing history and pending payments will appear here." />
    </div>
  );
}

/* ─── SUPPORT ─── */
export function Support() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Support Center" subtitle="No tickets" action={<ActionBtn label="Create Ticket" />} />
      <EmptyState icon={HelpCircle} title="No open tickets" description="All clear! When you need help, create a support ticket here." action={{ label: "Create Ticket" }} />
    </div>
  );
}

/* ─── NOTIFICATIONS ─── */
export function Notifications() {
  return (
    <div className="space-y-6">
      <ScreenHeader title="Notifications" subtitle="No notifications" />
      <EmptyState icon={Bell} title="You're all caught up" description="When there are updates to your compliance, documents or account, they'll show here." />
    </div>
  );
}

/* ─── PROFILE & SETTINGS ─── */
export function ProfileSettings() {
  const [profile, setProfile] = React.useState<any>(null);
  const [pwForm, setPwForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = React.useState("");
  const [pwLoading, setPwLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("incroute_access_token");
        const res = await fetch("/api/portal/profile", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await res.json();
        if (d.user) setProfile(d);
      } catch {}
    })();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg("Passwords do not match"); return; }
    if (pwForm.newPassword.length < 8) { setPwMsg("Password must be at least 8 characters"); return; }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (data.success) { setPwMsg("✓ Password updated successfully"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
      else { setPwMsg(data.error || "Failed to change password"); }
    } catch { setPwMsg("Network error"); }
    finally { setPwLoading(false); }
  };

  const user = profile?.user;
  const client = profile?.client;

  return (
    <div className="space-y-6">
      <ScreenHeader title="Profile & Settings" subtitle="Manage your account and preferences" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SettingsCard title="Profile Information">
          <FieldRow label="Full Name" value={user ? `${user.firstName} ${user.lastName}` : "—"} />
          <FieldRow label="Email" value={user?.email || "—"} />
          <FieldRow label="Phone" value={user?.phone || "—"} />
          <FieldRow label="Role" value={user?.role?.replace(/_/g, " ") || "—"} />
        </SettingsCard>
        <SettingsCard title="Company Information">
          <FieldRow label="Company" value={client?.companyName || "Not linked"} />
          <FieldRow label="Industry" value={client?.industry || "—"} />
          <FieldRow label="Status" value={client?.status || "—"} />
        </SettingsCard>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input type="password" placeholder="Current Password" required value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            <input type="password" placeholder="New Password (min 8 chars)" required value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            <input type="password" placeholder="Confirm New Password" required value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
            {pwMsg && <p className={`text-[12px] ${pwMsg.startsWith("✓") ? "text-[var(--success)]" : "text-[#EF4444]"}`}>{pwMsg}</p>}
            <button type="submit" disabled={pwLoading} className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors">
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
        <SettingsCard title="Account">
          <FieldRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"} />
          <FieldRow label="Last Login" value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
        </SettingsCard>
      </div>
    </div>
  );
}

/* ─── SHARED COMPONENTS ─── */
function ScreenHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{title}</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ActionBtn({ label }: { label: string }) {
  return <button className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />{label}</button>;
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4">
      <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
      <p className="text-[16px] font-bold text-[var(--text-primary)] mt-1">{value}</p>
    </div>
  );
}

function TableCard({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--border-subtle)]">{headers.map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">{row.map((cell, j) => <td key={j} className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const color = s === "Filed" || s === "Paid" || s === "Completed" || s === "Registered" || s === "Certificate Issued" ? "var(--success)" : s === "Critical" || s === "Due Soon" || s === "High" ? "var(--warning)" : s === "Open" || s === "In Progress" || s === "Pending" || s === "Under Examination" || s === "Hearing Scheduled" ? "var(--accent)" : "var(--text-tertiary)";
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />{s}</span>;
}

function PriorityPill({ p }: { p: string }) {
  const color = p === "High" ? "var(--warning)" : p === "Medium" ? "var(--accent)" : "var(--text-tertiary)";
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>{p}</span>;
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[12px] text-[var(--text-tertiary)]">{label}</span>
      <span className="text-[12px] font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
