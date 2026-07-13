import React from "react";
import { FormField } from "../../data/documentTemplates";

interface DynamicDocumentFormProps {
  fields: FormField[];
  values: Record<string, string>;
  onChangeField: (fieldId: string, value: string) => void;
  errors: Record<string, string>;
}

export default function DynamicDocumentForm({
  fields,
  values,
  onChangeField,
  errors
}: DynamicDocumentFormProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-indigo-500/10 pb-2 text-left">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-[#4F46E5] font-bold">
          Document Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field: FormField) => {
          const value = values[field.id] || "";
          const hasError = !!errors[field.id];
          const errorMsg = errors[field.id];

          // Determine if this field should span 2 columns
          const isFullWidth = field.type === "textarea" || field.id === "premisesAddress" || field.id === "resolutionSubject" || field.id === "detailedPurpose" || field.id === "factualBackground" || field.id === "breachCause" || field.id === "benefits";

          // Render appropriate input element based on type
          return (
            <div
              key={field.id}
              className={`space-y-1.5 text-left group ${
                isFullWidth ? "sm:col-span-2" : ""
              }`}
            >
              <label className="text-[9.5px] uppercase font-mono tracking-widest text-[#080F2A] font-bold flex items-center gap-0.5 group-hover:text-[#4F46E5] transition-colors">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  value={value}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 placeholder-slate-400 shadow-sm resize-none transition-all ${
                    hasError ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#4F46E5]"
                  }`}
                />
              ) : field.type === "select" ? (
                <select
                  value={value}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer shadow-sm transition-all ${
                    hasError ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#4F46E5]"
                  }`}
                >
                  <option value="">{field.placeholder || "Select option..."}</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-3 cursor-pointer py-1.5 select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={value === "true"}
                      onChange={(e) => onChangeField(field.id, e.target.checked ? "true" : "false")}
                      className="w-5 h-5 rounded-md border-2 border-slate-300 accent-[#4F46E5] cursor-pointer appearance-none checked:bg-[#4F46E5] checked:border-[#4F46E5] transition-colors"
                    />
                    {value === "true" && (
                      <span className="absolute text-white font-black text-[10px] pointer-events-none">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#080F2A] font-bold">
                    {field.placeholder || "Yes, enable this option"}
                  </span>
                </label>
              ) : (
                <input
                  type={field.type === "currency" || field.type === "number" ? "number" : field.type}
                  value={value}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 placeholder-slate-400 shadow-sm transition-all ${
                    hasError ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#4F46E5]"
                  }`}
                />
              )}

              {field.helperText && !hasError && (
                <p className="text-[9px] text-slate-400 font-sans font-medium">
                  {field.helperText}
                </p>
              )}

              {hasError && (
                <p className="text-[9px] text-red-500 font-sans font-bold">
                  {errorMsg}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
