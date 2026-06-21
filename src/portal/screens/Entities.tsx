import React from "react";
import { Building2, ChevronRight } from "lucide-react";

const entities = [
  { name: "ABC Private Limited", type: "Private Limited", incorporated: "Mar 15, 2023", status: "Active", health: 96 },
  { name: "XYZ LLP", type: "Limited Liability Partnership", incorporated: "Aug 22, 2024", status: "Active", health: 88 },
  { name: "DEF One Person Company", type: "OPC", incorporated: "Jan 10, 2025", status: "Active", health: 100 },
];

export default function Entities() {
  if (entities.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">My Entities</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No registered entities</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><Building2 className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No entities registered</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">Register your first business entity to start managing compliance, documents, and more.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">My Entities</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{entities.length} registered business entities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((e, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 hover:border-[var(--accent)] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-semibold">{e.status}</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{e.name}</h3>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{e.type}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>Inc: {e.incorporated}</span>
              <span className="font-semibold text-[var(--success)]">{e.health}% Compliant</span>
            </div>
            <div className="flex items-center justify-end text-[12px] text-[var(--accent)] font-medium group-hover:gap-2 gap-1 transition-all">
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
