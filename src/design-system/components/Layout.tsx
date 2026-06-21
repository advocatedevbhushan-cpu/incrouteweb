import React from "react";
import { cn } from "../utils";

/* ─── DASHBOARD SHELL ───
   Standard layout: Sidebar + Header + Content.
   Used by Client Portal, Admin Dashboard, Compliance, Documents, etc.
*/
export function DashboardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen bg-[var(--ds-bg-primary)]", className)}>
      {children}
    </div>
  );
}

export function DashboardMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("flex-1 flex flex-col min-w-0 overflow-auto", className)}>
      {children}
    </main>
  );
}

export function DashboardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <header className={cn(
      "h-[var(--ds-header-height)] px-6 flex items-center justify-between border-b border-[var(--ds-border-primary)] bg-[var(--ds-bg-primary)]/80 backdrop-blur-sm sticky top-0 z-[var(--ds-z-sticky)]",
      className
    )}>
      {children}
    </header>
  );
}

export function DashboardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 p-6 max-w-[var(--ds-content-max)] mx-auto w-full", className)}>
      {children}
    </div>
  );
}

/* ─── PAGE HEADER ─── */
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="ds-h2">{title}</h1>
        {description && <p className="ds-body-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ─── SECTION ─── */
export function Section({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="ds-h3">{title}</h2>}
          {description && <p className="ds-body-sm mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/* ─── GRID ─── */
export function Grid({ cols = 3, gap = 4, children, className }: { cols?: 1 | 2 | 3 | 4 | 6; gap?: 2 | 3 | 4 | 5 | 6; children: React.ReactNode; className?: string }) {
  const colClass = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", 6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" };
  const gapClass = { 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6" };
  return <div className={cn("grid", colClass[cols], gapClass[gap], className)}>{children}</div>;
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="w-12 h-12 rounded-2xl bg-[var(--ds-brand-primary)]/10 flex items-center justify-center text-[var(--ds-brand-primary)] mb-4">{icon}</div>}
      <h3 className="ds-h4 mb-1">{title}</h3>
      {description && <p className="ds-body-sm max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default DashboardShell;
