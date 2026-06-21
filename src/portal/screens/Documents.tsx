import React from "react";
import { FileText, FolderOpen, Download, Eye, Search } from "lucide-react";

const folders = [
  { name: "Incorporation", count: 8 },
  { name: "GST", count: 12 },
  { name: "Trademark", count: 5 },
  { name: "ROC Filings", count: 14 },
  { name: "Agreements", count: 6 },
  { name: "Board Resolutions", count: 9 },
  { name: "Tax Documents", count: 11 },
];

const recentDocs = [
  { name: "Certificate of Incorporation", folder: "Incorporation", date: "Mar 15, 2023", type: "PDF" },
  { name: "GSTR-3B June 2026", folder: "GST", date: "Jun 20, 2026", type: "PDF" },
  { name: "Trademark Certificate Class 9", folder: "Trademark", date: "May 12, 2026", type: "PDF" },
  { name: "Board Resolution Q2 FY26", folder: "Board Resolutions", date: "Jun 30, 2026", type: "PDF" },
  { name: "Share Certificate", folder: "Incorporation", date: "Mar 16, 2023", type: "PDF" },
];

export default function Documents() {
  if (recentDocs.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Center</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">No documents available</p></div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4"><FolderOpen className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" /></div>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">No documents yet</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">Your incorporation certificates, filings, and agreements will appear here once uploaded.</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Center</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">All your business documents in one place</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search documents..." className="pl-9 pr-4 py-2 text-[13px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[200px] sm:w-[260px]" />
        </div>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {folders.map((f, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center gap-3 hover:border-[var(--accent)] transition-colors cursor-pointer">
            <FolderOpen className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">{f.name}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{f.count} files</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent documents */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Recent Documents</h3>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {recentDocs.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5 text-[var(--accent)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{d.name}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{d.folder} · {d.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer"><Eye className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
