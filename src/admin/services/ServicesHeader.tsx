import React from "react";
import { Plus, Download, Upload, BookOpen, Sparkles, ChevronRight, Layers } from "lucide-react";

interface ServicesHeaderProps {
  onAddService: () => void;
  onOpenTemplates: () => void;
  onExport: () => void;
  onImport: () => void;
  totalServicesCount: number;
}

export default function ServicesHeader({
  onAddService,
  onOpenTemplates,
  onExport,
  onImport,
  totalServicesCount
}: ServicesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
      {/* Left: Title & Breadcrumb */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Management</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-indigo-600 font-semibold">Services ({totalServicesCount})</span>
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Services <Sparkles className="w-5 h-5 text-indigo-600" />
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Manage all your corporate service offerings, pricing models, statutory workflows, and client requests.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onOpenTemplates}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Open reusable service template library"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Service Templates</span>
        </button>

        <button
          onClick={onImport}
          className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Import services from CSV/JSON"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Import</span>
        </button>

        <button
          onClick={onExport}
          className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Export services list"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          onClick={onAddService}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>
    </div>
  );
}
