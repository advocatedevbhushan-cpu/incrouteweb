import React, { useState } from "react";
import { 
  X, Edit, Copy, Power, Building2, CheckCircle2, ShieldCheck, 
  Clock, IndianRupee, Layers, FileText, ShoppingBag, Sparkles
} from "lucide-react";
import { AdminServiceItem } from "./servicesTypes";

interface ServiceDetailDrawerProps {
  service: AdminServiceItem | null;
  onClose: () => void;
  onEdit: (service: AdminServiceItem) => void;
  onDuplicate: (service: AdminServiceItem) => void;
  onToggleStatus: (service: AdminServiceItem) => void;
}

export default function ServiceDetailDrawer({
  service,
  onClose,
  onEdit,
  onDuplicate,
  onToggleStatus
}: ServiceDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pricing" | "workflow" | "documents">("overview");

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between text-left z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {service.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  service.status === "ACTIVE" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {service.status}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {service.name}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-2">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "pricing", label: "Pricing & Tax", icon: IndianRupee },
            { id: "workflow", label: "Workflow & SLA", icon: Clock },
            { id: "documents", label: "Documents", icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick KPI Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Price</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">₹{service.basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Orders</span>
                  <span className="text-base font-extrabold text-indigo-600 font-mono">{service.ordersCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">EST. Timeline</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">{service.estimatedDays} Days</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Service Overview</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {service.fullDescription || service.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Department Assignment</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500">Department: <strong className="text-slate-900">{service.department}</strong></span>
                  <span className="text-slate-500">Default Assignee: <strong className="text-indigo-600">{service.defaultAssignee}</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                <span className="text-xs font-bold text-indigo-900 block">Total Final Payable Price</span>
                <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                  ₹{(service.totalCalculatedPrice || service.basePrice).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Professional Base Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹{service.basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">GST Rate Applied</span>
                  <span className="font-mono font-bold text-slate-900">{service.gstRate}% GST</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Government Fee Breakdown</span>
                  <span className="font-mono font-bold text-slate-900">₹{service.govtFee.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workflow" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">Statutory Execution Stages</h4>
              <div className="space-y-3">
                {(service.workflowStages || []).map((stage, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {stage.title}
                    </div>
                    <p className="text-slate-500 pl-7">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">Required Client Documents Checklist</h4>
              <div className="space-y-2">
                {(service.requiredDocuments || []).map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={() => onToggleStatus(service)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" /> {service.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(service)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={() => { onEdit(service); onClose(); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
