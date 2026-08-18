import React, { useState } from "react";
import {
  BadgeIndianRupee, Banknote, Bell, BookOpen, Building2, ChevronDown, ChevronLeft, ClipboardList,
  FileBarChart, FileText, Gauge, Landmark, Menu, Package, Plus, ReceiptIndianRupee, Search, Settings,
  ShoppingBag, ShoppingCart, Users, WalletCards, X, Moon, Sun,
} from "lucide-react";
import type { BooksOrganisation } from "./types";
import { useTheme } from "../lib/useTheme";

const navGroups = [
  { label: "Workspace", items: [{ route: "dashboard", label: "Dashboard", icon: Gauge }] },
  { label: "Sales", items: [
    { route: "sales", label: "Sales", icon: ShoppingBag }, { route: "invoices", label: "Invoices", icon: ReceiptIndianRupee },
    { route: "customers", label: "Customers", icon: Users },
  ] },
  { label: "Purchases", items: [
    { route: "purchases", label: "Purchases", icon: ShoppingCart }, { route: "bills", label: "Bills & Expenses", icon: FileText },
    { route: "vendors", label: "Vendors", icon: Building2 },
  ] },
  { label: "Accounting", items: [
    { route: "items", label: "Items", icon: Package }, { route: "banking", label: "Banking", icon: Landmark },
    { route: "accountant", label: "Accountant", icon: BookOpen }, { route: "gst", label: "GST", icon: BadgeIndianRupee },
    { route: "reports", label: "Reports", icon: FileBarChart },
  ] },
  { label: "Records", items: [
    { route: "documents", label: "Documents", icon: ClipboardList }, { route: "settings", label: "Settings", icon: Settings },
  ] },
];

export default function BooksShell({ children, route, organisations, organisation, onNavigate, onOrganisation, onCreateOrganisation, onExit }:{
  children: React.ReactNode; route: string; organisations: BooksOrganisation[]; organisation: BooksOrganisation;
  onNavigate: (route: string) => void; onOrganisation: (id: string) => void; onCreateOrganisation?: () => void; onExit: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const organisationGroups = [
    { label: "My firms", items: organisations.filter((item) => item.accessKind === "ADMIN_FIRM") },
    { label: "Client organisations", items: organisations.filter((item) => item.accessKind === "CLIENT_ORGANISATION") },
    { label: "Platform organisations", items: organisations.filter((item) => item.accessKind === "PLATFORM_ORGANISATION") },
    { label: "Organisations", items: organisations.filter((item) => !item.accessKind || item.accessKind === "OWN_ORGANISATION") },
  ].filter((group) => group.items.length > 0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchItems = [
    { route: "dashboard", label: "Dashboard Overview", group: "General" },
    { route: "invoices", label: "Sales Invoices & E-way Bills", group: "Sales" },
    { route: "customers", label: "Customer Directory", group: "Sales" },
    { route: "bills", label: "Vendor Bills & Expense Vouchers", group: "Purchases" },
    { route: "vendors", label: "Vendor Directory", group: "Purchases" },
    { route: "items", label: "Inventory & Service Catalog (HSN/SAC)", group: "Accounting" },
    { route: "banking", label: "Bank Accounts & Statement Reconciliation", group: "Accounting" },
    { route: "gst", label: "GST Summary & GSTR-1 / 3B Reports", group: "Tax & Compliance" },
    { route: "reports", label: "Profit & Loss, Balance Sheet & Trial Balance", group: "Reports" },
    { route: "settings", label: "Company Profile, GSTIN & Invoice Prefixes", group: "Settings" },
  ].filter(i => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase()) || i.group.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="books-root">
      {mobileOpen && <button className="books-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`books-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="books-brand">
          <button className="books-mark" onClick={onExit} aria-label="Return to INCroute portal"><img src="/incroute_logo.png" alt="" /></button>
          {!collapsed && <div><p>INC<span>route</span> Books</p><small>Accounts · Compliance · Records</small></div>}
          <button className="books-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}><ChevronLeft /></button>
        </div>
        <nav aria-label="INCroute Books navigation" className="books-nav">
          {navGroups.map((group) => <div className="books-nav-group" key={group.label}>
            {!collapsed && <p>{group.label}</p>}
            {group.items.map((item) => {
              const active = route === item.route || (route === "" && item.route === "dashboard");
              return <button key={item.route} className={active ? "is-active" : ""} onClick={() => { onNavigate(item.route); setMobileOpen(false); }} title={collapsed ? item.label : undefined}>
                <item.icon aria-hidden="true" />{!collapsed && <span>{item.label}</span>}
              </button>;
            })}
          </div>)}
        </nav>
        <div className="books-sidebar-footer">
          <button onClick={onExit}><WalletCards />{!collapsed && <span>Business command centre</span>}</button>
        </div>
      </aside>

      <div className="books-workspace">
        <header className="books-topbar">
          <div className="books-topbar-left">
            <button className="books-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
            <div className="books-org-switcher">
              <Building2 />
              <label><span>Organisation</span><select value={organisation.id} onChange={(event) => onOrganisation(event.target.value)}>{organisationGroups.map((group) => <optgroup label={group.label} key={group.label}>{group.items.map((item) => <option value={item.id} key={item.id}>{item.tradeName || item.legalName}</option>)}</optgroup>)}</select></label>
              <ChevronDown />
            </div>
            {onCreateOrganisation && <button className="books-org-add" onClick={onCreateOrganisation} aria-label="Create a standalone firm"><Plus /><span>New firm</span></button>}
            <div className="books-fy"><span>FY</span><strong>{organisation.fiscalYear || "Not set"}</strong></div>
          </div>
          <div className="books-topbar-actions">
            <button className="books-search" onClick={() => setSearchOpen(true)} aria-label="Search"><Search /><span>Search</span><kbd>⌘ K</kbd></button>
            <div className="books-quick-wrap">
              <button className="books-primary" onClick={() => setQuickOpen((value) => !value)}><Plus />Quick create<ChevronDown /></button>
              {quickOpen && <div className="books-quick-menu">
                <button onClick={() => { onNavigate("invoices"); setQuickOpen(false); }}><ReceiptIndianRupee />GST invoice</button>
                <button onClick={() => { onNavigate("customers"); setQuickOpen(false); }}><Users />Customer</button>
                <button onClick={() => { onNavigate("items"); setQuickOpen(false); }}><Package />Item or service</button>
                <button onClick={() => { onNavigate("banking"); setQuickOpen(false); }}><Banknote />Payment</button>
              </div>}
            </div>
            <button className="books-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun /> : <Moon />}</button>
            <button className="books-icon-button" aria-label="Notifications"><Bell /><i /></button>
          </div>
        </header>
        <main className="books-content">{children}</main>
      </div>
      {mobileOpen && <button className="books-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>}

      {/* ⌘K Search Command Pallet */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(12, 24, 48, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "15vh" }} onClick={() => setSearchOpen(false)}>
          <div style={{ width: "100%", maxWidth: "560px", background: "var(--books-panel, #1E293B)", borderRadius: "14px", border: "1px solid var(--books-border, #334155)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--books-border, #334155)", gap: "10px" }}>
              <Search style={{ width: 18, height: 18, color: "var(--books-muted, #94A3B8)" }} />
              <input
                type="text"
                autoFocus
                placeholder="Search accounts, invoices, GST, banking, settings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--books-text, #F8FAFC)", fontSize: "15px" }}
              />
              <span style={{ fontSize: "11px", padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--books-muted, #94A3B8)" }}>ESC</span>
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto", padding: "8px" }}>
              {searchItems.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--books-muted, #94A3B8)", fontSize: "13px" }}>No matching tools found</div>
              ) : (
                searchItems.map(item => (
                  <button
                    key={item.route}
                    onClick={() => { onNavigate(item.route); setSearchOpen(false); }}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", border: "none", background: "transparent", color: "var(--books-text, #F8FAFC)", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(104, 87, 238, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#A99FFF" }}>{item.group}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
