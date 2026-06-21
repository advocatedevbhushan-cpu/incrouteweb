import React, { useState, createContext, useContext } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "../utils";

interface SidebarContext { collapsed: boolean; toggle: () => void; }
const SidebarCtx = createContext<SidebarContext>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarCtx);

export interface SidebarProps { children: React.ReactNode; defaultCollapsed?: boolean; }
export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return <SidebarCtx.Provider value={{ collapsed, toggle: () => setCollapsed(c => !c) }}>{children}</SidebarCtx.Provider>;
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar();
  return (
    <aside className={cn(
      "h-screen sticky top-0 bg-[var(--ds-surface-sunken)] border-r border-[var(--ds-border-primary)] flex flex-col transition-all duration-200 overflow-hidden z-[var(--ds-z-sidebar)]",
      collapsed ? "w-[var(--ds-sidebar-width-collapsed)]" : "w-[var(--ds-sidebar-width)]",
      className
    )}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ logo, title }: { logo: React.ReactNode; title?: string }) {
  const { collapsed, toggle } = useSidebar();
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--ds-border-primary)]">
      <div className="flex items-center gap-2.5 overflow-hidden">
        {logo}
        {!collapsed && title && <span className="text-[14px] font-extrabold text-[var(--ds-text-primary)] tracking-tight whitespace-nowrap">{title}</span>}
      </div>
      <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-[var(--ds-hover-overlay)] text-[var(--ds-text-muted)] cursor-pointer">
        {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  children?: React.ReactNode; /* nested items */
}
export function NavItem({ icon, label, active, badge, onClick, children }: NavItemProps) {
  const { collapsed } = useSidebar();
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(children);

  return (
    <div>
      <button
        onClick={() => { hasChildren ? setOpen(!open) : onClick?.(); }}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer",
          active ? "bg-[var(--ds-brand-primary)]/10 text-[var(--ds-text-primary)]" : "text-[var(--ds-text-muted)] hover:bg-[var(--ds-hover-overlay)] hover:text-[var(--ds-text-primary)]",
          collapsed && "justify-center px-2"
        )}
      >
        <span className={cn("shrink-0", active && "text-[var(--ds-brand-primary)]")}>{icon}</span>
        {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
        {!collapsed && badge && <span className="text-[10px] bg-[var(--ds-brand-primary)]/15 text-[var(--ds-brand-primary)] px-1.5 py-0.5 rounded-full font-semibold">{badge}</span>}
      </button>
      {hasChildren && open && !collapsed && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-[var(--ds-border-primary)] pl-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-auto p-4 border-t border-[var(--ds-border-primary)]", className)}>{children}</div>;
}

export default Sidebar;
