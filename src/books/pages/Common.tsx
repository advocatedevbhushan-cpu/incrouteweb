import React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }:{ eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="books-page-header"><div>{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function LoadingState({ label = "Loading your books" }:{ label?: string }) {
  return <div className="books-state"><Loader2 className="books-spin" /><h2>{label}</h2><p>We’re retrieving secured organisation data.</p></div>;
}

export function ErrorState({ message, onRetry }:{ message: string; onRetry?: () => void }) {
  return <div className="books-state books-error-state"><AlertCircle /><h2>We couldn’t load this view</h2><p>{message}</p>{onRetry && <button className="books-secondary" onClick={onRetry}><RefreshCw />Try again</button>}</div>;
}

export function EmptyState({ icon: Icon, title, description, action }:{ icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return <div className="books-empty"><span><Icon /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Status({ value }:{ value: string }) {
  return <span className={`books-status books-status-${value.toLowerCase().replaceAll("_", "-")}`}>{value.replaceAll("_", " ")}</span>;
}

export function Modal({ title, description, children, onClose }:{ title: string; description?: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="books-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="books-modal" role="dialog" aria-modal="true" aria-labelledby="books-modal-title">
      <header><div><h2 id="books-modal-title">{title}</h2>{description && <p>{description}</p>}</div><button onClick={onClose} aria-label="Close">×</button></header>
      {children}
    </section>
  </div>;
}

