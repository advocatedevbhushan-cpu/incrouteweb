import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils";

type Variant = "primary" | "secondary" | "ghost" | "text" | "danger" | "success";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all select-none " +
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ds-focus-ring)] " +
  "disabled:opacity-45 disabled:pointer-events-none active:translate-y-px cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--ds-brand-primary)] hover:bg-[var(--ds-brand-primary-hover)] text-white",
  secondary:
    "bg-transparent border border-[var(--ds-border-strong)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-hover-overlay)]",
  ghost:
    "bg-transparent text-[var(--ds-text-secondary)] hover:bg-[var(--ds-hover-overlay)] hover:text-[var(--ds-text-primary)]",
  text:
    "bg-transparent text-[var(--ds-brand-primary)] hover:text-[var(--ds-brand-primary-hover)] px-0",
  danger:
    "bg-[var(--ds-error)] hover:brightness-110 text-white",
  success:
    "bg-[var(--ds-success)] hover:brightness-110 text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, className, children, disabled, ...rest },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
