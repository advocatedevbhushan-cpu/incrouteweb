import React, { useState, useEffect } from "react";
import { Scale, Shield, Database, Users, Receipt, HelpCircle, Bell, Settings, Plus, Download, ChevronRight, Clock, CheckCircle2, AlertTriangle, Phone, FileText, FolderOpen, Building2, X, Loader2, Send, Calendar } from "lucide-react";

const authHeaders = () => { const t = localStorage.getItem("incroute_access_token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

/* ─── SHARED COMPONENTS ─── */
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<any>; title: string; description: string; action?: { label: string; onClick?: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--accent)]" />
      </div>
      <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">{description}</p>
      {action && (
        <button onClick={action.onClick} className="mt-5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />{action.label}
        </button>
      )}
    </div>
  );
}

function ScreenHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div><h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">{title}</h1><p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p></div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "bg-green-500/10 text-green-500", COMPLETED: "bg-green-500/10 text-green-500", REGISTERED: "bg-green-500/10 text-green-500", CLOSED: "bg-gray-500/10 text-gray-400", RESOLVED: "bg-green-500/10 text-green-500",
    PENDING: "bg-yellow-500/10 text-yellow-600", OPEN: "bg-blue-500/10 text-blue-500", SCHEDULED: "bg-blue-500/10 text-blue-500", FILED: "bg-blue-500/10 text-blue-500",
    OVERDUE: "bg-red-500/10 text-red-400", IN_PROGRESS: "bg-purple-500/10 text-purple-500", UNDER_EXAMINATION: "bg-orange-500/10 text-orange-500",
  };
  return <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${colors[status] || "bg-gray-500/10 text-gray-400"}`}>{status.replace(/_/g, " ")}</span>;
}

/* ─── INVOICES (real API) ─── */
export function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/invoices", { headers: authHeaders() }); const d = await r.json(); if (d.invoices) setInvoices(d.invoices); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  if (invoices.length === 0) return (<div className="space-y-6"><ScreenHeader title="Invoices" subtitle="No invoices" /><EmptyState icon={Receipt} title="No invoices yet" description="Your billing history and pending payments will appear here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Invoices" subtitle={`${invoices.length} invoice(s)`} />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]"><th className="px-5 py-3 text-left">Invoice</th><th className="px-5 py-3 text-left">Amount</th><th className="px-5 py-3 text-left">Due Date</th><th className="px-5 py-3 text-left">Status</th></tr></thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {invoices.map(inv => (<tr key={inv.id} className="hover:bg-[var(--accent-soft)] transition-colors"><td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">{inv.invoiceNo}</td><td className="px-5 py-3.5 font-semibold text-[var(--text-primary)]">₹{Number(inv.total).toLocaleString("en-IN")}</td><td className="px-5 py-3.5 text-[var(--text-secondary)]">{new Date(inv.dueDate).toLocaleDateString("en-IN",{month:"short",day:"numeric",year:"numeric"})}</td><td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── SUPPORT / TICKETS (real API + create ticket) ─── */
export function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "MEDIUM" });
  const [saving, setSaving] = useState(false);

  const fetchTickets = async () => { try { const r = await fetch("/api/portal/tickets", { headers: authHeaders() }); const d = await r.json(); if (d.tickets) setTickets(d.tickets); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.subject) return; setSaving(true);
    try { await fetch("/api/portal/tickets/create", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(form) }); setShowCreate(false); setForm({ subject: "", description: "", priority: "MEDIUM" }); fetchTickets(); } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  return (
    <div className="space-y-6">
      <ScreenHeader title="Support Center" subtitle={`${tickets.length} ticket(s)`} action={<button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Create Ticket</button>} />
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-[14px] font-bold text-[var(--text-primary)]">New Support Ticket</h3><button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          <textarea placeholder="Describe your issue..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none" />
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-50"><Send className="w-3.5 h-3.5 inline mr-1.5" />{saving ? "Submitting..." : "Submit Ticket"}</button>
        </form>
      )}
      {tickets.length === 0 && !showCreate ? <EmptyState icon={HelpCircle} title="No open tickets" description="All clear! When you need help, create a support ticket." action={{ label: "Create Ticket", onClick: () => setShowCreate(true) }} /> : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
          {tickets.map(t => (<div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--accent-soft)] transition-colors"><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{t.subject}</p><p className="text-[11px] text-[var(--text-tertiary)]">{new Date(t.createdAt).toLocaleDateString("en-IN",{month:"short",day:"numeric"})}</p></div><StatusBadge status={t.status} /></div>))}
        </div>
      )}
    </div>
  );
}

/* ─── CONSULTATIONS (real API + booking) ─── */
export function Consultations() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({ topic: "", scheduledAt: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchConsultations = async () => { try { const r = await fetch("/api/portal/consultations", { headers: authHeaders() }); const d = await r.json(); if (d.consultations) setConsultations(d.consultations); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchConsultations(); }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.topic || !form.scheduledAt) return; setSaving(true);
    try { await fetch("/api/portal/consultations/book", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(form) }); setShowBook(false); setForm({ topic: "", scheduledAt: "", notes: "" }); fetchConsultations(); } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  return (
    <div className="space-y-6">
      <ScreenHeader title="Consultations" subtitle={`${consultations.length} session(s)`} action={<button onClick={() => setShowBook(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Calendar className="w-3.5 h-3.5" /> Book Session</button>} />
      {showBook && (
        <form onSubmit={handleBook} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-[14px] font-bold text-[var(--text-primary)]">Book Consultation</h3><button type="button" onClick={() => setShowBook(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
          <input placeholder="Topic (e.g., GST Filing Query)" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          <textarea placeholder="Additional notes (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none" />
          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Booking..." : "Confirm Booking"}</button>
        </form>
      )}
      {consultations.length === 0 && !showBook ? <EmptyState icon={Users} title="No consultations yet" description="Book your first advisory session with our experts." action={{ label: "Book Session", onClick: () => setShowBook(true) }} /> : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
          {consultations.map(c => (<div key={c.id} className="flex items-center justify-between px-5 py-4"><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{c.topic}</p><p className="text-[11px] text-[var(--text-tertiary)]">{new Date(c.scheduledAt).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p></div><StatusBadge status={c.status} /></div>))}
        </div>
      )}
    </div>
  );
}

/* ─── LEGAL MATTERS (real API) ─── */
export function Legal() {
  const [matters, setMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/legal-matters", { headers: authHeaders() }); const d = await r.json(); if (d.matters) setMatters(d.matters); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  if (matters.length === 0) return (<div className="space-y-6"><ScreenHeader title="Legal Matters" subtitle="0 active matters" /><EmptyState icon={Scale} title="No legal matters" description="When your admin assigns legal cases, they'll appear here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Legal Matters" subtitle={`${matters.length} matter(s)`} />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
        {matters.map(m => (<div key={m.id} className="flex items-center justify-between px-5 py-4"><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{m.title}</p><p className="text-[11px] text-[var(--text-tertiary)]">{m.type}</p></div><StatusBadge status={m.status} /></div>))}
      </div>
    </div>
  );
}

/* ─── TRADEMARK TRACKING (real API) ─── */
export function Trademark() {
  const [trademarks, setTrademarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/trademarks", { headers: authHeaders() }); const d = await r.json(); if (d.trademarks) setTrademarks(d.trademarks); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  if (trademarks.length === 0) return (<div className="space-y-6"><ScreenHeader title="Trademark Tracking" subtitle="0 applications" /><EmptyState icon={Shield} title="No trademarks" description="When you file trademarks through INCroute, track their progress here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Trademark Tracking" subtitle={`${trademarks.length} application(s)`} />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
        {trademarks.map(t => (<div key={t.id} className="flex items-center justify-between px-5 py-4"><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{t.name}</p><p className="text-[11px] text-[var(--text-tertiary)]">Class {t.classNumber} · {t.applicationNo || "Pending"}</p></div><StatusBadge status={t.status} /></div>))}
      </div>
    </div>
  );
}

/* ─── TAX & GST (real API — uses service requests) ─── */
export function TaxGST() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/tax-filings", { headers: authHeaders() }); const d = await r.json(); setData(d); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  if (!data || (!data.entities?.length && !data.filings?.length)) return (<div className="space-y-6"><ScreenHeader title="Tax & GST" subtitle="Registrations, returns and filings" /><EmptyState icon={Database} title="No tax filings yet" description="Your GST and tax information will appear here once set up by your admin." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Tax & GST" subtitle="Registrations, returns and filings" />
      {data.entities?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.entities.map((e: any) => (<div key={e.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4"><p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">GSTIN</p><p className="text-[14px] font-bold text-[var(--text-primary)] mt-1">{e.gstin || "Not registered"}</p><p className="text-[11px] text-[var(--text-secondary)] mt-1">{e.name}</p></div>))}
        </div>
      )}
    </div>
  );
}

/* ─── NOTIFICATIONS ─── */
export function Notifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/notifications", { headers: authHeaders() }); const d = await r.json(); if (d.notifications) setNotifs(d.notifications); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  if (notifs.length === 0) return (<div className="space-y-6"><ScreenHeader title="Notifications" subtitle="No notifications" /><EmptyState icon={Bell} title="You're all caught up" description="When there are updates to your compliance or account, they'll show here." /></div>);
  return (
    <div className="space-y-6">
      <ScreenHeader title="Notifications" subtitle={`${notifs.length} notification(s)`} />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
        {notifs.map((n, i) => (<div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-[var(--accent-soft)] transition-colors"><div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "warning" ? "bg-[var(--warning)]" : "bg-[var(--accent)]"}`} /><div><p className="text-[13px] text-[var(--text-primary)]">{n.title}</p><p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{new Date(n.createdAt).toLocaleDateString("en-IN",{month:"short",day:"numeric"})}</p></div></div>))}
      </div>
    </div>
  );
}

/* ─── PROFILE & SETTINGS ─── */
export function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => { (async () => { try { const r = await fetch("/api/portal/profile", { headers: authHeaders() }); const d = await r.json(); if (d.user) setProfile(d); } catch {} })(); }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg("Passwords do not match"); return; }
    if (pwForm.newPassword.length < 8) { setPwMsg("Min 8 characters"); return; }
    setPwLoading(true);
    try { const r = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) }); const d = await r.json(); setPwMsg(d.success ? "✓ Password updated" : d.error || "Failed"); if (d.success) setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); } catch { setPwMsg("Network error"); } finally { setPwLoading(false); }
  };

  const user = profile?.user;
  const client = profile?.client;
  return (
    <div className="space-y-6 max-w-2xl">
      <ScreenHeader title="Profile & Settings" subtitle="Manage your account" />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          <div><span className="text-[var(--text-tertiary)]">Name:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user ? `${user.firstName} ${user.lastName}` : "—"}</span></div>
          <div><span className="text-[var(--text-tertiary)]">Email:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user?.email || "—"}</span></div>
          <div><span className="text-[var(--text-tertiary)]">Phone:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user?.phone || "—"}</span></div>
          <div><span className="text-[var(--text-tertiary)]">Company:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{client?.companyName || "—"}</span></div>
        </div>
      </div>
      <form onSubmit={handlePasswordChange} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Change Password</h3>
        {pwMsg && <p className={`text-[12px] ${pwMsg.includes("✓") ? "text-green-500" : "text-red-400"}`}>{pwMsg}</p>}
        <input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        <input type="password" placeholder="New password (min 8 chars)" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        <input type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        <button type="submit" disabled={pwLoading} className="px-5 py-2.5 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{pwLoading ? "Saving..." : "Update Password"}</button>
      </form>
      <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-4 py-2 border border-red-500/30 text-red-400 text-[12px] font-medium rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors">Sign Out & Clear Session</button>
    </div>
  );
}
