import React from "react";
import { cn } from "../utils";

/* ─── CHECKBOX ─── */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}
export function Checkbox({ label, className, id, ...rest }: CheckboxProps) {
  const uid = id || `cb-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={uid} className={cn("inline-flex items-center gap-2.5 cursor-pointer group", className)}>
      <input
        id={uid}
        type="checkbox"
        className="peer sr-only"
        {...rest}
      />
      <span className="w-4.5 h-4.5 rounded-md border border-[var(--ds-border-strong)] bg-[var(--ds-surface-secondary)] flex items-center justify-center transition-all peer-checked:bg-[var(--ds-brand-primary)] peer-checked:border-[var(--ds-brand-primary)] peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]">
        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && <span className="text-sm text-[var(--ds-text-secondary)] group-hover:text-[var(--ds-text-primary)] transition-colors">{label}</span>}
    </label>
  );
}

/* ─── RADIO ─── */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}
export function Radio({ label, className, id, ...rest }: RadioProps) {
  const uid = id || `rd-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={uid} className={cn("inline-flex items-center gap-2.5 cursor-pointer group", className)}>
      <input id={uid} type="radio" className="peer sr-only" {...rest} />
      <span className="w-4.5 h-4.5 rounded-full border border-[var(--ds-border-strong)] bg-[var(--ds-surface-secondary)] flex items-center justify-center transition-all peer-checked:border-[var(--ds-brand-primary)] peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]">
        <span className="w-2 h-2 rounded-full bg-[var(--ds-brand-primary)] opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-all" />
      </span>
      {label && <span className="text-sm text-[var(--ds-text-secondary)] group-hover:text-[var(--ds-text-primary)] transition-colors">{label}</span>}
    </label>
  );
}

/* ─── TOGGLE / SWITCH ─── */
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}
export function Toggle({ label, className, id, ...rest }: ToggleProps) {
  const uid = id || `tg-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={uid} className={cn("inline-flex items-center gap-2.5 cursor-pointer group", className)}>
      <input id={uid} type="checkbox" className="peer sr-only" {...rest} />
      <span className="relative w-9 h-5 rounded-full bg-[var(--ds-surface-elevated)] border border-[var(--ds-border-primary)] transition-colors peer-checked:bg-[var(--ds-brand-primary)] peer-checked:border-[var(--ds-brand-primary)] peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]">
        <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
      {label && <span className="text-sm text-[var(--ds-text-secondary)] group-hover:text-[var(--ds-text-primary)] transition-colors">{label}</span>}
    </label>
  );
}
