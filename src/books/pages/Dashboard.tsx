import React, { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeIndianRupee, Banknote, CalendarClock, FileText, Plus, ReceiptIndianRupee, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { booksApi, indianDate, inr } from "../api";
import type { BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, PageHeader, Status } from "./Common";

interface DashboardData {
  summary: { receivables: string; overdueReceivables: string; payables: string; bankAndCash: string; revenue: string; expenses: string; profitLoss: string; gstPayable: string };
  cashFlow: Array<{ month: string; net: string }>;
  compliance: Array<{ id: string; title: string; category: string; dueDate: string; status: string }>;
  activity: Array<{ id: string; action: string; entityType: string; entityId: string; createdAt: string }>;
}

const metrics = [
  ["receivables", "Receivables", ArrowUpRight, "blue"], ["overdueReceivables", "Overdue receivables", CalendarClock, "red"],
  ["payables", "Payables", ArrowDownRight, "amber"], ["bankAndCash", "Bank & cash", Banknote, "violet"],
  ["revenue", "Revenue this month", TrendingUp, "green"], ["expenses", "Expenses this month", ShoppingCart, "rose"],
  ["profitLoss", "Profit / loss", ReceiptIndianRupee, "navy"], ["gstPayable", "Output GST", BadgeIndianRupee, "gold"],
] as const;

export default function BooksDashboard({ organisation, onNavigate }:{ organisation: BooksOrganisation; onNavigate: (route: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { setData(await booksApi<DashboardData>(`/dashboard?organisationId=${encodeURIComponent(organisation.id)}`)); }
    catch (cause: any) { setError(cause.message || "Dashboard request failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [organisation.id]);
  if (loading) return <LoadingState label="Preparing your financial overview" />;
  if (error || !data) return <ErrorState message={error || "Dashboard data is unavailable"} onRetry={load} />;

  return <div className="books-page">
    <PageHeader eyebrow={`FY ${organisation.fiscalYear || "—"}`} title={`Good day, ${organisation.tradeName || organisation.legalName}`} description="Here’s the current position from posted accounting records." action={<button className="books-primary" onClick={() => onNavigate("invoices")}><Plus />New invoice</button>} />
    <div className="books-metrics">{metrics.map(([key, label, Icon, tone]) => <button key={key} className={`books-metric tone-${tone}`} onClick={() => onNavigate(key === "payables" || key === "expenses" ? "bills" : key === "bankAndCash" ? "banking" : key === "gstPayable" ? "gst" : key === "profitLoss" ? "reports" : "invoices")}>
      <span><Icon /></span><small>{label}</small><strong>{inr(data.summary[key])}</strong><i><ArrowRight />View details</i>
    </button>)}</div>

    <div className="books-dashboard-grid">
      <section className="books-panel books-cash-chart">
        <header><div><h2>Cash-flow movement</h2><p>Net movement through posted cash and bank ledger lines</p></div><button onClick={() => onNavigate("reports")}>View cash flow <ArrowRight /></button></header>
        {data.cashFlow.length ? <div className="books-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.cashFlow.map((item) => ({ ...item, net: Number(item.net) }))} margin={{ top: 15, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="booksCash" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.32}/><stop offset="100%" stopColor="#6d5dfc" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e8eaf0" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11}/><YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}/><Tooltip formatter={(value) => inr(Number(value))}/><Area type="monotone" dataKey="net" stroke="#6d5dfc" strokeWidth={2.5} fill="url(#booksCash)"/></AreaChart></ResponsiveContainer></div> : <EmptyState icon={TrendingUp} title="Cash flow begins after posting" description="Post an invoice and record a payment to see actual movement here." action={<button className="books-secondary" onClick={() => onNavigate("invoices")}>Create first invoice</button>} />}
      </section>

      <section className="books-panel books-quick-actions"><header><div><h2>Quick actions</h2><p>Common accounting workflows</p></div></header><div>
        <button onClick={() => onNavigate("invoices")}><span><ReceiptIndianRupee /></span><div><strong>Create GST invoice</strong><small>Draft and post a tax invoice</small></div><ArrowRight /></button>
        <button onClick={() => onNavigate("customers")}><span><Users /></span><div><strong>Add customer</strong><small>Store GSTIN and payment terms</small></div><ArrowRight /></button>
        <button onClick={() => onNavigate("bills")}><span><ShoppingCart /></span><div><strong>Enter vendor bill</strong><small>Record payable and input GST</small></div><ArrowRight /></button>
        <button onClick={() => onNavigate("documents")}><span><FileText /></span><div><strong>Upload document</strong><small>Link records and evidence</small></div><ArrowRight /></button>
      </div></section>
    </div>

    <div className="books-dashboard-grid books-dashboard-bottom">
      <section className="books-panel"><header><div><h2>Compliance deadlines</h2><p>Linked from My Entities</p></div></header>{data.compliance.length ? <div className="books-list">{data.compliance.map((item) => <div key={item.id}><span className="books-list-icon"><CalendarClock /></span><div><strong>{item.title}</strong><small>{item.category.replaceAll("_", " ")} · due {indianDate(item.dueDate)}</small></div><Status value={item.status}/></div>)}</div> : <EmptyState icon={CalendarClock} title="No open linked deadlines" description="Compliance tasks for the linked INCroute entity will appear here." />}</section>
      <section className="books-panel"><header><div><h2>Recent activity</h2><p>Append-only Books audit trail</p></div></header>{data.activity.length ? <div className="books-list">{data.activity.map((item) => <div key={item.id}><span className="books-list-icon"><FileText /></span><div><strong>{item.action.replaceAll("_", " ").replaceAll(".", " · ")}</strong><small>{item.entityType.replaceAll("_", " ")} · {indianDate(item.createdAt)}</small></div></div>)}</div> : <EmptyState icon={FileText} title="No activity yet" description="Organisation, master and transaction changes will be recorded here." />}</section>
    </div>
  </div>;
}

