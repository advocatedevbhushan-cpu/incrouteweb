import React, { useEffect, useState } from "react";
import { ArrowRight, BadgeIndianRupee, Banknote, BookOpen, Building2, CalendarClock, CheckCircle2, ClipboardList, FileText, Landmark, LockKeyhole, Settings, ShoppingCart } from "lucide-react";
import { booksApi, indianDate } from "../api";
import type { BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./Common";

const modules: Record<string, { eyebrow: string; title: string; description: string; icon: any; features: string[]; nextRoute?: string; nextLabel?: string }> = {
  sales: { eyebrow: "Sales", title: "Sales workflow", description: "Quotations, orders, challans, recurring invoices, credit notes and collections.", icon: FileText, features: ["GST invoices are active", "Balanced posting is active", "Payments and PDF export are active"], nextRoute: "invoices", nextLabel: "Open invoices" },
  purchases: { eyebrow: "Purchases", title: "Purchases workflow", description: "Purchase orders, vendor bills, expenses, approvals, credits and payments.", icon: ShoppingCart, features: ["Vendor masters are active", "Purchase schema is installed", "Bill posting screens are the next delivery phase"], nextRoute: "vendors", nextLabel: "Open vendors" },
  bills: { eyebrow: "Purchases", title: "Bills & expenses", description: "The tenant-isolated bill, bill-line, payment and approval structures are ready for the next incremental phase.", icon: ClipboardList, features: ["Drafts will not affect the ledger", "Posted bills will debit expense/input GST", "Corrections will use reversals and credits"], nextRoute: "vendors", nextLabel: "Prepare vendors" },
  banking: { eyebrow: "Banking", title: "Banking & reconciliation", description: "Bank accounts, imported transactions and reconciliation records are installed without enabling automatic feeds.", icon: Landmark, features: ["Manual customer payments are active", "Bank statement import is next", "Automatic banking remains disabled until ledger tests mature"] },
  gst: { eyebrow: "India tax", title: "GST workspace", description: "GST registration, place-of-supply and tax ledgers are active. Working returns and exports follow transaction coverage.", icon: BadgeIndianRupee, features: ["CGST/SGST and IGST calculation is active", "GST invoice tax totals are posted", "GSTR-1 and GSTR-3B working reports are next"] },
  documents: { eyebrow: "Records", title: "Accounting documents", description: "Books document links reuse the existing INCroute R2 document vault and signed-download controls.", icon: FileText, features: ["Organisation and transaction link schema is installed", "Existing portal documents remain unchanged", "Books attachment UI is the next document phase"] },
  settings: { eyebrow: "Configuration", title: "Books settings", description: "Organisation preferences, roles, fiscal years, GST registrations and numbering live here as each editor is enabled.", icon: Settings, features: ["Organisation and fiscal-year setup is active", "Role and action permission schema is active", "Period and numbering editors are next"] },
};

function AuditTrail({ organisation }:{ organisation: BooksOrganisation }) {
  const [entries, setEntries] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { setLoading(true); booksApi<{ entries: any[] }>(`/audit?organisationId=${encodeURIComponent(organisation.id)}`).then((data) => setEntries(data.entries)).catch((cause) => setError(cause.message)).finally(() => setLoading(false)); }, [organisation.id]);
  if (loading) return <LoadingState label="Verifying audit chain" />;
  if (error) return <ErrorState message={error} />;
  return <div className="books-page"><PageHeader eyebrow="Accountant" title="Audit trail" description="Append-only, organisation-scoped changes chained with SHA-256 hashes." />
    <div className="books-accountant-cards"><div><span><BookOpen /></span><strong>Double-entry enforced</strong><p>Every posted source creates one balanced journal.</p></div><div><span><LockKeyhole /></span><strong>Period aware</strong><p>Posting rejects locked and unconfigured periods.</p></div><div><span><CheckCircle2 /></span><strong>No hard deletion</strong><p>Corrections use controlled reversal workflows.</p></div></div>
    <section className="books-panel">{entries.length ? <div className="books-list">{entries.map((entry) => <div key={entry.id}><span className="books-list-icon"><CalendarClock /></span><div><strong>{entry.action.replaceAll("_", " ").replaceAll(".", " · ")}</strong><small>{entry.entityType.replaceAll("_", " ")} · {indianDate(entry.createdAt)}</small></div><code>{String(entry.hash).slice(0,10)}…</code></div>)}</div> : <EmptyState icon={BookOpen} title="No audit events yet" description="Organisation and transaction events will appear here after setup." />}</section>
  </div>;
}

export default function ModuleStatus({ route, organisation, onNavigate }:{ route: string; organisation: BooksOrganisation; onNavigate: (route: string) => void }) {
  if (route === "accountant") return <AuditTrail organisation={organisation} />;
  const item = modules[route] || modules.settings;
  const Icon = item.icon;
  return <div className="books-page"><PageHeader eyebrow={item.eyebrow} title={item.title} description={item.description} />
    <section className="books-module-status"><span><Icon /></span><h2>Foundation ready</h2><p>This workspace is being enabled incrementally on the tested Books accounting core. No placeholder transactions or fabricated totals are shown.</p><div>{item.features.map((feature) => <p key={feature}><CheckCircle2 />{feature}</p>)}</div>{item.nextRoute && <button className="books-primary" onClick={() => onNavigate(item.nextRoute!)}>{item.nextLabel}<ArrowRight /></button>}</section>
  </div>;
}

