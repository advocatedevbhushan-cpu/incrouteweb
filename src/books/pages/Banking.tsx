import React, { useEffect, useState } from "react";
import { ArrowRight, Banknote, Building2, CheckCircle2, CreditCard, FileSpreadsheet, IndianRupee, Landmark, Plus, RefreshCw, Search, ShieldCheck, UploadCloud, WalletCards, X } from "lucide-react";
import { booksApi, indianDate, inr } from "../api";
import type { BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader, Status } from "./Common";

interface BankAccount {
  id: string;
  accountId: string;
  accountName: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  ifscCode?: string;
  accountType: "CURRENT" | "SAVINGS" | "PETTY_CASH" | "CREDIT_CARD";
  openingBalance: string;
  currentBalance: string;
  unmatchedCount: number;
}

interface StatementLine {
  id: string;
  transactionDate: string;
  narration: string;
  referenceNumber?: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: string;
  status: "UNMATCHED" | "MATCHED" | "EXCLUDED";
  suggestion?: {
    type: string;
    id: string;
    label: string;
  };
}

export default function BankingPage({ organisation, onNavigate }: { organisation: BooksOrganisation; onNavigate: (route: string) => void }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [statementLines, setStatementLines] = useState<StatementLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLines, setLoadingLines] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showImportStatement, setShowImportStatement] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [accountForm, setAccountForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    accountType: "CURRENT",
    openingBalance: "0.00",
  });

  const [csvText, setCsvText] = useState(
    `Date,Narration,Deposit,Withdrawal,Reference\n2026-07-20,Client Payment - Acme Inc,1180.00,0.00,UPI/123456\n2026-07-21,Office Stationery Vendor,0.00,450.50,NEFT/887711\n2026-07-22,Consulting Retainer,5000.00,0.00,IMPS/998811`
  );

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await booksApi<{ bankAccounts: BankAccount[] }>(`/bank-accounts?organisationId=${organisation.id}`);
      setAccounts(data.bankAccounts);
      if (data.bankAccounts.length && !selectedAccountId) {
        setSelectedAccountId(data.bankAccounts[0].id);
      }
    } catch (cause: any) {
      setError(cause.message || "Unable to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const loadStatementLines = async (bankAccountId: string) => {
    setLoadingLines(true);
    try {
      const data = await booksApi<{ lines: StatementLine[] }>(
        `/bank-statements?organisationId=${organisation.id}&bankAccountId=${encodeURIComponent(bankAccountId)}`
      );
      setStatementLines(data.lines);
    } catch (cause: any) {
      setError(cause.message || "Unable to load statement lines");
    } finally {
      setLoadingLines(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [organisation.id]);

  useEffect(() => {
    if (selectedAccountId) {
      loadStatementLines(selectedAccountId);
    }
  }, [selectedAccountId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/bank-accounts", {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id, ...accountForm }),
      });
      setShowAddAccount(false);
      setAccountForm({ accountName: "", accountNumber: "", bankName: "", branchName: "", ifscCode: "", accountType: "CURRENT", openingBalance: "0.00" });
      await loadAccounts();
    } catch (cause: any) {
      setFormError(cause.message || "Failed to add bank account");
    } finally {
      setSaving(false);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId && accounts.length) setSelectedAccountId(accounts[0].id);
    const targetAccountId = selectedAccountId || (accounts[0] && accounts[0].id);
    if (!targetAccountId) {
      setFormError("Please create a bank account first");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const lines = csvText.trim().split("\n").slice(1);
      const parsedRows = lines.map((line) => {
        const [dateStr, narration, depStr, wthStr, refStr] = line.split(",");
        const deposit = parseFloat(depStr || "0") || 0;
        const withdrawal = parseFloat(wthStr || "0") || 0;
        const isDeposit = deposit > 0;
        const amount = isDeposit ? deposit.toFixed(2) : withdrawal.toFixed(2);
        return {
          transactionDate: dateStr ? dateStr.trim() : new Date().toISOString().slice(0, 10),
          narration: narration ? narration.trim() : "Bank transaction",
          type: isDeposit ? "DEPOSIT" : "WITHDRAWAL",
          amount,
          referenceNumber: refStr ? refStr.trim() : null,
        };
      });

      await booksApi("/bank-statements/import", {
        method: "POST",
        body: JSON.stringify({
          organisationId: organisation.id,
          bankAccountId: targetAccountId,
          filename: "bank_statement.csv",
          rows: parsedRows,
        }),
      });

      setShowImportStatement(false);
      await loadAccounts();
      await loadStatementLines(targetAccountId);
    } catch (cause: any) {
      setFormError(cause.message || "Failed to import statement lines");
    } finally {
      setSaving(false);
    }
  };

  const handleReconcileLine = async (line: StatementLine, action: "MATCH" | "EXCLUDE") => {
    setSaving(true);
    try {
      await booksApi("/bank-statements/reconcile", {
        method: "POST",
        body: JSON.stringify({
          organisationId: organisation.id,
          lineId: line.id,
          action,
          matchedSourceType: line.suggestion ? line.suggestion.type : null,
          matchedSourceId: line.suggestion ? line.suggestion.id : null,
        }),
      });
      await loadAccounts();
      await loadStatementLines(selectedAccountId);
    } catch (cause: any) {
      alert(cause.message || "Reconciliation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading bank and cash accounts" />;
  if (error) return <ErrorState message={error} onRetry={loadAccounts} />;

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const totalUnmatched = accounts.reduce((sum, acc) => sum + (acc.unmatchedCount || 0), 0);
  const activeAccount = accounts.find((acc) => acc.id === selectedAccountId) || accounts[0];

  const filteredLines = statementLines.filter((line) =>
    [line.narration, line.referenceNumber || "", line.amount, line.status]
      .some((val) => val.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="books-page space-y-6">
      <PageHeader
        eyebrow="Banking"
        title="Banking & reconciliation"
        description="Track business bank accounts, import CSV statements, and match transactions with double-entry ledgers."
        action={
          <div className="books-header-actions flex gap-3">
            <button className="books-secondary" onClick={() => setShowImportStatement(true)}>
              <UploadCloud className="w-4 h-4 mr-1.5" /> Import Statement (CSV)
            </button>
            <button className="books-primary" onClick={() => setShowAddAccount(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Bank Account
            </button>
          </div>
        }
      />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Cash & Bank Balance</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{inr(totalBalance.toFixed(2))}</p>
          <span className="text-[11px] text-emerald-400/80 font-mono">Verified Double-Entry Asset Balance</span>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Active Accounts</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{accounts.length}</p>
          <span className="text-[11px] text-slate-400 font-mono">Current, Savings & Cash Accounts</span>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Unmatched Statement Lines</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{totalUnmatched}</p>
          <span className="text-[11px] text-amber-400/80 font-mono">Awaiting Ledger Reconciliation</span>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="space-y-3 text-left">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Bank Accounts & Ledgers</h3>
        {!accounts.length ? (
          <EmptyState
            icon={Landmark}
            title="No bank accounts configured"
            description="Add your company's ICICI, HDFC, SBI, or Axis bank accounts to track statement deposits and withdrawals."
            action={
              <button className="books-primary" onClick={() => setShowAddAccount(true)}>
                <Plus /> Add first bank account
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                  selectedAccountId === acc.id
                    ? "bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{acc.accountName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.bankName || "Business Account"} · {acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : "Cash Ledger"}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                    acc.accountType === "CURRENT" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {acc.accountType}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Book Balance:</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{inr(acc.currentBalance)}</span>
                </div>

                {acc.unmatchedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{acc.unmatchedCount} statement lines to reconcile</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statement Reconciliation Workspace */}
      {activeAccount && (
        <section className="books-panel books-table-panel text-left space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 pt-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Statement Lines — {activeAccount.accountName}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Match bank statement entries against posted ledger transactions.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="books-inline-search w-full sm:w-64">
                <Search />
                <input placeholder="Search statement lines..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button
                className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl cursor-pointer"
                onClick={() => loadStatementLines(activeAccount.id)}
                title="Refresh statement lines"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingLines ? (
            <LoadingState label="Loading statement lines" />
          ) : !filteredLines.length ? (
            <div className="p-10 text-center space-y-3">
              <UploadCloud className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No bank statement lines imported yet for this account.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">Upload your bank statement CSV file to match transactions automatically.</p>
              <button className="books-primary" onClick={() => setShowImportStatement(true)}>
                <UploadCloud className="w-4 h-4 mr-1.5" /> Import Statement CSV
              </button>
            </div>
          ) : (
            <div className="books-table-wrap">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Narration</th>
                    <th>Reference</th>
                    <th>Type</th>
                    <th className="num">Amount</th>
                    <th>Recommendation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLines.map((line) => (
                    <tr key={line.id}>
                      <td className="text-xs font-mono">{indianDate(line.transactionDate)}</td>
                      <td>
                        <strong className="text-xs text-white">{line.narration}</strong>
                      </td>
                      <td className="text-xs font-mono text-slate-400">{line.referenceNumber || "—"}</td>
                      <td>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          line.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {line.type}
                        </span>
                      </td>
                      <td className="num">
                        <strong className={`font-mono text-xs ${line.type === "DEPOSIT" ? "text-emerald-400" : "text-rose-400"}`}>
                          {line.type === "DEPOSIT" ? "+" : "-"}{inr(line.amount)}
                        </strong>
                      </td>
                      <td>
                        {line.status === "MATCHED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                          </span>
                        ) : line.suggestion ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" /> {line.suggestion.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">No direct match</span>
                        )}
                      </td>
                      <td>
                        {line.status === "UNMATCHED" && (
                          <div className="flex items-center gap-2">
                            <button
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              onClick={() => handleReconcileLine(line, "MATCH")}
                              disabled={saving}
                            >
                              Reconcile
                            </button>
                            <button
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] rounded-lg transition-colors cursor-pointer"
                              onClick={() => handleReconcileLine(line, "EXCLUDE")}
                              disabled={saving}
                              title="Exclude from matching"
                            >
                              Exclude
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Add Bank Account Modal */}
      {showAddAccount && (
        <Modal title="Add Bank or Cash Account" description="Set up a business bank account to track deposits, withdrawals and statement files." onClose={() => setShowAddAccount(false)}>
          <form className="books-modal-form" onSubmit={handleCreateAccount}>
            <div className="books-form-grid">
              <label className="span-2">
                <span>Account Name *</span>
                <input required placeholder="e.g. ICICI Bank Current Account" value={accountForm.accountName} onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })} />
              </label>
              <label>
                <span>Account Number</span>
                <input placeholder="e.g. 000405008892" value={accountForm.accountNumber} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} />
              </label>
              <label>
                <span>Account Type *</span>
                <select value={accountForm.accountType} onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}>
                  <option value="CURRENT">Current Account</option>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="PETTY_CASH">Petty Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </label>
              <label>
                <span>Bank Name</span>
                <input placeholder="e.g. ICICI Bank" value={accountForm.bankName} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} />
              </label>
              <label>
                <span>IFSC Code</span>
                <input placeholder="e.g. ICIC0000011" value={accountForm.ifscCode} onChange={(e) => setAccountForm({ ...accountForm, ifscCode: e.target.value.toUpperCase() })} />
              </label>
              <label className="span-2">
                <span>Opening Balance (₹)</span>
                <div className="books-money-input">
                  <IndianRupee />
                  <input value={accountForm.openingBalance} onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })} />
                </div>
              </label>
            </div>
            {formError && <p className="books-form-error">{formError}</p>}
            <footer>
              <button type="button" className="books-secondary" onClick={() => setShowAddAccount(false)}>Cancel</button>
              <button className="books-primary" disabled={saving || !accountForm.accountName}>{saving ? "Saving…" : "Save Bank Account"}</button>
            </footer>
          </form>
        </Modal>
      )}

      {/* Import Statement Modal */}
      {showImportStatement && (
        <Modal title="Import Bank Statement (CSV)" description="Paste or upload your bank CSV transactions to run reconciliation." onClose={() => setShowImportStatement(false)}>
          <form className="books-modal-form" onSubmit={handleImportCsv}>
            <div className="space-y-4">
              <label className="block text-left">
                <span className="text-xs font-semibold text-slate-300">Target Bank Account *</span>
                <select className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                  {accounts.map((acc) => (
                    <option value={acc.id} key={acc.id}>{acc.accountName} ({acc.bankName || "Bank"})</option>
                  ))}
                </select>
              </label>

              <label className="block text-left">
                <span className="text-xs font-semibold text-slate-300">CSV Data (Date, Narration, Deposit, Withdrawal, Reference)</span>
                <textarea
                  rows={6}
                  className="mt-1 w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </label>
            </div>
            {formError && <p className="books-form-error">{formError}</p>}
            <footer>
              <button type="button" className="books-secondary" onClick={() => setShowImportStatement(false)}>Cancel</button>
              <button className="books-primary" disabled={saving || !csvText.trim()}>{saving ? "Importing…" : "Import Statement Lines"}</button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
