import React, { useState } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, CheckSquare, FileText, Receipt,
  Shield, Scale, Database, HelpCircle, BarChart3, Clock, Settings,
  ChevronLeft, Menu, Bell, Search, LogOut
} from "lucide-react";

interface AdminShellProps {
  activeScreen: string;
  setActiveScreen: (s: string) => void;
  children: React.ReactNode;
}

const navSections = [
  { label: "Core", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "service-requests", label: "Service Requests", icon: FileText },
    { id: "compliance", label: "Compliance", icon: CalendarCheck },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
  ]},
  { label: "Operations", items: [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "proforma", label: "Proforma / Quotation", icon: FileText },
    { id: "trademarks", label: "Trademarks", icon: Shield },
    { id: "legal", label: "Legal", icon: Scale },
    { id: "consultations", label: "Consultations", icon: Database },
    { id: "tickets", label: "Support", icon: HelpCircle },
  ]},
  { label: "Management", items: [
    { id: "team", label: "Team", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "audit", label: "Audit Log", icon: Clock },
  ]},
];

export default function AdminShell({ activeScreen, setActiveScreen, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen z-50 lg:z-auto flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-200 ${collapsed ? "w-[72px]" : "w-[260px]"} ${mobileOpen ? "left-0" : "-left-[260px] lg:left-0"}`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <img src="/incroute_logo.png" className="w-full h-full object-cover" alt="INCroute Logo" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                  INC<span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] font-bold italic">route</span>
                </span>
                <div className="flex items-center gap-1 mt-[3px]">
                  <span className="h-[1px] w-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-50" />
                  <span className="text-[7px] text-[var(--text-tertiary)] tracking-[0.18em] uppercase font-semibold">Admin Portal</span>
                  <span className="h-[1px] w-2 bg-gradient-to-r from-[var(--gradient-end)] to-[var(--gradient-start)] opacity-50" />
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand" : "Collapse"} className="hidden lg:flex p-1.5 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] cursor-pointer">
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav role="navigation" aria-label="Admin navigation" className="flex-1 p-3 overflow-y-auto space-y-4">
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && <p className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-3 mb-1.5">{section.label}</p>}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = activeScreen === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActiveScreen(item.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"} ${collapsed ? "justify-center px-2" : ""}`}>
                      <item.icon className={`w-[16px] h-[16px] shrink-0 ${active ? "text-[var(--accent)]" : ""}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[11px] font-bold">A</div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">Admin User</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("incroute_access_token");
                localStorage.removeItem("incroute_refresh_token");
                localStorage.removeItem("incroute_user");
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
        {collapsed && (
          <div className="p-3 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => {
                localStorage.removeItem("incroute_access_token");
                localStorage.removeItem("incroute_refresh_token");
                localStorage.removeItem("incroute_user");
                window.location.href = "/login";
              }}
              className="w-full flex justify-center p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="lg:hidden p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer"><Menu className="w-5 h-5" /></button>
            <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 w-[260px]">
              <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <input type="text" placeholder="Search clients, tasks, docs..." className="bg-transparent text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none flex-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer">
              <Bell className="w-[18px] h-[18px]" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--warning)]" />
            </button>
            <button aria-label="Settings" onClick={() => setActiveScreen("settings")} className="p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer"><Settings className="w-[18px] h-[18px]" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto"><div className="max-w-[1400px] mx-auto w-full">{children}</div></main>
      </div>
    </div>
  );
}
