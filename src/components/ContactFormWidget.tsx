import React, { useState, useEffect } from "react";
import { Loader2, Settings } from "lucide-react";
import { motion } from "motion/react";
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
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f22]">
          {formUri ? (
            <div className="text-[9px] uppercase font-mono tracking-widest flex items-center gap-1.5 text-emerald-500 font-semibold ml-auto bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
        </div>
      )}

      <form onSubmit={handleContactSubmit} className="space-y-5">
        {contactError && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold">
            {contactError}
          </div>
        )}
        {contactSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-brand-dark border border-brand-gold/30 rounded-xl text-brand-gold text-xs font-semibold"
          >
            {contactSuccess}
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. John Doe"
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Email Address *</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Phone Number (Optional)</label>
            <input
              type="text"
              placeholder="+91 9876543210"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold font-mono">Your Message *</label>
          <textarea
            required
            placeholder="Tell us about your requirements..."
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            className="w-full bg-brand-input-bg border border-brand-border hover:border-brand-gold/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none h-32 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmittingContact}
          className="w-full bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold font-mono uppercase tracking-widest text-xs px-6 py-3 rounded transition-all cursor-pointer font-bold duration-300 xl:w-max xl:px-8 mt-4"
        >
          {isSubmittingContact ? "SENDING..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
