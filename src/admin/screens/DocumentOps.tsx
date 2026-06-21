import React from "react";
import { FileText, Plus, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";

const docs = [
  { name: "AOC-4 FY25-26 — ABC Pvt Ltd", category: "ROC", status: "Under Review", uploadedBy: "CA Mehra", date: "Jun 20" },
  { name: "Board Resolution Q2 — Verma Ventures", category: "Corporate", status: "Approved", uploadedBy: "CS Priya", date: "Jun 18" },
  { name: "Trademark Certificate Class 42", category: "IP", status: "Published", uploadedBy: "IP Team", date: "Jun 15" },
  { name: "GST Registration — TechStart OPC", category: "GST", status: "Draft", uploadedBy: "Tax Team", date: "Jun 21" },
  { name: "NDA — Vendor Agreement", category: "Legal", status: "Rejected", uploadedBy: "Adv. Sharma", date: "Jun 12" },
];

const statusColor = (s: string) => s === "Approved" || s === "Published" ? "var(--success)" : s === "Rejected" ? "#EF4444" : s === "Under Review" ? "var(--warning)" : "var(--text-tertiary)";

export default function DocumentOps() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Document Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Upload, review and manage all client documents</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Upload className="w-3.5 h-3.5" /> Upload Document</button>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Document", "Category", "Status", "Uploaded By", "Date"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{docs.map((d, i) => (<tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
          <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)]">{d.name}</td>
          <td className="px-5 py-3.5 text-[10px] text-[var(--text-tertiary)] uppercase">{d.category}</td>
          <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: statusColor(d.status) }}>{d.status}</span></td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{d.uploadedBy}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{d.date}</td>
        </tr>))}</tbody></table></div>
      </div>
    </div>
  );
}
