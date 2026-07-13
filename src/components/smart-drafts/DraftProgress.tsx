import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface DraftProgressProps {
  percentage: number; // 0 to 100
  missingRequiredCount: number;
}

export default function DraftProgress({
  percentage,
  missingRequiredCount
}: DraftProgressProps) {
  const isComplete = percentage === 100;

  return (
    <div className="w-full bg-white/70 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center text-left">
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#080F2A] font-bold">
            Draft Progress
          </h4>
          <p className="text-[9px] text-slate-400 font-sans font-medium mt-0.5">
            Auto-saves modifications in real-time
          </p>
        </div>
        <span className={`text-xs font-mono font-black ${isComplete ? "text-emerald-500" : "text-[#4F46E5]"}`}>
          {percentage}% Complete
        </span>
      </div>

      {/* Outer progress track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/20 select-none">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isComplete
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Validation status notice */}
      <div className="pt-1">
        {missingRequiredCount > 0 ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 border border-amber-500/10 rounded-xl px-3 py-2 text-[10px] font-medium font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Fill in all mandatory parameters. Missing <strong>{missingRequiredCount} required fields</strong> before you can download.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 border border-emerald-500/10 rounded-xl px-3 py-2 text-[10px] font-medium font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              All required fields completed. Draft is validated and ready for export!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
