import React from "react";
import { Check, Sparkles, PhoneCall, Download } from "lucide-react";

interface PlanOption {
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
  const plans: PlanOption[] = [
    {
      title: "Common Standard Draft",
      badge: "Free Edition",
      price: "₹0",
      features: [
        "Instant template generation",
        "Auto-filled variables",
        "Standard clauses",
        "PDF download"
      ],
      buttonText: "Download PDF Now",
      onAction: onFreeDownload,
      disabled: !canDownloadFree
    },
    {
      title: "Custom Legal Counsel Draft",
      badge: "Premium",
      isPremium: true,
      price: "Lawyer Reviewed",
      features: [
        "Lawyer-reviewed document",
        "Custom protective clauses",
        "Priority 24h delivery",
        "30-day revision support"
      ],
      buttonText: premiumCooldown ? "Request Sent ✓" : "Request Custom Draft",
      onAction: onPremiumRequest,
      disabled: premiumCooldown
    },
    {
      title: "End-to-End Legal Support",
      badge: "Enterprise",
      isEnterprise: true,
      price: "Custom Support",
      features: [
        "Dedicated legal manager",
        "Unlimited document assistance",
        "Regulatory & fundraising support",
        "Priority calls & responses"
      ],
      buttonText: "Talk to Our Legal Team",
      onAction: onEnterpriseTalk
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-4">
      {plans.map((plan: PlanOption, idx: number) => {
        const isMain = plan.isPremium;
        
        return (
          <div
            key={idx}
            className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 transition-all duration-300 relative overflow-hidden group ${
              isMain
                ? "border-2 border-[#4F46E5] bg-[#080F2A] text-white shadow-xl shadow-indigo-500/10 hover:-translate-y-1"
                : "border-slate-200/80 bg-white/70 backdrop-blur-md text-[#080F2A] hover:-translate-y-1 shadow-sm hover:shadow-md"
            }`}
          >
            {/* Background glows for premium */}
            {isMain && (
              <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </>
            )}

            <div className="space-y-4 text-left relative z-10">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border font-bold ${
                  isMain
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}>
                  {plan.badge}
                </span>

                {isMain && (
                  <span className="text-[8px] font-mono uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-white px-2 py-0.5 rounded font-black tracking-widest select-none shadow-sm animate-pulse">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[14px] font-extrabold font-sans leading-tight">
                  {plan.title}
                </h4>
                <p className={`text-base font-extrabold font-mono ${isMain ? "text-indigo-400" : "text-[#4F46E5]"}`}>
                  {plan.price}
                </p>
              </div>

              <ul className="space-y-2 text-[10.5px] font-sans font-medium pt-2 border-t border-slate-200/10">
                {plan.features.map((feat: string, fIdx: number) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isMain ? "text-indigo-400" : "text-emerald-500"}`} />
                    <span className={isMain ? "text-indigo-100/90" : "text-slate-600"}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-2">
              <button
                type="button"
                onClick={plan.onAction}
                disabled={plan.disabled}
                className={`w-full py-3 rounded-xl transition-all cursor-pointer font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                  isMain
                    ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/15"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {isMain ? (
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
