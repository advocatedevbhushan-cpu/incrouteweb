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
  const matters = [
    { name: "NDA Review — Vendor Agreement", type: "Contract Review", status: "In Progress", lawyer: "Adv. Sharma", updated: "Jun 19, 2026", priority: "Medium" },
    { name: "Trademark Opposition — Class 9", type: "IP Dispute", status: "Hearing Scheduled", lawyer: "Adv. Kapoor", updated: "Jun 15, 2026", priority: "High" },
    { name: "Employment Contract Drafting", type: "Drafting", status: "Completed", lawyer: "Adv. Sharma", updated: "Jun 10, 2026", priority: "Low" },
    { name: "NCLT Compliance Matter", type: "Regulatory", status: "Under Review", lawyer: "Adv. Mehta", updated: "Jun 5, 2026", priority: "High" },
  ];
  if (matters.length === 0) return (<div className="space-y-6"><ScreenHeader title="Legal Matters" subtitle="0 active matters" /><EmptyState icon={Scale} title="No legal matters" description="When you have active legal cases or consultations, they'll appear here." action={{ label: "Start Consultation" }} /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Legal Matters" subtitle={`${matters.length} active matters`} />
      <TableCard headers={["Case Name", "Type", "Assigned Lawyer", "Status", "Priority", "Last Update"]} rows={matters.map(m => [m.name, m.type, m.lawyer, <StatusPill key={m.name} s={m.status} />, <PriorityPill key={m.name+"p"} p={m.priority} />, m.updated])} />
    </div>
  );
}

/* ─── TRADEMARK TRACKING ─── */
export function Trademark() {
  const trademarks = [
    { name: "INCroute", appNo: "TM-2024-98765", classN: "42", status: "Registered", stage: "Certificate Issued", next: "Renewal in 2034" },
    { name: "INCroute Logo", appNo: "TM-2025-12345", classN: "9", status: "Under Examination", stage: "Objection Reply Filed", next: "Await hearing date" },
    { name: "CorpShield", appNo: "TM-2026-55678", classN: "36", status: "Application Filed", stage: "Vienna Code Allotted", next: "Examination pending" },
  ];
  if (trademarks.length === 0) return (<div className="space-y-6"><ScreenHeader title="Trademark Tracking" subtitle="0 applications" /><EmptyState icon={Shield} title="No trademarks tracked" description="When you file trademarks through INCroute, track their progress here." action={{ label: "Start Trademark" }} /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Trademark Tracking" subtitle={`${trademarks.length} trademark applications`} />
      <TableCard headers={["Trademark", "App No.", "Class", "Status", "Current Stage", "Next Action"]} rows={trademarks.map(t => [t.name, t.appNo, t.classN, <StatusPill key={t.appNo} s={t.status} />, t.stage, t.next])} />
    </div>
  );
}

/* ─── TAX & GST ─── */
export function TaxGST() {
  const filings = [
    { name: "GSTR-1 (June 2026)", due: "Jul 11, 2026", status: "Due Soon", amount: "₹12,450" },
    { name: "GSTR-3B (June 2026)", due: "Jul 20, 2026", status: "Upcoming", amount: "₹18,200" },
    { name: "GSTR-1 (May 2026)", due: "Jun 11, 2026", status: "Filed", amount: "₹11,800" },
    { name: "GSTR-3B (May 2026)", due: "Jun 20, 2026", status: "Filed", amount: "₹16,900" },
    { name: "ITR FY25-26", due: "Sep 30, 2026", status: "Upcoming", amount: "—" },
  ];
  return (
    <div className="space-y-6">
      <ScreenHeader title="Tax & GST" subtitle="GST registrations, returns and tax filings" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricBox label="GSTIN" value="29AABCU9603R1ZM" />
        <MetricBox label="Filing Status" value="Up to Date" />
        <MetricBox label="Pending Returns" value="2" />
      </div>
      <TableCard headers={["Filing", "Due Date", "Status", "Tax Liability"]} rows={filings.map(f => [f.name, f.due, <StatusPill key={f.name} s={f.status} />, f.amount])} />
    </div>
  );
}

/* ─── CONSULTATIONS ─── */
export function Consultations() {
  const meetings = [
    { topic: "Annual Compliance Planning FY27", date: "Jul 5, 2026 · 3:00 PM", advisor: "CA Mehra", status: "Upcoming" },
    { topic: "Trademark Strategy Review", date: "Jun 28, 2026 · 11:00 AM", advisor: "Adv. Kapoor", status: "Completed" },
    { topic: "GST Reconciliation Walkthrough", date: "Jun 20, 2026 · 2:00 PM", advisor: "Tax Team", status: "Completed" },
  ];
  if (meetings.length === 0) return (<div className="space-y-6"><ScreenHeader title="Consultations" subtitle="No sessions scheduled" action={<ActionBtn label="Book Consultation" />} /><EmptyState icon={Users} title="No consultations yet" description="Schedule your first advisory session with our compliance and legal experts." action={{ label: "Book First Session" }} /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Consultations" subtitle="Schedule, manage and review your advisory sessions" action={<ActionBtn label="Book Consultation" />} />
      <TableCard headers={["Topic", "Date & Time", "Advisor", "Status"]} rows={meetings.map(m => [m.topic, m.date, m.advisor, <StatusPill key={m.topic} s={m.status} />])} />
    </div>
  );
}

/* ─── INVOICES ─── */
export function Invoices() {
  const inv = [
    { no: "INV-2026-042", date: "Jun 15, 2026", amount: "₹14,999", status: "Paid" },
    { no: "INV-2026-041", date: "May 15, 2026", amount: "₹14,999", status: "Paid" },
    { no: "INV-2026-043", date: "Jul 01, 2026", amount: "₹7,499", status: "Pending" },
    { no: "INV-2026-040", date: "Apr 15, 2026", amount: "₹14,999", status: "Paid" },
  ];
  if (inv.length === 0) return (<div className="space-y-6"><ScreenHeader title="Invoices" subtitle="No invoices" /><EmptyState icon={Receipt} title="No invoices yet" description="Your billing history and pending payments will appear here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Invoices" subtitle="Billing history and pending payments" />
      <TableCard headers={["Invoice", "Date", "Amount", "Status", "Action"]} rows={inv.map(i => [i.no, i.date, <span key={i.no} className="font-semibold text-[var(--text-primary)]">{i.amount}</span>, <StatusPill key={i.no+"s"} s={i.status} />, <button key={i.no+"a"} className="text-[11px] text-[var(--accent)] font-medium cursor-pointer">Download</button>])} />
    </div>
  );
}

/* ─── SUPPORT ─── */
export function Support() {
  const tickets = [
    { id: "TKT-1042", subject: "GST Portal Access Issue", priority: "High", status: "Open", assigned: "Support Team" },
    { id: "TKT-1041", subject: "Request updated MOA copy", priority: "Medium", status: "In Progress", assigned: "CS Priya" },
    { id: "TKT-1040", subject: "Trademark hearing clarification", priority: "Low", status: "Closed", assigned: "IP Team" },
  ];
  if (tickets.length === 0) return (<div className="space-y-6"><ScreenHeader title="Support Center" subtitle="No tickets" action={<ActionBtn label="Create Ticket" />} /><EmptyState icon={HelpCircle} title="No open tickets" description="All clear! When you need help, create a support ticket here." action={{ label: "Create Ticket" }} /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Support Center" subtitle="Get help and track your requests" action={<ActionBtn label="Create Ticket" />} />
      <TableCard headers={["Ticket", "Subject", "Priority", "Status", "Assigned"]} rows={tickets.map(t => [t.id, t.subject, <PriorityPill key={t.id} p={t.priority} />, <StatusPill key={t.id+"s"} s={t.status} />, t.assigned])} />
    </div>
  );
}

/* ─── NOTIFICATIONS ─── */
export function Notifications() {
  const notifs = [
    { text: "GSTR-1 filing deadline in 3 days", time: "1 hour ago", type: "warning" },
    { text: "New document uploaded: Board Resolution Q2", time: "5 hours ago", type: "info" },
    { text: "Trademark application status updated", time: "Yesterday", type: "info" },
    { text: "Invoice INV-2026-043 generated", time: "2 days ago", type: "info" },
    { text: "DIR-3 KYC reminder — due Sep 30", time: "3 days ago", type: "warning" },
  ];
  if (notifs.length === 0) return (<div className="space-y-6"><ScreenHeader title="Notifications" subtitle="No notifications" /><EmptyState icon={Bell} title="You're all caught up" description="When there are updates to your compliance, documents or account, they'll show here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Notifications" subtitle="Stay updated on your business activity" />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
        {notifs.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "warning" ? "bg-[var(--warning)]" : "bg-[var(--accent)]"}`} />
            <div>
              <p className="text-[13px] text-[var(--text-primary)]">{n.text}</p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
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
