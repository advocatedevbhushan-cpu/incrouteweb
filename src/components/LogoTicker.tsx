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
    <div className="w-full py-5 space-y-3">
      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] font-medium">
          Aligned with India's Regulatory Ecosystem
        </p>
      </div>

      {/* Regulatory icons strip */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap px-4">
        {regulators.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-200 group cursor-default"
            title={r.name}
          >
            <r.icon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)]" />
            <span className="text-[11px] font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors hidden sm:inline">
              {r.short}
            </span>
          </div>
        ))}
      </div>

      {/* Trust text */}
      <p className="text-center text-[11px] text-[var(--text-tertiary)]">
        Supporting 10,000+ filings across India
      </p>
    </div>
  );
}
