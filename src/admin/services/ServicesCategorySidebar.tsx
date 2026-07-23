import React from "react";
import { Layers, Plus, Sparkles, Folder } from "lucide-react";
import { AdminServiceItem } from "./servicesTypes";

interface ServicesCategorySidebarProps {
  categoriesList: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  services: AdminServiceItem[];
  onAddService: () => void;
}

export default function ServicesCategorySidebar({
  categoriesList,
  selectedCategory,
  onSelectCategory,
  services,
  onAddService
}: ServicesCategorySidebarProps) {
  // Compute count for each category
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = services.filter((s) => s.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = services.length;

  return (
    <div className="w-full lg:w-[260px] shrink-0 space-y-4 text-left">
      {/* Category List Box */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
          Categories
        </p>

        {/* All Services Item */}
        <button
          onClick={() => onSelectCategory("All Categories")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === "All Categories"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs font-bold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Folder className={`w-4 h-4 ${selectedCategory === "All Categories" ? "text-indigo-600" : "text-slate-400"}`} />
            <span>All Services</span>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
            selectedCategory === "All Categories" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Category List */}
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="truncate">{cat}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add New Service Promotion Card (Matching Image Reference) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-lg shadow-indigo-500/20 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-white">Add New Service</h4>
          <p className="text-xs text-indigo-100/80 leading-relaxed font-normal">
            Create and manage new offerings, legal workflows, pricing, and required client documents.
          </p>
        </div>

        <button
          onClick={onAddService}
          className="w-full py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>
    </div>
  );
}
