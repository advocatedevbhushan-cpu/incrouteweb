import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "../utils";

type ToastType = "success" | "error" | "warning" | "info";
interface ToastItem { id: string; type: ToastType; title: string; message?: string; }

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4.5 h-4.5 text-[var(--ds-success)]" />,
  error:   <XCircle className="w-4.5 h-4.5 text-[var(--ds-error)]" />,
  warning: <AlertTriangle className="w-4.5 h-4.5 text-[var(--ds-warning)]" />,
  info:    <Info className="w-4.5 h-4.5 text-[var(--ds-info)]" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-[rgba(34,197,94,0.3)]",
  error:   "border-[rgba(239,68,68,0.3)]",
  warning: "border-[rgba(245,158,11,0.3)]",
  info:    "border-[rgba(59,130,246,0.3)]",
};

/* ─── SINGLE TOAST ─── */
function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), 5000);
    return () => clearTimeout(t);
  }, [item.id, onDismiss]);

  return (
    <div className={cn(
      "flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--ds-surface-elevated)] border shadow-[var(--ds-shadow-md)] max-w-sm w-full animate-[slideUp_0.25s_ease-out]",
      bgMap[item.type]
    )}>
      <span className="mt-0.5">{icons[item.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--ds-text-primary)] leading-tight">{item.title}</p>
        {item.message && <p className="text-[12px] text-[var(--ds-text-muted)] mt-0.5 leading-relaxed">{item.message}</p>}
      </div>
      <button onClick={() => onDismiss(item.id)} className="p-1 rounded-md hover:bg-[var(--ds-hover-overlay)] text-[var(--ds-text-muted)] cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── TOAST CONTAINER ─── */
interface ToastContextType { toast: (type: ToastType, title: string, message?: string) => void; }
const ToastContext = createContext<ToastContextType>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: string) => setItems(p => p.filter(i => i.id !== id)), []);
  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    setItems(p => [...p, { id: Date.now().toString(36) + Math.random().toString(36).slice(2), type, title, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[var(--ds-z-toast)] flex flex-col-reverse gap-2.5 pointer-events-none">
        {items.map(item => (
          <div key={item.id} className="pointer-events-auto">
            <ToastEntry item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
