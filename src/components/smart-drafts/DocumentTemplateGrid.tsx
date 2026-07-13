import React from "react";
import { DocumentTemplate } from "../../data/documentTemplates";
import DocumentTemplateCard from "./DocumentTemplateCard";

interface DocumentTemplateGridProps {
  templates: DocumentTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function DocumentTemplateGrid({
  templates,
  selectedTemplateId,
  onSelectTemplate
}: DocumentTemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="py-12 text-center bg-white/40 border border-slate-100 rounded-3xl space-y-2">
        <p className="text-xs font-bold text-slate-700">No templates found</p>
        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
          Try adjusting your search keywords or switching to a different category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar py-1">
      {templates.map((template: DocumentTemplate) => (
        <DocumentTemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplateId === template.id}
          onSelect={() => onSelectTemplate(template.id)}
        />
      ))}
    </div>
  );
}
