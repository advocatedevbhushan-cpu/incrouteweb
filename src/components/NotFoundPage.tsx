import React from "react";
import { Search, ArrowRight, Home, Building2, FileText, HelpCircle } from "lucide-react";
import { useAppNavigate } from "../lib/useAppNavigate";

export default function NotFoundPage() {
  const navigateToTab = useAppNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 py-16 px-4">
      {/* 404 Display */}
      <div className="space-y-3">
        <h1 className="text-7xl font-bold text-brand-gold font-mono">404</h1>
        <h2 className="text-2xl font-light text-brand-text serif">Page Not Found</h2>
        <p className="text-sm text-brand-text-muted max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Try searching or visit one of our popular pages below.
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search for services, guides, or tools..."
            className="w-full bg-brand-input-bg border border-brand-border rounded-xl pl-11 pr-4 py-3 text-sm text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                navigateToTab("services");
              }
            }}
          />
        </div>
      </div>

      {/* Popular Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {[
          { icon: Building2, label: "Pvt Ltd Registration", tab: "services" },
          { icon: FileText, label: "Compliance Guide", tab: "compliance" },
          { icon: HelpCircle, label: "Knowledge Hub", tab: "faq" },
        ].map((link, idx) => (
          <button
            key={idx}
            onClick={() => navigateToTab(link.tab)}
            className="flex items-center gap-2 justify-center p-4 bg-brand-bg-lighter border border-brand-border rounded-xl text-xs font-semibold text-brand-text hover:border-brand-gold/40 hover:text-brand-gold transition-colors cursor-pointer"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </button>
        ))}
      </div>

      {/* Home link */}
      <button
        onClick={() => navigateToTab("services")}
        className="flex items-center gap-2 text-brand-gold text-xs font-mono uppercase tracking-widest hover:underline cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" /> Back to Homepage <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
