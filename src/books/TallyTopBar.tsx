import React, { useState } from "react";
import { Search, X, Monitor, ChevronDown, Check } from "lucide-react";
import type { BooksOrganisation } from "./types";

interface IncrouteTopBarProps {
  organisation: BooksOrganisation;
  organisations: BooksOrganisation[];
  onOrganisation: (id: string) => void;
  breadcrumb: string;
  onBreadcrumbClose?: () => void;
  onOpenGoTo: () => void;
  layoutMode: "tally" | "modern";
  onToggleLayoutMode: () => void;
  onExit: () => void;
  onNavigate: (route: string) => void;
}

export default function TallyTopBar({
  organisation,
  organisations,
  onOrganisation,
  breadcrumb,
  onBreadcrumbClose,
  onOpenGoTo,
  layoutMode,
  onToggleLayoutMode,
  onExit,
  onNavigate,
}: IncrouteTopBarProps) {
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  return (
    <div className="tally-header-wrapper">
      {/* ─── Level 1: Signature INCroute Navy Header ─── */}
      <header className="tally-top-header">
        {/* Brand */}
        <div className="tally-brand" onClick={() => onNavigate("dashboard")}>
          <div className="tally-brand-icon">
            <img src="/incroute_logo.png" alt="INCroute" />
          </div>
          <div className="tally-logo-text">
            <span className="tally-brand-main">
              INC<span className="tally-brand-highlight">route</span> Books
            </span>
            <span className="tally-brand-badge">PRIME GOLD</span>
          </div>
        </div>

        {/* Manage & Actions Bar */}
        <nav className="tally-manage-strip" aria-label="INCroute Books Manage Strip">
          <span className="tally-label-manage">MANAGE</span>

          {/* K: Company */}
          <div className="tally-dropdown-wrapper">
            <button
              className="tally-nav-btn"
              onClick={() => setShowCompanyMenu((v) => !v)}
              title="Select Company (F3 / Alt+K)"
            >
              <u>K</u>: Company <ChevronDown size={11} style={{ marginLeft: 2 }} />
            </button>
            {showCompanyMenu && (
              <div className="tally-menu-dropdown">
                <div className="tally-dropdown-title">Select Active Entity</div>
                {organisations.map((org) => (
                  <button
                    key={org.id}
                    className={`tally-dropdown-item ${org.id === organisation.id ? "is-selected" : ""}`}
                    onClick={() => {
                      onOrganisation(org.id);
                      setShowCompanyMenu(false);
                    }}
                  >
                    <span>{org.tradeName || org.legalName}</span>
                    {org.id === organisation.id && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Y: Data */}
          <button className="tally-nav-btn" onClick={() => onNavigate("documents")} title="Data & Document Registry (Alt+Y)">
            <u>Y</u>: Data
          </button>

          {/* Z: Exchange */}
          <button className="tally-nav-btn" onClick={() => onNavigate("gst")} title="GST Exchange & Returns (Alt+Z)">
            <u>Z</u>: Exchange
          </button>

          {/* G: Go To Search box */}
          <button className="tally-goto-box" onClick={onOpenGoTo} title="Go To (Alt+G or Ctrl+K)">
            <Search size={13} className="tally-goto-search-icon" />
            <span className="tally-goto-text"><u>G</u>: Go To</span>
            <kbd className="tally-goto-kbd">⌥G</kbd>
          </button>

          {/* O: Import */}
          <button className="tally-nav-btn" onClick={() => onNavigate("banking")} title="Import Statements (Alt+O)">
            <u>O</u>: Import
          </button>

          {/* E: Export */}
          <button className="tally-nav-btn" onClick={() => onNavigate("reports")} title="Export Reports & Ledgers (Alt+E)">
            <u>E</u>: Export
          </button>

          {/* M: E-mail */}
          <button className="tally-nav-btn" onClick={() => onNavigate("invoices")} title="Send Invoices (Alt+M)">
            <u>M</u>: E-mail
          </button>

          {/* P: Print */}
          <button className="tally-nav-btn" onClick={() => onNavigate("invoices")} title="Print Invoices & Vouchers (Alt+P)">
            <u>P</u>: Print
          </button>

          {/* F1: Help */}
          <button
            className="tally-nav-btn"
            onClick={() => window.open("/knowledge-hub/", "_blank")}
            title="Help & Knowledge Hub (F1)"
          >
            <u>F1</u>: Help <span className="tally-help-dot" />
          </button>
        </nav>

        {/* Right Header Controls */}
        <div className="tally-top-controls">
          {/* Mode Switcher Button */}
          <button
            className="tally-mode-toggle"
            onClick={onToggleLayoutMode}
            title={layoutMode === "tally" ? "Switch to Modern SaaS Cloud layout" : "Switch to Gateway layout"}
          >
            <Monitor size={12} />
            <span>{layoutMode === "tally" ? "Modern SaaS View" : "Gateway View"}</span>
          </button>

          {/* Portal Exit */}
          <button
            className="tally-close-window"
            onClick={onExit}
            title="Exit to INCroute Portal"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ─── Level 2: INCroute Slate-Ribbon Strip ─── */}
      <div className="tally-sub-ribbon">
        <div className="tally-sub-breadcrumb">
          <span className="tally-sub-title">{breadcrumb}</span>
        </div>
        {onBreadcrumbClose && (
          <button className="tally-sub-close" onClick={onBreadcrumbClose} title="Back to Gateway (Esc)">
            <X size={13} style={{ marginRight: 4 }} />
            <span>Esc: Gateway</span>
          </button>
        )}
      </div>
    </div>
  );
}
