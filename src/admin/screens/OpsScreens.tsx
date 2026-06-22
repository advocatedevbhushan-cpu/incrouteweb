import React, { useEffect, useState } from "react";
import { HelpCircle, Users, Shield, Scale, BarChart3, Clock, Loader2 } from "lucide-react";

const token = () => localStorage.getItem("incroute_access_token");
const headers = () => token() ? { Authorization: `Bearer ${token()}` } : {};
function Loading() { return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>; }
function Empty({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) { return <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center"><Icon className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" /><p className="text-[14px] font-medium text-[var(--text-primary)]">{title}</p><p className="text-[12px] text-[var(--text-tertiary)] mt-1">{desc}</p></div>; }
function Stat({ s }: { s: string }) { const c = ["RESOLVED","COMPLETED","REGISTERED","PAID"].includes(s) ? "var(--success)" : ["OPEN","SCHEDULED","FILED","IN_PROGRESS"].includes(s) ? "var(--accent)" : ["ESCALATED","OVERDUE"].includes(s) ? "var(--warning)" : "var(--text-tertiary)"; return <span className="text-[10px] font-semibold" style={{ color: c }}>{s.replace(/_/g, " ")}</span>; }

export function TicketOps() {
  const [tickets, setTickets] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/tickets", { headers: headers() }).then(r => r.json()).then(d => { if (d.tickets) setTickets(d.tickets); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Support Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{tickets.length} tickets</p></div>
    {tickets.length === 0 ? <Empty icon={HelpCircle} title="No tickets" desc="Support tickets will appear here" /> : <Table headers={["Subject","Client","Priority","Status","Created"]} rows={tickets.map(t => [t.subject, t.clientName||"—", t.priority, <Stat key={t.id} s={t.status} />, new Date(t.createdAt).toLocaleDateString("en-IN",{month:"short",day:"numeric"})])} />}
  </div>);
}

export function ConsultationOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/consultations", { headers: headers() }).then(r => r.json()).then(d => { if (d.consultations) setItems(d.consultations); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Consultation Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} sessions</p></div>
    {items.length === 0 ? <Empty icon={Users} title="No consultations" desc="Scheduled advisory sessions will appear here" /> : <Table headers={["Topic","Client","Date","Duration","Status"]} rows={items.map(c => [c.topic, c.clientName||"—", new Date(c.scheduledAt).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}), `${c.duration} min`, <Stat key={c.id} s={c.status} />])} />}
  </div>);
}

export function TrademarkOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/trademarks", { headers: headers() }).then(r => r.json()).then(d => { if (d.trademarks) setItems(d.trademarks); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Trademark Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} applications</p></div>
    {items.length === 0 ? <Empty icon={Shield} title="No trademarks" desc="Trademark applications will appear here" /> : <Table headers={["Name","Client","App No.","Class","Status","Stage"]} rows={items.map(t => [t.name, t.clientName||"—", t.applicationNo||"—", t.classNumber, <Stat key={t.id} s={t.status} />, t.currentStage||"—"])} />}
  </div>);
}

export function LegalOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/legal-matters", { headers: headers() }).then(r => r.json()).then(d => { if (d.matters) setItems(d.matters); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Legal Matter Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} matters</p></div>
    {items.length === 0 ? <Empty icon={Scale} title="No legal matters" desc="Active legal cases will appear here" /> : <Table headers={["Title","Client","Type","Priority","Status","Deadline"]} rows={items.map(m => [m.title, m.clientName||"—", m.type, m.priority, <Stat key={m.id} s={m.status} />, m.deadline ? new Date(m.deadline).toLocaleDateString("en-IN",{month:"short",day:"numeric"}) : "—"])} />}
  </div>);
}

export function ReportingDashboard() {
  return (<div className="space-y-6">
    <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Reports & Analytics</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Platform performance insights</p></div>
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center py-16">
      <BarChart3 className="w-10 h-10 text-[var(--accent)] mx-auto mb-3 opacity-40" />
      <p className="text-[14px] font-semibold text-[var(--text-primary)]">Reports Module</p>
      <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Charts and analytics will be available as more data accumulates.</p>
    </div>
  </div>);
}

export function AuditCenter() {
  const [logs, setLogs] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/audit-log", { headers: headers() }).then(r => r.json()).then(d => { if (d.logs) setLogs(d.logs); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Audit Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">System activity and security events</p></div>
    {logs.length === 0 ? <Empty icon={Clock} title="No audit events" desc="Login attempts, changes, and actions will be logged here" /> : <Table headers={["Action","User","Resource","Status","Time"]} rows={logs.map(l => [l.action, l.userEmail||"Unknown", l.resource||"—", l.success ? <span key={l.id} className="text-[10px] font-semibold text-[var(--success)]">Success</span> : <span key={l.id} className="text-[10px] font-semibold text-[#EF4444]">Failed</span>, new Date(l.createdAt).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})])} />}
  </div>);
}

// Shared table component
function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (<div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{headers.map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">{r.map((c, j) => <td key={j} className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c}</td>)}</tr>)}</tbody></table></div></div>);
}
