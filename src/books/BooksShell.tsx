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
            <button className="books-search" aria-label="Search"><Search /><span>Search</span><kbd>⌘ K</kbd></button>
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
    </div>
  );
}
