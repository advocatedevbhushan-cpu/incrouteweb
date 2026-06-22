import React, { useEffect, useState, useCallback } from "react";
import { FileText, Plus, X } from "lucide-react";
import { Loading, SearchBar, FilterPill, Pagination, StatusBadge, EmptyState, StatCard, api } from "../shared";

const SERVICE_TYPES = [
  { value: "PVT_LTD_INCORPORATION", label: "Pvt Ltd" }, { value: "LLP_INCORPORATION", label: "LLP" },
  { value: "OPC_INCORPORATION", label: "OPC" }, { value: "GST_REGISTRATION", label: "GST" },
  { value: "TRADEMARK_FILING", label: "Trademark" }, { value: "COMPLIANCE_ANNUAL", label: "Compliance" },
  { value: "TAX_RETURN", label: "Tax Return" }, { value: "LEGAL_DRAFTING", label: "Legal" },
  { value: "MSME_REGISTRATION", label: "MSME" }, { value: "FSSAI_REGISTRATION", label: "FSSAI" },
  { value: "VIRTUAL_OFFICE", label: "Virtual Office" }, { value: "PARTNERSHIP_REGISTRATION", label: "Partnership" },
  { value: "SECTION_8_INCORPORATION", label: "Section 8" },
];
const STATUSES = ["ALL", "DRAFT", "PENDING_DOCUMENTS", "IN_PROGRESS", "FILED", "AWAITING_APPROVAL", "COMPLETED", "ON_HOLD", "CANCELLED"];

export default function ServiceRequestOps() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (typeFilter) params.set("serviceType", typeFilter);
      const data = await api(`/api/admin/service-requests?${params}`);
      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  const updateStatus = async (id: string, status: string) => {
    await api(`/api/admin/service-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    fetchData();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Service Requests</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{total} total requests</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search client or service..." />
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.slice(0, 6).map(s => <FilterPill key={s} label={s === "ALL" ? "All" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
        {typeFilter && <button onClick={() => setTypeFilter("")} className="text-[10px] text-[var(--accent)] cursor-pointer">Clear type filter</button>}
      </div>

      {loading ? <Loading /> : requests.length === 0 ? (
        <EmptyState icon={FileText} title="No service requests" description="Service requests will appear here when assigned to clients from their profile." />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">
              {["Service", "Client", "Status", "Progress", "Created", "Actions"].map(h => <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
            </tr></thead>
            <tbody>{requests.map(sr => (
              <tr key={sr.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors">
                <td className="px-4 py-3"><p className="text-[12px] font-medium text-[var(--text-primary)]">{sr.serviceType.replace(/_/g, " ")}</p><p className="text-[9px] text-[var(--text-tertiary)]">{sr.id.slice(0, 12)}</p></td>
                <td className="px-4 py-3"><p className="text-[12px] text-[var(--text-secondary)]">{sr.clientName || sr.companyName || "—"}</p><p className="text-[9px] text-[var(--text-tertiary)]">{sr.contactName || ""}</p></td>
                <td className="px-4 py-3"><StatusBadge status={sr.status} /></td>
                <td className="px-4 py-3"><div className="w-16 h-1.5 rounded-full bg-[var(--border-subtle)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${sr.progress || 0}%` }} /></div><span className="text-[9px] text-[var(--text-tertiary)]">{sr.progress || 0}%</span></td>
                <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{new Date(sr.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {sr.status === "DRAFT" && <button onClick={() => updateStatus(sr.id, "PENDING_DOCUMENTS")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Request Docs</button>}
                    {sr.status === "PENDING_DOCUMENTS" && <button onClick={() => updateStatus(sr.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Start</button>}
                    {sr.status === "IN_PROGRESS" && <button onClick={() => updateStatus(sr.id, "FILED")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Filed</button>}
                    {sr.status === "FILED" && <button onClick={() => updateStatus(sr.id, "AWAITING_APPROVAL")} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-white">Await Approval</button>}
                    {sr.status === "AWAITING_APPROVAL" && <button onClick={() => updateStatus(sr.id, "COMPLETED")} className="text-[10px] px-2 py-1 rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] font-medium cursor-pointer hover:bg-[var(--success)] hover:text-white">Complete</button>}
                    {!["COMPLETED", "CANCELLED"].includes(sr.status) && <button onClick={() => updateStatus(sr.id, "ON_HOLD")} className="text-[10px] px-2 py-1 rounded-lg text-[var(--text-tertiary)] font-medium cursor-pointer hover:bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]">Hold</button>}
                  </div>
                </td>
              </tr>
            ))}</tbody></table></div>
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
