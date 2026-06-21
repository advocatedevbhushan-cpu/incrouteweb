import React from "react";
import { Receipt, Plus } from "lucide-react";

const invoices = [
  { no: "INV-2026-044", client: "ABC Private Limited", amount: "₹14,999", status: "Paid", date: "Jul 1", due: "Jul 15" },
  { no: "INV-2026-045", client: "XYZ LLP", amount: "₹9,999", status: "Sent", date: "Jul 1", due: "Jul 15" },
  { no: "INV-2026-046", client: "TechStart OPC", amount: "₹24,999", status: "Pending", date: "Jun 28", due: "Jul 12" },
  { no: "INV-2026-043", client: "Verma Ventures", amount: "₹7,499", status: "Overdue", date: "Jun 15", due: "Jun 30" },
  { no: "INV-2026-042", client: "GreenLeaf Foundation", amount: "₹4,999", status: "Paid", date: "Jun 15", due: "Jun 30" },
];

const statusColor = (s: string) => s === "Paid" ? "var(--success)" : s === "Overdue" ? "#EF4444" : s === "Sent" ? "var(--accent)" : "var(--text-tertiary)";

export default function InvoiceOps() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Invoice Operations</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Create, send and track all invoices</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> Create Invoice</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: "Total Revenue", value: "₹4.2L" }, { label: "Outstanding", value: "₹32,498" }, { label: "Paid This Month", value: "₹19,998" }, { label: "Overdue", value: "₹7,499" }].map((m, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[18px] font-extrabold text-[var(--text-primary)]">{m.value}</p><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{m.label}</p></div>
        ))}
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{["Invoice", "Client", "Amount", "Status", "Issued", "Due"].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead>
      <tbody>{invoices.map(inv => (<tr key={inv.no} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
        <td className="px-5 py-3.5 text-[12px] font-medium text-[var(--text-primary)]">{inv.no}</td>
        <td className="px-5 py-3.5 text-[11px] text-[var(--text-secondary)]">{inv.client}</td>
        <td className="px-5 py-3.5 text-[12px] font-semibold text-[var(--text-primary)]">{inv.amount}</td>
        <td className="px-5 py-3.5"><span className="text-[10px] font-semibold" style={{ color: statusColor(inv.status) }}>{inv.status}</span></td>
        <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{inv.date}</td>
        <td className="px-5 py-3.5 text-[11px] text-[var(--text-tertiary)]">{inv.due}</td>
      </tr>))}</tbody></table></div></div>
    </div>
  );
}
