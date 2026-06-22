import React, { useEffect, useState } from "react";
import { Users, Plus, X, Copy, Check } from "lucide-react";
import { Loading, EmptyState, api } from "../shared";

const ROLES = [
  { value: "TEAM_MEMBER", label: "Team Member" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export default function TeamManagement() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", role: "TEAM_MEMBER", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTeam(); }, []);
  const fetchTeam = async () => { try { const d = await api("/api/admin/team"); setTeam(d.team || []); } catch {} finally { setLoading(false); } };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const d = await api("/api/admin/team/invite", { method: "POST", body: JSON.stringify(form) });
      if (d.success) { setCredentials(d.credentials); fetchTeam(); }
    } catch {} finally { setSaving(false); }
  };

  const copyText = (text: string, field: string) => { navigator.clipboard.writeText(text); setCopied(field); setTimeout(() => setCopied(""), 2000); };
  const totalTasks = team.reduce((a, m) => a + (m.activeTasks || 0), 0);
  const totalClients = team.reduce((a, m) => a + (m.clients || 0), 0);

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Team & Workload</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{team.length} members · {totalTasks} active tasks · {totalClients} client assignments</p></div>
        <button onClick={() => { setShowInvite(true); setCredentials(null); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Member</button>
      </div>

      {/* Workload overview */}
      {team.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Workload Distribution</h3>
          <div className="space-y-3">
            {team.map(m => {
              const capacity = Math.min(100, (m.activeTasks || 0) * 10);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">{m.firstName?.charAt(0) || "?"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">{m.firstName} {m.lastName}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{m.activeTasks} tasks · {m.clients} clients</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--border-subtle)]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${capacity}%`, background: capacity > 80 ? "#EF4444" : capacity > 60 ? "var(--warning)" : "var(--accent)" }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold w-8 text-right" style={{ color: capacity > 80 ? "#EF4444" : capacity > 60 ? "var(--warning)" : "var(--success)" }}>{capacity}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team cards */}
      {team.length === 0 ? <EmptyState icon={Users} title="No team members" description="Invite your first team member to start delegating work." action={{ label: "Add Member", onClick: () => setShowInvite(true) }} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(m => (
            <div key={m.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[12px] font-bold">{m.firstName?.charAt(0)}</div>
                <div><p className="text-[13px] font-semibold text-[var(--text-primary)]">{m.firstName} {m.lastName}</p><p className="text-[10px] text-[var(--text-tertiary)]">{m.role.replace(/_/g, " ")} · {m.email}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-[var(--border-subtle)] pt-3">
                <div><p className="text-[14px] font-bold text-[var(--text-primary)]">{m.activeTasks}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">Tasks</p></div>
                <div><p className="text-[14px] font-bold text-[var(--text-primary)]">{m.clients}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">Clients</p></div>
                <div><p className="text-[14px] font-bold" style={{ color: m.isActive ? "var(--success)" : "#EF4444" }}>{m.isActive ? "●" : "○"}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">{m.isActive ? "Active" : "Inactive"}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowInvite(false); setCredentials(null); }}>
          <div onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">{credentials ? "Member Added!" : "Add Team Member"}</h3><button onClick={() => { setShowInvite(false); setCredentials(null); }} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            {credentials ? (
              <div className="space-y-4">
                <p className="text-[13px] text-[var(--text-secondary)]">Share these login credentials:</p>
                <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Email</p><p className="text-[14px] font-medium text-[var(--text-primary)]">{credentials.email}</p></div><button onClick={() => copyText(credentials.email, "e")} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer">{copied === "e" ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />}</button></div>
                  <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Password</p><p className="text-[14px] font-medium text-[var(--text-primary)] font-mono">{credentials.password}</p></div><button onClick={() => copyText(credentials.password, "p")} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer">{copied === "p" ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />}</button></div>
                </div>
                <button onClick={() => { setShowInvite(false); setCredentials(null); }} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer">Done</button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">First Name *</label><input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
                  <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Last Name</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
                </div>
                <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Role *</label><select required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none">{ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                  <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none" /></div>
                </div>
                <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Password (default: Team@2026)</label><input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Team@2026" className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none" /></div>
                <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Adding..." : "Add Team Member"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
