import React, { useEffect, useState, useCallback, useRef } from "react";
import { FileText, Plus, X, CheckCircle2, XCircle, Download, Trash2, Upload, FolderOpen } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";

const STATUSES = ["ALL", "DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"];
const FOLDERS = ["Incorporation", "GST", "Trademark", "ROC", "Legal", "Tax", "Invoices", "Other"];

export default function DocumentOps() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState<any>({});
  const [folderCounts, setFolderCounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [folderFilter, setFolderFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ clientId: "", title: "", folder: "Other" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (folderFilter) params.set("folder", folderFilter);
      const data = await api(`/api/admin/documents?${params}`);
      setDocs(data.documents || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.stats) setStats(data.stats);
      if (data.folderCounts) setFolderCounts(data.folderCounts);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, folderFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter, folderFilter]);

  const updateStatus = async (id: string, status: string, note?: string) => { await api(`/api/admin/documents/${id}`, { method: "PATCH", body: JSON.stringify({ status, internalNote: note }) }); fetchData(); };
  const deleteDoc = async (id: string, title: string) => { if (!confirm(`Delete "${title}"?`)) return; await api(`/api/admin/documents/${id}`, { method: "DELETE" }); fetchData(); };
  const downloadDoc = async (id: string) => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch(`/api/admin/documents/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // If the response is a file stream (Content-Disposition header present), download it
      if (res.headers.get("Content-Disposition")) {
        const blob = await res.blob();
        const fileName = res.headers.get("Content-Disposition")?.match(/filename="?(.+?)"?$/)?.[1] || "download";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON response with downloadUrl
        const d = await res.json();
        if (d.downloadUrl) {
          const a = document.createElement("a");
          a.href = d.downloadUrl;
          a.download = d.fileName || "download";
          a.target = "_blank";
          a.click();
        } else {
          alert("Download failed: " + (d.error || "File not found"));
        }
      }
    } catch (err) {
      alert("Download failed. Please check your connection.");
    }
  };
  const loadClients = async () => { const d = await api("/api/admin/clients"); setClients(d.clients || []); };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadForm.clientId || !uploadForm.title) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("clientId", uploadForm.clientId);
      formData.append("title", uploadForm.title);
      formData.append("folder", uploadForm.folder);
      formData.append("category", uploadForm.folder);
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/admin/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (data.success) { setShowUpload(false); setSelectedFile(null); setUploadForm({ clientId: "", title: "", folder: "Other" }); fetchData(); }
    } catch {} finally { setUploading(false); }
  };

  const formatSize = (bytes: number) => { if (!bytes) return "—"; if (bytes < 1024) return bytes + " B"; if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB"; return (bytes/(1024*1024)).toFixed(1) + " MB"; };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Document Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} documents · Cloudflare R2 Storage</p></div>
        <button onClick={() => { setShowUpload(true); loadClients(); }} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer"><Upload className="w-3.5 h-3.5" /> Upload</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending Review" value={stats.underReview || 0} color="var(--warning)" />
        <StatCard label="Approved" value={stats.approved || 0} color="var(--success)" />
        <StatCard label="Rejected" value={stats.rejected || 0} color="#EF4444" />
        <StatCard label="Drafts" value={stats.draft || 0} />
      </div>

      {/* Folder pills */}
      {folderCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFolderFilter("")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${!folderFilter ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border-subtle)] text-[var(--text-secondary)]"}`}><FolderOpen className="w-3 h-3" /> All</button>
          {folderCounts.map((f: any) => (
            <button key={f.folder} onClick={() => setFolderFilter(f.folder)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors ${folderFilter === f.folder ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border-subtle)] text-[var(--text-secondary)]"}`}><FolderOpen className="w-3 h-3" /> {f.folder} <span className="text-[var(--text-tertiary)]">({f.count})</span></button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search document, client..." />
        <div className="flex flex-wrap gap-1">{STATUSES.slice(0, 5).map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}</div>
      </div>

      {loading ? <Loading /> : docs.length === 0 ? <EmptyState icon={FileText} title="No documents" description="Upload documents for clients to start the verification workflow." action={{ label: "Upload Document", onClick: () => { setShowUpload(true); loadClients(); } }} /> : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
            {["Document", "Client", "Folder", "Size", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
          </tr></thead>
          <tbody>{docs.map(d => (
            <tr key={d.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
              <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)]">{d.title}</p><p className="text-[9px] text-[var(--text-tertiary)]">{d.originalName || d.fileName} · v{d.version || 1}</p></td>
              <td className="px-4 py-3"><p className="text-[12px] font-semibold text-[var(--accent)]">{d.clientName || "—"}</p></td>
              <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{d.folder || d.category}</span></td>
              <td className="px-4 py-3 text-[10px] text-[var(--text-tertiary)]">{formatSize(d.fileSize || d.size)}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              <td className="px-4 py-3"><div className="flex items-center gap-1">
                <button onClick={() => downloadDoc(d.id)} title="Download" className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
                {d.status === "UNDER_REVIEW" && (<>
                  <button onClick={() => updateStatus(d.id, "APPROVED")} title="Approve" className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--text-tertiary)] hover:text-[var(--success)] cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => updateStatus(d.id, "REJECTED")} title="Reject" className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,#EF4444_12%,transparent)] text-[var(--text-tertiary)] hover:text-[#EF4444] cursor-pointer"><XCircle className="w-3.5 h-3.5" /></button>
                </>)}
                <button onClick={() => deleteDoc(d.id, d.title)} title="Delete" className="p-1.5 rounded-lg hover:bg-[color-mix(in_srgb,#EF4444_12%,transparent)] text-[var(--text-tertiary)] hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div></td>
            </tr>
          ))}</tbody></table></div></div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} onClick={e => e.stopPropagation()} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-bold text-[var(--text-primary)]">Upload Document</h3><button type="button" onClick={() => setShowUpload(false)} className="cursor-pointer text-[var(--text-tertiary)]"><X className="w-4 h-4" /></button></div>
            
            {/* File dropzone */}
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-colors">
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              {selectedFile ? (
                <div><FileText className="w-8 h-8 text-[var(--accent)] mx-auto mb-2" /><p className="text-[13px] font-medium text-[var(--text-primary)]">{selectedFile.name}</p><p className="text-[11px] text-[var(--text-tertiary)]">{formatSize(selectedFile.size)}</p></div>
              ) : (
                <div><Upload className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" /><p className="text-[13px] text-[var(--text-secondary)]">Click to select file</p><p className="text-[10px] text-[var(--text-tertiary)] mt-1">PDF, DOC, DOCX, PNG, JPG, XLS, XLSX · Max 25MB</p></div>
              )}
            </div>

            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Client *</label><select required value={uploadForm.clientId} onChange={e => setUploadForm({...uploadForm, clientId: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none"><option value="">Select...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Document Title *</label><input required value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div><label className="text-[10px] uppercase text-[var(--text-tertiary)] font-semibold">Folder</label><select value={uploadForm.folder} onChange={e => setUploadForm({...uploadForm, folder: e.target.value})} className="w-full mt-1 px-3 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none">{FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            <button type="submit" disabled={uploading || !selectedFile} className="w-full py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-50">{uploading ? "Uploading..." : "Upload Document"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
