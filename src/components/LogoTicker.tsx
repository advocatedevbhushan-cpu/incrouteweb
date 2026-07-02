import React from "react";
import { Building2, Shield, Database, Landmark, Users } from "lucide-react";

/**
 * Regulatory Ecosystem Strip
 * Shows alignment with India's public compliance infrastructure.
 * No private company logos — only official government/regulatory systems.
 */
export default function LogoTicker() {
  const regulators = [
    { icon: Building2, name: "Ministry of Corporate Affairs", short: "MCA" },
    { icon: Database, name: "GST Network", short: "GSTN" },
    { icon: Landmark, name: "Income Tax Department", short: "IT Dept." },
    { icon: Users, name: "Employees' Provident Fund", short: "EPFO" },
    { icon: Shield, name: "Employees' State Insurance", short: "ESIC" },
  ];

  return (
    <div className="w-full py-6 space-y-4">
      {/* Title */}
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-700 font-bold font-sans">
          Aligned with India's Regulatory Ecosystem
        </p>
      </div>

      {/* Regulatory icons strip */}
      <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap px-4">
        {regulators.map((r, i) => (
          <React.Fragment key={i}>
            <div
              className="flex items-center gap-2 opacity-65 hover:opacity-100 transition-opacity duration-200 group cursor-default"
              title={r.name}
            >
              <r.icon className="w-4 h-4 text-slate-700 group-hover:text-[var(--accent)]" />
              <span className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase">
                {r.short === "GSTN" ? "GSTIN" : r.short}
              </span>
            </div>
            {i < regulators.length - 1 && (
              <span className="text-slate-300 hidden sm:inline select-none">|</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Trust text */}
      <p className="text-center text-[11px] text-[var(--text-tertiary)] opacity-75">
        Supporting 10,000+ filings across India
      </p>
    </div>
  );
}
