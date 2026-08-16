import React, { useState } from "react";
import { Check, Sparkles, PhoneCall, Download, ShieldCheck } from "lucide-react";

interface PlanOption {
  id: string;
  title: string;
  badge: string;
  price: string;
  isPremium?: boolean;
  isEnterprise?: boolean;
  features: string[];
  buttonText: string;
  onAction: () => void;
  disabled?: boolean;
}

interface ServicePlanCardProps {
  onFreeDownload: () => void;
  onPremiumRequest: () => void;
  onEnterpriseTalk: () => void;
  canDownloadFree: boolean;
  premiumCooldown: boolean;
}

export default function ServicePlanCard({
  onFreeDownload,
  onPremiumRequest,
  onEnterpriseTalk,
  canDownloadFree,
  premiumCooldown
}: ServicePlanCardProps) {
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(1); // Default to middle plan

  const plans: PlanOption[] = [
    {
      id: "free",
      title: "Common Standard Draft",
      badge: "Free Edition",
      price: "₹0",
      features: [
        "Instant template generation",
        "Auto-filled statutory variables",
        "Standard ROC compliant clauses",
        "PDF & Word instant download"
      ],
      buttonText: "Download Free Draft",
      onAction: onFreeDownload,
      disabled: !canDownloadFree
    },
    {
      id: "counsel",
      title: "Custom Legal Counsel Draft",
      badge: "Recommended",
      isPremium: true,
      price: "Lawyer Reviewed",
      features: [
        "Lawyer-reviewed document",
        "Custom indemnity & protective clauses",
        "Priority 24h statutory turnaround",
        "30-day revision & stamping support"
      ],
      buttonText: premiumCooldown ? "Request Sent ✓" : "Request Custom Draft",
      onAction: onPremiumRequest,
      disabled: premiumCooldown
    },
    {
      id: "enterprise",
      title: "End-to-End Governance Suite",
      badge: "Enterprise",
      isEnterprise: true,
      price: "Dedicated Retainer",
      features: [
        "Dedicated corporate secretary & counsel",
        "Unlimited custom agreements & resolutions",
        "Statutory compliance & filing manager",
        "Priority 1-on-1 advisor consultations"
      ],
      buttonText: "Consult Legal Team",
      onAction: onEnterpriseTalk
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-6 text-left">
      {plans.map((plan: PlanOption, idx: number) => {
        const isSelected = selectedPlanIdx === idx;
        
        return (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanIdx(idx)}
            className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              isSelected
                ? "glass-surface-elevated border-[var(--accent)] ring-2 ring-[var(--accent)] shadow-2xl shadow-[var(--accent)]/15 scale-[1.02]"
                : "glass-glow-card border-[var(--border-subtle)] opacity-90 hover:opacity-100"
            }`}
          >
            {/* Ambient Aura Orb for Selected Card */}
            {isSelected && (
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-[var(--accent)]/20 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg border font-bold ${
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/40"
                    : "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                }`}>
                  {plan.badge}
                </span>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected 
                    ? "bg-[var(--accent)] text-[var(--on-gradient-text)] border-[var(--accent)] shadow-xs" 
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-transparent"
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[15px] font-extrabold font-display leading-tight text-[var(--text-primary)]">
                  {plan.title}
                </h4>
                <p className="text-base font-extrabold font-mono text-[var(--accent)]">
                  {plan.price}
                </p>
              </div>

              <ul className="space-y-2 text-xs font-sans font-medium pt-3 border-t border-[var(--border-subtle)]">
                {plan.features.map((feat: string, fIdx: number) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-[var(--text-tertiary)]"}`} />
                    <span className={isSelected ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)]"}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  plan.onAction();
                }}
                disabled={plan.disabled}
                className={`w-full py-3 rounded-xl transition-all cursor-pointer font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSelected
                    ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-95 text-[var(--on-gradient-text)] shadow-lg shadow-[var(--accent)]/20"
                    : "bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                {plan.isPremium ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : plan.isEnterprise ? (
                  <PhoneCall className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {plan.buttonText}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
