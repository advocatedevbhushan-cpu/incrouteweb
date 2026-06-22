import React, { useEffect, useState } from "react";
import { Building2, ChevronRight, Loader2 } from "lucide-react";

interface Entity { id: string; name: string; type: string; status: string; complianceScore: number; incorporatedAt: string | null; cin: string | null; }

export default function Entities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/portal/entities", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.entities) setEntities(d.entities); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  const typeLabel = (t: string) => ({ PVT_LTD: "Private Limited", LLP: "LLP", OPC: "One Person Company", PARTNERSHIP: "Partnership", SECTION_8: "Section 8", PUBLIC_LTD: "Public Limited", FOREIGN: "Foreign Company" }[t] || t);

  if (entities.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">My Entities</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No registered entities</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><Building2 className="w-6 h-6 text-[var(--accent)]" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No entities registered</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">Your business entities will appear here once your advisor registers them.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">My Entities</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{entities.length} registered business entities</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map(e => (
          <div key={e.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 hover:border-[var(--accent)] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center"><Building2 className="w-5 h-5 text-[var(--accent)]" /></div>
              <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-semibold">{e.status.replace(/_/g, " ")}</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{e.name}</h3>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{typeLabel(e.type)}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>{e.incorporatedAt ? `Inc: ${new Date(e.incorporatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : "—"}</span>
              <span className="font-semibold text-[var(--success)]">{e.complianceScore}% Compliant</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
