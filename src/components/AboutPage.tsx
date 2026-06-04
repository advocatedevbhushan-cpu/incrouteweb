import React from "react";
import { motion } from "motion/react";
import {
  Award, BookOpen, Briefcase, CheckCircle2, Mail, Phone, Scale,
  Shield, Star, TrendingUp, Users, ArrowRight, Sparkles, Building2,
  RefreshCw, Target, Zap, Quote, ExternalLink,
} from "lucide-react";
import { useAppNavigate } from "../lib/useAppNavigate";

interface AboutPageProps {
  setActiveTab?: (tab: string) => void; // kept for backward compat but unused
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  const navigateToTab = useAppNavigate();
  const expertise = [
    "Private Limited & LLP Incorporations",
    "ROC Annual Filings (AOC-4, MGT-7)",
    "GST Registration & Returns",
    "Startup India & MSME Certifications",
    "Trademark & IP Protection",
    "Virtual CFO & Treasury Advisory",
    "Section 8 NGO Registrations",
    "Director KYC & DIN/DSC Management",
  ];

  const stats = [
    { icon: Building2, value: "Fortune 500", label: "CA Network" },
    { icon: Sparkles, value: "20+", label: "Founders Served" },
    { icon: Shield, value: "Startup India", label: "Recognized" },
    { icon: Star, value: "4.9★", label: "Client Rating" },
  ];

  return (
    <div className="space-y-20">
      {/* ═══ HERO SECTION ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Our Story
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-brand-text tracking-tight serif">
          Meet the Expert{" "}
          <span className="text-brand-gold italic font-normal">Behind Incroute.</span>
        </h1>
        {/* Gold accent line */}
        <div className="w-20 h-[2px] bg-brand-gold mx-auto rounded-full" />
        <p className="text-sm text-brand-text-muted font-sans leading-relaxed max-w-2xl mx-auto">
          Bringing Fortune‑grade rigour, precision, and foresight to every startup that partners with Incroute.
        </p>
      </motion.div>

      {/* ═══ TWO-COLUMN BIO ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
        {/* Left: Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 space-y-5"
        >
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 text-center space-y-5 relative overflow-hidden group">
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-2xl border-2 border-brand-gold/30 bg-brand-gold/5 flex items-center justify-center mx-auto overflow-hidden shadow-xl group-hover:border-brand-gold transition-colors duration-300">
                <Scale className="w-14 h-14 text-brand-gold" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center border-2 border-brand-bg shadow-md">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-brand-text">D Bhushan</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                Founder & Principal Legal Advisor
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2.5 pt-3 border-t border-brand-border">
              <a href="tel:+918707552183" className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-gold transition-colors group/link">
                <div className="p-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold group-hover/link:bg-brand-gold group-hover/link:text-black transition-colors">
                  <Phone className="w-3 h-3" />
                </div>
                +91 8707552183
              </a>
              <a href="mailto:d.bhushan@incroute.com" className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-gold transition-colors group/link">
                <div className="p-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold group-hover/link:bg-brand-gold group-hover/link:text-black transition-colors">
                  <Mail className="w-3 h-3" />
                </div>
                d.bhushan@incroute.com
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.2 + idx * 0.07 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-xl p-4 text-center space-y-1 hover:border-brand-gold/40 transition-colors"
              >
                <stat.icon className="w-4 h-4 text-brand-gold mx-auto" />
                <div className="text-sm font-bold text-brand-text">{stat.value}</div>
                <div className="text-[8px] font-mono uppercase tracking-wider text-brand-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Narrative */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-border pb-4">
              <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-light text-brand-text serif">Professional Background</h3>
            </div>

            <div className="space-y-5 text-sm text-brand-text-muted font-sans leading-relaxed">
              <p>
                <strong className="text-brand-text">D Bhushan works shoulder‑to‑shoulder with a select network of Chartered Accountants and legal advisors who regularly audit and structure compliance for Fortune 500 enterprises.</strong> This live collaboration brings Fortune‑grade rigour, precision, and foresight to every startup that partners with Incroute.
              </p>
              <p>
                After formal legal training, D Bhushan joined a practice led by a CA whose clients include multiple Fortune 500 firms. In that environment, he gained hands‑on exposure to large‑scale corporate audits, cross‑border compliance, and strategic financial advisory. Today, he continues to consult with those same Fortune‑500‑facing professionals — ensuring that Incroute's document templates, compliance checklists, and filing strategies meet the highest institutional standards.
              </p>
              <p>
                <strong className="text-brand-gold">Mission:</strong> Incroute was founded in 2026 to democratise Fortune‑grade compliance. We believe every Indian entrepreneur deserves access to the same quality of legal architecture used by global enterprises — delivered with transparency, speed, and local expertise.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 left-4 opacity-10">
              <Quote className="w-12 h-12 text-brand-gold" />
            </div>
            <div className="relative z-10 space-y-3 pl-4 border-l-2 border-brand-gold/40">
              <p className="text-sm italic text-brand-text leading-relaxed font-serif">
                "D Bhushan's grasp of compliance detail is rare. His work reflects the depth and precision we expect from top‑tier firms handling institutional clients."
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">
                — Senior CA Partner, Fortune 500 Audit Practice
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ FORTUNE 500 COLLABORATION SECTION ═══ */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
            <TrendingUp className="w-3 h-3" /> Quality Assurance
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-brand-text serif">
            How Fortune 500 Expertise{" "}
            <span className="text-brand-gold italic font-normal">Flows to Your Startup.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: RefreshCw,
              title: "Live Advisory Loop",
              desc: "Our core team regularly exchanges notes with practicing CAs who handle Fortune 500 audits. Their insights shape our templates and checklists.",
            },
            {
              icon: Target,
              title: "Fortune‑Grade Benchmarks",
              desc: "We don't just meet ROC minimums — we apply audit‑ready documentation standards used by multinationals.",
            },
            {
              icon: Zap,
              title: "Continuous Updates",
              desc: "Every change in MCA, GST, or SEBI regulation is cross‑verified through our Fortune‑500‑connected network before being pushed to your dashboard.",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-4 hover:border-brand-gold/40 transition-all duration-200 group"
            >
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-brand-gold w-fit group-hover:bg-brand-gold group-hover:text-black transition-colors">
                <card.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-brand-text">{card.title}</h4>
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ EXPERTISE & CREDENTIALS ═══ */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expertise */}
        <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
            <Shield className="w-4 h-4 text-brand-gold" />
            <h4 className="text-sm font-bold text-brand-text">Areas of Expertise</h4>
          </div>
          <ul className="space-y-2.5">
            {expertise.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-brand-text-muted font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          {/* Card 1 */}
          <div className="bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-brand-gold" />
              <h4 className="text-sm font-bold text-brand-text">Continuous Fortune‑500 Exposure</h4>
            </div>
            <ul className="space-y-2 text-xs text-brand-text-muted font-sans">
              <li className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />Partners with senior financial officials to deliver audit and advisory services for Fortune 500 enterprises.</li>
              <li className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />Direct pipeline to updates from large‑scale corporate compliance desks</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-brand-gold" />
              <h4 className="text-sm font-bold text-brand-text">Official Recognitions</h4>
            </div>
            <ul className="space-y-2 text-xs text-brand-text-muted font-sans">
              <li className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />Bar Council of India — Enrolled Advocate (2025)</li>
              <li className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />Startup India — Recognized Facilitator</li>
              <li className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />MCA V3 Certified Filing Intermediary</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═══ TRUST BAR ═══ */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Fortune 500 Trained", sub: "CA Network Access" },
            { label: "Startup India", sub: "Recognized Facilitator" },
            { label: "20+ Founders", sub: "Successfully Served" },
            { label: "CA Backed", sub: "Every Filing Reviewed" },
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.06 }}
              className="bg-brand-bg-lighter border border-brand-border rounded-xl p-4 text-center hover:border-brand-gold/40 transition-colors"
            >
              <p className="text-xs font-bold text-brand-gold">{badge.label}</p>
              <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-wider mt-1">{badge.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ CTA BANNER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="max-w-4xl mx-auto premium-hero-card border rounded-2xl p-10 text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2B5B84]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-light text-white serif">
            Want Fortune‑Grade Compliance for Your Startup?
          </h3>
          <p className="text-sm text-slate-300 font-sans max-w-md mx-auto leading-relaxed">
            Let D Bhushan and the Incroute team apply institutional‑quality legal architecture to your incorporation — end to end.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigateToTab("contact")}
              className="px-6 py-3 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center gap-2"
            >
              Talk to D Bhushan <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigateToTab("services")}
              className="px-6 py-3 border border-slate-500 hover:border-brand-gold text-white hover:text-brand-gold font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 cursor-pointer bg-transparent"
            >
              Explore Services
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
