import React from "react";
import { motion } from "motion/react";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Mail,
  Phone,
  Scale,
  Shield,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
} from "lucide-react";
import { useLang } from "../lib/LanguageContext";

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  const { t } = useLang();

  const stats = [
    { value: "20+", label: t("about_stats_clients") as string, icon: Users },
    { value: "Fortune 500", label: t("about_stats_years") as string, icon: Briefcase },
    { value: "25+", label: t("about_stats_filings") as string, icon: BookOpen },
    { value: "4.9★", label: t("about_stats_rating") as string, icon: Star },
  ];

  const expertise = t("about_expertise") as string[];
  const credentials = t("about_credentials") as string[];

  const timeline = [
    {
      year: "2025",
      title: "Bar Council Enrollment",
      desc: "Enrolled as an Advocate with the Bar Council of India. Commenced practice in corporate, commercial, and startup law.",
    },
    {
      year: "2025",
      title: "Trained Under Fortune 500 CA",
      desc: "Worked under a Chartered Accountant with Fortune 500 audit and business consulting experience, gaining deep exposure to corporate compliance, financial audits, and strategic advisory at scale.",
    },
    {
      year: "2025",
      title: "Startup India Facilitator",
      desc: "Recognized as an official Startup India Facilitator, enabling founders to access DPIIT recognition, tax exemptions, and government scheme benefits.",
    },
    {
      year: "2026",
      title: "Founded Incroute",
      desc: "Launched Incroute — a legal-tech platform to make corporate registration and compliance accessible, transparent, and affordable for every Indian entrepreneur.",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/30 uppercase tracking-widest font-mono shadow-md shadow-brand-gold/5">
          <Sparkles className="w-3.5 h-3.5" />
          {t("about_badge") as string}
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          {t("about_title") as string}{" "}
          <span className="text-brand-gold italic font-normal">
            {t("about_title_accent") as string}
          </span>
        </h1>
        <p className="text-sm text-brand-text-muted font-sans leading-relaxed max-w-xl mx-auto">
          {t("about_subtitle") as string}
        </p>
      </motion.div>

      {/* Profile Card + Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
        {/* Left: Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Avatar Card */}
          <div className="bg-brand-bg-lighter border border-brand-gold/25 rounded-2xl p-8 text-center space-y-5 premium-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />

            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full border-2 border-brand-gold/40 bg-brand-gold/10 flex items-center justify-center mx-auto overflow-hidden shadow-xl shadow-brand-gold/10">
                <Scale className="w-12 h-12 text-brand-gold" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center border-2 border-brand-bg shadow-md">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h2 className="text-xl font-semibold text-brand-text serif">
                {t("about_name") as string}
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                {t("about_designation") as string}
              </p>
            </div>

            {/* Contact Pills */}
            <div className="space-y-2.5 relative z-10 pt-2 border-t border-brand-border">
              <a
                href="tel:+918707552183"
                className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-gold transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-black transition-colors">
                  <Phone className="w-3 h-3" />
                </div>
                +91 8707552183
              </a>
              <a
                href="mailto:advocate.dev.bhushan@gmail.com"
                className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-gold transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-black transition-colors">
                  <Mail className="w-3 h-3" />
                </div>
                advocate.dev.bhushan@gmail.com
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
                transition={{ duration: 0.35, delay: 0.15 + idx * 0.07 }}
                className="bg-brand-bg-lighter border border-brand-border rounded-xl p-4 text-center space-y-1 hover:border-brand-gold/30 transition-colors"
              >
                <stat.icon className="w-4 h-4 text-brand-gold mx-auto" />
                <div className="text-lg font-bold text-brand-text serif">{stat.value}</div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-brand-text-muted">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Bio + Expertise + Credentials */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-8 space-y-8"
        >
          {/* Bio */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 space-y-5 premium-card">
            <div className="flex items-center gap-3 border-b border-brand-border pb-4">
              <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-light text-brand-text serif">Professional Background</h3>
            </div>
            <div className="space-y-4">
              {[
                t("about_bio_1") as string,
                t("about_bio_2") as string,
                t("about_bio_3") as string,
              ].map((para, i) => (
                <p key={i} className="text-sm text-brand-text-muted font-sans leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Expertise + Credentials side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Expertise */}
            <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <Shield className="w-4 h-4 text-brand-gold" />
                <h4 className="text-sm font-semibold text-brand-text serif">
                  {t("about_expertise_title") as string}
                </h4>
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
            <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <GraduationCap className="w-4 h-4 text-brand-gold" />
                <h4 className="text-sm font-semibold text-brand-text serif">
                  {t("about_credentials_title") as string}
                </h4>
              </div>
              <ul className="space-y-3">
                {credentials.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-brand-text-muted font-sans">
                    <Award className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Career Timeline */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
            <TrendingUp className="w-3 h-3" /> Career Journey
          </div>
          <h3 className="text-2xl font-light text-brand-text serif">The Journey Behind Incroute</h3>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] sm:left-1/2 top-0 bottom-0 w-[2px] bg-brand-border -translate-x-1/2" />

          <div className="space-y-8">
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`relative flex items-start gap-6 ${
                  idx % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Node dot */}
                <div className="absolute left-[10px] sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-gold border-2 border-brand-bg shadow-md shadow-brand-gold/20 z-10 mt-1" />

                {/* Content card */}
                <div
                  className={`ml-10 sm:ml-0 sm:w-[calc(50%-2rem)] bg-brand-bg-lighter border border-brand-border rounded-xl p-5 space-y-2 hover:border-brand-gold/30 transition-colors ${
                    idx % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded uppercase tracking-widest">
                      {item.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-text">{item.title}</h4>
                  <p className="text-xs text-brand-text-muted font-sans leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="max-w-4xl mx-auto premium-hero-card border rounded-2xl p-10 text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <Building2 className="w-10 h-10 text-brand-gold mx-auto" />
          <h3 className="text-2xl font-light text-white serif">
            Ready to Register Your Business?
          </h3>
          <p className="text-sm text-slate-300 font-sans max-w-md mx-auto leading-relaxed">
            Let Advocate Dev Bhushan and the Incroute team handle your incorporation end-to-end — from name approval to COI issuance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab("services")}
              className="px-6 py-3 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center gap-2"
            >
              {t("about_cta") as string} <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className="px-6 py-3 border border-slate-500 hover:border-brand-gold text-white hover:text-brand-gold font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 fast-transition cursor-pointer bg-transparent"
            >
              {t("about_contact_cta") as string}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
