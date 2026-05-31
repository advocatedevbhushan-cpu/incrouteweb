import React, { useState, useEffect } from "react";
import { Loader2, Settings, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { googleSignIn } from "../lib/firebase";
import { createGoogleForm } from "../lib/forms";

interface ContactFormWidgetProps {
  initialMessage?: string;
}

export default function ContactFormWidget({ initialMessage = "" }: ContactFormWidgetProps) {
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: initialMessage });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string>("");
  const [contactError, setContactError] = useState<string>("");
  
  // Google Form Integration State
  const [formUri, setFormUri] = useState<string | null>(null);
  const [isSettingUpForm, setIsSettingUpForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setContactForm(prev => ({ ...prev, message: initialMessage }));
    }
  }, [initialMessage]);

  useEffect(() => {
    setIsAdmin(window.location.search.includes("admin=true"));
    async function fetchFormUri() {
      try {
        const res = await fetch("/api/config/contact-form");
        const data = await res.json();
        if (data.uri) {
          setFormUri(data.uri);
        }
      } catch (err) {}
    }
    fetchFormUri();
  }, []);

  const handleSetupGoogleForm = async () => {
    setIsSettingUpForm(true);
    setContactError("");
    try {
      await googleSignIn();
      const uri = await createGoogleForm();
      setFormUri(uri);
      await fetch("/api/config/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri })
      });
    } catch (err: any) {
      setContactError("Form connection failed: " + err.message);
    } finally {
      setIsSettingUpForm(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError("Please fill all required fields.");
      return;
    }
    
    setContactError("");
    setContactSuccess("");
    setIsSubmittingContact(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();
      if (data.success) {
        setContactSuccess("We have received your message. A representative will contact you shortly.");
        setContactForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setContactError(data.error || "Failed to send message. Please retry.");
      }
    } catch (err) {
      setContactError("Network failure. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4 premium-card p-6 bg-brand-bg-lighter border border-brand-border rounded-2xl"
    >
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between pb-3 border-b border-brand-border"
        >
          {formUri ? (
            <div className="text-[9px] uppercase font-mono tracking-widest flex items-center gap-1.5 text-emerald-500 font-semibold ml-auto bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-1 rounded-full">
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              />
              Linked with Google Sheets
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSetupGoogleForm}
              disabled={isSettingUpForm}
              className="text-[9px] uppercase font-mono tracking-widest flex items-center gap-1.5 text-slate-400 hover:text-brand-gold transition-colors ml-auto"
            >
              {isSettingUpForm ? <Loader2 className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
              Admin: Connect Google Forms
            </button>
          )}
        </motion.div>
      )}

      <form onSubmit={handleContactSubmit} className="space-y-5">
        <AnimatePresence>
          {contactError && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold"
            >
              {contactError}
            </motion.div>
          )}
          {contactSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-brand-dark border border-brand-gold/30 rounded-xl text-brand-gold text-xs font-semibold flex items-center gap-3"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {contactSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Full Name *</label>
          <motion.input
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            type="text"
            required
            placeholder="e.g. John Doe"
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none fast-transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-1.5"
          >
            <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Email Address *</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none fast-transition"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-1.5"
          >
            <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Phone Number (Optional)</label>
            <input
              type="text"
              placeholder="+91 9876543210"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none"
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-1.5"
        >
          <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Your Message *</label>
          <textarea
            required
            placeholder="Tell us about your requirements..."
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none h-32 resize-none fast-transition"
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -15px rgba(197,168,128,0.2)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmittingContact}
          className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-xs px-6 py-3 rounded transition-all duration-150 fast-transition snappy-press xl:w-max xl:px-8 mt-4"
        >
          {isSubmittingContact ? "SENDING..." : "Send Message"}
        </motion.button>
      </form>
    </motion.div>
  );
}
