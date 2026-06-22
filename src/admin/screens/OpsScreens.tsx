import React, { useEffect, useState, useCallback } from "react";
import { HelpCircle, Users, Shield, Scale, BarChart3, Clock, Plus, X, Loader2 } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, PriorityBadge, EmptyState, api } from "../shared";

// ─── TICKET OPERATIONS ───
export function TicketOps() {
  const [tickets, setTickets] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(""); const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false); const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ clientId: "", subject: "", description: "", priority: "MEDIUM" }); const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => { setLoading(true); try { const params = new URLSearchParams({ page: String(page), limit: "15" }); if (search) params.set("search", search); if (statusFilter !== "ALL") params.set("status", statusFilter); const d = await api(`/api/admin/tickets?${params}`); setTickets(d.tickets||[]); setTotal(d.total||0); setPages(d.pages||1); } catch {} finally { setLoading(false); } }, [page, search, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/tickets/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients||[]); };
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await api("/api/admin/tickets", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); setForm({ clientId: "", subject: "", description: "", priority: "MEDIUM" }); fetchData(); } catch {} finally { setSaving(false); } };

  return (<div className="space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Support Tickets</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} tickets</p></div>
      <button onClick={() => { setShowAdd(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Create Ticket</button></div>
    <div className="flex flex-wrap items-center gap-2"><SearchBar value={search} onChange={setSearch} /><div className="flex flex-wrap gap-1">{["ALL","OPEN","IN_PROGRESS","WAITING_CLIENT","ESCALATED","RESOLVED","CLOSED"].slice(0,5).map(s => <FilterPill key={s} label={s==="ALL"?"All":s.replace(/_/g," ")} active={statusFilter===s} onClick={() => setStatusFilter(s)} />)}</div></div>
    {loading ? <Loading /> : tickets.length === 0 ? <EmptyState icon={HelpCircle} title="No tickets" description="Support tickets will appear here." action={{ label: "Create Ticket", onClick: () => { setShowAdd(true); loadClients(); } }} /> : (
      <><div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Subject","Client","Priority","Status","Created","Actions"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
      <tbody>{tickets.map(t=>(<tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
        <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)]">{t.subject}</p></td>
        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{t.clientName||"—"}</td>
        <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
        <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(t.createdAt).toLocaleDateString("en-IN",{month:"short",day:"numeric"})}</td>
        <td className="px-4 py-3"><div className="flex gap-1">
          {t.status==="OPEN"&&<button onClick={()=>updateStatus(t.id,"IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Start</button>}
          {t.status==="IN_PROGRESS"&&<button onClick={()=>updateStatus(t.id,"RESOLVED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Resolve</button>}
        </div></td>
      </tr>))}</tbody></table></div></div><Pagination page={page} pages={pages} onPage={setPage} /></>
    )}
    {showAdd&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowAdd(false)}><form onSubmit={handleAdd} onClick={e=>e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Create Ticket</h3><button type="button" onClick={()=>setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4"/></button></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label><select required value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Select...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Subject *</label><input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"/></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none resize-none"/></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Priority</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
      <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving?"Creating...":"Create Ticket"}</button>
    </form></div>)}
  </div>);
}

// ─── CONSULTATION MANAGEMENT ───
export function ConsultationOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(""); const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false); const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ clientId: "", topic: "", scheduledAt: "", duration: "30", notes: "" }); const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => { setLoading(true); try { const params = new URLSearchParams({ page: String(page), limit: "15" }); if (search) params.set("search", search); if (statusFilter !== "ALL") params.set("status", statusFilter); const d = await api(`/api/admin/consultations?${params}`); setItems(d.consultations||[]); setTotal(d.total||0); setPages(d.pages||1); } catch {} finally { setLoading(false); } }, [page, search, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const updateStatus = async (id: string, status: string) => { await api(`/api/admin/consultations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); fetchData(); };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients||[]); };
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await api("/api/admin/consultations", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); setForm({ clientId: "", topic: "", scheduledAt: "", duration: "30", notes: "" }); fetchData(); } catch {} finally { setSaving(false); } };

  return (<div className="space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Consultation Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} consultations</p></div>
      <button onClick={() => { setShowAdd(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Schedule</button></div>
    <div className="flex flex-wrap items-center gap-2"><SearchBar value={search} onChange={setSearch} /><div className="flex flex-wrap gap-1">{["ALL","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED","NO_SHOW"].slice(0,4).map(s => <FilterPill key={s} label={s==="ALL"?"All":s.replace(/_/g," ")} active={statusFilter===s} onClick={() => setStatusFilter(s)} />)}</div></div>
    {loading ? <Loading /> : items.length === 0 ? <EmptyState icon={Users} title="No consultations" description="Schedule advisory sessions with clients." action={{ label: "Schedule", onClick: () => { setShowAdd(true); loadClients(); } }} /> : (
      <><div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Topic","Client","Scheduled","Duration","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
      <tbody>{items.map(c=>(<tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
        <td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{c.topic}</td>
        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{c.clientName||"—"}</td>
        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{new Date(c.scheduledAt).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
        <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{c.duration} min</td>
        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
        <td className="px-4 py-3"><div className="flex gap-1">
          {c.status==="SCHEDULED"&&<button onClick={()=>updateStatus(c.id,"COMPLETED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Complete</button>}
          {c.status==="SCHEDULED"&&<button onClick={()=>updateStatus(c.id,"NO_SHOW")} className="text-[10px] px-2 py-1 rounded-lg text-[var(--text-tertiary)] font-medium cursor-pointer hover:bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]">No Show</button>}
        </div></td>
      </tr>))}</tbody></table></div></div><Pagination page={page} pages={pages} onPage={setPage} /></>
    )}
    {showAdd&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowAdd(false)}><form onSubmit={handleAdd} onClick={e=>e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Schedule Consultation</h3><button type="button" onClick={()=>setShowAdd(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4"/></button></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label><select required value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Select...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Topic *</label><input required value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Date & Time *</label><input type="datetime-local" required value={form.scheduledAt} onChange={e=>setForm({...form,scheduledAt:e.target.value})} className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none"/></div>
        <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Duration (min)</label><select value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} className="w-full mt-1 px-2 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none"><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div>
      </div>
      <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none resize-none"/></div>
      <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving?"Scheduling...":"Schedule Consultation"}</button>
    </form></div>)}
  </div>);
}

// ─── TRADEMARK OPS ───
export function TrademarkOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/admin/trademarks").then(d => { if (d.trademarks) setItems(d.trademarks); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-5"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Trademark Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} applications</p></div>
    {items.length===0 ? <EmptyState icon={Shield} title="No trademarks" description="Trademark applications will appear here when filed for clients." /> : <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Name","Client","App No.","Class","Status","Stage"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead><tbody>{items.map(t=>(<tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors"><td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{t.name}</td><td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{t.clientName||"—"}</td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{t.applicationNo||"—"}</td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{t.classNumber}</td><td className="px-4 py-3"><StatusBadge status={t.status}/></td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{t.currentStage||"—"}</td></tr>))}</tbody></table></div></div>}
  </div>);
}

// ─── LEGAL OPS ───
export function LegalOps() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/admin/legal-matters").then(d => { if (d.matters) setItems(d.matters); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-5"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Legal Matter Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{items.length} matters</p></div>
    {items.length===0 ? <EmptyState icon={Scale} title="No legal matters" description="Active legal cases will appear here." /> : <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Title","Client","Type","Priority","Status","Deadline"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead><tbody>{items.map(m=>(<tr key={m.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors"><td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{m.title}</td><td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{m.clientName||"—"}</td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{m.type}</td><td className="px-4 py-3"><PriorityBadge priority={m.priority}/></td><td className="px-4 py-3"><StatusBadge status={m.status}/></td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{m.deadline?new Date(m.deadline).toLocaleDateString("en-IN",{month:"short",day:"numeric"}):"—"}</td></tr>))}</tbody></table></div></div>}
  </div>);
}

// ─── REPORTING ───
export function ReportingDashboard() {
  return (<div className="space-y-5"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Reports & Analytics</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Platform performance</p></div>
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center py-16"><BarChart3 className="w-10 h-10 text-[var(--accent)] mx-auto mb-3 opacity-40"/><p className="text-[14px] font-semibold text-[var(--text-primary)]">Reports Module — Phase C</p><p className="text-[12px] text-[var(--text-tertiary)] mt-1">Detailed analytics will be available in the next update.</p></div>
  </div>);
}

// ─── AUDIT CENTER ───
export function AuditCenter() {
  const [logs, setLogs] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/admin/audit-log").then(d => { if (d.logs) setLogs(d.logs); }).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return (<div className="space-y-5"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Audit Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">System activity log</p></div>
    {logs.length===0 ? <EmptyState icon={Clock} title="No audit events" description="Login attempts, changes, and actions will be logged here." /> : <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Action","User","Resource","Status","Time"].map(h=><th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead><tbody>{logs.map(l=>(<tr key={l.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors"><td className="px-4 py-3 text-[12px] font-medium text-[var(--text-primary)]">{l.action}</td><td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{l.userEmail||"System"}</td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{l.resource||"—"}</td><td className="px-4 py-3">{l.success?<span className="text-[10px] font-semibold text-[var(--success)]">Success</span>:<span className="text-[10px] font-semibold text-[#EF4444]">Failed</span>}</td><td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(l.createdAt).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td></tr>))}</tbody></table></div></div>}
  </div>);
}
