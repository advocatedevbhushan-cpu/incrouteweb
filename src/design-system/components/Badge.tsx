import React from "react";
import { cn } from "../utils";

export type BadgeTone =
  | "neutral" | "brand" | "success" | "warning" | "error" | "info" | "premium";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  size?: "sm" | "md";
}

const tones: Record<BadgeTone, string> = {
  neutral: "bg-white/[0.06] text-[var(--ds-text-secondary)] border-[var(--ds-border-primary)]",
  brand:   "bg-[rgba(108,124,255,0.12)] text-[var(--ds-brand-primary)] border-[rgba(108,124,255,0.25)]",
  success: "bg-[var(--ds-success-bg)] text-[#4ADE80] border-[rgba(34,197,94,0.25)]",
  warning: "bg-[var(--ds-warning-bg)] text-[#FBBF24] border-[rgba(245,158,11,0.25)]",
  error:   "bg-[var(--ds-error-bg)] text-[#F87171] border-[rgba(239,68,68,0.25)]",
  info:    "bg-[var(--ds-info-bg)] text-[#60A5FA] border-[rgba(59,130,246,0.25)]",
  premium: "bg-[rgba(212,175,55,0.12)] text-[var(--ds-brand-premium)] border-[rgba(212,175,55,0.3)]",
};

const dotColors: Record<BadgeTone, string> = {
  neutral: "bg-[var(--ds-text-muted)]",
  brand:   "bg-[var(--ds-brand-primary)]",
  success: "bg-[var(--ds-success)]",
  warning: "bg-[var(--ds-warning)]",
  error:   "bg-[var(--ds-error)]",
  info:    "bg-[var(--ds-info)]",
  premium: "bg-[var(--ds-brand-premium)]",
};

export function Badge({ tone = "neutral", dot, size = "md", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1",
        tones[tone],
        className
      )}
      {...rest}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[tone])} />}
      {children}
    </span>
  );
}

/* ─── DOMAIN STATUS BADGES ─── */
type StatusKey =
  | "active" | "pending" | "completed" | "overdue" | "critical" | "draft"
  | "paid" | "unpaid" | "tmFiled" | "tmApproved" | "rocFiled" | "gstFiled";

const statusMap: Record<StatusKey, { tone: BadgeTone; label: string }> = {
  active:     { tone: "success", label: "Active" },
  pending:    { tone: "warning", label: "Pending" },
  completed:  { tone: "success", label: "Completed" },
  overdue:    { tone: "error",   label: "Overdue" },
  critical:   { tone: "error",   label: "Critical" },
  draft:      { tone: "neutral", label: "Draft" },
  paid:       { tone: "success", label: "Paid" },
  unpaid:     { tone: "warning", label: "Unpaid" },
  tmFiled:    { tone: "info",    label: "Trademark Filed" },
  tmApproved: { tone: "success", label: "Trademark Approved" },
  rocFiled:   { tone: "brand",   label: "ROC Filed" },
  gstFiled:   { tone: "brand",   label: "GST Filed" },
};

export function StatusBadge({ status, dot = true }: { status: StatusKey; dot?: boolean }) {
  const s = statusMap[status];
  return <Badge tone={s.tone} dot={dot}>{s.label}</Badge>;
}

export default Badge;
