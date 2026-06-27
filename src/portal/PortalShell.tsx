import React, { useState } from "react";
import {
  LayoutDashboard, Building2, CalendarCheck, FileText, Scale, Shield,
  Database, Users, Receipt, HelpCircle, Bell, Settings, ChevronLeft, Menu, LogOut
} from "lucide-react";

interface PortalShellProps {
  activeScreen: string;
  setActiveScreen: (s: string) => void;
  children: React.ReactNode;
  clientName?: string;
  companyName?: string;
}

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "entities", label: "My Entities", icon: Building2 },
  { id: "compliance", label: "Compliance", icon: CalendarCheck },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "trademark", label: "Trademarks", icon: Shield },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "tax", label: "Tax & GST", icon: Database },
  { id: "consultations", label: "Consultations", icon: Users },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function PortalShell({ activeScreen, setActiveScreen, children, clientName, companyName }: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get user info from localStorage
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("incroute_user") || "{}"); } catch { return {}; } })();
  const displayName = clientName || storedUser.firstName || "User";
  const displayCompany = companyName || "INCroute Portal";

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen z-50 lg:z-auto flex flex-col
        bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]
        transition-all duration-200
        ${collapsed ? "w-[72px]" : "w-[260px]"}
        ${mobileOpen ? "left-0" : "-left-[260px] lg:left-0"}
      `}>
        {/* Logo */}
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
                  <span className="h-[1px] w-2.5 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-50" />
                  <span className="text-[7px] text-[var(--text-tertiary)] tracking-[0.18em] uppercase font-semibold">Make It Right</span>
                  <span className="h-[1px] w-2.5 bg-gradient-to-r from-[var(--gradient-end)] to-[var(--gradient-start)] opacity-50" />
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden lg:flex p-1.5 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-tertiary)] cursor-pointer">
            {collapsed ? <Menu className="w-4 h-4" aria-hidden="true" /> : <ChevronLeft className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Nav */}
        <nav role="navigation" aria-label="Portal navigation" className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveScreen(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                } ${collapsed ? "justify-center px-2" : ""}`}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[var(--accent)]" : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] truncate">{displayCompany}</p>
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
        {/* Top bar */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation menu" className="lg:hidden p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer">
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="hidden sm:block">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">Business Command Center</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveScreen("notifications")} aria-label="View notifications" className="relative p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer">
              <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
            </button>
            <button onClick={() => setActiveScreen("settings")} aria-label="Settings" className="p-2 rounded-lg hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] cursor-pointer">
              <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
