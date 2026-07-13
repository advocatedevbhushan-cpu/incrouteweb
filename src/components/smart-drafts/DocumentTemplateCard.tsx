import React from "react";
import * as Icons from "lucide-react";
import { DocumentTemplate } from "../../data/documentTemplates";

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DocumentTemplateCard({
  template,
  isSelected,
  onSelect
}: DocumentTemplateCardProps) {
  // Dynamically resolve lucide icon components by name
  const IconComponent = (Icons as any)[template.icon] || Icons.FileText;

  // Keyboard accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      className={`relative p-4 rounded-2xl border text-left cursor-pointer flex flex-col justify-between items-start gap-4 transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 select-none ${
        isSelected
          ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-lg shadow-indigo-500/20 scale-[1.01]"
          : "bg-white/80 border-slate-200 hover:border-indigo-500/30 hover:bg-white text-[#080F2A] hover:-translate-y-[1px]"
      }`}
    >
      <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
        isSelected ? "bg-white/10 text-white" : "bg-indigo-50/70 text-[#4F46E5]"
      }`}>
        <IconComponent className="w-4 h-4" />
      </div>

      <div className="space-y-0.5">
        <h4 className="text-[11px] font-bold leading-tight line-clamp-2">
          {template.title}
        </h4>
        <p className={`text-[9px] line-clamp-1 leading-none ${
          isSelected ? "text-indigo-200/90" : "text-slate-400"
        }`}>
          {template.category.toUpperCase()}
        </p>
      </div>

      {isSelected && (
        <span className="absolute top-3 right-3 flex h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
      )}
    </div>
  );
}
