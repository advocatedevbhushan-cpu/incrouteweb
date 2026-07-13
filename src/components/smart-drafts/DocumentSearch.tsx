import React from "react";
import { Search, X } from "lucide-react";

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DocumentSearch({ value, onChange }: DocumentSearchProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search legal documents..."
        className="w-full pl-10 pr-10 py-3 bg-white/90 border border-slate-200 rounded-2xl text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/5 placeholder-slate-400 shadow-sm transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
