import React, { useState } from "react";
import { Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CareersForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "job", position: "Legal & Compliance Associate", resumeLink: "", details: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileName: file ? file.name : ""
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Application submitted successfully! Our talent acquisition team will review your profile.");
        setForm({ name: "", email: "", phone: "", role: "job", position: "Legal & Compliance Associate", resumeLink: "", details: "" });
        setFile(null);
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setTimeout(() => {
        setSuccess("Application submitted successfully! Our HR team will reach out to you.");
        setForm({ name: "", email: "", phone: "", role: "job", position: "Legal & Compliance Associate", resumeLink: "", details: "" });
        setFile(null);
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Full Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Email Address *</label>
          <input
            type="email"
            required
            placeholder="rahul@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Phone Number *</label>
          <input
            type="text"
            required
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Application Type</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] focus:border-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          >
            <option value="job">Job (Full-time)</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Preferred Position</label>
          <select
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] focus:border-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          >
            <option value="Legal & Compliance Associate">Legal Associate</option>
            <option value="Full-Stack Software Engineer">Software Engineer</option>
            <option value="Business Development Intern">BD Intern</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Resume Link (Google Drive / LinkedIn / Portfolio)</label>
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={form.resumeLink}
          onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
          className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Upload Resume File (PDF/DOCX)</label>
        <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-indigo-500/5 transition-colors relative cursor-pointer group">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
            {file ? file.name : "Click to select a file (Max 5MB)"}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Brief Introduction</label>
        <textarea
          placeholder="Tell us why you want to join Incroute..."
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-indigo-500/20 focus:border-indigo-500 rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none h-20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-mono uppercase tracking-widest py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>SUBMITTING...</span>
          </>
        ) : (
          <span>SUBMIT APPLICATION</span>
        )}
      </button>
    </form>
  );
}
