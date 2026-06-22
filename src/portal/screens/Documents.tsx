import React, { useEffect, useState } from "react";
import { FileText, FolderOpen, Loader2, Search } from "lucide-react";

interface Doc { id: string; title: string; category: string; fileName: string; status: string; createdAt: string; }

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/portal/documents", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.documents) setDocs(d.documents); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(docs.map(d => d.category))];

  if (docs.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No documents available</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><FolderOpen className="w-6 h-6 text-[var(--accent)]" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No documents yet</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">Your documents will appear here once uploaded by your advisor.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{docs.length} documents</p></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-[13px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[200px]" /></div>
      </div>
      {categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(cat => (<div key={cat} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center gap-3 hover:border-[var(--accent)] transition-colors cursor-pointer"><FolderOpen className="w-5 h-5 text-[var(--accent)] shrink-0" /><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{cat}</p><p className="text-[11px] text-[var(--text-tertiary)]">{docs.filter(d => d.category === cat).length} files</p></div></div>))}
        </div>
      )}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]"><h3 className="text-[15px] font-bold text-[var(--text-primary)]">All Documents</h3></div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {filtered.map(d => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-[var(--accent)]" /><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{d.title}</p><p className="text-[11px] text-[var(--text-tertiary)]">{d.category} · {new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p></div></div>
              <span className="text-[10px] font-semibold text-[var(--accent)]">{d.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
