import React, { useEffect, useState } from "react";
import { Receipt, Loader2 } from "lucide-react";

interface Invoice { id: string; invoiceNo: string; clientName: string | null; amount: string; total: string; status: string; dueDate: string; createdAt: string; }
interface Totals { totalRevenue: number; outstanding: number; paidThisMonth: number; overdue: number; }
const statusColor = (s: string) => s === "PAID" ? "var(--success)" : s === "OVERDUE" ? "#EF4444" : s === "SENT" ? "var(--accent)" : "var(--text-tertiary)";
const fmtAmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;

export default function InvoiceOps() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState<Totals>({ totalRevenue: 0, outstanding: 0, paidThisMonth: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const token = localStorage.getItem("incroute_access_token"); const r = await fetch("/api/admin/invoices", { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const d = await r.json(); if (d.invoices) setInvoices(d.invoices); if (d.totals) setTotals(d.totals); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /></div>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Invoice Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{invoices.length} invoices</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: "Total Revenue", value: fmtAmt(totals.totalRevenue) }, { label: "Outstanding", value: fmtAmt(totals.outstanding) }, { label: "Paid This Month", value: fmtAmt(totals.paidThisMonth) }, { label: "Overdue", value: fmtAmt(totals.overdue) }].map((m, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[18px] font-extrabold text-[var(--text-primary)]">{m.value}</p><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{m.label}</p></div>
        ))}
      </div>
      {invoices.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <Receipt className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" /><p className="text-[14px] font-medium text-[var(--text-primary)]">No invoices yet</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Invoice", "Client", "Amount", "Status", "Issued", "Due"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
        <tbody>{invoices.map(inv => (<tr key={inv.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
          <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)]">{inv.invoiceNo}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-secondary)]">{inv.clientName || "—"}</td>
          <td className="px-5 py-3.5 text-[12px] font-semibold text-[var(--text-primary)]">₹{Number(inv.total).toLocaleString()}</td>
          <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: statusColor(inv.status) }}>{inv.status}</span></td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{new Date(inv.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
          <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{new Date(inv.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
        </tr>))}</tbody></table></div></div>
      )}
    </div>
  );
}
