import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Gift, CheckCircle2, ArrowRight, ShieldCheck, Download } from "lucide-react";
import jsPDF from "jspdf";

interface WelcomeOfferModalProps {
  onServiceSelect?: (serviceId: string) => void;
}

export default function WelcomeOfferModal({ onServiceSelect }: WelcomeOfferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [entityType, setEntityType] = useState("pvt-ltd");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("incroute_welcome_popup_dismissed");
    if (isDismissed) return;

    // Show popup after 6.5 seconds of initial visit
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 6500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("incroute_welcome_popup_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setLoading(true);

    try {
      // Post lead to backend
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Founder",
          phone,
          entityType,
          source: "Welcome Modal Free CA Consultation",
        }),
      }).catch(() => {});
    } catch {
      // Fallback grace
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleDownloadBlueprint = () => {
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const navy: [number, number, number] = [15, 23, 42];
      const indigo: [number, number, number] = [99, 102, 241];

      // Header Banner
      doc.setFillColor(...navy);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("INCroute Startup Legal Blueprint 2026", 16, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("VERIFIED STATUTORY CHECKLIST & FREE CA CONSULTATION BRIEF", 16, 23);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...indigo);
      doc.text("FREE 1-ON-1 CA SESSION INCLUDED", 194, 18, { align: "right" });

      // Body
      doc.setTextColor(...navy);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("1. Essential Pre-Incorporation Checklist", 16, 48);

      const steps = [
        "1. Director Identification Number (DIN) & Class-3 Digital Signature Token",
        "2. Unique Name Reservation under Ministry of Corporate Affairs (RUN / SPICe+ Part A)",
        "3. Drafting of Customized Memorandum & Articles of Association (MOA / AOA)",
        "4. Registered Office Proof: Electricity bill (< 2 months) & Landlord NOC",
        "5. Form SPICe+ Part B Integrated Application for PAN, TAN, EPFO, ESIC & Professional Tax",
      ];

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      let y = 56;
      for (const step of steps) {
        doc.text(step, 18, y);
        y += 8;
      }

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. 30-Day Mandatory Post-Incorporation Milestones", 16, y);

      const postSteps = [
        "• Day 30: Appointment of First Statutory Auditor (Form ADT-1)",
        "• Day 60: Issue of Share Certificates & Payment of Stamp Duty to State Treasury",
        "• Day 180: Mandatory Declaration of Commencement of Business (Form INC-20A)",
        "• Annual: Director DIN e-KYC (DIR-3 KYC) & Financial Audit (AOC-4 / MGT-7)",
      ];

      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      for (const step of postSteps) {
        doc.text(step, 18, y);
        y += 8;
      }

      // Consultation Box
      y += 10;
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(14, y, 182, 30, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...indigo);
      doc.text("YOUR FREE 1-ON-1 CA STRATEGY SESSION", 18, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...navy);
      doc.text("Our Senior Chartered Accountant will review your business model, tax brackets, and compliance roadmap.", 18, y + 15);
      doc.text("Helpline / WhatsApp Desk: +91 87075 52183 · Priority Booking Confirmed.", 18, y + 21);

      // Footer
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 285, 210, 12, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("INCroute Corporate Technologies · www.incroute.com · support@incroute.com", 105, 292, { align: "center" });

      doc.save("INCroute_Startup_Legal_Blueprint_2026.pdf");
    } catch (err) {
      console.error("Failed to export PDF blueprint:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 shadow-2xl overflow-hidden text-left z-10 font-sans"
          >
            {/* Top Accent Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                      <Sparkles className="w-3.5 h-3.5" /> Founder Privilege · Free 15-Min CA Call
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Book Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300">Free CA Strategy Call</span> + Legal Blueprint
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Connect 1-on-1 with a Senior Chartered Accountant for customized entity structure advisory, startup tax optimization, and download the 2026 Legal Blueprint (PDF).
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Founder Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          WhatsApp / Mobile <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Structure of Interest
                        </label>
                        <select
                          value={entityType}
                          onChange={(e) => setEntityType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 transition-all cursor-pointer"
                        >
                          <option value="pvt-ltd">Private Limited Company</option>
                          <option value="llp">Limited Liability Partnership (LLP)</option>
                          <option value="opc">One Person Company (OPC)</option>
                          <option value="trademark-registration">Trademark Registration</option>
                          <option value="section8">Section 8 NGO / Non-Profit</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer border-none transition-all"
                    >
                      <span>{loading ? "Confirming Session…" : "Book Free Consultation & Get Blueprint (PDF)"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Trust Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Free · No Obligation
                    </span>
                    <span>15-Min 1-on-1 Call</span>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Consultation Confirmed!</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Our Senior Chartered Accountant will call/message you on WhatsApp shortly for your free 15-min strategy session.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-950/60 border border-indigo-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Direct Support Helpline</span>
                    <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                      +91 87075 52183
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleDownloadBlueprint}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer border-none"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Blueprint (PDF)</span>
                    </button>

                    <button
                      onClick={() => {
                        handleClose();
                        if (onServiceSelect) onServiceSelect(entityType);
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer border-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Explore Registration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
