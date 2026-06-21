import React from "react";
import { cn } from "../utils";

/* ─── TABLE ─── */
export function Table({ className, children, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--ds-border-primary)]">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...rest}>{children}</table>
    </div>
  );
}

export function Thead({ className, children, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-[var(--ds-surface-secondary)] border-b border-[var(--ds-border-primary)]", className)} {...rest}>{children}</thead>;
}

export function Th({ className, children, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ds-text-muted)]", className)} {...rest}>{children}</th>;
}

export function Tbody({ className, children, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[var(--ds-border-primary)]", className)} {...rest}>{children}</tbody>;
}

export function Tr({ className, children, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-[var(--ds-hover-overlay)] transition-colors", className)} {...rest}>{children}</tr>;
}

export function Td({ className, children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-[13px] text-[var(--ds-text-secondary)]", className)} {...rest}>{children}</td>;
}

/* ─── PROGRESS BAR ─── */
export interface ProgressBarProps {
  value: number; /* 0-100 */
  tone?: "brand" | "success" | "warning" | "error";
  size?: "sm" | "md";
  showLabel?: boolean;
}
const toneColors = {
  brand:   "bg-[var(--ds-brand-primary)]",
  success: "bg-[var(--ds-success)]",
  warning: "bg-[var(--ds-warning)]",
  error:   "bg-[var(--ds-error)]",
};
export function ProgressBar({ value, tone = "brand", size = "sm", showLabel }: ProgressBarProps) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 rounded-full bg-[var(--ds-surface-elevated)]", h)}>
        <div className={cn("rounded-full transition-all", h, toneColors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {showLabel && <span className="text-[11px] font-medium text-[var(--ds-text-muted)] shrink-0">{value}%</span>}
    </div>
  );
}

/* ─── CIRCULAR PROGRESS ─── */
export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: "brand" | "success" | "warning" | "error";
  label?: string;
}
export function CircularProgress({ value, size = 64, strokeWidth = 5, tone = "brand", label }: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = tone === "brand" ? "var(--ds-brand-primary)" : tone === "success" ? "var(--ds-success)" : tone === "warning" ? "var(--ds-warning)" : "var(--ds-error)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ds-surface-elevated)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-[var(--ds-text-primary)] leading-none">{value}</span>
        {label && <span className="text-[8px] text-[var(--ds-text-muted)] mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

/* ─── TIMELINE ─── */
export interface TimelineItem { title: string; description?: string; time?: string; icon?: React.ReactNode; tone?: "brand" | "success" | "warning" | "error"; }
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px]",
              item.tone === "success" ? "bg-[var(--ds-success)]" :
              item.tone === "warning" ? "bg-[var(--ds-warning)]" :
              item.tone === "error" ? "bg-[var(--ds-error)]" :
              "bg-[var(--ds-brand-primary)]"
            )}>
              {item.icon || (i + 1)}
            </div>
            {i < items.length - 1 && <div className="w-px flex-1 bg-[var(--ds-border-primary)] my-1" />}
          </div>
          <div className="pb-5">
            <p className="text-[13px] font-semibold text-[var(--ds-text-primary)] leading-tight">{item.title}</p>
            {item.description && <p className="text-[12px] text-[var(--ds-text-muted)] mt-0.5">{item.description}</p>}
            {item.time && <p className="text-[11px] text-[var(--ds-text-muted)] mt-1 opacity-70">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Table;
