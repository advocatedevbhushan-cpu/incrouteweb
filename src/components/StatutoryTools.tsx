import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle,
  Building2, Users, FileText, ClipboardCheck, Scale, X, HelpCircle,
  AlertCircle, Loader2, Send, Info, Check, Search, Download, Copy, Printer
} from "lucide-react";

// Subcomponent imports
import DocumentCategoryTabs from "./smart-drafts/DocumentCategoryTabs";
import DocumentSearch from "./smart-drafts/DocumentSearch";
import DocumentTemplateGrid from "./smart-drafts/DocumentTemplateGrid";
import DynamicDocumentForm from "./smart-drafts/DynamicDocumentForm";
import DraftPreview from "./smart-drafts/DraftPreview";
import PreviewToolbar from "./smart-drafts/PreviewToolbar";
import DraftProgress from "./smart-drafts/DraftProgress";
import ServicePlanCard from "./smart-drafts/ServicePlanCard";

// Data schemas and utilities
import { documentTemplates } from "../data/documentTemplates";
import { generateDraftText } from "../utils/draftGenerator";
import { exportToPDF, exportToDocx, printDocument, copyToClipboard } from "../utils/documentExport";

export default function StatutoryTools() {
  const { lang } = useLang();

  // Workspace layout and template selection states
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("office-noc");
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Schema Form values map, scoped per template ID
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>(() => {
    try {
      // Try restoring all drafts from local storage
      const saved = localStorage.getItem("incroute_drafts_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track field validation errors per template
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAutosaved, setIsAutosaved] = useState<boolean>(true);

  // Premium modal & Enterprise contact trigger states
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [premiumType, setPremiumType] = useState<"premium" | "enterprise">("premium");
  const [premiumCooldown, setPremiumCooldown] = useState<boolean>(() => sessionStorage.getItem("premium_sent") === "true");
  const [premiumSubmitting, setPremiumSubmitting] = useState<boolean>(false);
  const [premiumError, setPremiumError] = useState<string>("");
  const [premiumSuccess, setPremiumSuccess] = useState<boolean>(false);
  const [premiumForm, setPremiumForm] = useState({ email: "", phone: "", specialRequests: "" });
  const [showPremiumInfo, setShowPremiumInfo] = useState<boolean>(false);

  // Retrieve current active template details
  const activeTemplate = useMemo(() => {
    return documentTemplates.find(t => t.id === selectedTemplateId) || documentTemplates[0];
  }, [selectedTemplateId]);

  // Retrieve current fields state for active template
  const activeValues = useMemo(() => {
    return formValues[selectedTemplateId] || {};
  }, [formValues, selectedTemplateId]);

  // Generate the formatted draft text dynamically based on form inputs
  const currentDraftText = useMemo(() => {
    return generateDraftText(selectedTemplateId, activeValues);
  }, [selectedTemplateId, activeValues]);

  // Autosave values to local storage whenever they change
  useEffect(() => {
    try {
      setIsAutosaved(false);
      const timer = setTimeout(() => {
        localStorage.setItem("incroute_drafts_v1", JSON.stringify(formValues));
        setIsAutosaved(true);
      }, 600); // Debounce local storage writes
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("Autosave failed:", e);
    }
  }, [formValues]);

  // Clear errors when switching templates
  useEffect(() => {
    setFormErrors({});
  }, [selectedTemplateId]);

  // Filter templates list based on category & search keywords
  const filteredTemplates = useMemo(() => {
    return documentTemplates.filter(t => {
      const matchesCategory = selectedCategory === "popular"
        ? t.isPopular
        : t.category === selectedCategory;

      const matchesSearch = searchTerm.trim() === ""
        || t.title.toLowerCase().includes(searchTerm.toLowerCase())
        || t.category.toLowerCase().includes(searchTerm.toLowerCase())
        || t.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Handle individual form field value change
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [selectedTemplateId]: {
        ...(prev[selectedTemplateId] || {}),
        [fieldId]: value
      }
    }));

    // Clear validation error if field value is updated
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  // Validate required fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    activeTemplate.fields.forEach(field => {
      if (field.required) {
        const val = activeValues[field.id];
        if (!val || val.trim() === "" || (field.type === "checkbox" && val === "false")) {
          errors[field.id] = `${field.label} is required.`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Compute validation percentage metrics
  const progressMetrics = useMemo(() => {
    const requiredFields = activeTemplate.fields.filter(f => f.required);
    if (requiredFields.length === 0) return { percentage: 100, missingCount: 0 };

    let completedRequiredCount = 0;
    requiredFields.forEach(f => {
      const val = activeValues[f.id];
      if (val && val.trim() !== "" && val !== "false") {
        completedRequiredCount++;
      }
    });

    const percentage = Math.round((completedRequiredCount / requiredFields.length) * 100);
    const missingCount = requiredFields.length - completedRequiredCount;

    return { percentage, missingCount };
  }, [activeTemplate, activeValues]);

  // Clipboard copy handler
  const handleCopyText = () => {
    copyToClipboard(currentDraftText).then((success) => {
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    });
  };

  // Direct print window trigger
  const handlePrint = () => {
    printDocument(activeTemplate.title, currentDraftText);
  };

  // Reset/Clear active draft form inputs
  const handleResetDraft = () => {
    setFormValues(prev => {
      const copy = { ...prev };
      delete copy[selectedTemplateId];
      return copy;
    });
    setFormErrors({});
    setShowClearConfirm(false);
  };

  // PDF Export Trigger (Validates first)
  const handleDownloadPDF = () => {
    if (!validateForm()) {
      // Smooth scroll to details form to display validation bubbles
      const formSection = document.getElementById("document-form-details");
      if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
      return;
    }
    exportToPDF(activeTemplate.title, currentDraftText);
  };

  // DOCX Export Trigger (Validates first)
  const handleDownloadDocx = () => {
    if (!validateForm()) {
      const formSection = document.getElementById("document-form-details");
      if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
      return;
    }
    exportToDocx(activeTemplate.title, currentDraftText);
  };

  // Trigger modal for Premium
  const triggerPremiumRequest = () => {
    setPremiumType("premium");
    setShowPremiumModal(true);
  };

  // Trigger modal for Enterprise
  const triggerEnterpriseRequest = () => {
    setPremiumType("enterprise");
    setShowPremiumModal(true);
  };

  // Form submission handler for custom inquiries (Premium/Enterprise)
  const handlePremiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumForm.email || !premiumForm.phone) {
      setPremiumError("Email and phone number are required.");
      return;
    }
    setPremiumSubmitting(true);
    setPremiumError("");

    setTimeout(() => {
      localStorage.setItem("premium_request_log", JSON.stringify({
        ...premiumForm,
        type: premiumType,
        templateId: selectedTemplateId,
        timestamp: new Date().toISOString(),
      }));

      setPremiumSubmitting(false);
      setShowPremiumModal(false);
      if (premiumType === "premium") {
        setPremiumCooldown(true);
        sessionStorage.setItem("premium_sent", "true");
      }
      setPremiumSuccess(true);
      setPremiumForm({ email: "", phone: "", specialRequests: "" });
      setTimeout(() => setPremiumSuccess(false), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left relative z-10 py-6 px-4">
      {/* Background Blobs */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Hero Header Component */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-semibold rounded-full border border-indigo-500/10 uppercase tracking-widest font-mono select-none">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI-Powered Drafting Engine
        </div>
        <h1 className="text-3xl font-extrabold text-[#080F2A] tracking-tight sm:text-5xl font-sans">
          Smart Legal <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic font-extrabold pr-1.5 inline-block">Drafts.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl mx-auto leading-relaxed font-medium">
          Generate perfectly formatted, legally sound templates for your startup in seconds. Choose a document, enter your details, preview the draft, and download instantly.
        </p>

        {/* Brand Subtle trust indicators */}
        <div className="flex justify-center items-center gap-6 pt-2 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Secure drafting</span>
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[#4F46E5]" /> Editable documents</span>
          <span className="flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Instant PDF generation</span>
        </div>
      </div>

      {/* Main Two-Column Drafting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-7xl mx-auto pt-6">
        
        {/* Left column - Document templates grid & configurations form (48% width) */}
        <div className="lg:col-span-6 bg-white/70 border border-white/40 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-5">
            {/* Category tabs */}
            <DocumentCategoryTabs
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Template search bar */}
            <DocumentSearch
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* Template grid selection library */}
            <DocumentTemplateGrid
              templates={filteredTemplates}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />

            {/* Dynamically parsed schemas form */}
            <div id="document-form-details" className="pt-2">
              <DynamicDocumentForm
                fields={activeTemplate.fields}
                values={activeValues}
                onChangeField={handleFieldChange}
                errors={formErrors}
              />
            </div>
          </div>

          {/* Form Actions Section */}
          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4 mt-6">
            
            {/* Completion metrics progress */}
            <DraftProgress
              percentage={progressMetrics.percentage}
              missingRequiredCount={progressMetrics.missingCount}
            />

            <div className="flex items-center gap-3">
              {/* Primary generate/regenerate action */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex-1 py-3 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#4338CA] hover:to-[#574AE2] text-white font-mono uppercase tracking-wider text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {progressMetrics.percentage > 0 ? "Regenerate Draft" : "Generate Smart Draft"}
              </button>

              {/* Clear draft option */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-3 border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                title="Clear Draft Inputs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Dark navy live preview window (52% width) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          
          {/* Action Toolbar */}
          <PreviewToolbar
            zoom={zoom}
            setZoom={setZoom}
            onCopy={handleCopyText}
            onPrint={handlePrint}
            onReset={() => setShowClearConfirm(true)}
            onDownloadPDF={handleDownloadPDF}
            onDownloadDocx={handleDownloadDocx}
            isCopied={isCopied}
            isAutosaved={isAutosaved}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            canDownload={progressMetrics.missingCount === 0}
          />

          {/* Legal page preview element */}
          <DraftPreview
            title={activeTemplate.title}
            content={currentDraftText}
            zoom={zoom}
            className="flex-1"
          />

          {/* Legal disclaimer footer area */}
          <div className="p-4 bg-white/60 border border-indigo-500/5 rounded-2xl text-[10px] text-slate-400 leading-relaxed font-sans text-center">
            <span className="font-extrabold text-slate-500">Legal Disclaimer:</span> Standard drafts are generated from general templates and may not address every legal or factual circumstance. Consider professional review before execution.
          </div>
        </div>
      </div>

      {/* Pricing Tier Plans strip */}
      <div className="max-w-7xl mx-auto pt-8">
        <div className="border-b border-indigo-500/10 pb-2 mb-4 text-left">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#4F46E5] font-black">
            Choose Your Drafting Plan
          </h3>
        </div>
        <ServicePlanCard
          onFreeDownload={handleDownloadPDF}
          onPremiumRequest={triggerPremiumRequest}
          onEnterpriseTalk={triggerEnterpriseRequest}
          canDownloadFree={progressMetrics.missingCount === 0}
          premiumCooldown={premiumCooldown}
        />
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-base font-extrabold text-[#080F2A]">Clear Draft Fields?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
              Are you sure you want to clear all form fields? This will delete all entered text for <strong>{activeTemplate.title}</strong> from local storage.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                No, Keep Draft
              </button>
              <button
                type="button"
                onClick={handleResetDraft}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isFullscreen && createPortal(
          <div className="fixed inset-0 z-[2000] bg-[#0B1120] overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start gap-4">
            <div className="w-full max-w-3xl flex justify-between items-center text-slate-300 py-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6366F1] flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-[#6366F1]" /> Full Screen Legal Preview
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"
              >
                <X className="w-3.5 h-3.5" /> Close Preview
              </button>
            </div>

            <div className="w-full max-w-2xl py-6">
              <DraftPreview
                title={activeTemplate.title}
                content={currentDraftText}
                zoom={100}
                fullHeight={true}
              />
            </div>
          </div>,
          document.body
        )}
      </AnimatePresence>

      {/* Dynamic Premium/Enterprise Request Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white border border-indigo-500/10 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-left"
          >
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#080F2A] flex items-center gap-2 font-sans">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" /> 
                {premiumType === "premium" ? "Premium Draft Request" : "Enterprise Legal Consultation"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {premiumType === "premium" ? (
                  <>
                    Our expert attorney will contact you within <strong className="text-[#4F46E5]">15 minutes</strong> during working hours (Mon-Fri, 10 AM – 7 PM IST) to understand your custom requirements and share pricing.
                  </>
                ) : (
                  <>
                    Request an end-to-end custom drafting and compliance proposal. Our advisory partners will reach out to schedule an advisory call.
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handlePremiumSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={premiumForm.email}
                  onChange={(e) => setPremiumForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={premiumForm.phone}
                  onChange={(e) => setPremiumForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Special Requests / Requirements</label>
                <textarea
                  value={premiumForm.specialRequests}
                  onChange={(e) => setPremiumForm(p => ({ ...p, specialRequests: e.target.value }))}
                  placeholder={
                    premiumType === "premium"
                      ? "e.g. I need a custom IP protection and non-compete clause..."
                      : "Describe your overall company structure and expected document volumes..."
                  }
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#080F2A] font-semibold outline-none focus:border-[#4F46E5] placeholder-slate-400 shadow-sm resize-none"
                />
              </div>

              {premiumError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {premiumError}
                </div>
              )}

              <button
                type="submit"
                disabled={premiumSubmitting}
                className="w-full bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#3F37C9] hover:to-[#4F46E5] text-white font-mono uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all cursor-pointer font-bold shadow-lg shadow-indigo-500/15 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {premiumSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Notification Toast */}
      <AnimatePresence>
        {premiumSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[3000] max-w-sm bg-[#080F2A] border border-[#1E293B] text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 text-left"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">Request Received!</p>
              <p className="text-[10px] leading-relaxed text-slate-400 font-sans">
                Our representative will get back to you shortly. Check your inbox and phone lines. Thank you!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
