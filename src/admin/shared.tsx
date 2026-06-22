import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";

export const authHeaders = () => { const t = localStorage.getItem("incroute_access_token"); return t ? { Authorization: `Bearer ${t}` } : {} as any; };
export const api = async (url: string, opts?: RequestInit) => { const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...authHeaders(), ...opts?.headers } }); return res.json(); };

export function Loading() { return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>; }

export function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" /><input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pl-8 pr-3 py-2 text-[12px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-full sm:w-[220px]" /></div>);
}

export function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]"}`}>{label}</button>);
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
      <span className="text-[11px] text-[var(--text-tertiary)]">Page {page} of {pages}</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-30 cursor-pointer hover:bg-[var(--accent-soft)]"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-30 cursor-pointer hover:bg-[var(--accent-soft)]"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { COMPLETED: "var(--success)", PAID: "var(--success)", APPROVED: "var(--success)", REGISTERED: "var(--success)", ACTIVE: "var(--success)", IN_PROGRESS: "var(--accent)", UNDER_REVIEW: "var(--accent)", SCHEDULED: "var(--accent)", OPEN: "var(--accent)", PENDING: "var(--warning)", PENDING_DOCUMENTS: "var(--warning)", OVERDUE: "#EF4444", REJECTED: "#EF4444", CRITICAL: "#EF4444", CANCELLED: "#EF4444", BLOCKED: "#EF4444" };
  const color = colors[status] || "var(--text-tertiary)";
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />{status.replace(/_/g, " ")}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const color = priority === "CRITICAL" ? "#EF4444" : priority === "HIGH" ? "var(--warning)" : priority === "MEDIUM" ? "var(--accent)" : "var(--text-tertiary)";
  return <span className="text-[10px] font-semibold" style={{ color }}>{priority}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
      <Icon className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
      <p className="text-[14px] font-medium text-[var(--text-primary)]">{title}</p>
      <p className="text-[12px] text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">{description}</p>
      {action && <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-xl cursor-pointer hover:bg-[var(--accent-deep)]">{action.label}</button>}
    </div>
  );
}

export function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (<div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[22px] font-extrabold text-[var(--text-primary)]">{value}</p><p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: color || "var(--text-tertiary)" }}>{label}</p></div>);
}
