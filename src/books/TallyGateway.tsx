import React, { useState, useEffect, useCallback } from "react";
import type { BooksOrganisation } from "./types";
import { booksApi } from "./api";

interface MenuItem {
  id: string;
  label: string;
  hotkey: string;
  hotkeyIndex: number;
  section: string;
  action: () => void;
}

interface IncrouteGatewayProps {
  organisation: BooksOrganisation;
  organisations: BooksOrganisation[];
  onNavigate: (route: string) => void;
  onOrganisation: (id: string) => void;
  onExit: () => void;
}

export default function TallyGateway({
  organisation,
  organisations,
  onNavigate,
  onOrganisation,
  onExit,
}: IncrouteGatewayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastVoucherDate, setLastVoucherDate] = useState<string>("No Vouchers Entered");
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalIndex, setCreateModalIndex] = useState(0);

  // Current statutory fiscal year period string (e.g., 1-Apr-25 to 31-Mar-26)
  const getPeriodString = () => {
    const today = new Date();
    const currentYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    const nextYear = currentYear + 1;
    const y1 = String(currentYear).slice(-2);
    const y2 = String(nextYear).slice(-2);
    return `1-Apr-${y1} to 31-Mar-${y2}`;
  };

  // Indian business date format
  const getDateString = () => {
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[today.getDay()]}, ${today.getDate()}-${months[today.getMonth()]}-${today.getFullYear()}`;
  };

  // Fetch latest voucher entry date
  useEffect(() => {
    let isMounted = true;
    booksApi<{ invoices?: Array<{ invoiceDate: string }> }>(`/invoices?organisationId=${encodeURIComponent(organisation.id)}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.invoices && res.invoices.length > 0) {
          const sorted = [...res.invoices].sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
          const latest = new Date(sorted[0].invoiceDate);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          setLastVoucherDate(`${latest.getDate()}-${months[latest.getMonth()]}-${latest.getFullYear()}`);
        } else {
          setLastVoucherDate("No Vouchers Entered");
        }
      })
      .catch(() => {
        if (isMounted) setLastVoucherDate("No Vouchers Entered");
      });
    return () => {
      isMounted = false;
    };
  }, [organisation.id]);

  // Main menu items definitions
  const menuItems: MenuItem[] = [
    // MASTERS
    {
      id: "create",
      label: "Create",
      hotkey: "C",
      hotkeyIndex: 0,
      section: "MASTERS",
      action: () => setShowCreateModal(true),
    },
    {
      id: "alter",
      label: "Alter",
      hotkey: "A",
      hotkeyIndex: 0,
      section: "MASTERS",
      action: () => onNavigate("settings"),
    },
    {
      id: "chart",
      label: "CHart of Accounts",
      hotkey: "H",
      hotkeyIndex: 1,
      section: "MASTERS",
      action: () => onNavigate("reports?tab=ledger"),
    },

    // TRANSACTIONS
    {
      id: "vouchers",
      label: "Vouchers",
      hotkey: "V",
      hotkeyIndex: 0,
      section: "TRANSACTIONS",
      action: () => onNavigate("invoices"),
    },
    {
      id: "daybook",
      label: "Day BooK",
      hotkey: "K",
      hotkeyIndex: 7,
      section: "TRANSACTIONS",
      action: () => onNavigate("reports?tab=ledger"),
    },

    // UTILITIES
    {
      id: "banking",
      label: "BaNking",
      hotkey: "N",
      hotkeyIndex: 2,
      section: "UTILITIES",
      action: () => onNavigate("banking"),
    },

    // REPORTS
    {
      id: "balance-sheet",
      label: "Balance Sheet",
      hotkey: "B",
      hotkeyIndex: 0,
      section: "REPORTS",
      action: () => onNavigate("reports?tab=balance"),
    },
    {
      id: "pnl",
      label: "Profit & Loss A/c",
      hotkey: "P",
      hotkeyIndex: 0,
      section: "REPORTS",
      action: () => onNavigate("reports?tab=profit"),
    },
    {
      id: "stock",
      label: "Stock Summary",
      hotkey: "S",
      hotkeyIndex: 0,
      section: "REPORTS",
      action: () => onNavigate("items"),
    },
    {
      id: "ratio",
      label: "Ratio Analysis & GST",
      hotkey: "R",
      hotkeyIndex: 0,
      section: "REPORTS",
      action: () => onNavigate("gst"),
    },
    {
      id: "display",
      label: "Display More Reports",
      hotkey: "D",
      hotkeyIndex: 0,
      section: "REPORTS",
      action: () => onNavigate("reports"),
    },

    // QUIT
    {
      id: "quit",
      label: "Quit",
      hotkey: "Q",
      hotkeyIndex: 0,
      section: "QUIT",
      action: () => setShowQuitModal(true),
    },
  ];

  // Submenu for "Create" master
  const createSubMenuItems = [
    { label: "Ledger (Customer / Vendor)", hotkey: "L", action: () => { setShowCreateModal(false); onNavigate("customers"); } },
    { label: "Stock Item (Product / Service)", hotkey: "I", action: () => { setShowCreateModal(false); onNavigate("items"); } },
    { label: "Voucher (Invoice / Bill Entry)", hotkey: "V", action: () => { setShowCreateModal(false); onNavigate("invoices"); } },
    { label: "Bank & Cash Account", hotkey: "B", action: () => { setShowCreateModal(false); onNavigate("banking"); } },
    { label: "Company / GST Registration", hotkey: "C", action: () => { setShowCreateModal(false); onNavigate("settings"); } },
  ];

  // Keyboard navigation handler (Arrows, Enter, Esc, and Hotkeys)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      // Handle Quit Dialog
      if (showQuitModal) {
        if (e.key.toLowerCase() === "y" || e.key === "Enter") {
          e.preventDefault();
          onExit();
        } else if (e.key.toLowerCase() === "n" || e.key === "Escape") {
          e.preventDefault();
          setShowQuitModal(false);
        }
        return;
      }

      // Handle Company Selection Modal
      if (showCompanyModal) {
        if (e.key === "Escape") {
          setShowCompanyModal(false);
        }
        return;
      }

      // Handle Create Modal
      if (showCreateModal) {
        if (e.key === "Escape") {
          setShowCreateModal(false);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCreateModalIndex((prev) => (prev + 1) % createSubMenuItems.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCreateModalIndex((prev) => (prev - 1 + createSubMenuItems.length) % createSubMenuItems.length);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          createSubMenuItems[createModalIndex].action();
          return;
        }
        const hit = createSubMenuItems.find((item) => item.hotkey.toLowerCase() === e.key.toLowerCase());
        if (hit) {
          e.preventDefault();
          hit.action();
          return;
        }
        return;
      }

      // Handle Function Keys
      if (e.key === "F2") {
        e.preventDefault();
        onNavigate("reports?tab=periods");
        return;
      }
      if (e.key === "F3") {
        e.preventDefault();
        setShowCompanyModal(true);
        return;
      }
      if (e.key === "F8") {
        e.preventDefault();
        onNavigate("invoices");
        return;
      }
      if (e.key === "F9") {
        e.preventDefault();
        onNavigate("bills");
        return;
      }

      // Arrow navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        menuItems[selectedIndex].action();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowQuitModal(true);
        return;
      }

      // Single-character hotkeys
      const key = e.key.toUpperCase();
      const match = menuItems.find((item) => item.hotkey.toUpperCase() === key);
      if (match) {
        e.preventDefault();
        match.action();
      }
    },
    [menuItems, selectedIndex, showQuitModal, showCompanyModal, showCreateModal, createModalIndex, onExit, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Helper to render text with highlighted hotkey character in INCroute violet
  const renderHotkeyLabel = (item: MenuItem) => {
    const chars = item.label.split("");
    return (
      <span>
        {chars.map((char, i) => (
          <span
            key={i}
            className={i === item.hotkeyIndex ? "tally-hotkey-char" : "tally-normal-char"}
          >
            {char}
          </span>
        ))}
      </span>
    );
  };

  const sections = ["MASTERS", "TRANSACTIONS", "UTILITIES", "REPORTS", "QUIT"];

  return (
    <div className="tally-gateway-screen">
      {/* ─── Main Content Canvas ─── */}
      <div className="tally-canvas">
        {/* Left Status Area */}
        <div className="tally-left-panel">
          {/* Top Period & Date */}
          <div className="tally-period-grid">
            <div className="tally-period-col">
              <span className="tally-stat-label">CURRENT PERIOD</span>
              <strong className="tally-stat-val">{getPeriodString()}</strong>
            </div>
            <div className="tally-period-col tally-date-col">
              <span className="tally-stat-label">CURRENT DATE</span>
              <strong className="tally-stat-val">{getDateString()}</strong>
            </div>
          </div>

          <div className="tally-divider" />

          {/* Table: Name of Company vs Date of Last Entry */}
          <div className="tally-company-table">
            <div className="tally-table-header">
              <span className="tally-col-comp">NAME OF COMPANY</span>
              <span className="tally-col-entry">DATE OF LAST ENTRY</span>
            </div>
            <div className="tally-table-row">
              <span className="tally-comp-name">
                {organisation.tradeName || organisation.legalName}
              </span>
              <span className="tally-last-entry">{lastVoucherDate}</span>
            </div>
          </div>
        </div>

        {/* Center / Right Floating "Gateway of INCroute" Menu Box */}
        <div className="tally-center-panel">
          <div className="tally-menu-card">
            {/* Card Signature Navy Header */}
            <div className="tally-card-header">
              <span>Gateway of INCroute</span>
            </div>

            {/* Menu List */}
            <div className="tally-card-body">
              {sections.map((sec) => {
                const itemsInSec = menuItems.filter((m) => m.section === sec);
                if (itemsInSec.length === 0) return null;

                return (
                  <div key={sec} className="tally-menu-section">
                    {sec !== "QUIT" && <div className="tally-section-label">{sec}</div>}
                    <div className="tally-section-items">
                      {itemsInSec.map((item) => {
                        const globalIndex = menuItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            className={`tally-menu-row ${isSelected ? "is-active" : ""}`}
                            onClick={() => {
                              setSelectedIndex(globalIndex);
                              item.action();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className="tally-menu-text">{renderHotkeyLabel(item)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Action Dock (Function Keys) ─── */}
      <aside className="tally-function-dock">
        <button className="tally-dock-btn" onClick={() => onNavigate("reports?tab=periods")} title="Date (F2)">
          <span>F2: Date</span>
        </button>
        <button className="tally-dock-btn" onClick={() => setShowCompanyModal(true)} title="Company (F3)">
          <span>F3: Company</span>
        </button>
        <button className="tally-dock-btn" onClick={() => onNavigate("banking")} title="Contra (F4)">
          <span>F4: Contra</span>
        </button>
        <button className="tally-dock-btn" onClick={() => onNavigate("bills")} title="Payment (F5)">
          <span>F5: Payment</span>
        </button>
        <button className="tally-dock-btn" onClick={() => onNavigate("invoices")} title="Receipt (F6)">
          <span>F6: Receipt</span>
        </button>
        <button className="tally-dock-btn" onClick={() => onNavigate("reports?tab=ledger")} title="Journal (F7)">
          <span>F7: Journal</span>
        </button>
        <button className="tally-dock-btn is-highlight" onClick={() => onNavigate("invoices")} title="Sales (F8)">
          <span>F8: Sales</span>
        </button>
        <button className="tally-dock-btn is-highlight" onClick={() => onNavigate("bills")} title="Purchase (F9)">
          <span>F9: Purchase</span>
        </button>
        <button className="tally-dock-btn" onClick={() => onNavigate("gst")} title="Other Vouchers (F10)">
          <span>F10: Other Vouchers</span>
        </button>
      </aside>

      {/* ─── Classic "Quit? Yes or No" Modal ─── */}
      {showQuitModal && (
        <div className="tally-modal-backdrop" onClick={() => setShowQuitModal(false)}>
          <div className="tally-prompt-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-prompt-header">Quit</div>
            <div className="tally-prompt-body">
              <p>Quit INCroute Books?</p>
              <div className="tally-prompt-actions">
                <button
                  className="tally-prompt-btn is-primary"
                  onClick={onExit}
                  autoFocus
                >
                  <u>Y</u>es
                </button>
                <button
                  className="tally-prompt-btn"
                  onClick={() => setShowQuitModal(false)}
                >
                  <u>N</u>o
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Master Submodal ─── */}
      {showCreateModal && (
        <div className="tally-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="tally-menu-card tally-submodal" onClick={(e) => e.stopPropagation()}>
            <div className="tally-card-header">
              <span>Master Creation</span>
            </div>
            <div className="tally-card-body">
              <div className="tally-section-label">ACCOUNTING & INVENTORY MASTERS</div>
              <div className="tally-section-items">
                {createSubMenuItems.map((item, idx) => {
                  const isSelected = idx === createModalIndex;
                  return (
                    <div
                      key={item.label}
                      className={`tally-menu-row ${isSelected ? "is-active" : ""}`}
                      onClick={item.action}
                      onMouseEnter={() => setCreateModalIndex(idx)}
                    >
                      <div className="tally-menu-text">
                        <u>{item.hotkey}</u>: {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <button className="tally-prompt-btn" onClick={() => setShowCreateModal(false)}>
                  Esc: Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Company Selector Modal (F3) ─── */}
      {showCompanyModal && (
        <div className="tally-modal-backdrop" onClick={() => setShowCompanyModal(false)}>
          <div className="tally-menu-card tally-submodal" onClick={(e) => e.stopPropagation()}>
            <div className="tally-card-header">
              <span>Select Active Entity</span>
            </div>
            <div className="tally-card-body">
              <div className="tally-section-label">REGISTERED ENTITIES & FIRMS</div>
              <div className="tally-section-items">
                {organisations.map((org) => {
                  const isCurrent = org.id === organisation.id;
                  return (
                    <div
                      key={org.id}
                      className={`tally-menu-row ${isCurrent ? "is-active" : ""}`}
                      onClick={() => {
                        onOrganisation(org.id);
                        setShowCompanyModal(false);
                      }}
                    >
                      <div className="tally-menu-text">
                        <strong>{org.tradeName || org.legalName}</strong>
                        {org.gstin && <small style={{ marginLeft: 8, opacity: 0.75 }}>({org.gstin})</small>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button className="tally-prompt-btn" onClick={() => setShowCompanyModal(false)}>
                  Esc: Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
