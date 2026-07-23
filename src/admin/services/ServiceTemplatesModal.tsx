import React from "react";
import { X, BookOpen, Plus, Sparkles, Clock, FileText, CheckCircle2 } from "lucide-react";
import { ServiceTemplateItem } from "./servicesTypes";

interface ServiceTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ServiceTemplateItem[];
  onUseTemplate: (template: ServiceTemplateItem) => void;
}

export default function ServiceTemplatesModal({
  isOpen,
  onClose,
  templates,
  onUseTemplate
}: ServiceTemplatesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left z-10 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Reusable Service Templates Library</h3>
              <p className="text-xs text-slate-500 font-normal">
                Instantly launch pre-configured statutory services with pre-built checklists and workflows.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div 
                key={tmpl.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tmpl.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ₹{tmpl.basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 font-normal">
                    {tmpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {tmpl.estimatedDays} Days SLA
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> {tmpl.requiredDocuments.length} Docs Required
                  </span>
                </div>

                <button
                  onClick={() => { onUseTemplate(tmpl); onClose(); }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Service from Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
}
