import React from "react";
import { cn } from "../utils";

type CardVariant = "standard" | "elevated" | "interactive" | "workspace";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variants: Record<CardVariant, string> = {
  standard:
    "bg-[var(--ds-surface-primary)] border border-[var(--ds-border-primary)]",
  elevated:
    "bg-[var(--ds-surface-elevated)] border border-[var(--ds-border-primary)] shadow-[var(--ds-shadow-md)]",
  interactive:
    "bg-[var(--ds-surface-primary)] border border-[var(--ds-border-primary)] transition-all hover:border-[rgba(108,124,255,0.25)] hover:-translate-y-0.5 cursor-pointer",
  workspace:
    "bg-[var(--ds-workspace-surface)] border border-[var(--ds-workspace-border)] text-[var(--ds-workspace-text)]",
};

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-7" };

export function Card({ variant = "standard", padding = "md", className, children, ...rest }: CardProps) {
  return (
    <div className={cn("rounded-2xl", variants[variant], paddings[padding], className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("ds-h4", className)} {...rest}>{children}</h3>;
}

export function CardDescription({ className, children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("ds-body-sm", className)} {...rest}>{children}</p>;
}

/* ─── METRIC CARD ─── */
export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}
export function MetricCard({ label, value, delta, deltaTone = "neutral", icon }: MetricCardProps) {
  const tone =
    deltaTone === "up" ? "text-[var(--ds-success)]" :
    deltaTone === "down" ? "text-[var(--ds-error)]" : "text-[var(--ds-text-muted)]";
  return (
    <Card variant="standard" padding="md">
      <div className="flex items-center justify-between mb-2">
        <span className="ds-caption">{label}</span>
        {icon && <span className="text-[var(--ds-brand-primary)]">{icon}</span>}
      </div>
      <p className="text-2xl font-extrabold text-[var(--ds-text-primary)] tracking-tight leading-none">{value}</p>
      {delta && <p className={cn("text-[11px] mt-1.5", tone)}>{delta}</p>}
    </Card>
  );
}

export default Card;
