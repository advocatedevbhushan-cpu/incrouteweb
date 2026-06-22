import React, { useEffect, useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";

interface TeamMember { id: string; email: string; firstName: string; lastName: string; role: string; phone: string | null; isActive: boolean; createdAt: string; }

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/admin/team", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.team) setTeam(d.team); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Team Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{team.length} team members</p></div>
      </div>
      {team.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" /><p className="text-[14px] font-medium text-[var(--text-primary)]">No team members added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(m => (
            <div key={m.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--accent)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[12px] font-bold">{m.firstName.charAt(0)}</div>
                <div><p className="text-[13px] font-semibold text-[var(--text-primary)]">{m.firstName} {m.lastName}</p><p className="text-[10px] text-[var(--text-tertiary)]">{m.role.replace(/_/g, " ")} · {m.email}</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]" : "bg-[color-mix(in_srgb,#EF4444_12%,transparent)] text-[#EF4444]"}`}>{m.isActive ? "Active" : "Inactive"}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">Since {new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
