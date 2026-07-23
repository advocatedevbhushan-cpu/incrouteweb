import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Download, FileBarChart, Lock, Printer, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import { booksApi, indianDate, inr } from "../api";
import type { BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./Common";

interface TrialBalance {
  asOf: string;
  accounts: Array<{ id: string; code: string; name: string; type: string; subType: string; debit: string; credit: string }>;
  totals: { debit: string; credit: string; balanced: boolean };
}

interface Financials {
  from: string;
  to: string;
  profitAndLoss: {
    rows: Array<{ id: string; code: string; name: string; type: string; amount: string }>;
    totals: { income: string; expenses: string; netProfit: string };
  };
  balanceSheet: {
    rows: Array<{ id: string; code: string; name: string; type: string; amount: string }>;
    totals: { assets: string; liabilities: string; equity: string; currentPeriodEarnings: string; balanced: boolean };
  };
}

interface LedgerPosting {
  id: string;
  debit: string;
  credit: string;
  description: string;
  entryNumber: string;
  entryDate: string;
  sourceType: string;
  accountCode: string;
  accountName: string;
  contactName?: string;
}

interface AccountingPeriod {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  status: "OPEN" | "LOCKED";
  lockedAt?: string;
}

const fyStart = () => {
  const date = new Date();
  const year = date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
  return `${year}-04-01`;
};

export default function ReportsPage({ organisation }: { organisation: BooksOrganisation }) {
  const [tab, setTab] = useState<"trial" | "profit" | "balance" | "ledger" | "periods">("trial");
  const [trial, setTrial] = useState<TrialBalance | null>(null);
  const [financials, setFinancials] = useState<Financials | null>(null);

  const [ledgerAccounts, setLedgerAccounts] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [ledgerPostings, setLedgerPostings] = useState<LedgerPosting[]>([]);

  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  const [from, setFrom] = useState(fyStart());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const loadStatements = async () => {
    setLoading(true);
    setError("");
    try {
      const [trialData, financialData, periodData] = await Promise.all([
        booksApi<TrialBalance>(`/reports/trial-balance?organisationId=${organisation.id}&asOf=${to}`),
        booksApi<Financials>(`/reports/financials?organisationId=${organisation.id}&from=${from}&to=${to}`),
        booksApi<{ periods: AccountingPeriod[] }>(`/periods?organisationId=${organisation.id}`),
      ]);
      setTrial(trialData);
      setFinancials(financialData);
      setPeriods(periodData.periods);
    } catch (cause: any) {
      setError(cause.message || "Unable to prepare financial reports");
    } finally {
      setLoading(false);
    }
  };

  const loadGeneralLedger = async () => {
    setLoadingLedger(true);
    try {
      const data = await booksApi<{ accounts: Array<{ id: string; code: string; name: string }>; postings: LedgerPosting[] }>(
        `/reports/general-ledger?organisationId=${organisation.id}&accountId=${selectedAccountId}&from=${from}&to=${to}`
      );
      setLedgerAccounts(data.accounts);
      setLedgerPostings(data.postings);
    } catch (cause: any) {
      setError(cause.message || "Unable to load general ledger");
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    loadStatements();
  }, [organisation.id, from, to]);

  useEffect(() => {
    if (tab === "ledger") {
      loadGeneralLedger();
    }
  }, [tab, selectedAccountId, from, to]);

  const handleLockPeriod = async (periodId: string) => {
    try {
      await booksApi(`/periods/${periodId}/lock`, {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id }),
      });
      await loadStatements();
    } catch (cause: any) {
      alert(cause.message || "Failed to lock accounting period");
    }
  };

  const exportCsv = () => {
    if (!trial || !financials) return;
    let rows: any[][] = [];
    if (tab === "trial") {
      rows = [
        ["Code", "Account", "Type", "Debit", "Credit"],
        ...trial.accounts.map((a) => [a.code, a.name, a.type, a.debit, a.credit]),
        ["", "Totals", "", trial.totals.debit, trial.totals.credit],
      ];
    } else if (tab === "profit") {
      rows = [
        ["Code", "Account", "Class", "Amount"],
        ...financials.profitAndLoss.rows.map((a) => [a.code, a.name, a.type, a.amount]),
        [],
        ["", "Income", "", financials.profitAndLoss.totals.income],
        ["", "Expenses", "", financials.profitAndLoss.totals.expenses],
        ["", "Net Profit / Loss", "", financials.profitAndLoss.totals.netProfit],
      ];
    } else if (tab === "balance") {
      rows = [
        ["Code", "Account", "Class", "Amount"],
        ...financials.balanceSheet.rows.map((a) => [a.code, a.name, a.type, a.amount]),
        [],
        ["", "Assets", "", financials.balanceSheet.totals.assets],
        ["", "Liabilities", "", financials.balanceSheet.totals.liabilities],
        ["", "Equity", "", financials.balanceSheet.totals.equity],
        ["", "Current Period Earnings", "", financials.balanceSheet.totals.currentPeriodEarnings],
      ];
    } else if (tab === "ledger") {
      rows = [
        ["Date", "Entry #", "Account", "Narration", "Party", "Debit", "Credit"],
        ...ledgerPostings.map((p) => [p.entryDate, p.entryNumber, `${p.accountCode} - ${p.accountName}`, p.description, p.contactName || "", p.debit, p.credit]),
      ];
    }

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tab}-report-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="Preparing financial statements and double-entry reports" />;
  if (error || !trial || !financials) return <ErrorState message={error || "Reports unavailable"} onRetry={loadStatements} />;

  const trialRows = trial.accounts.filter((a) => Number(a.debit) || Number(a.credit));
  const plRows = financials.profitAndLoss.rows.filter((a) => Number(a.amount));
  const bsRows = financials.balanceSheet.rows.filter((a) => Number(a.amount));

  return (
    <div className="books-page space-y-6">
      <PageHeader
        eyebrow="Financial Reports"
        title={
          tab === "trial"
            ? "Trial Balance"
            : tab === "profit"
            ? "Profit & Loss Statement"
            : tab === "balance"
            ? "Balance Sheet"
            : tab === "ledger"
            ? "General Ledger Explorer"
            : "Period Locking & Audits"
        }
        description="Financial statements generated only from posted, tenant-scoped double-entry journal lines."
        action={
          <div className="books-header-actions flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              From: <input type="date" disabled={tab === "trial" || tab === "balance"} value={from} onChange={(e) => setFrom(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white" />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              To: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white" />
            </label>
            <button className="books-secondary" onClick={() => window.print()} title="Print Financial Report">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </button>
            <button className="books-secondary" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </button>
          </div>
        }
      />

      <div className="books-segmented">
        <button className={tab === "trial" ? "active" : ""} onClick={() => setTab("trial")}>
          Trial Balance
        </button>
        <button className={tab === "profit" ? "active" : ""} onClick={() => setTab("profit")}>
          Profit & Loss
        </button>
        <button className={tab === "balance" ? "active" : ""} onClick={() => setTab("balance")}>
          Balance Sheet
        </button>
        <button className={tab === "ledger" ? "active" : ""} onClick={() => setTab("ledger")}>
          General Ledger
        </button>
        <button className={tab === "periods" ? "active" : ""} onClick={() => setTab("periods")}>
          Period Lock ({periods.length})
        </button>
      </div>

      {/* Trial Balance */}
      {tab === "trial" && (
        <>
          <div className={`books-balance-banner ${trial.totals.balanced ? "is-balanced" : "is-unbalanced"}`}>
            <span>{trial.totals.balanced ? <CheckCircle2 /> : <Scale />}</span>
            <div>
              <strong>{trial.totals.balanced ? "Ledger is balanced" : "Ledger requires attention"}</strong>
              <p>
                Total debits {inr(trial.totals.debit)} · Total credits {inr(trial.totals.credit)}
              </p>
            </div>
          </div>
          <ReportTable rows={trialRows.map((a) => ({ ...a, amount: "" }))} columns="trial" totals={[trial.totals.debit, trial.totals.credit]} />
        </>
      )}

      {/* Profit & Loss */}
      {tab === "profit" && (
        <>
          <div className="books-report-summary">
            <div>
              <span>Operating Income</span>
              <strong>{inr(financials.profitAndLoss.totals.income)}</strong>
            </div>
            <div>
              <span>Total Expenses</span>
              <strong>{inr(financials.profitAndLoss.totals.expenses)}</strong>
            </div>
            <div className="highlight">
              <span>Net Profit / Loss</span>
              <strong>{inr(financials.profitAndLoss.totals.netProfit)}</strong>
            </div>
          </div>
          <ReportTable rows={plRows} columns="amount" totals={[financials.profitAndLoss.totals.netProfit]} />
        </>
      )}

      {/* Balance Sheet */}
      {tab === "balance" && (
        <>
          <div className={`books-balance-banner ${financials.balanceSheet.totals.balanced ? "is-balanced" : "is-unbalanced"}`}>
            <span>{financials.balanceSheet.totals.balanced ? <CheckCircle2 /> : <Scale />}</span>
            <div>
              <strong>{financials.balanceSheet.totals.balanced ? "Balance Sheet is in balance" : "Balance Sheet requires review"}</strong>
              <p>Assets equal liabilities, equity, and retained current-period earnings.</p>
            </div>
          </div>
          <div className="books-report-summary four">
            <div>
              <span>Assets</span>
              <strong>{inr(financials.balanceSheet.totals.assets)}</strong>
            </div>
            <div>
              <span>Liabilities</span>
              <strong>{inr(financials.balanceSheet.totals.liabilities)}</strong>
            </div>
            <div>
              <span>Equity</span>
              <strong>{inr(financials.balanceSheet.totals.equity)}</strong>
            </div>
            <div className="highlight">
              <span>Current Earnings</span>
              <strong>{inr(financials.balanceSheet.totals.currentPeriodEarnings)}</strong>
            </div>
          </div>
          <ReportTable rows={bsRows} columns="amount" totals={[financials.balanceSheet.totals.assets]} />
        </>
      )}

      {/* General Ledger Explorer */}
      {tab === "ledger" && (
        <section className="books-panel books-table-panel text-left space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 pt-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">General Ledger Explorer</h3>
                <p className="text-xs text-slate-400">Inspect double-entry journal postings chronologically by account master.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-mono">
                Account Master:
                <select
                  className="ml-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  <option value="">All Account Ledgers</option>
                  {ledgerAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loadingLedger ? (
            <LoadingState label="Loading general ledger journal postings" />
          ) : !ledgerPostings.length ? (
            <EmptyState icon={BookOpen} title="No journal postings found" description="Post an invoice, bill, payment or expense to generate double-entry ledger lines." />
          ) : (
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entry #</th>
                    <th>Account</th>
                    <th>Narration</th>
                    <th>Party</th>
                    <th className="num">Debit</th>
                    <th className="num">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerPostings.map((post) => (
                    <tr key={post.id}>
                      <td className="books-mono text-xs">{indianDate(post.entryDate)}</td>
                      <td className="books-mono font-bold text-indigo-400">{post.entryNumber}</td>
                      <td>
                        <strong>{post.accountName}</strong>
                        <small className="books-cell-sub books-mono">{post.accountCode}</small>
                      </td>
                      <td className="text-xs">{post.description}</td>
                      <td className="text-xs text-slate-300">{post.contactName || "—"}</td>
                      <td className="num font-mono">{Number(post.debit) ? inr(post.debit) : "—"}</td>
                      <td className="num font-mono">{Number(post.credit) ? inr(post.credit) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Accountant Period Lock Panel */}
      {tab === "periods" && (
        <section className="books-panel p-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Fiscal Period Locking</h3>
              <p className="text-xs text-slate-400">Lock completed financial periods after audit sign-off to prevent historical journal alterations.</p>
            </div>
          </div>

          <div className="books-table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Period Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!periods.length ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-8">
                      No accounting periods configured for this fiscal year.
                    </td>
                  </tr>
                ) : (
                  periods.map((period) => (
                    <tr key={period.id}>
                      <td>
                        <strong className="text-white">{period.name}</strong>
                      </td>
                      <td className="books-mono text-xs">{indianDate(period.startsOn)}</td>
                      <td className="books-mono text-xs">{indianDate(period.endsOn)}</td>
                      <td>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                            period.status === "LOCKED" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {period.status}
                        </span>
                      </td>
                      <td>
                        {period.status === "OPEN" ? (
                          <button className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer" onClick={() => handleLockPeriod(period.id)}>
                            Lock Period
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function ReportTable({ rows, columns, totals }: { rows: any[]; columns: "trial" | "amount"; totals: string[] }) {
  return (
    <section className="books-panel books-table-panel text-left">
      {rows.length ? (
        <div className="books-table-wrap">
          <table className="books-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Master</th>
                <th>Class</th>
                {columns === "trial" ? (
                  <>
                    <th className="num">Debit</th>
                    <th className="num">Credit</th>
                  </>
                ) : (
                  <th className="num">Net Amount</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong className="books-mono text-indigo-400">{a.code}</strong>
                  </td>
                  <td>
                    <strong>{a.name}</strong>
                  </td>
                  <td>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">{a.type}</span>
                  </td>
                  {columns === "trial" ? (
                    <>
                      <td className="num font-mono">{Number(a.debit) ? inr(a.debit) : "—"}</td>
                      <td className="num font-mono">{Number(a.credit) ? inr(a.credit) : "—"}</td>
                    </>
                  ) : (
                    <td className="num font-mono">
                      <strong>{inr(a.amount)}</strong>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {columns === "trial" && (
              <tfoot>
                <tr>
                  <td colSpan={3} className="font-bold">Total Statement Balance</td>
                  <td className="num font-mono font-bold text-white">{inr(totals[0])}</td>
                  <td className="num font-mono font-bold text-white">{inr(totals[1])}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <EmptyState icon={FileBarChart} title="No posted balances yet" description="Draft transactions do not enter financial reports. Post an invoice or bill to populate this statement." />
      )}
    </section>
  );
}
