import React from "react";
import { cn } from "../utils";

type FieldState = "default" | "error" | "success";

const fieldBase =
  "w-full rounded-xl bg-[var(--ds-surface-secondary)] border text-[var(--ds-text-primary)] " +
  "placeholder:text-[var(--ds-text-muted)] transition-all outline-none " +
  "focus:border-[var(--ds-brand-primary)] focus:ring-[3px] focus:ring-[var(--ds-focus-ring)] " +
  "disabled:opacity-45 disabled:pointer-events-none";

const stateBorder: Record<FieldState, string> = {
  default: "border-[var(--ds-border-primary)]",
  error:   "border-[var(--ds-error)]",
  success: "border-[var(--ds-success)]",
};

export interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
export function Field({ label, hint, error, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="ds-label block">
          {label}{required && <span className="text-[var(--ds-error)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-[var(--ds-error)] font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[var(--ds-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: FieldState;
  leftIcon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ state = "default", leftIcon, className, ...rest }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-muted)] pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(fieldBase, stateBorder[state], "h-10 px-3.5 text-sm", leftIcon && "pl-9", className)}
        {...rest}
      />
    </div>
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { state?: FieldState }>(
  ({ state = "default", className, ...rest }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, stateBorder[state], "px-3.5 py-2.5 text-sm min-h-[96px] resize-y", className)} {...rest} />
  )
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  state?: FieldState;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ state = "default", className, children, ...rest }, ref) => (
    <select ref={ref} className={cn(fieldBase, stateBorder[state], "h-10 px-3.5 text-sm appearance-none cursor-pointer", className)} {...rest}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export default Input;
