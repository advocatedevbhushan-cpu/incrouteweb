import React, { useEffect, useState } from "react";
import { Users, Plus, Search, ChevronRight, Loader2, X, Copy, Check, Trash2, ArrowLeft, Building2, FileText } from "lucide-react";

const SERVICE_TYPES = [
  { value: "PVT_LTD_INCORPORATION", label: "Pvt Ltd Incorporation" },
  { value: "LLP_INCORPORATION", label: "LLP Incorporation" },
  { value: "OPC_INCORPORATION", label: "OPC Incorporation" },
  { value: "PARTNERSHIP_REGISTRATION", label: "Partnership Registration" },
  { value: "SECTION_8_INCORPORATION", label: "Section 8 Incorporation" },
  { value: "GST_REGISTRATION", label: "GST Registration" },
  { value: "TRADEMARK_FILING", label: "Trademark Filing" },
  { value: "COMPLIANCE_ANNUAL", label: "Annual Compliance" },
  { value: "TAX_RETURN", label: "Tax Return Filing" },
  { value: "LEGAL_DRAFTING", label: "Legal Drafting" },
  { value: "VIRTUAL_OFFICE", label: "Virtual Office" },
  { value: "MSME_REGISTRATION", label: "MSME Registration" },
  { value: "FSSAI_REGISTRATION", label: "FSSAI Registration" },
];

const ENTITY_TYPES = [
  { value: "PVT_LTD", label: "Private Limited" },
  { value: "LLP", label: "LLP" },
  { value: "OPC", label: "One Person Company" },
  { value: "PARTNERSHIP", label: "Partnership Firm" },
  { value: "SECTION_8", label: "Section 8 / NGO" },
  { value: "PUBLIC_LTD", label: "Public Limited" },
  { value: "FOREIGN", label: "Foreign Company" },
];

interface Client { id: string; companyName: string; contactName: string; contactEmail: string; contactPhone: string | null; industry: string | null; status: string; entityCount: number; avgHealth: number | null; createdAt: string; }

const authHeaders = () => { const t = localStorage.getItem("incroute_access_token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [form, setForm] = useState({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", industry: "", password: "" });

  useEffect(() => { fetchClients(); }, []);
  const fetchClients = async () => { try { const r = await fetch("/api/admin/clients", { headers: authHeaders() }); const d = await r.json(); if (d.clients) setClients(d.clients); } catch {} finally { setLoading(false); } };

  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { const res = await fetch("/api/admin/clients", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(form) }); const data = await res.json(); if (data.success) { setCredentials(data.credentials); setForm({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", industry: "", password: "" }); fetchClients(); } } catch {} finally { setSaving(false); } };
  const handleDelete = async (id: string, name: string) => { if (!confirm(`Delete "${name}"?`)) return; await fetch(`/api/admin/clients/${id}`, { method: "DELETE", headers: authHeaders() }); fetchClients(); };
  const copyText = (text: string, field: string) => { navigator.clipboard.writeText(text); setCopied(field); setTimeout(() => setCopied(""), 2000); };

  if (selectedClient) return <ClientDetail clientId={selectedClient} onBack={() => { setSelectedClient(null); fetchClients(); }} />;
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  const filtered = clients.filter(c => c.companyName.toLowerCase().includes(search.toLowerCase()) || c.contactName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Client Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{clients.length} clients</p></div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-[12px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[180px]" /></div>
          <button onClick={() => { setShowAdd(true); setCredentials(null); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> Add Client</button>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowAdd(false); setCredentials(null); }}>
          <div onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">{credentials ? "Client Created!" : "Add New Client"}</h3><button type="button" onClick={() => { setShowAdd(false); setCredentials(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"><X className="w-4 h-4" /></button></div>
            {credentials ? (
              <div className="space-y-4">
                <p className="text-[13px] text-[var(--text-secondary)]">Share these login credentials with your client:</p>
                <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Login Email</p><p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">{credentials.email}</p></div><button onClick={() => copyText(credentials.email, "email")} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer">{copied === "email" ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />}</button></div>
                  <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Password</p><p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5 font-mono">{credentials.password}</p></div><button onClick={() => copyText(credentials.password, "pass")} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] cursor-pointer">{copied === "pass" ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />}</button></div>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">Portal URL: incroute.com/login</p>
                <button onClick={() => { setShowAdd(false); setCredentials(null); }} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer">Done</button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                {[{ key: "companyName", label: "Company Name *", type: "text" }, { key: "contactName", label: "Contact Person *", type: "text" }, { key: "contactEmail", label: "Email (Login ID) *", type: "email" }, { key: "contactPhone", label: "Phone", type: "text" }, { key: "industry", label: "Industry", type: "text" }].map(f => (
                  <div key={f.key}><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{f.label}</label><input type={f.type} required={f.label.includes("*")} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
                ))}
                <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Password (default: Welcome@123)</label><input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Welcome@123" className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]" /></div>
                <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Creating..." : "Create Client & Account"}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center"><Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" /><p className="text-[14px] font-medium text-[var(--text-primary)]">No clients yet</p></div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Client", "Contact", "Entities", "Status", "Actions"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{filtered.map(c => (<tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
          <td className="px-5 py-3.5 cursor-pointer" onClick={() => setSelectedClient(c.id)}><p className="text-[13px] font-semibold text-[var(--text-primary)]">{c.companyName}</p><p className="text-[10px] text-[var(--text-tertiary)]">{c.contactEmail}</p></td>
          <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.contactName}</td>
          <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.entityCount}</td>
          <td className="px-5 py-3.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === "ACTIVE" ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>{c.status}</span></td>
          <td className="px-5 py-3.5 flex items-center gap-2">
            <button onClick={() => setSelectedClient(c.id)} className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors">Manage</button>
            <button onClick={() => handleDelete(c.id, c.companyName)} className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,#EF4444_12%,transparent)] text-[var(--text-tertiary)] hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          </td>
        </tr>))}</tbody></table></div></div>
      )}
    </div>
  );
}

// ─── CLIENT DETAIL VIEW ───
function ClientDetail({ clientId, onBack }: { clientId: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [entityForm, setEntityForm] = useState({ name: "", type: "PVT_LTD", cin: "", pan: "", gstin: "" });
  const [serviceForm, setServiceForm] = useState({ serviceType: "PVT_LTD_INCORPORATION", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDetail(); }, [clientId]);
  const fetchDetail = async () => { try { const r = await fetch(`/api/admin/clients/${clientId}`, { headers: authHeaders() }); const d = await r.json(); setData(d); } catch {} finally { setLoading(false); } };

  const addEntity = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await fetch("/api/admin/entities", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...entityForm, clientId }) }); setShowAddEntity(false); setEntityForm({ name: "", type: "PVT_LTD", cin: "", pan: "", gstin: "" }); fetchDetail(); } catch {} finally { setSaving(false); } };
  const addService = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await fetch("/api/admin/service-requests", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...serviceForm, clientId, companyName: data?.client?.companyName }) }); setShowAddService(false); setServiceForm({ serviceType: "PVT_LTD_INCORPORATION", notes: "" }); fetchDetail(); } catch {} finally { setSaving(false); } };
  const updateServiceStatus = async (id: string, status: string) => { await fetch(`/api/admin/service-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ status }) }); fetchDetail(); };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  const client = data?.client;
  if (!client) return <div className="text-center py-12"><p className="text-[var(--text-secondary)]">Client not found</p><button onClick={onBack} className="mt-3 text-[var(--accent)] text-[12px] cursor-pointer">← Back</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{client.companyName}</h1><p className="text-[13px] text-[var(--text-secondary)]">{client.contactName} · {client.contactEmail}</p></div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[10px] text-[var(--text-tertiary)] uppercase">Status</p><p className="text-[14px] font-bold text-[var(--text-primary)] mt-1">{client.status}</p></div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[10px] text-[var(--text-tertiary)] uppercase">Entities</p><p className="text-[14px] font-bold text-[var(--text-primary)] mt-1">{data.entities?.length || 0}</p></div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[10px] text-[var(--text-tertiary)] uppercase">Services</p><p className="text-[14px] font-bold text-[var(--text-primary)] mt-1">{data.serviceRequests?.length || 0}</p></div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[10px] text-[var(--text-tertiary)] uppercase">Industry</p><p className="text-[14px] font-bold text-[var(--text-primary)] mt-1">{client.industry || "—"}</p></div>
      </div>

      {/* Entities Section */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Business Entities</h3>
          <button onClick={() => setShowAddEntity(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-[var(--accent-deep)]"><Plus className="w-3 h-3" /> Add Entity</button>
        </div>
        {(!data.entities || data.entities.length === 0) ? <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No entities registered yet</p> : (
          <div className="space-y-2">{data.entities.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between py-2.5 px-3 border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-[var(--accent)]" /><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{e.name}</p><p className="text-[10px] text-[var(--text-tertiary)]">{e.type.replace(/_/g, " ")} {e.cin ? `· CIN: ${e.cin}` : ""}</p></div></div>
              <span className="text-[10px] font-semibold text-[var(--success)]">{e.complianceScore}%</span>
            </div>
          ))}</div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Active Services</h3>
          <button onClick={() => setShowAddService(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-[var(--accent-deep)]"><Plus className="w-3 h-3" /> Add Service</button>
        </div>
        {(!data.serviceRequests || data.serviceRequests.length === 0) ? <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No services assigned yet. Click "Add Service" to assign one.</p> : (
          <div className="space-y-2">{data.serviceRequests.map((sr: any) => (
            <div key={sr.id} className="flex items-center justify-between py-2.5 px-3 border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-[var(--accent)]" /><div><p className="text-[13px] font-medium text-[var(--text-primary)]">{sr.serviceType.replace(/_/g, " ")}</p><p className="text-[10px] text-[var(--text-tertiary)]">{sr.notes || "No notes"} · {new Date(sr.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p></div></div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sr.status === "COMPLETED" ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]" : sr.status === "IN_PROGRESS" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]"}`}>{sr.status.replace(/_/g, " ")}</span>
                {sr.status !== "COMPLETED" && <button onClick={() => updateServiceStatus(sr.id, sr.status === "DRAFT" || sr.status === "PENDING_DOCUMENTS" ? "IN_PROGRESS" : "COMPLETED")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">{sr.status === "IN_PROGRESS" ? "Complete" : "Start"}</button>}
              </div>
            </div>
          ))}</div>
        )}
      </div>

      {/* Add Entity Modal */}
      {showAddEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddEntity(false)}>
          <form onSubmit={addEntity} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Add Entity</h3><button type="button" onClick={() => setShowAddEntity(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Entity Name *</label><input required value={entityForm.name} onChange={e => setEntityForm({...entityForm, name: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Entity Type *</label><select value={entityForm.type} onChange={e => setEntityForm({...entityForm, type: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">{ENTITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">CIN</label><input value={entityForm.cin} onChange={e => setEntityForm({...entityForm, cin: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">PAN</label><input value={entityForm.pan} onChange={e => setEntityForm({...entityForm, pan: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
              <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">GSTIN</label><input value={entityForm.gstin} onChange={e => setEntityForm({...entityForm, gstin: e.target.value})} className="w-full mt-1 px-2 py-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Saving..." : "Add Entity"}</button>
          </form>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddService(false)}>
          <form onSubmit={addService} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Assign Service</h3><button type="button" onClick={() => setShowAddService(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Service Type *</label><select value={serviceForm.serviceType} onChange={e => setServiceForm({...serviceForm, serviceType: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">{SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Notes</label><textarea value={serviceForm.notes} onChange={e => setServiceForm({...serviceForm, notes: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none" placeholder="Optional notes about this service..." /></div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{saving ? "Saving..." : "Assign Service"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
