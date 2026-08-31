import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Clock, Phone, Mail, CheckCircle2, Sparkles, Building2,
  ArrowRight, User, Lock, Scale, Send, FileText, AlertCircle,
  Award, Star, MessageSquare, ShieldCheck, BadgeCheck, Zap,
  ExternalLink, ChevronRight
} from "lucide-react";

interface ContactFormWidgetProps {
  initialMessage?: string;
  defaultService?: string;
}

const CONSULTATION_SERVICES = [
  { id: "pvt-ltd", label: "Pvt Ltd Company", icon: Building2, desc: "Fast-track incorporation with MCA" },
  { id: "llp", label: "LLP Registration", icon: Scale, desc: "Limited liability partnership deed" },
  { id: "compliance", label: "ROC & Annual Filings", icon: FileText, desc: "AOC-4, MGT-7, Dir-3 KYC" },
  { id: "gst", label: "GST & Tax Advisory", icon: BadgeCheck, desc: "REG-01, returns & dispute advisory" },
  { id: "trademark", label: "Trademark & IP", icon: ShieldCheck, desc: "Brand protection & objection reply" },
  { id: "virtual-cfo", label: "Virtual CFO & Books", icon: Award, desc: "Accounting, MIS & compliance" },
  { id: "other", label: "General Corporate Advisory", icon: MessageSquare, desc: "Custom startup legal queries" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", time: "10:00 AM – 1:00 PM" },
  { id: "afternoon", label: "Afternoon", time: "2:00 PM – 5:00 PM" },
  { id: "evening", label: "Evening", time: "5:00 PM – 7:30 PM" },
  { id: "urgent", label: "Earliest Slot", time: "Within 2 Hours" },
];

export default function ContactFormWidget({
  initialMessage = "",
  defaultService = "pvt-ltd",
}: ContactFormWidgetProps) {
  const [searchParams] = useSearchParams();
  const queryService = searchParams.get("service") || "";
  const queryScope = searchParams.get("scope") || "";

  // Selected service matching query or default
  const [selectedService, setSelectedService] = useState<string>(() => {
    if (queryService) {
      const match = CONSULTATION_SERVICES.find(
        (s) => s.label.toLowerCase().includes(queryService.toLowerCase()) || queryService.toLowerCase().includes(s.label.toLowerCase())
      );
      if (match) return match.id;
    }
    return defaultService;
  });

  const [selectedSlot, setSelectedSlot] = useState<string>("morning");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: initialMessage || (queryService ? `I need assistance regarding ${queryService}${queryScope ? ` (${queryScope})` : ""}.` : ""),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketRef, setTicketRef] = useState("");

  useEffect(() => {
    if (queryService) {
      const match = CONSULTATION_SERVICES.find(
        (s) => s.label.toLowerCase().includes(queryService.toLowerCase()) || queryService.toLowerCase().includes(s.label.toLowerCase())
      );
      if (match) setSelectedService(match.id);
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `I need assistance regarding ${queryService}${queryScope ? ` (${queryScope})` : ""}.`,
      }));
    }
  }, [queryService, queryScope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please complete all required fields (Name, Email, and Requirements).");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const activeServiceObj = CONSULTATION_SERVICES.find((s) => s.id === selectedService);
    const activeSlotObj = TIME_SLOTS.find((t) => t.id === selectedSlot);

    const fullMessage = [
      formData.message,
      formData.companyName ? `Company / Entity: ${formData.companyName}` : "",
      `Preferred Slot: ${activeSlotObj?.label} (${activeSlotObj?.time})`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || "Not provided",
          service: activeServiceObj?.label || selectedService,
          message: fullMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const ref = "INC-" + Math.floor(100000 + Math.random() * 900000);
        setTicketRef(ref);
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", phone: "", companyName: "", message: "" });
        window.scrollTo({ top: 120, behavior: "smooth" });
      } else {
        setErrorMessage(data.error || "Unable to send your request. Please try again or reach us on WhatsApp.");
      }
    } catch (err) {
      setErrorMessage("Network connection issue. Please contact us directly via phone or WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] relative overflow-hidden py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* ═══ Atmospheric Glows ═══ */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-br from-[#6857EE]/15 to-[#C49235]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#6857EE]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        {/* ═══ HERO SECTION ═══ */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-on-1 Statutory Consultation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15]">
            Book Your Consultation With{" "}
            <span className="text-[var(--accent)] italic font-normal font-serif">Senior Legal & CA Experts</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Schedule a 30-minute confidential advisory session for Company Incorporation, ROC Filings, GST Compliance,
            Startup Tax Exemptions, and Trademark Protection.
          </p>

          {/* Trust Pills Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Rapid 2-Hour Response</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Confidential (NDA)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
              <Scale className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Practicing CAs & Advocates</span>
            </span>
          </div>
        </div>

        {/* ═══ MAIN 2-COLUMN GRID (PC & MOBILE) ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ─── LEFT COLUMN: BOOKING FORM (7 Cols) ─── */}
          <div className="lg:col-span-7">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl backdrop-blur-md relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[#A99FFF] to-amber-500" />

              <AnimatePresence mode="wait">
                {submitSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-10 px-4 space-y-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        Consultation Request Confirmed!
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                        Thank you for reaching out. A Senior Corporate Advisor has been assigned to review your requirements.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] max-w-sm mx-auto space-y-2 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)]">Reference ID:</span>
                        <span className="font-mono font-bold text-[var(--accent)]">{ticketRef}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)]">Expected Callback:</span>
                        <span className="font-semibold text-emerald-500">Within 2 Business Hours</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)]">Session Format:</span>
                        <span className="font-medium text-[var(--text-primary)]">Google Meet / Direct Phone</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href="https://wa.me/918707552183?text=Hello%20INCroute,%20I%20just%20submitted%20a%20consultation%20request%20with%20reference%20"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp Now</span>
                      </a>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold text-xs transition-all border border-[var(--border-subtle)] cursor-pointer"
                      >
                        Book Another Session
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        Tell Us About Your Requirements
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                        Select your practice area and preferred time slot for a personalized roadmap.
                      </p>
                    </div>

                    {/* ─── 1. Service Selection Pills ─── */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                        <span>Select Advisory Area *</span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">Tap to switch</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                        {CONSULTATION_SERVICES.map((s) => {
                          const isSelected = selectedService === s.id;
                          const IconComp = s.icon;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedService(s.id)}
                              className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] shadow-xs"
                                  : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <IconComp className={`w-4 h-4 ${isSelected ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`} />
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                              </div>
                              <span className="text-xs font-bold leading-tight">{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ─── 2. Personal & Entity Inputs ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Full Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Adv. Rajesh Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-11 px-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Work Email Address *</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="rajesh@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-11 px-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Mobile / WhatsApp Number</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-xs font-semibold text-[var(--text-tertiary)]">
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-11 pl-12 pr-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Proposed Entity Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Company / Brand Name (Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Tech Solutions"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full h-11 px-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
                        />
                      </div>
                    </div>

                    {/* ─── 3. Preferred Time Window ─── */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Preferred Consultation Window</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TIME_SLOTS.map((t) => {
                          const isSelected = selectedSlot === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedSlot(t.id)}
                              className={`p-2.5 rounded-xl text-center border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] font-bold shadow-xs"
                                  : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                              }`}
                            >
                              <div className="text-xs font-bold">{t.label}</div>
                              <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{t.time}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ─── 4. Message Textarea ─── */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                        <span>Brief Requirement / Query *</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Confidential</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your business activity, capital, questions regarding ROC/GST, or specific timeline..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all resize-none"
                      />
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* ─── 5. Submit Button ─── */}
                    <div className="space-y-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#4F46E5] hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-[var(--accent)]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Scheduling Consultation...</span>
                          </>
                        ) : (
                          <>
                            <span>Schedule Free Consultation</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-center text-[var(--text-tertiary)] flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>Zero upfront charge. Standard statutory attorney-client confidentiality applies.</span>
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: ADVISORY DESK & TRUST (5 Cols) ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Fast Track Direct Channels */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
                  Immediate Assistance
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Direct Advisory Concierge</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Need rapid statutory clearance or have an urgent ROC deadline? Connect instantly:
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Phone */}
                <a
                  href="tel:+918707552183"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] font-medium">Direct Telephone</div>
                      <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        +91 87075 52183
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Call Now
                  </span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/918707552183?text=Hello%20INCroute,%20I%20would%20like%20to%20consult%20with%20a%20legal/CA%20advisor."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] font-medium">WhatsApp Priority Desk</div>
                      <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                        Instant WhatsApp Chat
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                </a>

                {/* Email */}
                <a
                  href="mailto:info@incroute.com"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] font-medium">Official Email</div>
                      <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        info@incroute.com
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Write Us</span>
                </a>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-[var(--text-tertiary)] border-t border-[var(--border-subtle)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Operating Hours: Mon - Sat: 9:30 AM - 7:00 PM IST</span>
              </div>
            </div>

            {/* 2. What Happens in the Consultation */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--accent)]" />
                <span>What to Expect in Your Session</span>
              </h3>

              <div className="space-y-3">
                {[
                  {
                    step: "01",
                    title: "Corporate Structure Evaluation",
                    desc: "Analyze whether Pvt Ltd, LLP, or OPC minimizes tax overhead & optimizes liability.",
                  },
                  {
                    step: "02",
                    title: "Government Fee & Stamp Duty Audit",
                    desc: "Transparent calculation of MCA, state stamp duties, and name approval fees with zero hidden charges.",
                  },
                  {
                    step: "03",
                    title: "Statutory Compliance Roadmap",
                    desc: "Step-by-step timeline for DIN/DSC, INC-20A, GST, MSME, and bank account setup.",
                  },
                  {
                    step: "04",
                    title: "Legal Agreements & IP Protection",
                    desc: "Review founder vesting, shareholder agreements, and trademark class scrutiny.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 text-xs">
                    <span className="font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-md shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <strong className="text-[var(--text-primary)] block">{item.title}</strong>
                      <span className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Senior Advisor Profile Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-surface-alt)] to-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[#4F46E5] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                DB
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)]">D. Bhushan</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">Principal Legal Architect & Corporate Advisor</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 pt-0.5">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span className="text-[var(--text-tertiary)] ml-1 font-semibold">4.9 / 5 (50+ Founders)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
