import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "../utils";
import { Button } from "./Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, description, size = "md", children, footer }: ModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    if (open) { document.addEventListener("keydown", handleEsc); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handleEsc); document.body.style.overflow = ""; };
  }, [open, handleEsc]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[var(--ds-z-modal)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative w-full rounded-2xl bg-[var(--ds-surface-elevated)] border border-[var(--ds-border-primary)] shadow-[var(--ds-shadow-lg)] overflow-hidden", sizes[size])}>
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 pb-0">
            <div>
              {title && <h3 className="ds-h3">{title}</h3>}
              {description && <p className="ds-body-sm mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--ds-hover-overlay)] text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)] transition-colors cursor-pointer">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="p-5">{children}</div>
        {/* Footer */}
        {footer && <div className="flex items-center justify-end gap-2.5 p-5 pt-0 border-t border-[var(--ds-border-primary)] mt-2 pt-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── PRESETS ─── */
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "primary", loading }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={variant === "danger" ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }>
      <p className="ds-body-md">{message}</p>
    </Modal>
  );
}

export default Modal;
