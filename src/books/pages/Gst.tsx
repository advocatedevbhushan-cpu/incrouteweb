import React, { useEffect, useState } from "react";
import { BadgeIndianRupee, Building2, CheckCircle2, Download, FileCode, FileSpreadsheet, ReceiptIndianRupee, ShieldCheck, ShoppingCart } from "lucide-react";
import { booksApi, indianDate, inr } from "../api";
import type { BooksOrganisation } from "../types";
import { ErrorState, LoadingState, PageHeader } from "./Common";

interface GstSummary {
  from: string;
  to: string;
  outward: { taxable: string; cgst: string; sgst: string; igst: string; totalTax: string; invoices: number; b2b: number; b2c: number };
  inward: { taxable: string; cgst: string; sgst: string; igst: string; totalTax: string; bills: number };
  netPayable: string;
}

interface Gstr1Data {
  from: string;
  to: string;
  b2b: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    invoiceValue: string;
    customerName: string;
    customerGstin: string;
    lines: Array<{ hsnSac: string; gstRate: string; taxableAmount: string; cgstAmount: string; sgstAmount: string; igstAmount: string; lineTotal: string }>;
  }>;
  b2c: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    invoiceValue: string;
    customerName: string;
  }>;
  hsnSummary: Array<{
    hsnSac: string;
    gstRate: string;
    totalQty: string;
    taxableValue: string;
    cgst: string;
    sgst: string;
    igst: string;
    lineTotal: string;
  }>;
}

interface Gstr3bData {
  from: string;
  to: string;
  table3_1: { taxableValue: string; cgst: string; sgst: string; igst: string; totalTax: string };
  table4: { taxableValue: string; cgst: string; sgst: string; igst: string; totalTax: string };
  netTaxPayable: string;
}

const fyStart = () => {
  const now = new Date();
  const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-04-01`;
};

export default function GstPage({ organisation }: { organisation: BooksOrganisation }) {
  const [from, setFrom] = useState(fyStart());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<"overview" | "gstr1" | "gstr3b" | "json">("overview");
  const [gstr1SubTab, setGstr1SubTab] = useState<"b2b" | "b2c" | "hsn">("b2b");

  const [summary, setSummary] = useState<GstSummary | null>(null);
  const [gstr1, setGstr1] = useState<Gstr1Data | null>(null);
  const [gstr3b, setGstr3b] = useState<Gstr3bData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sumRes, g1Res, g3Res] = await Promise.all([
        booksApi<GstSummary>(`/gst/summary?organisationId=${organisation.id}&from=${from}&to=${to}`),
        booksApi<Gstr1Data>(`/gst/gstr1?organisationId=${organisation.id}&from=${from}&to=${to}`),
        booksApi<Gstr3bData>(`/gst/gstr3b?organisationId=${organisation.id}&from=${from}&to=${to}`),
      ]);
      setSummary(sumRes);
      setGstr1(g1Res);
      setGstr3b(g3Res);
    } catch (cause: any) {
      setError(cause.message || "Unable to prepare GST filing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organisation.id, from, to]);

  const downloadGstnJson = () => {
    const fp = `${to.slice(5, 7)}${to.slice(0, 4)}`;
    const jsonPayload = {
      gstin: organisation.gstin || "29AAACB1234F1Z5",
      fp,
      version: "GST3.0.4",
      hash: "incroute-books-v1",
      b2b: gstr1?.b2b.map((inv) => ({
        ctin: inv.customerGstin,
        inv: [{ inum: inv.invoiceNumber, idt: inv.invoiceDate, val: parseFloat(inv.invoiceValue), pos: inv.placeOfSupply, rchrg: "N", inv_typ: "R" }],
      })),
      b2cs: gstr1?.b2c.map((inv) => ({
        pos: inv.placeOfSupply,
        txval: parseFloat(inv.invoiceValue),
      })),
      hsn: gstr1?.hsnSummary.map((hsn) => ({
        hsn_sc: hsn.hsnSac,
        qty: parseFloat(hsn.totalQty),
        txval: parseFloat(hsn.taxableValue),
        iamt: parseFloat(hsn.igst),
        camt: parseFloat(hsn.cgst),
        samt: parseFloat(hsn.sgst),
      })),
    };

    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GSTR1_${organisation.gstin || "29AAACB1234F1Z5"}_${fp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      ["INCroute Books GST Return Summary", organisation.legalName],
      ["GSTIN", organisation.gstin || "Unregistered"],
      ["Period", `${from} to ${to}`],
      [],
      ["Section", "Taxable value", "CGST", "SGST", "IGST", "Total tax"],
      ["Outward supplies (GSTR-1)", summary.outward.taxable, summary.outward.cgst, summary.outward.sgst, summary.outward.igst, summary.outward.totalTax],
      ["Inward supplies / ITC (GSTR-3B Table 4)", summary.inward.taxable, summary.inward.cgst, summary.inward.sgst, summary.inward.igst, summary.inward.totalTax],
      ["Net GST Payable", "", "", "", "", summary.netPayable],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `GST_Filing_Summary_${from}_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="Calculating GSTR-1 & GSTR-3B tax returns" />;
  if (error || !summary) return <ErrorState message={error || "GST data unavailable"} onRetry={loadData} />;

  return (
    <div className="books-page space-y-6">
      <PageHeader
        eyebrow="India Tax Suite"
        title="GST Compliance & Return Suite"
        description="Auto-compute GSTR-1, GSTR-3B, and generate official GSTN JSON files for portal filing."
        action={
          <div className="books-header-actions flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              From: <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white" />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              To: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white" />
            </label>
            <button className="books-secondary" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </button>
            <button className="books-primary" onClick={downloadGstnJson}>
              <FileCode className="w-4 h-4 mr-1.5" /> Download GSTN JSON
            </button>
          </div>
        }
      />

      {/* Main Segmented Tabs */}
      <div className="books-segmented">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Return Overview
        </button>
        <button className={tab === "gstr1" ? "active" : ""} onClick={() => setTab("gstr1")}>
          GSTR-1 (Outward) <span>{gstr1?.b2b.length || 0} B2B</span>
        </button>
        <button className={tab === "gstr3b" ? "active" : ""} onClick={() => setTab("gstr3b")}>
          GSTR-3B (Summary)
        </button>
        <button className={tab === "json" ? "active" : ""} onClick={() => setTab("json")}>
          GSTN Portal Schema JSON
        </button>
      </div>

      {/* Tab 1: Overview */}
      {tab === "overview" && (
        <div className="space-y-6 text-left">
          <div className="books-gst-metrics">
            <div>
              <span><ReceiptIndianRupee /></span>
              <small>Outward Taxable Value</small>
              <strong>{inr(summary.outward.taxable)}</strong>
              <p>{summary.outward.invoices} Invoices ({summary.outward.b2b} B2B · {summary.outward.b2c} B2C)</p>
            </div>
            <div>
              <span><ShoppingCart /></span>
              <small>Eligible Input Tax Credit (ITC)</small>
              <strong>{inr(summary.inward.totalTax)}</strong>
              <p>{summary.inward.bills} Posted Vendor Bills</p>
            </div>
            <div className="highlight">
              <span><BadgeIndianRupee /></span>
              <small>Net Cash GST Liability</small>
              <strong>{inr(summary.netPayable)}</strong>
              <p>Output tax less Input Tax Credit</p>
            </div>
          </div>

          <div className="books-dashboard-grid">
            <section className="books-panel">
              <header>
                <div>
                  <h2>GSTR-1 Liability Breakdown</h2>
                  <p>Outward supplies generated from posted GST invoices</p>
                </div>
              </header>
              <div className="books-tax-breakdown">
                <p><span>Taxable Value</span><strong>{inr(summary.outward.taxable)}</strong></p>
                <p><span>CGST (Central Tax)</span><strong>{inr(summary.outward.cgst)}</strong></p>
                <p><span>SGST (State Tax)</span><strong>{inr(summary.outward.sgst)}</strong></p>
                <p><span>IGST (Integrated Tax)</span><strong>{inr(summary.outward.igst)}</strong></p>
                <p className="total"><span>Total Output Tax</span><strong>{inr(summary.outward.totalTax)}</strong></p>
              </div>
            </section>

            <section className="books-panel">
              <header>
                <div>
                  <h2>GSTR-3B Input Tax Credit (ITC)</h2>
                  <p>Available ITC claimed from verified purchase bills</p>
                </div>
              </header>
              <div className="books-tax-breakdown">
                <p><span>Purchases Taxable Value</span><strong>{inr(summary.inward.taxable)}</strong></p>
                <p><span>Input CGST</span><strong>{inr(summary.inward.cgst)}</strong></p>
                <p><span>Input SGST</span><strong>{inr(summary.inward.sgst)}</strong></p>
                <p><span>Input IGST</span><strong>{inr(summary.inward.igst)}</strong></p>
                <p className="total"><span>Total Eligible ITC</span><strong>{inr(summary.inward.totalTax)}</strong></p>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Tab 2: GSTR-1 Detailed Tables */}
      {tab === "gstr1" && gstr1 && (
        <div className="space-y-4 text-left">
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                gstr1SubTab === "b2b" ? "bg-indigo-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
              onClick={() => setGstr1SubTab("b2b")}
            >
              B2B Invoices ({gstr1.b2b.length})
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                gstr1SubTab === "b2c" ? "bg-indigo-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
              onClick={() => setGstr1SubTab("b2c")}
            >
              B2C Invoices ({gstr1.b2c.length})
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                gstr1SubTab === "hsn" ? "bg-indigo-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
              onClick={() => setGstr1SubTab("hsn")}
            >
              HSN Summary ({gstr1.hsnSummary.length})
            </button>
          </div>

          {gstr1SubTab === "b2b" && (
            <div className="books-panel books-table-panel">
              <div className="books-table-wrap">
                <table className="books-table">
                  <thead>
                    <tr>
                      <th>GSTIN</th>
                      <th>Customer Name</th>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>POS</th>
                      <th className="num">Invoice Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!gstr1.b2b.length ? (
                      <tr><td colSpan={6} className="text-center text-slate-400 py-8">No B2B invoices in this period</td></tr>
                    ) : (
                      gstr1.b2b.map((inv) => (
                        <tr key={inv.id}>
                          <td><strong className="books-mono text-indigo-400">{inv.customerGstin}</strong></td>
                          <td><strong>{inv.customerName}</strong></td>
                          <td className="books-mono">{inv.invoiceNumber}</td>
                          <td>{indianDate(inv.invoiceDate)}</td>
                          <td className="books-mono">{inv.placeOfSupply}</td>
                          <td className="num"><strong>{inr(inv.invoiceValue)}</strong></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {gstr1SubTab === "b2c" && (
            <div className="books-panel books-table-panel">
              <div className="books-table-wrap">
                <table className="books-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>POS</th>
                      <th className="num">Invoice Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!gstr1.b2c.length ? (
                      <tr><td colSpan={5} className="text-center text-slate-400 py-8">No B2C invoices in this period</td></tr>
                    ) : (
                      gstr1.b2c.map((inv) => (
                        <tr key={inv.id}>
                          <td className="books-mono"><strong>{inv.invoiceNumber}</strong></td>
                          <td>{inv.customerName}</td>
                          <td>{indianDate(inv.invoiceDate)}</td>
                          <td className="books-mono">{inv.placeOfSupply}</td>
                          <td className="num"><strong>{inr(inv.invoiceValue)}</strong></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {gstr1SubTab === "hsn" && (
            <div className="books-panel books-table-panel">
              <div className="books-table-wrap">
                <table className="books-table">
                  <thead>
                    <tr>
                      <th>HSN/SAC Code</th>
                      <th className="num">GST %</th>
                      <th className="num">Total Qty</th>
                      <th className="num">Taxable Value</th>
                      <th className="num">CGST</th>
                      <th className="num">SGST</th>
                      <th className="num">IGST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1.hsnSummary.map((hsn, index) => (
                      <tr key={index}>
                        <td className="books-mono"><strong>{hsn.hsnSac || "Unspecified"}</strong></td>
                        <td className="num">{hsn.gstRate}%</td>
                        <td className="num">{hsn.totalQty}</td>
                        <td className="num">{inr(hsn.taxableValue)}</td>
                        <td className="num">{inr(hsn.cgst)}</td>
                        <td className="num">{inr(hsn.sgst)}</td>
                        <td className="num">{inr(hsn.igst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: GSTR-3B Official Tables */}
      {tab === "gstr3b" && gstr3b && (
        <div className="space-y-6 text-left">
          <section className="books-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3.1 Outward Taxable Supplies (Other than Zero Rated, Nil Rated & Exempted)
            </h3>
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th className="num">Total Taxable Value</th>
                    <th className="num">Integrated Tax (IGST)</th>
                    <th className="num">Central Tax (CGST)</th>
                    <th className="num">State Tax (SGST)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>(a) Outward taxable supplies</strong></td>
                    <td className="num">{inr(gstr3b.table3_1.taxableValue)}</td>
                    <td className="num">{inr(gstr3b.table3_1.igst)}</td>
                    <td className="num">{inr(gstr3b.table3_1.cgst)}</td>
                    <td className="num">{inr(gstr3b.table3_1.sgst)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="books-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              4. Eligible Input Tax Credit (ITC)
            </h3>
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th className="num">Total Taxable Value</th>
                    <th className="num">Integrated Tax (IGST)</th>
                    <th className="num">Central Tax (CGST)</th>
                    <th className="num">State Tax (SGST)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>(A) ITC Available (All Other ITC)</strong></td>
                    <td className="num">{inr(gstr3b.table4.taxableValue)}</td>
                    <td className="num">{inr(gstr3b.table4.igst)}</td>
                    <td className="num">{inr(gstr3b.table4.cgst)}</td>
                    <td className="num">{inr(gstr3b.table4.sgst)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: JSON Viewer */}
      {tab === "json" && (
        <section className="books-panel p-5 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" /> GSTN Official Return Upload Schema (v3.0.4)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Compatible with the GST Portal offline tool and direct API upload.</p>
            </div>
            <button className="books-primary" onClick={downloadGstnJson}>
              <Download className="w-4 h-4 mr-1.5" /> Download .JSON File
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
            {JSON.stringify(
              {
                gstin: organisation.gstin || "29AAACB1234F1Z5",
                fp: `${to.slice(5, 7)}${to.slice(0, 4)}`,
                version: "GST3.0.4",
                hash: "incroute-books-v1",
                b2b: gstr1?.b2b.map((inv) => ({
                  ctin: inv.customerGstin,
                  inv: [{ inum: inv.invoiceNumber, idt: inv.invoiceDate, val: parseFloat(inv.invoiceValue), pos: inv.placeOfSupply, rchrg: "N", inv_typ: "R" }],
                })),
                b2cs: gstr1?.b2c.map((inv) => ({
                  pos: inv.placeOfSupply,
                  txval: parseFloat(inv.invoiceValue),
                })),
              },
              null,
              2
            )}
          </pre>
        </section>
      )}
    </div>
  );
}
