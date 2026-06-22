import React, { useEffect, useState } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";

interface Doc { id: string; title: string; category: string; status: string; uploadedBy: string | null; createdAt: string; clientName: string | null; }
const statusColor = (s: string) => s === "APPROVED" || s === "PUBLISHED" ? "var(--success)" : s === "REJECTED" ? "#EF4444" : s === "UNDER_REVIEW" ? "var(--warning)" : "var(--text-tertiary)";

export default function DocumentOps() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/admin/documents", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.documents) setDocs(d.documents); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{docs.length} documents managed</p></div>
      </div>
      {docs.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <FileText className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" /><p className="text-[14px] font-medium text-[var(--text-primary)]">No documents yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Documents will appear here when uploaded for clients</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Document", "Client", "Category", "Status", "Date"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{docs.map(d => (<tr key={d.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
          <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)]">{d.title}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-secondary)]">{d.clientName || "—"}</td>
          <td className="px-5 py-3.5 text-[10px] text-[var(--text-tertiary)] uppercase">{d.category}</td>
          <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: statusColor(d.status) }}>{d.status.replace(/_/g, " ")}</span></td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
        </tr>))}</tbody></table></div></div>
      )}
    </div>
  );
}
