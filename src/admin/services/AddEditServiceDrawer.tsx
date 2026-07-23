import React, { useState, useEffect } from "react";
import { X, Check, Save, Plus, Trash2, IndianRupee, Layers, FileText, Clock, ShieldCheck } from "lucide-react";
import { AdminServiceItem } from "./servicesTypes";

interface AddEditServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: AdminServiceItem | null;
  onSave: (service: Partial<AdminServiceItem>) => void;
  categoriesList: string[];
}

export default function AddEditServiceDrawer({
  isOpen,
  onClose,
  serviceToEdit,
  onSave,
  categoriesList
}: AddEditServiceDrawerProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "workflow" | "documents">("basic");

  const [form, setForm] = useState<Partial<AdminServiceItem>>({
    code: "",
    name: "",
    category: "Incorporation",
    description: "",
    basePrice: 1499,
    gstRate: 18,
    govtFee: 1000,
    profFee: 1499,
    priceDisplayType: "STARTING_FROM",
    status: "ACTIVE",
    estimatedDays: 7,
    department: "Corporate Secretarial",
    defaultAssignee: "CS Associate",
    requiredDocuments: ["PAN Card", "Aadhaar Card", "Utility Bill + NOC"],
    workflowStages: [
      { title: "Document Collection", desc: "Gather identity & address proofs." },
      { title: "Statutory E-Filing", desc: "Submit application to MCA / GST Portal." }
    ]
  });

  const [newDocName, setNewDocName] = useState("");

  useEffect(() => {
    if (serviceToEdit) {
      setForm(serviceToEdit);
    } else {
      setForm({
        code: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: "",
        category: "Incorporation",
        description: "",
        basePrice: 1499,
        gstRate: 18,
        govtFee: 1000,
        profFee: 1499,
        priceDisplayType: "STARTING_FROM",
        status: "ACTIVE",
        estimatedDays: 7,
        department: "Corporate Secretarial",
        defaultAssignee: "CS Associate",
        requiredDocuments: ["PAN Card", "Aadhaar Card", "Utility Bill + NOC"],
        workflowStages: [
          { title: "Document Collection", desc: "Gather identity & address proofs." },
          { title: "Statutory E-Filing", desc: "Submit application to MCA / GST Portal." }
        ]
      });
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const totalCalculated = Math.round(
    Number(form.basePrice || 0) * (1 + Number(form.gstRate || 0) / 100) + Number(form.govtFee || 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      totalCalculatedPrice: totalCalculated
    });
    onClose();
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    setForm((current) => ({
      ...current,
      requiredDocuments: [...(current.requiredDocuments || []), newDocName.trim()]
    }));
    setNewDocName("");
  };

  const handleRemoveDocument = (index: number) => {
    setForm((current) => ({
      ...current,
      requiredDocuments: (current.requiredDocuments || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between text-left z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {serviceToEdit ? "Edit Service Offering" : "Add New Service Offering"}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Configure statutory details, pricing structures, and workflows.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-2">
          {[
            { id: "basic", label: "1. Basic Info", icon: Layers },
            { id: "pricing", label: "2. Pricing", icon: IndianRupee },
            { id: "workflow", label: "3. Workflow & SLA", icon: Clock },
            { id: "documents", label: "4. Documents", icon: FileText }
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

        {/* Drawer Body Form */}
        <form id="service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={form.category || "Incorporation"}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Limited Company Incorporation"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Short Summary Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary displayed on cards and catalogs"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Service Description</label>
                <textarea
                  rows={4}
                  placeholder="Detailed statutory process, inclusions, and eligibility..."
                  value={form.fullDescription || ""}
                  onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={form.status || "ACTIVE"}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>

                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={form.isPopular || false}
                    onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Highlight as Popular Service
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
                  <span>Live Price Calculation Summary</span>
                  <span className="text-base font-extrabold text-indigo-700 font-mono">
                    ₹{totalCalculated.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700/80">
                  Base Price + GST ({form.gstRate}%) + Govt Fees = Final Payable Amount.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Professional Fee (Base) ₹ *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.basePrice ?? 1499}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GST Rate (%) *</label>
                  <select
                    value={form.gstRate ?? 18}
                    onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={18}>18% GST (Standard)</option>
                    <option value={12}>12% GST</option>
                    <option value={5}>5% GST</option>
                    <option value={0}>0% (Non-GST / Exempt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Government Statutory Fee ₹</label>
                  <input
                    type="number"
                    min={0}
                    value={form.govtFee ?? 1000}
                    onChange={(e) => setForm({ ...form, govtFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price Display Type</label>
                  <select
                    value={form.priceDisplayType || "STARTING_FROM"}
                    onChange={(e) => setForm({ ...form, priceDisplayType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="STARTING_FROM">Starting From</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="CUSTOM_QUOTE">Custom Quotation</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKFLOW & SLA */}
          {activeTab === "workflow" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Completion Time (Days) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.estimatedDays ?? 7}
                    onChange={(e) => setForm({ ...form, estimatedDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Responsible Department</label>
                  <input
                    type="text"
                    value={form.department || "Corporate Secretarial"}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Default Role Assignee</label>
                <input
                  type="text"
                  value={form.defaultAssignee || "CS Associate"}
                  onChange={(e) => setForm({ ...form, defaultAssignee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Required Client Documents Checklist</label>
                
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add document requirement (e.g. Electricity Bill)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(form.requiredDocuments || []).map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> {doc}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="service-form"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {serviceToEdit ? "Save Changes" : "Publish Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
