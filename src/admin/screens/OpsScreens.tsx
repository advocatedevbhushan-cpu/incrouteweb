import React from "react";
import { HelpCircle, Users, Shield, Scale, BarChart3, Clock, Plus, CheckCircle2, AlertTriangle } from "lucide-react";

function Header({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (<div className="flex items-center justify-between"><div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{title}</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p></div>{action}</div>);
}
function Tbl({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (<div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[var(--border-subtle)]">{headers.map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">{r.map((c, j) => <td key={j} className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c}</td>)}</tr>)}</tbody></table></div></div>);
}
function Stat({ s }: { s: string }) { const c = s === "Resolved" || s === "Completed" || s === "Registered" ? "var(--success)" : s === "Open" || s === "Scheduled" || s === "Filed" ? "var(--accent)" : s === "Escalated" || s === "Overdue" ? "var(--warning)" : "var(--text-tertiary)"; return <span className="text-[10px] font-semibold" style={{ color: c }}>{s}</span>; }
function Btn({ label }: { label: string }) { return <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" />{label}</button>; }

export function TicketOps() {
  return (<div className="space-y-6"><Header title="Support Operations" subtitle="14 open tickets" action={<Btn label="Create Ticket" />} /><Tbl headers={["Ticket", "Client", "Subject", "Priority", "Status", "Assignee", "Created"]} rows={[
    ["TKT-1042", "ABC Pvt Ltd", "GST Portal Access Issue", <span key="p" className="text-[var(--warning)] text-[10px] font-semibold">High</span>, <Stat key="s" s="Open" />, "Support Team", "Jun 21"],
    ["TKT-1041", "XYZ LLP", "Updated MOA copy needed", <span key="p" className="text-[var(--accent)] text-[10px] font-semibold">Medium</span>, <Stat key="s" s="In Progress" />, "CS Priya", "Jun 20"],
    ["TKT-1040", "Verma Ventures", "Trademark hearing date?", <span key="p" className="text-[var(--text-tertiary)] text-[10px] font-semibold">Low</span>, <Stat key="s" s="Resolved" />, "IP Team", "Jun 18"],
  ]} /></div>);
}

export function ConsultationOps() {
  return (<div className="space-y-6"><Header title="Consultation Management" subtitle="Upcoming and past advisory sessions" action={<Btn label="Schedule" />} /><Tbl headers={["Topic", "Client", "Advisor", "Date", "Duration", "Status"]} rows={[
    ["Annual Compliance FY27", "ABC Pvt Ltd", "CA Mehra", "Jul 5, 3:00 PM", "45 min", <Stat key="s" s="Scheduled" />],
    ["Trademark Strategy", "Verma Ventures", "IP Team", "Jun 28, 11:00 AM", "30 min", <Stat key="s" s="Completed" />],
    ["GST Reconciliation", "XYZ LLP", "Tax Team", "Jun 20, 2:00 PM", "30 min", <Stat key="s" s="Completed" />],
  ]} /></div>);
}

export function TrademarkOps() {
  return (<div className="space-y-6"><Header title="Trademark Operations" subtitle="All trademark applications and renewals" action={<Btn label="New Application" />} /><Tbl headers={["Trademark", "Client", "App No.", "Class", "Status", "Stage", "Next Action"]} rows={[
    ["INCroute", "INCroute", "TM-2024-98765", "42", <Stat key="s" s="Registered" />, "Certificate Issued", "Renewal 2034"],
    ["INCroute Logo", "INCroute", "TM-2025-12345", "9", <Stat key="s" s="Under Examination" />, "Objection Reply", "Await hearing"],
    ["CorpShield", "ABC Pvt Ltd", "TM-2026-55678", "36", <Stat key="s" s="Filed" />, "Vienna Code", "Exam pending"],
  ]} /></div>);
}

export function LegalOps() {
  return (<div className="space-y-6"><Header title="Legal Matter Management" subtitle="All active legal cases and drafting" action={<Btn label="New Matter" />} /><Tbl headers={["Matter", "Client", "Type", "Assigned", "Priority", "Status", "Deadline"]} rows={[
    ["NDA Vendor Agreement", "Verma Ventures", "Contract", "Adv. Sharma", <span key="p" className="text-[var(--accent)] text-[10px] font-semibold">Medium</span>, <Stat key="s" s="In Progress" />, "Jul 5"],
    ["TM Opposition Class 9", "ABC Pvt Ltd", "IP Dispute", "Adv. Kapoor", <span key="p" className="text-[var(--warning)] text-[10px] font-semibold">High</span>, <Stat key="s" s="Hearing" />, "Jul 15"],
    ["NCLT Compliance", "GreenLeaf", "Regulatory", "Adv. Mehta", <span key="p" className="text-[var(--warning)] text-[10px] font-semibold">High</span>, <Stat key="s" s="Under Review" />, "Aug 1"],
  ]} /></div>);
}

export function ReportingDashboard() {
  return (<div className="space-y-6"><Header title="Reports & Analytics" subtitle="Platform performance and insights" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[{ label: "Client Growth (M)", value: "+12" }, { label: "Revenue (M)", value: "₹4.2L" }, { label: "Compliance Rate", value: "94%" }, { label: "Avg Resolution", value: "2.4 days" }].map((m, i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4"><p className="text-[20px] font-extrabold text-[var(--text-primary)]">{m.value}</p><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{m.label}</p></div>
      ))}
    </div>
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center py-16">
      <BarChart3 className="w-10 h-10 text-[var(--accent)] mx-auto mb-3 opacity-40" />
      <p className="text-[14px] font-semibold text-[var(--text-primary)]">Reports Module</p>
      <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Charts and detailed analytics will render here when connected to live data.</p>
    </div>
  </div>);
}

export function AuditCenter() {
  return (<div className="space-y-6"><Header title="Audit Center" subtitle="System activity and security events" />
    <Tbl headers={["Action", "User", "Resource", "IP Address", "Time", "Status"]} rows={[
      ["Login", "rohit@abcpvtltd.com", "—", "103.21.x.x", "10 min ago", <Stat key="s" s="Success" />],
      ["Document Upload", "CA Mehra", "AOC-4 ABC Pvt Ltd", "Internal", "1 hour ago", <Stat key="s" s="Success" />],
      ["Password Change", "priya@xyzllp.com", "—", "182.73.x.x", "2 hours ago", <Stat key="s" s="Success" />],
      ["Login Failed", "unknown@test.com", "—", "45.33.x.x", "3 hours ago", <span key="s" className="text-[10px] font-semibold text-[#EF4444]">Failed</span>],
      ["Role Change", "Admin", "CS Priya → ADMIN", "Internal", "5 hours ago", <Stat key="s" s="Success" />],
    ]} />
  </div>);
}
