import React, { useEffect, useState } from "react";
import { FileText, FolderOpen, Loader2, Search, Upload, CheckCircle2, Clock, X, AlertTriangle, Download, ChevronRight, Plus, Edit3, Save } from "lucide-react";

// All possible service categories with their required documents
const ALL_SERVICE_DOCUMENTS: Record<string, { label: string; icon: string; docs: string[] }> = {
  "PVT_LTD": {
    label: "Private Limited Company",
    icon: "🏢",
    docs: ["PAN Card (All Directors)", "Aadhaar Card (All Directors)", "Passport Size Photo", "Address Proof (Utility Bill)", "Bank Statement", "NOC from Property Owner", "Rent Agreement", "Digital Signature Certificate (DSC)"]
  },
  "LLP": {
    label: "LLP Registration",
    icon: "🤝",
    docs: ["PAN Card (All Partners)", "Aadhaar Card (All Partners)", "Address Proof", "Bank Statement", "Registered Office Proof", "LLP Agreement Draft", "DSC of Designated Partners"]
  },
  "OPC": {
    label: "One Person Company",
    icon: "👤",
    docs: ["PAN Card (Director)", "Aadhaar Card (Director)", "Photo", "Address Proof", "Bank Statement", "NOC from Owner", "Nominee Consent (Form INC-3)"]
  },
  "GST": {
    label: "GST Registration",
    icon: "📊",
    docs: ["PAN Card (Business)", "Aadhaar Card (Authorized Signatory)", "Address Proof of Business", "Bank Account Statement/Cancelled Cheque", "Electricity Bill", "Rent Agreement/Ownership Proof", "Photo of Signatory", "Authorization Letter"]
  },
  "TRADEMARK": {
    label: "Trademark Registration",
    icon: "™️",
    docs: ["Trademark Logo (High Resolution)", "Applicant ID Proof", "Address Proof", "Business Registration Certificate", "Authorization Letter (TM-48)", "User Affidavit (if claiming prior use)"]
  },
  "MSME": {
    label: "MSME / Udyam Registration",
    icon: "🏭",
    docs: ["Aadhaar Card (Owner)", "PAN Card (Business)", "GST Certificate (if applicable)", "Bank Account Details", "Business Address Proof"]
  },
  "ROC_FILING": {
    label: "Annual ROC Filing",
    icon: "📋",
    docs: ["Audited Financial Statements", "Board Resolution", "Director Report", "AGM Minutes", "Form AOC-4 Data", "Form MGT-7 Data"]
  },
  "INCOME_TAX": {
    label: "Income Tax Return",
    icon: "💰",
    docs: ["Form 16 / Salary Slips", "Bank Statements (All Accounts)", "Investment Proofs", "TDS Certificates", "Capital Gains Statement", "Rental Income Proof", "Business P&L Statement"]
  },
};

interface Doc {
  id: string;
  title: string;
  category: string;
  folder: string;
  fileName: string;
  status: string;
  createdAt: string;
  size?: number;
}

const authHeaders = () => {
  const t = localStorage.getItem("incroute_access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [search, setSearch] = useState("");
  const [allowedServices, setAllowedServices] = useState<string[]>([]);
  const [companyNotes, setCompanyNotes] = useState<{ aoa: string; moa: string }>({ aoa: "", moa: "" });
  const [showNotes, setShowNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    fetchDocs();
    fetchAllowedServices();
    fetchCompanyNotes();
  }, []);

  const fetchDocs = async () => {
    try {
      const r = await fetch("/api/portal/documents", { headers: authHeaders() });
      const d = await r.json();
      if (d.documents) setDocs(d.documents);
    } catch {} finally { setLoading(false); }
  };

  const fetchAllowedServices = async () => {
    try {
      const r = await fetch("/api/portal/allowed-services", { headers: authHeaders() });
      const d = await r.json();
      if (d.services && d.services.length > 0) {
        setAllowedServices(d.services);
      } else {
        // Fallback: show all if nothing configured
        setAllowedServices(Object.keys(ALL_SERVICE_DOCUMENTS));
      }
    } catch {
      setAllowedServices(Object.keys(ALL_SERVICE_DOCUMENTS));
    }
  };

  const fetchCompanyNotes = async () => {
    try {
      const r = await fetch("/api/portal/company-notes", { headers: authHeaders() });
      const d = await r.json();
      if (d.notes) setCompanyNotes({ aoa: d.notes.aoa || "", moa: d.notes.moa || "" });
    } catch {}
  };

  const saveCompanyNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch("/api/portal/company-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(companyNotes),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {} finally { setSavingNotes(false); }
  };

  // Filter SERVICE_DOCUMENTS to only show allowed services
  const SERVICE_DOCUMENTS = Object.fromEntries(
    Object.entries(ALL_SERVICE_DOCUMENTS).filter(([key]) => allowedServices.includes(key))
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError("File too large (max 10MB)"); return; }

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", docName);
    formData.append("category", category);
    formData.append("folder", activeFolder || category);

    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/portal/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchDocs();
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPortal = async (docId: string) => {
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch(`/api/portal/documents/${docId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
        const d = await res.json();
        if (d.downloadUrl) {
          const a = document.createElement("a");
          a.href = d.downloadUrl;
          a.download = d.fileName || "download";
          a.target = "_blank";
          a.click();
        }
      }
    } catch {}
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "REJECTED": return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED": return "Verified";
      case "REJECTED": return "Rejected";
      case "UNDER_REVIEW": return "Under Review";
      default: return "Pending";
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;

  // Folder view — show required docs + uploaded ones
  if (activeFolder) {
    const serviceInfo = SERVICE_DOCUMENTS[activeFolder];
    const folderDocs = docs.filter(d => d.category === activeFolder || d.folder === activeFolder);
    const uploadedNames = folderDocs.map(d => d.title);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveFolder(null)} className="p-2 rounded-xl hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer"><X className="w-4 h-4" /></button>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <span>{serviceInfo?.icon}</span> {serviceInfo?.label || activeFolder}
            </h1>
            <p className="text-[12px] text-[var(--text-secondary)]">{folderDocs.length} of {serviceInfo?.docs.length || 0} document types covered</p>
          </div>
        </div>

        {uploadError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {uploadError}
            <button onClick={() => setUploadError("")} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Upload Progress</span>
            <span className="text-[12px] font-bold text-[var(--accent)]">{new Set(folderDocs.map(d => d.title)).size}/{serviceInfo?.docs.length || 0}</span>
          </div>
          <div className="h-2 bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-full transition-all duration-500" style={{ width: `${serviceInfo?.docs.length ? (new Set(folderDocs.map(d => d.title)).size / serviceInfo.docs.length * 100) : 0}%` }} />
          </div>
        </div>

        {/* Required documents list — supports multiple uploads per slot */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Required Documents</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">For documents like PAN or Aadhaar, upload one per director/partner</p>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {serviceInfo?.docs.map((docName, i) => {
              const matchingDocs = folderDocs.filter(d => d.title === docName || d.title.startsWith(docName.split(" (")[0]));
              const isMultiPerson = docName.includes("All Directors") || docName.includes("All Partners");
              return (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {matchingDocs.length > 0 ? getStatusIcon(matchingDocs[0].status) : <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border-subtle)]" />}
                      <div>
                        <p className={`text-[13px] font-medium ${matchingDocs.length > 0 ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{docName}</p>
                        {isMultiPerson && <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">Upload one for each person (director/partner)</p>}
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors">
                      <Plus className="w-3 h-3" /> {matchingDocs.length > 0 ? "Add More" : "Upload"}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleUpload(e, activeFolder, docName)} disabled={uploading} />
                    </label>
                  </div>
                  {/* Show all uploaded files for this document type */}
                  {matchingDocs.length > 0 && (
                    <div className="mt-3 pl-6 space-y-2">
                      {matchingDocs.map((uploadedDoc, idx) => (
                        <div key={uploadedDoc.id} className="flex items-center justify-between bg-[var(--bg-surface-alt)] rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <div>
                              <p className="text-[11px] font-medium text-[var(--text-primary)]">{uploadedDoc.fileName}</p>
                              <p className="text-[9px] text-[var(--text-tertiary)]">
                                {new Date(uploadedDoc.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · {getStatusLabel(uploadedDoc.status)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(uploadedDoc.status)}
                            <button onClick={() => handleDownloadPortal(uploadedDoc.id)} className="p-1 rounded hover:bg-[var(--accent-soft)] cursor-pointer" title="Download">
                              <Download className="w-3 h-3 text-[var(--text-tertiary)]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-2 text-[12px] text-[var(--accent)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading document...
          </div>
        )}
      </div>
    );
  }

  // Main view — service folders
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Center</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Upload and manage documents for your services</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-semibold rounded-xl cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> AOA / MOA Notes
          </button>
          {docs.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-[13px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[200px]" />
            </div>
          )}
        </div>
      </div>

      {/* AOA / MOA Notes Section */}
      {showNotes && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Company Formation Notes</h3>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Tell us what to include in your MOA & AOA. Your advisor will review this.</p>
            </div>
            <button onClick={() => setShowNotes(false)} className="text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Memorandum of Association (MOA) — Objects & Activities</label>
            <textarea
              value={companyNotes.moa}
              onChange={e => setCompanyNotes({ ...companyNotes, moa: e.target.value })}
              rows={4}
              placeholder="Describe your company's main objects/activities (e.g., 'IT consulting, software development, digital marketing services'). List additional objects if any."
              className="w-full mt-1.5 px-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Articles of Association (AOA) — Special Clauses</label>
            <textarea
              value={companyNotes.aoa}
              onChange={e => setCompanyNotes({ ...companyNotes, aoa: e.target.value })}
              rows={4}
              placeholder="Any specific clauses you want? (e.g., 'Restrict share transfer to existing members only', 'ESOP pool of 15%', 'Vesting schedule for founders', 'Special rights for Class A shareholders')."
              className="w-full mt-1.5 px-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveCompanyNotes} disabled={savingNotes} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors">
              <Save className="w-3.5 h-3.5" /> {savingNotes ? "Saving..." : "Save Notes"}
            </button>
            {notesSaved && <span className="text-[11px] text-[var(--success)] font-medium">✓ Saved — your advisor will review this</span>}
          </div>
        </div>
      )}

      {/* Service folders grid — only shows allowed services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(SERVICE_DOCUMENTS).map(([key, service]) => {
          const count = docs.filter(d => d.category === key || d.folder === key).length;
          const total = service.docs.length;
          const progress = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={key}
              onClick={() => setActiveFolder(key)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-left hover:border-[var(--accent)] hover:shadow-[0_4px_16px_rgba(91,108,255,0.06)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{service.icon}</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <p className="text-[13px] font-bold text-[var(--text-primary)] mb-1">{service.label}</p>
              <p className="text-[11px] text-[var(--text-tertiary)] mb-3">{count}/{total} documents</p>
              <div className="h-1.5 bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]"}`} style={{ width: `${progress}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent uploads */}
      {docs.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Recent Uploads</h3>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {docs.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[var(--accent)]" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{d.title}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{SERVICE_DOCUMENTS[d.category]?.label || d.category} · {new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(d.status)}
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{getStatusLabel(d.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
