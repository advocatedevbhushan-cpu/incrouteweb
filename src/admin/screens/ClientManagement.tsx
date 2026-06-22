import React, { useEffect, useState } from "react";
import { Users, Plus, Search, ChevronRight, Loader2, X } from "lucide-react";

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  industry: string | null;
  status: string;
  entityCount: number;
  avgHealth: number | null;
  createdAt: string;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", industry: "" });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/clients", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) { setShowAdd(false); setForm({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", industry: "" }); fetchClients(); }
    } catch {} finally { setSaving(false); }
  };

  const filtered = clients.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Client Management</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{clients.length} clients managed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-[12px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[200px]" />
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Client
          </button>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Add New Client</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {["companyName", "contactName", "contactEmail", "contactPhone", "industry"].map(field => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{field.replace(/([A-Z])/g, " $1").trim()}</label>
                <input type={field === "contactEmail" ? "email" : "text"} required={["companyName","contactName","contactEmail"].includes(field)}
                  value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
              </div>
            ))}
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Add Client"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">No clients yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Click "Add Client" to get started</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[var(--border-subtle)]">
                {["Client", "Contact", "Entities", "Health", "Status", ""].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{c.companyName}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{c.contactEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.contactName}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.entityCount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold ${(c.avgHealth || 0) >= 90 ? "text-[var(--success)]" : (c.avgHealth || 0) >= 70 ? "text-[var(--warning)]" : "text-[var(--text-tertiary)]"}`}>
                        {c.avgHealth ? `${Math.round(c.avgHealth)}%` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{c.status}</span>
                    </td>
                    <td className="px-5 py-3.5"><ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
