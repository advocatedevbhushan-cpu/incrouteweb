import React from "react";
import { documentCategories, DocumentCategory } from "../../data/documentCategories";

interface DocumentCategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function DocumentCategoryTabs({
  activeCategory,
  onSelectCategory
}: DocumentCategoryTabsProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase font-mono tracking-widest text-[#080F2A] font-bold">
          Select Document Type
        </h3>
        <span className="text-[10px] text-slate-400 font-medium font-sans">
          50+ startup legal templates
        </span>
      </div>

      {/* Horizontal scrolling wrapper for mobile responsive behavior */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {documentCategories.map((category: DocumentCategory) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 text-[10.5px] font-bold rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer snap-start ${
                isActive
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm shadow-indigo-500/10"
                  : "bg-white/90 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
