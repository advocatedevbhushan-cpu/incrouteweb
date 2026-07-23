import React, { useEffect, useState } from "react";
import { Building2, CalendarRange, CheckCircle2, FileSpreadsheet, LockKeyhole, Plus, Save, Search, Settings, ShieldCheck, UserCheck } from "lucide-react";
import { booksApi, indianDate } from "../api";
import type { BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader, Status } from "./Common";

interface AccountMaster {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
  subType: string;
  normalBalance: "DEBIT" | "CREDIT";
  isSystem: boolean;
}

interface Period {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  status: string;
  lockedAt?: string | null;
}

interface OrgSettings {
  legalName: string;
  tradeName?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  baseCurrency: string;
  reportingMethod: string;
}

export default function SettingsPage({ organisation }: { organisation: BooksOrganisation }) {
  const [tab, setTab] = useState<"coa" | "org" | "periods" | "rbac">("coa");
  const [accounts, setAccounts] = useState<AccountMaster[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    legalName: organisation.legalName,
    tradeName: organisation.tradeName || "",
    invoicePrefix: organisation.invoicePrefix || "INV",
    nextInvoiceNumber: 1,
    baseCurrency: organisation.baseCurrency || "INR",
    reportingMethod: organisation.reportingMethod || "ACCRUAL",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [lockTarget, setLockTarget] = useState<Period | null>(null);

  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    type: "EXPENSE",
    subType: "GENERAL",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [coaData, periodData, orgData] = await Promise.all([
        booksApi<{ accounts: AccountMaster[] }>(`/chart-of-accounts?organisationId=${organisation.id}`),
        booksApi<{ periods: Period[] }>(`/periods?organisationId=${organisation.id}`),
        booksApi<{ organisation: OrgSettings }>(`/organisation-settings?organisationId=${organisation.id}`),
      ]);
      setAccounts(coaData.accounts);
      setPeriods(periodData.periods);
      if (orgData.organisation) {
        setOrgSettings((prev) => ({ ...prev, ...orgData.organisation }));
      }
    } catch (cause: any) {
      setError(cause.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organisation.id]);

  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/organisation-settings", {
        method: "PUT",
        body: JSON.stringify({ organisationId: organisation.id, ...orgSettings }),
      });
      await loadData();
    } catch (cause: any) {
      setFormError(cause.message || "Failed to save organisation settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await booksApi("/chart-of-accounts", {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id, ...newAccount }),
      });
      setShowAddAccount(false);
      setNewAccount({ code: "", name: "", type: "EXPENSE", subType: "GENERAL" });
      await loadData();
    } catch (cause: any) {
      setFormError(cause.message || "Failed to add account master");
    } finally {
      setSaving(false);
    }
  };

  const handleLockPeriod = async () => {
    if (!lockTarget) return;
    setSaving(true);
    setFormError("");
    try {
      await booksApi(`/periods/${lockTarget.id}/lock`, {
        method: "POST",
        body: JSON.stringify({ organisationId: organisation.id }),
      });
      setLockTarget(null);
      await loadData();
    } catch (cause: any) {
      setFormError(cause.message || "Unable to lock period");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading Books configuration and chart of accounts" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const filteredAccounts = accounts.filter((acc) =>
    [acc.code, acc.name, acc.type, acc.subType].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="books-page space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings & Master Data"
        description="Chart of accounts, organisation identity, invoice numbering preferences, and role-based permissions."
      />

      <div className="books-settings-summary">
        <div>
          <span><FileSpreadsheet /></span>
          <div>
            <small>Chart of Accounts</small>
            <strong>{accounts.length} Master Ledgers</strong>
          </div>
        </div>
        <div>
          <span><Settings /></span>
          <div>
            <small>Invoice Prefix</small>
            <strong>{orgSettings.invoicePrefix || "INV"}</strong>
          </div>
        </div>
        <div>
          <span><LockKeyhole /></span>
          <div>
            <small>Period Locks</small>
            <strong>
              {periods.filter((p) => p.status === "LOCKED").length} of {periods.length} Closed
            </strong>
          </div>
        </div>
      </div>

      {/* Main Segmented Tabs */}
      <div className="books-segmented">
        <button className={tab === "coa" ? "active" : ""} onClick={() => setTab("coa")}>
          Chart of Accounts ({accounts.length})
        </button>
        <button className={tab === "org" ? "active" : ""} onClick={() => setTab("org")}>
          Organisation Profile
        </button>
        <button className={tab === "periods" ? "active" : ""} onClick={() => setTab("periods")}>
          Fiscal Period Locks
        </button>
        <button className={tab === "rbac" ? "active" : ""} onClick={() => setTab("rbac")}>
          Role & Permissions
        </button>
      </div>

      {/* Tab 1: Chart of Accounts */}
      {tab === "coa" && (
        <section className="books-panel books-table-panel text-left space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 pt-2">
            <div>
              <h3 className="text-base font-bold text-white">General Ledger Chart of Accounts</h3>
              <p className="text-xs text-slate-400">Master account codes used across invoices, vendor bills, and financial statements.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="books-inline-search w-full sm:w-64">
                <Search />
                <input placeholder="Search account masters..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="books-primary whitespace-nowrap" onClick={() => setShowAddAccount(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Account
              </button>
            </div>
          </div>

          <div className="books-table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account Name</th>
                  <th>Class</th>
                  <th>Category SubType</th>
                  <th>Normal Balance</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <strong className="books-mono text-indigo-400">{acc.code}</strong>
                    </td>
                    <td>
                      <strong className="text-white">{acc.name}</strong>
                    </td>
                    <td>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        acc.type === "ASSET"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : acc.type === "LIABILITY"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : acc.type === "INCOME"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="text-xs font-mono text-slate-400">{acc.subType}</td>
                    <td className="text-xs font-mono text-slate-300">{acc.normalBalance}</td>
                    <td>
                      {acc.isSystem ? (
                        <span className="text-[11px] text-slate-500 font-mono">System Default</span>
                      ) : (
                        <span className="text-[11px] text-indigo-400 font-mono">Custom Master</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Organisation Profile */}
      {tab === "org" && (
        <section className="books-panel p-6 text-left space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Organisation Preferences</h3>
              <p className="text-xs text-slate-400">Update legal entity details, invoice prefixes, and currency settings.</p>
            </div>
          </div>

          <form className="books-modal-form max-w-2xl" onSubmit={handleSaveOrgSettings}>
            <div className="books-form-grid">
              <label className="span-2">
                <span>Legal Registered Name *</span>
                <input required value={orgSettings.legalName} onChange={(e) => setOrgSettings({ ...orgSettings, legalName: e.target.value })} />
              </label>

              <label>
                <span>Trade Name / Brand</span>
                <input value={orgSettings.tradeName} onChange={(e) => setOrgSettings({ ...orgSettings, tradeName: e.target.value })} />
              </label>

              <label>
                <span>Invoice Prefix *</span>
                <input required placeholder="e.g. INV-2026" value={orgSettings.invoicePrefix} onChange={(e) => setOrgSettings({ ...orgSettings, invoicePrefix: e.target.value })} />
              </label>

              <label>
                <span>Base Currency</span>
                <input disabled value={orgSettings.baseCurrency} />
              </label>

              <label>
                <span>Reporting Method</span>
                <input disabled value={orgSettings.reportingMethod} />
              </label>
            </div>

            {formError && <p className="books-form-error">{formError}</p>}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button className="books-primary" disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving…" : "Save Preferences"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tab 3: Fiscal Periods */}
      {tab === "periods" && (
        <section className="books-panel books-table-panel text-left space-y-4 pt-4">
          <div className="px-5 pt-2">
            <h3 className="text-base font-bold text-white">Controlled Accounting Periods</h3>
            <p className="text-xs text-slate-400">Locked periods reject all prospective or retrospective transactions dated within them.</p>
          </div>

          <div className="books-table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Status</th>
                  <th>Closed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td>
                      <strong className="text-white">{period.name}</strong>
                    </td>
                    <td className="books-mono text-xs">{indianDate(period.startsOn)}</td>
                    <td className="books-mono text-xs">{indianDate(period.endsOn)}</td>
                    <td>
                      <Status value={period.status} />
                    </td>
                    <td className="text-xs font-mono text-slate-400">{period.lockedAt ? indianDate(period.lockedAt) : "—"}</td>
                    <td>
                      {period.status !== "LOCKED" ? (
                        <button className="books-table-action" onClick={() => setLockTarget(period)}>
                          <LockKeyhole className="w-3.5 h-3.5 mr-1" /> Lock Period
                        </button>
                      ) : (
                        <span className="books-locked-label text-amber-400 flex items-center gap-1 font-mono text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 4: Role-Based Access Control */}
      {tab === "rbac" && (
        <section className="books-panel p-6 text-left space-y-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-400 font-sans">Permissions enforced for each organization team member.</p>
            </div>
          </div>

          <div className="books-table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Code</th>
                  <th>Scope & Permissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong className="text-white">Platform Admin</strong></td>
                  <td className="books-mono">PLATFORM_ADMIN</td>
                  <td className="text-xs text-slate-300">Full Access across all modules, ledgers, period locks and settings</td>
                  <td><span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">SYSTEM DEFAULT</span></td>
                </tr>
                <tr>
                  <td><strong className="text-white">Chief Accountant</strong></td>
                  <td className="books-mono">ACCOUNTANT</td>
                  <td className="text-xs text-slate-300">Full Access to Invoices, Bills, Banking, GST Filing and Period Locking</td>
                  <td><span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">ACTIVE</span></td>
                </tr>
                <tr>
                  <td><strong className="text-white">Sales Operations</strong></td>
                  <td className="books-mono">SALES_EXEC</td>
                  <td className="text-xs text-slate-300">Create & Post Customer Invoices and Record Receipts</td>
                  <td><span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">ACTIVE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Add Custom Account Modal */}
      {showAddAccount && (
        <Modal title="Add Custom Account Master" description="Create a new general ledger code in your Chart of Accounts." onClose={() => setShowAddAccount(false)}>
          <form className="books-modal-form" onSubmit={handleCreateAccount}>
            <div className="books-form-grid">
              <label>
                <span>Account Code *</span>
                <input required placeholder="e.g. 5200" value={newAccount.code} onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })} />
              </label>

              <label>
                <span>Account Class *</span>
                <select value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as any })}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                </select>
              </label>

              <label className="span-2">
                <span>Account Name *</span>
                <input required placeholder="e.g. Software & Subscriptions" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} />
              </label>

              <label className="span-2">
                <span>Category SubType</span>
                <input placeholder="e.g. OPERATING_EXPENSE" value={newAccount.subType} onChange={(e) => setNewAccount({ ...newAccount, subType: e.target.value })} />
              </label>
            </div>

            {formError && <p className="books-form-error">{formError}</p>}
            <footer>
              <button type="button" className="books-secondary" onClick={() => setShowAddAccount(false)}>Cancel</button>
              <button className="books-primary" disabled={saving || !newAccount.code || !newAccount.name}>{saving ? "Saving…" : "Save Account Master"}</button>
            </footer>
          </form>
        </Modal>
      )}

      {/* Lock Period Confirmation Modal */}
      {lockTarget && (
        <Modal title={`Lock ${lockTarget.name}?`} description="This action blocks all further postings dated within this period." onClose={() => setLockTarget(null)}>
          <div className="books-confirm">
            <span><LockKeyhole /></span>
            <div>
              <strong>{indianDate(lockTarget.startsOn)} to {indianDate(lockTarget.endsOn)}</strong>
              <p>Review trial balance and GST working summary first before closing period.</p>
            </div>
          </div>
          {formError && <p className="books-form-error">{formError}</p>}
          <footer className="books-modal-footer">
            <button className="books-secondary" onClick={() => setLockTarget(null)}>Cancel</button>
            <button className="books-primary" onClick={handleLockPeriod} disabled={saving}>{saving ? "Locking…" : "Confirm period lock"}</button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
